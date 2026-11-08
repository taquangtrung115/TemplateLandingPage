import axiosInstance from './axios';

export const quotingTemplateApi = {
  getTemplates: async (params = {}) => {
    const response = await axiosInstance.get('/quoting/templates', { params });
    return response.data?.value ?? response.data;
  },

  getTemplateById: async (id) => {
    const response = await axiosInstance.get(`/quoting/templates/${id}`);
    return response.data?.value ?? response.data;
  },

  getTemplateVersion: async (templateId, version = null) => {
    const url = version ? `/quoting/templates/${templateId}/versions/${version}` : `/quoting/templates/${templateId}/versions`;
    const response = await axiosInstance.get(url);
    return response.data?.value ?? response.data;
  },

  createTemplate: async (data) => {
    const response = await axiosInstance.post('/quoting/templates', data);
    return response.data?.value ?? response.data;
  },

  createVersion: async (templateId, data) => {
    const response = await axiosInstance.post(`/quoting/templates/${templateId}/versions`, data);
    return response.data?.value ?? response.data;
  },

  updateTemplate: async (id, data) => {
    const response = await axiosInstance.put(`/quoting/templates/${id}`, data);
    return response.data?.value ?? response.data;
  },
};

export default quotingTemplateApi;
