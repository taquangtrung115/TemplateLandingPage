import { chromium, webkit, devices } from '../../../../FE_Quoting/node_modules/playwright-core/index.mjs';
import { writeFile } from 'node:fs/promises';

const output = new URL('./', import.meta.url);
const baseURL = 'http://127.0.0.1:5184';
const report = [];
for (const [engine, device] of [[chromium, { viewport: { width: 1440, height: 1000 } }], [webkit, devices['iPhone 11']]]) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext({ ...device, baseURL });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/quotations?status=Draft#items', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).waitFor();
    await page.screenshot({ path: new URL(`before-${engine.name()}-login.png`, output).pathname.replace(/^\/(\w:)/, '$1'), fullPage: true });
    report.push({ engine: engine.name(), route: 'login', viewport: page.viewportSize(), submit: await page.getByRole('button', { name: 'Đăng nhập', exact: true }).boundingBox() });
    await page.getByLabel('Email', { exact: true }).fill(process.env.QUOTING_E2E_EMAIL);
    await page.getByPlaceholder('Nhập mật khẩu').fill(process.env.QUOTING_E2E_PASSWORD);
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await page.waitForURL('**/quotations?status=Draft#items');
    for (const route of ['/', '/quotations', '/quotations/create', '/products', '/customers', '/templates', '/contact', '/support']) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.locator('.quoting-content h1').waitFor();
      await page.locator('[aria-busy=true]').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: new URL(`before-${engine.name()}-${route.replaceAll('/', '-') || 'dashboard'}.png`, output).pathname.replace(/^\/(\w:)/, '$1'), fullPage: true });
      report.push(await page.evaluate(({ engine, route }) => ({
        engine, route, width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
        clipped: [...document.querySelectorAll('.quoting-content *')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width && (r.right > innerWidth + 1 || r.left < -1) && !el.closest('table, [role=table], .quotation-tabs');
        }).slice(0, 15).map(el => ({ tag: el.tagName, text: el.textContent.slice(0, 70), rect: el.getBoundingClientRect().toJSON() })),
      }), { engine: engine.name(), route }));
    }
    if (engine === webkit) {
      const toggle = page.getByRole('button', { name: /navigation/i });
      report.push({ engine: 'webkit', navigation: await page.getByRole('button').allTextContents(), toggleCount: await toggle.count() });
    }
    report.push({ engine: engine.name(), errors });
    await context.close();
  } finally { await browser.close(); }
}
await writeFile(new URL('before-report.json', output), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
