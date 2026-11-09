import { defineConfig, devices } from '@playwright/test';

const results = process.env.QUOTING_TEST_RESULTS || '../PromtAI/.codex/results/fe-quoting-review-20261108';
export default defineConfig({
  testDir: './e2e', testMatch: '**/*.spec.js', timeout: 60000,
  expect: { timeout: 10000 }, workers: 2, fullyParallel: false,
  outputDir: `${results}/playwright`,
  reporter: [['list'], ['json', { outputFile: `${results}/playwright-results.json` }], ['html', { outputFolder: `${results}/playwright-report`, open: 'never' }]],
  use: { baseURL: process.env.QUOTING_E2E_BASE_URL || 'http://127.0.0.1:5184', timezoneId: 'Asia/Bangkok', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop-dark', use: { viewport: { width: 1440, height: 1000 }, colorScheme: 'dark' } },
    { name: 'desktop-light', use: { viewport: { width: 1440, height: 1000 }, colorScheme: 'light' } },
    { name: 'mobile-dark', use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, colorScheme: 'dark' } },
    { name: 'mobile-light', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: 'light' } },
    { name: 'small-mobile-light', use: { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true, colorScheme: 'light' } },
    { name: 'iphone11-webkit-light', use: { ...devices['iPhone 11'], browserName: 'webkit', colorScheme: 'light' } },
    { name: 'iphone11-webkit-dark', use: { ...devices['iPhone 11'], browserName: 'webkit', colorScheme: 'dark' } },
  ],
  webServer: { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5184 --strictPort', url: 'http://127.0.0.1:5184', reuseExistingServer: true, timeout: 60000 },
});
