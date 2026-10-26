-- Site tracking — landing page visits + contact-form submissions
-- Goal: know who really connects to the marketing site (resa-service) and who
-- fills the contact form, so genuine leads can be told apart from the bogus
-- submissions that arrive with improbable / non-existent email addresses.
--
-- One row per event:
--   type = 'visit'   -> a real browser loaded the landing page (JS beacon;
--                       bots that don't run JS never reach it).
--   type = 'contact' -> the contact form was submitted. The visitor metadata is
--                       captured server-side, plus a live validity check of the
--                       email address (syntax + MX records of the domain).
--
-- Privacy (RGPD): the full IP address is a personal datum. It is stored here for
-- anti-spam / fraud prevention (legitimate interest). Mention it in the
-- mentions-légales and purge old rows periodically (see the purge helper below).
--
-- Run once in the Supabase SQL editor.

create table if not exists public.site_events (
  id            uuid primary key default gen_random_uuid(),
  type          text not null check (type in ('visit', 'contact')),
  path          text,
  -- Visitor fingerprint (filled from Vercel edge headers + User-Agent).
  ip            text,
  country       text,
  region        text,
  city          text,
  user_agent    text,
  device        text,          -- short human label, e.g. "iPhone · Safari"
  is_bot        boolean not null default false,
  referer       text,
  -- Contact-form payload (null for 'visit' rows).
  name          text,
  email         text,
  restaurant    text,
  message       text,
  email_valid   boolean,       -- null for visits; true/false for contacts
  email_reason  text,          -- why an email was judged invalid (e.g. "no_mx")
  created_at    timestamptz not null default now()
);

create index if not exists site_events_created_idx on public.site_events (created_at desc);
create index if not exists site_events_type_idx    on public.site_events (type, created_at desc);

-- Only admins may read the log; inserts come from the service-role key
-- (API routes), which bypasses RLS, so no insert policy is needed.
alter table public.site_events enable row level security;

drop policy if exists "site_events_admin_read" on public.site_events;
create policy "site_events_admin_read"
  on public.site_events
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Optional retention helper — drop events older than 180 days.
-- Call manually, or schedule with pg_cron:
--   select cron.schedule('purge-site-events', '0 3 * * *',
--     $$ delete from public.site_events where created_at < now() - interval '180 days' $$);
