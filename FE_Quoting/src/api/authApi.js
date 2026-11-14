import axiosInstance from './axios';

export const authApi = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data?.value ?? response.data;
  },

  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data?.value ?? response.data;
  },

  registration: async (signal) => { const response = await axiosInstance.get('/auth/registration', { signal }); return (response.data?.value ?? response.data).settings; },

  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data?.value ?? response.data;
  },
};

export default authApi;
