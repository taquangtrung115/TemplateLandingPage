import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customizationApi } from '../api/customizationApi';
import { templateApi } from '../api/templateApi';
import LandingPageRenderer from '../components/templates/LandingPageRenderer';
import QrCodeModal from '../components/common/QrCodeModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDefaultConfigByCategory } from '../utils/defaultTemplates';
import { 
  Share2, Copy, Check, QrCode, Sparkles, ExternalLink, Home, Heart
} from 'lucide-react';

export default function PublicLandingPage() {
  const { slug } = useParams();
  const [config, setConfig] = useState(null);
  const [customizationId, setCustomizationId] = useState(null);
  const [pageTitle, setPageTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLandingData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!slug) {
          throw new Error('Đường dẫn không hợp lệ');
        }

        let parsedConfig = null;
        let title = '';

        // Attempt 1: Fetch customization by slug
        try {
          const customData = await customizationApi.getCustomizationBySlug(slug);
          setCustomizationId(customData.id);
          title = customData.title;
          parsedConfig = typeof customData.configJson === 'string'
            ? JSON.parse(customData.configJson)
            : customData.configJson;
        } catch {
          // Attempt 2: Fetch template by slug (fallback)
          const tmpl = await templateApi.getTemplateBySlug(slug);
          title = tmpl.name;
          parsedConfig = typeof tmpl.defaultConfigJson === 'string'
            ? JSON.parse(tmpl.defaultConfigJson)
            : (tmpl.defaultConfigJson || getDefaultConfigByCategory(tmpl.category));
        }

        setConfig(parsedConfig);
        setPageTitle(title);
        if (title) {
          document.title = `${title} | Landing Page`;
        }
      } catch (err) {
        console.error('Failed to load public landing page:', err);
        setError(err.message || 'Không tìm thấy trang này.');
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, [slug]);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pageTitle || 'Landing Page',
          text: `Khám phá trang thiệp & landing page: ${pageTitle}`,
          url: currentUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          setIsQrOpen(true);
        }
      }
    } else {
      setIsQrOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" message="Đang nạp trang của bạn..." />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 font-black text-2xl shadow-inner">
          !
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Trang không khả dụng</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          {error || 'Đường dẫn landing page này không tồn tại hoặc đã hết hạn.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md"
        >
          <Home className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-rose-500 selection:text-white">
      {/* Floating Action Menu (Share, Copy, QR Code) */}
      <aside aria-label="Công cụ chia sẻ trang" className="fixed top-4 right-4 z-40 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-2xl">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'text-slate-200 hover:text-white hover:bg-white/10'
          }`}
          title="Sao chép liên kết"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Đã chép' : 'Sao chép'}</span>
        </button>

        <button
          onClick={() => setIsQrOpen(true)}
          className="p-1.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition"
          title="Xem mã QR"
        >
          <QrCode className="w-4 h-4" />
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md"
          title="Chia sẻ trang"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Chia sẻ</span>
        </button>
      </aside>

      {/* Main Landing Page Content */}
      <main className="flex-1">
        <LandingPageRenderer
          config={config}
          customizationId={customizationId}
          isPreview={false}
        />
      </main>

      {/* Sticky Watermark & Web License Footer */}
      <footer className="relative z-30 bg-slate-950 text-slate-400 py-4 px-4 sm:px-8 border-t border-slate-800/80 shadow-2xl">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">
              Được thiết kế trên nền tảng <strong className="text-white font-semibold">Template Landing Page</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/?ref=watermark"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition hover:scale-105"
            >
              <Sparkles className="w-3 h-3" />
              <span>Tạo trang tương tự miễn phí</span>
            </Link>

            <span className="text-slate-500 text-[11px] hidden md:inline">
              © {new Date().getFullYear()} All Rights Reserved
            </span>
          </div>
        </div>
      </footer>

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={currentUrl}
        title={pageTitle ? `Mã QR: ${pageTitle}` : 'Mã QR Trang Landing Page'}
      />
    </div>
  );
}
