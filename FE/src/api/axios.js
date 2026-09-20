import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }

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

    return Promise.reject(enhancedError);
  }
);

export default axiosInstance;
