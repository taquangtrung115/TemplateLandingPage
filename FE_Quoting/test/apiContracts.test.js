import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import client from '../src/api/axios';
import { quotationApi } from '../src/api/quotationApi';
import { quotingProductApi } from '../src/api/quotingProductApi';
import { quotingCustomerApi } from '../src/api/quotingCustomerApi';
import { quotingTemplateApi } from '../src/api/quotingTemplateApi';
import { quotingSupportApi } from '../src/api/quotingSupportApi';
import { readApiError } from '../src/api/apiError';
import { writeAuthSession, readAuthToken, clearAuthSession } from '../src/utils/authStorage';

const originalAdapter = client.defaults.adapter;
let requests;
beforeEach(() => {
  requests = [];
  client.defaults.adapter = async (config) => { requests.push(config); return { config, status: 200, headers: {}, data: { isSuccess: true, value: 'result-id' } }; };
});
afterEach(() => { client.defaults.adapter = originalAdapter; clearAuthSession(); });

describe('Real FE service request contracts', () => {
  const body = { name: 'Test' };
  it.each([
    ['create quote', () => quotationApi.createQuotation(body), 'post', '/quoting/quotations', body],
    ['update quote', () => quotationApi.updateQuotation('q', body), 'put', '/quoting/quotations/q', body],
    ['change status', () => quotationApi.changeStatus('q', 'Sent', 'Đã gửi'), 'put', '/quoting/quotations/q/status', { status: 'Sent', reason: 'Đã gửi' }],
    ['PDF export', () => quotationApi.exportFile('q', 'pdf'), 'post', '/quoting/quotations/q/export', { fileType: 'pdf' }],
    ['HTML export', () => quotationApi.exportFile('q', 'html'), 'post', '/quoting/quotations/q/export', { fileType: 'html' }],
    ['create product', () => quotingProductApi.createProduct(body), 'post', '/quoting/products', body],
    ['update product', () => quotingProductApi.updateProduct('p', body), 'put', '/quoting/products/p', body],
    ['create customer', () => quotingCustomerApi.createCustomer(body), 'post', '/quoting/customers', body],
    ['update customer', () => quotingCustomerApi.updateCustomer('c', body), 'put', '/quoting/customers/c', body],
    ['create template', () => quotingTemplateApi.createTemplate(body), 'post', '/quoting/templates', body],
    ['template version', () => quotingTemplateApi.createVersion('t', body), 'post', '/quoting/templates/t/versions', body],
    ['update template', () => quotingTemplateApi.updateTemplate('t', body), 'put', '/quoting/templates/t', body],
    ['support', () => quotingSupportApi.submitRequest(body), 'post', '/quoting/support-requests', body],
  ])('%s sends the flat DTO and unwraps Result.Value once', async (_, call, method, url, payload) => {
    expect(await call()).toBe('result-id');
    expect(requests[0].method).toBe(method);
    expect(requests[0].url).toBe(url);
    expect(JSON.parse(requests[0].data)).toEqual(payload);
  });
  it.each([
    [() => quotationApi.getQuotations({ page: 3, pageSize: 20 }), '/quoting/quotations'],
    [() => quotationApi.getSummary(), '/quoting/quotations/summary'],
    [() => quotationApi.getQuotationById('q'), '/quoting/quotations/q'],
    [() => quotationApi.previewQuotation('q'), '/quoting/quotations/q/preview'],
    [() => quotationApi.getHistories('q'), '/quoting/quotations/q/histories'],
    [() => quotationApi.getFiles('q'), '/quoting/quotations/q/files'],
    [() => quotingProductApi.getProducts(), '/quoting/products'],
    [() => quotingProductApi.getProductById('p'), '/quoting/products/p'],
    [() => quotingCustomerApi.getCustomers(), '/quoting/customers'],
    [() => quotingCustomerApi.getCustomerById('c'), '/quoting/customers/c'],
    [() => quotingTemplateApi.getTemplates(), '/quoting/templates'],
    [() => quotingTemplateApi.getTemplateById('t'), '/quoting/templates/t'],
    [() => quotingTemplateApi.getTemplateVersion('t', 2), '/quoting/templates/t/versions/2'],
  ])('reads %s through the shared client', async (call, url) => { await call(); expect(requests[0].url).toBe(url); expect(requests[0].method).toBe('get'); });
  it.each([
    [() => quotationApi.deleteQuotation('q'), '/quoting/quotations/q'],
    [() => quotingProductApi.deleteProduct('p'), '/quoting/products/p'],
    [() => quotingCustomerApi.deleteCustomer('c'), '/quoting/customers/c'],
  ])('deletes through %s', async (call, url) => { await call(); expect(requests[0]).toMatchObject({ method: 'delete', url }); });
  it('downloads a binary file with JWT through the authorized endpoint', async () => {
    writeAuthSession('test-token', { role: 'User' });
    await quotationApi.downloadFile('q', 'f');
    expect(requests[0]).toMatchObject({ url: '/quoting/quotations/q/files/f/download', responseType: 'blob' });
    expect(requests[0].headers.Authorization).toBe('Bearer test-token');
  });
  it('rejects an application failure carried by HTTP 200', async () => {
    client.defaults.adapter = async (config) => ({ config, status: 200, headers: {}, data: { isFailure: true, error: { message: 'Không thể lưu' } } });
    await expect(quotationApi.createQuotation({})).rejects.toThrow('Không thể lưu');
  });
  it('expires the local session on HTTP 401', async () => {
    writeAuthSession('expired-token', { role: 'User' });
    const expired = vi.fn(); window.addEventListener('quoting:session-expired', expired);
    client.defaults.adapter = async (config) => { throw { config, response: { status: 401, data: { title: 'Phiên hết hạn' } } }; };
    await expect(quotationApi.getQuotations()).rejects.toMatchObject({ status: 401 });
    expect(readAuthToken()).toBeNull(); expect(expired).toHaveBeenCalledOnce();
    window.removeEventListener('quoting:session-expired', expired);
  });
  it.each([
    [{ Error: { Message: 'Lỗi nghiệp vụ' } }, 'Lỗi nghiệp vụ'],
    [{ Errors: [{ Message: 'Thiếu tên' }] }, 'Thiếu tên'],
    [{ errors: { Email: ['Email sai'] } }, 'Email sai'],
    [{ Detail: 'Dữ liệu không hợp lệ' }, 'Dữ liệu không hợp lệ'],
    [{}, 'Thử lại'],
    [{ errors: {} }, 'Thử lại'],
    [{ Errors: [] }, 'Thử lại'],
    [{ Detail: 'The request body or parameters are invalid.' }, 'Dữ liệu gửi lên chưa hợp lệ. Kiểm tra các trường và thử lại.'],
    [{ Detail: 'An unexpected error occurred on the server.' }, 'Máy chủ chưa thể xử lý yêu cầu. Vui lòng thử lại.'],
  ])('normalizes the shared BE error shape', async (data, message) => { expect(await readApiError(data, 'Thử lại')).toBe(message); });
});
