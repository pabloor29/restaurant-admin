-- Push notifications for new reservation requests
-- Run once in Supabase SQL editor.

create table if not exists public.push_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  endpoint      text not null unique,
  p256dh        text not null,
  auth          text not null,
  user_agent    text,
  created_at    timestamptz not null default now()
);

create index if not exists push_subscriptions_restaurant_idx
  on public.push_subscriptions (restaurant_id);

-- Locked down: only the service-role key (used by the API routes) may read/write.
-- No policies = deny all for anon / authenticated clients.
alter table public.push_subscriptions enable row level security;
