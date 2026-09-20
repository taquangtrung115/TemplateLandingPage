import axiosInstance from './axios';

export const templateApi = {
  getTemplates: async (params = {}) => {
    const response = await axiosInstance.get('/templates', { params });
    return response.data?.value ?? response.data;
  },

  getTemplateById: async (id) => {
    const response = await axiosInstance.get(`/templates/${id}`);
    return response.data?.value ?? response.data;
  },

  getTemplateBySlug: async (slug) => {
    const response = await axiosInstance.get(`/templates/slug/${slug}`);
    return response.data?.value ?? response.data;
  },

  createTemplate: async (templateData) => {
    const response = await axiosInstance.post('/templates', templateData);
    return response.data?.value ?? response.data;
  },

  updateTemplate: async (id, templateData) => {
    const response = await axiosInstance.put(`/templates/${id}`, templateData);
    return response.data?.value ?? response.data;
  },

  deleteTemplate: async (id) => {
    const response = await axiosInstance.delete(`/templates/${id}`);
    return response.data?.value ?? response.data;
  },
};

export default templateApi;
