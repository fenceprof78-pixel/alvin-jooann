// /api/admin — password-protected guest list used by admin.html.
//   GET    -> all RSVPs
//   PATCH  -> { id, show_wish }  approve / hide a message on the wall
//   DELETE -> { id }             remove an RSVP
// Password = the ADMIN_PASSWORD environment variable in Vercel (pick a long one).
const crypto = require('crypto');
const sb = require('./_supabase');

const same = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const UUID = /^[0-9a-f-]{36}$/i;

module.exports = async (req, res) => {
  const pw = process.env.ADMIN_PASSWORD || '';
  if (!pw || !same(String(req.headers['x-admin-key'] || ''), pw)) return res.status(401).json({ error: 'Wrong password.' });
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const r = await sb('rsvps?select=*&order=created_at.desc');
    return r.ok ? res.status(200).json({ rsvps: await r.json() }) : res.status(502).json({ error: 'Database error.' });
  }

  let b = req.body;
  try { if (typeof b === 'string') b = JSON.parse(b); } catch { b = {}; }
  b = b || {};
  if (!UUID.test(String(b.id || ''))) return res.status(400).json({ error: 'Bad id.' });

  if (req.method === 'PATCH') {
    const r = await sb(`rsvps?id=eq.${b.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ show_wish: !!b.show_wish }) });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  }
  if (req.method === 'DELETE') {
    const r = await sb(`rsvps?id=eq.${b.id}`, { method: 'DELETE' });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  }
  res.status(405).json({ error: 'Method not allowed.' });
};
