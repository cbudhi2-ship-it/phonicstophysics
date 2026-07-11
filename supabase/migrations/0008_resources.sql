-- Phonics to Physics — per-child logins for third-party learning platforms
-- (e.g. Mathletics), set by Chris and shown to the family so children can
-- access them at home. Run in the Supabase SQL Editor. Safe to run once.

create table if not exists public.resources (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid not null references public.children (id) on delete cascade,
  label      text not null,          -- platform name, e.g. "Mathletics"
  url        text,                   -- login page
  username   text,
  password   text,
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists resources_child_idx on public.resources (child_id);

-- Parents can read resources for their own children; Chris manages them via
-- the service role. (Stored so families can view the login — see the app note
-- about keeping these to low-stakes learning accounts only.)
alter table public.resources enable row level security;
drop policy if exists "resources: read own" on public.resources;
create policy "resources: read own" on public.resources
  for select to authenticated
  using (child_id in (select id from public.children where parent_id = auth.uid()));
