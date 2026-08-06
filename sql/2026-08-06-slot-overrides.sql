-- Per-date reservation slot overrides
-- Lets a restaurant disable individual generated time slots for one specific
-- date (e.g. the 19:00 seating is full tonight, so stop taking 19:00 bookings
-- while keeping 21:00 open). The recurring schedule in reservation_schedule is
-- untouched — this only overrides single dates. The public booking widget
-- filters out any slot listed in disabled_slots for the requested date.
-- Run once in Supabase SQL editor.

create table if not exists public.reservation_slot_overrides (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  uuid not null references public.restaurants(id) on delete cascade,
  date           date not null,
  disabled_slots jsonb not null default '[]'::jsonb,  -- array of "HH:MM" strings
  updated_at     timestamptz not null default now(),
  unique (restaurant_id, date)
);

create index if not exists reservation_slot_overrides_restaurant_date_idx
  on public.reservation_slot_overrides (restaurant_id, date);

-- Same access rule as reservation_schedule: the restaurant's owner
-- (profiles.restaurant_id) OR any admin (profiles.is_admin) may read/write.
alter table public.reservation_slot_overrides enable row level security;

drop policy if exists "owner manages slot overrides" on public.reservation_slot_overrides;
drop policy if exists "slot_overrides_access" on public.reservation_slot_overrides;
create policy "slot_overrides_access"
  on public.reservation_slot_overrides
  for all
  using (
    restaurant_id in (
      select restaurant_id from public.profiles where id = auth.uid()
      union
      select id from public.restaurants
      where exists (
        select 1 from public.profiles where id = auth.uid() and is_admin = true
      )
    )
  )
  with check (
    restaurant_id in (
      select restaurant_id from public.profiles where id = auth.uid()
      union
      select id from public.restaurants
      where exists (
        select 1 from public.profiles where id = auth.uid() and is_admin = true
      )
    )
  );
