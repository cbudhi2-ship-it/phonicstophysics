-- Phonics to Physics — store contact-form enquiries for the admin inbox.
-- Run in the Supabase SQL Editor. Safe to run once.

create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  parent_name text not null,
  email       text not null,
  phone       text,
  year_group  text,
  subjects    text[],
  mode        text,
  message     text,
  status      text not null default 'new'
              check (status in ('new', 'contacted', 'converted', 'declined')),
  created_at  timestamptz not null default now()
);

create index if not exists enquiries_created_idx on public.enquiries (created_at desc);

-- Enquiries come from the public form and are read only by Chris. All access
-- is server-side via the service role, so RLS is on with no public policies.
alter table public.enquiries enable row level security;
