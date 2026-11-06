# A Little Wonder Is On The Way — Nikhitha & Ebin

Baby Shower & Gender Reveal · **November 21, 2026 · 6:00 PM · Evoke**

A cinematic, story-style invitation: golden-door opening → floating-island adventure → crystal countdown →
interactive wonder-world map → **Team Sunshine vs Team Nature** prediction game → event details & map → RSVP →
photo gallery → fireworks finale. Plus a parents-only admin dashboard.

React · TypeScript · Vite · Tailwind CSS · GSAP · Framer Motion · Supabase · Lucide icons.

## Run locally

```bash
npm install
cp .env.example .env      # add your Supabase URL + anon key (optional — see "Preview mode")
npm run dev
```

**Preview mode:** without `.env` everything works, but RSVPs / predictions are not saved or shared.

## One-time setup

1. **Supabase** → SQL Editor → run `supabase/schema.sql`
   (⚠ it replaces the tables from the earlier version of this site — fine if they only hold test data).
2. **Admin account:** Authentication → Users → *Add user* (email + password, auto-confirm). Then run in the SQL Editor:
   `insert into public.admins (email) values ('your-email@example.com');`
   and turn **off** "Allow new users to sign up" (Authentication → Sign In / Providers → Email).
3. **GitHub** → Settings → Secrets and variables → Actions: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   (the *anon/public* key only — never a service-role key). Settings → Pages → Source: **GitHub Actions**.
4. Push to `main` — the workflow builds and publishes automatically.

Admin dashboard: `https://ebinjosekj.github.io/babyshower-gendereveal/#/admin`
(totals, confirmed guests, declined, team counts, wishes, search/filter, CSV export).

## Things to personalise (`src/config.ts`)

- `venueQuery` — put Evoke's full street address for an exact map pin and directions.
- `GALLERY` + `public/photos/` — add `01.jpg … 07.jpg`. `invitation.jpg` is your original invitation artwork.
- `public/photos/couple.jpg` (optional) — appears framed in "Our Little Adventure".
- Music — by default an **original music-box lullaby is generated in the browser** (no file, no licensing).
  To use your own licensed track: save `public/audio/wonder.mp3` and set `MUSIC.useFile = true`.

## How it behaves

- Music only starts after the visitor taps the door / enter / skip, and the floating control offers play, pause, mute and volume.
- **Simplified animation mode** switches on automatically for reduced-motion, low-memory, low-core and data-saver devices
  (and can be toggled in the menu). It stops decorative loops, scroll effects and fireworks.
- Predictions and RSVPs: one per name (database-enforced) and one per device; the public scoreboard shows only totals.
  RSVPs and names are readable only by admins (Row Level Security). The RSVP form has a hidden bot trap.
- The baby's gender is not stored or shown anywhere.
