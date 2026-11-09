import { webkit, devices } from './runtime/safari17/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const browser = await webkit.launch();
const report = { version: browser.version(), cases: [] };
try {
  for (const width of [414, 375]) {
    const context = await browser.newContext({ ...devices['iPhone 11'], viewport: { width, height: 715 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push({ message: error.message, stack: error.stack }));
    const response = await page.goto(process.env.QUOTING_INSPECT_URL || 'https://quoting-beta.vercel.app/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).waitFor({ timeout: 15000 }).catch(error => errors.push({ message: error.message }));
    await page.screenshot({ path: fileURLToPath(new URL(`safari17-${width}.png`, import.meta.url)), fullPage: true });
    report.cases.push({ status: response.status(), url: page.url(), width, errors, layout: await page.evaluate(() => ({
      viewport: innerWidth, page: document.documentElement.scrollWidth,
      styles: [...document.querySelectorAll('.login-page, .login-page > *, .login-card-wrap, .login-split-grid, .login-form, form, input, .login-split-image')].map(element => {
        const style = getComputedStyle(element);
        return { tag: element.tagName, class: element.className, rect: element.getBoundingClientRect().toJSON(), display: style.display, width: style.width, containerType: style.containerType, columns: style.gridTemplateColumns, padding: style.padding, alignItems: style.alignItems };
      }),
    })) });
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(new URL('safari17-report.json', import.meta.url), JSON.stringify(report, null, 2));
for (const entry of report.cases) {
  assert.equal(entry.status, 200);
  assert.deepEqual(entry.errors, []);
  const form = entry.layout.styles.find(element => element.tag === 'FORM');
  assert(form.rect.width >= entry.width - 80, `Collapsed login form at ${entry.width}px`);
  assert(entry.layout.page <= entry.layout.viewport + 1, `Page overflow at ${entry.width}px`);
}
console.log(JSON.stringify(report));
