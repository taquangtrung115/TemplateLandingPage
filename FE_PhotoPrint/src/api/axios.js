import axios from 'axios';
import { scopeRequest, assertCurrentScope } from '../utils/tenantScope';
import { readAuthToken } from '../utils/authStorage';

const client = axios.create({ timeout: 20000 });

client.interceptors.request.use(config => {
  scopeRequest(config);
  const token = readAuthToken();
  if (token && config.url !== '/auth/login') config.headers.Authorization = 'Bearer ' + token;
  return config;
});

const messageOf = data => {
  if (!data || typeof data !== 'object') return '';
  const errors = data.errors;
  if (Array.isArray(errors)) return errors.map(item => item.message || item.errorMessage || item).join(' ');
  if (errors && typeof errors === 'object') return Object.values(errors).flat().join(' ');
  return data.error?.message || data.title || '';
};

client.interceptors.response.use(assertCurrentScope, error => {
  if (error.code === 'ERR_CANCELED') throw error;
  assertCurrentScope(error.response || error);
  const status = error.response?.status;
  const fallback = status === 404 ? 'Máy chủ chưa có dữ liệu hoặc chưa bật Photo Print cho workspace này.'
    : status === 401 || status === 403 ? 'Phiên đăng nhập chưa có quyền thực hiện thao tác này.'
      : status === 409 ? 'Dữ liệu vừa được cập nhật. Vui lòng kiểm tra lại.'
        : status === 429 ? 'Bạn vừa gửi quá nhiều yêu cầu. Vui lòng thử lại sau.'
        : 'Không thể kết nối hoặc xử lý yêu cầu lúc này.';
  throw Object.assign(new Error(messageOf(error.response?.data) || fallback), { status });
});

export const isDemoMode = import.meta.env.DEV && import.meta.env.MODE === 'demo';

export async function request(method, url, { signal, params, data } = {}) {
  if (isDemoMode) {
    const { demoRequest } = await import('./demoTransport');
    const scope = scopeRequest({ url });
    const value = await demoRequest(method, url, { signal, params, data, workspace: scope.workspace });
    assertCurrentScope({ config: scope });
    return value;
  }
  const response = await client.request({ method, url, signal, params, data });
  const payload = response.data;
  if (typeof payload === 'string' && /<(?:!doctype|html)/i.test(payload)) {
    throw new Error('Gateway chưa trả dữ liệu Photo Print. Kiểm tra cấu hình API.');
  }
  if (payload?.isSuccess === false || payload?.isFailure === true) {
    throw new Error(messageOf(payload) || 'Yêu cầu không được xử lý.');
  }
  return payload && Object.prototype.hasOwnProperty.call(payload, 'value') ? payload.value : payload;
}
