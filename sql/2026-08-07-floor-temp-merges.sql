-- Punctual (one-off) table merges made from the SERVICE view.
-- Distinct from the permanent merge stored in floor_tables.merge_group (set in
-- the editor): a temp merge joins tables only for a single date AND service
-- (midi/soir) — e.g. tonight two 2-tops become a 4-top, but the base layout is
-- untouched. Each row lists the physical table ids joined together; overlapping
-- rows are unioned client-side, so a permanent merge + a temp merge combine.
-- Run once in the Supabase SQL editor.

create table if not exists public.floor_temp_merges (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  date          date not null,
  service       text not null,                 -- 'midi' | 'soir'
  time_slot     text not null default '',      -- 'HH:MM' seating; a merge can differ per slot
  kind          text not null default 'merge', -- 'merge' (join) | 'split' (break a permanent merge for this slot)
  table_ids     jsonb not null default '[]'::jsonb,  -- array of floor_tables.id
  created_at    timestamptz not null default now()
);

-- Idempotent: add columns if the table already existed from an earlier run.
alter table public.floor_temp_merges
  add column if not exists kind text not null default 'merge';
alter table public.floor_temp_merges
  add column if not exists time_slot text not null default '';

create index if not exists floor_temp_merges_lookup_idx
  on public.floor_temp_merges (restaurant_id, date, service, time_slot);

-- Same access rule as the other restaurant-scoped tables.
alter table public.floor_temp_merges enable row level security;

drop policy if exists "floor_temp_merges_access" on public.floor_temp_merges;
create policy "floor_temp_merges_access"
  on public.floor_temp_merges
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
