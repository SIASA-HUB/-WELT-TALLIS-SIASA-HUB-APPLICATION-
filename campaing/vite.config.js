import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { compression } from "vite-plugin-compression2";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      babel: {
        plugins: [
          ["@babel/plugin-transform-react-jsx", { runtime: "automatic" }],
        ],
      },
    }),
    compression({
      algorithm: "brotliCompress",
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "SIASA Hub 🇰🇪",
        short_name: "SIASA",
        description: "Kenya's Leading Political Platform",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "image/apple-touch-icon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "image/apple-touch-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5000000,
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|woff2)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3002,
    strictPort: true,
    allowedHosts: ["goals-acquire-image-energy.trycloudflare.com"],
    hmr: {
      host: "goals-acquire-image-energy.trycloudflare.com",
      protocol: "wss",
      clientPort: 443,

      overlay: true,
      timeout: 60000,
    },

    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  build: {
    minify: "esbuild",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "vendor-react";
            if (id.includes("lucide")) return "vendor-icons";
            if (id.includes("chart") || id.includes("recharts"))
              return "vendor-charts";
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: "esnext",
  },
  esbuild: {
    drop: ["console", "debugger"],

    jsx: "automatic",
  },

  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "styled-components"],
    exclude: [],
    esbuildOptions: {
      target: "es2020",
    },
  },
});
