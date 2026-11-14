import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const gateway = 'http://127.0.0.1:54622';
const landing = 'http://127.0.0.1:5183';
const quoting = 'http://127.0.0.1:5184';
const email = 'platform@oneportal.test';
const password = 'Synthetic-password-123!';
let token, companyA, companyB, productA, templateA;

async function api(request, method, route, data, origin = gateway) {
  const response = await request.fetch(origin + route, { method, data, headers: token ? { Authorization: `Bearer ${token}` } : {} });
  expect(response.ok(), `${method} ${route}: ${await response.text()}`).toBeTruthy();
  const body = await response.json(); expect(body.isFailure).not.toBe(true); return body.value ?? body;
}
const root = (company, app = 'quoting') => `/t/${company.key}/api/v1/${app}`;
async function login(page) {
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.locator('input[type=password]').fill(password);
  await page.getByRole('button', { name: /^Đăng nhập$/i }).click();
}

test.beforeAll(async ({ request }, worker) => {
  token = null;
  token = (await api(request, 'POST', '/api/v1/auth/login', { email, password })).token;
  const serial = Date.now().toString(36) + '-' + worker.project.name;
  async function company(suffix) {
    const key = `pw-${serial}-${suffix}`;
    return (await api(request, 'POST', '/api/v1/platform/tenants', { key, name: `Browser ${suffix} ${serial}`, applications: ['landing', 'quoting'], adminEmail: email })).tenant;
  }
  companyA = await company('a'); companyB = await company('b');
  const groupA = (await api(request, 'GET', root(companyA) + '/product-groups')).groups[0];
  const groupB = (await api(request, 'GET', root(companyB) + '/product-groups')).groups[0];
  productA = await api(request, 'POST', root(companyA) + '/products', { code: 'BROWSER-PRODUCT', name: 'Only company A', unit: 'Unit', price: 25000, groupId: groupA.id });
  await api(request, 'POST', root(companyB) + '/products', { code: 'BROWSER-PRODUCT', name: 'Only company B', unit: 'Unit', price: 90000, groupId: groupB.id });
  templateA = (await api(request, 'GET', root(companyA, 'landing') + '/templates'))[0];
  const secondEmail = `admin-${serial}@oneportal.test`;
  await api(request, 'POST', '/api/v1/platform/users', { email: secondEmail, password, fullName: 'Other Administrator', role: 'User' });
  await api(request, 'PUT', `/api/v1/platform/tenants/${companyB.id}/applications/quoting/members`, { email: secondEmail, role: 'Admin', isActive: true });
  await api(request, 'PUT', `/api/v1/platform/tenants/${companyB.id}/applications/quoting/members`, { email, role: 'User', isActive: true });
});

test('Gateway validates signatures, exposes trace and CORS, and preserves server tenant authorization', async ({ request }) => {
  const route = gateway + '/api/v1/platform/tenants';
  const anonymous = await request.get(route);
  expect(anonymous.status()).toBe(401);
  const forged = await request.get(route, { headers: { Authorization: `Bearer ${token.slice(0, -8)}forged00` } });
  expect(forged.status()).toBe(401);
  const valid = await request.get(route, { headers: { Authorization: `Bearer ${token}`, Origin: 'http://127.0.0.1:5185' } });
  expect(valid.ok()).toBeTruthy(); expect(valid.headers()['x-trace-id']).toBeTruthy();
  expect(valid.headers()['access-control-allow-origin']).toBe('http://127.0.0.1:5185');
  const escalation = await request.post(gateway + root(companyB) + '/products', {
    headers: { Authorization: `Bearer ${token}`, 'X-Tenant-Key': companyA.key, 'X-Tenant-Id': companyA.id, 'X-Role': 'Admin' },
    data: { code: 'FORGED', name: 'Denied', unit: 'Unit', price: 1 },
  });
  expect(escalation.status()).toBe(403);
});

test('FE_Tenant creates and seeds a workspace through the real Gateway and backend', async ({ page }, testInfo) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await login(page);
  await expect(page.getByRole('heading', { name: 'Công ty & workspace' })).toBeVisible();
  await page.getByRole('button', { name: 'Tạo workspace', exact: true }).click();
  const key = 'ui-' + Date.now().toString(36) + '-' + testInfo.project.name;
  await page.getByLabel('Tên công ty', { exact: true }).fill('UI ' + key);
  await page.getByLabel('Mã workspace', { exact: true }).fill(key);
  await page.getByLabel('Email quản trị viên đã có', { exact: true }).fill(email);
  await page.getByLabel('Landing', { exact: true }).check();
  await page.getByRole('button', { name: 'Tạo & khởi tạo dữ liệu', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Đã tạo workspace');
  await page.getByRole('button', { name: new RegExp('UI ' + key) }).click();
  await expect(page.getByText('Ready · Seed v1')).toHaveCount(2);
  await expect(page.getByRole('heading', { name: /Thành viên/ })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('tenant-admin.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('FE_Quoting switches company data and effective role without sharing records', async ({ page }) => {
  await page.goto(`${quoting}/t/${companyA.key}/products`); await login(page);
  await expect(page.getByText('Only company A', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Thêm sản phẩm', exact: true })).toBeEnabled();
  await page.getByLabel('Workspace', { exact: true }).selectOption(companyB.key);
  await expect(page).toHaveURL(new RegExp(`/t/${companyB.key}/products$`));
  await expect(page.getByText('Only company B', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Only company A', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Thêm sản phẩm', exact: true })).toBeDisabled();
});

test('FE_TemplateLandingPage keeps guest drafts scoped and resumes the server-save flow after login', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${landing}/t/${companyA.key}/customize/${templateA.id}`);
  await expect(page.getByRole('heading', { name: /Workspace starter/ }).first()).toBeVisible();
  await page.getByTitle('Lưu bản nháp và mở danh sách', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bản nháp trên thiết bị này' })).toBeVisible();
  await expect(page.getByText(/Workspace starter/).first()).toBeVisible();
  await page.goto(`${landing}/t/${companyB.key}/drafts`);
  await expect(page.getByRole('heading', { name: 'Bản nháp trên thiết bị này' })).toBeVisible();
  await expect(page.getByText(/Workspace starter/)).toHaveCount(0);
  await page.goto(`${landing}/t/${companyA.key}/customize/${templateA.id}`);
  await expect(page.getByRole('button', { name: 'Lưu server', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Lưu server', exact: true }).click();
  await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
  await login(page);
  await expect(page.getByText('Đã lưu bản nháp làm việc trên máy chủ.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Tạo version', exact: true }).click();
  await expect(page.getByText('Đã tạo phiên bản v1.', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('quotation creation and PDF export survive another API replica and reject another company download', async ({ page, request }, testInfo) => {
  const quoteRoot = root(companyA);
  const template = (await api(request, 'GET', quoteRoot + '/templates'))[0];
  await page.goto(`${quoting}/t/${companyA.key}/quotations/create`); await login(page);
  await expect(page.getByRole('heading', { name: 'Tạo báo giá', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Chọn sản phẩm', exact: true }).click();
  await page.getByRole('option', { name: /BROWSER-PRODUCT.*Only company A/ }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('main').getByRole('button', { name: 'Tạo báo giá', exact: true }).click();
  await page.waitForURL(/\/quotations\/[a-f0-9-]{36}$/);
  const quotationId = page.url().split('/').at(-1);
  const saved = await api(request, 'GET', quoteRoot + '/quotations/' + quotationId);
  expect(saved.items[0].productId).toBe(productA); expect(saved.templateId).toBe(template.id);
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Tải PDF', exact: true }).first().click();
  const download = await downloading; const filename = testInfo.outputPath('tenant-quotation.pdf');
  await download.saveAs(filename); expect((await readFile(filename)).subarray(0, 4).toString()).toBe('%PDF');
  const files = await api(request, 'GET', quoteRoot + '/quotations/' + quotationId + '/files');
  expect(files.length).toBeGreaterThan(0); expect(files.at(-1).storageProvider).toBe('Supabase');
  const path = quoteRoot + '/quotations/' + quotationId + '/files/' + files.at(-1).id + '/download';
  const replica = await request.get('http://127.0.0.1:54623' + path, { headers: { Authorization: `Bearer ${token}` } });
  expect(replica.ok()).toBeTruthy(); expect((await replica.body()).subarray(0, 4).toString()).toBe('%PDF');
  const wrong = await request.get(gateway + root(companyB) + '/quotations/' + quotationId + '/files/' + files.at(-1).id + '/download', { headers: { Authorization: `Bearer ${token}` } });
  expect(wrong.status()).toBe(404);
});
