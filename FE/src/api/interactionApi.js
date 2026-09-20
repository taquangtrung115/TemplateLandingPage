import axiosInstance from './axios';

export const interactionApi = {
  submitRsvp: async (rsvpData) => {
    const response = await axiosInstance.post('/rsvp', rsvpData);
    return response.data;
  },

  getRsvps: async (customizationId) => {
    const response = await axiosInstance.get(`/rsvp/${customizationId}`);
    return response.data;
  },

  submitGuestbook: async (guestbookData) => {
    const response = await axiosInstance.post('/guestbook', guestbookData);
    return response.data;
  },

  getGuestbook: async (customizationId) => {
    const response = await axiosInstance.get(`/guestbook/${customizationId}`);
    return response.data;
  },
};

export default interactionApi;
