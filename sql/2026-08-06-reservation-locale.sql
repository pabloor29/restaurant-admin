-- Guest language on each reservation.
-- The public booking site stores the language the guest selected so that every
-- follow-up email (the immediate confirmation from the site, and the later
-- confirm/refuse answer sent from RESA) can be written in the guest's language.
-- Run once in Supabase SQL editor. MUST be applied before deploying the site
-- change that writes `locale`, otherwise reservation inserts will fail.

alter table public.reservations
  add column if not exists locale text not null default 'fr';
