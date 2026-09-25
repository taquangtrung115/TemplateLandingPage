import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ExternalLink, Edit3, Trash2, Copy, Check, Plus, Calendar, Layers, Globe, Eye } from 'lucide-react';
import { customizationApi } from '../api/customizationApi';
import LoadingSpinner from '../components/LoadingSpinner';
import LandingPageRenderer from '../components/templates/LandingPageRenderer';
import useAuth from '../hooks/useAuth';
import { createDraftId, saveDraft } from '../utils/draftStore';

const PAGE_SIZE = 12;
const getItems = (result) => Array.isArray(result) ? result : (result?.data || []);
const toAbsoluteUrl = (value) => new URL(value, window.location.origin).href;

export default function MyCustomizationsPage() {
  const navigate = useNavigate();
  const { accountId } = useAuth();
  const [customizations, setCustomizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedSiteId, setExpandedSiteId] = useState(null);
  const [versionsBySite, setVersionsBySite] = useState({});
  const [versionPagingBySite, setVersionPagingBySite] = useState({});
  const [versionsLoadingId, setVersionsLoadingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [previewVersion, setPreviewVersion] = useState(null);
  const loadRequestRef = useRef(0);

  const fetchMySites = useCallback(async () => {
    const requestId = ++loadRequestRef.current;
    setLoading(true);
    setError('');
    try {
      const result = await customizationApi.getMyCustomizations({ page, pageSize: PAGE_SIZE });
      if (requestId !== loadRequestRef.current) return;
      setCustomizations(getItems(result));
      setTotal(result?.total ?? getItems(result).length);
      setVersionsBySite({});
      setVersionPagingBySite({});
      setExpandedSiteId(null);
    } catch (loadError) {
      if (requestId === loadRequestRef.current) setError(loadError.message || 'Không thể tải danh sách trang.');
    } finally {
      if (requestId === loadRequestRef.current) setLoading(false);
    }
  }, [page, accountId]);

  useEffect(() => {
    setCustomizations([]);
    setPreviewVersion(null);
    void fetchMySites();
    return () => { loadRequestRef.current += 1; };
  }, [fetchMySites]);

  const handleCopyMainLink = async (item) => {
    if (!item.publishedVersionId) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/p/${encodeURIComponent(item.slug)}`);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError('Không thể sao chép liên kết. Hãy mở trang công khai và sao chép địa chỉ trên trình duyệt.');
    }
  };

  const handleToggleVersions = async (item) => {
    if (expandedSiteId === item.id) {
      setExpandedSiteId(null);
      return;
    }
    setExpandedSiteId(item.id);
    if (versionsBySite[item.id]) return;
    setVersionsLoadingId(item.id);
    try {
      const result = await customizationApi.getVersions(item.id, { page: 1, pageSize: 50 });
      const items = getItems(result);
      setVersionsBySite((current) => ({ ...current, [item.id]: items }));
      setVersionPagingBySite((current) => ({
        ...current,
        [item.id]: { page: result?.page ?? 1, pageSize: result?.pageSize ?? 50, total: result?.total ?? items.length },
      }));
    } catch (versionsError) {
      setError(versionsError.message || 'Không thể tải danh sách phiên bản.');
    } finally {
      setVersionsLoadingId(null);
    }
  };

  const handleLoadMoreVersions = async (item) => {
    if (versionsLoadingId === item.id) return;
    const paging = versionPagingBySite[item.id];
    if (!paging || paging.page * paging.pageSize >= paging.total) return;
    setVersionsLoadingId(item.id);
    setError('');
    try {
      const nextPage = paging.page + 1;
      const result = await customizationApi.getVersions(item.id, { page: nextPage, pageSize: paging.pageSize });
      const items = getItems(result);
      setVersionsBySite((current) => {
        const knownIds = new Set((current[item.id] || []).map((version) => version.id));
        return { ...current, [item.id]: [...(current[item.id] || []), ...items.filter((version) => !knownIds.has(version.id))] };
      });
      setVersionPagingBySite((current) => ({
        ...current,
        [item.id]: { page: result?.page ?? nextPage, pageSize: result?.pageSize ?? paging.pageSize, total: result?.total ?? paging.total },
      }));
    } catch (loadError) {
      setError(loadError.message || 'Không thể tải thêm phiên bản.');
    } finally {
      setVersionsLoadingId(null);
    }
  };

  const updateSite = (id, changes) => setCustomizations((items) => items.map((item) => item.id === id ? { ...item, ...changes } : item));

  const handlePublishVersion = async (item, version) => {
    if (busyId) return;
    setBusyId(item.id);
    setError('');
    try {
      const result = await customizationApi.publishVersion(item.id, { versionId: version.id, expectedRevision: item.revision });
      updateSite(item.id, { revision: result.revision, publishedVersionId: version.id });
      setVersionsBySite((current) => ({
        ...current,
        [item.id]: (current[item.id] || []).map((candidate) => ({
          ...candidate,
          isMain: candidate.id === version.id,
          isPublic: candidate.id === version.id ? true : candidate.isPublic,
        })),
      }));
    } catch (publishError) {
      setError(publishError.message || 'Không thể chọn phiên bản công khai.');
    } finally {
      setBusyId(null);
    }
  };

  const handleUnpublishVersion = async (item, version) => {
    if (busyId) return;
    setBusyId(item.id);
    setError('');
    try {
      const result = await customizationApi.unpublishVersion(item.id, version.id, item.revision);
      updateSite(item.id, { revision: result.revision, publishedVersionId: item.publishedVersionId === version.id ? null : item.publishedVersionId });
      setVersionsBySite((current) => ({
        ...current,
        [item.id]: (current[item.id] || []).map((candidate) => candidate.id === version.id ? { ...candidate, isPublic: false, isMain: false } : candidate),
      }));
    } catch (unpublishError) {
      setError(unpublishError.message || 'Không thể gỡ phiên bản khỏi công khai.');
    } finally {
      setBusyId(null);
    }
  };

  const handleUnpublishSite = async (item) => {
    if (busyId) return;
    setBusyId(item.id);
    setError('');
    try {
      const result = await customizationApi.unpublishSite(item.id, item.revision);
      updateSite(item.id, { revision: result.revision, publishedVersionId: null });
      setVersionsBySite((current) => ({ ...current, [item.id]: (current[item.id] || []).map((version) => ({ ...version, isPublic: false, isMain: false })) }));
    } catch (unpublishError) {
      setError(unpublishError.message || 'Không thể gỡ toàn bộ trang.');
    } finally {
      setBusyId(null);
    }
  };

  const handlePreviewVersion = async (item, version) => {
    setBusyId(item.id);
    setError('');
    try {
      const detail = await customizationApi.getVersion(item.id, version.id);
      const config = typeof detail.configJson === 'string' ? JSON.parse(detail.configJson) : detail.configJson;
      if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('Cấu hình phiên bản không hợp lệ.');
      setPreviewVersion({ ...version, config, customizationId: item.id });
    } catch (previewError) {
      setError(previewError.message || 'Không thể xem trước phiên bản.');
    } finally {
      setBusyId(null);
    }
  };

  const handleContinueFromVersion = async (item, version) => {
    setBusyId(item.id);
    setError('');
    try {
      const detail = await customizationApi.getVersion(item.id, version.id);
      const config = typeof detail.configJson === 'string' ? JSON.parse(detail.configJson) : detail.configJson;
      if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('Cấu hình phiên bản không hợp lệ.');
      const draft = await saveDraft({
        draftId: createDraftId(),
        templateId: item.templateId,
        templateName: item.templateName || '',
        config,
        metadata: { title: version.title || item.title, slug: item.slug },
        accountId,
        serverId: item.id,
        serverRevision: item.revision,
        publishedVersionId: item.publishedVersionId || null,
      }, 0);
      navigate(`/customize/draft/${draft.draftId}`);
    } catch (continueError) {
      setError(continueError.message || 'Không thể tạo bản nháp từ phiên bản.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item) => {
    if (busyId || !window.confirm(`Xóa trang “${item.title || item.slug}”? Các URL công khai sẽ ngừng hoạt động.`)) return;
    setBusyId(item.id);
    setError('');
    try {
      await customizationApi.deleteCustomization(item.id, item.revision);
      setCustomizations((current) => current.filter((site) => site.id !== item.id));
      setTotal((current) => Math.max(0, current - 1));
    } catch (deleteError) {
      setError(deleteError.message || 'Không thể xóa trang.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2"><Heart className="w-6 h-6 text-rose-600" /> Trang của tôi</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý bản nháp làm việc, phiên bản và trang công khai.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/drafts" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-white text-xs font-bold text-gray-700"><Layers className="w-4 h-4" /> Bản nháp thiết bị</Link>
            <Link to="/templates" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold"><Plus className="w-4 h-4" /> Tạo trang mới</Link>
          </div>
        </header>

        {error && <div role="alert" className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">{error}<button onClick={() => void fetchMySites()} className="ml-3 underline font-semibold">Tải lại danh sách</button></div>}

        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner size="lg" message="Đang tải trang của bạn..." /></div>
        ) : error && customizations.length === 0 ? null : customizations.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 max-w-lg mx-auto">
            <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-800">Chưa có trang trên máy chủ</h2>
            <p className="text-sm text-gray-500 mt-2">Bản nháp trên thiết bị vẫn có thể tiếp tục tại mục Bản nháp.</p>
            <Link to="/drafts" className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-rose-600 text-white text-sm font-semibold">Mở bản nháp</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {customizations.map((item) => (
              <article key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">{item.templateName || 'Thiết kế'}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${item.publishedVersionId ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{item.publishedVersionId ? 'URL chính đang mở' : 'URL chính đang đóng'}</span>
                    </div>
                    <h2 className="text-base font-bold text-gray-900 truncate">{item.title}</h2>
                    <p className="mt-1 text-xs text-gray-500 font-mono truncate">/p/{item.slug}</p>
                    <p className="mt-1 text-[11px] text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Cập nhật {item.updatedAtUtc ? new Date(item.updatedAtUtc).toLocaleDateString('vi-VN') : new Date(item.createdAtUtc).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => void handleToggleVersions(item)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold"><Layers className="w-3.5 h-3.5" /> Phiên bản</button>
                    <button onClick={() => navigate(`/customize/${item.templateId}/${item.id}`)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold"><Edit3 className="w-3.5 h-3.5" /> Sửa nháp</button>
                    {item.publishedVersionId && <button onClick={() => handleCopyMainLink(item)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold"><Copy className="w-3.5 h-3.5" /> {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : 'Sao chép link'}</button>}
                    {item.publishedVersionId && <a href={`/p/${encodeURIComponent(item.slug)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold"><ExternalLink className="w-3.5 h-3.5" /> Xem trang</a>}
                    <button disabled={busyId === item.id} onClick={() => handleDelete(item)} aria-label="Xóa trang" className="p-2 rounded-lg border text-gray-400 hover:text-rose-600 disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {expandedSiteId === item.id && (
                  <div className="border-t bg-gray-50/70 p-4 sm:p-5">
                    {versionsLoadingId === item.id ? <div className="flex justify-center py-6"><LoadingSpinner size="sm" message="Đang tải phiên bản..." /></div> : (
                      <div className="space-y-3">
                        {(versionsBySite[item.id] || []).length === 0 ? <p className="text-xs text-gray-500">Chưa tạo phiên bản nào.</p> : (versionsBySite[item.id] || []).map((version) => (
                          <div key={version.id} className="bg-white border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-gray-800">v{version.versionNumber} · {version.title}</p>
                              <p className="text-[10px] mt-1 text-gray-500">{new Date(version.createdAtUtc).toLocaleString('vi-VN')} · {(version.isMain || item.publishedVersionId === version.id) ? 'Bản chính' : version.isPublic ? 'Công khai' : 'Riêng tư'}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button disabled={busyId === item.id} onClick={() => handlePreviewVersion(item, version)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-[10px] font-semibold disabled:opacity-50"><Eye className="w-3 h-3" /> Xem trước</button>
                              <button disabled={busyId === item.id} onClick={() => handleContinueFromVersion(item, version)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-[10px] font-semibold disabled:opacity-50"><Edit3 className="w-3 h-3" /> Tiếp tục sửa</button>
                              {!(version.isMain || item.publishedVersionId === version.id) && <button disabled={busyId === item.id} onClick={() => handlePublishVersion(item, version)} className="px-2.5 py-1.5 rounded-md bg-rose-600 text-white text-[10px] font-semibold disabled:opacity-50">Đặt làm bản chính</button>}
                              {version.isPublic && <button disabled={busyId === item.id} onClick={() => handleUnpublishVersion(item, version)} className="px-2.5 py-1.5 rounded-md border border-rose-200 text-[10px] font-semibold text-rose-700 disabled:opacity-50">Gỡ công khai</button>}
                              {version.isPublic && <button onClick={async () => { try { await navigator.clipboard.writeText(toAbsoluteUrl(version.publicUrl || `/p/${encodeURIComponent(item.slug)}/v/${version.versionNumber}`)); setCopiedId(item.id); } catch { setError('Không thể sao chép liên kết phiên bản.'); } }} className="px-2.5 py-1.5 rounded-md border text-[10px] font-semibold">Sao chép URL</button>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {(versionPagingBySite[item.id]?.page || 1) * (versionPagingBySite[item.id]?.pageSize || 50) < (versionPagingBySite[item.id]?.total || 0) && (
                      <button disabled={versionsLoadingId === item.id} onClick={() => void handleLoadMoreVersions(item)} className="mt-3 px-3 py-2 rounded-lg border bg-white text-xs font-semibold disabled:opacity-50">
                        {versionsLoadingId === item.id ? 'Đang tải…' : `Tải thêm phiên bản (${versionPagingBySite[item.id].total - (versionsBySite[item.id] || []).length} còn lại)`}
                      </button>
                    )}
                    {(item.lastVersionNumber > 0 || (versionsBySite[item.id] || []).length > 0) && <button disabled={busyId === item.id} onClick={() => handleUnpublishSite(item)} className="mt-4 px-3 py-2 rounded-lg border border-rose-200 text-xs font-semibold text-rose-700 disabled:opacity-50">Gỡ toàn bộ trang khỏi công khai</button>}
                  </div>
                )}
              </article>
            ))}

            {total > PAGE_SIZE && <div className="flex items-center justify-between pt-2 text-xs text-gray-600">
              <span>{total} trang</span>
              <div className="flex gap-2 items-center">
                <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40">Trước</button>
                <span>Trang {page}</span>
                <button disabled={page * PAGE_SIZE >= total} onClick={() => setPage((current) => current + 1)} className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40">Sau</button>
              </div>
            </div>}
          </div>
        )}
      </div>
      {previewVersion && (
        <div className="fixed inset-0 z-[70] bg-gray-950 flex flex-col">
          <div className="h-14 shrink-0 px-4 flex items-center justify-between bg-white border-b">
            <div className="text-sm font-semibold">Xem trước v{previewVersion.versionNumber} · {previewVersion.title}</div>
            <button onClick={() => setPreviewVersion(null)} className="px-3 py-1.5 rounded-lg border text-xs">Đóng</button>
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            <LandingPageRenderer config={previewVersion.config} customizationId={previewVersion.customizationId} customizationVersionId={previewVersion.id} isPreview={true} />
          </div>
        </div>
      )}
    </div>
  );
}
