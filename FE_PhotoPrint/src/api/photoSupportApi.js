import { request } from './axios';
import { paged } from './photoProductApi';

export const photoSupportApi = {
  create: data => request('post', '/support-requests', { data }),
  track: (params, signal) => request('get', '/support-requests/track', { params, signal }),
  list: async (params, signal) => paged(await request('get', '/support-requests', { params, signal })),
  setStatus: (id, data) => request('put', '/support-requests/' + encodeURIComponent(id) + '/status', { data }),
};
