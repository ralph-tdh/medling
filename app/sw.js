/* MedLing service worker — offline-capable shell (Wave B).
   Strategy:
   - App shell + brand assets: cache-first (versioned cache, updated on SW change)
   - Lesson JSON + audio: stale-while-revalidate (works offline after first visit)
   Bump CACHE_VERSION when shell/brand files change shape. */
'use strict';

var CACHE_VERSION = 'medling-v3';
var SHELL = [
  './',
  'engine.js',
  'manifest.webmanifest',
  '../brand/tokens.css',
  '../brand/logo/ml-ligature.svg',
  '../brand/logo/ml-heartbeat-vine.svg',
  '../brand/logo/favicon.svg',
  '../brand/logo/app-icon.svg',
  '../lessons/index.json'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function (c) {
      /* addAll fails atomically if any asset 404s — add individually instead */
      return Promise.all(SHELL.map(function (u) {
        return c.add(u).catch(function () { /* tolerate missing asset */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_VERSION; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return; /* fonts etc. — let browser handle */

  /* stale-while-revalidate for everything same-origin: serve cache fast,
     refresh in background; falls back to cache when offline. */
  e.respondWith(
    caches.open(CACHE_VERSION).then(function (c) {
      return c.match(req, { ignoreSearch: false }).then(function (hit) {
        var refresh = fetch(req).then(function (res) {
          if (res && res.status === 200) c.put(req, res.clone());
          return res;
        }).catch(function () { return hit; });
        return hit || refresh;
      });
    })
  );
});
