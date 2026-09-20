/**
 * Service Worker for MyTestStudent Web
 * Cache-First offline caching strategy.
 */

const CACHE_NAME = 'mytest-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './css/components.css',
  './css/responsive.css',
  './js/app.js',
  './js/ui.js',
  './js/question-manager.js',
  './js/scoring.js',
  './js/storage.js',
  './js/importer.js',
  './js/exporter.js',
  './js/localization.js',
  './data/sample-tests/ginekologiya5kurs_sample.json',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Cache-First strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    }).catch(() => {
      // Fallback for HTML documents
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
