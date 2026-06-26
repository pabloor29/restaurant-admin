-- Review email feature
-- Run once in Supabase SQL editor.

alter table public.restaurants
  add column if not exists google_review_url text,
  add column if not exists review_email_auto boolean not null default false;

alter table public.reservations
  add column if not exists review_email_sent_at timestamptz;

create index if not exists reservations_review_pending_idx
  on public.reservations (restaurant_id, date)
  where review_email_sent_at is null
    and status in ('accepted', 'arrived')
    and email is not null;
