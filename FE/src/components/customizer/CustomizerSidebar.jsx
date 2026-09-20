import React, { useState } from 'react';
import { 
  Palette, Image, Users, Calendar, Clock, Sparkles, 
  CheckSquare, Music, MessageSquare, Plus, Trash2, Layers,
  HelpCircle, QrCode, HeartHandshake, FileText
} from 'lucide-react';
import AnimationSelector from './AnimationSelector';
import { 
  extractPersonsList, 
  addPersonHelper, 
  removePersonHelper 
} from '../../utils/animationConstants';

export const CustomizerSidebar = ({ config, onChange, metadata, onMetadataChange, onSectionEdit }) => {
  const [activeTab, setActiveTab] = useState('theme');

  // Deep update helper
  const updateConfig = (section, field, value) => {
    onSectionEdit?.(section);
    onChange({
      ...config,
      [section]: {
        ...config[section],
        [field]: value,
      },
    });
  };

  const updateNestedConfig = (section, subSection, field, value) => {
    onSectionEdit?.(section);
    onChange({
      ...config,
      [section]: {
        ...config[section],
        [subSection]: {
          ...config[section]?.[subSection],
          [field]: value,
        },
      },
    });
  };

  // Dynamic Persons helpers
  const persons = extractPersonsList(config?.coupleOrCelebrant);

  const handlePersonFieldChange = (personKey, field, value) => {
    onSectionEdit?.('couple');
    onChange({
      ...config,
      coupleOrCelebrant: {
        ...config.coupleOrCelebrant,
        [personKey]: {
          ...config.coupleOrCelebrant?.[personKey],
          [field]: value,
        },
      },
    });
  };

  const handleAddPerson = () => {
    onSectionEdit?.('couple');
    const updatedCouple = addPersonHelper(config.coupleOrCelebrant);
    onChange({
      ...config,
      coupleOrCelebrant: updatedCouple,
    });
  };

  const handleRemovePerson = (personKey) => {
    if (persons.length <= 1) return;
    onSectionEdit?.('couple');
    const updatedCouple = removePersonHelper(config.coupleOrCelebrant, personKey);
    onChange({
      ...config,
      coupleOrCelebrant: updatedCouple,
    });
  };

  // Timeline helpers
  const handleTimelineChange = (index, field, value) => {
    onSectionEdit?.('timeline');
    const updated = [...(config.timeline || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...config, timeline: updated });
  };

  const addTimelineItem = () => {
    onSectionEdit?.('timeline');
    const newItem = {
      id: Date.now().toString(),
      time: '19:00',
      title: 'Mốc thời gian mới',
      description: 'Mô tả chi tiết hoạt động diễn ra',
      icon: 'Heart',
      animation: 'fade-up',
    };
    onChange({ ...config, timeline: [...(config.timeline || []), newItem] });
  };

  const removeTimelineItem = (index) => {
    onSectionEdit?.('timeline');
    const updated = (config.timeline || []).filter((_, idx) => idx !== index);
    onChange({ ...config, timeline: updated });
  };

  // Gallery helpers
  const handleGalleryChange = (index, field, value) => {
    onSectionEdit?.('gallery');
    const updated = [...(config.gallery || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...config, gallery: updated });
  };

  const addGalleryItem = () => {
    onSectionEdit?.('gallery');
    const newItem = {
      id: Date.now().toString(),
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
      caption: 'Kỷ niệm đáng nhớ',
      animation: 'zoom-in',
    };
    onChange({ ...config, gallery: [...(config.gallery || []), newItem] });
  };

  const removeGalleryItem = (index) => {
    onSectionEdit?.('gallery');
    const updated = (config.gallery || []).filter((_, idx) => idx !== index);
    onChange({ ...config, gallery: updated });
  };

  // Extra Sections helpers
  const extraSections = config?.extraSections || [];

  const handleExtraSectionChange = (index, field, value) => {
    const secId = extraSections[index]?.id || 'extra';
    onSectionEdit?.(secId);
    const updated = [...extraSections];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...config, extraSections: updated });
  };

  const handleExtraSectionNestedChange = (index, parentField, field, value) => {
    const secId = extraSections[index]?.id || 'extra';
    onSectionEdit?.(secId);
    const updated = [...extraSections];
    updated[index] = {
      ...updated[index],
      [parentField]: {
        ...updated[index][parentField],
        [field]: value,
      },
    };
    onChange({ ...config, extraSections: updated });
  };

  const addExtraSection = (type) => {
    const newSectionId = `extra-${Date.now()}`;
    onSectionEdit?.(newSectionId);
    let newSection = {
      id: newSectionId,
      type,
      enabled: true,
      animation: 'fade-up',
    };

    switch (type) {
      case 'thankYou':
        newSection = {
          ...newSection,
          title: 'Lời Cảm Ơn Sâu Sắc',
          subtitle: 'Gửi đến quý quan khách và người thân',
          content: 'Cảm ơn bạn đã luôn ở bên, chung vui và sẻ chia khoảnh khắc ý nghĩa này cùng chúng tôi.',
          imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
        };
        break;
      case 'giftQr':
        newSection = {
          ...newSection,
          title: 'Hộp Mừng Cưới & Gửi Quà (VietQR)',
          subtitle: 'Quét mã VietQR để gửi quà chúc mừng tiện lợi',
          qrBank: {
            bankName: 'MB',
            accountNumber: '0987654321',
            accountHolder: 'NGUYEN VAN A',
            qrImageUrl: '',
          },
        };
        break;
      case 'qa':
        newSection = {
          ...newSection,
          title: 'Câu Hỏi & Thắc Mắc (Q&A)',
          subtitle: 'Giải đáp nhanh thông tin buổi tiệc',
          items: [
            { question: 'Có chỗ để xe không?', answer: 'Có bãi gửi xe rộng rãi miễn phí tại sảnh.' },
            { question: 'Có cần mang thiệp giấy không?', answer: 'Không cần, bạn chỉ cần báo tên khi check-in tại bàn đón tiếp.' },
          ],
        };
        break;
      case 'custom':
      default:
        newSection = {
          ...newSection,
          title: 'Khu Vực Tùy Biến Mới',
          subtitle: 'Phụ đề cho phần nội dung này',
          content: 'Nội dung chi tiết bạn muốn truyền tải đến khách mời...',
          imageUrl: '',
        };
        break;
    }

    onChange({ ...config, extraSections: [...extraSections, newSection] });
  };

  const removeExtraSection = (index) => {
    onSectionEdit?.('extra');
    const updated = extraSections.filter((_, idx) => idx !== index);
    onChange({ ...config, extraSections: updated });
  };

  const addQaItem = (sectionIndex) => {
    const secId = extraSections[sectionIndex]?.id || 'extra';
    onSectionEdit?.(secId);
    const updated = [...extraSections];
    const items = updated[sectionIndex].items || [];
    updated[sectionIndex].items = [
      ...items,
      { question: 'Câu hỏi mới?', answer: 'Câu trả lời giải đáp...' },
    ];
    onChange({ ...config, extraSections: updated });
  };

  const removeQaItem = (sectionIndex, itemIndex) => {
    const secId = extraSections[sectionIndex]?.id || 'extra';
    onSectionEdit?.(secId);
    const updated = [...extraSections];
    const items = (updated[sectionIndex].items || []).filter((_, idx) => idx !== itemIndex);
    updated[sectionIndex].items = items;
    onChange({ ...config, extraSections: updated });
  };

  const updateQaItem = (sectionIndex, itemIndex, field, value) => {
    const secId = extraSections[sectionIndex]?.id || 'extra';
    onSectionEdit?.(secId);
    const updated = [...extraSections];
    const items = [...(updated[sectionIndex].items || [])];
    items[itemIndex] = { ...items[itemIndex], [field]: value };
    updated[sectionIndex].items = items;
    onChange({ ...config, extraSections: updated });
  };

  const tabs = [
    { id: 'general', label: 'Xuất bản', icon: Sparkles },
    { id: 'theme', label: 'Màu & Phông', icon: Palette },
    { id: 'hero', label: 'Màn hình đầu', icon: Image },
    { id: 'couple', label: 'Nhân vật (Dynamic)', icon: Users },
    { id: 'event', label: 'Địa điểm & Giờ', icon: Calendar },
    { id: 'timeline', label: 'Lịch trình', icon: Clock },
    { id: 'gallery', label: 'Album ảnh', icon: Image },
    { id: 'rsvp', label: 'Biểu mẫu RSVP', icon: CheckSquare },
    { id: 'music', label: 'Nhạc nền', icon: Music },
    { id: 'wishes', label: 'Sổ lưu bút', icon: MessageSquare },
    { id: 'extra', label: 'Mở rộng (Sections)', icon: Layers },
  ];

  return (
    <div className="w-full lg:w-96 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden shadow-sm">
      {/* Navigation tabs horizontal slider */}
      <div className="flex border-b border-gray-100 overflow-x-auto p-2 gap-1 bg-gray-50 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-rose-600 shadow-sm border border-gray-200/60'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thông tin xuất bản</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tên thiệp / Dự án</label>
              <input
                type="text"
                value={metadata?.title || ''}
                onChange={(e) => onMetadataChange({ ...metadata, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                placeholder="Ví dụ: Thiệp cưới Minh & Linh"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Đường dẫn riêng (Slug)</label>
              <div className="flex items-center">
                <span className="text-xs text-gray-400 px-2.5 py-2 bg-gray-100 border border-r-0 rounded-l-xl">/view/</span>
                <input
                  type="text"
                  value={metadata?.slug || ''}
                  onChange={(e) => onMetadataChange({ ...metadata, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  className="w-full px-3 py-2 border rounded-r-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  placeholder="minh-linh-2026"
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Xuất bản công khai</span>
                <span className="text-[10px] text-gray-500">Mọi người có thể truy cập qua đường dẫn</span>
              </div>
              <input
                type="checkbox"
                checked={metadata?.isPublished ?? true}
                onChange={(e) => onMetadataChange({ ...metadata, isPublished: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Theme Settings */}
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Màu sắc & Phông chữ</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Màu chủ đạo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.theme?.primaryColor || '#e11d48'}
                    onChange={(e) => updateConfig('theme', 'primaryColor', e.target.value)}
                    className="w-8 h-8 rounded-lg border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.theme?.primaryColor || '#e11d48'}
                    onChange={(e) => updateConfig('theme', 'primaryColor', e.target.value)}
                    className="w-full px-2 py-1 border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Màu phụ</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.theme?.secondaryColor || '#f43f5e'}
                    onChange={(e) => updateConfig('theme', 'secondaryColor', e.target.value)}
                    className="w-8 h-8 rounded-lg border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.theme?.secondaryColor || '#f43f5e'}
                    onChange={(e) => updateConfig('theme', 'secondaryColor', e.target.value)}
                    className="w-full px-2 py-1 border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Màu điểm nhấn (Accent)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.theme?.accentColor || '#fef08a'}
                    onChange={(e) => updateConfig('theme', 'accentColor', e.target.value)}
                    className="w-8 h-8 rounded-lg border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.theme?.accentColor || '#fef08a'}
                    onChange={(e) => updateConfig('theme', 'accentColor', e.target.value)}
                    className="w-full px-2 py-1 border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Màu chữ (Text)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.theme?.textColor || '#1e293b'}
                    onChange={(e) => updateConfig('theme', 'textColor', e.target.value)}
                    className="w-8 h-8 rounded-lg border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.theme?.textColor || '#1e293b'}
                    onChange={(e) => updateConfig('theme', 'textColor', e.target.value)}
                    className="w-full px-2 py-1 border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Màu nền trang</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.theme?.backgroundColor || '#ffffff'}
                  onChange={(e) => updateConfig('theme', 'backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded-lg border cursor-pointer"
                />
                <input
                  type="text"
                  value={config.theme?.backgroundColor || '#ffffff'}
                  onChange={(e) => updateConfig('theme', 'backgroundColor', e.target.value)}
                  className="w-full px-2 py-1 border rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phong cách hiển thị (Style Preset)</label>
              <select
                value={config.theme?.stylePreset || 'romantic'}
                onChange={(e) => updateConfig('theme', 'stylePreset', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="romantic">Romantic (Lãng mạn, ngọt ngào)</option>
                <option value="luxury">Luxury (Quý phái, hoàng gia)</option>
                <option value="minimal">Minimal (Tối giản, trang nhã)</option>
                <option value="modern">Modern (Hiện đại, năng động)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phông chữ tiêu đề</label>
              <select
                value={config.theme?.fontFamily || 'Playfair Display'}
                onChange={(e) => updateConfig('theme', 'fontFamily', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Playfair Display">Playfair Display (Thanh lịch, lãng mạn)</option>
                <option value="Cinzel">Cinzel (Quý tộc, Hoàng gia)</option>
                <option value="Montserrat">Montserrat (Hiện đại, Tinh tế)</option>
                <option value="Great Vibes">Great Vibes (Nét chữ uốn lượn)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Hiệu ứng hạt bay</label>
              <select
                value={config.theme?.particlesEffect || 'petals'}
                onChange={(e) => updateConfig('theme', 'particlesEffect', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="petals">Cánh hoa rơi (Đám cưới lãng mạn)</option>
                <option value="confetti">Pháo hoa giấy Confetti (Sinh nhật sôi động)</option>
                <option value="none">Không dùng hiệu ứng</option>
              </select>
            </div>

            <AnimationSelector
              label="Hiệu ứng xuất hiện mặc định"
              value={config.theme?.defaultAnimation || 'fade-up'}
              onChange={(val) => updateConfig('theme', 'defaultAnimation', val)}
            />
          </div>
        )}

        {/* Hero Settings */}
        {activeTab === 'hero' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Màn hình Hero</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Badge nhỏ phía trên</label>
              <input
                type="text"
                value={config.hero?.badge || ''}
                onChange={(e) => updateConfig('hero', 'badge', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
                placeholder="SAVE THE DATE"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tiêu đề chính</label>
              <input
                type="text"
                value={config.hero?.title || ''}
                onChange={(e) => updateConfig('hero', 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                placeholder="Minh & Linh"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phụ đề</label>
              <textarea
                rows={2}
                value={config.hero?.subtitle || ''}
                onChange={(e) => updateConfig('hero', 'subtitle', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày diễn ra sự kiện</label>
              <input
                type="datetime-local"
                value={config.hero?.eventDate ? config.hero.eventDate.substring(0, 16) : ''}
                onChange={(e) => updateConfig('hero', 'eventDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">URL Ảnh bìa (Cover Image)</label>
              <input
                type="text"
                value={config.hero?.coverImageUrl || ''}
                onChange={(e) => updateConfig('hero', 'coverImageUrl', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Chữ nút bấm (CTA)</label>
              <input
                type="text"
                value={config.hero?.callToActionText || ''}
                onChange={(e) => updateConfig('hero', 'callToActionText', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>
            <AnimationSelector
              label="Hiệu ứng chữ màn hình đầu"
              value={config.hero?.animation || 'fade-up'}
              onChange={(val) => updateConfig('hero', 'animation', val)}
            />
          </div>
        )}

        {/* Dynamic Persons Settings */}
        {activeTab === 'couple' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Nhân vật chính ({persons.length})
              </h3>
              <button
                type="button"
                onClick={handleAddPerson}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm nhân vật</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Loại sự kiện</label>
              <select
                value={config.coupleOrCelebrant?.type || 'wedding'}
                onChange={(e) => updateConfig('coupleOrCelebrant', 'type', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              >
                <option value="wedding">Đám cưới (Uyên ương)</option>
                <option value="birthday">Sinh nhật (Chủ nhân tiệc)</option>
                <option value="event">Sự kiện / Hội thảo / Kỷ niệm</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Câu nói ý nghĩa / Danh ngôn</label>
              <textarea
                rows={2}
                value={config.coupleOrCelebrant?.storyQuote || ''}
                onChange={(e) => updateConfig('coupleOrCelebrant', 'storyQuote', e.target.value)}
                placeholder="Câu nói yêu thích, lời trích dẫn..."
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>

            <AnimationSelector
              label="Hiệu ứng toàn bộ khối nhân vật"
              value={config.coupleOrCelebrant?.animation || 'fade-up'}
              onChange={(val) => updateConfig('coupleOrCelebrant', 'animation', val)}
            />

            {/* Dynamic Persons List */}
            <div className="space-y-4 pt-2">
              {persons.map((person, idx) => (
                <div key={person.key || idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2.5 relative group">
                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                    <span className="text-xs font-bold text-gray-800">
                      #{idx + 1}: {person.title || person.name || `Nhân vật ${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(person.key)}
                      disabled={persons.length <= 1}
                      title={persons.length <= 1 ? 'Cần giữ tối thiểu 1 nhân vật' : 'Xóa nhân vật này'}
                      className="text-gray-400 hover:text-rose-600 p-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Tên nhân vật</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn Minh"
                      value={person.name || ''}
                      onChange={(e) => handlePersonFieldChange(person.key, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Danh xưng / Vai trò</label>
                    <input
                      type="text"
                      placeholder="Chú Rể, Cô Dâu, Chủ Tiệc, Diễn Giả..."
                      value={person.title || ''}
                      onChange={(e) => handlePersonFieldChange(person.key, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">URL Ảnh đại diện</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={person.avatarUrl || ''}
                      onChange={(e) => handlePersonFieldChange(person.key, 'avatarUrl', e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg text-xs font-mono text-[11px] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Tiểu sử ngắn</label>
                    <textarea
                      rows={2}
                      placeholder="Mô tả về tính cách, sở thích hoặc lời giới thiệu ngắn..."
                      value={person.bio || ''}
                      onChange={(e) => handlePersonFieldChange(person.key, 'bio', e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Gia đình / Cha mẹ / Đại diện</label>
                    <input
                      type="text"
                      placeholder="Ông ... & Bà ... hoặc Đơn vị công tác"
                      value={person.parents || ''}
                      onChange={(e) => handlePersonFieldChange(person.key, 'parents', e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                    />
                  </div>

                  <AnimationSelector
                    label="Hiệu ứng thẻ nhân vật"
                    value={person.animation || 'fade-up'}
                    onChange={(val) => handlePersonFieldChange(person.key, 'animation', val)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Details */}
        {activeTab === 'event' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thời gian & Địa điểm</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tên sự kiện</label>
              <input
                type="text"
                value={config.eventDetails?.ceremonyName || ''}
                onChange={(e) => updateConfig('eventDetails', 'ceremonyName', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Thời gian hiển thị</label>
              <input
                type="text"
                value={config.eventDetails?.time || ''}
                onChange={(e) => updateConfig('eventDetails', 'time', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
                placeholder="17:30 - Chủ Nhật, 25/10/2026"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tên địa điểm / Nhà hàng</label>
              <input
                type="text"
                value={config.eventDetails?.venueName || ''}
                onChange={(e) => updateConfig('eventDetails', 'venueName', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Địa chỉ cụ thể</label>
              <input
                type="text"
                value={config.eventDetails?.address || ''}
                onChange={(e) => updateConfig('eventDetails', 'address', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Dress Code (Quy định trang phục)</label>
              <input
                type="text"
                value={config.eventDetails?.dressCode || ''}
                onChange={(e) => updateConfig('eventDetails', 'dressCode', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Link Google Maps trực tiếp</label>
              <input
                type="text"
                value={config.eventDetails?.mapDirectLink || ''}
                onChange={(e) => updateConfig('eventDetails', 'mapDirectLink', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Link Bản đồ nhúng (Embed iframe URL)</label>
              <input
                type="text"
                value={config.eventDetails?.mapEmbedUrl || ''}
                onChange={(e) => updateConfig('eventDetails', 'mapEmbedUrl', e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono text-[11px]"
              />
            </div>
            <AnimationSelector
              label="Hiệu ứng khối sự kiện"
              value={config.eventDetails?.animation || 'fade-up'}
              onChange={(val) => updateConfig('eventDetails', 'animation', val)}
            />
          </div>
        )}

        {/* Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Các mốc lịch trình</h3>
              <button
                type="button"
                onClick={addTimelineItem}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm mốc</span>
              </button>
            </div>

            <AnimationSelector
              label="Hiệu ứng toàn bộ lịch trình"
              value={config.timelineAnimation || 'fade-up'}
              onChange={(val) => {
                onSectionEdit?.('timeline');
                onChange({ ...config, timelineAnimation: val });
              }}
            />

            <div className="space-y-3">
              {(config.timeline || []).map((item, idx) => (
                <div key={item.id || idx} className="p-3 bg-gray-50 border rounded-2xl space-y-2 relative group">
                  <button
                    type="button"
                    onClick={() => removeTimelineItem(idx)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Giờ (18:00)"
                      value={item.time || ''}
                      onChange={(e) => handleTimelineChange(idx, 'time', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg text-xs bg-white"
                    />
                    <select
                      value={item.icon || 'Heart'}
                      onChange={(e) => handleTimelineChange(idx, 'icon', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg text-xs bg-white"
                    >
                      <option value="Heart">Trái tim</option>
                      <option value="Camera">Máy ảnh</option>
                      <option value="Utensils">Bữa tiệc</option>
                      <option value="Music">Âm nhạc</option>
                      <option value="Cake">Bánh sinh nhật</option>
                      <option value="GlassWater">Nâng ly</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Tiêu đề mốc"
                    value={item.title || ''}
                    onChange={(e) => handleTimelineChange(idx, 'title', e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-semibold bg-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Mô tả chi tiết"
                    value={item.description || ''}
                    onChange={(e) => handleTimelineChange(idx, 'description', e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white"
                  />
                  <AnimationSelector
                    label="Hiệu ứng mốc này"
                    value={item.animation || 'fade-up'}
                    onChange={(val) => handleTimelineChange(idx, 'animation', val)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Album hình ảnh</h3>
              <button
                type="button"
                onClick={addGalleryItem}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm ảnh</span>
              </button>
            </div>

            <AnimationSelector
              label="Hiệu ứng toàn bộ album"
              value={config.galleryAnimation || 'fade-up'}
              onChange={(val) => {
                onSectionEdit?.('gallery');
                onChange({ ...config, galleryAnimation: val });
              }}
            />

            <div className="space-y-3">
              {(config.gallery || []).map((img, idx) => (
                <div key={img.id || idx} className="p-3 bg-gray-50 border rounded-2xl space-y-2 relative group">
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(idx)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="text"
                    placeholder="URL ảnh"
                    value={img.url || ''}
                    onChange={(e) => handleGalleryChange(idx, 'url', e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono text-[11px] bg-white pr-8"
                  />
                  <input
                    type="text"
                    placeholder="Chú thích ảnh"
                    value={img.caption || ''}
                    onChange={(e) => handleGalleryChange(idx, 'caption', e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white"
                  />
                  <AnimationSelector
                    label="Hiệu ứng ảnh này"
                    value={img.animation || 'zoom-in'}
                    onChange={(val) => handleGalleryChange(idx, 'animation', val)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP Settings */}
        {activeTab === 'rsvp' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Biểu mẫu RSVP</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
              <span className="text-xs font-bold text-gray-800">Kích hoạt biểu mẫu RSVP</span>
              <input
                type="checkbox"
                checked={config.rsvp?.enabled ?? true}
                onChange={(e) => updateConfig('rsvp', 'enabled', e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Hạn chót xác nhận</label>
              <input
                type="date"
                value={config.rsvp?.deadline || ''}
                onChange={(e) => updateConfig('rsvp', 'deadline', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Lời nhắn ghi chú</label>
              <textarea
                rows={2}
                value={config.rsvp?.note || ''}
                onChange={(e) => updateConfig('rsvp', 'note', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
              <span className="text-xs font-semibold text-gray-700">Cho phép ghi chú món ăn kiêng</span>
              <input
                type="checkbox"
                checked={config.rsvp?.allowDietaryNotes ?? true}
                onChange={(e) => updateConfig('rsvp', 'allowDietaryNotes', e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
              <div>
                <span className="text-xs font-semibold text-gray-700 block">Cho phép dẫn thêm người (+1)</span>
                <span className="text-[10px] text-gray-400">Khách có thể chọn đi cùng người thương hoặc gia đình</span>
              </div>
              <input
                type="checkbox"
                checked={config.rsvp?.allowPlusOnes ?? true}
                onChange={(e) => updateConfig('rsvp', 'allowPlusOnes', e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded cursor-pointer"
              />
            </div>
            <AnimationSelector
              label="Hiệu ứng khối RSVP"
              value={config.rsvp?.animation || 'fade-up'}
              onChange={(val) => updateConfig('rsvp', 'animation', val)}
            />
          </div>
        )}

        {/* Music Settings */}
        {activeTab === 'music' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nhạc nền</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
              <span className="text-xs font-bold text-gray-800">Bật nhạc nền</span>
              <input
                type="checkbox"
                checked={config.music?.enabled ?? true}
                onChange={(e) => updateConfig('music', 'enabled', e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tên bản nhạc</label>
              <input
                type="text"
                value={config.music?.title || ''}
                onChange={(e) => updateConfig('music', 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Đường dẫn file MP3</label>
              <input
                type="text"
                value={config.music?.audioUrl || ''}
                onChange={(e) => updateConfig('music', 'audioUrl', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono text-[11px]"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
              <div>
                <span className="text-xs font-semibold text-gray-700 block">Tự động phát nhạc (AutoPlay)</span>
                <span className="text-[10px] text-gray-400">Trình duyệt có thể yêu cầu người dùng tương tác trước khi phát</span>
              </div>
              <input
                type="checkbox"
                checked={config.music?.autoPlay ?? true}
                onChange={(e) => updateConfig('music', 'autoPlay', e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Wishes Settings */}
        {activeTab === 'wishes' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sổ lưu bút & Lời chúc</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
              <span className="text-xs font-bold text-gray-800">Bật sổ lưu bút</span>
              <input
                type="checkbox"
                checked={config.wishes?.enabled ?? true}
                onChange={(e) => updateConfig('wishes', 'enabled', e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tiêu đề khu vực</label>
              <input
                type="text"
                value={config.wishes?.title || ''}
                onChange={(e) => updateConfig('wishes', 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phụ đề</label>
              <textarea
                rows={2}
                value={config.wishes?.subtitle || ''}
                onChange={(e) => updateConfig('wishes', 'subtitle', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>
            <AnimationSelector
              label="Hiệu ứng khối lời chúc"
              value={config.wishes?.animation || 'fade-up'}
              onChange={(val) => updateConfig('wishes', 'animation', val)}
            />
          </div>
        )}

        {/* Extra Sections Settings */}
        {activeTab === 'extra' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Các khối nội dung mở rộng ({extraSections.length})
              </h3>
              <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                Bổ sung các phần Lời cảm ơn, Hộp mừng cưới VietQR, Câu hỏi thường gặp hoặc Khối văn bản tùy ý.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => addExtraSection('thankYou')}
                  className="flex items-center gap-1.5 px-2.5 py-2 border rounded-xl text-xs font-semibold text-rose-700 bg-rose-50/70 hover:bg-rose-100 transition-colors"
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>+ Lời cảm ơn</span>
                </button>
                <button
                  type="button"
                  onClick={() => addExtraSection('giftQr')}
                  className="flex items-center gap-1.5 px-2.5 py-2 border rounded-xl text-xs font-semibold text-amber-700 bg-amber-50/70 hover:bg-amber-100 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>+ Quà VietQR</span>
                </button>
                <button
                  type="button"
                  onClick={() => addExtraSection('qa')}
                  className="flex items-center gap-1.5 px-2.5 py-2 border rounded-xl text-xs font-semibold text-blue-700 bg-blue-50/70 hover:bg-blue-100 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>+ Hỏi đáp Q&A</span>
                </button>
                <button
                  type="button"
                  onClick={() => addExtraSection('custom')}
                  className="flex items-center gap-1.5 px-2.5 py-2 border rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>+ Tùy biến</span>
                </button>
              </div>
            </div>

            {/* List of Extra Sections */}
            <div className="space-y-4 pt-2">
              {extraSections.map((sec, idx) => (
                <div key={sec.id || idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3 relative group">
                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-200 text-gray-700">
                        {sec.type === 'thankYou' ? 'Cảm ơn' : sec.type === 'giftQr' ? 'VietQR' : sec.type === 'qa' ? 'Q&A' : 'Tùy chỉnh'}
                      </span>
                      <span className="text-xs font-bold text-gray-800 truncate max-w-[140px]">
                        {sec.title || 'Section mới'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sec.enabled ?? true}
                        onChange={(e) => handleExtraSectionChange(idx, 'enabled', e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                        title="Bật / Tắt hiển thị section này"
                      />
                      <button
                        type="button"
                        onClick={() => removeExtraSection(idx)}
                        className="text-gray-400 hover:text-rose-600 p-1"
                        title="Xóa section này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Tiêu đề section</label>
                    <input
                      type="text"
                      value={sec.title || ''}
                      onChange={(e) => handleExtraSectionChange(idx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Phụ đề</label>
                    <input
                      type="text"
                      value={sec.subtitle || ''}
                      onChange={(e) => handleExtraSectionChange(idx, 'subtitle', e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                    />
                  </div>

                  {/* Thank You & Custom Fields */}
                  {(sec.type === 'thankYou' || sec.type === 'custom') && (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Nội dung chi tiết</label>
                        <textarea
                          rows={3}
                          value={sec.content || ''}
                          onChange={(e) => handleExtraSectionChange(idx, 'content', e.target.value)}
                          className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">URL Ảnh minh họa</label>
                        <input
                          type="text"
                          value={sec.imageUrl || ''}
                          onChange={(e) => handleExtraSectionChange(idx, 'imageUrl', e.target.value)}
                          className="w-full px-3 py-1.5 border rounded-lg text-xs font-mono text-[11px] bg-white"
                        />
                      </div>
                    </>
                  )}

                  {/* Gift QR Fields */}
                  {sec.type === 'giftQr' && (
                    <div className="space-y-2 p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase">Tên Ngân Hàng</label>
                          <input
                            type="text"
                            placeholder="MB, VCB, Techcombank..."
                            value={sec.qrBank?.bankName || ''}
                            onChange={(e) => handleExtraSectionNestedChange(idx, 'qrBank', 'bankName', e.target.value)}
                            className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase">Số Tài Khoản</label>
                          <input
                            type="text"
                            placeholder="0123456789"
                            value={sec.qrBank?.accountNumber || ''}
                            onChange={(e) => handleExtraSectionNestedChange(idx, 'qrBank', 'accountNumber', e.target.value)}
                            className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase">Chủ Tài Khoản (Không dấu)</label>
                        <input
                          type="text"
                          placeholder="NGUYEN VAN A"
                          value={sec.qrBank?.accountHolder || ''}
                          onChange={(e) => handleExtraSectionNestedChange(idx, 'qrBank', 'accountHolder', e.target.value.toUpperCase())}
                          className="w-full px-2.5 py-1.5 border rounded-lg text-xs uppercase font-semibold bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase">URL Mã QR riêng (Tùy chọn)</label>
                        <input
                          type="text"
                          placeholder="Bỏ trống để tự tạo VietQR tự động"
                          value={sec.qrBank?.qrImageUrl || ''}
                          onChange={(e) => handleExtraSectionNestedChange(idx, 'qrBank', 'qrImageUrl', e.target.value)}
                          className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono text-[11px] bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Q&A Items Fields */}
                  {sec.type === 'qa' && (
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-700">Danh sách câu hỏi</span>
                        <button
                          type="button"
                          onClick={() => addQaItem(idx)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                        >
                          + Thêm câu hỏi
                        </button>
                      </div>
                      {(sec.items || []).map((item, qIdx) => (
                        <div key={qIdx} className="p-2.5 bg-white rounded-xl border border-gray-200/80 space-y-1.5 relative">
                          <button
                            type="button"
                            onClick={() => removeQaItem(idx, qIdx)}
                            className="absolute top-2 right-2 text-gray-300 hover:text-rose-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <input
                            type="text"
                            placeholder="Câu hỏi?"
                            value={item.question || ''}
                            onChange={(e) => updateQaItem(idx, qIdx, 'question', e.target.value)}
                            className="w-full px-2 py-1 border rounded-lg text-xs font-semibold pr-6"
                          />
                          <textarea
                            rows={2}
                            placeholder="Câu trả lời..."
                            value={item.answer || ''}
                            onChange={(e) => updateQaItem(idx, qIdx, 'answer', e.target.value)}
                            className="w-full px-2 py-1 border rounded-lg text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <AnimationSelector
                    label="Hiệu ứng section này"
                    value={sec.animation || 'fade-up'}
                    onChange={(val) => handleExtraSectionChange(idx, 'animation', val)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizerSidebar;
