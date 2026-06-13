# MedLing — Handoff

> Context restore for a new session. Updated: 2026-06-11 (Wave 0 done).

## SOP
1. Read `docs/governance/MEDLING_INDEX.md` first.
2. Read `CLAUDE.md` (constitution: gates, guardrails, conventions).
3. Open only what the current wave needs.

## State (2026-06-12 — Waves 0–F complete)
- ✅ Wave 0: repo built locally, PB1–PB4 imported, 14 agents + skills + CLAUDE.md + spec.
- ✅ Wave A: brand "Atelier" chosen (D28) — `brand/tokens.css`, logos, design-system skill.
- ✅ Wave B: Atelier restyle of shell+engine; branching dialogue, morpheme popup, notebook (IndexedDB),
  PWA (manifest+sw), FSRS (ts-fsrs vendored), AI-roleplay scaffold (FEATURE_ROLEPLAY off). D26 data point
  logged (recommend lock vanilla — dialogue state stayed manageable).
- ✅ Wave C: build-in-public landing (`index.html`).
- ✅ Wave D: Supabase migrations + RLS + auth adapter + soft gate (code complete, mocked until Gate 5).
- ✅ Wave E: Stage 1A authored — 10 drafts in `lessons/_drafts/1a-01..10.json`, validator 14/14 pass.
  1B→3A scaffolded (roadmap + picker coming-soon). **Gate 2 packet awaiting Ralph** (D32).
- ✅ Wave F: full QA (HTTP/JSON/regression all green), build.js standalone regression fixed,
  deploy runbook (`docs/DEPLOY.md`).
- ✅ Post-F (2026-06-12): D26 ratified (vanilla). **D33 US/GB accent toggle** — engine `vIpa`/`vEn`
  + US·GB pill (default US, persisted), validator accepts `ipa_gb`/`en_gb`, 10× 1A drafts re-authored
  US-primary (GB retained). Verified in preview. Spec `docs/specs/2026-06-12-us-gb-accent-toggle-design.md`.
- ✅ **SHIPPED 2026-06-13**: Gate 2 (Ralph signed all 10 → moved to `lessons/`, registered in `index.json`)
  and Gate 5 (repo `ralph-tdh/medling` public, pushed, Pages live at https://ralph-tdh.github.io/medling/).
  Audio CI fixed (two Wave-0-reorg path/`sit["id"]` bugs) → 376 1A clips generated and served.

## Both gates cleared — live
- **Gate 2** ✅ signed; lessons in `lessons/`. **Gate 5** ✅ live on Pages (branch `main` /root).
- Note: local `main` is **behind** remote by the CI auto-commit `f1a4525` (MP3s) — `git pull` before next push.
- Optional next: Supabase project (measure pay intent — `docs/DEPLOY.md` §D); Cloudflare cutover; 1B→3A
  authoring after 1A learner validation; PB1–PB4 US-IPA retrofit.

## Guardrails (do not violate)
- No monolith revert; shell + JSON only (D13).
- Free edge-tts voice pool only — 10 voices, no `*MultilingualNeural` (D22).
- Never skip audio CI for new lessons.
- Validate with real learners before scaling.
- Premium must be server-side (Supabase RLS) when real (D21); soft gate is for intent measurement only.
- Lesson content = faithful to source textbooks; Gate 2 sign-off by Ralph before ship.
- US English is primary for spelling + IPA (D33); GB only as accent-toggle reference; audio stays US.
- D26 ratified 2026-06-12: framework = **vanilla** (option A). No framework migration.

## Human gates — status
- Wave A: brand choice ✅. Wave E: Gate 2 sign-off ✅. Wave F: repo + push + Pages ✅.
- Wave D: Supabase project creation — **still optional/pending** (only when measuring pay intent).
