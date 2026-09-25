import axios from 'axios';
import { readAuthToken } from '../utils/authStorage';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
const baseURL = rawBaseUrl
  ? (rawBaseUrl.endsWith('/api/v1') ? rawBaseUrl : `${rawBaseUrl.replace(/\/+$/, '')}/api/v1`)
  : '/api/v1';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = readAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại!';

    if (error.response) {
      const data = error.response.data;
      if (data?.errors && Array.isArray(data.errors)) {
        errorMessage = data.errors.map(e => e.message || e.errorMessage || e).join('\n');
      } else if (data?.error?.message) {
        errorMessage = data.error.message;
      } else if (data?.title) {
        errorMessage = data.title;
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
    } else if (error.request) {
      errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!';
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;

    return Promise.reject(enhancedError);
  }
);

export default axiosInstance;
