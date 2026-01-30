
// sw.js
const CACHE_NAME = 'static-cache-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/rest2.png',
  '/node_modules/bootstrap/dist/css/bootstrap.min.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // only cache static assets
  if (ASSETS.includes(new URL(event.request.url).pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
