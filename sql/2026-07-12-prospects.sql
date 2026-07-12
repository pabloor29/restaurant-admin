-- Prospection RESA : table des prospects (CRM léger, admin uniquement)
-- Run once in Supabase SQL editor.

create table if not exists public.prospects (
  id           text primary key,            -- slug "nom-ville"
  ajoute       date,
  nom          text not null,
  ville        text,
  priorite     text,
  adresse      text,
  tel          text,
  email        text,
  contact      text,
  contexte     text,
  resa         text,
  resa_prix    text,
  site         text,
  site_url     text,
  heberg       text,
  angle        text,
  conf         text,
  objet        text,
  corps        text,
  -- suivi commercial
  statut       text not null default 'a_contacter',  -- a_contacter | contacte | relance | close | refus
  contacte_le  date,
  relance_le   date,
  notes        text not null default '',
  hidden       boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists prospects_ville_idx  on public.prospects (ville);
create index if not exists prospects_statut_idx on public.prospects (statut);
create index if not exists prospects_hidden_idx on public.prospects (hidden);

-- updated_at auto
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists prospects_set_updated_at on public.prospects;
create trigger prospects_set_updated_at
  before update on public.prospects
  for each row execute function public.set_updated_at();

-- RLS : réservé aux administrateurs (profiles.is_admin = true).
-- Le service-role (route API d'ingestion) contourne la RLS.
alter table public.prospects enable row level security;

drop policy if exists "admin manages prospects" on public.prospects;
create policy "admin manages prospects"
  on public.prospects
  for all
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );
