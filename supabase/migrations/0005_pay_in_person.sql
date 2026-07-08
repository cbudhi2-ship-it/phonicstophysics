-- Phonics to Physics — allow trusted clients to book without buying tokens
-- (they pay Chris in cash/in person). Off by default; Chris enables per client.
-- Run in the Supabase SQL Editor. Safe to run once.

alter table public.profiles
  add column if not exists pay_in_person boolean not null default false;
