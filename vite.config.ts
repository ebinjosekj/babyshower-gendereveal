import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' lets the built site work from a GitHub Pages sub-path (/babyshower/).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ['framer-motion'],
          gsap: ['gsap', 'lenis'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
