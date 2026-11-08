import axiosInstance from './axios';

export const quotingProductApi = {
  getProducts: async (params = {}) => {
    const response = await axiosInstance.get('/quoting/products', { params });
    return response.data?.value ?? response.data;
  },

  getProductById: async (id) => {
    const response = await axiosInstance.get(`/quoting/products/${id}`);
    return response.data?.value ?? response.data;
  },

  createProduct: async (data) => {
    const response = await axiosInstance.post('/quoting/products', data);
    return response.data?.value ?? response.data;
  },

  updateProduct: async (id, data) => {
    const response = await axiosInstance.put(`/quoting/products/${id}`, data);
    return response.data?.value ?? response.data;
  },

  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/quoting/products/${id}`);
    return response.data?.value ?? response.data;
  },
};

export default quotingProductApi;
