import { workspacePublicUrl } from '../utils/tenantScope';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { customizationApi } from '../api/customizationApi';
import LandingPageRenderer from '../components/templates/LandingPageRenderer';
import QrCodeModal from '../components/common/QrCodeModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Check, Copy, Home, QrCode, Share2, Sparkles } from 'lucide-react';

const getConfigObject = (configJson) => {
  const parsed = typeof configJson === 'string' ? JSON.parse(configJson) : configJson;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid public page configuration');
  }
  return parsed;
};

export default function PublicLandingPage() {
  const { slug, versionNumber: routeVersionNumber } = useParams();
  const requestedVersionNumber = routeVersionNumber ? Number(routeVersionNumber) : null;
  const [publicPage, setPublicPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isCurrentRequest = true;

    const fetchLandingData = async () => {
      setLoading(true);
      setUnavailable(false);
      setPublicPage(null);

      try {
        if (!slug || (routeVersionNumber && (!Number.isSafeInteger(requestedVersionNumber) || requestedVersionNumber < 1))) {
          throw new Error('Invalid public page route');
        }

        const data = requestedVersionNumber
          ? await customizationApi.getPublicCustomizationVersionBySlug(slug, requestedVersionNumber)
          : await customizationApi.getPublicCustomizationBySlug(slug);

        const config = getConfigObject(data?.configJson);
        if (!data?.id || !data?.versionId || !data?.slug || !data?.templateId) {
          throw new Error('Public page response is incomplete');
        }

        if (isCurrentRequest) {
          setPublicPage({ ...data, config });
          document.title = `${data.title || 'Trang của tôi'} | Landing Page`;
        }
      } catch {
        if (isCurrentRequest) setUnavailable(true);
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    };

    fetchLandingData();
    return () => {
      isCurrentRequest = false;
    };
  }, [slug, routeVersionNumber, requestedVersionNumber]);

  const canonicalUrl = useMemo(() => {
    if (!publicPage?.slug || typeof window === 'undefined') return '';
    const path = requestedVersionNumber
      ? `/p/${encodeURIComponent(publicPage.slug)}/v/${publicPage.versionNumber || requestedVersionNumber}`
      : `/p/${encodeURIComponent(publicPage.slug)}`;
    return workspacePublicUrl(path);
  }, [publicPage?.slug, publicPage?.versionNumber, requestedVersionNumber]);

  const handleCopy = async () => {
    if (!canonicalUrl) return;
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleShare = async () => {
    if (!canonicalUrl) return;
    if (!navigator.share) {
      setIsQrOpen(true);
      return;
    }

    try {
      await navigator.share({
        title: publicPage?.title || 'Landing Page',
        text: `Khám phá trang: ${publicPage?.title || 'Landing Page'}`,
        url: canonicalUrl,
      });
    } catch (error) {
      if (error.name !== 'AbortError') setIsQrOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" message="Đang tải trang..." />
      </div>
    );
  }

  if (unavailable || !publicPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 font-black text-2xl shadow-inner">
          !
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Trang không khả dụng</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          Đường dẫn này không tồn tại, chưa được công khai hoặc đã bị gỡ.
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
      <aside aria-label="Công cụ chia sẻ trang" className="fixed top-4 right-4 z-40 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-2xl">
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${copied ? 'bg-emerald-500 text-white' : 'text-slate-200 hover:text-white hover:bg-white/10'}`}
          title="Sao chép liên kết"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Đã chép' : 'Sao chép'}</span>
        </button>
        <button
          type="button"
          onClick={() => setIsQrOpen(true)}
          className="p-1.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition"
          title="Xem mã QR"
        >
          <QrCode className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md"
          title="Chia sẻ trang"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Chia sẻ</span>
        </button>
      </aside>

      <main className="flex-1">
        <LandingPageRenderer
          config={publicPage.config}
          customizationId={publicPage.id}
          customizationVersionId={publicPage.versionId}
          isPreview={false}
        />
      </main>

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
            <span className="text-slate-500 text-[11px] hidden md:inline">© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

      <QrCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={canonicalUrl}
        title={publicPage.title ? `Mã QR: ${publicPage.title}` : 'Mã QR Trang Landing Page'}
      />
    </div>
  );
}
