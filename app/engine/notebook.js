/* MedLing · Contextual Notebook (novel feature, bridge P1 → P2).
   One-tap save of a term from its lesson context → IndexedDB.
   Saved items seed FSRS review cards (see fsrs.js) and will later sync to
   Supabase (same backend, D16). Pure client; works offline. */
'use strict';
window.MedLing = window.MedLing || {};

(function (ML) {
  var DB_NAME = 'medling', STORE = 'notebook', VERSION = 1;
  var _db = null;

  function open() {
    if (_db) return Promise.resolve(_db);
    return new Promise(function (resolve, reject) {
      if (!('indexedDB' in window)) { reject(new Error('no-idb')); return; }
      var req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(STORE)) {
          var os = db.createObjectStore(STORE, { keyPath: 'id' });
          os.createIndex('en', 'en', { unique: false });
          os.createIndex('savedAt', 'savedAt', { unique: false });
        }
        /* fsrs.js may add its own store on the same upgrade */
        if (ML._fsrsUpgrade) ML._fsrsUpgrade(db);
      };
      req.onsuccess = function () { _db = req.result; resolve(_db); };
      req.onerror = function () { reject(req.error); };
    });
  }
  ML._idbOpen = open; /* shared opener so fsrs.js reuses the same DB/version */

  function tx(store, mode) {
    return open().then(function (db) { return db.transaction(store, mode).objectStore(store); });
  }

  function save(item) {
    var rec = {
      id: (item.en || '') + '|' + (item.lesson || ''),
      en: item.en || '', ipa: item.ipa || '', vi: item.vi || '',
      parts: item.parts || null, lesson: item.lesson || '',
      savedAt: Date.now()
    };
    return tx(STORE, 'readwrite').then(function (os) {
      return new Promise(function (resolve) {
        var r = os.put(rec);
        r.onsuccess = function () {
          if (ML.fsrs) ML.fsrs.enroll(rec); /* auto-create a review card */
          toast('✓ Đã lưu vào Sổ tay');
          resolve(rec);
        };
        r.onerror = function () { resolve(null); };
      });
    }).catch(function () { toast('Không lưu được (trình duyệt chặn lưu trữ)'); return null; });
  }

  function list() {
    return tx(STORE, 'readonly').then(function (os) {
      return new Promise(function (resolve) {
        var out = [];
        os.openCursor().onsuccess = function (e) {
          var c = e.target.result;
          if (c) { out.push(c.value); c.continue(); }
          else resolve(out.sort(function (a, b) { return b.savedAt - a.savedAt; }));
        };
      });
    }).catch(function () { return []; });
  }

  function remove(id) {
    return tx(STORE, 'readwrite').then(function (os) {
      return new Promise(function (resolve) { os.delete(id).onsuccess = function () { resolve(true); }; });
    }).catch(function () { return false; });
  }

  function toast(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);'
      + 'background:var(--ml-forest);color:var(--ml-cream);font:500 13px/1.4 var(--ml-font-body);'
      + 'padding:11px 18px;border-radius:var(--ml-radius-pill);z-index:1100;box-shadow:var(--ml-shadow-lift);'
      + 'animation:mlToast 2.4s var(--ml-ease) both';
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2400);
  }
  if (!document.getElementById('ml-toast-style')) {
    var st = document.createElement('style');
    st.id = 'ml-toast-style';
    st.textContent = '@keyframes mlToast{0%{opacity:0;transform:translate(-50%,8px)}12%,80%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,8px)}}';
    document.head.appendChild(st);
  }

  ML.notebook = { save: save, list: list, remove: remove };
})(window.MedLing);
