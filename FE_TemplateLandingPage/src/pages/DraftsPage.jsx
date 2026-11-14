import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, FileText, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import useAuth from '../hooks/useAuth';
import { deleteDraft, duplicateDraft, listDrafts, migrateLegacyDrafts } from '../utils/draftStore';

export default function DraftsPage() {
  const navigate = useNavigate();
  const { accountId } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyDraftId, setBusyDraftId] = useState(null);
  const [scope, setScope] = useState('account');
  const loadRequestRef = useRef(0);
  const scopeAccountId = scope === 'account' ? accountId : null;

  const loadDrafts = useCallback(async () => {
    const requestId = ++loadRequestRef.current;
    setLoading(true);
    setError('');
    try {
      await migrateLegacyDrafts();
      const result = await listDrafts(scopeAccountId);
      if (requestId === loadRequestRef.current) setDrafts(result);
    } catch (loadError) {
      if (requestId === loadRequestRef.current) setError(loadError.message || 'Không thể đọc bản nháp trên thiết bị này.');
    } finally {
      if (requestId === loadRequestRef.current) setLoading(false);
    }
  }, [scopeAccountId]);

  useEffect(() => {
    setDrafts([]);
    void loadDrafts();
    return () => { loadRequestRef.current += 1; };
  }, [loadDrafts]);

  const handleDuplicate = async (draftId) => {
    if (busyDraftId) return;
    setBusyDraftId(draftId);
    try {
      const copy = await duplicateDraft(draftId);
      await loadDrafts();
      navigate(`/customize/draft/${copy.draftId}`);
    } catch (duplicateError) {
      setError(duplicateError.message || 'Không thể nhân bản bản nháp.');
    } finally {
      setBusyDraftId(null);
    }
  };

  const handleDelete = async (draft) => {
    if (busyDraftId) return;
    if (!window.confirm(`Xóa bản nháp “${draft.metadata?.title || 'Chưa đặt tên'}” khỏi thiết bị này?`)) return;
    setBusyDraftId(draft.draftId);
    try {
      await deleteDraft(draft.draftId);
      setDrafts((current) => current.filter((item) => item.draftId !== draft.draftId));
    } catch (deleteError) {
      setError(deleteError.message || 'Không thể xóa bản nháp.');
    } finally {
      setBusyDraftId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-rose-600" /> Bản nháp trên thiết bị này
          </h1>
          <p className="mt-2 text-sm text-gray-500">Các thay đổi được lưu trong trình duyệt. Lưu lên máy chủ chỉ thực hiện khi bạn chọn.</p>
          {accountId && <div className="mt-4 flex flex-wrap gap-2" aria-label="Nhóm bản nháp">
            <button aria-pressed={scope === 'account'} onClick={() => setScope('account')} className={`px-3 py-2 rounded-lg border text-sm font-semibold ${scope === 'account' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-700'}`}>Tài khoản hiện tại</button>
            <button aria-pressed={scope === 'guest'} onClick={() => setScope('guest')} className={`px-3 py-2 rounded-lg border text-sm font-semibold ${scope === 'guest' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-700'}`}>Nháp khách</button>
          </div>}
          {accountId && scope === 'guest' && <p className="mt-2 text-xs text-gray-500">Nháp tạo trước khi đăng nhập vẫn nằm trên thiết bị. Chỉ bản bạn chọn lưu lên máy chủ mới được gắn với tài khoản.</p>}
        </header>

        {error && <div role="alert" className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">{error}<button onClick={() => void loadDrafts()} className="ml-3 underline font-semibold">Thử lại</button></div>}

        {loading ? (
          <div className="py-16 flex justify-center"><LoadingSpinner size="lg" message="Đang đọc bản nháp..." /></div>
        ) : error && drafts.length === 0 ? null : drafts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <h2 className="font-bold text-gray-900">Chưa có bản nháp nào</h2>
            <p className="text-sm text-gray-500 mt-2">Chọn một mẫu để bắt đầu thiết kế. Mỗi lần bắt đầu sẽ tạo một bản nháp riêng.</p>
            <button onClick={() => navigate('/templates')} className="mt-5 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold">Chọn mẫu</button>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <article key={draft.draftId} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-gray-900 truncate">{draft.metadata?.title || 'Chưa đặt tên'}</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Mẫu: {draft.templateName || draft.templateId || 'Không xác định'} · Lưu gần nhất {new Date(draft.updatedAt).toLocaleString('vi-VN')}
                    {draft.serverId ? ' · Có bản làm việc trên máy chủ' : ' · Chỉ trên thiết bị'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(`/customize/draft/${draft.draftId}`)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold">
                    <Pencil className="w-3.5 h-3.5" /> Tiếp tục
                  </button>
                  <button disabled={!!busyDraftId} onClick={() => handleDuplicate(draft.draftId)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold disabled:opacity-50">
                    <Copy className="w-3.5 h-3.5" /> Nhân bản
                  </button>
                  <button disabled={!!busyDraftId} onClick={() => handleDelete(draft)} aria-label="Xóa bản nháp" className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-rose-600 disabled:opacity-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
