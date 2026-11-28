import { request } from './axios';

export const photoPaymentApi = {
  confirm: (data, signal) => request('post', '/payments/vietqr-confirm', { data, signal }),
  list: (params, signal) => request('get', '/payments', { params, signal }),
  verify: (id, data, signal) => request('put', '/payments/' + encodeURIComponent(id) + '/verify', { data, signal }),
};
