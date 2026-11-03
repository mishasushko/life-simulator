/* Офлайн-режим: сначала сеть, при её отсутствии — кэш */
const CACHE = 'lifesim-v26';
const ASSETS = ['./', 'index.html', 'style.css?v=23', 'data.js?v=20', 'news.js?v=20', 'game.js?v=23', 'extras.js?v=20', 'features.js?v=20', 'story.js?v=20', 'avatar.js?v=20', 'history.js?v=20', 'countries.js?v=21', 'careers.js?v=20', 'modes.js?v=20', 'meta.js?v=20', 'fun.js?v=20', 'life.js?v=20', 'careers2.js?v=20', 'deep.js?v=20', 'progression.js?v=23', 'relationships.js?v=20', 'narrative.js?v=20', 'visuals.js?v=23', 'online-config.js?v=26', 'online.js?v=25', 'i18n.js?v=25', 'en-data.js?v=25', 'uk-data.js?v=25', 'manifest.webmanifest',
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

