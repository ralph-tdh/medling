# MedLing — Official Build

Medical English self-learning platform for Vietnamese healthcare professionals.
Evolved from the [med-eng-pb](https://github.com/ralph-tdh/med-eng-pb) Pre-Beginner pilot (kept intact per D24).

> **Rooted in medicine. Growing in English.**

## Layout

```
medling/
├── index.html        ← landing dashboard (build-in-public)
├── app/              ← lesson player: shell + engine
├── lessons/          ← lesson JSON (flat schema) + index.json
├── audio/            ← pre-generated MP3 (edge-tts, CI-driven)
├── data/             ← morphology DB (Greek/Latin roots) & shared data
├── brand/            ← design tokens + logo SVG
├── scripts/          ← generate_audio_v2.py · build.js
├── supabase/         ← SQL migrations + RLS policies
├── docs/             ← specs · governance · reports
└── .claude/          ← agent team + skills (AI-assisted build system)
```

## Run modes

- **Hosted**: serve repo root → `/?` landing, `/app/?lesson=pb1` player.
  Local: `python -m http.server 8081 --directory .` → `localhost:8081/app/?lesson=pb1`
- **Standalone**: `node scripts/build.js lessons/pb1.json pb1.standalone.html` (offline, file://)

## Governance

All build work follows the 5-gate pipeline in [CLAUDE.md](CLAUDE.md).
Decisions are logged in [docs/governance/decision_log.md](docs/governance/decision_log.md) — immutable D-numbers.
