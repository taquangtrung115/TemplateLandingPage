import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const output = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(root, 'FE_Tenant/node_modules/playwright'));
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
const widths = [1440, 768, 390, 320];
const photo = 'http://127.0.0.1:5177';
const tenant = 'http://127.0.0.1:5175';
const failures = [];
const errors = [];
let comparisons = 0;

async function check(page, target, width, mode, heading) {
  await page.setViewportSize({ width, height: 930 });
  await page.goto(target, { waitUntil: 'domcontentloaded' });
  await page.locator('h1').waitFor();
  if (heading) await page.getByRole('heading', { name: heading, exact: true }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  const result = await page.evaluate(() => ({
    inner: innerWidth, scroll: document.documentElement.scrollWidth, body: document.body.scrollWidth,
      offenders: Array.from(document.querySelectorAll('main :is(button, a, input, article, section, h1)'))
      .filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.right > innerWidth + 1 && !element.closest('.cr-switcher,.user-matrix-wrap,.stride-arc,.stride-shop-grid');
      }).slice(0, 4).map(element => element.className + ' ' + element.textContent.trim().slice(0, 35)),
  }));
  comparisons++;
  if (result.scroll > result.inner || result.body > result.inner || result.offenders.length) failures.push({ target, width, mode, ...result });
}

try {
  const photoContext = await browser.newContext({ reducedMotion: 'reduce' });
  const photoPage = await photoContext.newPage();
  photoPage.on('pageerror', error => errors.push(error.message));
  await photoPage.goto(photo);
  await photoPage.locator('.stride-combo-choices button').first().waitFor();
  await photoPage.getByRole('button', { name: 'Lật 180°', exact: true }).click();
  assert.equal(await photoPage.locator('.stride-hero-target .stride-print').getAttribute('data-flipped'), 'true');
  const ratio = await photoPage.locator('.stride-hero-target .stride-print').evaluate(element => element.offsetHeight / element.offsetWidth);
  assert.ok(Math.abs(ratio - 1.36) < 0.015, `Print board ratio ${ratio}`);
  const choices = photoPage.locator('.stride-combo-choices button');
  for (let index = 0; index < 3; index++) await choices.nth(index).click();
  await photoPage.getByRole('button', { name: /Thêm combo ·/ }).click();
  await photoPage.getByRole('button', { name: /Giỏ hàng,/ }).click();
  await photoPage.getByText('Giảm giá Combo 3').waitFor();
  await photoPage.getByRole('link', { name: 'Xem chi tiết giỏ' }).click();
  await photoPage.getByRole('link', { name: 'Tiếp tục đặt in' }).click();
  await photoPage.getByLabel('Họ và tên').fill('Khách thử giao dịch');
  await photoPage.getByLabel('Số điện thoại', { exact: true }).fill('0904567890');
  await photoPage.getByRole('button', { name: 'Gửi đơn đặt in' }).click();
  await photoPage.getByAltText('Mã QR chuyển khoản VietQR').waitFor();
  await photoPage.screenshot({ path: path.join(output, 'photo-vietqr.png') });
  await photoPage.getByRole('button', { name: 'Xác nhận đã chuyển khoản & Ghi nhận giao dịch' }).click();
  await photoPage.getByText(/Đã ghi nhận giao dịch · Chờ đối soát/).waitFor();
  const orderCode = await photoPage.locator('#pay-dlg .price-summary dd').nth(1).innerText();
  await photoPage.getByRole('button', { name: 'Đóng', exact: true }).click();
  await photoPage.locator('main').getByRole('link', { name: 'Tra cứu đơn', exact: true }).click();
  await photoPage.getByLabel('Số điện thoại', { exact: true }).fill('0904567890');
  await photoPage.getByLabel('Số điện thoại', { exact: true }).press('Enter');
  await photoPage.getByText('Chờ đối soát', { exact: true }).waitFor({ timeout: 8000 });
  await photoPage.getByRole('link', { name: 'Đăng nhập', exact: true }).click();
  await photoPage.getByRole('button', { name: 'Vào quản trị demo' }).click();
  await photoPage.getByRole('link', { name: 'Giao dịch QR', exact: true }).click();
  await photoPage.getByRole('button', { name: 'Đánh dấu đã đối soát', exact: true }).click();
  await photoPage.getByRole('dialog').getByRole('button', { name: 'Đánh dấu đã đối soát', exact: true }).click();
  await photoPage.getByText('Đã đối soát giao dịch.', { exact: true }).waitFor();
  await photoPage.goBack();
  await photoPage.goBack();
  await photoPage.getByRole('heading', { name: 'Tra cứu đơn in' }).waitFor();
  await photoPage.getByLabel('Mã đơn').fill(orderCode);
  await photoPage.getByLabel('Số điện thoại', { exact: true }).fill('0904567890');
  await photoPage.getByLabel('Số điện thoại', { exact: true }).press('Enter');
  try { await photoPage.getByText('Đã thanh toán', { exact: true }).waitFor({ timeout: 5000 }); }
  catch (error) {
    const apiOrder = await photoPage.evaluate(async ({ code, phone }) => {
      const { photoOrderApi } = await import('/src/api/photoOrderApi.js');
      try { return await photoOrderApi.track({ code, phone }); } catch (failure) { return { failure: failure.message }; }
    }, { code: orderCode, phone: '0904567890' });
    console.error(JSON.stringify({ orderCode, location: photoPage.url(), text: await photoPage.locator('main').innerText(), apiOrder, errors }));
    throw error;
  }

  const photoRoutes = ['/', '/services', '/services/in-anh-10x15', '/demo', '/cart', '/checkout', '/orders/track', '/support', '/login', '/register',
    '/admin', '/admin/services', '/admin/demos', '/admin/orders', '/admin/payments', '/admin/support', '/admin/settings', '/admin/settings/members', '/admin/settings/registration'];
  for (const dark of [false, true]) {
    await photoPage.addInitScript(value => localStorage.setItem('photoprint.theme', value), dark ? 'dark' : 'light');
    for (const width of widths) {
      for (const route of photoRoutes) {
        await check(photoPage, photo + route, width, dark ? 'dark' : 'light');
        if (route === '/' && (width === 1440 || width === 390)) await photoPage.screenshot({ path: path.join(output, `photo-${dark ? 'dark' : 'light'}-${width}.png`) });
      }
    }
  }
  const photoWebgl = await browser.newPage();
  photoWebgl.on('pageerror', error => errors.push(error.message));
  await photoWebgl.goto(photo);
  await photoWebgl.locator('.stride-traveller canvas').waitFor();
  await photoWebgl.getByRole('button', { name: 'Lật 180°', exact: true }).click();
  await photoWebgl.getByRole('button', { name: 'Xem mặt trước', exact: true }).waitFor();
  await photoWebgl.screenshot({ path: path.join(output, 'photo-webgl-back.png') });

  const tenantPage = await browser.newPage({ reducedMotion: 'reduce' });
  tenantPage.on('pageerror', error => errors.push(error.message));
  const company = { id: 'local-tenant', key: 'minhtam', name: 'Tiệm ảnh Minh Tâm', isActive: true, activeMemberCount: 2,
    applications: [{ appKey: 'photoprint', isEnabled: true, provisioningStatus: 'Ready', seedVersion: 2 },
      { appKey: 'quoting', isEnabled: true, provisioningStatus: 'Ready', seedVersion: 1 }] };
  await tenantPage.addInitScript(() => localStorage.setItem('oneportal.tenant.token', 'local-browser-fixture'));
  await tenantPage.route(`${tenant}/api/v1/**`, async route => {
    const url = new URL(route.request().url()).pathname;
    const values = {
      '/api/v1/auth/me': { isPlatformAdmin: true },
      '/api/v1/platform/tenants': { items: [company] },
      '/api/v1/platform/tenants/by-key/minhtam': company,
      '/api/v1/platform/tenants/local-tenant': company,
      '/api/v1/platform/tenants/local-tenant/members': { pageSize: 20, totalCount: 2, items: [
        { id: 'test1', fullName: 'Nguyễn Minh Tâm', email: 'minhtam@example.test', accountIsActive: true, workspaceRole: 'Admin', applications: [] },
        { id: 'test2', fullName: 'Trần Hoài An', email: 'hoaian@example.test', accountIsActive: true, workspaceRole: 'User',
          applications: [{ appKey: 'photoprint', isActive: true, role: 'Admin' }] },
      ] },
    };
    await route.fulfill({ json: { isSuccess: true, value: values[url] }, status: values[url] ? 200 : 404 });
  });
  for (const width of widths) {
    for (const [route, heading] of [['/overview','Tổng quan công ty'], ['/tenants','Quản lý công ty'], ['/tenants/minhtam/apps','App Store'],
      ['/tenants/minhtam/members','Quản lý User'], ['/tenants/minhtam/settings','Cấu hình công ty']]) {
      await check(tenantPage, tenant + route, width, 'tenant', heading);
      if (route.endsWith('/members')) {
        await tenantPage.getByText('minhtam@example.test', { exact: true }).waitFor();
        if (width === 1440 || width === 390) await tenantPage.screenshot({ path: path.join(output, `tenant-users-${width}.png`) });
      }
    }
  }
  console.log(JSON.stringify({ comparisons, ratio, errors, failures }, null, 2));
  assert.equal(errors.length, 0);
  assert.equal(failures.length, 0);
} finally {
  await browser.close();
}
