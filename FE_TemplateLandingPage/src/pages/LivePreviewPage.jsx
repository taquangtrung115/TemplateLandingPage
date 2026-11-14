import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { customizationApi } from '../api/customizationApi';
import { templateApi } from '../api/templateApi';
import LandingPageRenderer from '../components/templates/LandingPageRenderer';
import LoadingSpinner from '../components/LoadingSpinner';
import { Edit3, Home } from 'lucide-react';

const parseConfig = (value) => {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid preview configuration');
  }
  return parsed;
};

export default function LivePreviewPage() {
  const { templateId, slug, versionNumber: routeVersionNumber } = useParams();
  const [config, setConfig] = useState(null);
  const [customizationId, setCustomizationId] = useState(null);
  const [customizationVersionId, setCustomizationVersionId] = useState(null);
  const [sourceTemplateId, setSourceTemplateId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let isCurrentRequest = true;

    const fetchData = async () => {
      setLoading(true);
      setUnavailable(false);
      setConfig(null);
      setCustomizationId(null);
      setCustomizationVersionId(null);
      setSourceTemplateId(null);

      try {
        let loadedConfig;
        if (slug) {
          const requestedVersionNumber = routeVersionNumber ? Number(routeVersionNumber) : null;
          if (routeVersionNumber && (!Number.isSafeInteger(requestedVersionNumber) || requestedVersionNumber < 1)) {
            throw new Error('Invalid public version');
          }
          const publicPage = requestedVersionNumber
            ? await customizationApi.getPublicCustomizationVersionBySlug(slug, requestedVersionNumber)
            : await customizationApi.getPublicCustomizationBySlug(slug);
          loadedConfig = parseConfig(publicPage?.configJson);
          if (!publicPage?.id || !publicPage?.versionId) throw new Error('Incomplete public response');
          if (isCurrentRequest) {
            setCustomizationId(publicPage.id);
            setCustomizationVersionId(publicPage.versionId);
            setSourceTemplateId(publicPage.templateId);
          }
        } else if (templateId) {
          const template = await templateApi.getTemplateById(templateId);
          loadedConfig = parseConfig(template?.defaultConfigJson);
          if (isCurrentRequest) setSourceTemplateId(templateId);
        } else {
          throw new Error('Missing preview target');
        }

        if (isCurrentRequest) setConfig(loadedConfig);
      } catch {
        if (isCurrentRequest) setUnavailable(true);
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isCurrentRequest = false;
    };
  }, [templateId, slug, routeVersionNumber]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" message="Đang tải trang..." />
      </div>
    );
  }

  if (unavailable || !config) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 font-bold text-2xl">!</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trang không khả dụng</h2>
        <p className="text-sm text-gray-500 max-w-md mb-6">
          Đường dẫn này không tồn tại, chưa được công khai hoặc đã bị gỡ.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors">
          <Home className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>
    );
  }

  const isPublicSite = Boolean(slug && customizationId && customizationVersionId);

  return (
    <div className="relative min-h-screen bg-white">
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
      <LandingPageRenderer
        config={config}
        customizationId={customizationId}
        customizationVersionId={customizationVersionId}
        isPreview={!isPublicSite}
      />
    </div>
  );
}
