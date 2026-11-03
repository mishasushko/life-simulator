/* Офлайн-режим: сначала сеть, при её отсутствии — кэш */
const CACHE = 'lifesim-v18';
const ASSETS = ['./', 'index.html', 'style.css?v=18', 'data.js?v=18', 'news.js?v=18', 'game.js?v=18', 'extras.js?v=18', 'features.js?v=18', 'story.js?v=18', 'avatar.js?v=18', 'history.js?v=18', 'countries.js?v=18', 'careers.js?v=18', 'modes.js?v=18', 'meta.js?v=18', 'fun.js?v=18', 'life.js?v=18', 'careers2.js?v=18', 'deep.js?v=18', 'progression.js?v=18', 'relationships.js?v=18', 'i18n.js?v=18', 'en-data.js?v=18', 'uk-data.js?v=18', 'manifest.webmanifest',
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

