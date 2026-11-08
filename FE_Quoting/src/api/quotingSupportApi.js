import axiosInstance from './axios';

export const quotingSupportApi = {
  async submitRequest(request) {
    const response = await axiosInstance.post('/quoting/support-requests', request);
    return response.data?.value ?? response.data;
  },
};
