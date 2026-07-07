-- Phonics to Physics — Phase 3: token ledger + bookings.
-- Run in the Supabase SQL Editor. Safe to run once.

-- Append-only token ledger. A tier's balance = SUM(amount) of its rows.
create table if not exists public.token_transactions (
  id                uuid primary key default gen_random_uuid(),
  parent_id         uuid not null references public.profiles (id) on delete cascade,
  tier              text not null check (tier in ('primary', 'secondary', 'a_level')),
  type              text not null check (type in ('purchase', 'booking', 'refund', 'adjustment', 'expiry')),
  amount            integer not null,                 -- + credits, - debits
  stripe_session_id text,                             -- idempotency for purchases
  cal_booking_uid   text,                             -- link for booking/refund
  pack_label        text,
  expires_at        timestamptz,
  note              text,
  created_at        timestamptz not null default now()
);

create index if not exists tt_parent_tier_idx on public.token_transactions (parent_id, tier);
-- One ledger row per Stripe session / per Cal booking event (idempotency).
create unique index if not exists tt_stripe_session_uidx
  on public.token_transactions (stripe_session_id) where stripe_session_id is not null;
create unique index if not exists tt_cal_booking_type_uidx
  on public.token_transactions (cal_booking_uid, type) where cal_booking_uid is not null;

alter table public.token_transactions enable row level security;
drop policy if exists "tt: read own" on public.token_transactions;
create policy "tt: read own" on public.token_transactions
  for select to authenticated using (parent_id = auth.uid());
-- All writes happen server-side with the service role (webhooks/admin).

-- Bookings mirror Cal.com bookings for display + token accounting.
create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  parent_id       uuid not null references public.profiles (id) on delete cascade,
  child_id        uuid references public.children (id) on delete set null,
  tier            text check (tier in ('primary', 'secondary', 'a_level')),
  cal_booking_uid text unique,
  starts_at       timestamptz,
  duration_min    integer default 55,
  subject         text,
  mode            text,
  join_url        text,
  status          text not null default 'scheduled'
                  check (status in ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  created_at      timestamptz not null default now()
);

create index if not exists bookings_parent_idx on public.bookings (parent_id);

alter table public.bookings enable row level security;
drop policy if exists "bookings: read own" on public.bookings;
create policy "bookings: read own" on public.bookings
  for select to authenticated using (parent_id = auth.uid());
