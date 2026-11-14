// GET /api/wishes — public list of APPROVED messages for the Well Wishes wall.
// Only first names + messages are returned; emails and everything else stay private.
const sb = require('./_supabase');

module.exports = async (req, res) => {
  const r = await sb('rsvps?show_wish=eq.true&message=not.is.null&select=name,message&order=updated_at.desc&limit=60');   // 60 = max cards shown
  if (!r.ok) return res.status(502).json({ wishes: [] });
  const rows = await r.json();
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');   // new approvals appear within ~1 minute
  res.status(200).json({ wishes: rows.map(w => ({ name: w.name.split(' ')[0], message: w.message })) });
};
