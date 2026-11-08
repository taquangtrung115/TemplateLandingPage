import axiosInstance from './axios';

export const quotingCustomerApi = {
  getCustomers: async (params = {}) => {
    const response = await axiosInstance.get('/quoting/customers', { params });
    return response.data?.value ?? response.data;
  },

  getCustomerById: async (id) => {
    const response = await axiosInstance.get(`/quoting/customers/${id}`);
    return response.data?.value ?? response.data;
  },

  createCustomer: async (data) => {
    const response = await axiosInstance.post('/quoting/customers', data);
    return response.data?.value ?? response.data;
  },

  updateCustomer: async (id, data) => {
    const response = await axiosInstance.put(`/quoting/customers/${id}`, data);
    return response.data?.value ?? response.data;
  },

  deleteCustomer: async (id) => {
    const response = await axiosInstance.delete(`/quoting/customers/${id}`);
    return response.data?.value ?? response.data;
  },
};

export default quotingCustomerApi;
