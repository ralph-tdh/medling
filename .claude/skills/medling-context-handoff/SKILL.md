---
name: medling-context-handoff
description: Restore or save MedLing project context. Use at the START of a session to load the project spine, or at the END to update the governance docs (INDEX, decision log, handoff). The agent team has no shared memory — these docs ARE the memory.
---

# MedLing Context Handoff

## Session START (restore context — non-negotiable SOP)
1. Read `docs/governance/MEDLING_INDEX.md` (the map + current statuses).
2. Read `CLAUDE.md` (constitution: 5 gates, guardrails, conventions).
3. Open only the 1–3 files the current task needs (anti token-overload). Full strategy docs live in
   the Drive folder "MedLing Strategy 2026" — fetch only what's needed.

## Session END (save context)
Update the spine to match reality (verify against the repo, don't write from memory):
- `MEDLING_INDEX.md` — flip statuses (○→◐→✓), keep it small.
- `decision_log.md` — append any new decision as 🟡 (only Ralph ratifies → 🔒); NEVER renumber.
- `handoff.md` — current state, next steps, pending human gates.
- Drop a wave report in `docs/reports/` when a wave completes.

## Discipline
- D-numbers immutable + chronological (audit trail).
- File-split: content ~150 lines/8k chars at unit boundaries; strategy docs ≤300–400 lines.
- Drive ↔ repo: repo is the working source during a build; sync governance docs to Drive at Wave F
  (or when Ralph asks). Don't let the two silently diverge.
