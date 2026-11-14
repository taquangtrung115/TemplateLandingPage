import axios from 'axios';
const configured = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
export const client = axios.create({ baseURL: configured.endsWith('/api/v1') ? configured : configured + '/api/v1', timeout: 120000 });
client.interceptors.request.use(config => { const token = localStorage.getItem('oneportal.tenant.token'); if (token) config.headers.Authorization = 'Bearer ' + token; return config; });
client.interceptors.response.use(response => {
  if (response.data?.isFailure || response.data?.isSuccess === false) throw new Error(response.data.error?.message || 'Không thể thực hiện thao tác.');
  return response.data?.value ?? response.data;
}, error => {
  if (error.response?.status === 401) { localStorage.removeItem('oneportal.tenant.token'); window.dispatchEvent(new Event('tenant:session-expired')); }
  const normalized = new Error(error.response?.data?.error?.message || error.response?.data?.errors?.map(item => item.message).filter(Boolean).join(' ') || (error.response?.status === 403 ? 'Bạn không có quyền quản trị nền tảng.' : 'Không thể kết nối máy chủ. Vui lòng thử lại.'));
  normalized.status = error.response?.status; return Promise.reject(normalized);
});
