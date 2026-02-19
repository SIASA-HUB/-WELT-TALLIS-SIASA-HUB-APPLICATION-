const STATIC_CACHE = 'siasahub-static-v2';
const DYNAMIC_CACHE = 'siasahub-dynamic-v1';

// Static assets to cache for instant loading
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/rest2.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
];

// 1. Install: Cache static UI components
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('SW: Pre-caching App Shell');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch: The Middleman logic
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // --- STRATEGY A: Static Assets (Cache-First) ---
  // If it's the landing page or a CSS/Font file, load from cache instantly
  if (ASSETS.includes(url.pathname) || url.pathname === '/') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request);
      })
    );
    return;
  }

  // --- STRATEGY B: API Data (Stale-While-Revalidate) ---
  // For Posts and Backups: Show cached data instantly, then update cache in background
  if (
    url.pathname.startsWith('/api/v1/posts') ||
    url.pathname.startsWith('/api/v1/backup')
  ) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          
          // The background network request
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // If completely offline and no cache, return a friendly JSON error
            if (!cachedResponse) {
              return new Response(
                JSON.stringify({ success: false, message: 'You are offline' }),
                { headers: { 'Content-Type': 'application/json' } }
              );
            }
          });

          // Return cache if it exists, otherwise wait for network
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // --- STRATEGY C: Default (Network-Only) ---
  // For everything else (like external links)
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});