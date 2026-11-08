import axiosInstance from './axios';

export const quotationApi = {
  getSummary: async () => {
    const response = await axiosInstance.get('/quoting/quotations/summary');
    return response.data?.value ?? response.data;
  },
  getQuotations: async (params = {}) => {
    const response = await axiosInstance.get('/quoting/quotations', { params });
    return response.data?.value ?? response.data;
  },

  getQuotationById: async (id) => {
    const response = await axiosInstance.get(`/quoting/quotations/${id}`);
    return response.data?.value ?? response.data;
  },

  createQuotation: async (data) => {
    const response = await axiosInstance.post('/quoting/quotations', data);
    return response.data?.value ?? response.data;
  },

  updateQuotation: async (id, data) => {
    const response = await axiosInstance.put(`/quoting/quotations/${id}`, data);
    return response.data?.value ?? response.data;
  },

  changeStatus: async (id, status, reason = null) => {
    const response = await axiosInstance.put(`/quoting/quotations/${id}/status`, { status, reason });
    return response.data?.value ?? response.data;
  },

  deleteQuotation: async (id) => {
    const response = await axiosInstance.delete(`/quoting/quotations/${id}`);
    return response.data?.value ?? response.data;
  },

  exportFile: async (id, fileType = 'pdf', taxPercent) => {
    const response = await axiosInstance.post(`/quoting/quotations/${id}/export`, { fileType, ...(taxPercent === undefined ? {} : { taxPercent }) });
    return response.data?.value ?? response.data;
  },

  previewQuotation: async (id, taxPercent) => {
    const response = await axiosInstance.get(`/quoting/quotations/${id}/preview`, taxPercent === undefined ? undefined : { params: { taxPercent } });
    return response.data?.value ?? response.data;
  },

  getHistories: async (id) => {
    const response = await axiosInstance.get(`/quoting/quotations/${id}/histories`);
    return response.data?.value ?? response.data;
  },

  getFiles: async (id) => {
    const response = await axiosInstance.get(`/quoting/quotations/${id}/files`);
    return response.data?.value ?? response.data;
  },

  downloadFile: async (quotationId, fileId) => {
    const response = await axiosInstance.get(`/quoting/quotations/${quotationId}/files/${fileId}/download`, { responseType: 'blob' });
    return response.data;
  },
};

export default quotationApi;
