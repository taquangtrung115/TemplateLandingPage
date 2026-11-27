import { request } from './axios';
import { APP_KEY } from '../utils/tenantScope';

export const workspaceApi = {
  contexts: (page, signal) => request('get', '/auth/contexts', { params: { appKey: APP_KEY, page }, signal }),
  members: (page, signal) => request('get', '/members', { params: { page }, signal }),
  createMember: data => request('post', '/members', { data }),
  setMember: data => request('put', '/members', { data }),
  registration: signal => request('get', '/auth/registration', { signal }),
  configureRegistration: data => request('put', '/auth/registration', { data }),
};
