-- Run once in Supabase → SQL Editor → New query → Run.
-- Lets a guest change their team pick or RSVP later by typing their name, from any phone or browser.
-- Safe to run more than once. Existing replies are kept.

-- (cleanup from an earlier version of this feature, harmless if they do not exist)
drop function if exists public.save_prediction(text, text, text);
drop function if exists public.save_rsvp(text, text, text);
alter table public.predictions drop column if exists edit_key;
alter table public.rsvps       drop column if exists edit_key;

-- Move a guest to the other team. Returns 'updated', or 'not_found' when nobody has that name.
create or replace function public.change_team(p_name text, p_team text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  k text := lower(regexp_replace(btrim(p_name), '\s+', ' ', 'g'));
  n int;
begin
  if p_team not in ('boy', 'girl') then
    raise exception 'invalid team';
  end if;
  update public.predictions set selected_team = p_team where name_key = k;
  get diagnostics n = row_count;
  return case when n > 0 then 'updated' else 'not_found' end;
end;
$$;

-- Change an RSVP between "Count me in" and "Cheering from afar".
create or replace function public.change_rsvp(p_name text, p_status text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  k text := lower(regexp_replace(btrim(p_name), '\s+', ' ', 'g'));
  n int;
begin
  if p_status not in ('attending', 'blessing') then
    raise exception 'invalid status';
  end if;
  update public.rsvps
     set attendance_status = p_status,
         attendees = case when p_status = 'attending' then 1 else 0 end
   where name_key = k;
  get diagnostics n = row_count;
  return case when n > 0 then 'updated' else 'not_found' end;
end;
$$;

grant execute on function public.change_team(text, text) to anon, authenticated;
grant execute on function public.change_rsvp(text, text) to anon, authenticated;
