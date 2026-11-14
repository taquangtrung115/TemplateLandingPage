import axiosInstance from './axios';

export const categoryApi = {
  getCategories: async (params = {}) => {
    const res = await axiosInstance.get('/categories', { params });
    return res.data?.value ?? res.data;
  },

  getCategoryById: async (id) => {
    const res = await axiosInstance.get(`/categories/${id}`);
    return res.data?.value ?? res.data;
  },

  getCategoryBySlug: async (slug) => {
    const res = await axiosInstance.get(`/categories/slug/${slug}`);
    return res.data?.value ?? res.data;
  },

  createCategory: async (data) => {
    const res = await axiosInstance.post('/categories', data);
    return res.data?.value ?? res.data;
  },

  updateCategory: async (id, data) => {
    const res = await axiosInstance.put(`/categories/${id}`, data);
    return res.data?.value ?? res.data;
  },

  deleteCategory: async (id) => {
    const res = await axiosInstance.delete(`/categories/${id}`);
    return res.data?.value ?? res.data;
  },
};

export default categoryApi;
