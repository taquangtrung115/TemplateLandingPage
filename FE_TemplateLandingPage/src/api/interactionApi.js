import axiosInstance from './axios';

const readSuccessfulValue = (data) => {
  if (data?.isSuccess === false || data?.IsSuccess === false) {
    throw new Error('The interaction request was rejected.');
  }
  return data?.value ?? data?.Value ?? data;
};

export const interactionApi = {
  submitRsvp: async (rsvpData) => {
    const response = await axiosInstance.post('/rsvp', rsvpData);
    return readSuccessfulValue(response.data);
  },

  getRsvps: async (customizationId, options = {}) => {
    const response = await axiosInstance.get(`/rsvp/${customizationId}`, {
      params: {
        versionId: options.versionId,
        page: options.page ?? 1,
        pageSize: options.pageSize ?? 20,
      },
    });
    return readSuccessfulValue(response.data);
  },

  submitGuestbook: async (guestbookData) => {
    const response = await axiosInstance.post('/guestbook', guestbookData);
    return readSuccessfulValue(response.data);
  },

  getGuestbook: async (customizationId, options = {}) => {
    const response = await axiosInstance.get(`/guestbook/${customizationId}`, {
      params: {
        versionId: options.versionId,
        page: options.page ?? 1,
        pageSize: options.pageSize ?? 20,
      },
    });
    return readSuccessfulValue(response.data);
  },
};

export default interactionApi;
