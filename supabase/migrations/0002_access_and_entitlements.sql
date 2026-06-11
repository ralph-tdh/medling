-- MedLing · 0002_access_and_entitlements · per-stage access keys + server-side gate (Wave D)
-- D3: monetize per-stage access keys (no subscription).
-- D21: premium content served server-side via RLS — the CORE security decision.
--      A learner can read a paid lesson's content ONLY if they hold a valid entitlement.
-- This migration models the gate; the soft-gate phase (D32) measures pay-intent BEFORE
-- any paid content exists, so `lesson_content` stays empty/free-only until Phase 2.

-- ─────────────────────────────────────────────────────────────
-- access_keys: redeemable codes granting entitlement to a stage/bundle
-- ─────────────────────────────────────────────────────────────
create table if not exists public.access_keys (
  code        text primary key,             -- printed/sold code
  scope       text not null,                -- e.g. '1A', '1B', 'L1' (=1A+1B), 'L1-L3'
  max_redemptions int not null default 1,
  redeemed_count  int not null default 0,
  created_at  timestamptz not null default now()
);
-- access_keys is admin-managed: NO public RLS policies → default-deny means clients
-- cannot read or write it directly. Redemption happens via the SECURITY DEFINER function below.
alter table public.access_keys enable row level security;

-- ─────────────────────────────────────────────────────────────
-- entitlements: which scopes a user has unlocked
-- ─────────────────────────────────────────────────────────────
create table if not exists public.entitlements (
  user_id    uuid not null references auth.users(id) on delete cascade,
  scope      text not null,
  granted_at timestamptz not null default now(),
  source     text not null default 'key',   -- 'key' | 'comp' | 'purchase'
  primary key (user_id, scope)
);

alter table public.entitlements enable row level security;
drop policy if exists "entitlements_select_own" on public.entitlements;
create policy "entitlements_select_own" on public.entitlements
  for select using (auth.uid() = user_id);
-- NO insert/update/delete policy: entitlements are written only by the redeem function
-- (SECURITY DEFINER), never directly by clients. Default-deny blocks tampering.

-- redeem an access key → grant entitlement (atomic, server-side)
create or replace function public.redeem_access_key(p_code text)
returns table(scope text) language plpgsql security definer set search_path = public as $$
declare v_scope text; v_max int; v_count int;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select ak.scope, ak.max_redemptions, ak.redeemed_count
    into v_scope, v_max, v_count
    from public.access_keys ak where ak.code = p_code for update;

  if v_scope is null then raise exception 'invalid code'; end if;
  if v_count >= v_max then raise exception 'code exhausted'; end if;

  insert into public.entitlements(user_id, scope, source)
  values (auth.uid(), v_scope, 'key')
  on conflict (user_id, scope) do nothing;

  update public.access_keys set redeemed_count = redeemed_count + 1 where code = p_code;

  return query select v_scope;
end; $$;

-- ─────────────────────────────────────────────────────────────
-- lesson_content: server-held bodies for PAID lessons (D21 enforcement point)
-- Free lessons (PB, 1A-01..05) stay as public JSON files in the repo.
-- Paid lesson bodies live HERE and are readable only with a matching entitlement.
-- Empty during the soft-gate phase (D32) — populated when Phase 2 paid content ships.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.lesson_content (
  lesson_id  text primary key,
  scope      text not null,                 -- entitlement scope required, e.g. '1B'
  body       jsonb not null,                -- the full flat-schema lesson JSON
  updated_at timestamptz not null default now()
);

alter table public.lesson_content enable row level security;

-- The whole point of D21: read access requires a matching entitlement row.
drop policy if exists "lesson_content_entitled" on public.lesson_content;
create policy "lesson_content_entitled" on public.lesson_content
  for select using (
    exists (
      select 1 from public.entitlements e
      where e.user_id = auth.uid() and e.scope = lesson_content.scope
    )
  );
-- no insert/update/delete policies → content is admin-managed out-of-band.

-- ─────────────────────────────────────────────────────────────
-- pay_intent: SOFT GATE telemetry (D32). Records that a user hit the gate and
-- what they chose — measures willingness to pay BEFORE building paid content.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.pay_intent (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete set null,
  gate_id    text not null,                 -- e.g. '1A-06-softgate'
  action     text not null,                 -- 'viewed' | 'interested' | 'dismissed' | 'left_email'
  meta       jsonb,
  created_at timestamptz not null default now()
);

alter table public.pay_intent enable row level security;
-- A user may insert their own intent events; nobody reads via client (analytics is server-side).
drop policy if exists "pay_intent_insert_own" on public.pay_intent;
create policy "pay_intent_insert_own" on public.pay_intent
  for insert with check (auth.uid() = user_id or user_id is null);
