import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Heart,
  Music,
  Download,
  Zap,
  Play,
  Eye,
  Edit3,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { templateApi } from '../api/templateApi';
import QuickPreviewModal from '../components/templates/QuickPreviewModal';
import SplashScreen from '../components/home/SplashScreen';
import MaskedCard from '../components/home/MaskedCard';
import { useStaggeredReveal } from '../hooks/useStaggeredReveal';
import { useMaskPositions } from '../hooks/useMaskPositions';
import { useImageWidth } from '../hooks/useImageWidth';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80';
const SECTION2_IMAGE =
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&q=80';

export default function HomePage() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem('splash_shown');
    } catch {
      return false;
    }
  });

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [templateLoadError, setTemplateLoadError] = useState(false);
  const [templateRetryCount, setTemplateRetryCount] = useState(0);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Section 1: Hero Mask hook (3 feature bars + 1 main hero card)
  const heroMask = useMaskPositions(4);
  const heroImage = useImageWidth(heroMask.containerSize.height || 850);

  // Section 2: Mosaic Mask hook (4 cards sharing SECTION2_IMAGE)
  const mosaicMask = useMaskPositions(4);
  const mosaicImage = useImageWidth(mosaicMask.containerSize.height || 900);

  // Section 3: Scroll-driven step tracking
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = [useRef(null), useRef(null), useRef(null)];
  const [stepVisible, setStepVisible] = useState([true, false, false]);

  useEffect(() => {
    let isMounted = true;
    const fetchTemplates = async () => {
      setLoading(true);
      setTemplateLoadError(false);
      try {
        const data = await templateApi.getTemplates({ isActiveOnly: true });
        if (isMounted) {
          setTemplates(Array.isArray(data) ? data.slice(0, 4) : []);
        }
      } catch {
        if (isMounted) {
          setTemplates([]);
          setTemplateLoadError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchTemplates();
    return () => {
      isMounted = false;
    };
  }, [templateRetryCount]);

  // IntersectionObserver for Section 3 step cards
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setStepVisible([true, true, true]);
      return;
    }

    const observers = stepRefs.map((ref, idx) => {
      if (!ref.current) return null;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveStep(idx);
              setStepVisible((prev) => {
                const next = [...prev];
                next[idx] = true;
                return next;
              });
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(ref.current);
      return observer;
    });

    return () => {
      observers.forEach((obs) => obs?.disconnect());
    };
  }, []);

  const displayedTemplates = templates;

  // Staggered reveal hook for Mosaic Showcase
  const { isItemVisible } = useStaggeredReveal({
    totalItems: displayedTemplates.length,
    staggerMs: 140,
    threshold: 0.1,
  });

  const getBadgeStyle = (badge) => {
    switch (badge?.toLowerCase()) {
      case 'hot':
        return 'bg-rose-500 text-white shadow-rose-500/30';
      case 'new':
        return 'bg-emerald-500 text-white shadow-emerald-500/30';
      case 'popular':
        return 'bg-amber-500 text-white shadow-amber-500/30';
      default:
        return 'bg-indigo-500 text-white shadow-indigo-500/30';
    }
  };

  const scrollToStep = (idx) => {
    stepRefs[idx]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* 0. Splash Screen with 0-100% count & fallback */}
      {showSplash && (
        <SplashScreen
          durationMs={2000}
          holdDelayMs={200}
          fadeDurationMs={700}
          onComplete={() => {
            try {
              sessionStorage.setItem('splash_shown', 'true');
            } catch {}
            setShowSplash(false);
          }}
        />
      )}

      {/* ========================================================
          SECTION 1: HERO SECTION (MaskedCard Hero + Feature Bars)
      ======================================================== */}
      <section
        ref={heroMask.containerRef}
        className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden bg-gradient-to-b from-rose-50/40 via-white to-white"
      >
        {/* Decorative Ambient Lighting Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-rose-200/50 via-pink-100/40 to-amber-100/50 blur-[120px] -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
          {/* Top 3 Masked Feature Bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 max-w-4xl mx-auto">
            <div ref={heroMask.registerCardRef(0)}>
              <MaskedCard
                bgImage={HERO_IMAGE}
                position={heroMask.positions[0]}
                renderWidth={heroImage.renderWidth}
                focalX={heroImage.focalX}
                className="p-3 rounded-2xl border border-rose-200/60 shadow-sm bg-white/80 backdrop-blur-md flex items-center justify-center gap-2 text-rose-700 text-xs font-bold"
              >
                <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] -z-10" />
                <Sparkles className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                <span>Thế Hệ Thiệp Điện Tử Chuyển Động Mới</span>
              </MaskedCard>
            </div>

            <div ref={heroMask.registerCardRef(1)}>
              <MaskedCard
                bgImage={HERO_IMAGE}
                position={heroMask.positions[1]}
                renderWidth={heroImage.renderWidth}
                focalX={heroImage.focalX}
                className="p-3 rounded-2xl border border-gray-200/60 shadow-sm bg-white/80 backdrop-blur-md flex items-center justify-center gap-2 text-gray-800 text-xs font-bold"
              >
                <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] -z-10" />
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Trải Nghiệm Mượt Mà 60FPS</span>
              </MaskedCard>
            </div>

            <div ref={heroMask.registerCardRef(2)}>
              <MaskedCard
                bgImage={HERO_IMAGE}
                position={heroMask.positions[2]}
                renderWidth={heroImage.renderWidth}
                focalX={heroImage.focalX}
                className="p-3 rounded-2xl border border-gray-200/60 shadow-sm bg-white/80 backdrop-blur-md flex items-center justify-center gap-2 text-gray-800 text-xs font-bold"
              >
                <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] -z-10" />
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Cá Nhân Hóa Toàn Diện</span>
              </MaskedCard>
            </div>
          </div>

          {/* Main Hero Card sharing HERO_IMAGE with backdrop overlay */}
          <div ref={heroMask.registerCardRef(3)}>
            <MaskedCard
              bgImage={HERO_IMAGE}
              position={heroMask.positions[3]}
              renderWidth={heroImage.renderWidth}
              focalX={heroImage.focalX}
              className="relative p-8 md:p-12 rounded-3xl border border-white/40 shadow-2xl bg-white/90 backdrop-blur-md overflow-hidden max-w-5xl mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95 -z-10" />

              {/* Main Headline */}
              <h1 className="text-[clamp(2.3rem,5.5vw,4.5rem)] font-extrabold tracking-tight text-gray-950 max-w-4xl mx-auto leading-[1.15]">
                Tạo Landing Page{' '}
                <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                  Đám Cưới & Sinh Nhật
                </span>{' '}
                Trong 3 Phút
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-base sm:text-xl text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
                Thiết kế mãn nhãn phong cách MotionSites với hiệu ứng cánh hoa rơi, nhạc nền lãng mạn, đếm ngược và thu thập phản hồi RSVP thông minh.
              </p>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#showcase"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-xl shadow-rose-600/25 hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Khám Phá Kho Mẫu Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/90 backdrop-blur-md border border-gray-200 text-gray-800 font-bold text-sm shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current text-rose-600" />
                  <span>Xem Cách Hoạt Động</span>
                </a>
              </div>

              {/* Quick Stats Highlights */}
              <div className="mt-14 pt-8 border-t border-gray-200/60 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="text-center p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100/60">
                  <span className="block text-2xl sm:text-3xl font-black text-gray-900">100%</span>
                  <span className="text-xs text-gray-500 font-medium">Tùy Biến Trực Quan</span>
                </div>
                <div className="text-center p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100/60">
                  <span className="block text-2xl sm:text-3xl font-black text-gray-900">0đ</span>
                  <span className="text-xs text-gray-500 font-medium">Bắt Đầu Miễn Phí</span>
                </div>
                <div className="text-center p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100/60">
                  <span className="block text-2xl sm:text-3xl font-black text-gray-900">1 Click</span>
                  <span className="text-xs text-gray-500 font-medium">Xuất HTML</span>
                </div>
                <div className="text-center p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100/60">
                  <span className="block text-2xl sm:text-3xl font-black text-gray-900">RSVP</span>
                  <span className="text-xs text-gray-500 font-medium">Quản Lý Khách Mời</span>
                </div>
              </div>
            </MaskedCard>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2: MASKED CARDS / MOSAIC SHOWCASE (SECTION2_IMAGE)
      ======================================================== */}
      <section
        id="showcase"
        ref={mosaicMask.containerRef}
        className="py-24 bg-gray-50/60 border-y border-gray-100/80 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                <Layers className="w-3.5 h-3.5" />
                <span>Masked Cards Showcase</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Kho Mẫu Thiệp Động Nổi Bật
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-lg">
                Mỗi thiết kế là một tác phẩm được chăm chút tỉ mỉ với hiệu ứng parallax, hoa bay và chuyển động mượt mà.
              </p>
            </div>
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors self-start md:self-auto"
            >
              <span>Xem toàn bộ kho mẫu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm animate-pulse space-y-4"
                >
                  <div className="h-64 bg-gray-200/70 rounded-2xl" />
                  <div className="h-5 bg-gray-200/70 rounded-full w-2/3" />
                  <div className="h-4 bg-gray-200/70 rounded-full w-1/3" />
                </div>
              ))}
            </div>
          ) : templateLoadError ? (
            <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm" role="alert">
              <h3 className="text-lg font-bold text-gray-900">Chưa tải được kho mẫu</h3>
              <p className="mt-2 text-sm text-gray-600">Kết nối đang gặp sự cố. Hãy thử tải lại để xem các mẫu hiện có.</p>
              <button
                type="button"
                onClick={() => setTemplateRetryCount((count) => count + 1)}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-rose-700"
              >
                Thử tải lại
              </button>
            </div>
          ) : displayedTemplates.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm" role="status">
              <h3 className="text-lg font-bold text-gray-900">Chưa có mẫu để hiển thị</h3>
              <p className="mt-2 text-sm text-gray-600">Kho mẫu hiện chưa có nội dung. Bạn có thể quay lại xem sau.</p>
              <Link to="/templates" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-50 px-5 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100">
                Xem kho mẫu <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {displayedTemplates.map((template, idx) => {
                const isVisible = isItemVisible(idx);
                const previewImg = template.thumbnailUrl || template.longPreviewUrl;

                return (
                  <div
                    key={template.id || idx}
                    ref={mosaicMask.registerCardRef(idx)}
                    className={`group relative rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:border-rose-200/80 transition-all duration-700 ease-out transform flex flex-col justify-between ${
                      isVisible
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-8 scale-95'
                    }`}
                  >
                    <MaskedCard
                      bgImage={SECTION2_IMAGE}
                      position={mosaicMask.positions[idx]}
                      renderWidth={mosaicImage.renderWidth}
                      focalX={mosaicImage.focalX}
                      className="w-full h-full flex flex-col justify-between bg-white"
                    >
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] -z-10" />

                      {/* Top Masked Card Preview Banner */}
                      <div className="relative h-72 sm:h-80 overflow-hidden bg-gray-100 m-3 rounded-[24px]">
                        {previewImg ? (
                          <img
                            src={previewImg}
                            alt={template.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-rose-100 via-white to-amber-100" aria-hidden="true" />
                        )}
                        {/* Gradient Mask Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-white/90 backdrop-blur-md text-gray-800 shadow-md">
                            {template.category || 'Wedding'}
                          </span>
                          {template.badge && (
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg ${getBadgeStyle(
                                template.badge
                              )}`}
                            >
                              {template.badge}
                            </span>
                          )}
                        </div>

                        {/* Music title chip if available */}
                        {template.musicTitle && (
                          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                            <Music className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                            <span className="max-w-[180px] truncate">{template.musicTitle}</span>
                          </div>
                        )}

                        {/* Quick Preview Hover Trigger */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                          <button
                            type="button"
                            onClick={() => setPreviewTemplate(template)}
                            className="px-5 py-2.5 rounded-full bg-white text-gray-900 font-bold text-xs shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                          >
                            <Eye className="w-4 h-4 text-rose-600" />
                            <span>Xem Thử Nhanh</span>
                          </button>
                        </div>
                      </div>

                      {/* Card Content & Interactive Actions */}
                      <div className="p-6 pt-3 flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                            {template.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            Mẫu giao diện tinh tế dành cho ngày vui của bạn với đầy đủ tính năng album ảnh, đếm ngược và RSVP.
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setPreviewTemplate(template)}
                            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-500" />
                            <span>Xem Chi Tiết</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate(`/customize/${template.id}`)}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/20 hover:bg-rose-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Tùy Biến Ngay</span>
                          </button>
                        </div>
                      </div>
                    </MaskedCard>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          SECTION 3: SCROLL-DRIVEN FEATURE SHOWCASE (STICKY LEFT COL)
      ======================================================== */}
      <section id="how-it-works" className="py-24 bg-gray-950 text-white relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-rose-600/10 blur-[140px] pointer-events-none -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: STICKY on Desktop, follows scrolling cards */}
            <div className="lg:col-span-5 lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col lg:justify-center py-8 z-20">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-3 block">
                Quy Trình Siêu Tốc
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                3 Bước Sở Hữu Trang Thiệp Mơ Ước
              </h2>
              <p className="text-sm sm:text-base text-gray-400 font-light mt-4 mb-8 leading-relaxed">
                Tối ưu cho cả máy tính và điện thoại, không cần biết lập trình hay kỹ năng thiết kế.
              </p>

              {/* Navigation Indicators bám theo card cuộn */}
              <div className="space-y-3">
                {[
                  { title: 'Khám Phá Mẫu Đẹp', desc: 'Khám phá kho thiệp cưới, sinh nhật' },
                  { title: 'Tạo bản nháp', desc: 'Tự lưu trên thiết bị, rồi đăng nhập để lưu lên tài khoản' },
                  { title: 'Tạo phiên bản & xuất bản', desc: 'Chọn phiên bản muốn công khai và chia sẻ liên kết' },
                ].map((step, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToStep(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                      activeStep === idx
                        ? 'bg-rose-500/10 border-rose-500/50 shadow-lg shadow-rose-500/10 translate-x-1'
                        : 'bg-gray-900/40 border-gray-800/80 hover:border-gray-700 text-gray-400'
                    }`}
                  >
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-wider block ${
                        activeStep === idx ? 'text-rose-400' : 'text-gray-500'
                      }`}>
                        Bước 0{idx + 1}
                      </span>
                      <span className={`text-sm font-bold block ${
                        activeStep === idx ? 'text-white' : 'text-gray-300'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      activeStep === idx ? 'text-rose-400 translate-x-0.5' : 'text-gray-600'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Scrollable feature cards with slide-in animation */}
            <div className="lg:col-span-7 space-y-16 lg:py-16">
              {/* Step 1 Card */}
              <div
                ref={stepRefs[0]}
                className={`group bg-gradient-to-b from-gray-900/95 to-gray-900/60 border border-gray-800/80 hover:border-rose-500/50 p-8 sm:p-10 rounded-3xl relative transition-all duration-700 ease-out transform ${
                  stepVisible[0] ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'
                }`}
              >
                <span className="text-7xl font-black text-rose-500/15 absolute top-6 right-6 group-hover:text-rose-500/30 transition-colors">
                  01
                </span>
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-6">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Chọn Mẫu Thiết Kế</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-lg mb-6">
                  Lựa chọn từ kho mẫu Đám cưới hoặc Sinh nhật được tạo hình sẵn theo phong cách hiện đại, tối giản hoặc hoàng gia.
                </p>
                <div className="pt-6 border-t border-gray-800/60 text-xs text-rose-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Hơn 20+ mẫu giao diện động được chuẩn bị sẵn</span>
                </div>
              </div>

              {/* Step 2 Card */}
              <div
                ref={stepRefs[1]}
                className={`group bg-gradient-to-b from-gray-900/95 to-gray-900/60 border border-gray-800/80 hover:border-amber-500/50 p-8 sm:p-10 rounded-3xl relative transition-all duration-700 ease-out transform ${
                  stepVisible[1] ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'
                }`}
              >
                <span className="text-7xl font-black text-amber-500/15 absolute top-6 right-6 group-hover:text-amber-500/30 transition-colors">
                  02
                </span>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Tạo và lưu bản nháp</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-lg mb-6">
                  Bắt đầu thiết kế và bản nháp tự lưu trên trình duyệt. Khi muốn lưu bản làm việc lên tài khoản, hãy đăng nhập; nội dung chưa tự động công khai.
                </p>
                <div className="pt-6 border-t border-gray-800/60 text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Tiếp tục chỉnh sửa đúng bản nháp trên mobile & desktop</span>
                </div>
              </div>

              {/* Step 3 Card */}
              <div
                ref={stepRefs[2]}
                className={`group bg-gradient-to-b from-gray-900/95 to-gray-900/60 border border-gray-800/80 hover:border-emerald-500/50 p-8 sm:p-10 rounded-3xl relative transition-all duration-700 ease-out transform ${
                  stepVisible[2] ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'
                }`}
              >
                <span className="text-7xl font-black text-emerald-500/15 absolute top-6 right-6 group-hover:text-emerald-500/30 transition-colors">
                  03
                </span>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <Download className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Tạo phiên bản và xuất bản</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-lg mb-6">
                  Đăng nhập để lưu lên server, chủ động tạo phiên bản rồi chọn phiên bản làm bản công khai. Sau đó chia sẻ liên kết để nhận RSVP.
                </p>
                <div className="pt-6 border-t border-gray-800/60 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Xuất HTML để tải xuống; ảnh và font có thể cần kết nối mạng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High-Impact CTA Bottom Banner */}
      <section className="py-24 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-rose-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Khởi Đầu Cho Ngày Trọng Đại</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Sẵn Sàng Tạo Ấn Tượng Khó Quên Cho Ngày Vui Của Bạn?
          </h2>

          <p className="text-sm sm:text-base text-rose-100 max-w-xl mx-auto font-light leading-relaxed">
            Không cần thẻ tín dụng, không quảng cáo làm phiền. Bắt đầu tùy biến mẫu thiệp yêu thích của bạn hoàn toàn miễn phí.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl bg-white text-rose-600 font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              <span>Bắt Đầu Tùy Biến Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Preview Modal */}
      <QuickPreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </div>
  );
}
