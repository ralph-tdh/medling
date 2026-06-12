# Spec — US/GB accent toggle (US primary)

> Status: approved by Ralph ("quất", 2026-06-12). Scope: Stage 1A + engine/schema/validator.
> Proposes D33. Author: orchestrator + product-lead.

## Problem
Vietnamese healthcare workers overwhelmingly learn **US English**, and MedLing's audio is
already American (voice pool = en-US Michelle/Guy/Jenny + en-CA Liam, per `scripts/generate_audio_v2.py`).
But the authored text was **British**: vocab IPA used GB values (`/ˌkɑːdiˈɒlədʒi/`, non-rhotic `/ɒ/`)
and ~6 word families used GB spelling (anaemia, oedema, diarrhoea, anaesthesia, ischaemia, orthopaedic).
Learners therefore *hear* US but *read* GB — an avoidable mismatch. Ralph wants US/GB kept distinct,
US as default, in a space-efficient layout.

## Decision (proposed D33)
- **US is primary** for all displayed spelling and IPA, matching the existing US audio.
- **GB is a reference**, reachable via a global **accent toggle** (pill `US · GB`, default US),
  sitting next to the existing speed toggle. Flipping swaps the **vocab chip** IPA/spelling only.
- **Audio stays US** in both modes. No GB audio pool is generated (that would reopen D22 and double
  CI/storage — out of scope, YAGNI).
- Prose spellings are normalized to US so the default lesson is internally consistent.

## Data model (lessons JSON)
Per vocab item `{ en, ipa, vi }`:
- `ipa` → **US** transcription (newly authored, rhotic).
- `ipa_gb` → **GB** transcription (= the current `ipa` value, moved).
- For spelling-different words only: `en` → US (e.g. `anemia`), add `en_gb` → GB (`anaemia`).
- Words whose GB == US (most) need no `*_gb` field; the engine falls back to the US value.
- Free-text GB spellings inside `phrases[].en`, `ctx_en`, `pq_en`, dialogue, etc. (~6 occurrences)
  are rewritten to US. The toggle does **not** alter prose — only structured vocab fields.

## Engine (`app/engine.js`)
- Module state `accent` ∈ {`'us'`,`'gb'`}, default `'us'`, persisted in `localStorage['medling.accent']`.
- Helpers `vIpa(v)` → `accent==='gb' && v.ipa_gb ? v.ipa_gb : v.ipa`; `vEn(v)` likewise for `en`/`en_gb`.
- Wire helpers into the three render paths that show IPA/word:
  1. Vocab chips (the `s.vocab.map` block).
  2. Flashcard front (`S.fcFlipped` branch).
  3. Revision quiz generation (`word`, `ipa`, `exp_en`, `exp_vi`).
- Add a pill toggle button beside `#speed-toggle`; `onclick` flips `accent`, writes localStorage, re-renders.
- Audio (`speakWith`/`clipPath`) is **untouched** — always the US clip. `data-w` for TTS fallback uses US `en`.

## Validator (`scripts/validate_lessons.py`)
- Treat `ipa_gb` and `en_gb` as **optional**. If present: must be non-empty strings; `ipa_gb` must not
  contain `/` (same rule as `ipa`). Absence is valid.
- No new required fields → PB1–PB4 and any un-migrated lesson still pass.

## Content scope (this wave)
- **Stage 1A (10 drafts, `lessons/_drafts/1a-01..10.json`)**: add US `ipa`, move GB to `ipa_gb` for every
  vocab item; add `en_gb` + US `en` for the ~6 spelling-different words; normalize prose to US.
- **PB1–PB4**: deferred. They keep their current (GB-derived) IPA, shown under both toggle states via
  fallback. Retrofit is a later, low-risk pass once 1A ships.

## Verification
1. `python scripts/validate_lessons.py` → 14/14, 0 issues (schema unbroken, new optional fields accepted).
2. Preview play-through of 1a-01 and 1a-06: toggle defaults US; flipping to GB swaps vocab chip IPA and the
   6 spellings; audio still plays US; flashcard + revision quiz reflect the accent; reload preserves choice.
3. Console clean.

## Gate 2 impact
The newly authored **US IPA** is the most error-prone surface and only Ralph can sign it. The Gate 2 packet
(`docs/reports/2026-06-12-gate2-packet-1a.md`) gains a US column for the spot-check words
(`cardiology` US `/ˌkɑːrdiˈɑːlədʒi/`, `dyspnea` US `/dɪspˈniːə/`, `osteoarthritis` US `/ˌɑːstioʊɑːrˈθraɪtɪs/`),
and item #5 (house style) flips from "British primary" to "US primary, GB as toggle reference".

## Out of scope
GB audio generation; PB1–PB4 retrofit; per-lesson (non-global) accent; any framework change (D26 = vanilla).
