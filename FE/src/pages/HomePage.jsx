import React, { useState, useEffect } from 'react';
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
import { useStaggeredReveal } from '../hooks/useStaggeredReveal';

const FALLBACK_TEMPLATES = [
  {
    id: 'wedding-classic',
    name: 'Hôn Lễ Hoàng Gia (Royal Wedding)',
    slug: 'royal-wedding',
    category: 'Wedding',
    badge: 'HOT',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    longPreviewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80',
    musicTitle: 'A Thousand Years',
  },
  {
    id: 'birthday-sweet',
    name: 'Sinh Nhật Ngọt Ngào (Sweet Birthday)',
    slug: 'sweet-birthday',
    category: 'Birthday',
    badge: 'NEW',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80',
    longPreviewUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1600&q=80',
    musicTitle: 'Happy Birthday Acoustic',
  },
  {
    id: 'wedding-modern',
    name: 'Đám Cưới Tối Giản (Modern Minimalist)',
    slug: 'modern-minimalist',
    category: 'Wedding',
    badge: 'POPULAR',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    longPreviewUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600&q=80',
    musicTitle: 'Until I Found You',
  },
  {
    id: 'anniversary-gold',
    name: 'Kỷ Niệm Ngày Cưới Vàng (Golden Anniversary)',
    slug: 'golden-anniversary',
    category: 'Anniversary',
    badge: 'PREMIUM',
    thumbnailUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
    longPreviewUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1600&q=80',
    musicTitle: "Can't Help Falling in Love",
  },
];

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
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTemplates = async () => {
      try {
        const data = await templateApi.getTemplates({ isActiveOnly: true });
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setTemplates(data.slice(0, 4));
          } else {
            setTemplates(FALLBACK_TEMPLATES);
          }
        }
      } catch (err) {
        if (isMounted) {
          setTemplates(FALLBACK_TEMPLATES);
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
  }, []);

  const displayedTemplates = templates.length > 0 ? templates : FALLBACK_TEMPLATES;

  // Staggered reveal hook for Masked Cards / Mosaic Showcase
  const { containerRef, isItemVisible } = useStaggeredReveal({
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

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* 0. Splash Screen with 0-100% count & fallback */}
      {showSplash && (
        <SplashScreen
          durationMs={1200}
          onComplete={() => {
            try {
              sessionStorage.setItem('splash_shown', 'true');
            } catch {}
            setShowSplash(false);
          }}
        />
      )}

      {/* ========================================================
          SECTION 1: HERO SECTION (Fullscreen, Clamp Typography)
      ======================================================== */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden bg-gradient-to-b from-rose-50/40 via-white to-white">
        {/* Decorative Ambient Lighting Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-rose-200/50 via-pink-100/40 to-amber-100/50 blur-[120px] -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Floating Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-rose-200/60 shadow-lg shadow-rose-500/5 text-rose-600 text-xs font-bold uppercase tracking-wider mb-8 animate-float-slow">
            <Sparkles className="w-3.5 h-3.5 fill-rose-600" />
            <span>Thế Hệ Thiệp Điện Tử Chuyển Động Mới</span>
          </div>

          {/* Main Clamp Title */}
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
          <div className="mt-16 pt-8 border-t border-gray-100/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-gray-100/60">
              <span className="block text-2xl sm:text-3xl font-black text-gray-900">100%</span>
              <span className="text-xs text-gray-500 font-medium">Tùy Biến Trực Quan</span>
            </div>
            <div className="text-center p-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-gray-100/60">
              <span className="block text-2xl sm:text-3xl font-black text-gray-900">0đ</span>
              <span className="text-xs text-gray-500 font-medium">Bắt Đầu Miễn Phí</span>
            </div>
            <div className="text-center p-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-gray-100/60">
              <span className="block text-2xl sm:text-3xl font-black text-gray-900">1 Click</span>
              <span className="text-xs text-gray-500 font-medium">Xuất Offline HTML</span>
            </div>
            <div className="text-center p-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-gray-100/60">
              <span className="block text-2xl sm:text-3xl font-black text-gray-900">RSVP</span>
              <span className="text-xs text-gray-500 font-medium">Quản Lý Khách Mời</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2: MASKED CARDS / MOSAIC SHOWCASE
      ======================================================== */}
      <section id="showcase" className="py-24 bg-gray-50/60 border-y border-gray-100/80 relative">
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
          ) : (
            <div
              ref={containerRef}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {displayedTemplates.map((template, idx) => {
                const isVisible = isItemVisible(idx);
                const previewImg =
                  template.thumbnailUrl ||
                  template.longPreviewUrl ||
                  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80';

                return (
                  <div
                    key={template.id || idx}
                    className={`group relative bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:border-rose-200/80 transition-all duration-700 ease-out transform flex flex-col justify-between ${
                      isVisible
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-8 scale-95'
                    }`}
                  >
                    {/* Top Masked Card Preview Banner */}
                    <div className="relative h-72 sm:h-80 overflow-hidden bg-gray-100 m-3 rounded-[24px]">
                      <img
                        src={previewImg}
                        alt={template.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          SECTION 3: BENTO EXPERIENCE WORKFLOW & HIGH-IMPACT CTA
      ======================================================== */}
      <section id="how-it-works" className="py-24 bg-gray-950 text-white relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-rose-600/10 blur-[140px] pointer-events-none -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
              Quy Trình Siêu Tốc
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              3 Bước Sở Hữu Trang Thiệp Mơ Ước
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-light">
              Tối ưu cho cả máy tính và điện thoại, không cần biết lập trình hay kỹ năng thiết kế.
            </p>
          </div>

          {/* Bento Grid 3 Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="group bg-gradient-to-b from-gray-900/90 to-gray-900/50 border border-gray-800/80 hover:border-rose-500/50 p-8 rounded-3xl relative transition-all duration-300 hover:shadow-2xl hover:shadow-rose-500/10 flex flex-col justify-between">
              <span className="text-6xl font-black text-rose-500/15 absolute top-6 right-6 group-hover:text-rose-500/30 transition-colors">
                01
              </span>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-6">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Chọn Mẫu Thiết Kế</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Lựa chọn từ kho mẫu Đám cưới hoặc Sinh nhật được tạo hình sẵn theo phong cách hiện đại, tối giản hoặc hoàng gia.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-gray-800/60 text-xs text-rose-400 font-semibold flex items-center gap-1">
                <span>Khám phá kho mẫu</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="group bg-gradient-to-b from-gray-900/90 to-gray-900/50 border border-gray-800/80 hover:border-amber-500/50 p-8 rounded-3xl relative transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between">
              <span className="text-6xl font-black text-amber-500/15 absolute top-6 right-6 group-hover:text-amber-500/30 transition-colors">
                02
              </span>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Tùy Biến Trực Quan</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Nhập tên, ngày giờ, tải ảnh cưới/sinh nhật, link Google Maps và danh mục quà mừng VietQR thông qua Live Customizer 60fps.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-gray-800/60 text-xs text-amber-400 font-semibold flex items-center gap-1">
                <span>Chỉnh sửa thời gian thực</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="group bg-gradient-to-b from-gray-900/90 to-gray-900/50 border border-gray-800/80 hover:border-emerald-500/50 p-8 rounded-3xl relative transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between">
              <span className="text-6xl font-black text-emerald-500/15 absolute top-6 right-6 group-hover:text-emerald-500/30 transition-colors">
                03
              </span>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Chia Sẻ & Thu RSVP</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Gửi link online cho bạn bè qua Zalo, Facebook hoặc xuất Single Offline HTML độc lập mang theo mở trên bất cứ thiết bị nào.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-gray-800/60 text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span>Xuất bản ngay</span>
                <ChevronRight className="w-3.5 h-3.5" />
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
