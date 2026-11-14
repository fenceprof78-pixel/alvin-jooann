# Joo Ann & Alvin — Wedding site (Next.js + Supabase + Vercel)

Everything guests see (names, date, venue, story, schedule, FAQ, gifts, photos, colours, section
backgrounds, music) is stored in the database and edited at **/atelier** — no code changes needed.
The first time the tables are empty, the site seeds itself from `src/lib/defaults.ts`.

## Deploy
1. **Supabase**: create a project → Project Settings → Database → Connection string → **Session pooler** URI.
2. **Create the tables** (once, from your laptop, in this folder):
   `npm install` then `DATABASE_URL="<pooler uri>" npx drizzle-kit push`
3. **Vercel**: push to GitHub → New Project → import. Add environment variables:

| Name | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Supabase Session pooler URI |
| `ADMIN_PASSWORD` | yes | password for `/atelier` |
| `ADMIN_SECRET` | yes | long random string (signs the login cookie) |
| `RESEND_API_KEY`, `NOTIFY_EMAIL` | optional | email alert on every RSVP |
| `NOTIFY_FROM` | optional | needs a domain verified in Resend |
| `NEXT_PUBLIC_SITE_URL` | optional | your final URL, for link previews |

4. Open `/atelier`, sign in, and replace the placeholder gallery photos with your own
   (upload to Supabase Storage → Public bucket → paste the image URLs).

## Edit first
- `src/lib/defaults.ts` — starting content (used only on first run). After that use **/atelier**.
- Bride/groom surnames, parents, roles, portraits and meal options are blank/generic: fill them in Atelier.
- Music: paste an audio URL (Supabase Storage) into the Music field in Atelier.
