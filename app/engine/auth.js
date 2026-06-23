/* MedLing · Supabase auth + sync adapter (Wave D).
   Thin wrapper over @supabase/supabase-js (loaded from CDN by the shell when
   config is present). Degrades gracefully to LOCAL-ONLY mode when Supabase isn't
   configured yet — so the whole app works offline / pre-backend (current state).

   Security (D21/D30):
   - Only the ANON key lives here (public by design; RLS does the real protection).
   - The service_role key NEVER appears in the client or repo.
   - Premium lesson bodies are fetched via RLS-protected `lesson_content`; the client
     cannot bypass the gate by editing JS.

   Config: set window.MEDLING_SUPABASE = { url, anonKey } (see supabase/README.md).
   Ralph creates the project (Gate 5) and pastes these two public values. */
'use strict';
window.MedLing = window.MedLing || {};

(function (ML) {
  var cfg = window.MEDLING_SUPABASE || null;
  var sb = null;            // supabase client (when configured)
  var user = null;

  function configured() { return !!(cfg && cfg.url && cfg.anonKey && window.supabase); }

  function client() {
    if (sb) return sb;
    if (!configured()) return null;
    sb = window.supabase.createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
    return sb;
  }

  /* ── device id (anti-share MVP: max 2 devices) ── */
  function deviceId() {
    var k = 'medling_device';
    var id = localStorage.getItem(k);
    if (!id) { id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()); localStorage.setItem(k, id); }
    return id;
  }

  var AUTH = {
    mode: function () { return configured() ? 'cloud' : 'local'; },
    user: function () { return user; },

    init: function () {
      var c = client();
      if (!c) return Promise.resolve({ mode: 'local', user: null });
      return c.auth.getUser().then(function (res) {
        user = (res && res.data && res.data.user) || null;
        c.auth.onAuthStateChange(function (_e, session) { user = session ? session.user : null; });
        return { mode: 'cloud', user: user };
      });
    },

    signInWithEmail: function (email) {
      var c = client();
      if (!c) return Promise.reject(new Error('local-mode'));
      return c.auth.signInWithOtp({ email: email, options: { emailRedirectTo: location.origin + '/app/' } });
    },
    signOut: function () { var c = client(); return c ? c.auth.signOut() : Promise.resolve(); },

    /* progress + notebook sync: cloud when signed in, else no-op (IndexedDB is source) */
    saveProgress: function (lessonId, status, quizScore) {
      var c = client(); if (!c || !user) return Promise.resolve(false);
      return c.from('progress').upsert({
        user_id: user.id, lesson_id: lessonId, status: status, quiz_score: quizScore,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }).then(function (r) { return !r.error; });
    },

    syncNotebook: function (rec) {
      var c = client(); if (!c || !user) return Promise.resolve(false);
      return c.from('notebook').upsert({
        user_id: user.id, term_id: rec.id, en: rec.en, ipa: rec.ipa, vi: rec.vi,
        parts: rec.parts, lesson_id: rec.lesson, saved_at: new Date(rec.savedAt).toISOString()
      }).then(function (r) { return !r.error; });
    },

    registerDevice: function () {
      var c = client(); if (!c || !user) return Promise.resolve({ ok: true, local: true });
      var id = deviceId();
      return c.from('devices').select('device_id').eq('user_id', user.id).then(function (res) {
        var rows = (res && res.data) || [];
        var known = rows.some(function (r) { return r.device_id === id; });
        if (!known && rows.length >= 2) return { ok: false, reason: 'max-devices' };
        return c.from('devices').upsert({ user_id: user.id, device_id: id, last_seen: new Date().toISOString() })
          .then(function () { return { ok: true }; });
      });
    },

    /* entitlement check (D21): does the signed-in user own this scope? */
    hasEntitlement: function (scope) {
      var c = client(); if (!c || !user) return Promise.resolve(false);
      return c.from('entitlements').select('scope').eq('user_id', user.id).eq('scope', scope)
        .then(function (r) { return !!(r.data && r.data.length); });
    },
    redeemKey: function (code) {
      var c = client(); if (!c) return Promise.reject(new Error('local-mode'));
      return c.rpc('redeem_access_key', { p_code: code });
    },

    /* fetch a PAID lesson body (RLS enforces entitlement). Free lessons use the
       repo JSON path instead and never call this. */
    fetchPaidLesson: function (lessonId) {
      var c = client(); if (!c) return Promise.reject(new Error('local-mode'));
      return c.from('lesson_content').select('body').eq('lesson_id', lessonId).single()
        .then(function (r) { if (r.error) throw r.error; return r.data.body; });
    },

    /* soft-gate telemetry (D32): record pay intent */
    logIntent: function (gateId, action, meta) {
      var c = client();
      if (!c) { /* local fallback: stash for later flush */
        try { var k = 'medling_intent'; var a = JSON.parse(localStorage.getItem(k) || '[]');
          a.push({ gateId: gateId, action: action, meta: meta, at: Date.now() }); localStorage.setItem(k, JSON.stringify(a)); } catch (e) {}
        return Promise.resolve(true);
      }
      return c.from('pay_intent').insert({ user_id: user ? user.id : null, gate_id: gateId, action: action, meta: meta || null })
        .then(function (r) { return !r.error; });
    }
  };

  ML.auth = AUTH;
})(window.MedLing);
