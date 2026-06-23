/* MedLing · Analytics (funnel telemetry) — Wave: audit P0 / OPS-01.
   The site shipped with NO way to measure the very thing the project calls its
   bottleneck (learner validation). This module fixes that with a privacy-light,
   vendor-neutral event layer that mirrors auth.js: it degrades to a safe no-op
   until configured, so the app keeps working offline / standalone (file://).

   Privacy by design:
   - No cookies, no PII. A random, rotating session id only (localStorage).
   - Honours Do-Not-Track: if DNT=1, events are NEVER sent (debug-logged only).
   - You choose where data goes. Nothing leaves the device until Ralph configures
     a sink (Gate-5 territory: pointing telemetry at an external service is the
     founder's button to press, like the Supabase keys).

   Activate (one line, e.g. in app/index.html before this script, or via console):
     window.MEDLING_ANALYTICS = { mode: 'plausible', domain: 'ralph-tdh.github.io' };
     window.MEDLING_ANALYTICS = { mode: 'beacon', endpoint: 'https://…/collect' };
     window.MEDLING_ANALYTICS = { mode: 'console' };   // local dev / inspection
   Unconfigured → mode 'off' (no-op). Add ?mldebug=1 (or localStorage
   'medling.debug'='1') to console-log + buffer events for inspection without a sink. */
'use strict';
window.MedLing = window.MedLing || {};

(function (ML) {
  var cfg = window.MEDLING_ANALYTICS || null;

  function dnt() {
    var v = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    return v === '1' || v === 'yes';
  }
  function debugOn() {
    try {
      return /(\?|&)mldebug/.test(location.search) || localStorage.getItem('medling.debug') === '1';
    } catch (e) { return false; }
  }
  function mode() { return (cfg && cfg.mode) || 'off'; }

  /* rotating, non-PII session id (resets after ~30 min idle) */
  function sessionId() {
    var k = 'medling.sid', tk = 'medling.sid_t', now = Date.now();
    try {
      var id = localStorage.getItem(k), t = +localStorage.getItem(tk) || 0;
      if (!id || now - t > 30 * 60 * 1000) {
        id = (crypto.randomUUID ? crypto.randomUUID() : String(now) + Math.random().toString(16).slice(2));
        localStorage.setItem(k, id);
      }
      localStorage.setItem(tk, String(now));
      return id;
    } catch (e) { return 'nostorage'; }
  }

  /* stable, non-PII install id (never rotates) — lets pre(form A)/post(form B) and cross-session
     events be joined per-learner for gain/drop-off analysis. Pseudonymous, no name/contact. */
  function installId() {
    var k = 'medling.aid';
    try {
      var id = localStorage.getItem(k);
      if (!id) { id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)); localStorage.setItem(k, id); }
      return id;
    } catch (e) { return 'nostorage'; }
  }

  function lessonId() {
    try { return (window.LESSON && window.LESSON.meta && window.LESSON.meta.id) || null; }
    catch (e) { return null; }
  }
  function accent() {
    try { return localStorage.getItem('medling.accent') === 'gb' ? 'gb' : 'us'; }
    catch (e) { return 'us'; }
  }

  var buffer = [];           // capped ring for ?mldebug inspection
  function remember(rec) { buffer.push(rec); if (buffer.length > 200) buffer.shift(); }

  function send(rec) {
    var m = mode();
    if (m === 'plausible') {
      try {
        var body = JSON.stringify({
          name: rec.e,
          url: location.href,
          domain: (cfg && cfg.domain) || location.hostname,
          props: rec
        });
        var url = (cfg && cfg.endpoint) || 'https://plausible.io/api/event';
        if (navigator.sendBeacon) navigator.sendBeacon(url, body);
        else fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true });
      } catch (e) {}
    } else if (m === 'beacon') {
      try {
        var b = JSON.stringify(rec);
        var ep = cfg && cfg.endpoint;
        if (ep) { if (navigator.sendBeacon) navigator.sendBeacon(ep, b);
          else fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: b, keepalive: true }); }
      } catch (e) {}
    }
    /* 'console' and 'off' send nothing over the wire. */
  }

  /* Public: ML.analytics.track('lesson_start', { … }) */
  function track(event, props) {
    if (!event) return;
    var rec = { e: event, lesson: lessonId(), accent: accent(), aid: installId(), sid: sessionId(), t: Date.now() };
    if (props) for (var k in props) if (Object.prototype.hasOwnProperty.call(props, k)) rec[k] = props[k];

    var dbg = debugOn();
    if (dbg) { remember(rec); try { console.debug('[medling]', event, rec); } catch (e) {} }

    if (dnt()) return;            // respect Do-Not-Track: never transmit
    if (mode() === 'off') return; // unconfigured: no sink
    send(rec);
  }

  ML.analytics = {
    track: track,
    mode: mode,
    events: function () { return buffer.slice(); }   // for ?mldebug inspection
  };
})(window.MedLing);
