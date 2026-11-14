import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-900 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Motion<span className="text-rose-500">Sites</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Nền tảng tạo thiệp cưới và thiệp sinh nhật điện tử thông minh, chuyển động mượt mà theo phong cách hiện đại. Tùy biến nhanh chóng, chia sẻ tức thì.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-gray-900 border border-gray-800 text-gray-300">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nháp trên thiết bị · Xuất bản khi sẵn sàng</span>
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Danh Mục</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/templates?category=wedding" className="hover:text-white transition-colors">
                  Thiệp Cưới Sang Trọng
                </Link>
              </li>
              <li>
                <Link to="/templates?category=birthday" className="hover:text-white transition-colors">
                  Thiệp Sinh Nhật Rực Rỡ
                </Link>
              </li>
              <li>
                <Link to="/templates" className="hover:text-white transition-colors">
                  Tất Cả Mẫu Landing Page
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Thiết kế & chia sẻ</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><Link to="/drafts" className="hover:text-white">Tiếp tục bản nháp</Link></li>
              <li><Link to="/my-sites" className="hover:text-white">Quản lý trang và phiên bản</Link></li>
              <li>Lưu và xuất bản với tài khoản của bạn</li>
              <li>Ảnh và font trong HTML xuất có thể cần mạng</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} MotionSites. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for your most precious moments</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
