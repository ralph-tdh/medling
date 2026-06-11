---
name: medling-fidelity-qa
description: Run a Source-Fidelity QA pass on MedLing lesson material — verify numbers, definitions, morpheme breakdowns, and examples are faithful to the source textbooks. Use at Gate 1 (post-extraction) and as the Gate 2 pre-check (post-authoring), or whenever checking lesson accuracy against sources.
---

# MedLing Source-Fidelity QA

MedLing teaches English to HCWs from published textbooks — it doesn't make clinical judgments.
So the QA question is **"is this faithful to the source?"**, not "is this good medicine?". A correct
source does not save an error introduced during synthesis.

## Checklist (mechanical, item by item)
1. **Numbers** — vital-sign ranges, dosages, lab values match the cited source exactly. Pedagogical
   rounding (37.0 vs 37.5°C) is FLAGGED for Ralph, not silently changed.
2. **Definitions** — term meaning matches source; no drift, no meaning-changing oversimplification.
3. **Morphemes** — root/prefix/suffix splits + glosses correct (cardio-=heart, -ectomy=removal,
   -itis=inflammation). Cross-check Dorland's / standard morphology.
4. **Examples** — clinical example sentences are plausible and meaningful (no authentic-sounding
   nonsense). Audience = HCWs who spot these instantly.
5. **Citations** — every source-derived item traces to a real location; flag uncited claims.
6. **Verbatim copy** — faithful but not wholesale-copied long passages (escalate to legal-compliance).

## Output
A table: `item · lesson location (file:path) · source location (book·ch·page) · issue · severity`.
Verdict: **PASS / BLOCK** (Gate 1) or the focused **Gate 2 packet** (the exact items Ralph must
eyeball). You NEVER sign off — Ralph passes Gate 2. When you can't verify against source, say
**UNVERIFIED** — never assume.
