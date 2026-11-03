/* Офлайн-режим: сначала сеть, при её отсутствии — кэш */
const CACHE = 'lifesim-v16';
const ASSETS = ['./', 'index.html', 'style.css?v=16', 'data.js?v=16', 'news.js?v=16', 'game.js?v=16', 'extras.js?v=16', 'features.js?v=16', 'story.js?v=16', 'avatar.js?v=16', 'history.js?v=16', 'countries.js?v=16', 'careers.js?v=16', 'modes.js?v=16', 'meta.js?v=16', 'fun.js?v=16', 'life.js?v=16', 'careers2.js?v=16', 'deep.js?v=16', 'i18n.js?v=16', 'en-data.js?v=16', 'uk-data.js?v=16', 'manifest.webmanifest',
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
