# Report #2 — Skills (Wave 0)

> 2026-06-11. Built the MedLing operational skills in `.claude/skills/`. 7 skills.
> Skills = reusable procedures any agent (or the main session) loads on demand.

## Skills created

| Skill | Triggers on | What it encodes |
|---|---|---|
| `medling-lesson-author` | creating/drafting/converting a lesson | Full FLAT JSON schema (D15), bilingual EN/VI rules, IPA-no-slashes, one-ok-per-opts, ≤8 vocab/section, branching-dialogue section shape, index.json step. |
| `medling-audio-pipeline` | adding audio, editing the generator/workflow, "no sound" | CI contract, clip-naming convention, **free 10-voice pool** (never MultilingualNeural), new-lesson workflow, official-layout paths (`scripts/`, `../audio/`), troubleshooting. |
| `medling-fidelity-qa` | checking lesson accuracy vs source | Gate-1/Gate-2 mechanical checklist (numbers, defs, morphemes, examples, citations, verbatim), PASS/BLOCK + Gate-2 packet, UNVERIFIED rule. |
| `medling-branching-dialogue` | adding/ building branching dialogue | Deterministic data shape, authoring rules (no dead ends, gloss+feedback+next), engine state-machine notes, flagged as the D26 stress test. |
| `medling-design-system` | styling anything on-brand | Locked Brand DNA, token-reference discipline (no hardcoded hex), AA contrast, light-first. **Skeleton — filled in Wave A.** |
| `medling-release-gate` | before deploy/push/schema/publish | Pre-ship checklist (Gates 2/3 + regression + audio + CI + backend + privacy + build modes) and the Gate-5 manual runbook for Ralph. |
| `medling-context-handoff` | session start/end | START SOP (INDEX→CLAUDE.md→1–3 files), END SOP (update INDEX/decision-log/handoff, wave report), D-number immutability, Drive↔repo sync rule. |

## Relationship to existing skills
The Drive/handoff referenced two earlier skills `med-eng-lesson-author` and `med-eng-audio-pipeline`.
These MedLing versions are the official-build successors: same hard rules (flat schema, free voice
pool) but updated for the new repo layout (`app/`, `scripts/`, root `lessons/`+`audio/`) and the new
features (branching dialogue, design tokens). The old skills stay valid for the frozen `med-eng-pb`
pilot; do not edit those.

## Design choices
- Each skill is one `SKILL.md`, concise, with the rules an agent needs inline (no deep reference
  trees yet — added if a skill grows).
- Skills carry the **constitution's hard rules** at point of use, so an agent doing the task can't
  miss them even without reading CLAUDE.md end to end.
- `medling-design-system` is intentionally a skeleton: it can't be finished until Ralph picks the
  Wave A visual direction. It already locks the DNA so nothing drifts.

Files: `.claude/skills/<name>/SKILL.md`.
