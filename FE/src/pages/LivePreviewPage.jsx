import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { templateApi } from '../api/templateApi';
import { customizationApi } from '../api/customizationApi';
import LandingPageRenderer from '../components/templates/LandingPageRenderer';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDefaultConfigByCategory } from '../utils/defaultTemplates';
import { Edit3, Home } from 'lucide-react';

export default function LivePreviewPage() {
  const { templateId, slug } = useParams();
  const [config, setConfig] = useState(null);
  const [customizationId, setCustomizationId] = useState(null);
  const [sourceTemplateId, setSourceTemplateId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (slug) {
          // Published customization
          const customData = await customizationApi.getCustomizationBySlug(slug);
          setCustomizationId(customData.id);
          setSourceTemplateId(customData.templateId);
          const parsed = typeof customData.configJson === 'string'
            ? JSON.parse(customData.configJson)
            : customData.configJson;
          setConfig(parsed);
        } else if (templateId) {
          // Master template preview
          setSourceTemplateId(templateId);
          const tmpl = await templateApi.getTemplateById(templateId);
          let parsed;
          try {
            parsed = typeof tmpl.defaultConfigJson === 'string'
              ? JSON.parse(tmpl.defaultConfigJson)
              : (tmpl.defaultConfigJson || getDefaultConfigByCategory(tmpl.category));
          } catch {
            parsed = getDefaultConfigByCategory(tmpl.category);
          }
          setConfig(parsed);
        }
      } catch (err) {
        console.error('Failed to load live preview:', err);
        setError(err.message || 'Không tìm thấy trang thiệp mời này.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [templateId, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" message="Đang tải trang thiệp mời..." />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 font-bold text-2xl">
          !
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trang không tồn tại</h2>
        <p className="text-sm text-gray-500 max-w-md mb-6">{error || 'Đường dẫn thiệp mời này không hợp lệ hoặc đã bị gỡ.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      {/* Floating Action Pill in Master Template preview */}
      {!slug && sourceTemplateId && (
        <div className="fixed top-4 right-4 z-50">
          <Link
            to={`/customize/${sourceTemplateId}`}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-bold shadow-xl hover:bg-rose-700 transition-all hover:scale-105"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Tùy Biến Mẫu Này</span>
          </Link>
        </div>
      )}

      {/* Render full Landing Page */}
      <LandingPageRenderer
        config={config}
        customizationId={customizationId}
        isPreview={false}
      />
    </div>
  );
}
