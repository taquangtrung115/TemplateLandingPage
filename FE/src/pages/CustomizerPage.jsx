import React, { useState, useEffect, useDeferredValue, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { templateApi } from '../api/templateApi';
import { customizationApi } from '../api/customizationApi';
import CustomizerToolbar from '../components/customizer/CustomizerToolbar';
import CustomizerSidebar from '../components/customizer/CustomizerSidebar';
import LandingPageRenderer from '../components/templates/LandingPageRenderer';
import DeviceSimulator from '../components/common/DeviceSimulator';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDefaultConfigByCategory } from '../utils/defaultTemplates';
import { exportStandaloneHtml } from '../utils/htmlExporter';
import useAuth from '../hooks/useAuth';
import { Edit3, Eye, Globe, Check, AlertCircle } from 'lucide-react';

export default function CustomizerPage() {
  const { templateId, customizationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'mobile'
  const [mobileTab, setMobileTab] = useState('edit'); // 'edit' | 'preview'

  // Community publish modal state
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishForm, setPublishForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'Wedding',
    authorName: '',
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState('');

  const [template, setTemplate] = useState(null);
  const [config, setConfig] = useState(null);
  const [metadata, setMetadata] = useState({
    title: 'Thiệp Mời Của Tôi',
    slug: `thiep-${Date.now().toString().slice(-6)}`,
    isPublished: true,
  });
  const [currentCustomizationId, setCurrentCustomizationId] = useState(customizationId || null);

  // Smooth typing & live visual feedback highlight
  const deferredConfig = useDeferredValue(config);
  const [activeEditSection, setActiveEditSection] = useState(null);
  const [editFeedbackKey, setEditFeedbackKey] = useState(0);
  const highlightTimeoutRef = useRef(null);

  const handleSectionEdit = useCallback((sectionKey) => {
    setActiveEditSection(sectionKey);
    setEditFeedbackKey((k) => k + 1);

    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setActiveEditSection(null);
    }, 900);
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        if (customizationId) {
          // Edit existing customization
          const customData = await customizationApi.getCustomizationById(customizationId);
          setCurrentCustomizationId(customData.id);
          setMetadata({
            title: customData.title,
            slug: customData.slug,
            isPublished: customData.isPublished,
          });
          const parsed = typeof customData.configJson === 'string'
            ? JSON.parse(customData.configJson)
            : customData.configJson;
          setConfig(parsed);

          // also get template details
          const tmpl = await templateApi.getTemplateById(customData.templateId);
          setTemplate(tmpl);
        } else if (templateId) {
          // Create new customization from master template
          const tmpl = await templateApi.getTemplateById(templateId);
          setTemplate(tmpl);

          let initialConfig;
          try {
            const localDraftStr = localStorage.getItem(`guest_draft_${templateId}`);
            if (localDraftStr) {
              const localDraft = JSON.parse(localDraftStr);
              if (localDraft?.config) {
                initialConfig = localDraft.config;
                if (localDraft?.metadata) {
                  setMetadata(localDraft.metadata);
                }
              }
            }
          } catch {}

          if (!initialConfig) {
            try {
              initialConfig = typeof tmpl.defaultConfigJson === 'string'
                ? JSON.parse(tmpl.defaultConfigJson)
                : (tmpl.defaultConfigJson || getDefaultConfigByCategory(tmpl.category));
            } catch {
              initialConfig = getDefaultConfigByCategory(tmpl.category);
            }
          }
          setConfig(initialConfig);
          if (!metadata?.title || metadata.title === 'Thiệp Mời Của Tôi') {
            setMetadata({
              title: `${tmpl.name} - ${user?.fullName || 'Thiệp Mời'}`,
              slug: `${tmpl.slug}-${Date.now().toString().slice(-6)}`,
              isPublished: true,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load customizer data:', err);
        // Check local storage draft fallback
        try {
          const localDraftStr = localStorage.getItem(`guest_draft_${templateId}`);
          if (localDraftStr) {
            const localDraft = JSON.parse(localDraftStr);
            if (localDraft?.config) {
              setConfig(localDraft.config);
              if (localDraft?.metadata) setMetadata(localDraft.metadata);
              return;
            }
          }
        } catch {}
        // Fallback default
        setConfig(getDefaultConfigByCategory('Wedding'));
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [templateId, customizationId, user]);

  const handleSave = async () => {
    setSaving(true);
    const targetTemplateId = template?.id || templateId;

    // Backup to local storage draft immediately
    try {
      localStorage.setItem(`guest_draft_${targetTemplateId}`, JSON.stringify({
        metadata,
        config,
        savedAt: new Date().toISOString(),
      }));
    } catch {}

    try {
      const payload = {
        templateId: targetTemplateId,
        title: metadata.title,
        slug: metadata.slug,
        configJson: JSON.stringify(config),
        isPublished: metadata.isPublished,
      };

      if (currentCustomizationId) {
        await customizationApi.updateCustomization(currentCustomizationId, payload);
        alert('Cập nhật thiệp thành công! Bạn có thể xem trước trực tiếp hoặc xuất HTML để lưu trữ.');
      } else {
        const newId = await customizationApi.saveCustomization(payload);
        setCurrentCustomizationId(newId);
        alert('Lưu thiệp mới thành công!');
        navigate(`/customize/${templateId}/${newId}`, { replace: true });
      }
    } catch (err) {
      alert(err.message || 'Không thể lưu lên máy chủ. Bản nháp đã được tự động lưu an toàn trong trình duyệt của bạn!');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${metadata.slug || 'template-config'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportHtml = () => {
    exportStandaloneHtml(config, metadata.title);
  };

  const handleOpenLivePreview = () => {
    if (metadata.slug) {
      window.open(`/view/${metadata.slug}`, '_blank');
    }
  };

  const handleOpenPublishModal = () => {
    const baseSlug = (metadata?.slug || template?.slug || 'community')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    setPublishForm({
      name: metadata?.title || template?.name || 'Mẫu thiết kế cộng đồng',
      slug: `${baseSlug}-${Date.now().toString().slice(-4)}`,
      description: template?.description || 'Mẫu thiết kế sáng tạo đóng góp từ cộng đồng người dùng.',
      category: template?.category || 'Wedding',
      authorName: user?.fullName || 'Tác giả cộng đồng',
    });
    setPublishSuccess(false);
    setPublishError('');
    setIsPublishModalOpen(true);
  };

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    setIsPublishing(true);
    setPublishError('');
    try {
      const payload = {
        name: publishForm.name.trim(),
        slug: publishForm.slug.trim(),
        description: publishForm.description?.trim() || null,
        category: publishForm.category,
        thumbnailUrl: template?.thumbnailUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
        defaultConfigJson: JSON.stringify(config),
        authorName: publishForm.authorName.trim(),
      };
      await templateApi.publishCommunityTemplate(payload);
      setPublishSuccess(true);
    } catch (err) {
      setPublishError(err.response?.data?.message || err.message || 'Không thể chia sẻ mẫu vào cộng đồng.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" message="Đang nạp không gian tùy biến..." />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* Topbar */}
      <CustomizerToolbar
        viewport={viewport}
        setViewport={setViewport}
        onSave={handleSave}
        saving={saving}
        onDownloadJson={handleDownloadJson}
        onExportHtml={handleExportHtml}
        onOpenLivePreview={currentCustomizationId ? handleOpenLivePreview : null}
        onPublishCommunity={handleOpenPublishModal}
        title={metadata.title}
      />

      {/* Main Workspace (Split View on desktop, tabbed on mobile) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Interactive Sidebar */}
        <div className={`w-full md:w-auto ${mobileTab === 'edit' ? 'flex' : 'hidden'} md:flex flex-col h-full z-10`}>
          <CustomizerSidebar
            config={config}
            onChange={setConfig}
            metadata={metadata}
            onMetadataChange={setMetadata}
            onSectionEdit={handleSectionEdit}
          />
        </div>

        {/* Right: Live Interactive Canvas */}
        <div
          className={`flex-1 bg-gray-900/95 overflow-y-auto ${
            mobileTab === 'preview' ? 'flex' : 'hidden'
          } md:flex items-center justify-center p-2 sm:p-6 transition-all duration-300 pb-20 md:pb-6`}
        >
          {viewport === 'desktop' ? (
            <div className="w-full h-full rounded-2xl overflow-y-auto shadow-2xl bg-white no-scrollbar">
              <LandingPageRenderer
                config={deferredConfig}
                customizationId={currentCustomizationId}
                isPreview={true}
                activeEditSection={activeEditSection}
                editFeedbackKey={editFeedbackKey}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <DeviceSimulator initialOs="ios" showToolbar={true}>
                <LandingPageRenderer
                  config={deferredConfig}
                  customizationId={currentCustomizationId}
                  isPreview={true}
                  activeEditSection={activeEditSection}
                  editFeedbackKey={editFeedbackKey}
                />
              </DeviceSimulator>
            </div>
          )}
        </div>

        {/* Mobile Floating Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-1.5 flex items-center justify-around gap-2">
          <button
            onClick={() => setMobileTab('edit')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mobileTab === 'edit'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Chỉnh Sửa</span>
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mobileTab === 'preview'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Xem Trước</span>
          </button>
        </div>
      </div>

      {/* Community Publish Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Chia Sẻ Mẫu Thiết Kế Cộng Đồng"
      >
        {publishSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Đã công khai mẫu thành công!</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Mẫu thiết kế của bạn đã được đóng góp vào Thư Viện Mẫu Cộng Đồng và sẵn sàng để mọi người cùng khám phá.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl"
              >
                Đóng
              </button>
              <button
                onClick={() => navigate('/templates?tab=community')}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition"
              >
                Xem Kho Cộng Đồng
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePublishSubmit} className="space-y-4 text-xs">
            {publishError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{publishError}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Tên Mẫu Thiết Kế *</label>
              <input
                type="text"
                required
                value={publishForm.name}
                onChange={(e) => setPublishForm({ ...publishForm, name: e.target.value })}
                placeholder="VD: Thiệp Cưới Hoa Sen Tinh Tế"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Đường Dẫn Slug *</label>
                <input
                  type="text"
                  required
                  value={publishForm.slug}
                  onChange={(e) => setPublishForm({ ...publishForm, slug: e.target.value })}
                  placeholder="thiep-cuoi-hoa-sen"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Danh Mục *</label>
                <select
                  value={publishForm.category}
                  onChange={(e) => setPublishForm({ ...publishForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                >
                  <option value="Wedding">Wedding (Cưới)</option>
                  <option value="Birthday">Birthday (Sinh nhật)</option>
                  <option value="Event">Event (Sự kiện)</option>
                  <option value="Business">Business (Doanh nghiệp)</option>
                  <option value="spa-beauty">Spa & Làm Đẹp</option>
                  <option value="podcast-music">Podcast & Âm Nhạc</option>
                  <option value="tech-startup">Công Nghệ & Startup</option>
                  <option value="photography">Nhiếp Ảnh Studio</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Tên Tác Giả / Người Đóng Góp *</label>
              <input
                type="text"
                required
                value={publishForm.authorName}
                onChange={(e) => setPublishForm({ ...publishForm, authorName: e.target.value })}
                placeholder="VD: Alex Quang Trung"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Mô Tả Giới Thiệu (Tùy chọn)</label>
              <textarea
                rows={2}
                value={publishForm.description}
                onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                placeholder="Giới thiệu phong cách, tone màu hoặc ý tưởng của mẫu..."
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
              />
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 font-semibold text-gray-600 hover:text-gray-800 rounded-xl transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isPublishing}
                className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isPublishing ? 'Đang xuất bản...' : 'Công Khai Ngay'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
