# Report #6 — Wave D: Supabase Backend + Soft Freemium Gate

> 2026-06-11. Backend code complete; project creation is Gate 5 (Ralph). App runs
> in local-only mode until configured — verified working with NO backend.

## Delivered
- `supabase/migrations/0001_init.sql` — profiles, progress, notebook (+ FSRS fields),
  devices (max-2 anti-share). RLS on every table, default-deny, own-rows-only.
  Auto-profile trigger on signup.
- `supabase/migrations/0002_access_and_entitlements.sql` — access_keys, entitlements,
  **`lesson_content` with RLS that requires a matching entitlement (D21 enforcement point)**,
  `pay_intent` (soft-gate telemetry), `redeem_access_key()` SECURITY DEFINER RPC.
- `app/engine/auth.js` — auth + sync adapter. Anon key only (never service_role).
  Degrades to local mode when `window.MEDLING_SUPABASE` is unset. Methods: init, email OTP,
  saveProgress, syncNotebook, registerDevice, hasEntitlement, redeemKey, fetchPaidLesson, logIntent.
- `app/engine/softgate.js` — soft gate UI at the 1A-06 aha moment; records intent
  (viewed/interested/wants_pricing/dismissed), then lets the learner continue. Not a hard lock.
- `supabase/README.md` — step-by-step Gate 5 runbook for Ralph (create project, run migrations,
  enable email OTP, paste 2 public keys, verify RLS).
- Wired into shell; notebook saves now also cloud-sync when signed in (no-op in local mode).

## Verification (preview, evidence)
- `node --check` passes on auth.js + softgate.js.
- App loads with NO backend configured → `auth.mode() === 'local'`, all features work. ✓
- Soft gate opens, renders Atelier sheet with 3 intent options + continue. ✓
- Local-mode `logIntent` falls back to localStorage stash (no crash when offline). ✓

## Security posture (D21) — the core decision
- Free lessons stay public JSON in the repo (fast, CI-audio).
- Paid lesson bodies will live in `lesson_content`, gated by RLS policy `lesson_content_entitled`:
  a row is returned ONLY if the user has a matching `entitlements` scope. Editing client JS cannot
  bypass it — Postgres refuses the row. Entitlements are written only by the `redeem_access_key`
  SECURITY DEFINER function, never by clients.
- This phase ships **no paid content** (D32): `lesson_content` empty, soft gate measures intent only.
  Hard locking activates in Phase 2 when paid lessons are authored.

## Pending human gate (Gate 5)
Ralph creates the Supabase project + pastes URL/anon key per `supabase/README.md` when ready to
validate pay-intent with real learners. Free tier is sufficient (note: pauses after ~1 week idle).
