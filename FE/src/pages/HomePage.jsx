import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Zap, ArrowRight, Layers, Database } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <Layers className="w-6 h-6 text-indigo-600" />,
      title: 'Kiến trúc Clean Architecture',
      description: 'Phân tách rành mạch các tầng Domain, Contract, Application, Persistence, Infrastructure, Presentation theo CQRS + MediatR.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      title: 'Xử lý lỗi chuẩn mực',
      description: 'Result pattern với Validation Pipeline Behavior, không quăng unhandled exception cho lỗi nghiệp vụ.'
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: 'Tối ưu hiệu năng',
      description: 'Frontend React 19 + Vite siêu tốc kết hợp Tailwind CSS và Minimal APIs ở backend.'
    },
    {
      icon: <Database className="w-6 h-6 text-blue-600" />,
      title: 'Quản lý Dữ liệu Mạnh mẽ',
      description: 'EF Core 9 + SQL Server hỗ trợ Auditing tự động qua Interceptors và Global Query Filter Soft Delete.'
    }
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-16 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md text-indigo-200 border border-white/10">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>.NET 10 + React 19 Full-Stack Template</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Nền tảng Landing Page Hiện Đại & Chuẩn Mực
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100/90 leading-relaxed">
            Hệ thống mẫu hoàn chỉnh áp dụng Clean Architecture, CQRS, MediatR, FluentValidation, Minimal APIs và giao diện React thân thiện.
          </p>
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white text-indigo-900 font-bold hover:bg-indigo-50 shadow-lg hover:shadow-white/20 transition transform active:scale-95"
            >
              <span>Khám phá Sản phẩm</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Subtle Decorative Elements */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Tính năng & Điểm nổi bật</h2>
          <p className="text-gray-500">Mọi thành phần đều tuân thủ các quy chuẩn kỹ thuật nghiêm ngặt nhất.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
