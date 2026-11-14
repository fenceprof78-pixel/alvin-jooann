# Joo Ann & Alvin — Wedding site

Static site (no build step) + Vercel functions in `/api` + Supabase database.

## File guide (where to change what)
| File | What it is |
|---|---|
| `config.js` | **Start here.** All text, dates, photos, intro, music. Has a quick map at the top. |
| `styles.css` | Colours + fonts (tokens at the top) and base layout |
| `premium.css` / `premium.js` | Animations and interactions (every function is commented) |
| `extras.css` / `extras.js` | Opening curtain, music button, Well Wishes wall |
| `app.js` | Builds sections from `config.js` |
| `admin.html` | Private guest list (password protected) |
| `api/rsvp.js` · `api/wishes.js` · `api/admin.js` | Server code (saves RSVPs, emails you, serves wishes, admin) |
| `supabase/schema.sql` | Database table |

## Setup
1. **Supabase**: new project -> SQL Editor -> paste `supabase/schema.sql` -> Run.
2. Settings -> API: copy **Project URL** and the **service_role** key.
3. **Vercel**: push to GitHub -> New Project -> import (Framework: Other). Add Environment Variables:

| Name | Required | Value |
|---|---|---|
| `SUPABASE_URL` | yes | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | service_role key (secret!) |
| `ADMIN_PASSWORD` | yes | a long password for `/admin.html` |
| `RESEND_API_KEY` | optional | from resend.com — enables email alerts |
| `NOTIFY_EMAIL` | optional | inbox that receives alerts |
| `NOTIFY_FROM` | optional | e.g. `Wedding <rsvp@yourdomain.com>` (needs a verified domain) |

4. Redeploy after adding variables. Test: submit an RSVP, open `/admin.html`.

## Music
Add your song to a new `assets/` folder (e.g. `assets/our-song.mp3`) and set `music.src` in `config.js`.

## Approving well wishes
Guests' RSVP messages are private by default. In `/admin.html` tick **On wall** next to a message and it appears on the site within about a minute (first name only).
