-- Run this once in Supabase → SQL Editor.
-- Before using the site: Authentication → Sign In / Providers → enable "Allow anonymous sign-ins".

-- 1) Guests: one row per person (names are shown publicly in the voting lists)
create table if not exists public.guests (
  user_id    uuid primary key default auth.uid(),
  guest_name text not null check (char_length(guest_name) between 1 and 40),
  name_key   text not null unique,           -- lower-cased, whitespace-collapsed → no duplicate names
  created_at timestamptz not null default now()
);

-- 2) RSVPs: private (each guest can only see their own; you read them in the dashboard)
create table if not exists public.rsvps (
  user_id    uuid primary key references public.guests(user_id) on delete cascade,
  status     text not null check (status in ('coming', 'blessing-online', 'cannot-attend')),
  party_size int  not null default 1 check (party_size between 1 and 10),
  message    text check (char_length(message) <= 500),
  updated_at timestamptz not null default now()
);

-- 3) Votes: public (counts + names), one per guest, changeable
create table if not exists public.votes (
  user_id    uuid primary key references public.guests(user_id) on delete cascade,
  team       text not null check (team in ('boy', 'girl')),
  updated_at timestamptz not null default now()
);

alter table public.guests enable row level security;
alter table public.rsvps  enable row level security;
alter table public.votes  enable row level security;

-- guests
create policy "guests are public"   on public.guests for select to anon, authenticated using (true);
create policy "guest inserts self"  on public.guests for insert to authenticated with check (user_id = (select auth.uid()));
create policy "guest updates self"  on public.guests for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- rsvps (private)
create policy "rsvp read own"   on public.rsvps for select to authenticated using (user_id = (select auth.uid()));
create policy "rsvp insert own" on public.rsvps for insert to authenticated with check (user_id = (select auth.uid()));
create policy "rsvp update own" on public.rsvps for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- votes (public read)
create policy "votes are public" on public.votes for select to anon, authenticated using (true);
create policy "vote insert own"  on public.votes for insert to authenticated with check (user_id = (select auth.uid()));
create policy "vote update own"  on public.votes for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Live vote updates
alter publication supabase_realtime add table public.votes;

-- Handy host view (dashboard only): who is coming?
create or replace view public.rsvp_summary with (security_invoker = true) as
  select g.guest_name, r.status, r.party_size, r.message, r.updated_at
  from public.rsvps r join public.guests g using (user_id)
  order by r.updated_at desc;
