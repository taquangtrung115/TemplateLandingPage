import axiosInstance from './axios';

export const quotingProductGroupApi = {
  async getGroups(params = {}) {
    const response = await axiosInstance.get('/quoting/product-groups', { params });
    const result = response.data?.value ?? response.data;
    return result.groups;
  },
  async createGroup(data) {
    const response = await axiosInstance.post('/quoting/product-groups', data);
    return response.data?.value ?? response.data;
  },
  async updateGroup(id, data) {
    const response = await axiosInstance.put(`/quoting/product-groups/${id}`, data);
    return response.data?.value ?? response.data;
  },
  async deleteGroup(id) {
    const response = await axiosInstance.delete(`/quoting/product-groups/${id}`);
    return response.data?.value ?? response.data;
  },
};
