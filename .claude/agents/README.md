# MedLing Agent Team (pipeline tree v2)

AI agents are force multipliers, not staff. They **propose**; Ralph **decides**. The structure is a
production pipeline with QA gates — not a corporate org chart. (Rationale: agents have no ego or
accountability but do have context limits + error propagation, so gates + human-in-the-loop matter
more than a reporting tree.)

## Tier 0 — CEO
**Ralph** — sole real authority + accountability. Passes Gate 2 and Gate 5 personally.

## Cross-cutting (serve the whole team)
- `context-steward` — maintains the governance spine (= the team's shared memory).
- `legal-compliance` — TTS ToS, disclaimers, privacy/PII, copyright posture.

## Tier 1 — Orchestrator leads (audit output; not bosses)
- `academic-lead` (moat — staffed deepest) · `product-lead` (owns final spec) ·
  `tech-lead` (thin by design). Growth/Finance leads deferred (Phase 2/3).

## Tier 2 — Worker agents (run the pipeline)
- **Academic lane**: `demand-rnd` → `textbook-extractor` → **Gate 1** `fidelity-qa` →
  `lesson-author` → **Gate 2 (Ralph)** → `assessment-designer`.
- **Product lane**: `ux-researcher` → (`product-lead` consolidates spec) ; `brand-designer`.
- **Tech lane**: `ba-spec-to-prompt` → `frontend-dev` / `backend-dev` / `devops` →
  **Gate 3** `testing-uat` → **Gate 4** `validation-analytics` → **Gate 5 (Ralph)**.

## The 5 gates
1 Source-fidelity (agent) · 2 Fidelity+linguistic sign-off (**Ralph**) · 3 Testing/UAT (agent) ·
4 Validation analytics (agent) · 5 Deploy/schema/payment + anything public (**Ralph**).

## Changes from the original uploaded org chart
- Chief×3 "highest authority" → Leads that audit output (no deadlock; authority stays with Ralph).
- "Codebase" → `devops` (real recurring work). BA elevated to highest-leverage tech role.
- Product audit + UX + BA overlap → single `product-lead` spec owner.
- Added the missing functions: fidelity-qa, testing-uat, validation-analytics, context-steward,
  legal-compliance — plus `brand-designer` for the lột-xác.
- Rebalanced: academic (moat) staffed deeper than tech (commodity), per master strategy.

See each `*.md` for the agent's full brief. Note: the main Claude Code session typically plays the
orchestrator + ba-spec-to-prompt role directly; spawn the specialized agents when work is large
enough to isolate or benefits from a focused context.
