import { request } from './axios';
import { parseArray } from '../models/photoPrint';

export function normalizeProduct(item) {
  if (!item || !item.id) throw new Error('Máy chủ chưa trả về sản phẩm hợp lệ.');
  return {
    ...item,
    gallery: parseArray(item.gallery ?? item.galleryJson),
    printSizes: parseArray(item.printSizes ?? item.printSizesJson),
    paperOrSurfaceOptions: parseArray(item.paperOrSurfaceOptions ?? item.paperOrSurfaceOptionsJson),
    finishingOptions: parseArray(item.finishingOptions ?? item.finishingOptionsJson),
    discountTiers: parseArray(item.discountTiers ?? item.discountTiersJson),
    usageTypes: parseArray(item.usageTypes ?? item.usageTypesJson),
  };
}

export function paged(data) {
  if (Array.isArray(data)) return { items: data, totalCount: data.length };
  const items = data?.items ?? data?.data;
  if (!Array.isArray(items)) throw new Error('Máy chủ trả danh sách không đúng định dạng.');
  return { ...data, items, totalCount: data.totalCount ?? data.recordsFiltered ?? data.total ?? items.length };
}

export const photoProductApi = {
  categories: async (signal, includeInactive = false) => paged(await request('get', '/categories', { signal, params: { includeInactive } })).items,
  categorySave: data => saveRecord('/categories', data),
  categoryDelete: id => request('delete', '/categories/' + encodeURIComponent(id)),
  search: async (params, signal) => {
    const data = paged(await request('get', '/products', { params, signal }));
    return { ...data, items: data.items.map(normalizeProduct) };
  },
  detail: async (slug, signal) => normalizeProduct(await request('get', '/products/' + encodeURIComponent(slug), { signal })),
  save: product => saveRecord('/products', product),
  remove: id => request('delete', '/products/' + encodeURIComponent(id)),
};

export function saveRecord(path, data) {
  return request(data.id ? 'put' : 'post', path + (data.id ? '/' + encodeURIComponent(data.id) : ''), { data });
}
