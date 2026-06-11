---
name: medling-branching-dialogue
description: Design and implement scripted branching clinical dialogues for MedLing lessons — the deterministic, no-AI, $0 "context" feature tier (D23). Use when adding a branching-dialogue section to a lesson or building/extending the engine renderer for it.
---

# MedLing Branching Dialogue

The "context" tier of the feature ladder (D23): clinical roleplay feel with ZERO AI, zero API cost,
zero hallucination — every path is authored. Build this BEFORE any live AI roleplay.

## Data shape (additive section type; old lessons ignore it)
```jsonc
"dialogue": {
  "role_learner": "You are the doctor",            // EN/VI framing
  "role_learner_vi": "Bạn là bác sĩ",
  "open": { "speaker":"patient", "en":"", "vi":"", "pt":true },   // pt: has audio clip
  "turns": [{
    "id": "t1",
    "prompt_en": "What do you say?", "prompt_vi": "Bạn nói gì?",
    "choices": [
      { "t":"", "gl":"", "quality":"good|ok|poor",
        "feedback_en":"", "feedback_vi":"", "next":"t2" },
      { "t":"", "gl":"", "quality":"poor", "feedback_en":"", "feedback_vi":"", "next":"t1" }
    ]
  }],
  "close": { "en":"", "vi":"" }
}
```

## Authoring rules
- Every choice has a `gl` gloss, bilingual `feedback`, and an explicit `next` (turn id or `close`).
- Exactly one terminal `close`. No dead ends — every `next` resolves.
- `quality` drives feedback tone + optional scoring; "poor" may loop back to retry the same turn.
- Clinically faithful (Gate 1/2 still apply); pedagogically safe exemplars.
- Audio: reuse the clip convention — patient turns can carry `pt:true`; CI generates the clip.

## Engine (Wave B — `app/engine/dialogue.js`)
Deterministic state machine: render `open` → current turn prompt + choices → on choice, show
feedback + advance to `next` → repeat until `close`. Keep dialogue state isolated from quiz/FSRS
state (clean listeners, no cross-talk). This module is the D26 stress test — if vanilla state
management gets painful here, report it honestly; that's the data point for the framework decision.
