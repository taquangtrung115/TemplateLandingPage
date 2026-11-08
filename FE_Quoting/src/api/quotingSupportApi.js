import axiosInstance from './axios';

export const quotingSupportApi = {
  async searchRequests(params) {
    const response = await axiosInstance.get('/quoting/support-requests', { params });
    return response.data?.value ?? response.data;
  },
  async changeStatus(id, status, expectedRevision) {
    const response = await axiosInstance.put(`/quoting/support-requests/${id}/status`, { status, expectedRevision });
    return response.data?.value ?? response.data;
  },
  async submitRequest(request) {
    const response = await axiosInstance.post('/quoting/support-requests', request);
    return response.data?.value ?? response.data;
  },
};
