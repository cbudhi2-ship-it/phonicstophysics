-- Phonics to Physics — Phase 4: targets, homework, messaging.
-- Run in the Supabase SQL Editor. Safe to run once.

-- Learning targets per child (admin sets; parent reads).
create table if not exists public.targets (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid not null references public.children (id) on delete cascade,
  title      text not null,
  detail     text,
  status     text not null default 'active' check (status in ('active', 'achieved')),
  created_at timestamptz not null default now()
);
create index if not exists targets_child_idx on public.targets (child_id);
alter table public.targets enable row level security;
drop policy if exists "targets: read own" on public.targets;
create policy "targets: read own" on public.targets
  for select to authenticated
  using (child_id in (select id from public.children where parent_id = auth.uid()));

-- Homework per child (admin assigns; parent marks done).
create table if not exists public.homework (
  id             uuid primary key default gen_random_uuid(),
  child_id       uuid not null references public.children (id) on delete cascade,
  title          text not null,
  detail         text,
  due_date       date,
  attachment_url text,
  done           boolean not null default false,
  created_at     timestamptz not null default now()
);
create index if not exists homework_child_idx on public.homework (child_id);
alter table public.homework enable row level security;
drop policy if exists "homework: read own" on public.homework;
create policy "homework: read own" on public.homework
  for select to authenticated
  using (child_id in (select id from public.children where parent_id = auth.uid()));
drop policy if exists "homework: update own" on public.homework;
create policy "homework: update own" on public.homework
  for update to authenticated
  using (child_id in (select id from public.children where parent_id = auth.uid()))
  with check (child_id in (select id from public.children where parent_id = auth.uid()));

-- Messaging: one async thread per parent.
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  parent_id  uuid not null references public.profiles (id) on delete cascade,
  sender     text not null check (sender in ('admin', 'client')),
  body       text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists messages_parent_idx on public.messages (parent_id, created_at);
alter table public.messages enable row level security;
drop policy if exists "messages: read own" on public.messages;
create policy "messages: read own" on public.messages
  for select to authenticated using (parent_id = auth.uid());
drop policy if exists "messages: send own" on public.messages;
create policy "messages: send own" on public.messages
  for insert to authenticated
  with check (parent_id = auth.uid() and sender = 'client');
