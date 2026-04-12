/* eslint-disable no-restricted-globals */

// Import Workbox from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log('🚀 [SW]: Workbox loaded');
  
  const { clientsClaim } = workbox.core;
  const { ExpirationPlugin } = workbox.expiration;
  const { precacheAndRoute, createHandlerBoundToURL } = workbox.precaching;
  const { registerRoute, NavigationRoute } = workbox.routing;
  const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies;

  // Control immediately
  clientsClaim();
  workbox.core.skipWaiting();

  // ========== APP SHELL - INSTANT NAVIGATION ==========
  // We don't have a manifest in public/sw.js usually, so we'll skip precacheAndRoute(self.__WB_MANIFEST)
  // unless we're using a build step. For now, we'll manually cache critical routes.

  // ========== STATIC ASSETS - AGGRESSIVE CACHING ==========
  registerRoute(
    ({ request }) =>
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'font',
    new StaleWhileRevalidate({
      cacheName: 'static-assets',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // ========== IMAGES - CACHE FIRST ==========
  registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // ========== API ROUTES - STALE WHILE REVALIDATE FOR INSTANT LOAD ==========
  // This makes the UI feel instant by returning cached data while updating in the background
  registerRoute(
    ({ url }) => url.pathname.includes('/api/v1/marketplace') || 
                 url.pathname.includes('/api/v1/leaders/manifestos'),
    new StaleWhileRevalidate({
      cacheName: 'api-data-instant',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes fresh
        }),
      ],
    })
  );

  // ========== CRITICAL NAVIGATION CACHING ==========
  self.addEventListener('install', (event) => {
    const criticalAssets = [
      '/',
      '/login',
      '/register',
      '/profile',
      '/marketplace',
      '/index.html',
    ];
    
    event.waitUntil(
      caches.open('critical-pages').then((cache) => {
        return cache.addAll(criticalAssets);
      })
    );
  });

  // Handle navigation requests with a Network-First strategy but fallback to cache
  registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
        cacheName: 'navigation-cache',
        networkTimeoutSeconds: 3,
    })
  );

} else {
  console.log('❌ [SW]: Workbox failed to load');
}
