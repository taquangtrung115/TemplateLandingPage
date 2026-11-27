import { request } from './axios';
import { paged } from './photoProductApi';

export const photoOrderApi = {
  create: data => request('post', '/orders', { data }),
  track: (params, signal) => request('get', '/orders/track', { params, signal }),
  list: async (params, signal) => paged(await request('get', '/orders', { params, signal })),
  setStatus: (id, data) => request('put', '/orders/' + encodeURIComponent(id) + '/status', { data }),
};
