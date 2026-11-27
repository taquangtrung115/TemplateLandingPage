import { request } from './axios';
import { paged, saveRecord } from './photoProductApi';

export const photoDemoApi = {
  list: async (params, signal) => paged(await request('get', '/demos', { params, signal })),
  save: data => saveRecord('/demos', data),
  remove: id => request('delete', '/demos/' + encodeURIComponent(id)),
};
