-- Table turn duration: how long a party occupies a table.
-- Used by the floor plan to free a table for a later seating. With a 120-minute
-- turn, a table booked at 19:00 is considered free again from 21:00 — two
-- reservations on the same table only conflict when their start times are less
-- than table_turn_minutes apart.
-- Run once in the Supabase SQL editor.

-- Turn duration can differ between lunch and dinner.
alter table public.restaurants
  add column if not exists table_turn_midi int not null default 120;
alter table public.restaurants
  add column if not exists table_turn_soir int not null default 120;
