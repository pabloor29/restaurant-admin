-- Email bounce detection
-- Flags a reservation when a mail to the client hard-bounces (invalid /
-- non-existent mailbox). The mail that actually bounces is the booking-request
-- confirmation sent by the restaurant's public site: once it hard-bounces
-- Resend suppresses the address, so the later accept/refuse mail is never
-- delivered and never fires its own bounce. The webhook therefore matches the
-- event to the reservation by the client email address.
-- Run once in Supabase SQL editor.

alter table public.reservations
  add column if not exists email_bounced boolean not null default false,
  add column if not exists email_bounced_at timestamptz;

-- The bounce webhook looks up reservations by the client email address.
create index if not exists reservations_email_idx
  on public.reservations (email);
