import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 8443,
    // dev: browserul vorbește doar cu vite; /api e trimis către backend (același origin => cookie-ul SameSite=Strict merge)
    proxy: {
      '/api': { target: 'http://localhost:7070', changeOrigin: true },
    },
  },
});
