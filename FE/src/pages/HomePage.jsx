import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, Heart, Cake, Music, Smartphone, Download, 
  CheckCircle, Play, Eye, Edit3, Shield, Zap 
} from 'lucide-react';
import { templateApi } from '../api/templateApi';
import TemplateCard from '../components/templates/TemplateCard';
import QuickPreviewModal from '../components/templates/QuickPreviewModal';

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await templateApi.getTemplates({ isActiveOnly: true });
        setFeaturedTemplates(data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load featured templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden bg-gradient-to-b from-rose-50/40 via-white to-white">
        {/* Decorative background blur glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-rose-200/50 to-amber-100/50 blur-[100px] -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Floating Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-rose-200/60 shadow-md shadow-rose-500/5 text-rose-600 text-xs font-bold uppercase tracking-wider mb-8 animate-float-slow">
            <Sparkles className="w-3.5 h-3.5 fill-rose-600" />
            <span>Thế Hệ Thiệp Điện Tử Chuyển Động Mới</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-950 max-w-4xl mx-auto leading-[1.15]">
            Tạo Landing Page <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">Đám Cưới & Sinh Nhật</span> Trong 3 Phút
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Thiết kế mãn nhãn phong cách MotionSites với hiệu ứng cánh hoa, nhạc nền lãng mạn, đếm ngược và thu thập phản hồi RSVP thông minh.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/templates"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-xl shadow-rose-600/25 hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Khám Phá Kho Mẫu Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-gray-200 text-gray-800 font-bold text-sm shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current text-rose-600" />
              <span>Xem Cách Hoạt Động</span>
            </a>
          </div>

          {/* Quick Stats / Highlights */}
          <div className="mt-16 pt-8 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-black text-gray-900">100%</span>
              <span className="text-xs text-gray-500 font-medium">Tùy Biến Trực Quan</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-black text-gray-900">0đ</span>
              <span className="text-xs text-gray-500 font-medium">Bắt Đầu Miễn Phí</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-black text-gray-900">1 Click</span>
              <span className="text-xs text-gray-500 font-medium">Xuất Offline HTML</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-black text-gray-900">RSVP</span>
              <span className="text-xs text-gray-500 font-medium">Quản Lý Khách Mời</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 bg-gray-50/70 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Tính Năng Vượt Trội</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Trải Nghiệm Đẳng Cấp Như Trang Web Cao Cấp
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Không đơn thuần là một tấm thiệp tĩnh, đây là một trang web tương tác ghi lại trọn vẹn kỷ niệm ngày trọng đại.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chuyển Động & Nhạc Nền</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Hiệu ứng cánh hoa rơi, confetti bay lượn và giai điệu tình ca du dương tự động phát mang đến cảm xúc khó quên cho khách mời.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Live Customizer Thời Gian Thực</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Đổi màu sắc, tải ảnh đại diện, chỉnh mốc thời gian, thêm ảnh album. Mỗi thay đổi đều hiển thị ngay lập tức không cần tải lại trang.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xuất Standalone Single HTML</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Tải về duy nhất một file HTML độc lập chứa toàn bộ code và dữ liệu. Double click mở offline hoặc upload lên bất kỳ host miễn phí nào.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Templates Showcase */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Bộ Sưu Tập Tiêu Biểu</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1">
                Các Mẫu Thiệp Được Yêu Thích Nhất
              </h2>
            </div>
            <Link
              to="/templates"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 self-start md:self-auto"
            >
              <span>Xem tất cả kho mẫu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
              <div className="bg-gray-100 rounded-3xl h-80" />
              <div className="bg-gray-100 rounded-3xl h-80" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onQuickPreview={(t) => setPreviewTemplate(t)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works 3 steps */}
      <section id="how-it-works" className="py-24 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Quy Trình Siêu Tốc</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold">3 Bước Sở Hữu Trang Thiệp Mơ Ước</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-gray-900/80 border border-gray-800 p-8 rounded-3xl relative">
              <span className="text-5xl font-black text-rose-500/20 absolute top-6 right-6">01</span>
              <h3 className="text-xl font-bold mb-3">Chọn Mẫu Thiết Kế</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Lựa chọn từ kho mẫu Đám cưới hoặc Sinh nhật được tạo hình sẵn bởi các nhà thiết kế hàng đầu.
              </p>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 p-8 rounded-3xl relative">
              <span className="text-5xl font-black text-rose-500/20 absolute top-6 right-6">02</span>
              <h3 className="text-xl font-bold mb-3">Tùy Biến Thông Tin</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Nhập tên, ngày giờ, ảnh cưới/sinh nhật, link bản đồ và lời dặn dò khách mời qua thanh công cụ trực quan.
              </p>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 p-8 rounded-3xl relative">
              <span className="text-5xl font-black text-rose-500/20 absolute top-6 right-6">03</span>
              <h3 className="text-xl font-bold mb-3">Chia Sẻ & Thu RSVP</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Gửi link cho bạn bè qua Zalo, Messenger hoặc tải file HTML offline để chia sẻ mọi lúc mọi nơi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-20 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white text-center px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Sẵn Sàng Tạo Ấn Tượng Cho Ngày Vui Của Bạn?
          </h2>
          <p className="text-sm sm:text-base text-rose-100 max-w-xl mx-auto font-light">
            Không cần biết lập trình. Bắt đầu tùy biến mẫu thiệp yêu thích của bạn ngay hôm nay hoàn toàn miễn phí.
          </p>
          <div className="pt-4">
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-rose-600 font-extrabold text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all"
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
