---
name: medling-lesson-author
description: Author a MedLing micro-lesson as flat-schema JSON. Use when creating, drafting, or converting a Medical English lesson (PB or Stage 1A+) into the canonical lessons/<id>.json format used by the engine. Knows the FLAT schema, bilingual EN/VI rules, IPA conventions, and the branching-dialogue section type.
---

# MedLing Lesson Author

Produce one playable ~15-min micro-lesson as `lessons/<id>.json`, matching `lessons/pb1.json`.
You synthesize pedagogy from VERIFIED source material — you never invent medical facts.

## Flat schema (canonical — D15, never nest practice_q)

```jsonc
{
  "meta": { "id":"1a-01", "title_en":"", "title_vi":"", "level":1, "stage":"1A",
            "cefr":"A1", "hero_emoji":"🩺", "complete_en":"", "complete_vi":"",
            "tier":"free|premium|soon", "duration":"~15 min" },
  "config": { "next": { "url":"?lesson=1a-02", "label":"", "label_vi":"", "free":true } },
  "welcome": { "scenario":[{"en":"","vi":""}], "can_do":[{"en":"","vi":""}], "badges":[] },
  "situations": [{
    "tag":"", "en_tag":"", "emoji":"", "en":"", "vi":"", "ctx_en":"", "ctx_vi":"",
    "pt":"", "pt_vi":"",
    "phrases":[{"en":"","vi":"","gl":""}],
    "vocab":[{"en":"","ipa":"","vi":""}],
    "pq_en":"", "pq_vi":"",
    "opts":[{"t":"","ok":true,"gl":""},{"t":"","ok":false,"gl":""}],
    "tip_en":"", "tip_vi":""
  }],
  "quiz": [{ "en":"","vi":"","opts":[{"t":"","ok":true,"gl":""}],"exp_en":"","exp_vi":"" }]
}
```

## Hard rules
- IPA **without** slashes. Exactly **one** `ok:true` per opts array. `gl` gloss on **every** option.
- Bilingual EN/VI everywhere (D10). ≤ ~8 new vocab items per situation.
- Pedagogically safe clinical exemplars (37.0°C, not 37.5°C). Ambiguous → leave `// REVIEW:` note.
- Do NOT write audio paths — CI generates MP3s from section_ids. Keep section order stable.
- After writing: add the lesson to the picker via `lessons/index.json` (CI rebuilds it; one entry:
  id, title_en, title_vi, stage, cefr, emoji, duration, tier).

## Branching dialogue (Wave B+ section type)
Add an optional `dialogue` block to a situation: `{ "open":{en,vi,pt}, "turns":[{ "prompt_en/vi",
"choices":[{ "t","gl","feedback_en/vi","next" }] }] }`. Deterministic, no AI — every branch is
authored. Engine renders choices → shows feedback → follows `next`.

## Workflow
1. Take the post-Gate-1 extraction packet (cited material) for the topic.
2. Draft the JSON. Keep a list of every source-derived item (numbers, defs, morphemes) for Gate 2.
3. Validate JSON parses. Hand to `fidelity-qa` for the Gate 2 pre-check, then to Ralph (Gate 2).
