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

## Blocked on Ralph (human gates)
- **Gate 2**: sign off Stage 1A — `docs/reports/2026-06-12-gate2-packet-1a.md`. Then drafts move to `lessons/`.
- **Gate 5**: create GitHub repo `medling` (public) + push + enable Pages — `docs/DEPLOY.md`.
  Supabase project creation when ready to measure pay intent.

## Guardrails (do not violate)
- No monolith revert; shell + JSON only (D13).
- Free edge-tts voice pool only — 10 voices, no `*MultilingualNeural` (D22).
- Never skip audio CI for new lessons.
- Validate with real learners before scaling.
- Premium must be server-side (Supabase RLS) when real (D21); soft gate is for intent measurement only.
- Lesson content = faithful to source textbooks; Gate 2 sign-off by Ralph before ship.
- D26 (framework) is decided by branching-dialogue build experience, not anticipation.

## Human gates pending
- Wave A: brand choice.
- Wave D: Supabase project creation.
- Wave E: Gate 2 sign-off on 1A lessons.
- Wave F: GitHub repo creation + push + Pages enable.
