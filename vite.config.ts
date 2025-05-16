import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensure environment variables are properly handled
    'process.env': process.env
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Ensure assets are properly processed
    assetsDir: 'assets',
    // Properly handle dynamic imports
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/database'],
          'leaflet': ['leaflet', 'react-leaflet']
        }
      }
    }
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg'],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
}) 