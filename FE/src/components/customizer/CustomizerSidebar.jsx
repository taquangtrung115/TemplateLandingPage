import React, { useState } from 'react';
import { 
  Palette, Image, Users, Calendar, Clock, Sparkles, 
  CheckSquare, Music, MessageSquare, Plus, Trash2 
} from 'lucide-react';

export const CustomizerSidebar = ({ config, onChange, metadata, onMetadataChange }) => {
  const [activeTab, setActiveTab] = useState('theme');

  // Deep update helper
  const updateConfig = (section, field, value) => {
    onChange({
      ...config,
      [section]: {
        ...config[section],
        [field]: value,
      },
    });
  };

  const updateNestedConfig = (section, subSection, field, value) => {
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

  // Timeline helpers
  const handleTimelineChange = (index, field, value) => {
    const updated = [...(config.timeline || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...config, timeline: updated });
  };

  const addTimelineItem = () => {
    const newItem = {
      id: Date.now().toString(),
      time: '19:00',
      title: 'Mốc thời gian mới',
      description: 'Mô tả chi tiết hoạt động diễn ra',
      icon: 'Heart',
    };
    onChange({ ...config, timeline: [...(config.timeline || []), newItem] });
  };

  const removeTimelineItem = (index) => {
    const updated = (config.timeline || []).filter((_, idx) => idx !== index);
    onChange({ ...config, timeline: updated });
  };

  // Gallery helpers
  const handleGalleryChange = (index, field, value) => {
    const updated = [...(config.gallery || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...config, gallery: updated });
  };

  const addGalleryItem = () => {
    const newItem = {
      id: Date.now().toString(),
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
      caption: 'Kỷ niệm đáng nhớ',
    };
    onChange({ ...config, gallery: [...(config.gallery || []), newItem] });
  };

  const removeGalleryItem = (index) => {
    const updated = (config.gallery || []).filter((_, idx) => idx !== index);
    onChange({ ...config, gallery: updated });
  };

  const tabs = [
    { id: 'general', label: 'Cài đặt chung', icon: Sparkles },
    { id: 'theme', label: 'Giao diện & Màu', icon: Palette },
    { id: 'hero', label: 'Màn hình đầu', icon: Image },
    { id: 'couple', label: 'Nhân vật chính', icon: Users },
    { id: 'event', label: 'Sự kiện & Địa điểm', icon: Calendar },
    { id: 'timeline', label: 'Lịch trình', icon: Clock },
    { id: 'gallery', label: 'Album ảnh', icon: Image },
    { id: 'rsvp', label: 'Biểu mẫu RSVP', icon: CheckSquare },
    { id: 'music', label: 'Nhạc nền', icon: Music },
    { id: 'wishes', label: 'Lời chúc', icon: MessageSquare },
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
          </div>
        )}

        {/* Couple or Celebrant */}
        {activeTab === 'couple' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thông tin nhân vật</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Loại sự kiện</label>
              <select
                value={config.coupleOrCelebrant?.type || 'wedding'}
                onChange={(e) => updateConfig('coupleOrCelebrant', 'type', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              >
                <option value="wedding">Đám cưới (2 nhân vật)</option>
                <option value="birthday">Sinh nhật (1 nhân vật chính)</option>
              </select>
            </div>

            {/* Person 1 */}
            <div className="p-3 bg-gray-50 rounded-2xl border space-y-2">
              <h4 className="text-xs font-bold text-gray-800">Nhân vật 1 (Chú rể / Chủ tiệc)</h4>
              <input
                type="text"
                placeholder="Tên"
                value={config.coupleOrCelebrant?.person1?.name || ''}
                onChange={(e) => updateNestedConfig('coupleOrCelebrant', 'person1', 'name', e.target.value)}
                className="w-full px-3 py-1.5 border rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Danh xưng (Chú Rể, Chủ Tiệc...)"
                value={config.coupleOrCelebrant?.person1?.title || ''}
                onChange={(e) => updateNestedConfig('coupleOrCelebrant', 'person1', 'title', e.target.value)}
                className="w-full px-3 py-1.5 border rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="URL Ảnh đại diện"
                value={config.coupleOrCelebrant?.person1?.avatarUrl || ''}
                onChange={(e) => updateNestedConfig('coupleOrCelebrant', 'person1', 'avatarUrl', e.target.value)}
                className="w-full px-3 py-1.5 border rounded-lg text-xs font-mono text-[11px]"
              />
              <textarea
                rows={2}
                placeholder="Tiểu sử ngắn"
                value={config.coupleOrCelebrant?.person1?.bio || ''}
                onChange={(e) => updateNestedConfig('coupleOrCelebrant', 'person1', 'bio', e.target.value)}
                className="w-full px-3 py-1.5 border rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Gia đình / Cha mẹ"
                value={config.coupleOrCelebrant?.person1?.parents || ''}
                onChange={(e) => updateNestedConfig('coupleOrCelebrant', 'person1', 'parents', e.target.value)}
                className="w-full px-3 py-1.5 border rounded-lg text-xs"
              />
            </div>

            {/* Person 2 (if wedding) */}
            {config.coupleOrCelebrant?.type !== 'birthday' && (
              <div className="p-3 bg-gray-50 rounded-2xl border space-y-2">
                <h4 className="text-xs font-bold text-gray-800">Nhân vật 2 (Cô dâu)</h4>
                <input
                  type="text"
                  placeholder="Tên"
                  value={config.coupleOrCelebrant?.person2?.name || ''}
                  onChange={(e) => updateNestedConfig('coupleOrCelebrant', 'person2', 'name', e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Danh xưng (Cô Dâu)"
                  value={config.coupleOrCelebrant?.person2?.title || ''}
                  onChange={(e) => updateNestedConfig('coupleOrCelebrant', 'person2', 'title', e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="URL Ảnh đại diện"
                  value={config.coupleOrCelebrant?.person2?.avatarUrl || ''}
                  onChange={(e) => updateNestedConfig('coupleOrCelebrant', 'person2', 'avatarUrl', e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg text-xs font-mono text-[11px]"
                />
                <textarea
                  rows={2}
                  placeholder="Tiểu sử ngắn"
                  value={config.coupleOrCelebrant?.person2?.bio || ''}
                  onChange={(e) => updateNestedConfig('coupleOrCelebrant', 'person2', 'bio', e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Gia đình / Cha mẹ"
                  value={config.coupleOrCelebrant?.person2?.parents || ''}
                  onChange={(e) => updateNestedConfig('coupleOrCelebrant', 'person2', 'parents', e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Câu nói ý nghĩa</label>
              <textarea
                rows={2}
                value={config.coupleOrCelebrant?.storyQuote || ''}
                onChange={(e) => updateConfig('coupleOrCelebrant', 'storyQuote', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">Link Google Maps</label>
              <input
                type="text"
                value={config.eventDetails?.mapDirectLink || ''}
                onChange={(e) => updateConfig('eventDetails', 'mapDirectLink', e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {/* Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Các mốc lịch trình</h3>
              <button
                onClick={addTimelineItem}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm mốc</span>
              </button>
            </div>

            <div className="space-y-3">
              {(config.timeline || []).map((item, idx) => (
                <div key={item.id || idx} className="p-3 bg-gray-50 border rounded-2xl space-y-2 relative group">
                  <button
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
                onClick={addGalleryItem}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm ảnh</span>
              </button>
            </div>

            <div className="space-y-3">
              {(config.gallery || []).map((img, idx) => (
                <div key={img.id || idx} className="p-3 bg-gray-50 border rounded-2xl space-y-2 relative group">
                  <button
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
              <span className="text-xs font-semibold text-gray-700">Cho phép chọn chế độ ăn</span>
              <input
                type="checkbox"
                checked={config.rsvp?.allowDietaryNotes ?? true}
                onChange={(e) => updateConfig('rsvp', 'allowDietaryNotes', e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Music Settings */}
        {activeTab === 'music' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nhạc nền tự phát</h3>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizerSidebar;
