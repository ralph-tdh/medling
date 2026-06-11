# MedLing — Handoff

> Context restore for a new session. Updated: 2026-06-11 (Wave 0 done).

## SOP
1. Read `docs/governance/MEDLING_INDEX.md` first.
2. Read `CLAUDE.md` (constitution: gates, guardrails, conventions).
3. Open only what the current wave needs.

## State (2026-06-11)
- ✅ Wave 0: repo `medling` built locally (git, not yet on GitHub — Ralph creates repo at push, Gate 5).
  PB1–PB4 imported & verified (app at `/app/`, lessons+audio at root, CI workflow path-fixed).
  Agents + skills + governance docs committed.
- 🔜 Wave A: 3 brand visual concepts (locked DNA: Explorer→Caregiver→Sage, earthy→forest) → Ralph picks.
- Then B (engine v2) → C (landing) → D (Supabase) → E (Stage 1A) → F (ship).

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
