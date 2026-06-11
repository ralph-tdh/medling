# Report #1 — Agent Team (Wave 0)

> 2026-06-11. Built the MedLing AI agent team as Claude Code subagents in `.claude/agents/`,
> based on the approved pipeline tree v2 (claude.ai session 2026-06-09). 18 agents.

## What was built & why

The original uploaded org chart was a **corporate reporting tree**; the ratified v2 is a
**production pipeline with QA gates + human-in-the-loop**. I implemented v2 as real subagent
definitions (each with a scoped tool set and model tier matched to the job).

| Agent | Tier / lane | Model | Why this exists |
|---|---|---|---|
| `context-steward` | cross-cutting | haiku | Agents share no memory; governance docs ARE the memory. Cheap model — mechanical doc upkeep. |
| `legal-compliance` | cross-cutting | sonnet | edge-tts ToS (D22), disclaimers, PII (Decree 13/2023), copyright posture — nobody owned this. |
| `academic-lead` | orchestrator | opus | Moat lane needs the sharpest auditor before Ralph's Gate 2. |
| `product-lead` | orchestrator | opus | Single spec owner — kills the audit/UX/BA overlap from the original chart. |
| `tech-lead` | orchestrator | opus | Only technical second-pair-of-eyes for a non-technical founder. |
| `demand-rnd` | academic | sonnet | Input demand: what to teach next (≠ validation). |
| `textbook-extractor` | academic | opus | Faithful structured extraction from source PDFs (Drive). |
| `fidelity-qa` | academic (Gate 1) | opus | Highest-leverage QA: catches synthesis distortion. The "clinical accuracy" done right. |
| `lesson-author` | academic | opus | Flat-schema JSON authoring; pedagogy synthesis, not fact invention. |
| `assessment-designer` | academic | sonnet | Quiz + FSRS (ts-fsrs), the retention layer. |
| `ux-researcher` | product | sonnet | Interaction/accessibility research feeding the spec. |
| `brand-designer` | product | opus | **Added** for lột-xác: tokens, logo, design system from locked DNA. |
| `ba-spec-to-prompt` | tech | opus | Elevated: spec→buildable brief, highest-leverage tech role. |
| `frontend-dev` | tech | opus | Vanilla engine/app/features. |
| `backend-dev` | tech | opus | Supabase schema/RLS/auth — flagged high-risk. |
| `devops` | tech | sonnet | Renamed from "Codebase": CI, audio pipeline, deploy, hygiene. |
| `testing-uat` | tech (Gate 3) | sonnet | **Added**: end-to-end + real-learner UAT; nobody owned it. |
| `validation-analytics` | tech (Gate 4) | sonnet | **Added**: output metrics, validate-before-scale. |

## Additions beyond the uploaded chart (with reasons)
- **fidelity-qa, testing-uat, validation-analytics, context-steward, legal-compliance** — the five
  functions the original chart was missing (verify step between extraction↔authoring, end-to-end
  testing, output validation, shared memory, legal). These are the highest-value gaps.
- **brand-designer** — required by the lột-xác brief; not in the original (which had no visual role).
- **Rebalanced** academic deeper than tech (moat > commodity), per master strategy — the original
  had Tech 5 / Academic 3.
- **Renames/merges**: Chief×3 → output-auditing Leads (no deadlock); Codebase → devops; Spec
  Owner/UX/BA overlap → product-lead owns the final spec; BA elevated.

## Model-tier rationale
opus for judgment-heavy work (extraction fidelity, authoring, spec, code, audits); sonnet for
research/ops/testing/analytics; haiku for the mechanical doc-steward. Tool sets are least-privilege
(e.g. QA/research agents are read-only + Drive; only devs get Edit/Bash).

## Note on usage
The main Claude Code session usually acts as orchestrator + ba-spec-to-prompt directly. Spawn the
specialized subagents when a task is large enough to isolate or benefits from a clean focused context
(e.g. a full extraction run, a backend build, an end-to-end test sweep).

Full briefs: `.claude/agents/*.md`. Index: `.claude/agents/README.md`.
