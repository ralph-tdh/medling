# MedLing — Project Index (repo mirror)

> Load this FIRST each session, then open only the 1–3 files you need.
> Updated: 2026-06-11 (Wave 0). Drive copy syncs in Wave F.

## Project tree (4 branches)

✓ done · ◐ in progress · ○ todo

**MedLing**
- **0 · Governance** — ✓ CLAUDE.md constitution · ✓ decision_log (D1–D31) · ✓ agent team (.claude/agents)
  · ✓ skills (.claude/skills) · ✓ spec `docs/specs/2026-06-11-medling-official-design.md`
- **1 · Content engine** — ✓ PB1–PB4 imported · ○ morphology DB · ○ Stage 1A extraction → Gate 1 →
  authoring → Gate 2 → 1A-01…10 (Wave E)
- **2 · Product** — ✓ shell+JSON player at `app/` (paths verified) · ◐ brand (Wave A) ·
  ○ engine v2 modules + dialogue + morph popup + notebook + PWA + FSRS + roleplay scaffold (Wave B) ·
  ○ landing (Wave C) · ○ Supabase + soft gate (Wave D)
- **3 · Distribution** — Phase 3, untouched

## Where things live

| What | Where |
|---|---|
| Build rules & gates | `CLAUDE.md` |
| Design spec (approved) | `docs/specs/2026-06-11-medling-official-design.md` |
| Decisions | `docs/governance/decision_log.md` |
| Session handoff | `docs/governance/handoff.md` |
| Wave reports | `docs/reports/` |
| Agent roster | `.claude/agents/` |
| Skills | `.claude/skills/` |
| Strategy docs (full) | Drive folder "MedLing Strategy 2026" |

## File-split rules (anti token-overload)
Content/material ~150 lines or 8k chars, cut at unit boundaries with FILE markers ·
strategy docs ≤300–400 lines · INDEX stays small · one leaf = one file.
