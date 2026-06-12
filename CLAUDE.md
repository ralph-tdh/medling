# MedLing — Build Constitution

MedLing teaches **English to Vietnamese healthcare workers** using content extracted from published textbooks.
It does NOT teach medicine. Solo founder: Ralph (MD + ESP teacher, non-technical). AI agents are force
multipliers, not colleagues — they propose, Ralph decides.

## Language norms
- Strategy discussion & reports to Ralph: **Vietnamese** (casual register).
- Code, schema, commit messages, technical artifacts: **English**.
- Every learner-facing deliverable is **bilingual EN/VI** (D10).
- "quất" from Ralph = approved, execute without further discussion.

## Architecture (locked decisions — do not relitigate)
- Vanilla HTML/JS + JSON lessons. **No framework migration** unless D26 is ratified by Ralph
  (trigger: branching-dialogue renderer pain in vanilla). No Lovable/Bubble/FlutterFlow pivot (D19).
- Shell + data split: `app/` renders, `lessons/*.json` is content. **Never revert to monolithic HTML** (D13).
- Scale additively, no rewrites; split engine into modules once a file passes ~1000 lines (D20).
- `med-eng-pb` repo = frozen PB pilot. This repo = official build (D27). Do not push changes to med-eng-pb.
- Hosting: GitHub Pages first, Cloudflare Pages cutover later. Repo must stay **public** (free CI audio).

## Content rules (the moat — strictest rules here)
- Lesson content is **extracted/synthesized from source textbooks** (Chabner, Sổ Tay, Glendinning…),
  never invented. Synthesis must not distort: numbers, definitions, morpheme breakdowns are checked
  against source (Source-Fidelity QA, Gates 1–2).
- Flat JSON schema is canonical: `pq_en`, `opts`, `tip_en` live directly on situation objects —
  never nested `practice_q` (D15). IPA without slashes. Exactly one `ok:true` per opts array.
  `gl` gloss on every option.
- **US English primary (D33)**: vocab `ipa` = US, optional `ipa_gb` = GB (add only where they differ);
  spelling-different words add `en_gb` and keep US in `en`. A global US·GB accent toggle (default US)
  swaps displayed vocab IPA/spelling; **audio stays US** in both modes. Prose uses US spelling.
- Audio: edge-tts free voice pool ONLY (10 voices, never `*MultilingualNeural`) (D22).
  Clip naming: `{id}_s{sid}_pt|p{i}|v{i}.mp3`, `{id}_q{i}.mp3`. Voice seeded by section_id.
  New lesson → CI generates MP3s → then set `AUDIO_ENABLED`. Never skip the audio pipeline.
- Clinical calibration: prefer pedagogically safe exemplars (e.g. 37.0°C normal temp, not 37.5°C).

## The 5 gates (pipeline QA — agents run 1,3,4; ONLY Ralph passes 2,5)
1. **Gate 1 — Source-Fidelity QA (agent)**: extraction matches textbook before authoring.
2. **Gate 2 — Fidelity + Linguistic QA (RALPH ONLY)**: every lesson signed off before ship.
3. **Gate 3 — Testing / Learner UAT (agent)**: end-to-end screen-state tests pass.
4. **Gate 4 — Validation Analytics (agent)**: outcomes measured (learn / retain / pay intent).
5. **Gate 5 — Deploy / Schema / Payment (RALPH ONLY)**: anything irreversible — production deploy,
   DB schema change, payment integration, publishing anything externally. Agents prepare the diff/plan,
   Ralph pushes the button.

## Decision protocol
- Decisions get immutable chronological D-numbers — **never renumber** (audit trail).
- Agents may PROPOSE a D-number entry; only Ralph ratifies. Log in `docs/governance/decision_log.md`.
- Session SOP: read `docs/governance/MEDLING_INDEX.md` first, open only the 1–3 files needed.
- File discipline: content/material files split at ~150 lines / 8k chars at unit boundaries;
  strategy docs cap ~300–400 lines.

## Agent team & skills
- Agent roster + responsibilities: `.claude/agents/` (pipeline tree v2 — 3 tiers, 5 gates).
- Operational skills: `.claude/skills/medling-*`. Lesson authoring, audio, fidelity QA, branching
  dialogue, design system, release gate, context handoff.
- Orchestration: the main Claude session decomposes/routes work and translates specs into
  implementation (absorbs the BA / Spec-to-Prompt role from the tree).

## Freemium (when relevant)
- PB1–PB4 free → Stage 1A lessons 1–5 free → soft gate at 1A-06 (measure pay intent only).
- Real premium MUST be server-side via Supabase RLS (D21) — never client-side hiding of public files.
- Per-stage access keys, no subscription (D3).
