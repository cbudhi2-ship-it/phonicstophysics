-- Phonics to Physics — 11+ Summer Bootcamp enrolments.
-- Run in the Supabase SQL Editor. Safe to run once.

create table if not exists public.bootcamp_enrolments (
  id                uuid primary key default gen_random_uuid(),
  name              text,
  email             text not null,
  amount_gbp        numeric,
  early_bird        boolean not null default false,
  stripe_session_id text unique,
  created_at        timestamptz not null default now()
);

create index if not exists bootcamp_created_idx
  on public.bootcamp_enrolments (created_at desc);

-- Public booking, read only by Chris via the service role.
alter table public.bootcamp_enrolments enable row level security;
