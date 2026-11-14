// Shared helper for every API file. Files starting with "_" are NOT public URLs on Vercel.
// Usage: sb('rsvps?select=*') — talks to Supabase's REST API with the secret service key.
// The key comes from Vercel Environment Variables (never put it in front-end files).
module.exports = (path, opts = {}) => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
};
