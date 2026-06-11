# Report #5 — Wave C: Landing Dashboard

> 2026-06-11. Build-in-public landing, root `index.html` (replaced placeholder).

## Delivered
Single-file landing per the Hybrid Landing IA, restyled to Atelier:
- Sticky nav (brand + anchors + "Học thử" CTA; anchors hide on mobile).
- Hero: root-canopy mark, Newsreader headline, bilingual lead + tagline, dual CTA,
  "PHASE 1 · ĐANG XÂY DỰNG CÔNG KHAI" status strip.
- 3 pillars (Accuracy First / Context-Driven / Made to Stick).
- Live progress tree (4 branches with status pills — mirrors the governance tree).
- Feature ladder (3 rungs; tier-3 AI Roleplay shown "Premium · Sắp ra mắt" — matches D29).
- Roadmap (Phase 0–3), tech transparency (4 items), footer CTA + medical disclaimer (EN/VI).

## Verification (preview, evidence)
- Loads at `/`: title correct, hero present, 5 sections, nav CTA. ✓
- Counts: 4 branches, 3 rungs, 4 phases, 4 tech items, 3 app links, roleplay-premium copy,
  disclaimer present. ✓
- Desktop screenshot: hero + pillars render in Atelier (cream, Newsreader, hairlines). ✓
- Mobile (375px): nav collapses to brand + CTA, hero/buttons stack cleanly. ✓

## Note
The PWA service worker (scope `../` = root) cached the old placeholder on first visit;
stale-while-revalidate self-heals on the next load. Cleared during verification. For production
this is acceptable (fast first paint, fresh on revisit); `CACHE_VERSION` bump forces refresh when
the shell changes shape.
