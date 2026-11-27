import { request } from './axios';

export const authApi = {
  login: data => request('post', '/auth/login', { data }),
  register: data => request('post', '/auth/register', { data }),
  getMe: signal => request('get', '/auth/me', { signal }),
  getContext: signal => request('get', '/context', { signal }),
};
