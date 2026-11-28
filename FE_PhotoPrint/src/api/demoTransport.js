import { categories, demos, products } from './demoCatalog';
import { OrderStates, TicketStates } from '../models/photoPrint';
import { comboDiscountFor, comboGroups, priceConfiguration, validCombo } from '../utils/photoPricing';
import { sanitizePhone } from '../utils/safeUrl';
import { readAuthToken } from '../utils/authStorage';
import { canUseVietQr, vietQrBanks } from '../utils/vietQr';

const stores = new Map();
const demoProfile = { id: 'demo-admin', fullName: 'Quản trị demo', email: 'admin@photoprint.example', role: 'Admin' };
const demoToken = 'photoprint-demo-admin';

function storeFor(workspace) {
  if (!stores.has(workspace)) stores.set(workspace, {
    categories: structuredClone(categories), products: structuredClone(products), demos: structuredClone(demos),
    orders: [], payments: [], 'support-requests': [], registration: { allowSelfRegistration: true },
    members: [{ ...demoProfile, userId: demoProfile.id, isActive: true }],
    contact: { brandName: 'Minh Tâm', workingHours: 'Thứ 2–Thứ 7 · 08:00–18:00',
      vietQrEnabled: true, bankCode: 'MB', bankName: 'MB Bank', bankAccountNumber: '0000000000', bankAccountName: 'TIEM ANH DEMO' },
  });
  return stores.get(workspace);
}

function fail(message, status = 400) {
  throw Object.assign(new Error(message), { status });
}

const pageOf = (items, page = 1, size = 12) => ({
  items: items.slice((page - 1) * size, page * size), totalCount: items.length, page, pageSize: size,
});
const searchKey = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replaceAll('đ', 'd');
const matches = (term, ...values) => values.some(value => searchKey(value).includes(searchKey(term).trim()));

function documentCode(prefix, count) {
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()).replaceAll('-', '');
  return prefix + '-' + date + '-' + String(count + 1).padStart(4, '0');
}

function orderOf(store, data) {
  const items = data.items.map(config => {
    const product = store.products.find(item => item.id === config.productId && item.isActive);
    if (!product) fail('Sản phẩm đã ngừng nhận đặt in.');
    const price = priceConfiguration(product, config);
    return {
      ...config, productSlug: product.slug, productName: product.name, unitPrice: price.unitFinalPrice, lineTotal: price.lineTotal,
      discountTotal: price.discountTotal, finishingSummary: config.finishingNames.join(', '),
    };
  });
  if (comboGroups(items).some(group => !validCombo(group))) fail('Chọn ba dịch vụ khác nhau cho Combo 3.');
  const comboDiscountTotal = comboDiscountFor(items);
  const grandTotal = items.reduce((total, item) => total + item.lineTotal, 0) - comboDiscountTotal;
  const discountTotal = items.reduce((total, item) => total + item.discountTotal, 0) + comboDiscountTotal;
  const orderCode = documentCode('PA', store.orders.length);
  const reference = orderCode.replaceAll('-', '');
  return {
    ...data, id: crypto.randomUUID(), orderCode, items,
    subTotal: grandTotal + discountTotal, grandTotal, discountTotal, comboDiscountTotal,
    transferMemo: data.paymentMethod === 'VietQr' ? reference + ' IN ANH' : null, paymentStatus: 'Unpaid',
    totalPhotoCount: items.reduce((count, item) => count + item.quantity, 0),
    status: 'Pending', revision: 0, createdAtUtc: new Date().toISOString(),
  };
}

function orderView(order, payments) {
  return { ...order, canPayVietQr: order.paymentMethod === 'VietQr' && order.status !== 'Cancelled' && order.paymentStatus === 'Unpaid' && order.grandTotal > 0,
    paymentReceipt: payments?.find(payment => payment.orderCode === order.orderCode && payment.status !== 'Rejected') };
}

function confirmPayment(store, data) {
  const phone = sanitizePhone(data.customerPhone);
  const order = phone && store.orders.find(item => item.orderCode === data.orderCode && sanitizePhone(item.customerPhone) === phone);
  if (!order) fail('Không tìm thấy đơn phù hợp.', 404);
  if (order.paymentMethod !== 'VietQr' || data.amount !== order.grandTotal || data.amount <= 0 || data.transferMemo !== order.transferMemo) {
    fail('Số tiền hoặc nội dung chuyển khoản không khớp với đơn in.');
  }
  const existing = store.payments.find(payment => payment.orderCode === order.orderCode && payment.status !== 'Rejected');
  if (existing) return receiptView(existing);
  if (!orderView(order).canPayVietQr || !canUseVietQr(store.contact) || data.bankCode !== store.contact.bankCode
    || data.bankAccountNumber !== store.contact.bankAccountNumber) fail('Đơn hoặc tài khoản VietQR đã thay đổi.', 409);
  const { orderCode, amount, transferMemo, note, bankCode, bankAccountNumber } = data;
  const transactionCode = 'MTP' + documentCode('QR', store.payments.length).slice(3).replaceAll('-', '');
  const payment = { id: crypto.randomUUID(), orderCode, amount, transferMemo, note, transactionCode,
    bankCode, bankAccountNumber, bankName: vietQrBanks[bankCode].name, customerPhone: phone,
    status: 'PendingVerify', revision: 0, createdAtUtc: new Date().toISOString() };
  order.paymentStatus = 'PendingVerify';
  order.revision++;
  store.payments.unshift(payment);
  return receiptView(payment);
}

function receiptView({ transactionCode, orderCode, amount, status, createdAtUtc }) {
  return { transactionCode, orderCode, amount, status, createdAtUtc };
}

function reconcilePayment(store, id, data) {
  const payment = store.payments.find(row => row.id === id);
  if (!payment) fail('Không tìm thấy giao dịch.', 404);
  const order = store.orders.find(row => row.orderCode === payment.orderCode);
  if (payment.status !== 'PendingVerify' || payment.revision !== data.expectedRevision
    || (data.status === 'Verified' && order.status === 'Cancelled')) fail('Giao dịch hoặc đơn đã thay đổi.', 409);
  if (!['Verified', 'Rejected'].includes(data.status)) fail('Trạng thái không hợp lệ.');
  const now = new Date().toISOString();
  Object.assign(payment, { status: data.status, staffNote: data.staffNote, verifiedAtUtc: now, revision: payment.revision + 1 });
  Object.assign(order, { paymentStatus: data.status === 'Verified' ? 'Paid' : 'Unpaid', paidAtUtc: data.status === 'Verified' ? now : null, revision: order.revision + 1 });
  return receiptView(payment);
}

export async function demoRequest(method, route, { signal, params = {}, data, workspace }) {
  signal?.throwIfAborted();
  const store = storeFor(workspace);
  const [collection, id, action] = route.slice(1).split('/').map(decodeURIComponent);
  const isAdmin = readAuthToken() === demoToken;
  const profile = isAdmin ? demoProfile : { id: 'demo-customer', fullName: 'Khách demo', role: 'User' };

  if (route === '/auth/login') {
    if (data.email === demoProfile.email && data.password === 'photoprint-demo') return { token: demoToken, user: demoProfile };
    fail('Thông tin đăng nhập demo không đúng.', 401);
  }
  if (route === '/auth/register') {
    if (!store.registration.allowSelfRegistration) fail('Workspace đang đóng đăng ký.', 403);
    return { token: 'photoprint-demo-customer', user: { ...profile, fullName: data.fullName } };
  }
  if (route === '/auth/me') return profile;
  if (route === '/context') return { appKey: 'photoprint', role: profile.role };
  if (route === '/auth/contexts') return pageOf([{ tenantKey: workspace, tenantName: workspace, role: profile.role }], params.page, 100);
  if (route === '/auth/registration' && method === 'get') return { settings: store.registration };
  if (route === '/contact-config' && method === 'get') return structuredClone(store.contact);
  if (route === '/uploads/photos') {
    return { fileUrl: URL.createObjectURL(data.get('file')) };
  }
  if (collection === 'products' && method === 'get' && !params.includeInactive) {
    const active = store.products.filter(item => item.isActive);
    if (id) return structuredClone(active.find(item => item.slug === id || item.id === id) || fail('Không tìm thấy sản phẩm.', 404));
    const items = active.filter(item => (!params.categorySlug || store.categories.find(category => category.id === item.categoryId)?.slug === params.categorySlug) &&
      (!params.featured || item.isFeatured) && (!params.usage || item.usageTypes.includes(params.usage)) &&
      matches(params.search, item.name, item.shortDescription, ...item.printSizes.flatMap(size => [size.label, size.widthCm + 'x' + size.heightCm])));
    const sorting = { priceAsc: (a, b) => a.basePrice - b.basePrice, priceDesc: (a, b) => b.basePrice - a.basePrice,
      fastest: (a, b) => (a.productionHours || 1000) - (b.productionHours || 1000), featured: (a, b) => Number(b.isFeatured) - Number(a.isFeatured) };
    return structuredClone(pageOf(items.sort(sorting[params.sort] || sorting.featured), params.page, params.pageSize));
  }
  if (route === '/categories' && method === 'get' && !params.includeInactive) return structuredClone(store.categories.filter(item => item.isActive));
  if (route === '/demos' && method === 'get' && !params.includeInactive) {
    return structuredClone(pageOf(store.demos.filter(item => item.isActive && (!params.model3DType || item.model3DType === params.model3DType)), params.page, params.pageSize ?? 50));
  }
  if (route === '/orders' && method === 'post') {
    const item = orderOf(store, data);
    store.orders.unshift(item);
    return structuredClone(orderView(item));
  }
  if (route === '/payments/vietqr-confirm' && method === 'post') return confirmPayment(store, data);
  if (route === '/support-requests' && method === 'post') {
    const list = store[collection];
    const item = { ...data, id: crypto.randomUUID(), ticketCode: documentCode('SUP', list.length), status: 'New', revision: 0, createdAtUtc: new Date().toISOString() };
    list.unshift(item);
    return { ticketCode: item.ticketCode };
  }
  if (id === 'track' && method === 'get') {
    const contactPhone = sanitizePhone(params.contact);
    const item = store[collection]?.find(row => collection === 'orders'
      ? row.orderCode === params.code && sanitizePhone(row.customerPhone) === sanitizePhone(params.phone)
      : row.ticketCode === params.code && ((contactPhone && sanitizePhone(row.phone) === contactPhone) ||
          (row.email && row.email.toLowerCase() === params.contact?.toLowerCase())));
    if (!item) fail('Không tìm thấy mã tương ứng với thông tin đã nhập.', 404);
    return structuredClone(collection === 'orders' ? orderView(item) : item);
  }

  if (!isAdmin) fail('Cần quyền quản trị workspace.', 403);
  if (route === '/payments' && method === 'get') {
    const items = store.payments.filter(item => (!params.status || item.status === params.status) &&
      matches(params.search, item.transactionCode, item.orderCode, item.customerPhone));
    const summary = {
      totalCount: store.payments.length, pendingCount: store.payments.filter(item => item.status === 'PendingVerify').length,
      verifiedAmount: store.payments.filter(item => item.status === 'Verified').reduce((total, item) => total + item.amount, 0),
      totalRecordedAmount: store.payments.reduce((total, item) => total + item.amount, 0),
    };
    return structuredClone({ ...pageOf(items, params.page, params.pageSize ?? 20), summary });
  }
  if (collection === 'payments' && action === 'verify' && method === 'put') return reconcilePayment(store, id, data);
  if (route === '/contact-config' && method === 'put') {
    store.contact = structuredClone({ ...data, bankName: vietQrBanks[data.bankCode]?.name });
    return structuredClone(store.contact);
  }
  if (route === '/auth/registration' && method === 'put') {
    store.registration = { allowSelfRegistration: !!data.allowSelfRegistration };
    return { settings: store.registration };
  }
  if (route === '/members') {
    if (method === 'get') return structuredClone(pageOf(store.members, params.page, 100));
    const { email, role, fullName, isActive = true } = data;
    const item = store.members.find(row => row.email === email);
    if (item) Object.assign(item, { role, isActive });
    else store.members.push({ email, role, fullName, isActive, userId: crypto.randomUUID() });
    return { member: item || store.members.at(-1) };
  }
  if (route === '/categories' && method === 'get') return structuredClone(store.categories);
  const list = store[collection];
  if (!Array.isArray(list)) fail('Không tìm thấy chức năng.', 404);
  if (method === 'get') {
    const items = list.filter(item => (!params.status || item.status === params.status) &&
      (!params.priority || item.priority === params.priority) &&
      matches(params.search, item.name, item.title, item.fullName, item.customerName, item.customerPhone, item.phone, item.email, item.orderCode, item.ticketCode, item.message));
    return structuredClone(pageOf(collection === 'orders' ? items.map(item => orderView(item, store.payments)) : items, params.page, params.pageSize ?? 24));
  }
  const row = list.find(item => item.id === id);
  if (action === 'status') {
    if (!row) fail('Không tìm thấy bản ghi.', 404);
    if (row.revision !== data.expectedRevision) fail('Bản ghi vừa thay đổi.', 409);
    const states = collection === 'orders' ? OrderStates : TicketStates;
    if (!Object.hasOwn(states, data.status)) fail('Trạng thái không hợp lệ.');
    Object.assign(row, { status: data.status, adminNote: data.adminNote, revision: row.revision + 1 });
    return structuredClone(row);
  }
  if (method === 'post') {
    const item = { ...structuredClone(data), id: crypto.randomUUID() };
    list.unshift(item);
    return structuredClone(item);
  }
  if (!row) fail('Không tìm thấy bản ghi.', 404);
  if (method === 'put') Object.assign(row, structuredClone(data));
  if (method === 'delete') list.splice(list.indexOf(row), 1);
  return structuredClone(row);
}
