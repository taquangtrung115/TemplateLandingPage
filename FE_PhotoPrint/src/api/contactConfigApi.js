import { request } from './axios';

export const contactConfigApi = {
  get: signal => request('get', '/contact-config', { signal }),
  save: data => request('put', '/contact-config', { data }),
};
