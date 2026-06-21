#!/usr/bin/env python3
"""Build a Starter-only static deploy (PB1-PB4) into dist-starter/.

PROTECTION MODEL — read this before claiming anything:
  This is "protection by NOT deploying Stage 1A". The public output contains NO
  Stage 1A JSON/audio, so a learner given this build cannot fetch 1A from it. It is
  NOT auth security: PB1-PB4 ARE served publicly (they are the free Starter Pack).
  Do NOT claim absolute privacy. Real per-user gating = Supabase RLS (D21), separate.

Deterministic + idempotent: wipes dist-starter/ first, rebuilds identically each run.
No source files are modified (the root landing CTA is rewritten only in the dist copy).

Usage:
  python scripts/build_starter_deploy.py            # include rewritten root landing
  python scripts/build_starter_deploy.py --no-landing
"""
import json
import os
import shutil
import sys

# Windows consoles default to cp1252; force UTF-8 so output/error text never crashes the build.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist-starter")
STARTER = ["pb1", "pb2", "pb3", "pb4"]   # the 4 Starter Pack lessons (matches survey.js ORDER)


def rel(*p):
    return os.path.join(ROOT, *p)


def dst(*p):
    return os.path.join(DIST, *p)


def copy_tree(src_rel):
    """Copy a whole repo subdirectory into the dist (parents auto-created)."""
    shutil.copytree(rel(*src_rel.split("/")), dst(*src_rel.split("/")))
    print(f"  dir   {src_rel}/")


def copy_file(src_rel, dst_rel=None):
    dst_rel = dst_rel or src_rel
    os.makedirs(os.path.dirname(dst(*dst_rel.split("/"))), exist_ok=True)
    shutil.copy2(rel(*src_rel.split("/")), dst(*dst_rel.split("/")))
    print(f"  file  {src_rel}")


def build_index():
    """Emit dist-starter/lessons/index.json from the 4 PB metas only.
    Same entry schema as generate_audio_v2.rebuild_index() so the picker reads it identically."""
    index = []
    for lid in STARTER:
        with open(rel("lessons", lid + ".json"), encoding="utf-8") as f:
            d = json.load(f)
        m = d["meta"]
        index.append({
            "id":         m["id"],
            "emoji":      m["hero_emoji"],
            "title_en":   m["title_en"],
            "title_vi":   m["title_vi"],
            "stage":      m["stage"],
            "cefr":       m["cefr"],
            "duration":   "~15 min",
            "situations": len(d["situations"]),
            "quiz":       len(d["quiz"]),
            "tier":       "free" if d.get("config", {}).get("next", {}).get("free", True) else "paid",
        })
    os.makedirs(dst("lessons"), exist_ok=True)
    with open(dst("lessons", "index.json"), "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    print(f"  built lessons/index.json ({len(index)} PB entries)")


def copy_landing():
    """Copy root landing index.html, rewriting its CTAs to enter the Starter funnel.
    Rewrite happens ONLY in the dist copy; the source file is untouched."""
    with open(rel("index.html"), encoding="utf-8") as f:
        html = f.read()
    n = html.count('href="app/"')
    html = html.replace('href="app/"', 'href="app/?pack=starter"')
    with open(dst("index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  file  index.html (rewrote {n} CTA -> app/?pack=starter)")


def assert_clean():
    """Deterministic gate: fail the build (exit!=0) if anything 1A leaked or required files are missing."""
    leaks = []
    for base, dirs, files in os.walk(DIST):
        for name in dirs + files:
            low = name.lower()
            if "1a-" in low or low == "roadmap.json":
                leaks.append(os.path.relpath(os.path.join(base, name), DIST))
    if leaks:
        raise SystemExit("FAIL — forbidden (Stage 1A / roadmap) in dist-starter:\n  " + "\n  ".join(sorted(leaks)))

    with open(dst("lessons", "index.json"), encoding="utf-8") as f:
        idx = json.load(f)
    ids = sorted(e["id"] for e in idx)
    if ids != sorted(STARTER) or any(e.get("stage") != "PB" for e in idx):
        raise SystemExit(f"FAIL — index.json must be exactly the 4 PB lessons (stage PB); got {ids}")

    required = ["app/index.html", "app/engine.js", "app/engine/survey.js", "app/sw.js",
                "brand/tokens.css", "data/morphology.json"]
    required += [f"lessons/{i}.json" for i in STARTER]
    for r in required:
        if not os.path.exists(dst(*r.split("/"))):
            raise SystemExit(f"FAIL — missing required file: {r}")
    for i in STARTER:
        adir = dst("audio", i)
        if not (os.path.isdir(adir) and any(fn.endswith(".mp3") for fn in os.listdir(adir))):
            raise SystemExit(f"FAIL — missing audio clips for {i}")
    print("  self-checks PASS (no 1A/roadmap; index=4 PB; required files + audio present)")


def dir_stats(path):
    total = nfiles = 0
    for base, _, files in os.walk(path):
        for fn in files:
            nfiles += 1
            total += os.path.getsize(os.path.join(base, fn))
    return nfiles, total


def main():
    landing = "--no-landing" not in sys.argv

    if os.path.exists(DIST):
        shutil.rmtree(DIST)
    os.makedirs(DIST)
    print("dist-starter/ cleaned\n-- copying --")

    copy_tree("app")                       # engine, engine/*.js, sw.js, manifest (self-contained, no 1A refs)
    copy_tree("brand")                     # tokens.css + logos
    copy_file("data/morphology.json")      # Term Decoder DB (🧩)
    for lid in STARTER:
        copy_file(f"lessons/{lid}.json")
    build_index()
    for lid in STARTER:
        copy_tree(f"audio/{lid}")
    if landing:
        copy_landing()

    with open(dst("README.txt"), "w", encoding="utf-8") as f:
        f.write(
            "MedLing — Starter-only deploy (PB1-PB4)\n"
            "This public build contains NO Stage 1A JSON or audio.\n"
            "Protection model: protection-by-omission (1A is simply not deployed) — NOT auth security.\n"
            "PB1-PB4 are the free Starter Pack and are served publicly by design.\n"
            "Entry point: app/?pack=starter\n"
        )

    print("\n-- verifying --")
    assert_clean()

    nfiles, total = dir_stats(DIST)
    print("\n[OK] dist-starter ready")
    print(f"   {nfiles} files, {total / (1024 * 1024):.1f} MB")
    print("   entry: app/?pack=starter" + ("  (root landing index.html CTA points here)" if landing else ""))
    print("   NOTE: public deploy contains NO Stage 1A — protection-by-omission, not auth.")


if __name__ == "__main__":
    main()
