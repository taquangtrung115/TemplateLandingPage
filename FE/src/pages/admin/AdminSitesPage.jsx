import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, UserRoundCog } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { userApi } from '../../api/userApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const pageSize = 20;
const getList = (result) => Array.isArray(result) ? result : (result?.data || []);

export default function AdminSitesPage() {
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOwners, setSelectedOwners] = useState({});
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [siteResult, userResult] = await Promise.all([
        adminApi.getOwnerlessCustomizations({ page, pageSize }),
        users.length ? Promise.resolve(users) : userApi.getUsers(),
      ]);
      setSites(getList(siteResult));
      setTotal(siteResult?.total ?? getList(siteResult).length);
      if (!users.length) setUsers(getList(userResult));
    } catch (loadError) {
      setError(loadError.message || 'Không thể tải danh sách trang vô chủ.');
    } finally {
      setLoading(false);
    }
  }, [page, users]);

  useEffect(() => { void loadData(); }, [loadData]);

  const handleAssign = async (site) => {
    const userId = selectedOwners[site.id];
    if (!userId || assigningId) return;
    setAssigningId(site.id);
    setError('');
    setNotice('');
    try {
      await adminApi.assignCustomizationOwner(site.id, { userId, expectedRevision: site.revision });
      setNotice(`Đã gán “${site.title || site.slug}” cho tài khoản đã chọn.`);
      await loadData();
    } catch (assignError) {
      setError(assignError.message || 'Không thể gán chủ sở hữu.');
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Trang chưa có chủ sở hữu</h1>
          <p className="mt-1 text-sm text-gray-500">Trang cũ đã công khai được giữ nguyên. Chỉ quản trị viên mới có thể gán quyền quản lý.</p>
        </div>
        <button onClick={() => void loadData()} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-xs font-semibold disabled:opacity-50">
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </header>

      {error && <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">{error}</div>}
      {notice && <div role="status" className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">{notice}</div>}

      {loading ? (
        <div className="py-16 flex justify-center"><LoadingSpinner size="lg" message="Đang tải trang..." /></div>
      ) : sites.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border text-center text-sm text-gray-500">Không còn trang vô chủ trong kết quả này.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {sites.map((site) => (
              <article key={site.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-gray-900 truncate">{site.title || 'Chưa đặt tên'}</h2>
                  <p className="mt-1 text-xs text-gray-500">/p/{site.slug} · Tạo {site.createdAtUtc ? new Date(site.createdAtUtc).toLocaleDateString('vi-VN') : 'không rõ ngày'}</p>
                  <p className="mt-1 text-[10px] text-gray-400">ID: {site.id}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:w-[28rem]">
                  <select value={selectedOwners[site.id] || ''} onChange={(event) => setSelectedOwners((current) => ({ ...current, [site.id]: event.target.value }))} className="flex-1 min-w-0 px-3 py-2 rounded-lg border text-xs bg-white">
                    <option value="">Chọn chủ sở hữu</option>
                    {users.map((user) => <option key={user.id} value={user.id}>{user.fullName || user.email}</option>)}
                  </select>
                  <button onClick={() => handleAssign(site)} disabled={!selectedOwners[site.id] || !!assigningId} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold disabled:opacity-50">
                    <UserRoundCog className="w-4 h-4" /> {assigningId === site.id ? 'Đang gán…' : 'Gán chủ sở hữu'}
                  </button>
                </div>
              </article>
            ))}
          </div>
          <footer className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-600">
            <span>{total} trang</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="px-3 py-1.5 rounded-md border bg-white disabled:opacity-40">Trước</button>
              <span className="px-2 py-1.5">Trang {page}</span>
              <button disabled={page * pageSize >= total} onClick={() => setPage((current) => current + 1)} className="px-3 py-1.5 rounded-md border bg-white disabled:opacity-40">Sau</button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
