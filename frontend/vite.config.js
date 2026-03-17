import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunk separation for better caching
          if (!id.includes('node_modules')) return

          // Core React libraries
          if (id.includes('react') && !id.includes('router')) {
            return 'react-core'
          }

          // React Router (lazy loaded routes)
          if (id.includes('react-router')) {
            return 'router-vendor'
          }

          // API client
          if (id.includes('axios')) {
            return 'api-vendor'
          }

          // Analytics and monitoring
          if (id.includes('@sentry') || id.includes('@vercel')) {
            return 'analytics-vendor'
          }

          // Fallback for other vendors
          return 'vendor'
        },
      },
    },
    // Increase chunk size warning threshold
    chunkSizeWarningLimit: 500,
  },
})
