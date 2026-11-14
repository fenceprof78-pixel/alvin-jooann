/* PREMIUM INTERACTIONS — runs after app.js has rendered the page.
   Each function below is one feature; remove its name from the last line to switch it off. */
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;      // true on desktop with a mouse
const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;       // true if the visitor wants less motion

// HERO NAMES: wraps each name in a mask so it slides up on load. Speed/stagger: `.hero h1 .w>i` in premium.css.
function heroIntro(){
  const { bride, groom } = CONFIG.couple;
  $('#heroNames').innerHTML = `<span class="w"><i style="--d:0">${bride}</i></span> <span class="w"><i class="amp" style="--d:1">&amp;</i></span> <span class="w"><i style="--d:2">${groom}</i></span>`;
}

// SCROLL REVEAL: fade-up for the elements in the selector list below.
// Add/remove CSS selectors in that list to change what animates.
function reveal(){
  const els = $$('.section-head,.detail-card,.role-card,.attire-card,.gift-card,.faq-item,.rsvp-wrap,.tl-item');
  els.forEach(e => { e.classList.add('rv'); e.style.setProperty('--i', [...e.parentElement.children].indexOf(e) % 4); });  // % 4 = stagger groups
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  els.forEach(e => io.observe(e));
}

// SCROLL EFFECTS (one throttled handler): gold progress bar, active nav link, timeline line drawing.
function scrollFx(){
  const bar = $('#progress'), tl = $('#timeline'), links = $$('.nav-links a'), secs = links.map(a => $(a.getAttribute('href')));
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    const r = tl.getBoundingClientRect();
    tl.style.setProperty('--p', Math.min(1, Math.max(0, (innerHeight * .6 - r.top) / r.height)));   // .6 = how early the line starts drawing
    let cur = -1; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .4) cur = i; });
    links.forEach((a, i) => a.classList.toggle('active', i === cur));
  };
  addEventListener('scroll', () => { if (!queued){ queued = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

// MOUSE EFFECTS (desktop only; skipped for touch + reduced-motion):
// hero leaf parallax, magnetic buttons (.18/.28 = pull strength), card tilt (4/5 = degrees).
function pointerFx(){
  if (!fine || calm) return;
  const hero = $('.hero');
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3));
    hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3));
  });
  $$('.btn').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.translate = `${(e.clientX - r.left - r.width / 2) * .18}px ${(e.clientY - r.top - r.height / 2) * .28}px`; });
    b.addEventListener('pointerleave', () => b.style.translate = '');
  });
  $$('.detail-card,.role-card,.attire-card').forEach(c => {      // <- which cards tilt
    c.addEventListener('pointerenter', () => c.style.transition = 'transform .25s ease-out, opacity .9s, box-shadow .3s');
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 5}deg)`;
    });
    c.addEventListener('pointerleave', () => { c.style.transform = ''; c.style.transition = ''; });
  });
}

// ADD-TO-CALENDAR: builds an .ics file from CONFIG.weddingDateISO and the Ceremony card (details[1]).
function calendar(){
  const f = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  // Event length: the `6` below = hours after the start time. Change it to fit your programme.
  const s = new Date(CONFIG.weddingDateISO), e = new Date(s.getTime() + 6 * 36e5);
  const loc = CONFIG.details[1].lines.join(', ').replace(/,/g, '\\,');
  const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wedding//EN','BEGIN:VEVENT',`UID:${f(s)}@wedding`,`DTSTAMP:${f(new Date())}`,`DTSTART:${f(s)}`,`DTEND:${f(e)}`,`SUMMARY:${CONFIG.couple.bride} & ${CONFIG.couple.groom}'s Wedding`,`LOCATION:${loc}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
  const wrap = document.createElement('div'); wrap.className = 'cal-wrap';
  wrap.innerHTML = '<button class="btn" type="button">Add to calendar</button>';      // <- button label
  wrap.firstChild.onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'wedding.ics'; a.click(); URL.revokeObjectURL(a.href); };
  $('#detailsGrid').after(wrap);
}

// LIGHTBOX EXTRAS: crossfade between photos + swipe left/right on phones (50 = min swipe distance in px).
function lightboxFx(){
  const lb = $('#lightbox'), img = $('#lbImg'); let x0 = null;
  const orig = window.updateLightbox;
  window.updateLightbox = () => { img.classList.add('swap'); setTimeout(() => { orig(); img.onload = () => img.classList.remove('swap'); }, 150); };
  lb.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) $(dx > 0 ? '#lbPrev' : '#lbNext').click(); x0 = null; });
}

// CONFETTI: the falling petals after an accepted RSVP. 30 = how many. Colours: `.petal` in premium.css.
function petals(host){
  for (let i = 0; i < 30; i++){
    const p = document.createElement('span'); p.className = 'petal';
    p.style.cssText = `--x:${Math.random() * 100}%;--dx:${(Math.random() - .5) * 140}px;--t:${2.4 + Math.random() * 1.8}s;--dl:${Math.random() * .8}s`;
    host.appendChild(p);
  }
  setTimeout(() => $$('.petal', host).forEach(p => p.remove()), 5000);
}

// RSVP FORM: hides guest/dietary fields on "declines", posts to /api/rsvp (Vercel -> Supabase),
// then swaps the form for a thank-you. Edit the thank-you wording in the two strings below.
function rsvp(){
  const form = $('#rsvpForm'), msg = $('#rsvpMsg'), btn = $('#rsvpSubmitBtn'), extra = $('#guestFields');
  $$('input[name=attending]', form).forEach(r => r.addEventListener('change', () => extra.classList.toggle('off', form.attending.value.startsWith('Regret'))));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    $('#rsvpMailto').href = buildMailto(data);        // keeps the "email instead" link in sync
    btn.disabled = true; btn.classList.add('busy'); btn.textContent = 'Sending'; msg.className = 'rsvp-msg';
    try {
      const r = await fetch(CONFIG.rsvpEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || '');
      const yes = !data.attending.startsWith('Regret'), wrap = $('.rsvp-wrap');
      wrap.innerHTML = '<div class="thanks"><h3></h3><p></p></div>';
      $('h3', wrap).textContent = `${yes ? 'See you there' : 'Thank you'}, ${data.name.trim().split(' ')[0]}.`;          // <- headline
      $('p', wrap).textContent = yes ? 'Your RSVP is in. We can’t wait to celebrate with you.' : 'We’ll miss you, and we’re grateful you let us know.';   // <- message
      if (yes && !calm) petals(wrap);
    } catch (err) {
      msg.textContent = `${err.message ? err.message + ' ' : ''}Your RSVP wasn’t sent. Try again, or use the email link below.`;   // <- error text
      msg.className = 'rsvp-msg show err';
      btn.disabled = false; btn.classList.remove('busy'); btn.textContent = 'Send RSVP';
    }
  });
}

// Switch features on/off here: delete a name to disable it.
document.addEventListener('DOMContentLoaded', () => { heroIntro(); reveal(); scrollFx(); pointerFx(); calendar(); lightboxFx(); rsvp(); });
})();
