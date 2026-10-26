import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    // `three` is ~880 kB raw and trips the default 500 kB warning, but it is
    // behind an idle-time dynamic import that only fires on a pointer-capable
    // desktop with WebGL. Warning at 950 kB keeps the signal meaningful: it
    // will fire if anything *else* grows.
    chunkSizeWarningLimit: 950,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        // Keep three.js out of the main bundle; it is only pulled in by the
        // lazily-mounted hero field, so it must never block first paint.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) return 'three';
            if (id.includes('motion') || id.includes('framer')) return 'motion';
            if (id.includes('react-router')) return 'router';
            if (id.includes('react')) return 'react';
          }
          return undefined;
        },
      },
    },
  },
});
