import React, { useState, useEffect } from 'react';
import { Layers, Users, Heart, MessageSquare, ArrowUpRight, TrendingUp } from 'lucide-react';
import { templateApi } from '../../api/templateApi';
import { userApi } from '../../api/userApi';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    templatesCount: 0,
    usersCount: 0,
    rsvpsCount: 12,
    guestbookCount: 8,
  });
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [templates, users] = await Promise.all([
          templateApi.getTemplates(),
          userApi.getUsers(),
        ]);
        setStats({
          templatesCount: templates.length,
          usersCount: users.length,
          rsvpsCount: 42,
          guestbookCount: 19,
        });
        setRecentTemplates(templates.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" message="Đang nạp số liệu thống kê..." />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng Master Templates',
      value: stats.templatesCount,
      icon: Layers,
      color: 'from-rose-500 to-pink-600',
      change: '+2 tháng này',
    },
    {
      title: 'Tổng Người Dùng',
      value: stats.usersCount,
      icon: Users,
      color: 'from-indigo-500 to-purple-600',
      change: '+14% so với tháng trước',
    },
    {
      title: 'Khách Phản Hồi RSVP',
      value: stats.rsvpsCount,
      icon: Heart,
      color: 'from-amber-500 to-orange-600',
      change: '88% tham dự',
    },
    {
      title: 'Lời Chúc Sổ Lưu Bút',
      value: stats.guestbookCount,
      icon: MessageSquare,
      color: 'from-emerald-500 to-teal-600',
      change: 'Tương tác tích cực',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Bảng Điều Khiển Quản Trị</h1>
        <p className="text-xs text-gray-500 mt-1">
          Tổng quan tình trạng hệ thống, người dùng và các mẫu thiệp điện tử đang hoạt động.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500">{card.title}</span>
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900">{card.value}</div>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{card.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Templates Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-gray-900">Danh Sách Mẫu Master Hiện Có</h2>
          <a
            href="/admin/templates"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <span>Xem tất cả</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 uppercase font-bold text-gray-400 tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Tên Mẫu</th>
                <th className="py-3 px-4">Danh Mục</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 rounded-r-xl">Ngày Tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTemplates.map((tmpl) => (
                <tr key={tmpl.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-3">
                    <img
                      src={tmpl.thumbnailUrl}
                      alt={tmpl.name}
                      className="w-10 h-10 object-cover rounded-xl shadow-sm"
                    />
                    <span>{tmpl.name}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600">
                      {tmpl.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500">{tmpl.slug}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${tmpl.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <span>{tmpl.isActive ? 'Hoạt động' : 'Tạm ẩn'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">
                    {new Date(tmpl.createdAtUtc).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
