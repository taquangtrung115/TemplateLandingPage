import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Filter,
  ChevronRight,
  Layers,
  Volume2,
  VolumeX,
  Globe,
} from 'lucide-react';
import { templateApi } from '../api/templateApi';
import categoryApi from '../api/categoryApi';
import TemplateCard from '../components/templates/TemplateCard';
import QuickPreviewModal from '../components/templates/QuickPreviewModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { resolveIcon } from '../utils/iconResolver';

export default function TemplatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  const currentBadge = searchParams.get('badge') || 'all';
  const currentTab = searchParams.get('tab') || 'all'; // 'all' | 'official' | 'community'

  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Centralized Audio Player state
  const [playingTemplateId, setPlayingTemplateId] = useState(null);
  const audioPlayerRef = useRef(null);

  // Initialize and clean up centralized audio
  useEffect(() => {
    audioPlayerRef.current = new Audio();
    const player = audioPlayerRef.current;

    const handleAudioEnded = () => {
      setPlayingTemplateId(null);
    };

    player.addEventListener('ended', handleAudioEnded);

    return () => {
      player.removeEventListener('ended', handleAudioEnded);
      player.pause();
      player.src = '';
    };
  }, []);

  // Fetch initial data: templates & categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [templatesData, categoriesData] = await Promise.all([
          templateApi.getTemplates({ isActiveOnly: true }),
          categoryApi.getCategories({ isActiveOnly: true }),
        ]);
        setTemplates(Array.isArray(templatesData) ? templatesData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Failed to load templates or categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Centralized Audio toggle function
  const handleToggleAudio = (template) => {
    if (!template.audioUrl || !audioPlayerRef.current) return;

    if (playingTemplateId === template.id) {
      audioPlayerRef.current.pause();
      setPlayingTemplateId(null);
    } else {
      audioPlayerRef.current.src = template.audioUrl;
      audioPlayerRef.current
        .play()
        .then(() => {
          setPlayingTemplateId(template.id);
        })
        .catch((err) => {
          console.warn('Audio play prevented:', err);
          setPlayingTemplateId(null);
        });
    }
  };

  const handleCategoryChange = (slug) => {
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  const handleBadgeChange = (badge) => {
    if (badge === 'all') {
      searchParams.delete('badge');
    } else {
      searchParams.set('badge', badge);
    }
    setSearchParams(searchParams);
  };

  const handleTabChange = (tab) => {
    if (tab === 'all') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', tab);
    }
    setSearchParams(searchParams);
  };

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    // Source Tab match: all | official | community
    const matchTab =
      currentTab === 'all' ||
      (currentTab === 'official' && !template.isCommunity) ||
      (currentTab === 'community' && Boolean(template.isCommunity));

    // Category match: match either category slug, category name, or categoryId
    const matchCategory =
      currentCategory === 'all' ||
      template.category?.toLowerCase() === currentCategory.toLowerCase() ||
      categories.find((c) => c.slug === currentCategory)?.id === template.categoryId;

    // Badge match
    const matchBadge =
      currentBadge === 'all' ||
      (template.badge && template.badge.toLowerCase() === currentBadge.toLowerCase());

    // Search match
    const matchSearch =
      !searchQuery.trim() ||
      template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.authorName && template.authorName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchTab && matchCategory && matchBadge && matchSearch;
  });

  const badgeFilters = [
    { key: 'all', label: 'Tất Cả Gói' },
    { key: 'free', label: 'Miễn Phí (Free)', color: 'gray' },
    { key: 'basic', label: 'Tiêu Chuẩn (Basic)', color: 'blue' },
    { key: 'premium', label: 'Cao Cấp (Premium)', color: 'purple' },
    { key: 'hot', label: 'Nổi Bật (Hot)', color: 'amber' },
    { key: 'new', label: 'Mới Nhất (New)', color: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Breadcrumb & Hero Header */}
      <div className="bg-gradient-to-b from-white via-rose-50/30 to-slate-50/60 border-b border-gray-100 pt-8 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-6">
            <Link to="/" className="hover:text-gray-700 transition-colors">
              Trang Chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-rose-600 font-bold">Kho Mẫu Thiệp Cinelove</span>
          </nav>

          {/* Hero Banner */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-600 text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BỘ SƯU TẬP GIAO DIỆN THIỆP ĐIỆN TỬ CINELOVE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              Mẫu Thiệp Cưới & Sự Kiện <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Độc Quyền</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Trải nghiệm các thiết kế thiệp điện tử tương tác chuẩn phong cách Cinelove: cuộn ảnh mượt mà, âm nhạc lãng mạn, album ảnh sắc nét và nhận xác nhận RSVP tức thì.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Sticky Filter & Search Control Panel */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/80 shadow-lg shadow-gray-200/50 space-y-4 mb-8">
          {/* Top Source Tabs: Tất Cả / Mẫu Hệ Thống (Official) / Cộng Đồng Đóng Góp (Community) */}
          <div className="flex items-center gap-2 p-1 bg-gray-100/80 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleTabChange('all')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                currentTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tất Cả Mẫu</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-700 font-extrabold">
                {templates.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('official')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                currentTab === 'official'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Mẫu Hệ Thống</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-extrabold">
                {templates.filter((t) => !t.isCommunity).length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('community')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                currentTab === 'community'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>Cộng Đồng Đóng Góp</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-extrabold">
                {templates.filter((t) => t.isCommunity).length}
              </span>
            </button>
          </div>

          {/* Category Tabs (Horizontal Scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                currentCategory === 'all'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tất Cả Danh Mục</span>
            </button>

            {categories.map((cat) => {
              const IconComp = resolveIcon(cat.icon, Sparkles);
              const isSelected = currentCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                  {cat.templateCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {cat.templateCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sub-bar: Badge filters & Search Input */}
          <div className="pt-3 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Badge Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
              <span className="text-xs font-bold text-gray-400 mr-1 flex items-center gap-1 flex-shrink-0">
                <Filter className="w-3 h-3" /> Gói:
              </span>
              {badgeFilters.map((b) => {
                const isSelected = currentBadge === b.key;
                return (
                  <button
                    key={b.key}
                    onClick={() => handleBadgeChange(b.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                      isSelected
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 flex-shrink-0">
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
        </div>

        {/* Audio Status Banner if playing */}
        {playingTemplateId && (
          <div className="mb-6 px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-700 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>
                Đang phát nhạc thử nghiệm:{' '}
                <strong>
                  {templates.find((t) => t.id === playingTemplateId)?.musicTitle ||
                    templates.find((t) => t.id === playingTemplateId)?.name}
                </strong>
              </span>
            </div>
            <button
              onClick={() => {
                if (audioPlayerRef.current) audioPlayerRef.current.pause();
                setPlayingTemplateId(null);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 font-bold hover:bg-rose-100"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Dừng phát</span>
            </button>
          </div>
        )}

        {/* Templates Grid */}
        {loading ? (
          <div className="py-24 flex justify-center">
            <LoadingSpinner size="lg" message="Đang nạp kho mẫu thiệp Cinelove..." />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">Không tìm thấy mẫu thiệp phù hợp</h3>
            <p className="text-xs text-gray-500 mt-1">
              Vui lòng thử tìm kiếm với từ khóa khác hoặc đổi bộ lọc danh mục và gói.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isPlaying={playingTemplateId === template.id}
                onToggleAudio={handleToggleAudio}
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
