# MedLing — Stage Map 1A → 3A (production line, D32)

> Source: `medling_master_curriculum_v3.jsx` (locked blueprint, copied to this folder from Drive).
> Stage-level facts below are verbatim from MC v3. **Per-lesson topic splits are DRAFT
> allocations** by lesson-author — Ralph confirms/adjusts at each stage kickoff (Gate 2 scope).
> Total 1A→3A: **58 lessons** (10+10+12+12+14).

## Extraction backlog (sources per stage — from medling_resources.md mapping)

| Stage | Primary sources (Drive IDs in medling_resources.md) | Status |
|---|---|---|
| 1A | Chabner ch.1–4 (word structure, suffixes, prefixes, body as a whole) + Sổ Tay (ref) | ○ to extract |
| 1B | Chabner (cont.) + ECM1 early units + Sổ Tay | ○ |
| 2A | Chabner body-system chapters + PEIU Medicine | ○ |
| 2B | PEIU Medicine + ECM2 + UMP HCMC (ref) | ○ |
| 3A | ECM1 later units + PEIU + GESAP (ref) | ○ |

Pipeline per stage (agent tree v2): demand-rnd (confirm topic order) → textbook-extractor
(→ `lessons/_material/`) → **Gate 1** fidelity-qa → lesson-author (JSON drafts in `lessons/_drafts/`)
→ **Gate 2 Ralph** → move to `lessons/` (free) or `lesson_content` table (paid, D21) → CI audio.

## Stage 1A — Medical Vocabulary Foundations (10 bài · FREE 01–05, gate at 06)
MC v3: focus = "Latin/Greek roots, prefixes & suffixes; body systems nomenclature; core medical
word-building". Terms: anatomical planes, body systems, 200 core roots, basic affixes.
Collocations: administer medication · perform an examination · take a history · record findings.
Grammar: simple present/past, passive intro, articles. Checkpoint 25Q ≥70%.

DRAFT lesson split (10):
1. **1a-01 — How Medical Words Are Built** (root + prefix + suffix; combining vowel; cardi/o-logy pattern) — *pilot, authored*
2. **1a-02 — Suffixes That Diagnose** (-itis, -osis, -emia, -algia, -megaly) — *pilot, authored*
3. 1a-03 — Suffixes That Treat & Examine (-ectomy, -otomy, -ostomy, -plasty, -scopy, -gram)
4. 1a-04 — Prefixes of Position (hypo-, hyper-, peri-, endo-, epi-, sub-, intra-, inter-)
5. 1a-05 — Prefixes of Number, Speed & Negation (brady-, tachy-, poly-, a-/an-, anti-)
6. 1a-06 — The Cardiovascular Word Family ← **soft gate (D4/D32)**
7. 1a-07 — The Respiratory Word Family (pneum/o, pulmon/o, thorac/o, -pnea)
8. 1a-08 — The Digestive Word Family (gastr/o, enter/o, hepat/o)
9. 1a-09 — Nerve, Muscle & Bone Families (neur/o, my/o, oste/o, arthr/o)
10. 1a-10 — Anatomical Planes & Directions + Stage Review

## Stage 1B — Basic Clinical Communication (10 bài · PAID → lesson_content)
MC v3 focus: patient–clinician basic interaction; clinical settings vocab; elementary documentation.
Collocations: presents with · complains of · denies · reports · is admitted for.
Grammar: question forms, reported speech intro, frequency adverbs. Checkpoint 25Q ≥70%.
DRAFT arc: greetings & roles → chief complaint → symptom descriptors → vital signs language →
open vs closed questions → clinical settings tour → basic forms → simple SOAP components ×2 → review.

## Stage 2A — Body Systems & Pathology Language (12 bài · PAID)
Focus: system-by-system pathological language; diagnostic reasoning vocab. Collocations:
characterized by · associated with · presents as · results in · is caused by.
Grammar: advanced passive, nominalization, hedging intro. Checkpoint ≥75%.
DRAFT arc: one lesson per major system (cardio, resp, GI, neuro, musculo, renal, endo, heme,
derm, repro) + symptoms-vs-signs + disease-naming conventions.

## Stage 2B — Clinical Documentation Basics (12 bài · PAID)
Focus: records, SOAP, referrals, discharge summaries, abbreviations. Collocations: follow up with ·
referred for · ruled out · consistent with · unremarkable. Grammar: telegraphic style, tense in
documentation. Checkpoint ≥75%.
DRAFT arc: SOAP × 4 (S/O/A/P deep-dives) → abbreviations ×2 → lab language → imaging language →
referral letter ×2 → discharge summary → review.

## Stage 3A — Patient Communication & History Taking (14 bài · PAID)
Focus: full history taking; breaking bad news; patient education; lay↔clinical register.
Terms: lay/clinical pairs, SOCRATES pain descriptors, psychosocial vocab. Collocations:
"what brings you in today" · "walk me through" · "can you describe the pain".
Grammar: hedging, conditionals in advice, empathetic phrasing, tag questions. TBL: simulated-patient
role-play (→ prime use of **branching dialogue** + later AI roleplay). Checkpoint ≥70%.
DRAFT arc: opening the consult → HPI/SOCRATES ×2 → past/family/social Hx → systems review ×2 →
lay-register shifts ×2 → breaking bad news ×2 → patient education ×2 → full OSCE run ×2.

## Rollout rule (D32 — do not violate)
1A ships free after Gate 2 + learner validation. 1B+ are authored next but their bodies go to
Supabase `lesson_content` (D21) — never committed as public JSON.
