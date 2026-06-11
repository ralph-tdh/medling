/* MedLing · Smart Translation & Anatomy Breakdown (novel feature, tier 1-2).
   Tap a vocab term → popover with VI meaning + Greek/Latin morpheme decomposition.
   Non-invasive: delegated click on [data-w] elements. Words that don't decompose
   (e.g. full phrases on 🔊 buttons) simply show nothing extra, so phrase audio
   buttons are unaffected. Pure client, $0, deterministic — no AI. */
'use strict';
window.MedLing = window.MedLing || {};

(function (ML) {
  var DB = null, loading = null;

  function load() {
    if (DB) return Promise.resolve(DB);
    if (loading) return loading;
    loading = fetch('../data/morphology.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { DB = j; return j; })
      .catch(function () { return null; });
    return loading;
  }

  /* Greedy decomposition: strip a known suffix, then a known prefix, then match
     the remaining stem (with combining-vowel 'o' tolerance) against roots.
     Returns [] when the word isn't built from known morphemes. */
  function decompose(wordRaw) {
    if (!DB) return [];
    var w = String(wordRaw).toLowerCase().replace(/[^a-z]/g, '');
    if (w.length < 4) return [];
    var parts = [];

    var sfx = longestKey(DB.suffixes, w, 'end');
    var core = w;
    if (sfx) core = w.slice(0, w.length - sfx.length);

    var pfx = longestKey(DB.prefixes, core, 'start');
    if (pfx) core = core.slice(pfx.length);

    core = core.replace(/o$/, ''); /* drop combining vowel: cardio -> cardi */

    var root = null;
    if (core) {
      if (DB.roots[core]) root = core;
      else root = longestKey(DB.roots, core, 'exact-ish');
    }

    /* Need at least a root + (prefix or suffix), else it's not a real medical build */
    if (!root || (!pfx && !sfx)) return [];

    if (pfx)  parts.push(seg('prefix', pfx, DB.prefixes[pfx]));
    parts.push(seg('root', root, DB.roots[root]));
    if (sfx)  parts.push(seg('suffix', sfx, DB.suffixes[sfx]));
    return parts;
  }

  function longestKey(map, str, mode) {
    var best = null;
    for (var k in map) {
      if (!map.hasOwnProperty(k)) continue;
      var hit = mode === 'start' ? str.indexOf(k) === 0
              : mode === 'end'   ? str.lastIndexOf(k) === str.length - k.length
              : str === k || str.indexOf(k) === 0;
      if (hit && (!best || k.length > best.length)) best = k;
    }
    return best;
  }

  function seg(type, text, info) {
    return { type: type, text: text, gloss_en: info.gloss_en, gloss_vi: info.gloss_vi, origin: info.origin };
  }

  var TYPE_COLOR = { prefix: '#A8854B', root: '#4F6B57', suffix: '#A3563C' };
  var TYPE_LABEL = { prefix: 'tiền tố', root: 'gốc từ', suffix: 'hậu tố' };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function closePopover() {
    var el = document.getElementById('ml-morph-pop');
    if (el) el.remove();
    var bd = document.getElementById('ml-morph-backdrop');
    if (bd) bd.remove();
  }

  function showPopover(word, ipa, vi, parts, anchorRect) {
    closePopover();
    var segHtml = parts.map(function (p) {
      var c = TYPE_COLOR[p.type];
      return '<div style="display:flex;align-items:baseline;gap:10px;padding:7px 0;border-bottom:1px solid var(--ml-line)">'
        + '<span style="font:500 14px/1 var(--ml-font-mono);color:' + c + ';min-width:74px">' + esc(p.text) + '-</span>'
        + '<span style="flex:1">'
          + '<span style="font-size:13px;color:var(--ml-ink)">' + esc(p.gloss_en) + '</span>'
          + ' <span style="font-size:12px;color:var(--ml-earth);font-style:italic">· ' + esc(p.gloss_vi) + '</span>'
        + '</span>'
        + '<span style="font:500 9px/1 var(--ml-font-body);letter-spacing:.1em;text-transform:uppercase;color:var(--ml-stone)">'
          + TYPE_LABEL[p.type] + ' · ' + p.origin + '</span>'
      + '</div>';
    }).join('');

    var saveBtn = ML.notebook
      ? '<button id="ml-morph-save" class="ml-btn-ghost" style="margin-top:14px;padding:9px 14px;font-size:13px;width:100%">＋ Lưu vào Sổ tay — Save to Notebook</button>'
      : '';

    var pop = document.createElement('div');
    pop.id = 'ml-morph-pop';
    pop.setAttribute('role', 'dialog');
    pop.style.cssText = 'position:fixed;left:50%;bottom:0;transform:translateX(-50%);'
      + 'width:min(460px,100%);background:var(--ml-paper);border:1px solid var(--ml-line);'
      + 'border-radius:var(--ml-radius-lg) var(--ml-radius-lg) 0 0;box-shadow:var(--ml-shadow-lift);'
      + 'padding:20px 20px 28px;z-index:1000;animation:mlSheetUp .26s var(--ml-ease) both';
    pop.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">'
        + '<div>'
          + '<div style="font:500 22px/1.2 var(--ml-font-display);color:var(--ml-forest)">' + esc(word) + '</div>'
          + (ipa ? '<div class="ml-ipa" style="margin-top:2px">' + esc(ipa) + '</div>' : '')
          + (vi ? '<div style="font-size:13px;color:var(--ml-earth);font-style:italic;margin-top:2px">' + esc(vi) + '</div>' : '')
        + '</div>'
        + '<button id="ml-morph-x" aria-label="Close" style="border:none;background:none;font-size:20px;color:var(--ml-stone);cursor:pointer;line-height:1;padding:4px">✕</button>'
      + '</div>'
      + '<div class="ml-eyebrow" style="margin:14px 0 4px">Bóc tách gốc từ — Word roots</div>'
      + segHtml
      + saveBtn;

    var backdrop = document.createElement('div');
    backdrop.id = 'ml-morph-backdrop';
    backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(30,43,35,.18);z-index:999';
    backdrop.onclick = closePopover;

    document.body.appendChild(backdrop);
    document.body.appendChild(pop);
    document.getElementById('ml-morph-x').onclick = closePopover;
    var sb = document.getElementById('ml-morph-save');
    if (sb) sb.onclick = function () {
      ML.notebook.save({ en: word, ipa: ipa || '', vi: vi || '', parts: parts, lesson: (window.LESSON && window.LESSON.meta && window.LESSON.meta.id) || '' });
      sb.textContent = '✓ Đã lưu — Saved';
      sb.disabled = true;
      sb.style.color = 'var(--ml-moss)';
    };
  }

  /* keyframes (inject once) */
  if (!document.getElementById('ml-morph-style')) {
    var st = document.createElement('style');
    st.id = 'ml-morph-style';
    st.textContent = '@keyframes mlSheetUp{from{transform:translate(-50%,100%)}to{transform:translate(-50%,0)}}';
    document.head.appendChild(st);
  }

  /* Public: try to explain a word; returns true if a popover was shown. */
  ML.morph = {
    load: load,
    decompose: decompose,
    explain: function (word, ipa, vi, rect) {
      return load().then(function () {
        var parts = decompose(word);
        if (!parts.length) return false;
        showPopover(word, ipa, vi, parts, rect);
        return true;
      });
    },
    close: closePopover
  };

  /* Delegated enhancement: long-press / right-click a vocab chip opens the
     breakdown without stealing the normal tap (which plays audio). On touch,
     a 450ms hold triggers it. */
  function attach() {
    var holdTimer = null, held = false;

    function findChip(t) {
      var el = t;
      while (el && el !== document.body) {
        if (el.dataset && el.dataset.w) return el;
        el = el.parentElement;
      }
      return null;
    }
    function tryExplain(chip) {
      var word = chip.dataset.w;
      /* derive ipa/vi from the chip's own text if present */
      var ipa = (chip.querySelector && chip.querySelector('.ml-ipa')) ? chip.querySelector('.ml-ipa').textContent : '';
      return ML.morph.explain(word, ipa, '', chip.getBoundingClientRect());
    }

    document.addEventListener('contextmenu', function (e) {
      var chip = findChip(e.target);
      if (!chip) return;
      tryExplain(chip).then(function (shown) { if (shown) e.preventDefault(); });
    });
    document.addEventListener('touchstart', function (e) {
      var chip = findChip(e.target);
      if (!chip) return;
      held = false;
      holdTimer = setTimeout(function () { held = true; tryExplain(chip); }, 450);
    }, { passive: true });
    document.addEventListener('touchend', function () { clearTimeout(holdTimer); }, { passive: true });
    document.addEventListener('touchmove', function () { clearTimeout(holdTimer); }, { passive: true });
  }

  if (document.readyState !== 'loading') attach();
  else document.addEventListener('DOMContentLoaded', attach);
})(window.MedLing);
