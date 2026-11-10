import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

let token;
async function api(request, method, route, data) {
  const response = await request.fetch(`/api/v1${route}`, { method, data, headers: token ? { Authorization: `Bearer ${token}` } : {} });
  expect(response.ok(), `${method} ${route}: ${await response.text()}`).toBeTruthy();
  const json = await response.json();
  return json.value ?? json;
}

test.beforeEach(async ({ page, request }, testInfo) => {
  token = null;
  const session = await api(request, 'POST', '/auth/login', { email: process.env.QUOTING_E2E_EMAIL, password: process.env.QUOTING_E2E_PASSWORD });
  token = session.token;
  await page.addInitScript(({ session, mode }) => {
    if (window.top !== window.self) return;
    localStorage.setItem('token', session.token); localStorage.setItem('user', JSON.stringify(session.user));
    localStorage.setItem('quoting.colorMode', mode);
  }, { session, mode: testInfo.project.name.includes('dark') ? 'dark' : 'light' });
});

for (const width of [320, 375, 414, 768, 1440]) {
  test(`group selection, optional columns, fixed controls and preview at ${width}px`, async ({ page, request }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const catalog = await api(request, 'GET', '/quoting/products');
    const comboCount = catalog.filter((product) => product.category === 'A/ DÒNG COMBO').length;
    const errors = []; page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/quotations/create');
    await expect(page.getByRole('heading', { name: 'Tóm tắt báo giá' })).toBeVisible();
    await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
    await page.getByRole('button', { name: /^Thêm theo nhóm sản phẩm/ }).click();
    await page.screenshot({ path: testInfo.outputPath(`group-menu-${width}.png`) });
    await page.getByRole('option', { name: 'A/ DÒNG COMBO', exact: true }).click({ timeout: 8000 });
    await expect(page.getByText(`Đã chọn ${comboCount} sản phẩm.`, { exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'Thêm cả nhóm', exact: true }).click();
    await expect(page.getByText(`Đã chọn ${comboCount} sản phẩm.`, { exact: false })).toBeVisible();
    for (const label of ['Hiển thị CK (%)', 'Hiển thị Số lượng', 'Hiển thị Tạm tính hàng hóa', 'Hiển thị TỔNG CỘNG'])
      await expect(page.getByRole('switch', { name: label, exact: true })).not.toBeChecked();
    const editor = page.locator('.quotation-step-content');
    if (width < 768) { await expect(editor.getByRole('table')).toHaveCount(0); await expect(editor.getByLabel('Danh sách trên điện thoại')).toBeVisible(); }
    else { await expect(editor.getByRole('table')).toBeVisible(); await expect(editor.getByRole('columnheader', { name: 'Thao tác' })).toHaveCSS('position', 'sticky'); }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const footer = await page.locator('.quotation-wizard-footer').boundingBox();
    expect(footer.y + footer.height).toBeLessThanOrEqual(901);
    expect(footer.y + footer.height).toBeGreaterThanOrEqual(899);
    const header = await page.locator('.quotation-wizard-top').boundingBox();
    expect(header.y).toBeGreaterThanOrEqual(-1); expect(header.y + header.height).toBeLessThan(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await page.screenshot({ path: testInfo.outputPath(`editor-${width}.png`), fullPage: true });
    await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
    await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
    const preview = page.frameLocator('iframe[title="Bản xem trước trước khi tạo"]');
    await expect(preview.getByRole('heading', { name: 'BẢNG BÁO GIÁ', exact: true })).toBeVisible();
    await expect(preview.getByRole('columnheader', { name: 'CK (%)', exact: true })).toHaveCount(0);
    await expect(preview.getByRole('columnheader', { name: 'Số lượng', exact: true })).toHaveCount(0);
    await expect(preview.getByText('TỔNG CỘNG:', { exact: true })).toHaveCount(0);
    await expect(preview.getByText('Tạm tính hàng hóa:', { exact: true })).toHaveCount(0);
    await page.locator('.quotation-wizard-footer').getByRole('button', { name: 'Tạo báo giá', exact: true }).click();
    await page.waitForURL(/\/quotations\/[a-f0-9-]+$/);
    const id = page.url().split('/').pop();
    const saved = await api(request, 'GET', `/quoting/quotations/${id}`);
    expect(saved.items).toHaveLength(comboCount); expect(saved.showDiscount).toBe(false); expect(saved.showGrandTotal).toBe(false);
    expect(saved.items.every((item) => item.quantity === 1 && item.discountPercent === 0)).toBe(true);
    await page.goto('/quotations');
    if (width < 768) { await expect(page.getByRole('table')).toHaveCount(0); await expect(page.getByLabel('Danh sách trên điện thoại')).toBeVisible(); }
    else await expect(page.getByRole('table')).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`list-${width}.png`), fullPage: true });
    if (width === 1440 && testInfo.project.name === 'desktop-light') {
      const exported = await api(request, 'POST', `/quoting/quotations/${id}/export`, { fileType: 'pdf' });
      const response = await request.get(`/api/v1/quoting/quotations/${id}/files/${exported.id}/download`, { headers: { Authorization: `Bearer ${token}` } });
      expect(response.ok()).toBe(true);
      await writeFile(path.resolve('../PromtAI/.codex/results/quoting-groups-options-20261110/quotation-default.pdf'), await response.body());
    }
    expect(errors).toEqual([]);
  });
}

test('group admin CRUD and product group dropdown', async ({ page, request }) => {
  const code = `QA-${Date.now()}`;
  const groupName = `Dòng kiểm tra ${code}`;
  await page.goto('/product-groups');
  await page.getByRole('button', { name: 'Thêm nhóm', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Thêm nhóm sản phẩm' });
  await drawer.getByLabel('Mã nhóm', { exact: true }).fill(code);
  await drawer.getByLabel('Tên nhóm', { exact: true }).fill(groupName);
  await drawer.getByLabel('Thứ tự hiển thị', { exact: true }).fill('0');
  await drawer.getByLabel('Thứ tự hiển thị', { exact: true }).blur();
  await drawer.getByRole('button', { name: 'Lưu nhóm', exact: true }).click();
  await expect(drawer).not.toBeVisible();
  const groups = await api(request, 'GET', '/quoting/product-groups');
  const created = groups.groups.find((group) => group.code === code);
  expect(created.sortOrder).toBe(0);
  await page.goto('/products');
  await page.getByRole('button', { name: 'Thêm sản phẩm', exact: true }).click();
  const product = page.getByRole('dialog', { name: 'Thêm sản phẩm' });
  await product.getByRole('button', { name: /^Nhóm sản phẩm/ }).click();
  await page.getByRole('option', { name: groupName, exact: true }).click();
  await product.getByLabel('Tên sản phẩm', { exact: true }).fill('Sản phẩm chọn nhóm');
  await product.getByRole('button', { name: 'Lưu sản phẩm', exact: true }).click();
  await expect(product).not.toBeVisible();
  const products = await api(request, 'GET', '/quoting/products');
  const saved = products.find((product) => product.name === 'Sản phẩm chọn nhóm' && product.groupId === created.id);
  expect(saved).toBeTruthy();
  await api(request, 'DELETE', `/quoting/products/${saved.id}`);
  await api(request, 'DELETE', `/quoting/product-groups/${created.id}`);
});
