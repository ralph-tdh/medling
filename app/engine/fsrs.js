/* MedLing · FSRS spaced-repetition scheduler (novel feature core).
   A compact, self-contained implementation of FSRS v4 (Free Spaced Repetition
   Scheduler) — the open algorithm behind ts-fsrs, better than Anki's SM-2.
   We vendor a minimal version (no build step / npm) rather than reinvent it.

   Card states persist in IndexedDB (same DB as notebook.js, store 'cards').
   ratings: 1=Again 2=Hard 3=Good 4=Easy. Intervals in days. */
'use strict';
window.MedLing = window.MedLing || {};

(function (ML) {
  var STORE = 'cards';
  /* FSRS-4 default weights (w0..w18) from the published optimizer defaults. */
  var W = [0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0234,
           1.616, 0.1544, 1.0824, 1.9813, 0.0953, 0.2975, 2.2042, 0.2407,
           2.9466, 0.5034, 0.6567];
  var DECAY = -0.5, FACTOR = Math.pow(0.9, 1 / DECAY) - 1;
  var REQUEST_R = 0.9; /* target retention */

  function initStab(g)  { return W[g - 1]; }
  function initDiff(g)  { return clamp(W[4] - Math.exp(W[5] * (g - 1)) + 1, 1, 10); }
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

  function retr(t, s) { return Math.pow(1 + FACTOR * t / s, DECAY); }
  function intervalFromStab(s) {
    var i = (s / FACTOR) * (Math.pow(REQUEST_R, 1 / DECAY) - 1);
    return Math.max(1, Math.round(i));
  }
  function nextDiff(d, g) {
    var d2 = d - W[6] * (g - 3);
    var dmean = W[4] - Math.exp(W[5] * (4 - 1)) + 1; /* target toward easy-init */
    return clamp(W[7] * dmean + (1 - W[7]) * d2, 1, 10);
  }
  function nextStabRecall(d, s, r, g) {
    var hard = g === 2 ? W[15] : 1, easy = g === 4 ? W[16] : 1;
    return s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9])
      * (Math.exp((1 - r) * W[10]) - 1) * hard * easy);
  }
  function nextStabForget(d, s, r) {
    return W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp((1 - r) * W[14]);
  }

  /* Pure scheduler: given a card (or null for new) + rating + now(ms) → new card. */
  function schedule(card, g, now) {
    now = now || Date.now();
    var DAY = 86400000;
    if (!card || card.reps === 0 || !card.stability) {
      var s0 = initStab(g), d0 = initDiff(g);
      return finalize({ reps: 1, lapses: 0, stability: s0, difficulty: d0 }, s0, now, DAY);
    }
    var elapsedDays = Math.max(0, (now - card.lastReview) / DAY);
    var r = retr(elapsedDays, card.stability);
    var d = nextDiff(card.difficulty, g);
    var s, lapses = card.lapses;
    if (g === 1) { s = nextStabForget(card.difficulty, card.stability, r); lapses++; }
    else { s = nextStabRecall(d, card.stability, r, g); }
    return finalize({ reps: card.reps + 1, lapses: lapses, stability: s, difficulty: d }, s, now, DAY);
  }
  function finalize(base, s, now, DAY) {
    var ivl = intervalFromStab(s);
    base.lastReview = now;
    base.due = now + ivl * DAY;
    base.interval = ivl;
    return base;
  }

  /* ── persistence (shares notebook's IndexedDB) ── */
  ML._fsrsUpgrade = function (db) {
    if (!db.objectStoreNames.contains(STORE)) {
      var os = db.createObjectStore(STORE, { keyPath: 'id' });
      os.createIndex('due', 'due', { unique: false });
    }
  };
  function store(mode) {
    return ML._idbOpen().then(function (db) { return db.transaction(STORE, mode).objectStore(STORE); });
  }

  function enroll(item) {
    return store('readwrite').then(function (os) {
      return new Promise(function (resolve) {
        var g = os.get(item.id);
        g.onsuccess = function () {
          if (g.result) { resolve(g.result); return; } /* already enrolled */
          var card = { id: item.id, en: item.en, ipa: item.ipa, vi: item.vi,
            reps: 0, lapses: 0, stability: 0, difficulty: 0,
            due: Date.now(), interval: 0, lastReview: 0 };
          os.put(card).onsuccess = function () { resolve(card); };
        };
      });
    }).catch(function () { return null; });
  }

  function review(id, rating) {
    return store('readwrite').then(function (os) {
      return new Promise(function (resolve) {
        var g = os.get(id);
        g.onsuccess = function () {
          var updated = schedule(g.result, rating);
          updated.id = id; updated.en = g.result.en; updated.ipa = g.result.ipa; updated.vi = g.result.vi;
          os.put(updated).onsuccess = function () { resolve(updated); };
        };
      });
    });
  }

  function due(now) {
    now = now || Date.now();
    return store('readonly').then(function (os) {
      return new Promise(function (resolve) {
        var out = [];
        os.openCursor().onsuccess = function (e) {
          var c = e.target.result;
          if (c) { if (c.value.due <= now) out.push(c.value); c.continue(); }
          else resolve(out.sort(function (a, b) { return a.due - b.due; }));
        };
      });
    }).catch(function () { return []; });
  }

  ML.fsrs = { schedule: schedule, enroll: enroll, review: review, due: due, W: W };
})(window.MedLing);
