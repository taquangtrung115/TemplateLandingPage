import axiosInstance from './axios';

export const navigationMenuApi = {
  getMenus: async (params = {}) => {
    const res = await axiosInstance.get('/menus', { params });
    return res.data?.value ?? res.data;
  },

  getMenuById: async (id) => {
    const res = await axiosInstance.get(`/menus/${id}`);
    return res.data?.value ?? res.data;
  },

  createMenu: async (data) => {
    const res = await axiosInstance.post('/menus', data);
    return res.data?.value ?? res.data;
  },

  updateMenu: async (id, data) => {
    const res = await axiosInstance.put(`/menus/${id}`, data);
    return res.data?.value ?? res.data;
  },

  deleteMenu: async (id) => {
    const res = await axiosInstance.delete(`/menus/${id}`);
    return res.data?.value ?? res.data;
  },
};

export default navigationMenuApi;
