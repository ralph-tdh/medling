# MedLing — Project Index (repo mirror)

> Load this FIRST each session, then open only the 1–3 files you need.
> Updated: 2026-06-12 (Waves 0–F complete; D26 ratified vanilla; D33 US/GB accent toggle done; awaiting Gate 2 + Gate 5).

## Project tree (4 branches)

✓ done · ◐ in progress · ○ todo

**MedLing**
- **0 · Governance** — ✓ CLAUDE.md constitution · ✓ decision_log (D1–D32) · ✓ agent team (14 in .claude/agents)
  · ✓ skills (.claude/skills) · ✓ spec `docs/specs/2026-06-11-medling-official-design.md`
- **1 · Content engine** — ✓ PB1–PB4 imported · ✓ morphology DB (`data/morphology.json`) ·
  ✓ Stage 1A authored (10 drafts in `lessons/_drafts/`) + validator · ◐ **Gate 2 sign-off pending**
  (`docs/reports/2026-06-12-gate2-packet-1a.md`) · 1B→3A scaffolded (`lessons/roadmap.json`)
- **2 · Product** — ✓ shell+JSON player (Atelier restyle) · ✓ brand "Atelier" (`brand/`) ·
  ✓ engine v2: branching dialogue + morph popup + notebook + PWA + FSRS + roleplay scaffold (flag OFF)
  + US·GB accent toggle (D33, default US) ·
  ✓ landing (`index.html`) · ✓ Supabase code + soft gate (`supabase/`, mocked until Gate 5)
- **3 · Distribution** — Phase 3, untouched

## Ship state — LIVE (2026-06-13)
Public repo `github.com/ralph-tdh/medling`, branch `main`, live at https://ralph-tdh.github.io/medling/
(Pages from main /root). Gate 2 ✅ (10× 1A signed → `lessons/`) · Gate 5 ✅ (pushed + Pages) ·
audio CI fixed → 376 1A clips live. Local `main` is behind remote by CI commit `f1a4525` — `git pull` first.
Optional next: Supabase project (`docs/DEPLOY.md` §D) · Cloudflare cutover · 1B→3A authoring.

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
