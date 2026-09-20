import axiosInstance from './axios';

const productApi = {
  getProducts: () => axiosInstance.get('/api/v1/products'),
  getProductById: (id) => axiosInstance.get(`/api/v1/products/${id}`),
  createProduct: (data) => axiosInstance.post('/api/v1/products', data),
  updateProduct: (id, data) => axiosInstance.put(`/api/v1/products/${id}`, data),
  deleteProduct: (id) => axiosInstance.delete(`/api/v1/products/${id}`)
};

export default productApi;
