# MedLing — Decision Log (repo mirror)

> Mirror of the Drive decision log + entries from the 2026-06-11 "lột xác" session.
> Immutable chronological D-numbers — never renumber. 🔒 Locked · 🟡 Pending · ⛔ Superseded.
> Drive copy syncs in Wave F.

## D1–D25 (summary — full text on Drive `medling_decision_log.md`)

| # | Decision | Status |
|---|---|---|
| D1 | Curriculum name = "Master Curriculum" | 🔒 |
| D2 | Phase 1 scope = MC L1–L3 | 🔒 |
| D3 | Monetize per-stage access keys, no subscription | 🔒 |
| D4 | Paywall at 50% of Stage 1A (aha moment) | 🔒 |
| D5 | Pre-Beginner: 4 free lessons (PB1–PB4) | 🔒 |
| D6 | HTML interactive MVP first | ⛔ (D13+D19) |
| D7 | Social = Phase 3 | 🔒 |
| D8 | Community after fanpage/channel | 🔒 |
| D9 | Pragmatics add-on late, per pillar | 🔒 |
| D10 | Bilingual EN/VI default for all deliverables | 🔒 |
| D11 | Pilot Stage 1A → validate → scale | 🔒 |
| D12 | PB topics: Hallway, You Already Know, First Clinical Encounter, Vital Signs | 🔒 |
| D13 | Pivot monolith → app shell + JSON | 🔒 |
| D14 | Monolith PB1 V7 / PB2 V2 deprecated read-only | 🔒 |
| D15 | Lesson schema = FLAT (no nested practice_q) | 🔒 |
| D16 | Two platforms = shared core | 🔒 |
| D17 | P1 roadmap additive: PWA → IndexedDB → Supabase → 1A → gate | 🔒 |
| D18 | P2 = Phase 4; gamification only, no blockchain | 🔒 |
| D19 | Stack: vanilla P1, Supabase, Cloudflare Pages; payment deferred | 🔒 |
| D20 | Scale additively; split engine.js >1000 lines | 🔒 |
| D21 | Premium server-side via Supabase RLS; soft gate first | 🟡 |
| D22 | edge-tts for free; licensed TTS fallback for premium/scale | 🟡 |
| D23 | Feature ladder: structured → branching dialogue → AI roleplay; context first | 🟡 |
| D24 | Project name MedLing; repo med-eng-pb keeps name (PB pilot) | 🔒 |
| D25 | Backbone = 4-branch tree, one INDEX, file-split rules | 🔒 |

## D26+ (new)

| # | Decision | Status | Note |
|---|---|---|---|
| D26 | Framework for official build (vanilla vs Svelte vs React) | 🟡 draft | Ratify ONLY after branching-dialogue renderer built in vanilla (Wave B data point). Do not decide by anticipation. |
| D27 | Official build = new public repo `medling` (landing root + `app/` player + content at root); `med-eng-pb` frozen as pilot | 🔒 ratified 2026-06-11 (Ralph, option A) |
| D28 | Brand = locked DNA (Explorer→Caregiver→Sage, earthy→forest, monogram M); visual direction = **Concept 2 "Atelier"** (quiet luxury: Newsreader/Inter, sage–stone–cream, hairline borders) | 🔒 ratified 2026-06-11 |
| D29 | "Lột xác" feature scope: ladder tiers 1–2 live; tier 3 (AI roleplay) scaffolded behind feature flag OFF | 🔒 ratified 2026-06-11 |
| D30 | Backend in scope: Supabase schema + auth + soft gate (full Phase 1); Supabase project creation = Gate 5 (Ralph) | 🔒 ratified 2026-06-11 |
| D31 | Agent team operationalized as Claude Code subagents per tree v2, with adaptations logged in `docs/reports/2026-06-11-wave0-report.md` (BA + Spec-Owner absorbed by orchestrator/product-lead; brand-designer added) | 🔒 ratified 2026-06-11 (plan approval) |
| D32 | Program target extended to **end of Stage 3A** via "dây chuyền + pilot 1A": Stage 1A authored fully through gates now; 1B→3A fully scaffolded (lesson map, extraction backlog, picker tiers, production line) but mass-authored only AFTER 1A Gate-2 sign-off + learner validation (keeps D11). Paid-tier content (1B+) never ships client-side public — Supabase-served per D21. | 🔒 ratified 2026-06-11 |

## Deferred (DD) — unchanged from Drive
DD1 YouTube format (P3) · DD2 funnel direction (P3) · DD3 VND pricing (pre-launch) ·
DD5 MC L4–L5 (P4+) · DD6 gamefi mechanics (P4) · DD7 P2 framework (P4) ·
DD8 social strategy (P3) · DD9 payment provider (P2) · DD10 personal brand vs identity (P3)
