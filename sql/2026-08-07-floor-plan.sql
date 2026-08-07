-- Floor plan / table layout per restaurant.
-- A restaurant has several rooms (salle, cour, terrasse...). Each room holds
-- tables placed freely on a canvas (no walls stored — just table positions).
-- Tables carry a shape, a seat count and an optional merge_group so two small
-- tables can be joined into one bigger logical table (2 + 2 = 4).
-- Reservations gain an optional table_id: a non-null value is a MANUAL
-- assignment made by the restaurateur. Unassigned reservations get an
-- in-memory auto-suggestion in the "service" view (never persisted until the
-- restaurateur confirms by dragging), which is why only manual links live here.
-- Run once in the Supabase SQL editor.

create table if not exists public.floor_rooms (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name          text not null,
  position      int  not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists floor_rooms_restaurant_idx
  on public.floor_rooms (restaurant_id, position);

create table if not exists public.floor_tables (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  room_id       uuid not null references public.floor_rooms(id) on delete cascade,
  label         text not null default '',
  shape         text not null default 'round',   -- round | square | rect
  seats         int  not null default 2,
  x             real not null default 40,
  y             real not null default 40,
  width         real not null default 72,
  height        real not null default 72,
  rotation      real not null default 0,
  merge_group   uuid,                             -- shared id => joined tables act as one
  created_at    timestamptz not null default now()
);

create index if not exists floor_tables_room_idx
  on public.floor_tables (room_id);

-- Manual reservation -> table assignment (nullable; auto-suggestions are computed, not stored).
alter table public.reservations
  add column if not exists table_id uuid references public.floor_tables(id) on delete set null;

-- Same access rule as the other restaurant-scoped tables: the restaurant's
-- owner (profiles.restaurant_id) OR any admin (profiles.is_admin).
alter table public.floor_rooms  enable row level security;
alter table public.floor_tables enable row level security;

drop policy if exists "floor_rooms_access" on public.floor_rooms;
create policy "floor_rooms_access"
  on public.floor_rooms
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

drop policy if exists "floor_tables_access" on public.floor_tables;
create policy "floor_tables_access"
  on public.floor_tables
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
