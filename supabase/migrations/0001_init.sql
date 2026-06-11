-- MedLing · 0001_init · core schema + RLS (Wave D)
-- Principle (D21): default-deny RLS on EVERY table; a user touches only their own rows.
-- Premium content access is enforced server-side, never by client-side hiding.
-- Run order: 0001 → 0002. Idempotent where practical.

-- ─────────────────────────────────────────────────────────────
-- profiles: 1:1 with auth.users
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale      text not null default 'vi',
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- progress: per-user, per-lesson state (mirrors client IndexedDB; sync target)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.progress (
  user_id     uuid not null references auth.users(id) on delete cascade,
  lesson_id   text not null,
  status      text not null default 'in_progress'
              check (status in ('in_progress','completed')),
  quiz_score  int,
  completed_at timestamptz,
  updated_at  timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.progress enable row level security;

drop policy if exists "progress_all_own" on public.progress;
create policy "progress_select_own" on public.progress
  for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- notebook: saved terms (Contextual Notebook sync target) + FSRS card state
-- ─────────────────────────────────────────────────────────────
create table if not exists public.notebook (
  user_id    uuid not null references auth.users(id) on delete cascade,
  term_id    text not null,                 -- "{en}|{lesson}"
  en         text not null,
  ipa        text,
  vi         text,
  parts      jsonb,                          -- morpheme breakdown
  lesson_id  text,
  -- FSRS card fields (null until first review)
  stability  double precision,
  difficulty double precision,
  reps       int not null default 0,
  lapses     int not null default 0,
  due        timestamptz,
  last_review timestamptz,
  saved_at   timestamptz not null default now(),
  primary key (user_id, term_id)
);

alter table public.notebook enable row level security;

drop policy if exists "notebook_all_own" on public.notebook;
create policy "notebook_select_own" on public.notebook
  for select using (auth.uid() = user_id);
create policy "notebook_insert_own" on public.notebook
  for insert with check (auth.uid() = user_id);
create policy "notebook_update_own" on public.notebook
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notebook_delete_own" on public.notebook
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- devices: enforce max-2-devices anti-sharing (MVP tier)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.devices (
  user_id    uuid not null references auth.users(id) on delete cascade,
  device_id  text not null,                 -- client-generated UUID in localStorage
  label      text,
  last_seen  timestamptz not null default now(),
  primary key (user_id, device_id)
);

alter table public.devices enable row level security;

drop policy if exists "devices_all_own" on public.devices;
create policy "devices_select_own" on public.devices
  for select using (auth.uid() = user_id);
create policy "devices_insert_own" on public.devices
  for insert with check (auth.uid() = user_id);
create policy "devices_update_own" on public.devices
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "devices_delete_own" on public.devices
  for delete using (auth.uid() = user_id);
