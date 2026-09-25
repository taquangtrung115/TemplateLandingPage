import axiosInstance from './axios';

const unwrap = (response) => response.data?.value ?? response.data;

export const adminApi = {
  getOverview: async () => unwrap(await axiosInstance.get('/admin/overview')),

  getOwnerlessCustomizations: async ({ page = 1, pageSize = 20 } = {}) => unwrap(await axiosInstance.get('/admin/customizations', {
    params: { ownerless: true, page, pageSize },
  })),

  assignCustomizationOwner: async (id, data) => unwrap(await axiosInstance.put(`/admin/customizations/${id}/owner`, data)),
};

export default adminApi;
