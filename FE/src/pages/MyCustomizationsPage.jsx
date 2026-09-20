import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, ExternalLink, Edit3, Trash2, Download, Copy, Check, Plus, Calendar 
} from 'lucide-react';
import { customizationApi } from '../api/customizationApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { exportStandaloneHtml } from '../utils/htmlExporter';

export default function MyCustomizationsPage() {
  const navigate = useNavigate();
  const [customizations, setCustomizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const fetchMySites = async () => {
    setLoading(true);
    try {
      const data = await customizationApi.getMyCustomizations();
      setCustomizations(data);
    } catch (err) {
      console.error('Failed to load customizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySites();
  }, []);

  const handleCopyLink = (item) => {
    const fullUrl = `${window.location.origin}/view/${item.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = (item) => {
    try {
      const parsed = typeof item.configJson === 'string'
        ? JSON.parse(item.configJson)
        : item.configJson;
      exportStandaloneHtml(parsed, item.title);
    } catch (err) {
      alert('Không thể xuất file: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thiệp mời này?')) return;
    try {
      await customizationApi.deleteCustomization(id);
      setCustomizations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-600" />
              <span>Thiệp Mời Của Tôi</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Quản lý các trang thiệp bạn đã thiết kế và theo dõi phản hồi khách mời.
            </p>
          </div>

          <Link
            to="/templates"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Thiệp Mới</span>
          </Link>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" message="Đang nạp danh sách thiệp của bạn..." />
          </div>
        ) : customizations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">Bạn chưa tạo thiệp nào</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              Hãy khám phá kho mẫu thiệp lãng mạn và thiết kế trang thiệp đầu tiên cho sự kiện của bạn!
            </p>
            <Link
              to="/templates"
              className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
            >
              Chọn Mẫu Ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customizations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                      {item.templateName || 'Thiệp Mời'}
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAtUtc).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 line-clamp-1 mb-1">
                    {item.title}
                  </h3>
                  <div className="text-xs text-gray-400 font-mono flex items-center gap-1 mb-4 truncate">
                    <span>/view/{item.slug}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyLink(item)}
                      className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      title="Sao chép link chia sẻ"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleExport(item)}
                      className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      title="Xuất HTML Offline"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Xóa thiệp"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigate(`/customize/${item.templateId}/${item.id}`)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Sửa</span>
                    </button>

                    <a
                      href={`/view/${item.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-rose-600 transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Xem</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
