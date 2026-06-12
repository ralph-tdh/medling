# Gate 2 Packet — Stage 1A (10 lessons) · for Ralph's sign-off

> Gate 2 (CLAUDE.md): **only Ralph** signs lessons before ship. Agents author + run
> Source-Fidelity QA (Gate 1 pre-check). This packet is the focused list so your review is fast.
> Date: 2026-06-12 · Author: lesson-author + fidelity-qa (self-check) · Status: **awaiting sign-off**

## What's in front of you
10 authored drafts in `lessons/_drafts/1a-01..10.json`, all passing the schema validator
(`python scripts/validate_lessons.py` → 14/14, 0 issues). Flat schema, exactly one `ok:true`/opts,
`gl` on every option, IPA without slashes, bilingual throughout. Verified in preview: full
play-through of 1a-01 (4 situations → branching dialogue → quiz), Atelier styling, console clean.

## Lessons & their source anchor (Gate 1 — verify against these)
All morphemes were authored from `data/morphology.json`, itself drawn from standard Greek/Latin
medical word-building (Chabner *Language of Medicine* 12e ch.1–4; Dorland's). **Please confirm
fidelity to the source chapters** — this is the part only you can sign.

| # | id | Topic | Morphemes taught | Source anchor |
|---|------|-------|------------------|----------------|
| 1 | 1a-01 | How Medical Words Are Built | root/prefix/suffix, combining vowel -o- | Chabner ch.1 |
| 2 | 1a-02 | Suffixes That Diagnose | -itis, -osis, -emia, -algia, -megaly | Chabner ch.2 |
| 3 | 1a-03 | Suffixes That Treat & Examine | -ectomy, -otomy, -ostomy, -plasty, -scopy, -gram | Chabner ch.2 |
| 4 | 1a-04 | Prefixes of Position | hypo-, hyper-, peri-, endo-, epi-, sub-, intra-, inter- | Chabner ch.3 |
| 5 | 1a-05 | Prefixes of Number/Speed/Negation | brady-, tachy-, poly-, a-/an-, anti- | Chabner ch.3 |
| 6 | 1a-06 | Cardiovascular Word Family ⟵ **soft gate** | cardi/o, vas/o, angi/o, my/o, recombination | Chabner ch.4 + body systems |
| 7 | 1a-07 | Respiratory Word Family | pneum/o, pulmon/o, thorac/o, bronch/o, -pnea | body systems |
| 8 | 1a-08 | Digestive Word Family | gastr/o, enter/o, hepat/o, two-root words | body systems |
| 9 | 1a-09 | Nerve, Muscle & Bone | neur/o, my/o, oste/o, arthr/o, -algia/-pathy | body systems |
| 10 | 1a-10 | Anatomical Planes & Stage Review | anterior/posterior, superior/inferior, medial/lateral, proximal/distal | Chabner ch.1 |

## Specific items I want your eyes on (fidelity-qa flags)
1. **IPA transcriptions** — authored from general knowledge, not copied from a pronunciation DB.
   Please spot-check the ones learners hear most: `cardiology /ˌkɑːdiˈɒlədʒi/`, `dyspnea /dɪspˈniːə/`,
   `osteoarthritis /ˌɒstiəʊɑːˈθraɪtɪs/`. (Flagging because IPA is the most error-prone field.)
2. **VN medical glosses** — e.g. infarction = "nhồi máu (chết mô)", ischaemia = "thiếu máu cục bộ",
   osteoporosis = "loãng xương". Confirm these are the terms VN HCWs actually use.
3. **Pedagogical simplifications** — 1a-06 calls myocardial infarction "a heart attack" in lay
   dialogue; 1a-03 says angioplasty "widens" a vessel. Accurate enough for A2 learners? Your call.
4. **No clinical over-claim** — dialogues deliberately avoid diagnosis/advice; they model *language*,
   not medical decisions. Please confirm none crosses into giving medical advice.
5. **British spellings** (anaemia, oedema, diarrhoea, haemorrhage) used consistently — matches the
   en-GB voice pool. Confirm this is the house style you want.

## Sign-off options
- **Approve all 10** → I move `_drafts/1a-*.json` to `lessons/`, register in `index.json`
  (CI rebuilds it), push → CI generates audio → set AUDIO_ENABLED. They ship free (D32).
- **Approve with edits** → tell me the items; I revise, re-run the validator, re-submit.
- **Hold N** → I ship the approved ones, keep the rest in `_drafts/`.

## What does NOT need Gate 2 now
1B→3A are **scaffolded only** (lesson map + extraction backlog + picker coming-soon tiers).
Per D32 their bodies will be authored after 1A learner-validation and served from Supabase
`lesson_content` (D21) — never committed as public JSON. No 1B+ lesson bodies exist yet.
