/* Офлайн-режим: сначала сеть, при её отсутствии — кэш */
const CACHE = 'lifesim-v51';
const ASSETS = ['./', 'index.html', 'style.css?v=51', 'data.js?v=41', 'news.js?v=20', 'game.js?v=49', 'extras.js?v=27', 'features.js?v=35', 'story.js?v=37', 'avatar.js?v=20', 'history.js?v=46', 'countries.js?v=21', 'names.js?v=35', 'careers.js?v=35', 'modes.js?v=38', 'meta.js?v=37', 'fun.js?v=46', 'life.js?v=51', 'careers2.js?v=39', 'deep.js?v=41', 'progression.js?v=37', 'relationships.js?v=33', 'narrative.js?v=37', 'visuals.js?v=30', 'online-config.js?v=26', 'online.js?v=44', 'expansion.js?v=50', 'keepsakes.js?v=31', 'intimacy.js?v=32', 'era.js?v=47', 'school.js?v=38', 'sport2.js?v=43', 'everyday.js?v=46', 'menu.js?v=42', 'onboarding.js?v=1', 'anim.js?v=50', 'i18n.js?v=51', 'en-data.js?v=51', 'uk-data.js?v=51', 'es-data.js?v=41', 'de-data.js?v=41', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'vendor/d3.min.js', 'vendor/topojson-client.min.js', 'vendor/countries-110m.json', 'vendor/cshapes.json'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(fetch(req).then((res) => {
    if (res.ok && (new URL(req.url).origin === location.origin || req.url.includes('fonts.g'))) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then((r) => r || caches.match('index.html'))));
});

