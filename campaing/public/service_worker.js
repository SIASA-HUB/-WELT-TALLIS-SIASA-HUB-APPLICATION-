const STATIC_CACHE = "siasahub-static-v4";
const DYNAMIC_CACHE = "siasahub-dynamic-v1";

const APP_SHELL = ["/", "/index.html", "/favicon.ico", "/logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("SW: caching app shell");
      return cache.addAll(APP_SHELL);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("/index.html").then((cached) => {
        return cached || fetch(req);
      }),
    );
    return;
  }

  if (
    req.destination === "script" ||
    req.destination === "style" ||
    req.destination === "image" ||
    req.destination === "font"
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;

        return fetch(req).then((res) => {
          return caches.open(STATIC_CACHE).then((cache) => {
            cache.put(req, res.clone());
            return res;
          });
        });
      }),
    );
    return;
  }

  // API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          const networkFetch = fetch(req)
            .then((res) => {
              if (res.status === 200) cache.put(req, res.clone());
              return res;
            })
            .catch(() => cached);

          return cached || networkFetch;
        }),
      ),
    );
    return;
  }

  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
