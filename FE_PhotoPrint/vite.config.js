import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const proxy = { target: process.env.ONEPORTAL_API_PROXY_TARGET || 'http://127.0.0.1:54612', changeOrigin: true };

export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { port: 5177, strictPort: true, proxy: { '^/t/[^/]+/api/': proxy, '/api': proxy } },
  test: { environment: 'jsdom', setupFiles: ['./test/setup.js'] },
});
