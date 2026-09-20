import axiosInstance from './axios';

const productApi = {
  getProducts: () => axiosInstance.get('/products'),
  getProductById: (id) => axiosInstance.get(`/products/${id}`),
  createProduct: (data) => axiosInstance.post('/products', data),
  updateProduct: (id, data) => axiosInstance.put(`/products/${id}`, data),
  deleteProduct: (id) => axiosInstance.delete(`/products/${id}`)
};

export default productApi;
