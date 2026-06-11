# Report #4 — Wave B: Engine v2 + Novel Features

> 2026-06-11. Shipped in 3 commits (restyle/PWA · feature modules · this report).

## Delivered

**Restyle to Atelier (D28)** — `app/index.html` shell rewritten; `app/engine.js` recolored
via a one-shot transform: hard offset-shadows → soft, thick borders → 1px hairlines,
font-weights 700–900 → 600, cool grays → warm neutrals, rainbow gradients → earthy→forest
journey ramp. Color/structure only — zero logic edits. UTF-8 preserved (Vietnamese + emoji intact).

**PWA** — `manifest.webmanifest` (installable, MedLing icon) + `sw.js` (stale-while-revalidate;
shell + lessons + audio cached → works offline after first visit). Registered in shell, hosted-mode only.

**Novel features (tier 1–2 live; tier 3 scaffolded)** — all in `app/engine/`, attached to
`window.MedLing`, loaded via `defer`, progressive-enhancement (no edits to the locked engine flow):
- `morphology.js` + `data/morphology.json` (18 prefixes / 24 roots / 22 suffixes, Gk·La, EN+VI):
  Smart Translation & Anatomy Breakdown. Longest-match decomposition, long-press/right-click popover.
- `notebook.js`: Contextual Notebook (IndexedDB), one-tap save + toast.
- `fsrs.js`: vendored FSRS-4 scheduler (no npm/build step), shares the IndexedDB; notebook saves
  auto-enroll as review cards.
- `dialogue.js`: scripted branching dialogue — deterministic, $0, no AI (D23 "context" tier).
- `roleplay.js`: tier-3 AI roleplay **scaffold** — `FEATURE_ROLEPLAY=false` (D29). Scenario schema,
  system-prompt builder, server-routed adapter (no key in client), renders LOCKED.

## Verification (evidence, via preview harness `app/playground.html`)
- Decomposition: cardiology→cardi+ology, hepatitis→hepat+itis, tachycardia→tachy+cardia;
  "hello"/phrases → empty (so phrase audio buttons never trigger popovers). ✓
- Popover renders with EN/VI gloss + origin tags; Save button present. ✓
- Save → notebook (`hepatitis|viêm gan`) → FSRS auto-enroll (1 card). ✓
- FSRS intervals: new again=1 hard=1 good=3 easy=15d (monotonic); 2nd Good 3→11d (grows). ✓
- Dialogue: choice → branch feedback → advance. ✓
- Roleplay renders LOCKED; `isEnabled()===false`. ✓
- **Regression**: full PB4 replay (welcome→situations learn+practice→quiz→done) + flashcards
  (flip/got-it/again) + revision quiz + complete screen all pass on the restyled engine.
  PB2 audio path resolves `../audio/pb2/...`. Zero console errors. 42-screen baseline preserved. ✓

## D26 data point (framework decision)
D26 said: ratify vanilla-vs-framework only after building the branching-dialogue renderer.
**Finding:** built it in vanilla with **local closure state** (turnId/picks/score/sel) — no globals,
so multiple dialogues can't collide, and the state machine (turn → choice → feedback → next) stayed
small and readable (~190 lines). State management was *not* painful. **Recommendation: keep vanilla
(lock D26→A); do not migrate to Svelte now.** Final ratification is Ralph's. Note: the FSRS review-
session UI and any multi-feature screen that composes dialogue + notebook + audio live at once will
be the next stress test — revisit if that composition gets unwieldy.

## Known follow-ups (honest)
- Branching dialogue + morpheme popover + notebook are **wired and verified in isolation**; hooking a
  `dialogue` section and an inline morpheme affordance into the *main lesson flow* is a small engine
  hook, done when a real lesson (Stage 1A+) uses them — deliberately deferred to avoid touching the
  verified PB flow before content needs it.
- A learner-facing Notebook/Review screen (list saved terms + run an FSRS session) is modeled in
  `fsrs.js`/`notebook.js` but not yet surfaced as a route in the shell — Wave C/E will add the entry.
