import React, { useEffect, useState } from 'react';
import { Layers, Users, Heart, MessageSquare, ArrowUpRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { templateApi } from '../../api/templateApi';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const [overview, templates] = await Promise.all([
          adminApi.getOverview(),
          templateApi.getTemplates({ page: 1, pageSize: 5 }),
        ]);
        if (!active) return;
        setStats(overview);
        setRecentTemplates(Array.isArray(templates) ? templates.slice(0, 5) : (templates?.data || []).slice(0, 5));
      } catch (loadError) {
        if (active) setError(loadError.message || 'Không thể tải số liệu quản trị.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchDashboardData();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" message="Đang tải số liệu thống kê..." /></div>;

  if (error) {
    return <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">{error}</div>;
  }

  const statCards = [
    { title: 'Master templates', value: stats?.templatesCount ?? 0, icon: Layers, color: 'from-rose-500 to-pink-600' },
    { title: 'Người dùng', value: stats?.usersCount ?? 0, icon: Users, color: 'from-indigo-500 to-purple-600' },
    { title: 'Phản hồi RSVP', value: stats?.rsvpsCount ?? 0, icon: Heart, color: 'from-amber-500 to-orange-600' },
    { title: 'Lời chúc', value: stats?.guestbookCount ?? 0, icon: MessageSquare, color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Bảng điều khiển quản trị</h1>
          <p className="text-xs text-gray-500 mt-1">Số liệu được tổng hợp từ dữ liệu hiện có.</p>
        </div>
        <Link to="/admin/sites" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50">
          <FileText className="w-4 h-4" /> Quản lý trang vô chủ
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-gray-500">{card.title}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center`}><Icon className="w-5 h-5" /></div>
              </div>
              <div className="mt-4 text-3xl font-black text-gray-900">{card.value}</div>
            </article>
          );
        })}
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h2 className="text-base font-bold text-gray-900">Master templates gần đây</h2>
          <Link to="/admin/templates" className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1">
            Xem tất cả <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        {recentTemplates.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có master template.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase font-bold text-gray-400 tracking-wider"><tr>
                <th className="py-3 px-4 rounded-l-xl">Tên mẫu</th><th className="py-3 px-4">Danh mục</th><th className="py-3 px-4">Slug</th><th className="py-3 px-4">Trạng thái</th><th className="py-3 px-4 rounded-r-xl">Ngày tạo</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {recentTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-bold text-gray-900">{template.name}</td>
                    <td className="py-3 px-4">{template.category}</td>
                    <td className="py-3 px-4 font-mono">{template.slug}</td>
                    <td className="py-3 px-4">{template.isActive ? 'Hoạt động' : 'Tạm ẩn'}</td>
                    <td className="py-3 px-4">{template.createdAtUtc ? new Date(template.createdAtUtc).toLocaleDateString('vi-VN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
