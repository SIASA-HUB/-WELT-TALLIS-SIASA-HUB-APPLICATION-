import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    allowedHosts: [
      'naples-broadband-normally-answering.trycloudflare.com'
    ]
  },
  optimizeDeps: {
    include: ['react-chartjs-2', 'chart.js']
  }
})
