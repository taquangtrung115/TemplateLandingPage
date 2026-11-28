export const paths = {
  home: '/', services: '/services', demo: '/demo', cart: '/cart', checkout: '/checkout',
  trackOrder: '/orders/track', support: '/support', login: '/login', register: '/register',
  admin: '/admin', adminServices: '/admin/services', adminDemos: '/admin/demos',
  adminOrders: '/admin/orders', adminSupport: '/admin/support', adminSettings: '/admin/settings',
  adminPayments: '/admin/payments',
  adminMembers: '/admin/settings/members', adminRegistration: '/admin/settings/registration',
};

export const servicePath = slug => paths.services + '/' + encodeURIComponent(slug);
export function withQuery(path, parameters) {
  const query = new URLSearchParams(Object.entries(parameters).filter(([, value]) => value != null && value !== ''));
  return query.size ? path + '?' + query : path;
}
