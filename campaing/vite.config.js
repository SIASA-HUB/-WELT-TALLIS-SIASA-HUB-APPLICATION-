import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

// Detect dev mode
const DEV = process.env.NODE_ENV === "development";
const API_URL = process.env.VITE_API_URL || "http://localhost:5000";

// List of allowed hosts
const ALLOWED_HOSTS = [
  "localhost",
  "127.0.0.1",
  ".trycloudflare.com",
  "tour-bestsellers-conditional-tunnel.trycloudflare.com",
];

export default defineConfig({
  plugins: [
    react(),

    // Brotli compression (best for mobile)
    viteCompression({
      verbose: false,
      disable: false,
      threshold: 1024, // Compress files > 1KB
      algorithm: "brotliCompress",
      ext: ".br",
      deleteOriginalAssets: false,
    }),

    // Gzip fallback
    viteCompression({
      verbose: false,
      disable: false,
      threshold: 1024,
      algorithm: "gzip",
      ext: ".gz",
      deleteOriginalAssets: false,
    }),

    // Bundle analyzer (optional - remove for production)
    process.env.ANALYZE === "true" &&
      visualizer({
        open: true,
        filename: "bundle-analysis.html",
      }),
  ].filter(Boolean),

  server: {
    host: true,
    port: 5174,
    strictPort: true,
    allowedHosts: DEV ? ALLOWED_HOSTS : [],
    cors: true,
    proxy: {
      "/api": {
        target: "http://localhost:8009",
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        proxyTimeout: 60000,
      },
      "/uploads": {
        target: "http://localhost:8009",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://localhost:8009",
        ws: true,
        changeOrigin: true,
        timeout: 60000,
        proxyTimeout: 60000,
      },
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    },
  },

  preview: {
    host: true,
    port: 5173,
    allowedHosts: ALLOWED_HOSTS,
    cors: true,
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  },

  build: {
    target: "es2020", // Better for modern browsers
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 500, // Reduced from 600
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: !DEV, // Remove console logs in production
        drop_debugger: !DEV,
        pure_funcs: DEV ? [] : ["console.log", "console.info", "console.debug"],
      },
    },
    rollupOptions: {
      output: {
        // Intelligent chunking to avoid 33MB giant bundles
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("recharts")) return "vendor-charts";
            if (id.includes("framer-motion")) return "vendor-motion";
            if (id.includes("lucide-react")) return "vendor-icons";
            if (id.includes("axios")) return "vendor-axios";
            return "vendor"; // All other libraries
          }
        },
        // Optimize chunk names
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",

      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Enable module preload
    modulePreload: {
      polyfill: true,
    },
    // Report compressed sizes
    reportCompressedSize: true,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "lucide-react"],
    exclude: [],
    // Enable esbuild dependency optimization
    esbuildOptions: {
      target: "es2020",
    },
  },

  // Enable CSS preprocessing
  css: {
    devSourcemap: !DEV,
    modules: {
      localsConvention: "camelCase",
    },
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
