# Report #3 — Wave A: Brand "Atelier" (D28 ratified)

> 2026-06-11. Ralph chose Concept 2 — Atelier from 3 directions (all on the locked DNA).
> Program scope also extended to end of Stage 3A via D32 (dây chuyền + pilot 1A).

## What shipped
- `brand/tokens.css` — full token set: 10 core colors (cream→ink, all warm/earthy family),
  semantic colors kept in-family (terracotta error, not alarm red), 9-stop learner journey ramp
  (PB dry-earth → L5 deep-canopy) mapped to stages, Newsreader/Inter/JetBrains Mono type stack,
  hairline-border depth system, calm motion curves, component recipes (.ml-btn, .ml-card,
  .ml-pill, .ml-opt, .ml-vocab-chip, .ml-ipa, .ml-eyebrow).
- `brand/logo/` — 5 SVGs: ligature M·L (primary), root-canopy M (hero), heartbeat-vine (motion/
  loaders), favicon, app icon.
- `brand/index.html` — living brand sheet at `/brand/` (logos, palette, ramp, type, components).
- `.claude/skills/medling-design-system/SKILL.md` — filled from skeleton: roles, recipes,
  do/don't (including the explicit retirement of the neo-brutalist pilot look), bilingual layout rule.

## Verification (evidence)
- All 4 logo SVGs load with valid geometry (naturalWidth > 0 via DOM check on /brand/).
- Computed styles confirmed: body bg rgb(251,249,244)=cream ✓, h1 Newsreader + forest ✓,
  primary button forest bg + 10px radius ✓. (Preview screenshot tool timed out — verified via
  DOM/computed-style inspection instead.)

## Decisions logged
- **D28 🔒** Atelier direction ratified (was 🟡).
- **D32 🔒** Scope to end of Stage 3A, validate-gated rollout (1A full now, 1B→3A scaffolded;
  paid content never client-side public).

## Notes
- The journey ramp doubles as the stage color system, replacing the pilot's rainbow STAGE_COLORS —
  Wave B wires it into the engine.
- Wordmark in UI = Newsreader 500 "MedLing" next to the ligature mark (as on the brand sheet);
  no separate wordmark SVG needed yet (YAGNI).
