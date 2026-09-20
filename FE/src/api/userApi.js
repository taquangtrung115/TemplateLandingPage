import axiosInstance from './axios';

export const userApi = {
  getUsers: async () => {
    const response = await axiosInstance.get('/users');
    return response.data?.value ?? response.data;
  },

  getUserById: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data?.value ?? response.data;
  },

  createUser: async (userData) => {
    const response = await axiosInstance.post('/users', userData);
    return response.data?.value ?? response.data;
  },

  updateUser: async (id, userData) => {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data?.value ?? response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data?.value ?? response.data;
  },
};

export default userApi;
