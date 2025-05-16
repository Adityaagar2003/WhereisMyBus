import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env': JSON.stringify(process.env)
  },
  server: {
    port: 3000,
    host: true
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg'],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
}) 