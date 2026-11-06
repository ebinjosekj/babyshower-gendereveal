-- Run once in Supabase → SQL Editor → New query → Run.
-- Lets a guest change their team or RSVP later, from the same phone/browser they used the first time.
-- Safe to run more than once. Existing replies are kept.

alter table public.predictions add column if not exists edit_key text;
alter table public.rsvps       add column if not exists edit_key text;

-- Create a team pick, or change it when the private key from the guest's own browser matches.
create or replace function public.save_prediction(p_name text, p_team text, p_key text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  k   text := lower(regexp_replace(btrim(p_name), '\s+', ' ', 'g'));
  h   text := md5(coalesce(p_key, ''));
  cur public.predictions%rowtype;
begin
  if p_team not in ('boy', 'girl') then
    raise exception 'invalid team';
  end if;
  if p_key is null or char_length(p_key) < 16 then
    raise exception 'invalid key';
  end if;

  select * into cur from public.predictions where name_key = k;

  if not found then
    begin
      insert into public.predictions (guest_name, selected_team, edit_key)
      values (btrim(p_name), p_team, h);
      return 'created';
    exception when unique_violation then
      return 'name_taken';
    end;
  end if;

  if cur.edit_key is not null and cur.edit_key = h then
    update public.predictions set selected_team = p_team where id = cur.id;
    return 'updated';
  end if;

  return 'name_taken';
end;
$$;

-- Same idea for the RSVP.
create or replace function public.save_rsvp(p_name text, p_status text, p_key text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  k   text := lower(regexp_replace(btrim(p_name), '\s+', ' ', 'g'));
  h   text := md5(coalesce(p_key, ''));
  n   int  := case when p_status = 'attending' then 1 else 0 end;
  cur public.rsvps%rowtype;
begin
  if p_status not in ('attending', 'blessing') then
    raise exception 'invalid status';
  end if;
  if p_key is null or char_length(p_key) < 16 then
    raise exception 'invalid key';
  end if;

  select * into cur from public.rsvps where name_key = k;

  if not found then
    begin
      insert into public.rsvps (guest_name, attendees, attendance_status, edit_key)
      values (btrim(p_name), n, p_status, h);
      return 'created';
    exception when unique_violation then
      return 'name_taken';
    end;
  end if;

  if cur.edit_key is not null and cur.edit_key = h then
    update public.rsvps set attendance_status = p_status, attendees = n where id = cur.id;
    return 'updated';
  end if;

  return 'name_taken';
end;
$$;

grant execute on function public.save_prediction(text, text, text) to anon, authenticated;
grant execute on function public.save_rsvp(text, text, text)        to anon, authenticated;
