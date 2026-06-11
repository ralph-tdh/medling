---
name: medling-design-system
description: Apply the MedLing brand and design system to any artifact (app, landing, lesson UI, certificates, social templates). Use when styling components, choosing colors/type, or keeping visuals on-brand. References brand/tokens.css. Fully populated in Wave A once the visual direction is chosen.
---

# MedLing Design System

> Status: skeleton (Wave 0). Tokens + final visual direction land in **Wave A**; this skill is
> filled out then. The Brand DNA below is LOCKED.

## Brand DNA (locked)
- **Archetypes**: Explorer (front — daring, organic) · Caregiver (heart — safe, non-judgmental) ·
  Sage (backbone — credible, doctor-made; never the front).
- **Palette**: earthy → forest gradient. NOT hospital blue/white. Maps to learner journey + levels.
- **Logo**: monogram M. Primary = ligature M–L; hero = root-canopy M; motion = heartbeat-vine M.
- **Voice**: "Rooted in medicine. Growing in English." / "Find the words you already carry." /
  "Khám phá tiếng Anh y khoa từ gốc rễ."

## How to use (once tokens exist)
- Reference CSS custom properties from `brand/tokens.css` — NEVER hardcode hex in components.
- Color ramp stops each have a role (background / surface / primary / accent / forest-deep / ink).
- Typography: heading face, body face, mono face for IPA. Spacing/radius/shadow/motion tokens.
- Light theme is primary (heritage `#FFFCF5`). Every text/bg pair ≥ WCAG AA.
- Map brand colors onto the engine's existing level/stage tokens so restyling is a token swap.

## Wave A deliverables (to be produced)
`brand/tokens.css` · `brand/logo/{ligature,root-canopy,heartbeat-vine,favicon,app-icon}.svg`
(color + mono) · component examples (button, card, pill, progress) · this skill's component recipes.
