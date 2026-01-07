import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Group all admin portal pages into a single 'admin' chunk.
          // This will include the lazy-loaded components within AdminPortal.tsx.
          if (id.includes('/pages/admin/')) {
            return 'admin';
          }
          // Group all other pages (customer-facing, agent portal) into a 'main' chunk.
          if (id.includes('/pages/')) {
            return 'main';
          }
        },
      },
    },
  },
});
