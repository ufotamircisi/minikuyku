/* ═══════════════════════════════════════════════════════════════
   sw.js  |  Minik Uyku Service Worker v2.0
   Strateji: Cache-First (statik & ses), Network-First (HTML)
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const CACHE_NAME  = 'minikuyku-v2.1';
const AUDIO_CACHE = 'minikuyku-audio-v2.1';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/config.js',
  './js/state.js',
  './js/data.js',
  './js/i18n.js',
  './js/premium.js',
  './js/audio.js',
  './js/tracking.js',
  './js/ui.js',
  './js/app.js',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&family=Quicksand:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== 'minikuyku-v2.1' && k !== 'minikuyku-audio-v2.1').map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ses dosyaları → Cache-First
  if (/\.(mp3|ogg|wav|m4a)$/i.test(url.pathname)) {
    event.respondWith(audioStrategy(event.request));
    return;
  }
  // Fontlar → Cache-First
  if (url.hostname.includes('fonts.g')) {
    event.respondWith(cacheFirst(event.request, CACHE_NAME));
    return;
  }
  // JS / CSS → Cache-First (versiyonlanmış)
  if (/\.(js|css)$/.test(url.pathname) && url.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request, CACHE_NAME));
    return;
  }
  // HTML → Network-First
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(event.request));
    return;
  }
});

async function audioStrategy(request) {
  const cache  = await caches.open(AUDIO_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch { return new Response('Audio unavailable offline', { status: 503 }); }
}

async function cacheFirst(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || new Response('Offline', { status: 503 });
  }
}

self.addEventListener('message', event => {
  if (event.data?.type === 'PRECACHE_AUDIO') {
    caches.open(AUDIO_CACHE).then(cache => {
      (event.data.urls || []).forEach(url => {
        cache.match(url).then(hit => {
          if (!hit) fetch(url).then(r => { if (r.ok) cache.put(url, r); }).catch(() => {});
        });
      });
    });
  }
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
