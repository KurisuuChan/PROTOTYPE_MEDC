import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // You need to import the 'path' module

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    // Slightly raise warning limit and create separate vendor chunk
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'vendor-react-router';
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('supabase')) return 'vendor-supabase';
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('lucide-react')) return 'vendor-icons';
            return 'vendor';
          }
        },
      },
    },
  },
  // This 'resolve' section is essential for the '@/' alias to work
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})