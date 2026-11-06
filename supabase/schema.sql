-- Run once in Supabase → SQL Editor → New query → Run.
--
-- ⚠ This REPLACES the tables from the earlier version of the site (guests / rsvps / votes).
--   It is safe if you only have test data; real guest replies in those tables would be deleted.
--
-- Anonymous sign-ins are NOT needed any more. Guests submit with the public anon key;
-- Row Level Security below decides what that key may do.

drop view  if exists public.rsvp_summary;
drop table if exists public.votes       cascade;
drop table if exists public.predictions cascade;
drop table if exists public.rsvps       cascade;
drop table if exists public.guests      cascade;
drop table if exists public.admins      cascade;

-- ───────────────────────── tables ─────────────────────────

create table public.rsvps (
  id                uuid primary key default gen_random_uuid(),
  guest_name        text not null check (char_length(btrim(guest_name)) between 2 and 60),
  email             text check (email is null or (char_length(email) <= 120 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  attendees         int  not null default 1 check (attendees between 0 and 10),
  -- "See you!" = attending, "Sending blessings" = blessing  (email / attendees / wishes are no longer collected)
  attendance_status text not null check (attendance_status in ('attending', 'blessing', 'declined')),
  wishes            text check (wishes is null or char_length(wishes) <= 600),
  created_at        timestamptz not null default now(),
  -- one reply per name ("Jane  DOE" and "jane doe" count as the same guest)
  name_key          text generated always as (lower(regexp_replace(btrim(guest_name), '\s+', ' ', 'g'))) stored
);
create unique index rsvps_name_key_uq on public.rsvps (name_key);

create table public.predictions (
  id            uuid primary key default gen_random_uuid(),
  guest_name    text not null check (char_length(btrim(guest_name)) between 2 and 60),
  selected_team text not null check (selected_team in ('boy', 'girl')),
  created_at    timestamptz not null default now(),
  name_key      text generated always as (lower(regexp_replace(btrim(guest_name), '\s+', ' ', 'g'))) stored
);
create unique index predictions_name_key_uq on public.predictions (name_key);

-- who may open the dashboard (nobody can read this table through the API)
create table public.admins (
  email text primary key
);

-- ───────────────────────── helpers ─────────────────────────

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Public scoreboard: only the two totals, never names.
create or replace function public.prediction_counts()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'boy',  count(*) filter (where selected_team = 'boy'),
    'girl', count(*) filter (where selected_team = 'girl')
  )
  from public.predictions;
$$;

-- Public team list: names + team only (no ids, no timestamps), as requested for the "Join a team" section.
create or replace function public.team_roster()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(json_build_object('name', guest_name, 'team', selected_team) order by created_at), '[]'::json)
  from public.predictions;
$$;
grant execute on function public.team_roster() to anon, authenticated;

-- table permissions (RLS below still decides which rows)
grant insert on public.rsvps, public.predictions to anon, authenticated;
grant select, update, delete on public.rsvps       to authenticated;
grant select, delete         on public.predictions to authenticated;

grant execute on function public.is_admin()          to anon, authenticated;
grant execute on function public.prediction_counts() to anon, authenticated;

-- ───────────────────────── row level security ─────────────────────────

alter table public.rsvps       enable row level security;
alter table public.predictions enable row level security;
alter table public.admins      enable row level security;   -- no policies → API can't touch it

-- visitors may ADD a reply / prediction (the table constraints above validate it) …
create policy "anyone can rsvp"       on public.rsvps       for insert to anon, authenticated with check (true);
create policy "anyone can predict"    on public.predictions for insert to anon, authenticated with check (true);

-- … but only admins can read, change or delete them.
create policy "admins read rsvps"        on public.rsvps       for select to authenticated using (public.is_admin());
create policy "admins update rsvps"      on public.rsvps       for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete rsvps"      on public.rsvps       for delete to authenticated using (public.is_admin());
create policy "admins read predictions"  on public.predictions for select to authenticated using (public.is_admin());
create policy "admins delete predictions" on public.predictions for delete to authenticated using (public.is_admin());

-- ───────────────────────── make yourselves admins ─────────────────────────
-- 1) Supabase → Authentication → Users → Add user → (email + password, tick "Auto confirm").
-- 2) Replace the email below with that user's email and run this line:
--
-- insert into public.admins (email) values ('your-email@example.com');
--
-- 3) Recommended: Authentication → Sign In / Providers → Email → turn OFF "Allow new users to sign up".
--    Then open  https://ebinjosekj.github.io/babyshower_genderreveal/#/admin

-- ───────────────────────── change my reply (added later) ─────────────────────────
-- After running this file, also run  supabase/update-change-replies.sql  so guests can change their team / RSVP.
