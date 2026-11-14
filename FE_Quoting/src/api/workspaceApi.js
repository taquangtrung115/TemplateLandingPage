import client from './axios';
import { APP_KEY } from '../utils/tenantScope';
export const workspaceApi = {
  contexts: async (page = 1, signal) => { const response = await client.get('/auth/contexts', { params: { appKey: APP_KEY, page }, signal }); return response.data?.value ?? response.data; },
  members: async (page = 1, signal) => { const response = await client.get('/members', { params: { page }, signal }); return response.data?.value ?? response.data; },
  setMember: async value => { const response = await client.put('/members', value); return response.data?.value ?? response.data; },
};
