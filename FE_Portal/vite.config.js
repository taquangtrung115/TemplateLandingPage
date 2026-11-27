import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const proxy = { '/api': { target: process.env.ONEPORTAL_API_PROXY_TARGET || 'http://127.0.0.1:54612', changeOrigin: true } };

export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { port: 5176, strictPort: true, proxy },
  preview: { port: 5176, strictPort: true, proxy },
});
