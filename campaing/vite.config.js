import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'SIASA - Political Platform',
        short_name: 'SIASA',
        description: 'Campaign Political Platform',
        theme_color: '#BB0000',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'image/apple-touch-icon.png', // Ensure this path is correct in your public folder
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'image/apple-touch-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: "View Dashboard",
            short_name: "Dashboard",
            url: "/dashboard",
            icons: [{ src: "/icons/shortcut-dashboard.png", sizes: "96x96" }]
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
      }
    })
  ],
  server: {
    port: 3002,
    allowedHosts: ['achieve-profiles-celtic-carmen.trycloudflare.com']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'chart-vendor': ['react-chartjs-2', 'chart.js'],
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', 'styled-components']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    minify: 'terser', 
    terserOptions: {
      compress: { drop_console: true }
    }
  }
})