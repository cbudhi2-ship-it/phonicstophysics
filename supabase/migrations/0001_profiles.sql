-- Phonics to Physics — Phase 2: auth profiles, roles & access status
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to run once. It creates the profiles table, RLS policies, and a
-- trigger that gives every new auth user a profile (role 'client',
-- status 'pending').

-- 1) Profiles: one row per auth user, holding role and access status.
create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  role               text not null default 'client'  check (role   in ('admin', 'client')),
  status             text not null default 'pending' check (status in ('pending', 'enabled', 'paused')),
  full_name          text,
  phone              text,
  stripe_customer_id text,
  created_at         timestamptz not null default now()
);

comment on table public.profiles is
  'App user profile. role = admin (Chris) or client (parent). status gates the '
  'two-tier access: pending until Chris enables after the intro call.';

-- 2) Row Level Security.
alter table public.profiles enable row level security;

-- Users may READ their own profile. All writes (role/status/profile edits)
-- go through trusted server code using the service-role key, so we do NOT
-- grant clients UPDATE — that prevents a user escalating their own role.
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- 3) Auto-create a profile whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3b) Backfill: give any users that already exist a profile row (idempotent).
insert into public.profiles (id, full_name)
select id, raw_user_meta_data ->> 'full_name'
from auth.users
on conflict (id) do nothing;

-- 4) Bootstrap the admin (Chris).
-- After you've created your own login (Dashboard → Authentication → Add user,
-- or by signing in once), run this ONCE with your email to become admin:
--
--   update public.profiles
--   set role = 'admin', status = 'enabled'
--   where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');
