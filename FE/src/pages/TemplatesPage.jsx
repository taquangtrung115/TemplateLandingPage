import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, Heart, Cake, Filter } from 'lucide-react';
import { templateApi } from '../api/templateApi';
import TemplateCard from '../components/templates/TemplateCard';
import QuickPreviewModal from '../components/templates/QuickPreviewModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TemplatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const data = await templateApi.getTemplates({ isActiveOnly: true });
        setTemplates(data);
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', tab);
    }
    setSearchParams(searchParams);
  };

  const filteredTemplates = templates.filter((template) => {
    const matchCategory =
      activeTab === 'all' || template.category?.toLowerCase() === activeTab.toLowerCase();
    const matchSearch =
      !searchQuery.trim() ||
      template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
            Kho Giao Diện Độc Quyền
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-950">
            Chọn Mẫu & Bắt Đầu Sáng Tạo
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Mỗi thiết kế đều được chăm chút tỉ mỉ từ hiệu ứng chuyển động đến từng khối thông tin tương tác.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-sm mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tất Cả Mẫu
            </button>
            <button
              onClick={() => handleTabChange('Wedding')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab.toLowerCase() === 'wedding'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Thiệp Cưới</span>
            </button>
            <button
              onClick={() => handleTabChange('Birthday')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab.toLowerCase() === 'birthday'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Cake className="w-3.5 h-3.5" />
              <span>Thiệp Sinh Nhật</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm mẫu thiệp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-gray-50"
            />
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="py-24 flex justify-center">
            <LoadingSpinner size="lg" message="Đang tải danh sách mẫu..." />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">Không tìm thấy mẫu phù hợp</h3>
            <p className="text-xs text-gray-500 mt-1">
              Vui lòng thử tìm kiếm với từ khóa khác hoặc đổi danh mục.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onQuickPreview={(t) => setPreviewTemplate(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Preview Modal */}
      <QuickPreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </div>
  );
}
