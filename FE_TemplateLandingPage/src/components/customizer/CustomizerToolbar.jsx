import React from 'react';
import {
  Monitor, Smartphone, Save, Download, FileCode, ArrowLeft, ExternalLink, Globe, Layers,
} from 'lucide-react';

export const CustomizerToolbar = ({
  viewport,
  setViewport,
  onSave,
  saving,
  onCreateVersion,
  localSaveStatus,
  onDownloadJson,
  onExportHtml,
  onOpenLivePreview,
  onPublishCommunity,
  canShareCommunity,
  title,
  onBack,
}) => (
  <div className="min-h-16 bg-white border-b border-gray-200 px-3 sm:px-6 py-2 flex items-center justify-between z-30 shadow-sm gap-2">
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
      <button onClick={onBack} className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0" title="Lưu bản nháp và mở danh sách">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="min-w-0">
        <h2 className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[110px] sm:max-w-xs">{title || 'Tùy biến mẫu'}</h2>
        <span className="text-[10px] text-gray-500 block font-medium truncate" role="status">{localSaveStatus}</span>
      </div>
    </div>

    <div className="hidden lg:flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0">
      <button onClick={() => setViewport('desktop')} className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${viewport === 'desktop' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
        <Monitor className="w-3.5 h-3.5" /> Desktop
      </button>
      <button onClick={() => setViewport('mobile')} className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${viewport === 'mobile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
        <Smartphone className="w-3.5 h-3.5" /> Di động
      </button>
    </div>

    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      {onPublishCommunity && (
        <button disabled={!canShareCommunity || saving} onClick={onPublishCommunity} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-teal-300 bg-teal-50 text-xs font-bold text-teal-700 hover:bg-teal-100 transition-colors disabled:opacity-40" title="Chia sẻ một phiên bản đã tạo vào thư viện cộng đồng">
          <Globe className="w-3.5 h-3.5" /><span className="hidden xl:inline">Chia sẻ mẫu</span>
        </button>
      )}
      <button onClick={onDownloadJson} className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50" title="Tải cấu hình JSON">
        <Download className="w-3.5 h-3.5" /> JSON
      </button>
      <button onClick={onExportHtml} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-xs font-semibold text-indigo-700 hover:bg-indigo-100" title="Xuất HTML">
        <FileCode className="w-3.5 h-3.5" /><span className="hidden xl:inline">Xuất HTML</span>
      </button>
      {onOpenLivePreview && (
        <button onClick={onOpenLivePreview} className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100" title="Mở phiên bản công khai">
          <ExternalLink className="w-4 h-4" />
        </button>
      )}
      <button onClick={onSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-600 text-rose-700 text-xs font-bold hover:bg-rose-50 disabled:opacity-50" title="Lưu bản nháp làm việc lên máy chủ">
        <Save className="w-3.5 h-3.5" /><span>{saving ? 'Đang lưu…' : 'Lưu server'}</span>
      </button>
      <button onClick={onCreateVersion} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 disabled:opacity-50" title="Tạo snapshot phiên bản mới">
        <Layers className="w-3.5 h-3.5" /><span>{saving ? '…' : 'Tạo version'}</span>
      </button>
    </div>
  </div>
);

export default CustomizerToolbar;
