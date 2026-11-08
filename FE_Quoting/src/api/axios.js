import axios from 'axios';
import { readAuthToken, clearAuthSession } from '../utils/authStorage';
import { readApiError } from './apiError';

import { apiBaseUrl } from './apiUrl';

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
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
  async (response) => {
    if (response.data?.isFailure === true || response.data?.isSuccess === false) {
      throw new Error(await readApiError(response.data, 'Không thể thực hiện thao tác. Vui lòng thử lại.'));
    }
    return response;
  },
  async (error) => {
    let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại!';

    if (error.response) {
      const statusMessages = { 400: 'Dữ liệu chưa hợp lệ. Kiểm tra các trường và thử lại.', 401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 403: 'Bạn không có quyền thực hiện thao tác này.', 404: 'Không tìm thấy dữ liệu yêu cầu.', 409: 'Dữ liệu đã thay đổi hoặc bị trùng. Tải lại trang và thử lại.', 500: 'Máy chủ chưa thể xử lý yêu cầu. Vui lòng thử lại.' };
      errorMessage = await readApiError(error.response.data, statusMessages[error.response.status] || errorMessage);
    } else if (error.request) {
      errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!';
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;

    if (enhancedError.status === 401 && !error.config?.url?.startsWith('/auth/login')) {
      clearAuthSession();
      window.dispatchEvent(new Event('quoting:session-expired'));
    }

    return Promise.reject(enhancedError);
  }
);

export default axiosInstance;
