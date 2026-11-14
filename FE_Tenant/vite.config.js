import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], server: { port: 5175, proxy: { '/api': process.env.ONEPORTAL_API_PROXY_TARGET || 'http://127.0.0.1:54612' } } });
