import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // The app consumes Astryx's compiled components and CSS. The source-build
  // plugin requires Vite 8 and splits context modules when used with Vite 6.
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.QUOTING_API_PROXY_TARGET || 'http://127.0.0.1:54611',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
