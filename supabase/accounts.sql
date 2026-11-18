-- TripTable accounts. Additive and safe to re-run.
-- Does not replace plan_counts, overlap_count, or find_student.
-- Run once in the Supabase SQL editor if a new @yale.edu sign-in does not get a profiles row.
-- The app also inserts that row itself after sign-in. This trigger covers the moment the auth user is created.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  college text not null default '',
  class_year text not null default ''
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable by signed-in students" on public.profiles;
create policy "profiles are readable by signed-in students" on public.profiles
  for select to authenticated
  using (public.is_yale());

drop policy if exists "students insert their own profile" on public.profiles;
create policy "students insert their own profile" on public.profiles
  for insert to authenticated
  with check (
    id = (select auth.uid())
    and public.is_yale()
    and lower(email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  );

drop policy if exists "students update their own profile" on public.profiles;
create policy "students update their own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and public.is_yale());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.email, '') !~* '^[^@[:space:]]+@yale\.edu$' then
    return new;
  end if;
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    lower(new.email),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 80),
    nullif(left(coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', ''), 500), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
