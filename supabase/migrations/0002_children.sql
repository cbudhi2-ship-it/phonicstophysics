-- Phonics to Physics — children under a parent account.
-- Run in the Supabase SQL Editor. Safe to run once.

create table if not exists public.children (
  id         uuid primary key default gen_random_uuid(),
  parent_id  uuid not null references public.profiles (id) on delete cascade,
  name       text not null,
  year_group text,
  tier       text check (tier in ('primary', 'secondary', 'a_level')),
  created_at timestamptz not null default now()
);

create index if not exists children_parent_id_idx on public.children (parent_id);

alter table public.children enable row level security;

-- Parents manage only their own children. Admin uses the service role.
drop policy if exists "children: select own" on public.children;
create policy "children: select own" on public.children
  for select to authenticated using (parent_id = auth.uid());

drop policy if exists "children: insert own" on public.children;
create policy "children: insert own" on public.children
  for insert to authenticated with check (parent_id = auth.uid());

drop policy if exists "children: update own" on public.children;
create policy "children: update own" on public.children
  for update to authenticated
  using (parent_id = auth.uid()) with check (parent_id = auth.uid());

drop policy if exists "children: delete own" on public.children;
create policy "children: delete own" on public.children
  for delete to authenticated using (parent_id = auth.uid());
