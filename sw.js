/* Офлайн-режим: сначала сеть, при её отсутствии — кэш */
const CACHE = 'lifesim-v13';
const ASSETS = ['./', 'index.html', 'style.css?v=13', 'data.js?v=13', 'news.js?v=13', 'game.js?v=13', 'extras.js?v=13', 'features.js?v=13', 'story.js?v=13', 'avatar.js?v=13', 'history.js?v=13', 'countries.js?v=13', 'careers.js?v=13', 'modes.js?v=13', 'meta.js?v=13', 'fun.js?v=13', 'life.js?v=13', 'careers2.js?v=13', 'i18n.js?v=13', 'manifest.webmanifest',
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
