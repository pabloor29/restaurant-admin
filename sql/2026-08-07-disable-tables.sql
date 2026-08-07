-- Disable individual tables or whole rooms.
-- A disabled table (or every table of a disabled room) is not offered to
-- reservations: the floor plan greys it out and the availability engine skips
-- its seats. The base layout is kept — disabling is reversible.
-- Run once in the Supabase SQL editor.

alter table public.floor_rooms
  add column if not exists disabled boolean not null default false;

alter table public.floor_tables
  add column if not exists disabled boolean not null default false;
