// POST /api/rsvp — validates an RSVP, saves it to Supabase, emails you (optional).
const sb = require('./_supabase');

// ---- EMAIL NOTIFICATION (optional) via Resend.com ----
// Set in Vercel -> Settings -> Environment Variables:
//   RESEND_API_KEY  (from resend.com)     NOTIFY_EMAIL  (your inbox)
//   NOTIFY_FROM     (optional, e.g. "Wedding <rsvp@yourdomain.com>"; the default only delivers
//                    to the email you signed up to Resend with — fine for testing)
// If RESEND_API_KEY or NOTIFY_EMAIL is missing this is skipped and RSVPs still save.
async function notify(row) {
  const key = process.env.RESEND_API_KEY, to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || 'Wedding RSVP <onboarding@resend.dev>',
        to: [to],
        subject: `${row.attending ? 'Accepted' : 'Declined'}: ${row.name}`,   // <- edit the subject line
        text: [`Name: ${row.name}`, `Email: ${row.email}`, `Attending: ${row.attending ? 'Yes' : 'No'}`,
               `Guests: ${row.guests}`, `Dietary: ${row.dietary || '-'}`, `Message: ${row.message || '-'}`].join('\n'),
      }),
    });
  } catch (e) { /* never let an email problem block the guest's RSVP */ }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  let b = req.body;
  try { if (typeof b === 'string') b = JSON.parse(b); } catch { b = {}; }
  b = b || {};
  if (b.website) return res.status(200).json({ ok: true });   // honeypot: real guests never fill this hidden field

  // ---- validation + length limits (change the numbers to taste) ----
  const name = String(b.name || '').trim().slice(0, 120);
  const email = String(b.email || '').trim().toLowerCase().slice(0, 160);
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter your name and a valid email.' });

  const attending = b.attending !== 'Regretfully Declines';
  const row = {
    name, email, attending,
    guests: attending ? Math.min(Math.max(parseInt(b.guests, 10) || 1, 1), 4) : 0,   // 4 = max guests per RSVP
    dietary: String(b.dietary || '').trim().slice(0, 200) || null,
    message: String(b.message || '').trim().slice(0, 1000) || null,
    show_wish: false,                       // every new/updated message needs your approval again (admin.html)
    updated_at: new Date().toISOString(),
  };

  // Upsert: the same email submitting again UPDATES their RSVP instead of creating a duplicate.
  const r = await sb('rsvps?on_conflict=email', {
    method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(row),
  });
  if (!r.ok) return res.status(502).json({ error: 'Our server couldn’t save that.' });

  await notify(row);   // must finish before responding (serverless stops right after)
  res.status(200).json({ ok: true });
};
