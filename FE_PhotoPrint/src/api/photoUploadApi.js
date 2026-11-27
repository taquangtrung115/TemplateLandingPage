import { isDemoMode, request } from './axios';
import { validateUpload } from '../utils/fileUpload';
import { getSafeResourceUrl } from '../utils/safeUrl';
import { workspaceApiBase } from '../utils/tenantScope';

export function photoAssetUrl(value) {
  if (isDemoMode && typeof value === 'string' && value.startsWith('blob:' + location.origin + '/')) return value;
  if (/^\/api\/v1\/photoprint\/uploads\//.test(value || '')) {
    return getSafeResourceUrl(workspaceApiBase() + value.slice('/api/v1/photoprint'.length));
  }
  return getSafeResourceUrl(value);
}

export async function uploadPhoto(file, kind, signal) {
  validateUpload(file, kind);
  const data = new FormData();
  data.append('file', file);
  const payload = await request('post', '/uploads/photos', { data, params: { kind }, signal });
  const fileUrl = photoAssetUrl(typeof payload === 'string' ? payload : payload?.fileUrl || payload?.originalFileUrl || payload?.url);
  if (!fileUrl) throw new Error('Máy chủ chưa trả về địa chỉ ảnh đã tải lên.');
  return { fileUrl, thumbnailUrl: photoAssetUrl(payload?.thumbnailUrl) || fileUrl };
}
