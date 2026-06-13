#!/usr/bin/env python3
"""
generate_audio_v2.py — Medical English PocketBook TTS generator
- Engine   : edge-tts (Microsoft Neural TTS, free, no API key)
- Strategy : seeded-random voice per section → stable across re-runs
- Output   : audio/<lesson_id>/*.mp3  (auto-discovered from lessons/)
- Manifest : audio/manifest.json  (clip_id → voice + text, for debugging)
"""

import asyncio
import json
import os
import random
import subprocess
import glob as _glob
import sys

# ─── Auto-install edge-tts if missing ────────────────────────────────────────
try:
    import edge_tts
except ImportError:
    print("📦 edge-tts not found — installing...")
    subprocess.check_call([
        sys.executable, "-m", "pip", "install", "edge-tts",
        "--quiet", "--break-system-packages"
    ])
    import edge_tts

# ─── Voice pool ───────────────────────────────────────────────────────────────
VOICE_POOL = [
    "en-CA-LiamNeural",         # M · Canadian
    "en-US-MichelleNeural",     # F · American
    "en-US-GuyNeural",          # M · American     (replaces RyanMultilingual)
    "en-US-JennyNeural",        # F · American     (replaces LewisMultilingual)
]

def voice_for(section_id: str) -> str:
    """Pick a voice deterministically from the pool, seeded by section_id.
    Same section_id → always same voice, regardless of run order."""
    rng = random.Random(hash(section_id) & 0xFFFFFFFF)
    return rng.choice(VOICE_POOL)


# ─── Clip builders ────────────────────────────────────────────────────────────
def build_clips_from_lesson(lesson_id: str, situations: list, quiz: list) -> list:
    """
    Returns a flat list of dicts:
      { id, text, voice, path }

    Naming convention
    ─────────────────
    pb1_s1_pt      ← patient prompt, situation 1
    pb1_s1_p0      ← phrase 0 of situation 1
    pb1_s1_v0      ← vocab chip 0 of situation 1
    pb1_q0         ← quiz question 0  (quiz gets its own seed: "<id>_quiz")
    """
    clips = []

    for sidx, sit in enumerate(situations):
        sid   = sidx + 1                           # 1-based; matches engine clipPath (S.si+1)
        sec   = f"{lesson_id}_s{sid}"              # seed key
        voice = voice_for(sec)

        # Patient prompt
        pt_text = sit.get("pt", "").strip()
        if pt_text and not pt_text.startswith("("):   # skip stage-direction lines
            clips.append({
                "id"   : f"{sec}_pt",
                "text" : pt_text,
                "voice": voice,
                "path" : f"audio/{lesson_id}/{sec}_pt.mp3",
            })

        # Doctor / staff phrases
        for i, ph in enumerate(sit.get("phrases", [])):
            clips.append({
                "id"   : f"{sec}_p{i}",
                "text" : ph["en"],
                "voice": voice,
                "path" : f"audio/{lesson_id}/{sec}_p{i}.mp3",
            })

        # Vocab chips  (isolated words → same voice, natural for the section)
        for i, vc in enumerate(sit.get("vocab", [])):
            clips.append({
                "id"   : f"{sec}_v{i}",
                "text" : vc["en"],
                "voice": voice,
                "path" : f"audio/{lesson_id}/{sec}_v{i}.mp3",
            })

    # Quiz questions — own seed so voice is independent of any situation
    quiz_voice = voice_for(f"{lesson_id}_quiz")
    for i, q in enumerate(quiz):
        clips.append({
            "id"   : f"{lesson_id}_q{i}",
            "text" : q["en"],
            "voice": quiz_voice,
            "path" : f"audio/{lesson_id}/{lesson_id}_q{i}.mp3",
        })

    return clips



# ─── JSON-driven loader ────────────────────────────────────────────────────────
# Replaces hardcoded load_pbN() functions.
# Adding a new lesson = write lessons/pbN.json + push. No script changes needed.
def load_from_json(path: str) -> tuple[list, list]:
    """Load situations and quiz directly from a lesson JSON file."""
    with open(path, encoding='utf-8') as f:
        d = json.load(f)
    return d["situations"], d["quiz"]


def rebuild_index(lesson_files: list):
    """Rebuild lessons/index.json from all lesson JSON files.
    Derived automatically — never edit index.json by hand."""
    index = []
    for path in lesson_files:
        with open(path, encoding='utf-8') as f:
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
            "tier":       "free" if d.get("config", {}).get("next", {}).get("free", True) else "paid"
        })
    index_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "lessons", "index.json"
    )
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    print(f"\n📋 index.json rebuilt → {len(index)} lesson(s)")


async def generate_clip(clip: dict, overwrite: bool = False) -> bool:
    path = clip["path"]
    if not overwrite and os.path.exists(path):
        print(f"   ⏭  skip   {clip['id']}  (exists)")
        return False

    os.makedirs(os.path.dirname(path), exist_ok=True)
    try:
        communicate = edge_tts.Communicate(clip["text"], clip["voice"])
        await communicate.save(path)
        print(f"   ✅ done   {clip['id']}  [{clip['voice']}]")
        return True
    except Exception as e:
        print(f"   ❌ error  {clip['id']}  → {e}")
        return False


async def run_all(all_clips: list, overwrite: bool = False):
    tasks = [generate_clip(c, overwrite) for c in all_clips]
    results = await asyncio.gather(*tasks)
    generated = sum(1 for r in results if r)
    skipped   = len(results) - generated
    return generated, skipped


# ─── Manifest writer ─────────────────────────────────────────────────────────
def write_manifest(all_clips: list):
    manifest = {
        c["id"]: {"voice": c["voice"], "text": c["text"], "path": c["path"]}
        for c in all_clips
    }
    os.makedirs("audio", exist_ok=True)
    with open("audio/manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"\n📋 Manifest written → audio/manifest.json  ({len(manifest)} entries)")


# ─── Voice preview ────────────────────────────────────────────────────────────
def print_voice_preview(all_clips: list):
    from collections import defaultdict
    by_voice = defaultdict(list)
    for c in all_clips:
        by_voice[c["voice"]].append(c["id"])
    print("\n🎙  Voice assignment preview:")
    for v, ids in sorted(by_voice.items()):
        sections = sorted({i.rsplit("_", 1)[0] for i in ids})
        print(f"   {v:<38} → {', '.join(sections)}")


# ─── GitHub push ─────────────────────────────────────────────────────────────
def maybe_push_github():
    ans = input("\n📤 Push audio/ + manifest to GitHub? [y/N] ").strip().lower()
    if ans != "y":
        print("   Skipped. Run manually when ready.")
        return
    cmds = [
        ["git", "add", "audio/"],
        ["git", "commit", "-m", "feat: add pre-generated multi-voice TTS clips"],
        ["git", "push"],
    ]
    for cmd in cmds:
        print(f"   $ {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"   ⚠️  {result.stderr.strip()}")
            return
    print("   ✅ Pushed to GitHub.")


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    import argparse
    parser = argparse.ArgumentParser(description="Medical English TTS Generator")
    parser.add_argument("--ci", action="store_true",
                        help="Non-interactive mode for GitHub Actions (no prompts)")
    args = parser.parse_args()
    ci = args.ci

    print("=" * 60)
    print("  Medical English — TTS Clip Generator  (multi-voice)")
    if ci:
        print("  Mode: CI (non-interactive, skip-existing)")
    print("=" * 60)

    # Auto-discover lesson files — repo-root lessons/ (this script lives in scripts/).
    # PB stages sort before numbered stages; index.json/roadmap.json are not lessons.
    script_dir   = os.path.dirname(os.path.abspath(__file__))
    repo_root    = os.path.dirname(script_dir)
    lesson_dir   = os.path.join(repo_root, "lessons")
    _SKIP        = {"index.json", "roadmap.json"}
    lesson_files = sorted(
        (f for f in _glob.glob(os.path.join(lesson_dir, "*.json"))
         if os.path.basename(f) not in _SKIP),
        key=lambda f: (0 if os.path.basename(f).startswith("pb") else 1, os.path.basename(f))
    )

    if not lesson_files:
        print("\n❌  No lesson JSON files found in lessons/")
        sys.exit(1)

    print(f"\n🔍  Discovered {len(lesson_files)} lesson(s):")
    for f in lesson_files:
        print(f"     • {os.path.basename(f)}")

    # Build clip lists
    all_clips = []
    for path in lesson_files:
        lesson_id = os.path.splitext(os.path.basename(path))[0]
        sits, quiz = load_from_json(path)
        clips = build_clips_from_lesson(lesson_id, sits, quiz)
        all_clips += clips
        print(f"\n  {lesson_id.upper()}: {len(clips)} clips")

    print(f"\n📦 Total: {len(all_clips)} clips")

    print_voice_preview(all_clips)

    # Overwrite option
    if ci:
        overwrite = False      # CI: always skip existing clips
    else:
        overwrite_ans = input("\n♻️  Overwrite existing MP3s? [y/N] ").strip().lower()
        overwrite = overwrite_ans == "y"

    # Generate
    print(f"\n🔊 Generating clips (overwrite={overwrite})...\n")
    generated, skipped = asyncio.run(run_all(all_clips, overwrite=overwrite))

    print(f"\n{'='*60}")
    print(f"  Done.  Generated: {generated}  |  Skipped: {skipped}")
    print(f"{'='*60}")

    write_manifest(all_clips)
    rebuild_index(lesson_files)

    if not ci:
        maybe_push_github()


if __name__ == "__main__":
    main()
