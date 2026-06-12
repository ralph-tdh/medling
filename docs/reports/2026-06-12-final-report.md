# MedLing "Lột Xác" — Final Report (Waves 0–F)

> 2026-06-12 · Claude Code autonomous build · target: official build through end of Stage 3A (L3).

## Outcome
The MedLing official build is **complete and verified locally**, committed on `master`. Two human
gates remain (by design, per the constitution): Ralph's Gate 2 lesson sign-off and Gate 5 deploy.

## What shipped this program

| Wave | Deliverable | Verified |
|---|---|---|
| 0 | Repo `medling`, PB1–PB4 import, 14 agents (tree v2), `medling-*` skills, CLAUDE.md, spec | HTTP 200 × all surfaces; PB1 renders |
| A | Brand **Atelier** (D28): tokens, 4 logos, brand sheet, design-system skill | `/brand/` renders; tokens computed in DOM |
| B | Atelier restyle of player; branching dialogue, morpheme popup, notebook, PWA, FSRS, roleplay scaffold (flag off) | PB1 full play-through; 1a-01 dialogue 2-turn → quiz; console clean |
| C | Build-in-public landing (`index.html`) | renders, links to app |
| D | Supabase migrations + RLS + auth adapter + soft gate (mocked) | code complete; adapter degrades to local-only |
| E | Stage 1A authored (10 lessons); 1B→3A scaffold; validator; Gate 2 packet | validator 14/14 pass; picker shows PB→3A journey |
| F | Full QA, build.js standalone fix, deploy runbook, governance + Drive sync | all JSON valid; standalone renders styled offline |

## Bugs caught & fixed during the build
- **build.js path regression** (Wave 0 reorg moved it to `scripts/` but it read `engine.js` from its
  own dir). Fixed to read `../app/`, now inlines tokens.css + dialogue for a styled offline standalone.
- **engine.js restyle UTF-8 hazard**: first PowerShell pass corrupted Vietnamese/emoji; reverted and
  redid via a UTF-8 Python script with verification (no mojibake, `node --check` clean).

## Honest status notes
- **Stage 1A is authored, not signed.** 10 high-quality drafts pass schema discipline and a
  self-run fidelity pass, but Gate 2 (source-fidelity sign-off) is Ralph's alone — they stay in
  `lessons/_drafts/` until he approves. This is the moat guardrail working as intended, not an omission.
- **1B→3A are scaffolded, not authored.** Per D32/D11, their bodies are deliberately deferred until
  1A is validated with real learners, and will be Supabase-served (D21), not public JSON. The full
  PB→3A journey is visible in the picker as coming-soon tiers.
- **AI Roleplay (tier 3) is scaffolded behind `FEATURE_ROLEPLAY=false`** — built but not live, per D23
  (context before AI roleplay; needs QA before real use).
- **Backend is code-complete but mocked** — runs fully offline; activating it is Gate 5 + a Supabase project.
- **D26 (framework):** branching dialogue stayed manageable in vanilla JS → recommend locking vanilla.
  Logged as a data point; Ralph ratifies.

## Immediate next actions for Ralph
1. Review `docs/reports/2026-06-12-gate2-packet-1a.md` → approve/edit Stage 1A (Gate 2).
2. Follow `docs/DEPLOY.md` → create GitHub repo + push + Pages (Gate 5).
3. (Optional, when ready) create Supabase project to turn on the soft gate.

## New decisions logged
D27 (repo split), D28 (Atelier brand), D32 (scope to 3A via pilot-first), D26 data point (lock vanilla — pending ratify).
