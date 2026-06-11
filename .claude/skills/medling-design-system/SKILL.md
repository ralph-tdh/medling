---
name: medling-design-system
description: Apply the MedLing "Atelier" brand system to any artifact (app, landing, lesson UI, certificates, social templates). Use when styling components, choosing colors/typography, or keeping visuals on-brand. References brand/tokens.css — never hardcode hex in components.
---

# MedLing Design System — "Atelier" (D28, ratified 2026-06-11)

Quiet luxury on the locked DNA: Explorer (front) · Caregiver (heart) · Sage (backbone).
Earthy → forest. Hairline borders over shadows. Generous whitespace. Calm motion.

## Source of truth
`brand/tokens.css` — import it; reference `var(--ml-*)` only. **Never hardcode hex in components.**
Logos in `brand/logo/`: `ml-ligature.svg` (primary), `ml-root-canopy.svg` (hero),
`ml-heartbeat-vine.svg` (loaders/motion), `favicon.svg`, `app-icon.svg`.
Live reference sheet: `/brand/` (brand/index.html).

## Palette roles
cream `#FBF9F4` page bg · paper `#FFF` surfaces · linen recessed · line `#EAE4D6` hairlines ·
stone `#C9C2AE` muted · earth `#7A7461` secondary text · sage `#8DA088` accents/eyebrows ·
moss `#4F6B57` PRIMARY · forest `#33473A` strong/headings · ink `#1E2B23` body text.
Semantic stays in-family: ok=moss, err=terracotta `#A3563C` (never alarm red), warn=ochre.
Learner ramp: `--ml-tier-pb` (dry earth) … `--ml-tier-5` (deep canopy) — stage color = journey position.

## Typography
- Display: **Newsreader 500** (lesson titles, headings; opsz auto). Load via Google Fonts.
- Body/UI: **Inter 400/500/600**.
- Mono: **JetBrains Mono** — IPA, tags, code. IPA always mono + earth color (`.ml-ipa`).
- Eyebrows: 11px Inter 500, uppercase, letter-spacing .14em, sage (`.ml-eyebrow`).
- Two weights per family max on a screen. Sentence case; no ALL-CAPS except eyebrows.

## Component recipes (classes in tokens.css)
`.ml-btn-primary` forest bg→moss hover · `.ml-btn-ghost` 1.5px moss outline ·
`.ml-card` paper + hairline + soft shadow · `.ml-pill` outline pill; `--tier` variant = ramp bg ·
`.ml-vocab-chip` sage underline, tap → morpheme popup · `.ml-opt` answer option (ok/no states) ·
`.ml-ipa` mono pronunciation.

## Do / Don't
- DO let whitespace do the layout work; one primary action per screen (anti "um sùm").
- DO use hairline borders (`--ml-border`) for structure; `--ml-shadow-lift` ONLY on popovers/modals.
- DO keep contrast ≥ AA: ink/forest on cream/paper; cream on forest/moss. Never sage as body text.
- DON'T use pure black/white grays — everything is warm (cream/stone/earth family).
- DON'T use bouncy/neo-brutalist effects (thick borders, hard offsets, wobble) — that was the pilot's
  look, retired with D28. Motion = `--ml-ease`, ≤360ms, fade/slide only.
- DON'T introduce new colors. If a need isn't covered, propose a token addition (brand-designer),
  don't inline it.

## Bilingual layout (D10)
EN primary in ink, VI gloss follows in earth (smaller or italic). Never stack two equal-weight
languages — hierarchy: EN reads first, VI supports.
