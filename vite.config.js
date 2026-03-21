import { defineConfig } from 'vite';

export default defineConfig({
  // Ajustá 'base' al nombre exacto de tu repo en GitHub
  base: '/oajnu-2026-triviaApp/',

  build: {
    outDir: 'dist',
    // Genera un único bundle JS y un único CSS — óptimo para una SPA pequeña
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
