import React from 'react';
import { Eye, Edit3, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TemplateCard = ({ template, onQuickPreview }) => {
  const navigate = useNavigate();

  const isWedding = template.category?.toLowerCase() === 'wedding';

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Thumbnail with overlay */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={template.thumbnailUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80'}
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
          {onQuickPreview && (
            <button
              onClick={() => onQuickPreview(template)}
              className="px-4 py-2 rounded-full bg-white/90 text-gray-900 text-xs font-bold flex items-center gap-1.5 shadow-lg hover:bg-white hover:scale-105 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem nhanh</span>
            </button>
          )}
          <button
            onClick={() => navigate(`/customize/${template.id}`)}
            className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg hover:bg-rose-700 hover:scale-105 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Tùy biến</span>
          </button>
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm ${
              isWedding
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            {isWedding ? 'Đám Cưới' : 'Sinh Nhật'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
            {template.name}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {template.description || 'Mẫu thiết kế độc quyền, sẵn sàng để bạn tùy biến câu chuyện riêng.'}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => navigate(`/preview/${template.id}`)}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem trang mẫu</span>
          </button>

          <button
            onClick={() => navigate(`/customize/${template.id}`)}
            className="px-4 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-rose-600 transition-colors flex items-center gap-1.5"
          >
            <span>Dùng mẫu</span>
            <Edit3 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
