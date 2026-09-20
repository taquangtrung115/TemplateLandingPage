import React from 'react';
import { 
  Monitor, Smartphone, Save, Download, FileCode, ArrowLeft, ExternalLink 
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
  title,
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between z-30 shadow-sm">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/templates')}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title="Quay lại danh sách mẫu"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-gray-900 truncate max-w-[150px] sm:max-w-xs">
            {title || 'Tùy Biến Mẫu'}
          </h2>
          <span className="text-[10px] text-gray-400 block font-medium">
            Thay đổi cập nhật tức thì
          </span>
        </div>
      </div>

      {/* Center: Viewport Switcher */}
      <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
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
          <span>Mobile (375px)</span>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onDownloadJson}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          title="Tải file JSON cấu hình"
        >
          <Download className="w-3.5 h-3.5" />
          <span>JSON</span>
        </button>

        <button
          onClick={onExportHtml}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
          title="Xuất trọn vẹn mã HTML dùng độc lập offline"
        >
          <FileCode className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Xuất Standalone HTML</span>
          <span className="sm:hidden">HTML</span>
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
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
        </button>
      </div>
    </div>
  );
};

export default CustomizerToolbar;
