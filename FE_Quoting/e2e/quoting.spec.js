import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

let runtimeErrors;
let token;
const main = (page) => page.getByRole('main');
const unique = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

async function api(request, method, path, data) {
  const response = await request.fetch(`/api/v1${path}`, { method, data, headers: token ? { Authorization: `Bearer ${token}` } : {} });
  expect(response.ok(), `${method} ${path}: ${await response.text()}`).toBeTruthy();
  const result = await response.json();
  return result.value ?? result;
}

test.beforeEach(async ({ page, request }, testInfo) => {
  runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  const email = process.env.QUOTING_E2E_EMAIL;
  const password = process.env.QUOTING_E2E_PASSWORD;
  if (!email || !password) throw new Error('Set QUOTING_E2E_EMAIL and QUOTING_E2E_PASSWORD for an isolated test database.');
  token = null;
  const session = await api(request, 'POST', '/auth/login', { email, password });
  token = session.token;
  const mode = testInfo.title.startsWith('first visit') ? null : testInfo.project.name.includes('dark') ? 'dark' : 'light';
  await page.addInitScript(({ session, mode }) => {
    if (window.top !== window.self) return;
    localStorage.setItem('token', session.token);
    localStorage.setItem('user', JSON.stringify(session.user));
    if (mode && !localStorage.getItem('quoting.colorMode')) localStorage.setItem('quoting.colorMode', mode);
  }, { session, mode });
});
test.afterEach(async () => expect(runtimeErrors).toEqual([]));

async function open(page, route, heading) {
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await expect(main(page).getByRole('heading', { name: heading, exact: true })).toBeVisible();
}

async function ready(page, route) {
  if (route === '/products' && page.viewportSize().width < 768) await expect(main(page).getByLabel('Danh sách sản phẩm trên điện thoại')).toBeVisible();
  else if (route === '/products') await expect(main(page).getByRole('table')).toBeVisible();
  else if (route === '/customers') await expect(main(page).getByRole('table').or(main(page).getByText('Chưa có khách hàng nào', { exact: true }))).toBeVisible();
  else if (route === '/quotations') await expect(main(page).getByRole('table').or(main(page).getByText('Chưa có báo giá nào', { exact: true }))).toBeVisible();
  if (route === '/quotations/create') await expect(main(page).getByRole('heading', { name: 'Tóm tắt báo giá' })).toBeVisible();
  if (route === '/templates') await expect(main(page).getByLabel('Tên đơn vị bán hàng', { exact: true })).toBeEnabled();
}

async function noPageOverflow(page) {
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
}

test('all routes render without runtime errors or horizontal page overflow', async ({ page }, testInfo) => {
  for (const [route, heading] of [
    ['/', 'Tổng quan báo giá'], ['/quotations', 'Báo giá'], ['/quotations/create', 'Tạo báo giá'],
    ['/products', 'Danh mục sản phẩm'], ['/customers', 'Khách hàng'], ['/templates', 'Mẫu báo giá'], ['/contact', 'Hỗ trợ'], ['/support', 'Xử lý hỗ trợ'],
  ]) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(main(page)).toBeVisible();
    await expect(page.locator('.quoting-toolbar')).toBeVisible();
    await expect(main(page).getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await ready(page, route);
    await noPageOverflow(page);
    if (route === '/quotations/create' || route === '/products') await page.screenshot({ path: testInfo.outputPath(`${route.split('/').at(-1)}.png`), fullPage: true });
    if (route === '/quotations/create') {
      await expect(page.getByRole('heading', { name: 'Tóm tắt báo giá' })).toBeVisible();
      const summary = await page.locator('.quotation-summary').boundingBox();
      const editor = await page.locator('.quotation-editor > div').first().boundingBox();
      if (testInfo.project.name.startsWith('desktop')) expect(summary.x).toBeGreaterThan(editor.x + editor.width);
      else expect(summary.y).toBeGreaterThan(editor.y);
    }
  }
});

test('first visit defaults to light and preserves a later dark preference', async ({ page }) => {
  await open(page, '/products', 'Danh mục sản phẩm');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Giao diện tối', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('switching theme persists across reload and keeps controls usable', async ({ page }, testInfo) => {
  await open(page, '/products', 'Danh mục sản phẩm');
  const initial = testInfo.project.name.includes('dark') ? 'dark' : 'light';
  const target = initial === 'dark' ? 'light' : 'dark';
  await page.getByRole('button', { name: initial === 'dark' ? 'Giao diện sáng' : 'Giao diện tối', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', target);
  // This init script only supplies the initial session; test reload uses the saved preference.
  await page.evaluate(() => sessionStorage.setItem('theme-test-reload', '1'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', target);
  await expect(main(page).getByRole('button', { name: 'Thêm sản phẩm' })).toBeEnabled();
});

test('customer drawer creates and edits data with validation and delete confirmation', async ({ page }, testInfo) => {
  const name = `Khách hàng ${unique()}`;
  await open(page, '/customers', 'Khách hàng');
  await main(page).getByRole('button', { name: 'Thêm khách hàng', exact: true }).first().click();
  const drawer = page.getByRole('dialog', { name: 'Thêm khách hàng', exact: true });
  await drawer.getByRole('button', { name: 'Lưu khách hàng' }).click();
  await expect(drawer.getByText('Tên khách hàng và Số điện thoại là bắt buộc.').first()).toBeVisible();
  await drawer.getByLabel('Tên khách hàng', { exact: true }).fill(name);
  await drawer.getByLabel('Số điện thoại', { exact: true }).fill('0901234567');
  await drawer.getByRole('button', { name: 'Lưu khách hàng' }).click();
  await expect(drawer).not.toBeVisible();
  await main(page).getByLabel('Tìm kiếm khách hàng', { exact: true }).fill(name);
  await main(page).getByRole('button', { name: `Sửa ${name}`, exact: true }).click();
  const edit = page.getByRole('dialog', { name: 'Sửa khách hàng', exact: true });
  await edit.getByLabel('Số điện thoại', { exact: true }).fill('0909999888');
  await edit.getByRole('button', { name: 'Lưu khách hàng' }).click();
  await expect(edit).not.toBeVisible();
  await expect(main(page).getByText('0909999888', { exact: true })).toBeVisible();
  await main(page).getByRole('button', { name: `Xóa ${name}`, exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Xóa khách hàng', exact: true }).click();
  await expect(main(page).getByText(name, { exact: true })).toHaveCount(0);
  await noPageOverflow(page);
});

test('catalog product drawer saves code, price, active state and changes without touching other products', async ({ page }) => {
  const name = `Sản phẩm ${unique()}`;
  const code = `E2E-${unique()}`;
  await open(page, '/products', 'Danh mục sản phẩm');
  await main(page).getByRole('button', { name: 'Thêm sản phẩm', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Thêm sản phẩm', exact: true });
  await drawer.getByLabel('Mã sản phẩm', { exact: true }).fill(code);
  await drawer.getByLabel('Tên sản phẩm', { exact: true }).fill(name);
  const price = drawer.getByRole('group', { name: 'Giá danh mục', exact: true }).locator('input');
  await price.fill('28000'); await price.blur();
  await drawer.getByRole('button', { name: 'Lưu sản phẩm', exact: true }).click();
  await expect(drawer).not.toBeVisible();
  await main(page).getByLabel('Tìm kiếm sản phẩm', { exact: true }).fill(name);
  await main(page).getByRole('button', { name: `Sửa ${name}`, exact: true }).click();
  const edit = page.getByRole('dialog', { name: 'Sửa sản phẩm', exact: true });
  const editPrice = edit.getByRole('group', { name: 'Giá danh mục', exact: true }).locator('input');
  await expect(editPrice).toHaveValue('28000'); await editPrice.fill('32000'); await editPrice.blur();
  await edit.getByRole('switch', { name: 'Đang bán', exact: true }).click();
  await edit.getByRole('button', { name: 'Lưu sản phẩm', exact: true }).click();
  await expect(edit).not.toBeVisible();
  await expect(main(page).getByText('Tạm ngưng', { exact: true })).toBeVisible();
  await main(page).getByRole('button', { name: `Xóa ${name}`, exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Xóa sản phẩm', exact: true }).click();
  await expect(main(page).getByText(name, { exact: true })).toHaveCount(0);
});

test('quotation full flow supports per-customer prices, edits, PDF download and approval', async ({ page, request }, testInfo) => {
  const customerName = `Đại lý ${unique()}`;
  const customerId = await api(request, 'POST', '/quoting/customers', { name: customerName, phone: '0908123456', email: 'test@example.test', address: 'TP.HCM' });
  const products = await api(request, 'GET', '/quoting/products');
  const catalogProduct = products.find((product) => product.code === 'CB-01');
  expect(catalogProduct.price).toBe(18000);
  await open(page, '/quotations/create', 'Tạo báo giá');
  await main(page).getByRole('radio', { name: /Chọn khách hàng doanh nghiệp/ }).check();
  await main(page).getByRole('radio', { name: customerName, exact: true }).check();
  await main(page).getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await main(page).getByRole('button', { name: /COMBO NGUYÊN BẢN BAO NGON ·/ }).click();
  await main(page).getByLabel('Số lượng', { exact: true }).fill('2.5');
  await main(page).getByLabel('Số lượng', { exact: true }).blur();
  await main(page).getByLabel('Đơn giá báo giá (VNĐ)', { exact: true }).fill('20000');
  await main(page).getByLabel('Đơn giá báo giá (VNĐ)', { exact: true }).blur();
  await main(page).getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await main(page).getByRole('switch', { name: 'Thêm VAT', exact: true }).check();
  const tax = main(page).getByRole('group', { name: 'Thuế suất VAT', exact: true }).locator('input');
  await tax.fill('8'); await tax.blur();
  await main(page).getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await main(page).getByRole('button', { name: 'Tạo báo giá', exact: true }).click();
  await page.waitForURL(/\/quotations\/[a-f0-9-]{36}$/);
  const quotationId = page.url().split('/').at(-1);
  const saved = await api(request, 'GET', `/quoting/quotations/${quotationId}`);
  expect(saved.customerId).toBe(customerId); expect(saved.items[0].unitPrice).toBe(20000); expect(saved.totalAmount).toBe(54000);
  expect((await api(request, 'GET', `/quoting/products/${catalogProduct.id}`)).price).toBe(18000);
  await expect(page.frameLocator('iframe').locator('.customer-box')).toContainText(customerName);
  await main(page).getByRole('button', { name: 'Sửa báo giá', exact: true }).click();
  await main(page).getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await expect(main(page).getByLabel('Đơn giá báo giá (VNĐ)', { exact: true })).toHaveValue('20000');
  await main(page).getByLabel('Đơn giá báo giá (VNĐ)', { exact: true }).fill('21000');
  await main(page).getByLabel('Đơn giá báo giá (VNĐ)', { exact: true }).blur();
  await main(page).getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await main(page).getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await main(page).getByRole('button', { name: 'Lưu báo giá', exact: true }).click();
  await page.waitForURL(new RegExp(`/quotations/${quotationId}$`));
  expect((await api(request, 'GET', `/quoting/quotations/${quotationId}`)).totalAmount).toBe(56700);
  const downloading = page.waitForEvent('download');
  await main(page).getByRole('button', { name: 'Tải PDF', exact: true }).first().click();
  const download = await downloading;
  const filePath = testInfo.outputPath('quotation.pdf');
  await download.saveAs(filePath);
  expect((await readFile(filePath)).subarray(0, 8).toString('ascii')).toBe('%PDF-1.4');
  await testInfo.attach('Báo giá PDF', { path: filePath, contentType: 'application/pdf' });
  await main(page).getByRole('button', { name: 'Đánh dấu đã gửi', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Đánh dấu đã gửi', exact: true }).click();
  await expect(main(page).getByRole('button', { name: 'Phê duyệt', exact: true })).toBeVisible();
  await main(page).getByRole('button', { name: 'Phê duyệt', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Phê duyệt', exact: true }).click();
  await expect(main(page).getByText('Đã phê duyệt', { exact: true })).toBeVisible();
  await expect(main(page).getByRole('button', { name: 'Sửa báo giá' })).toHaveCount(0);
  await noPageOverflow(page);
});

test('generic quotation omits the customer block and template copies keep independent versions', async ({ page, request }) => {
  await open(page, '/templates', 'Mẫu báo giá');
  await main(page).getByRole('button', { name: 'Thêm mẫu', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Thêm mẫu báo giá', exact: true });
  const code = `TPL-${unique()}`;
  await drawer.getByLabel('Mã mẫu', { exact: true }).fill(code);
  await drawer.getByLabel('Tên mẫu', { exact: true }).fill(`Mẫu ${code}`);
  await drawer.getByRole('button', { name: 'Tạo mẫu', exact: true }).click();
  await expect(drawer).not.toBeVisible();
  const templates = await api(request, 'GET', '/quoting/templates');
  const copied = templates.find((template) => template.code.toUpperCase() === code.toUpperCase());
  expect(copied.currentVersion).toBe(1);
  await open(page, '/quotations/create', 'Tạo báo giá');
  await main(page).getByRole('radio', { name: /Bỏ qua chọn khách hàng/ }).check();
  await main(page).getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await main(page).getByRole('button', { name: /COMBO NGUYÊN BẢN BAO NGON ·/ }).click();
  await main(page).getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await main(page).getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await main(page).getByRole('button', { name: 'Tạo báo giá', exact: true }).click();
  await page.waitForURL(/\/quotations\/[a-f0-9-]{36}$/);
  await expect(page.frameLocator('iframe').locator('.customer-box')).toHaveCount(0);
  await expect(page.frameLocator('iframe').getByText('Kính gửi: QUÝ KHÁCH HÀNG', { exact: true })).toBeVisible();
});

test('product image upload, replacement and quotation export preserve the saved image', async ({ page, request }, testInfo) => {
  test.skip(!process.env.QUOTING_E2E_IMAGE_STORAGE, 'Requires image storage configured on the isolated test backend.');
  const name = `Ảnh sản phẩm ${unique()}`;
  await open(page, '/products', 'Danh mục sản phẩm');
  await main(page).getByRole('button', { name: 'Thêm sản phẩm', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Thêm sản phẩm', exact: true });
  await drawer.getByLabel('Tên sản phẩm', { exact: true }).fill(name);
  await drawer.locator('input[type="file"]').setInputFiles('../BE/assets/quoting/products/CB-01.png');
  await expect(drawer.getByAltText('Ảnh sản phẩm đang chọn')).toHaveJSProperty('naturalWidth', 254);
  await noPageOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('selected-image.png'), fullPage: true });
  await drawer.getByRole('button', { name: 'Lưu sản phẩm', exact: true }).click();
  await expect(drawer).not.toBeVisible();
  await main(page).getByLabel('Tìm kiếm sản phẩm', { exact: true }).fill(name);
  const product = (await api(request, 'GET', '/quoting/products')).find((item) => item.name === name);
  expect(product.imageUrl).toMatch(/^\/api\/v1\/quoting\/product-images\/uploads\/[a-f0-9]{32}\.png$/);
  const original = await request.get(product.imageUrl); expect(original.ok()).toBeTruthy();
  const originalBytes = await original.body();
  await expect(main(page).getByAltText(name)).toHaveJSProperty('naturalWidth', 254);
  await open(page, '/quotations/create', 'Tạo báo giá');
  await main(page).getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await main(page).getByRole('button', { name: new RegExp(`${name} ·`) }).click();
  await main(page).getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await main(page).getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await main(page).getByRole('button', { name: 'Tạo báo giá', exact: true }).click();
  await page.waitForURL(/\/quotations\/[a-f0-9-]{36}$/);
  const quoteId = page.url().split('/').at(-1);
  const quote = await api(request, 'GET', `/quoting/quotations/${quoteId}`);
  expect(quote.items[0].imageUrl).toBe(product.imageUrl);
  await expect(page.frameLocator('iframe').getByAltText(name)).toHaveJSProperty('naturalWidth', 254);
  await open(page, '/products', 'Danh mục sản phẩm');
  await main(page).getByLabel('Tìm kiếm sản phẩm', { exact: true }).fill(name);
  await main(page).getByRole('button', { name: `Sửa ${name}`, exact: true }).click();
  const edit = page.getByRole('dialog', { name: 'Sửa sản phẩm', exact: true });
  await edit.locator('input[type="file"]').setInputFiles('../BE/assets/quoting/products/XQ-01.png');
  await edit.getByRole('button', { name: 'Lưu sản phẩm', exact: true }).click();
  await expect(edit).not.toBeVisible();
  const updated = await api(request, 'GET', `/quoting/products/${product.id}`);
  expect(updated.imageUrl).not.toBe(product.imageUrl);
  expect((await api(request, 'GET', `/quoting/quotations/${quoteId}`)).items[0].imageUrl).toBe(product.imageUrl);
  await page.goto(`/quotations/${quoteId}`, { waitUntil: 'domcontentloaded' });
  await expect(main(page).getByRole('button', { name: 'Sửa báo giá', exact: true })).toBeVisible();
  const htmlDownload = page.waitForEvent('download');
  await main(page).getByRole('button', { name: 'Tải HTML', exact: true }).first().click();
  const html = await htmlDownload; const htmlPath = testInfo.outputPath('uploaded-image-quotation.html'); await html.saveAs(htmlPath);
  expect(await readFile(htmlPath, 'utf8')).toContain(`data:image/png;base64,${originalBytes.toString('base64')}`);
  const pdfDownload = page.waitForEvent('download');
  await main(page).getByRole('button', { name: 'Tải PDF', exact: true }).first().click();
  const pdf = await pdfDownload; const pdfPath = testInfo.outputPath('uploaded-image-quotation.pdf'); await pdf.saveAs(pdfPath);
  expect((await readFile(pdfPath)).subarray(0, 8).toString('ascii')).toBe('%PDF-1.4');
  await testInfo.attach('Báo giá với ảnh upload', { path: pdfPath, contentType: 'application/pdf' });
  await noPageOverflow(page);
});

test('core pages have no serious accessibility violations', async ({ page }, testInfo) => {
  for (const route of ['/products', '/quotations/create', '/templates', '/contact', '/support']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(main(page).getByRole('heading', { level: 1 })).toBeVisible();
    await ready(page, route);
    await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== 'running'));
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    const violations = audit.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact));
    expect(violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })), `${testInfo.project.name}: ${route}`).toEqual([]);
  }
});


test('login starts with empty credentials and returns to the requested route', async ({ browser }) => {
  const context = await browser.newContext(); const page = await context.newPage();
  try {
    await page.goto(`${process.env.QUOTING_E2E_BASE_URL || 'http://127.0.0.1:5184'}/quotations?search=BG`);
    await expect(page.getByRole('button', { name: 'Đăng nhập', exact: true })).toBeVisible();
    const email = page.getByLabel('Email', { exact: true }); const password = page.getByPlaceholder('Nhập mật khẩu');
    await expect(email).toHaveValue(''); await expect(password).toHaveValue('');
    await expect(page.getByText(process.env.QUOTING_E2E_EMAIL, { exact: false })).toHaveCount(0);
    await email.fill(process.env.QUOTING_E2E_EMAIL); await password.fill(process.env.QUOTING_E2E_PASSWORD);
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await page.waitForURL('**/quotations?search=BG');
    await expect(page.getByRole('main').getByRole('heading', { name: 'Báo giá', exact: true })).toBeVisible();
  } finally { await context.close(); }
});


test('VAT is appended to export only when selected and saved amounts are preserved', async ({ page, request }) => {
  const id = await api(request, 'POST', '/quoting/quotations', { issueDate: new Date().toISOString(), taxPercent: 0, items: [{ productName: 'Sản phẩm thử VAT', unit: 'Gói', quantity: 2, unitPrice: 18000, sortOrder: 1 }] });
  await page.goto(`/quotations/${id}`);
  const toggle = main(page).getByRole('switch', { name: 'Thêm VAT khi xuất' });
  await expect(toggle).not.toBeChecked();
  await expect(page.frameLocator('iframe').getByText(/Thuế VAT \(/)).toHaveCount(0);
  await toggle.check();
  const rate = main(page).getByRole('group', { name: 'Thuế suất VAT khi xuất' }).locator('input');
  await rate.fill('8'); await rate.blur();
  await expect(page.frameLocator('iframe').getByText('Thuế VAT (8%):', { exact: true })).toBeVisible();
  await toggle.uncheck();
  await expect(page.frameLocator('iframe').getByText(/Thuế VAT \(/)).toHaveCount(0);
  const downloading = page.waitForEvent('download');
  await main(page).getByRole('button', { name: 'Tải HTML', exact: true }).click();
  const download = await downloading; const content = await readFile(await download.path(), 'utf8');
  expect(content).not.toContain('Thuế VAT ('); expect(content).not.toContain('<div class="customer-box">');
  const saved = await api(request, 'GET', `/quoting/quotations/${id}`);
  expect(saved.taxPercent).toBe(0); expect(saved.totalAmount).toBe(36000);
});


test('mobile products show every field and usable actions without horizontal columns', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith('desktop'));
  await open(page, '/products', 'Danh mục sản phẩm');
  const item = main(page).getByLabel('Sản phẩm CB-01', { exact: true });
  await expect(item).toBeVisible();
  for (const text of ['Nhóm sản phẩm:', 'Đơn vị tính:', 'Giá danh mục:', 'Đang bán']) await expect(item).toContainText(text);
  await expect(item.getByRole('button', { name: 'Sửa COMBO NGUYÊN BẢN BAO NGON', exact: true })).toBeVisible();
  const image = item.locator('img'); await expect(image).toHaveJSProperty('complete', true); await expect(image).not.toHaveJSProperty('naturalWidth', 0);
  await page.screenshot({ path: testInfo.outputPath('mobile-products.png'), fullPage: true });
  await noPageOverflow(page);
});

test('support request reaches Kanban and can be processed, completed and reopened', async ({ page, request }, testInfo) => {
  const topic = `Hỗ trợ ${unique()}`;
  const created = await api(request, 'POST', '/quoting/support-requests', { fullName: 'Nguyễn Thị Hồng', email: 'kanban@example.test', phone: '0901234567', topic, priority: 'urgent', message: 'Cần kiểm tra ảnh HTML và tiếng Việt trong PDF.' });
  await open(page, '/support', 'Xử lý hỗ trợ');
  await main(page).getByLabel('Tìm yêu cầu hỗ trợ', { exact: true }).fill(topic);
  let card = page.getByRole('region', { name: 'Mới', exact: true }).getByLabel('Yêu cầu của Nguyễn Thị Hồng');
  await expect(card).toContainText(topic);
  await card.getByRole('button', { name: 'Bắt đầu xử lý', exact: true }).click();
  if (!testInfo.project.name.startsWith('desktop')) await main(page).getByRole('radio', { name: /Đang xử lý/ }).click();
  card = page.getByRole('region', { name: 'Đang xử lý', exact: true }).getByLabel('Yêu cầu của Nguyễn Thị Hồng');
  await expect(card).toContainText(topic);
  await card.getByRole('button', { name: 'Đánh dấu đã xử lý', exact: true }).click();
  if (!testInfo.project.name.startsWith('desktop')) await main(page).getByRole('radio', { name: /Đã xử lý/ }).click();
  card = page.getByRole('region', { name: 'Đã xử lý', exact: true }).getByLabel('Yêu cầu của Nguyễn Thị Hồng');
  await expect(card).toContainText('Đã xử lý:');
  const saved = await api(request, 'GET', `/quoting/support-requests?status=Resolved&searchTerm=${encodeURIComponent(topic)}`);
  expect(saved.data[0].id).toBe(created.id); expect(saved.data[0].resolvedByUserId).toBeTruthy(); expect(saved.data[0].revision).toBe(2);
  await page.screenshot({ path: testInfo.outputPath('support-board.png'), fullPage: true });
  await card.getByRole('button', { name: 'Xem chi tiết', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Chi tiết yêu cầu hỗ trợ' })).toContainText('0901234567');
  await page.getByRole('dialog').getByRole('button', { name: 'Đóng', exact: true }).click();
  await card.getByRole('button', { name: 'Mở lại yêu cầu', exact: true }).click();
  if (!testInfo.project.name.startsWith('desktop')) await main(page).getByRole('radio', { name: /Mới/ }).click();
  await expect(page.getByRole('region', { name: 'Mới', exact: true })).toContainText(topic);
  await noPageOverflow(page);
});

test('downloaded HTML opens with product image while offline', async ({ page, request, browser }) => {
  const product = (await api(request, 'GET', '/quoting/products')).find((product) => product.code === 'CB-01');
  const id = await api(request, 'POST', '/quoting/quotations', { issueDate: new Date().toISOString(), items: [{ productCode: product.code, productName: product.name, imageUrl: product.imageUrl, unit: product.unit, quantity: 1, unitPrice: product.price }] });
  const file = await api(request, 'POST', `/quoting/quotations/${id}/export`, { fileType: 'html' });
  const response = await request.get(`/api/v1/quoting/quotations/${id}/files/${file.id}/download`, { headers: { Authorization: `Bearer ${token}` } });
  const html = await response.text(); expect(html).toContain('src="data:image/png;base64,');
  const context = await browser.newContext({ offline: true });
  try { const filePage = await context.newPage(); await filePage.setContent(html); const image = filePage.locator('img').first(); await expect(image).toHaveJSProperty('complete', true); await expect(image).not.toHaveJSProperty('naturalWidth', 0); } finally { await context.close(); }
});
