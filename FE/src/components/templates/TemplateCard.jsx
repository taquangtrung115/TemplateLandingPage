import React, { useState } from 'react';
import { Eye, Edit3, Play, Pause, Music, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resolveIcon } from '../../utils/iconResolver';

/**
 * Cinelove-style Phone Mockup Card with Auto-scroll preview and Audio Player
 * @param {Object} props
 * @param {Object} props.template
 * @param {boolean} props.isPlaying
 * @param {Function} props.onToggleAudio
 * @param {Function} props.onQuickPreview
 */
export default function TemplateCard({
  template,
  isPlaying = false,
  onToggleAudio,
  onQuickPreview,
}) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const hasLongPreview = Boolean(template.longPreviewUrl);
  const previewImage = template.longPreviewUrl || template.thumbnailUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80';

  const getBadgeStyle = (badge) => {
    switch (badge?.toLowerCase()) {
      case 'free':
        return 'bg-gray-900/80 text-white border-gray-700';
      case 'basic':
        return 'bg-blue-600/90 text-white border-blue-400';
      case 'premium':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-300';
      case 'hot':
        return 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-amber-300';
      case 'new':
        return 'bg-emerald-600/90 text-white border-emerald-400';
      default:
        return 'bg-rose-600/90 text-white border-rose-400';
    }
  };

  const handleAudioClick = (e) => {
    e.stopPropagation();
    if (template.audioUrl && onToggleAudio) {
      onToggleAudio(template);
    }
  };

  return (
    <div
      className="group bg-white rounded-[28px] overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-2xl hover:border-rose-200 transition-all duration-300 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Phone Mockup Frame Container */}
      <div className="p-3 bg-gradient-to-b from-gray-50 to-gray-100/50">
        <div className="relative h-[380px] w-full rounded-[20px] overflow-hidden bg-white shadow-md border-2 border-gray-200/90">
          {/* Mockup Phone Speaker bar */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300/80 rounded-full z-20 pointer-events-none" />

          {/* Scrolling Long Image */}
          <div className="w-full h-full overflow-hidden relative">
            <img
              src={previewImage}
              alt={template.name}
              className={`w-full ${
                hasLongPreview
                  ? 'absolute top-0 left-0 min-h-full transition-transform ease-in-out'
                  : 'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
              }`}
              style={
                hasLongPreview
                  ? {
                      transform: isHovered ? 'translateY(calc(-100% + 380px))' : 'translateY(0)',
                      transitionDuration: isHovered ? '3500ms' : '1500ms',
                    }
                  : undefined
              }
            />
          </div>

          {/* Badge (Gói thiệp) */}
          {template.badge && (
            <div className="absolute top-3 left-3 z-20">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm shadow-md border ${getBadgeStyle(
                  template.badge
                )}`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                {template.badge}
              </span>
            </div>
          )}

          {/* Audio Preview Pill on Card */}
          {template.audioUrl && (
            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={handleAudioClick}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md transition-all ${
                  isPlaying
                    ? 'bg-rose-600 text-white shadow-rose-500/30 ring-2 ring-white'
                    : 'bg-white/90 text-gray-800 hover:bg-white border border-gray-200'
                }`}
                title={isPlaying ? 'Tạm dừng nhạc' : 'Nghe thử nhạc nền'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3" />
                    {/* Equalizer Bars */}
                    <div className="flex items-end gap-0.5 h-2.5">
                      <span className="w-0.5 bg-white rounded-full animate-bounce h-2" />
                      <span className="w-0.5 bg-white rounded-full animate-bounce h-2.5 [animation-delay:0.15s]" />
                      <span className="w-0.5 bg-white rounded-full animate-bounce h-1.5 [animation-delay:0.3s]" />
                    </div>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-rose-600 fill-rose-600" />
                    <span className="hidden sm:inline">Nhạc</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Action Overlay on Hover */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 transition-opacity duration-300 flex items-center justify-center gap-2.5 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {onQuickPreview && (
              <button
                onClick={() => onQuickPreview(template)}
                className="px-4 py-2 rounded-full bg-white/95 text-gray-900 text-xs font-bold flex items-center gap-1.5 shadow-lg hover:bg-white hover:scale-105 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem demo</span>
              </button>
            )}
            <button
              onClick={() => navigate(`/customize/${template.id}`)}
              className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg hover:bg-rose-700 hover:scale-105 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Dùng mẫu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
              {template.category}
            </span>
            {template.musicTitle && (
              <span className="text-[10px] text-gray-400 truncate max-w-[140px] flex items-center gap-1">
                <Music className="w-3 h-3 text-rose-400 flex-shrink-0" />
                {template.musicTitle}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-1">
            {template.name}
          </h3>
          <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {template.description || 'Mẫu thiết kế cao cấp tối ưu giao diện điện thoại và tương tác mượt mà.'}
          </p>
        </div>

        {/* Bottom CTA bar */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => onQuickPreview ? onQuickPreview(template) : navigate(`/preview/${template.id}`)}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem trước</span>
          </button>

          <button
            onClick={() => navigate(`/customize/${template.id}`)}
            className="px-3.5 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-rose-600 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Dùng mẫu</span>
            <Edit3 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
