import axiosInstance from './axios';

const unwrap = (response) => response.data?.value ?? response.data;

export const customizationApi = {
  saveCustomization: async (data) => unwrap(await axiosInstance.post('/customizations', data)),

  updateCustomization: async (id, data) => unwrap(await axiosInstance.put(`/customizations/${id}`, data)),

  getCustomizationById: async (id) => unwrap(await axiosInstance.get(`/customizations/${id}`)),

  getPublicCustomizationBySlug: async (slug) => unwrap(await axiosInstance.get(`/customizations/slug/${encodeURIComponent(slug)}`)),

  getPublicCustomizationVersionBySlug: async (slug, versionNumber) => unwrap(await axiosInstance.get(
    `/customizations/slug/${encodeURIComponent(slug)}/versions/${versionNumber}`
  )),

  getCustomizationBySlug: async (slug) => unwrap(await axiosInstance.get(`/customizations/slug/${encodeURIComponent(slug)}`)),

  getMyCustomizations: async ({ page = 1, pageSize = 12 } = {}) => unwrap(await axiosInstance.get('/customizations/my', {
    params: { page, pageSize },
  })),

  getVersions: async (id, { page = 1, pageSize = 20 } = {}) => unwrap(await axiosInstance.get(`/customizations/${id}/versions`, {
    params: { page, pageSize },
  })),

  getVersion: async (id, versionId) => unwrap(await axiosInstance.get(`/customizations/${id}/versions/${versionId}`)),

  createVersion: async (id, data) => unwrap(await axiosInstance.post(`/customizations/${id}/versions`, data)),

  publishVersion: async (id, data) => unwrap(await axiosInstance.put(`/customizations/${id}/publication`, data)),

  unpublishVersion: async (id, versionId, expectedRevision) => unwrap(await axiosInstance.delete(
    `/customizations/${id}/versions/${versionId}/publication`,
    { params: { expectedRevision } }
  )),

  unpublishSite: async (id, expectedRevision) => unwrap(await axiosInstance.delete(
    `/customizations/${id}/publication`,
    { params: { expectedRevision } }
  )),

  deleteCustomization: async (id, expectedRevision) => unwrap(await axiosInstance.delete(`/customizations/${id}`, {
    params: { expectedRevision },
  })),
};

export default customizationApi;
