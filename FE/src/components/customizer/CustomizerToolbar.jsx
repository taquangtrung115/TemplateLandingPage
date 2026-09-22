import React from 'react';
import { 
  Monitor, Smartphone, Save, Download, FileCode, ArrowLeft, ExternalLink, Share2, Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CustomizerToolbar = ({
  viewport,
  setViewport,
  onSave,
  saving,
  onDownloadJson,
  onExportHtml,
  onOpenLivePreview,
  onPublishCommunity,
  title,
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-3 sm:px-6 flex items-center justify-between z-30 shadow-sm gap-2">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => navigate('/templates')}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
          title="Quay lại danh sách mẫu"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[120px] sm:max-w-xs">
            {title || 'Tùy Biến Mẫu'}
          </h2>
          <span className="text-[10px] text-gray-400 block font-medium truncate">
            Cập nhật tức thì
          </span>
        </div>
      </div>

      {/* Center: Viewport Switcher */}
      <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0">
        <button
          onClick={() => setViewport('desktop')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            viewport === 'desktop'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Desktop</span>
        </button>
        <button
          onClick={() => setViewport('mobile')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            viewport === 'mobile'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Thiết bị di động</span>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Publish Community Button */}
        {onPublishCommunity && (
          <button
            onClick={onPublishCommunity}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-teal-300 bg-teal-50 text-xs font-bold text-teal-700 hover:bg-teal-100 transition-colors shadow-xs"
            title="Đóng góp mẫu này vào thư viện cộng đồng"
          >
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Chia sẻ cộng đồng</span>
            <span className="sm:hidden">Cộng đồng</span>
          </button>
        )}

        <button
          onClick={onDownloadJson}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          title="Tải file JSON cấu hình"
        >
          <Download className="w-3.5 h-3.5" />
          <span>JSON</span>
        </button>

        <button
          onClick={onExportHtml}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
          title="Xuất trọn vẹn mã HTML dùng độc lập offline"
        >
          <FileCode className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Xuất Standalone HTML</span>
          <span className="md:hidden">HTML</span>
        </button>

        {onOpenLivePreview && (
          <button
            onClick={onOpenLivePreview}
            className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Mở tab mới xem toàn màn hình"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? '...' : 'Lưu'}</span>
        </button>
      </div>
    </div>
  );
};

export default CustomizerToolbar;
