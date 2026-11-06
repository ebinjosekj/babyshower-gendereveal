# Nikhitha & Ebin — Baby Shower & Gender Reveal (cinematic invitation)

React + TypeScript + Tailwind, animated with GSAP (scroll scenes, hero timeline) and Framer Motion
(envelope, tilt, reveals). Supabase stores RSVPs and live Team Boy / Team Girl votes.
The original single-file site in the repo root is untouched.

## Run it

```bash

cp .env.example .env     # add your Supabase URL + anon key (optional for a first look)
npm install
npm run dev
```

Without `.env` the site runs in **preview mode** (everything works, nothing is saved).

## Before you share the link

1. **Supabase**: create a project → SQL Editor → run `supabase/schema.sql` →
   Authentication → Sign In / Providers → enable **Anonymous sign-ins**.
2. **Venue**: set the full street address in `src/config.ts` → `venueQuery` (map + directions use it).
   Currently `Evoke, Kitchener, ON` — a guess; please confirm.
3. **Music**: add your own licensed track as `public/audio/lullaby.mp3` (button hides itself if missing).
4. **Photos**: add `public/gallery/01.jpg … 08.jpg` (missing ones are skipped).
5. Check names/phones in `src/config.ts` (copied from your existing site).

## Deploy (GitHub Pages)

The workflow in `.github/workflows/deploy.yml` builds and publishes on every push to `main`. Add repo secrets
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then Settings → Pages → Source → **GitHub Actions**.

## Notes

- Palette: champagne gold, ivory, beige, cocoa — no pink or blue. Teams use bronze vs pearl.
- RSVPs are private (only you see them: Supabase → Table editor → `rsvp_summary`). Voter names are public.
- Honors `prefers-reduced-motion`; particles pause when the tab is hidden; below-the-fold sections lazy-load.
- Google's embedded map keeps its own pins; it is warm-tinted with a CSS filter to sit in the palette.
