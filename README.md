# A Little Wonder Is On The Way — Nikhitha & Ebin

Baby Shower & Gender Reveal · **November 21, 2026 · 6:00 PM · Evoke**

**Little Wonderland** — a cinematic invitation set in a layered fantasy world: an interactive storybook gate that opens into the world →
hero world → our story (your real photos) → the little explorer → golden countdown rings → scroll-driven rainbow
journey (Garden of Love → Dream Bridge → Golden Destination) → **Team Boy vs Team Girl (join a team + public team list)** prediction →
celebration details → RSVP → gallery → constellation finale. Plus a parents-only admin dashboard.
Scenery is drawn as inline SVG/CSS (no image downloads, no licensing issues).

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

- `venueAddress` — set to 239 Eden Oak Trail, Kitchener, ON N2A 0L5 (drives Directions, the map and the calendar location).
- `GALLERY` + `public/photos/` — add `01.jpg … 07.jpg`. `invitation.jpg` is your original invitation artwork.
- `public/photos/couple.jpg` (+ optional `01.jpg`, `02.jpg`) — appear in arched golden frames in "Our little story". Without them an illustrated island is shown instead.
- Music — by default an **original music-box lullaby is generated in the browser** (no file, no licensing).
  To use your own licensed track: save `public/audio/wonder.mp3` and set `MUSIC.useFile = true`.

## How it behaves

- Music only starts after the visitor taps the door / enter / skip, and the floating control offers play, pause, mute and volume.
- **Simplified animation mode** switches on automatically for reduced-motion, low-memory, low-core and data-saver devices
  (and can be toggled in the menu). It stops decorative loops, scroll effects and fireworks.
- Team joins and RSVPs: one per name (database-enforced). The public team list shows only the names guests typed and their team (via a restricted database function);
  RSVPs are readable only by admins (Row Level Security). RSVP asks only for a name and "See you!" / "Sending blessings". The RSVP form has a hidden bot trap.
- The baby's gender is not stored or shown anywhere.
