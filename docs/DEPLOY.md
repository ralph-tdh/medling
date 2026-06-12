# MedLing — Deploy Runbook (Gate 5 — Ralph executes)

> Everything here is **irreversible / outward-facing** → Gate 5: only Ralph runs these.
> The repo is built and committed locally. These are the click-by-click steps to ship it.

## A. Create the GitHub repo + push (~3 min)

1. Go to <https://github.com/new>.
   - **Name:** `medling`
   - **Visibility:** **Public** (required — free GitHub Actions audio + free Pages).
   - **Do NOT** add README/.gitignore/license (the repo already has them).
   - Click **Create repository**.
2. Back in this folder, connect and push (paste into the terminal):
   ```bash
   cd "C:/Users/nguye/Claude/Projects/Medling/medling"
   git remote add origin https://github.com/ralph-tdh/medling.git
   git branch -M main
   git push -u origin main
   ```
   (If `gh` CLI is installed and logged in, `gh repo create ralph-tdh/medling --public --source=. --push` does both steps.)

## B. Turn on GitHub Pages (~1 min)

1. Repo → **Settings → Pages**.
2. **Source:** Deploy from a branch → Branch **main** → folder **/(root)** → **Save**.
3. After ~1 min the site is live at `https://ralph-tdh.github.io/medling/`:
   - Landing: `/medling/`
   - Lesson player: `/medling/app/?lesson=pb1`
   - **Note:** PWA `scope` is `../` so the service worker covers the whole repo subpath — works on Pages.

## C. Audio CI for new lessons (automatic, but know the flow)

- The workflow `.github/workflows/generate_audio.yml` runs on push when `lessons/*.json` or the
  audio script changes. It generates MP3s with edge-tts and commits them back `[skip ci]`.
- PB1–PB4 MP3s already exist in the repo — they ship immediately, no CI needed.
- **For Stage 1A (after Gate 2 sign-off):** once you approve the drafts and I move them into
  `lessons/`, the next push triggers CI → MP3s appear under `audio/1a-XX/` → then set
  `AUDIO_ENABLED` for those lessons and push again.

## D. Supabase project (Wave D — only when you're ready to measure pay intent)

Code is complete and mocked; the app runs fully without it. To activate the soft gate + sync:
1. Create a project at <https://supabase.com/dashboard> (free tier).
2. Run the migrations in `supabase/migrations/*.sql` (SQL Editor, in order). RLS is in the files.
3. Copy your Project URL + anon key into the app config as described in `supabase/README.md`
   (set `window.MEDLING_SUPABASE`). The anon key is public by design; **never** put the service key
   in the repo.
4. Free tier pauses after ~1 week idle — `supabase/README.md` notes a keep-alive option.

## E. Cloudflare Pages cutover (later — lower latency in Vietnam)

When ready to move off GitHub Pages: connect the repo in Cloudflare Pages, build command = none
(static), output dir = `/`. Point the custom domain there. GitHub stays as the source of truth + CI.

## What stays Ralph's call (do NOT let an agent do these)
Creating the repo, pushing, enabling Pages, creating the Supabase project, any schema change,
any payment integration, and approving lessons at Gate 2. Agents prepare; you push the button.
