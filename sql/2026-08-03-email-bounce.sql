-- Email bounce detection
-- Flags a reservation when its confirmation email hard-bounces (invalid /
-- non-existent client mailbox), so the restaurant knows the client received
-- nothing and must be called by phone instead.
-- Run once in Supabase SQL editor.

alter table public.reservations
  add column if not exists confirm_email_id text,
  add column if not exists email_bounced boolean not null default false,
  add column if not exists email_bounced_at timestamptz;

-- The bounce webhook looks up the reservation by the stored Resend message id.
create index if not exists reservations_confirm_email_id_idx
  on public.reservations (confirm_email_id);
