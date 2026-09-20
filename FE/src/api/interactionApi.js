import axiosInstance from './axios';

export const interactionApi = {
  submitRsvp: async (rsvpData) => {
    const response = await axiosInstance.post('/rsvp', rsvpData);
    return response.data?.value ?? response.data;
  },

  getRsvps: async (customizationId) => {
    const response = await axiosInstance.get(`/rsvp/${customizationId}`);
    return response.data?.value ?? response.data;
  },

  submitGuestbook: async (guestbookData) => {
    const response = await axiosInstance.post('/guestbook', guestbookData);
    return response.data?.value ?? response.data;
  },

  getGuestbook: async (customizationId) => {
    const response = await axiosInstance.get(`/guestbook/${customizationId}`);
    return response.data?.value ?? response.data;
  },
};

export default interactionApi;
