import { client } from './client';
export const tenantApi = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  me: signal => client.get('/auth/me', { signal }),
  list: (page = 1, signal, search = '') => client.get('/platform/tenants', { params: { page, pageSize: 20, search }, signal }),
  create: value => client.post('/platform/tenants', value),
  update: (tenantId, value) => client.put('/platform/tenants/' + tenantId, value),
  configure: (tenantId, appKey, value) => client.put('/platform/tenants/' + tenantId + '/applications/' + appKey, value),
  members: (tenantId, appKey, page = 1, signal) => client.get('/platform/tenants/' + tenantId + '/applications/' + appKey + '/members', { params: { page }, signal }),
  setMember: (tenantId, appKey, value) => client.put('/platform/tenants/' + tenantId + '/applications/' + appKey + '/members', value),
  createMember: (tenantId, appKey, value) => client.post('/platform/tenants/' + tenantId + '/applications/' + appKey + '/members', value),
  createUser: value => client.post('/platform/users', { ...value, role: 'User' }),
};
