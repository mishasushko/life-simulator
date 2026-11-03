/* Офлайн-режим: сначала сеть, при её отсутствии — кэш */
const CACHE = 'lifesim-v19';
const ASSETS = ['./', 'index.html', 'style.css?v=19', 'data.js?v=19', 'news.js?v=19', 'game.js?v=19', 'extras.js?v=19', 'features.js?v=19', 'story.js?v=19', 'avatar.js?v=19', 'history.js?v=19', 'countries.js?v=19', 'careers.js?v=19', 'modes.js?v=19', 'meta.js?v=19', 'fun.js?v=19', 'life.js?v=19', 'careers2.js?v=19', 'deep.js?v=19', 'progression.js?v=19', 'relationships.js?v=19', 'narrative.js?v=19', 'i18n.js?v=19', 'en-data.js?v=19', 'uk-data.js?v=19', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'vendor/d3.min.js', 'vendor/topojson-client.min.js', 'vendor/countries-110m.json'];
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

