import axiosInstance from './axios';

export const customizationApi = {
  saveCustomization: async (data) => {
    const response = await axiosInstance.post('/customizations', data);
    return response.data;
  },

  updateCustomization: async (id, data) => {
    const response = await axiosInstance.put(`/customizations/${id}`, data);
    return response.data;
  },

  getCustomizationById: async (id) => {
    const response = await axiosInstance.get(`/customizations/${id}`);
    return response.data;
  },

  getCustomizationBySlug: async (slug) => {
    const response = await axiosInstance.get(`/customizations/slug/${slug}`);
    return response.data;
  },

  getMyCustomizations: async () => {
    const response = await axiosInstance.get('/customizations/my');
    return response.data;
  },

  deleteCustomization: async (id) => {
    const response = await axiosInstance.delete(`/customizations/${id}`);
    return response.data;
  },
};

export default customizationApi;
