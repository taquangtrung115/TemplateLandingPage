import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { templateApi } from '../api/templateApi';
import { customizationApi } from '../api/customizationApi';
import CustomizerToolbar from '../components/customizer/CustomizerToolbar';
import CustomizerSidebar from '../components/customizer/CustomizerSidebar';
import LandingPageRenderer from '../components/templates/LandingPageRenderer';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDefaultConfigByCategory } from '../utils/defaultTemplates';
import { exportStandaloneHtml } from '../utils/htmlExporter';
import useAuth from '../hooks/useAuth';

export default function CustomizerPage() {
  const { templateId, customizationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'mobile'

  const [template, setTemplate] = useState(null);
  const [config, setConfig] = useState(null);
  const [metadata, setMetadata] = useState({
    title: 'Thiệp Mời Của Tôi',
    slug: `thiep-${Date.now().toString().slice(-6)}`,
    isPublished: true,
  });
  const [currentCustomizationId, setCurrentCustomizationId] = useState(customizationId || null);

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
            initialConfig = typeof tmpl.defaultConfigJson === 'string'
              ? JSON.parse(tmpl.defaultConfigJson)
              : (tmpl.defaultConfigJson || getDefaultConfigByCategory(tmpl.category));
          } catch {
            initialConfig = getDefaultConfigByCategory(tmpl.category);
          }
          setConfig(initialConfig);
          setMetadata({
            title: `${tmpl.name} - ${user?.fullName || 'Thiệp Mời'}`,
            slug: `${tmpl.slug}-${Date.now().toString().slice(-6)}`,
            isPublished: true,
          });
        }
      } catch (err) {
        console.error('Failed to load customizer data:', err);
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
    try {
      const payload = {
        templateId: template?.id || templateId,
        title: metadata.title,
        slug: metadata.slug,
        configJson: JSON.stringify(config),
        isPublished: metadata.isPublished,
      };

      if (currentCustomizationId) {
        await customizationApi.updateCustomization(currentCustomizationId, payload);
        alert('Cập nhật thiệp thành công!');
      } else {
        const newId = await customizationApi.saveCustomization(payload);
        setCurrentCustomizationId(newId);
        alert('Lưu thiệp mới thành công!');
        navigate(`/customize/${templateId}/${newId}`, { replace: true });
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu thiệp. Vui lòng kiểm tra lại slug!');
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
        title={metadata.title}
      />

      {/* Main Workspace (Split View) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Interactive Sidebar */}
        <CustomizerSidebar
          config={config}
          onChange={setConfig}
          metadata={metadata}
          onMetadataChange={setMetadata}
        />

        {/* Right: Live Interactive Canvas */}
        <div className="flex-1 bg-gray-900/90 overflow-y-auto flex items-center justify-center p-2 sm:p-6 transition-all duration-300">
          {viewport === 'desktop' ? (
            <div className="w-full h-full rounded-2xl overflow-y-auto shadow-2xl bg-white no-scrollbar">
              <LandingPageRenderer
                config={config}
                customizationId={currentCustomizationId}
                isPreview={true}
              />
            </div>
          ) : (
            <div className="w-[375px] h-[750px] rounded-[44px] border-[12px] border-gray-950 shadow-2xl overflow-y-auto bg-white no-scrollbar relative my-auto ring-1 ring-white/20">
              {/* Speaker / camera notch simulation */}
              <div className="sticky top-0 left-0 right-0 h-5 bg-black z-30 flex items-center justify-center">
                <div className="w-20 h-3 bg-gray-900 rounded-full" />
              </div>
              <LandingPageRenderer
                config={config}
                customizationId={currentCustomizationId}
                isPreview={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
