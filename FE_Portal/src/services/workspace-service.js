// #region Workspace discovery
const configured = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const apiBase = configured.endsWith('/api/v1') ? configured : `${configured}/api/v1`;

export async function getWorkspaceApplications(tenantKey, signal) {
  const response = await fetch(`${apiBase}/portal/workspaces/${encodeURIComponent(tenantKey)}/applications`, {
    cache: 'no-store', credentials: 'omit', signal,
  });
  if (response.status === 404) throw new Error('Không tìm thấy workspace hoặc workspace đã ngừng hoạt động.');
  if (!response.ok) throw new Error('Không thể tải ứng dụng của workspace.');

  const result = await response.json();
  if (result.isSuccess !== true || !Array.isArray(result.value?.appKeys) || typeof result.value.tenantName !== 'string') {
    throw new Error('Máy chủ trả về danh sách ứng dụng không hợp lệ.');
  }
  return result.value;
}
// #endregion
