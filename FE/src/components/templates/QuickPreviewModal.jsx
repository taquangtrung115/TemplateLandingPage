import React, { useState } from 'react';
import { X, Monitor, Smartphone, ExternalLink } from 'lucide-react';
import LandingPageRenderer from './LandingPageRenderer';
import { getDefaultConfigByCategory } from '../../utils/defaultTemplates';

export const QuickPreviewModal = ({ template, isOpen, onClose }) => {
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'mobile'

  if (!isOpen || !template) return null;

  let parsedConfig;
  try {
    parsedConfig = typeof template.defaultConfigJson === 'string'
      ? JSON.parse(template.defaultConfigJson)
      : (template.defaultConfigJson || getDefaultConfigByCategory(template.category));
  } catch {
    parsedConfig = getDefaultConfigByCategory(template.category);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full h-[92vh] max-w-7xl flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Topbar */}
        <div className="h-16 bg-gray-950/80 border-b border-gray-800 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-base truncate max-w-xs sm:max-w-md">
              {template.name}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 font-medium">
              {template.category}
            </span>
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center bg-gray-800 p-1 rounded-xl border border-gray-700">
            <button
              onClick={() => setViewport('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                viewport === 'desktop' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                viewport === 'mobile' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile (375px)</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/preview/${template.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              title="Mở tab mới toàn màn hình"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Canvas Body */}
        <div className="flex-1 bg-gray-950 overflow-y-auto flex items-center justify-center p-4">
          {viewport === 'desktop' ? (
            <div className="w-full h-full rounded-2xl overflow-y-auto shadow-2xl bg-white no-scrollbar">
              <LandingPageRenderer config={parsedConfig} isPreview={true} />
            </div>
          ) : (
            <div className="w-[375px] h-[720px] rounded-[40px] border-[10px] border-gray-800 shadow-2xl overflow-y-auto bg-white no-scrollbar relative my-auto ring-1 ring-white/10">
              <LandingPageRenderer config={parsedConfig} isPreview={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickPreviewModal;
