---
name: medling-release-gate
description: Run the MedLing pre-ship checklist and prepare a Gate 5 hand-off for Ralph. Use before deploying, pushing to GitHub, enabling Pages, changing Supabase schema, or any irreversible/external action. Assembles evidence and the exact buttons Ralph must press.
---

# MedLing Release Gate (Gate 5 prep)

Agents never execute irreversible/external actions. This skill assembles everything so Ralph can
push the button safely.

## Pre-ship checklist (must all pass — show evidence)
- [ ] **Gate 2 signed**: every lesson shipping has Ralph's fidelity sign-off (link the packet).
- [ ] **Gate 3 green**: testing-uat end-to-end matrix PASS, with screenshots + clean console.
- [ ] **Regression**: PB1–PB4 still replay (42-screen baseline) — additive changes only.
- [ ] **Audio**: clips exist or CI will generate them; `AUDIO_ENABLED` set correctly; free voices only.
- [ ] **CI contract**: lessons/ + audio/ paths repo-root-relative; workflow paths match `scripts/`.
- [ ] **Backend (if touched)**: RLS on every table; no service key in repo; fail-closed auth;
      tech-lead APPROVE.
- [ ] **Privacy**: no PII in URLs/logs; disclaimer present; deletion path documented.
- [ ] **Build modes**: hosted + standalone both work.

## Gate 5 hand-off packet (for Ralph)
Produce a short runbook with the EXACT manual steps, e.g.:
1. Create GitHub repo `medling` (public) → copy the remote URL.
2. `git remote add origin <url>` → `git push -u origin master` (commands pre-written here).
3. Settings → Pages → deploy from `main`/root → confirm URL.
4. (Wave D) Create Supabase project → paste anon key into env → run migrations in order.

State what's reversible vs not. Anything publishing externally or moving money is out of agents'
hands entirely — Ralph performs it.
