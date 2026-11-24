import { defineConfig } from 'vite';

export default defineConfig({
  // Static multi-page semantics: unknown URLs 404 instead of falling back to
  // index.html, matching how Vercel serves the built site.
  appType: 'mpa',
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
