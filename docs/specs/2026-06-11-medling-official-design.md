# MedLing Official — Design Spec ("Lột Xác")

> Approved by Ralph 2026-06-11 (all options A). Source-of-truth for the 6-wave build.
> Inputs: MEDLING_INDEX, roadmap, master strategy, decision log D1–D26, agent tree v2
> (claude.ai session 2026-06-09), brand DNA session (2026-06-10), Hybrid Landing doc.

## Goal

Transform the validated PB demo (med-eng-pb) into the official **MedLing** product:
new brand identity, upgraded UX, novel features (ladder tiers 1–2 live + tier-3 scaffold),
Supabase backend with soft freemium gate, Stage 1A content pipeline, build-in-public landing.

## Ratified scope decisions (this session)

| # | Decision | Choice |
|---|---|---|
| S1 | Official home | New repo `medling`; med-eng-pb frozen as pilot (→ proposed D27) |
| S2 | Brand | Keep DNA (Explorer→Caregiver→Sage, earthy→forest); 3 visual variants to choose from |
| S3 | Features | Tier 1–2 live (branching dialogue, smart translation/anatomy breakdown, notebook, PWA+FSRS); Tier 3 AI Roleplay scaffolded behind feature flag OFF (D23-compliant) |
| S4 | Backend | Full Phase 1: Supabase schema + auth + soft gate |
| S5 | Git | Build local first; Ralph creates GitHub repo at push time (Gate 5) |

## Architecture

```
medling/                      (public repo, GitHub Pages → Cloudflare later)
├── index.html                landing dashboard (Wave C)
├── app/                      player: index.html shell + engine modules (Wave B)
├── lessons/                  flat-schema JSON + index.json (CI rebuilds index)
├── audio/                    pre-generated MP3 (edge-tts CI)
├── data/morphology.json      Greek/Latin roots DB for anatomy breakdown
├── brand/                    tokens.css + logo SVG (Wave A output)
├── scripts/                  generate_audio_v2.py · build.js
├── supabase/migrations/      SQL + RLS (Wave D)
├── docs/                     specs · governance · reports
└── .claude/                  agents (tree v2) + skills (medling-*)
```

Run modes preserved: hosted (`/app/?lesson=<id>`) + standalone (`build.js`).
Engine: vanilla, modularized when >1000 lines (D20). Framework question = D26,
ratified only after branching-dialogue renderer experience.

## Waves & acceptance criteria

- **Wave 0 — Foundation**: repo + import verified (DONE: 4×HTTP 200, PB1 renders);
  agents + skills + CLAUDE.md + governance docs + reports #1–2. ✔ when committed.
- **Wave A — Brand**: 3 visual concepts (bold-organic / quiet-luxury / field-notes) on the
  locked DNA, real screen mockups rendered inline; Ralph picks → `brand/tokens.css`,
  logo SVGs (ligature M–L primary, root-canopy hero, heartbeat-vine motion), design-system skill filled.
- **Wave B — Engine v2**: modules split; restyle to chosen brand; `dialogue` section type
  (branching, deterministic, $0); morpheme popup (vocab tap → VI meaning + root/prefix/suffix);
  contextual notebook (1-tap save → IndexedDB); PWA (manifest + SW, offline shell);
  FSRS via ts-fsrs (vendored) for review scheduling; AI-roleplay scaffold (scenario schema,
  UI shell, prompt templates, `FEATURE_ROLEPLAY=false`). ✔ when PB1–PB4 fully replay
  (reference: 42 screen states) + new sections render in a test lesson.
- **Wave C — Landing**: per Hybrid doc IA (hero/pillars/live progress tree/feature ladder/
  roadmap/tech transparency/CTA) restyled to brand. ✔ responsive + links to app.
- **Wave D — Backend**: migrations (profiles, progress, notebook, access_keys, devices),
  RLS policies, auth adapter (`app/engine/auth.js`), soft gate UI at 1A-06 (intent metric only).
  Gate 5: Ralph creates Supabase project; until then code is complete + mocked.
- **Wave E — Stage 1A content**: extraction (Chabner ch.1–4 + Sổ Tay PDFs on Drive) →
  Gate 1 → author 1A-01, 1A-02 → **Gate 2 Ralph sign-off** → scale 1A-03…10.
  Audio after GitHub push (CI). ✔ when lessons pass Gate 2.
- **Wave F — Ship**: Gate 3 full test matrix; Ralph creates repo + push; Pages on;
  CI audio green; Drive governance docs synced; final report.

## Risks / mitigations
- **Audio CI offline until push** → PB1–4 MP3s already exist; Stage 1A audio gated on push (flagged early).
- **Branching dialogue state pain in vanilla** → that's the D26 experiment; report honestly.
- **Supabase free tier pauses after 1w inactivity** → documented in supabase/README; keep-alive ping noted.
- **edge-tts ToS fragility (D22)** → MP3s are durable assets; licensed-TTS fallback documented for premium.
- **Morphology data accuracy** → standard Greek/Latin morphemes (general linguistic knowledge),
  cross-checked by fidelity-qa agent; flagged items go to Ralph with Gate 2 packet.

## Out of scope (this program)
AI roleplay live (needs validation + QA), payment integration (Phase 2, DD9), Platform 2
flashcard app (Phase 4), social content (Phase 3), VND pricing (DD3), IELTS/integrative medicine (never).
