-- Friends and saved trips. Safe to re-run on a new TripTable project.
-- plan_counts and overlap_count return totals only. find_student is an exact email or NetID lookup.

create table if not exists public.trips (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  place_id text not null check (char_length(place_id) between 1 and 120),
  season text not null check (season in ('spring', 'summer', 'fall', 'winter', 'weekend')),
  start_date date not null,
  end_date date not null,
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists trips_user_id_idx on public.trips (user_id);
create index if not exists trips_place_idx on public.trips (place_id, start_date, end_date);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null references auth.users (id) on delete cascade,
  addressee uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  check (requester <> addressee),
  unique (requester, addressee)
);

create index if not exists friendships_addressee_idx on public.friendships (addressee);

alter table public.trips enable row level security;
alter table public.friendships enable row level security;

drop policy if exists "read own or accepted friends trips" on public.trips;
create policy "read own or accepted friends trips" on public.trips
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
        and (
          (f.requester = (select auth.uid()) and f.addressee = trips.user_id)
          or (f.addressee = (select auth.uid()) and f.requester = trips.user_id)
        )
    )
  );

drop policy if exists "insert own trips" on public.trips;
create policy "insert own trips" on public.trips
  for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_yale());

drop policy if exists "update own trips" on public.trips;
create policy "update own trips" on public.trips
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and public.is_yale());

drop policy if exists "delete own trips" on public.trips;
create policy "delete own trips" on public.trips
  for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "see own friendships" on public.friendships;
create policy "see own friendships" on public.friendships
  for select to authenticated
  using (requester = (select auth.uid()) or addressee = (select auth.uid()));

drop policy if exists "send a friend request" on public.friendships;
create policy "send a friend request" on public.friendships
  for insert to authenticated
  with check (requester = (select auth.uid()) and status = 'pending' and public.is_yale());

drop policy if exists "update own friendship" on public.friendships;
create policy "update own friendship" on public.friendships
  for update to authenticated
  using (requester = (select auth.uid()) or addressee = (select auth.uid()))
  with check (requester = (select auth.uid()) or addressee = (select auth.uid()));

drop policy if exists "delete own friendship" on public.friendships;
create policy "delete own friendship" on public.friendships
  for delete to authenticated
  using (requester = (select auth.uid()) or addressee = (select auth.uid()));

create or replace function public.plan_counts()
returns table (place_id text, season text, year int, plans int)
language sql
stable
security definer
set search_path = ''
as $$
  select t.place_id, t.season, extract(year from t.start_date)::int, count(distinct t.user_id)::int
  from public.trips t
  group by t.place_id, t.season, extract(year from t.start_date);
$$;

create or replace function public.overlap_count(p_place text, p_start date, p_end date)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(distinct t.user_id)::int
  from public.trips t
  where t.place_id = p_place
    and t.start_date <= p_end
    and t.end_date >= p_start
    and t.user_id is distinct from (select auth.uid());
$$;

create or replace function public.find_student(q text)
returns table (id uuid, email text, full_name text, college text, class_year text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  needle text := lower(btrim(coalesce(q, '')));
begin
  if not public.is_yale() then
    raise exception 'permission denied for function find_student' using errcode = '42501';
  end if;
  if needle = '' or char_length(needle) > 120 then
    return;
  end if;
  return query
  select p.id, p.email, p.full_name, p.college, p.class_year
  from public.profiles p
  where p.email = needle
     or (position('@' in needle) = 0 and split_part(p.email, '@', 1) = needle)
  order by (p.email = needle) desc, p.email
  limit 1;
end;
$$;

revoke all on function public.find_student(text) from public;
grant execute on function public.find_student(text) to authenticated;
grant execute on function public.plan_counts() to anon, authenticated;
grant execute on function public.overlap_count(text, date, date) to anon, authenticated;

grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant insert on public.review_reports to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.friendships to authenticated;
grant select, insert, update, delete on public.trips to authenticated;
