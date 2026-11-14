import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results = path.join(root, 'PromtAI/.codex/results/multi-tenant-20261114/browser');
export default defineConfig({
  testDir: './e2e', testMatch: '**/*.spec.js', workers: 1, fullyParallel: false, timeout: 90000,
  expect: { timeout: 15000 }, outputDir: path.join(results, 'artifacts'),
  reporter: [['list'], ['json', { outputFile: path.join(results, 'results.json') }], ['html', { outputFolder: path.join(results, 'report'), open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:5185', trace: 'retain-on-failure', screenshot: 'only-on-failure', timezoneId: 'Asia/Bangkok' },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }, { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' } }],
  webServer: [
    ['FE_Tenant', 5185], ['FE_TemplateLandingPage', 5183], ['FE_Quoting', 5184],
  ].map(([app, port]) => ({ cwd: path.join(root, app), command: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port ${port} --strictPort`, url: `http://127.0.0.1:${port}`, reuseExistingServer: false, timeout: 60000, env: { VITE_API_BASE_URL: '', ONEPORTAL_API_PROXY_TARGET: 'http://127.0.0.1:54622', QUOTING_API_PROXY_TARGET: 'http://127.0.0.1:54622' } })),
});
