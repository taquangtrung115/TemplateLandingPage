import { test, expect } from '@playwright/test';

// #region Authenticated API fixtures
let session;
let quotation;
const main = page => page.getByRole('main');
const credentials = () => ({ email: process.env.QUOTING_E2E_EMAIL, password: process.env.QUOTING_E2E_PASSWORD });
const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

async function api(request, method, path, data) {
  const response = await request.fetch(`/api/v1${path}`, { method, data, headers: session ? { Authorization: `Bearer ${session.token}` } : {} });
  expect(response.ok(), `${method} ${path}: ${response.status()}`).toBeTruthy();
  const body = await response.json();
  return body.value ?? body;
}

test.beforeAll(async ({ request }) => {
  const { email, password } = credentials();
  if (!email || !password) throw new Error('Configure QUOTING_E2E_EMAIL and QUOTING_E2E_PASSWORD for an isolated test backend.');
  session = await api(request, 'POST', '/auth/login', { email, password });
  const customerId = await api(request, 'POST', '/quoting/customers', { name: `Đại lý kiểm thử route ${unique()}`, phone: '0901234567', address: 'Địa chỉ kiểm thử hiển thị đầy đủ trên điện thoại' });
  const product = (await api(request, 'GET', '/quoting/products')).find(item => item.code === 'CB-01');
  const id = await api(request, 'POST', '/quoting/quotations', {
    customerId, issueDate: new Date().toISOString(), items: [{
      productId: product.id, productCode: product.code, productName: product.name,
      imageUrl: product.imageUrl, unit: product.unit, itemGroup: product.category, quantity: 2, unitPrice: product.price, sortOrder: 1,
    }],
  });
  quotation = await api(request, 'GET', `/quoting/quotations/${id}`);
});

test.beforeEach(async ({ page }, testInfo) => {
  page.runtimeErrors = [];
  page.on('pageerror', error => page.runtimeErrors.push(error.message));
  await page.addInitScript(mode => {
    if (window.top === window.self) localStorage.setItem('quoting.colorMode', mode);
  }, testInfo.project.name.includes('dark') ? 'dark' : 'light');
});
test.afterEach(async ({ page }) => expect(page.runtimeErrors).toEqual([]));
// #endregion

// #region Navigation and layout helpers
const routeCases = () => [
  ['/', 'Tổng quan báo giá', '/quoting/quotations/summary'],
  ['/quotations', 'Báo giá', '/quoting/quotations?'],
  ['/quotations/create', 'Tạo báo giá', '/quoting/templates'],
  [`/quotations/${quotation.id}`, quotation.quotationNumber, `/quoting/quotations/${quotation.id}/preview`],
  [`/quotations/${quotation.id}/edit`, 'Sửa báo giá', `/quoting/quotations/${quotation.id}`],
  ['/products', 'Danh mục sản phẩm', '/quoting/products'],
  ['/customers', 'Khách hàng', '/quoting/customers'],
  ['/templates', 'Mẫu báo giá', '/quoting/templates'],
  ['/contact', 'Hỗ trợ'],
  ['/support', 'Xử lý hỗ trợ', '/quoting/support-requests'],
];

async function signIn(page) {
  const { email, password } = credentials();
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByPlaceholder('Nhập mật khẩu').fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(main(page)).toBeVisible();
}

async function expectLayout(page) {
  const viewport = page.viewportSize();
  const width = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(width.page).toBeLessThanOrEqual(width.viewport + 1);
  const clipped = await page.locator('.quoting-content input, .quoting-content button').evaluateAll(elements => elements.filter(element => {
    if (element.closest('table, [role="table"], .quotation-tabs')) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
  }).map(element => element.getAttribute('aria-label') || element.textContent));
  expect(clipped, `${viewport.width}px: clipped controls`).toEqual([]);
}

async function openRoute(page, route, heading, endpoint, reload = false) {
  const response = endpoint ? page.waitForResponse(result => result.url().includes(`/api/v1${endpoint}`)) : null;
  const document = reload ? await page.reload({ waitUntil: 'domcontentloaded' }) : await page.goto(route, { waitUntil: 'domcontentloaded' });
  expect(document.status()).toBe(200);
  if (response) expect((await response).ok()).toBeTruthy();
  await expect(main(page).getByRole('heading', { name: heading, exact: true })).toBeVisible();
  await expectLayout(page);
}

async function openMenu(page, isMobile) {
  if (isMobile) {
    await page.getByTestId('mobile-nav-toggle').tap();
    await expect(page.getByRole('dialog', { name: 'Điều hướng', exact: true })).toBeVisible();
  }
  return isMobile ? page.getByRole('dialog', { name: 'Điều hướng', exact: true }) : page.getByRole('navigation').filter({ hasText: 'Nghiệp vụ' });
}
// #endregion

test('every protected deep link requires login and survives a login-page refresh', async ({ page }, testInfo) => {
  const dataRequests = [];
  page.on('request', request => { if (request.url().includes('/api/v1/quoting/')) dataRequests.push(request.url()); });
  for (const [route] of routeCases()) {
    await page.goto(`${route}?search=BG#items`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: 'Đăng nhập', exact: true })).toBeVisible();
    await expect(main(page)).toHaveCount(0);
  }
  expect(dataRequests).toEqual([]);
  await page.reload({ waitUntil: 'domcontentloaded' });
  const email = page.getByLabel('Email', { exact: true });
  await expect(email).toHaveValue('');
  await expect(page.getByPlaceholder('Nhập mật khẩu')).toHaveValue('');
  const form = await page.locator('form').boundingBox();
  expect(form.width).toBeGreaterThan(Math.min(280, page.viewportSize().width - 80));
  if (testInfo.project.name.startsWith('iphone11')) {
    await expect(page.getByRole('button', { name: 'Đăng nhập', exact: true })).toBeInViewport({ ratio: 1 });
    const fontSize = await email.evaluate(element => parseFloat(getComputedStyle(element).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(16);
  }
  await page.screenshot({ path: testInfo.outputPath('login.png'), fullPage: true });
  await signIn(page);
  await expect(page).toHaveURL(/\/support\?search=BG#items$/);
});

test('all ten authenticated routes support direct navigation and refresh', async ({ page }, testInfo) => {
  test.setTimeout(120000);
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await signIn(page);
  for (const [route, heading, endpoint] of routeCases()) {
    await openRoute(page, route, heading, endpoint);
    await openRoute(page, route, heading, endpoint, true);
    await page.screenshot({ path: testInfo.outputPath(`route-${route.replaceAll('/', '-') || 'dashboard'}.png`), fullPage: true });
  }
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/$/);
  await expect(main(page).getByRole('heading', { name: 'Tổng quan báo giá', exact: true })).toBeVisible();
});

test('menu navigation, logout and browser back keep the authentication guard', async ({ page, isMobile }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await signIn(page);
  for (const [label, path, heading] of [
    ['Báo giá', '/quotations', 'Báo giá'], ['Tạo báo giá', '/quotations/create', 'Tạo báo giá'],
    ['Danh mục sản phẩm', '/products', 'Danh mục sản phẩm'], ['Khách hàng', '/customers', 'Khách hàng'],
    ['Mẫu báo giá', '/templates', 'Mẫu báo giá'], ['Gửi yêu cầu hỗ trợ', '/contact', 'Hỗ trợ'],
    ['Xử lý hỗ trợ', '/support', 'Xử lý hỗ trợ'], ['Tổng quan', '/', 'Tổng quan báo giá'],
  ]) {
    const nav = await openMenu(page, isMobile);
    await nav.getByRole('button', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(main(page).getByRole('heading', { name: heading, exact: true })).toBeVisible();
    if (isMobile) await expect(page.getByRole('dialog', { name: 'Điều hướng', exact: true })).not.toBeVisible();
    await expectLayout(page);
  }
  const nav = await openMenu(page, isMobile);
  await nav.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  await page.goBack();
  await expect(page.getByRole('button', { name: 'Đăng nhập', exact: true })).toBeVisible();
  await expect(main(page)).toHaveCount(0);
});

test('an expired session returns to its full deep link after signing in again', async ({ page }) => {
  const route = `/quotations/${quotation.id}/edit?source=direct#items`;
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await signIn(page);
  await expect(page).toHaveURL(new RegExp(`${quotation.id}/edit\\?source=direct#items$`));
  await page.evaluate(() => localStorage.setItem('token', 'expired-local-test-session'));
  const profile = page.waitForResponse(response => response.url().endsWith('/api/v1/auth/me'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  expect((await profile).status()).toBe(401);
  await expect(page).toHaveURL(/\/login$/);
  await expect(main(page)).toHaveCount(0);
  await signIn(page);
  await expect(page).toHaveURL(new RegExp(`${quotation.id}/edit\\?source=direct#items$`));
  await expect(main(page).getByRole('heading', { name: 'Sửa báo giá', exact: true })).toBeVisible();
});

test('drawers and populated quotation steps keep their controls within the viewport', async ({ page }, testInfo) => {
  await page.goto('/products', { waitUntil: 'domcontentloaded' });
  await signIn(page);
  for (const [route, heading, label] of [['/products', 'Danh mục sản phẩm', 'Thêm sản phẩm'], ['/customers', 'Khách hàng', 'Thêm khách hàng']]) {
    await openRoute(page, route, heading);
    await main(page).getByRole('button', { name: label, exact: true }).first().click();
    const drawer = page.getByRole('dialog', { name: label, exact: true });
    await expect(drawer).toBeVisible();
    await expect.poll(async () => {
      const box = await drawer.boundingBox();
      return box.x >= -1 && box.x + box.width <= page.viewportSize().width + 1;
    }).toBe(true);
    await drawer.getByRole('button', { name: 'Hủy', exact: true }).click();
  }
  await openRoute(page, `/quotations/${quotation.id}/edit`, 'Sửa báo giá');
  for (let step = 1; step <= 4; step += 1) {
    await expect(main(page).getByRole('heading', { name: new RegExp(`Bước ${step}:`) })).toBeVisible();
    await expectLayout(page);
    if (step === 2) {
      const identity = page.locator('.quotation-item-identity');
      await expect(identity.getByText(quotation.items[0].productName, { exact: true })).toBeVisible();
      const group = identity.getByText(quotation.items[0].itemGroup, { exact: true });
      await expect(group).toBeVisible();
      expect(await group.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
      const remove = main(page).getByRole('button', { name: `Xóa ${quotation.items[0].productName}`, exact: true });
      await expect(remove).toHaveText('Xóa sản phẩm');
      expect(await remove.evaluate(button => [...button.querySelectorAll('*')].some(element => element.textContent === 'Xóa sản phẩm' && element.scrollWidth > element.clientWidth + 1))).toBe(false);
    }
    await page.screenshot({ path: testInfo.outputPath(`populated-step-${step}.png`), fullPage: true });
    if (step < 4) await main(page).getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  }
});
