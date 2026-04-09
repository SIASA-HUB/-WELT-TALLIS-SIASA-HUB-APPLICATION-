/* eslint-disable no-restricted-globals */

import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";

// Take control immediately
clientsClaim();

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);

// ========== APP SHELL - INSTANT NAVIGATION ==========
const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(
  ({ request, url }) => {
    if (request.mode !== "navigate") return false;
    if (url.pathname.startsWith("/_")) return false;
    if (url.pathname.match(fileExtensionRegexp)) return false;
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html"),
);

// ========== MOBILE OPTIMIZATION: SMALLER CACHE ==========
// Static assets - smaller cache for mobile
registerRoute(
  ({ request }) =>
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font",
  new CacheFirst({
    cacheName: "static-mobile-v2",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50, // Smaller for mobile
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  }),
);

// ========== IMAGES - AGGRESSIVE CACHING ==========
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images-mobile-v2",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30, // Limit images for mobile
        maxAgeSeconds: 14 * 24 * 60 * 60, // 14 days
      }),
    ],
  }),
);

// ========== API - NETWORK FIRST WITH QUICK TIMEOUT ==========
registerRoute(
  ({ url }) => url.pathname.includes("/api/"),
  new NetworkFirst({
    cacheName: "api-mobile-v2",
    networkTimeoutSeconds: 1.5, // Faster timeout for mobile
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 3 * 60, // 3 minutes
      }),
    ],
  }),
);

// ========== CRITICAL: INSTALL IMMEDIATELY ==========
self.addEventListener("install", (event) => {
  console.log("📱 Mobile PWA installing...");
  event.waitUntil(
    Promise.all([
      // Cache critical routes immediately
      caches.open("html-cache-v2").then((cache) => {
        return cache.addAll([
          "/", 
          "/index.html", 
          "/offline.html",
          "/bootstrap/css/bootstrap.min.css",
          "/bootstrap/css/bootstrap-theme.min.css",
          "/bootstrap/js/bootstrap.min.js"
        ]);
      }),
      self.skipWaiting(),
    ]),
  );
});

// ========== ACTIVATE IMMEDIATELY ==========
self.addEventListener("activate", (event) => {
  console.log("📱 Mobile PWA activated");
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => !key.includes("mobile") && !key.includes("html"))
            .map((key) => caches.delete(key)),
        );
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
