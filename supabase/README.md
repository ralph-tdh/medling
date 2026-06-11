# MedLing — Supabase Setup Runbook (Gate 5 · Ralph performs)

Backend code (migrations + RLS + client adapter) is complete. Creating the project and
pasting public keys is a **Gate 5** action only Ralph does. Until then, the app runs in
**local-only mode** (IndexedDB) and everything works offline — no backend required to develop or demo.

## What's built (no action needed)
- `migrations/0001_init.sql` — profiles, progress, notebook, devices + RLS (default-deny, own-rows-only) + auto-profile trigger.
- `migrations/0002_access_and_entitlements.sql` — access_keys, entitlements, **lesson_content (D21 server-side gate)**, pay_intent (soft-gate telemetry), `redeem_access_key()` RPC.
- `app/engine/auth.js` — auth + sync adapter (degrades to local mode if unconfigured).
- `app/engine/softgate.js` — soft gate UI (measures pay intent, doesn't hard-lock).

## Steps (≈10 min, when ready to validate pay-intent with real users)

1. **Create project** → https://supabase.com → New project. Region: Singapore (closest to VN).
   Save the DB password somewhere safe.
2. **Run migrations** → SQL Editor → paste `0001_init.sql`, Run → paste `0002_access_and_entitlements.sql`, Run.
   (Or `supabase db push` if you install the CLI.)
3. **Enable email auth** → Authentication → Providers → Email → enable "Email OTP" (magic link).
   Add `https://<your-pages-domain>/app/` and `http://localhost:8081/app/` to redirect URLs.
4. **Get the two PUBLIC keys** → Project Settings → API → copy `Project URL` and `anon public` key.
   ⚠️ NEVER copy the `service_role` key into the app or repo — it bypasses RLS.
5. **Wire the client** → in `app/index.html` (and landing if needed), before the engine modules, add:
   ```html
   <script>window.MEDLING_SUPABASE = { url: "https://xxxx.supabase.co", anonKey: "eyJ..." };</script>
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```
   Then `MedLing.auth.init()` switches from local to cloud automatically.
6. **Verify RLS** → in SQL Editor as an anon role, confirm `select * from progress` returns nothing
   without a matching `auth.uid()`. RLS is the real lock — test it before trusting it.

## Free-tier note (master strategy)
Supabase free tier **pauses after ~1 week of inactivity**. For a live app keep it warm (a daily
cron ping) or upgrade to Pro ($25/mo). Fine for the validation phase as-is.

## The gate model (why it's safe)
- Free lessons (PB, 1A-01..05) = public JSON in the repo — fast, CI-audio, no auth.
- Paid lessons (1B+) = bodies in `lesson_content`, readable ONLY with a matching `entitlements` row
  (RLS policy `lesson_content_entitled`). Editing client JS can't bypass it — the DB refuses the row.
- This phase ships **no paid content**; `lesson_content` stays empty and the soft gate only records
  intent. Real locking activates in Phase 2 when paid lessons are authored into `lesson_content`.
