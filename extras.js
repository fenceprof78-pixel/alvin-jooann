/* ==================================================================
   extras.js — opening intro, background music, well-wishes wall.
   All text/options come from CONFIG (intro, music, wishes) in config.js.
   ================================================================== */
(() => {
const $ = (s, r = document) => r.querySelector(s);

/* ---------- MUSIC ----------
   Creates the floating button + an <audio> loop. Returns the audio (or null if no src set). */
function setupMusic(){
  const m = CONFIG.music || {};
  if (!m.src) return null;                         // no song configured -> no button
  const a = new Audio(m.src);
  a.loop = true; a.volume = m.volume ?? 0.35;
  const b = document.createElement('button');
  b.className = 'music-btn'; b.type = 'button'; b.setAttribute('aria-label', 'Play or pause music');
  b.innerHTML = '<span></span><span></span><span></span>';
  b.onclick = () => a.paused ? a.play().catch(() => {}) : a.pause();
  a.onplay = () => b.classList.add('on');          // bars animate while playing
  a.onpause = () => b.classList.remove('on');
  document.body.appendChild(b);
  return a;
}

/* ---------- INTRO ----------
   Shows the curtain, waits for a tap, slides it open, then lets the hero animate and starts music. */
function setupIntro(audio){
  const cfg = CONFIG.intro || {};
  let seen = false;
  try { seen = !!sessionStorage.getItem('introSeen'); } catch (e) {}
  if (!cfg.enabled || (seen && !cfg.showEveryVisit)){ document.body.classList.add('opened'); return; }

  document.body.classList.add('locked');
  const o = document.createElement('div');
  o.className = 'intro';
  // Order matters: the 4 children in .intro-inner are staggered in extras.css.
  o.innerHTML = `<div class="curtain l"></div><div class="curtain r"></div>
    <div class="intro-inner">
      <span class="intro-line">${cfg.line || ''}</span>
      <div class="intro-mono">${CONFIG.couple.initials}</div>
      <p class="intro-date">${CONFIG.hero.subtitleDate}</p>
      <button class="btn btn-gold" type="button">${cfg.button || 'Open'}</button>
    </div>`;
  document.body.appendChild(o);
  $('button', o).focus({ preventScroll: true });

  $('button', o).onclick = () => {
    o.classList.add('open');                       // curtains slide apart (1.6s in CSS)
    if (audio) audio.play().catch(() => {});       // a tap is what allows sound
    document.body.classList.remove('locked');
    document.body.classList.add('opened');         // un-pauses the hero entrance
    try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
    setTimeout(() => o.remove(), 1800);            // clean up after the animation
  };
}

/* ---------- WELL WISHES ----------
   Fetches approved messages and renders them as cards. Section stays hidden if there are none. */
async function setupWishes(){
  const w = CONFIG.wishes || {}, sec = $('#wishes'), wall = $('#wishWall');
  if (!sec) return;
  $('#wishTitle').textContent = w.title || 'Well Wishes';
  $('#wishSub').textContent = w.subtitle || '';
  try {
    const r = await fetch(w.endpoint || '/api/wishes');
    const { wishes = [] } = await r.json();
    if (!wishes.length) return;
    wishes.forEach((x, i) => {
      const c = document.createElement('div'); c.className = 'wish'; c.style.setProperty('--i', i % 6);
      const p = document.createElement('p'), n = document.createElement('b');
      p.textContent = x.message; n.textContent = x.name;     // textContent = safe from HTML injection
      c.append(p, n); wall.appendChild(c);
    });
    sec.hidden = false;
  } catch (e) { /* offline or API not set up yet: leave the section hidden */ }
}

document.addEventListener('DOMContentLoaded', () => { setupIntro(setupMusic()); setupWishes(); });
})();
