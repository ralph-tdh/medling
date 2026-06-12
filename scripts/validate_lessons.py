#!/usr/bin/env python3
"""Schema-discipline validator for MedLing lesson JSON (CLAUDE.md / D15).
Checks: valid JSON; flat schema; exactly one ok:true per opts; gl on every
option; IPA has no slashes; bilingual fields present; quiz has exps.
Usage: python scripts/validate_lessons.py [glob ...]  (defaults to lessons + _drafts)
Exit 0 = all pass."""
import json, sys, glob, pathlib
try: sys.stdout.reconfigure(encoding="utf-8")
except Exception: pass

def err(p, msg, bag): bag.append(f"  ✗ {msg}")

def check_opts(opts, where, bag):
    if not isinstance(opts, list) or not opts:
        err(None, f"{where}: opts missing/empty", bag); return
    oks = [o for o in opts if o.get("ok") is True]
    if len(oks) != 1:
        err(None, f"{where}: expected exactly 1 ok:true, found {len(oks)}", bag)
    for i, o in enumerate(opts):
        if "t" not in o:
            err(None, f"{where}.opt[{i}]: missing 't'", bag)
        if "gl" not in o:
            err(None, f"{where}.opt[{i}] ('{str(o.get('t'))[:24]}'): missing 'gl'", bag)

def check_ipa(vocab, where, bag):
    for i, v in enumerate(vocab or []):
        ipa = v.get("ipa", "")
        if "/" in ipa:
            err(None, f"{where}.vocab[{i}] ('{v.get('en')}'): IPA contains slash", bag)

def validate(path):
    bag = []
    try:
        data = json.loads(pathlib.Path(path).read_text(encoding="utf-8"))
    except Exception as e:
        return [f"  ✗ invalid JSON: {e}"]
    meta = data.get("meta", {})
    # tier is optional in lesson meta — the picker reads it from lessons/index.json
    for f in ("id", "title_en", "title_vi", "stage", "cefr"):
        if f not in meta: err(None, f"meta.{f} missing", bag)
    sits = data.get("situations", [])
    if not sits: err(None, "no situations", bag)
    for si, s in enumerate(sits):
        w = f"sit[{si}]"
        for f in ("en", "vi", "pq_en", "pq_vi", "tip_en", "tip_vi"):
            if f not in s: err(None, f"{w}.{f} missing", bag)
        if "practice_q" in s: err(None, f"{w}: nested practice_q forbidden (flat only)", bag)
        check_opts(s.get("opts"), f"{w}", bag)
        check_ipa(s.get("vocab"), w, bag)
        for pi, ph in enumerate(s.get("phrases", [])):
            if "gl" not in ph: err(None, f"{w}.phrase[{pi}]: missing gl", bag)
    for qi, q in enumerate(data.get("quiz", [])):
        w = f"quiz[{qi}]"
        for f in ("en", "vi", "exp_en", "exp_vi"):
            if f not in q: err(None, f"{w}.{f} missing", bag)
        check_opts(q.get("opts"), w, bag)
    # dialogue (optional)
    dlg = data.get("dialogue")
    if dlg:
        for ti, t in enumerate(dlg.get("turns", [])):
            for ci, c in enumerate(t.get("choices", [])):
                if "ok" not in c: err(None, f"dialogue.turn[{ti}].choice[{ci}]: missing ok", bag)
                if "next" not in c: err(None, f"dialogue.turn[{ti}].choice[{ci}]: missing next", bag)
    return bag

def main():
    pats = sys.argv[1:] or ["lessons/*.json", "lessons/_drafts/*.json"]
    files = []
    for p in pats: files += glob.glob(p)
    files = sorted(set(f for f in files if not f.endswith("index.json") and "roadmap" not in f))
    total_err = 0
    for f in files:
        bag = validate(f)
        if bag:
            total_err += len(bag); print(f"✗ {f}"); print("\n".join(bag))
        else:
            print(f"✓ {pathlib.Path(f).name}")
    print(f"\n{'PASS' if total_err==0 else 'FAIL'} — {len(files)} files, {total_err} issues")
    sys.exit(0 if total_err == 0 else 1)

if __name__ == "__main__":
    main()
