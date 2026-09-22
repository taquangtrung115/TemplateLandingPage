import React, { useState, useRef, useEffect } from 'react';
import { X, Monitor, Smartphone, ExternalLink, Play, Pause, Music, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LandingPageRenderer from './LandingPageRenderer';
import DeviceSimulator from '../common/DeviceSimulator';
import { getDefaultConfigByCategory } from '../../utils/defaultTemplates';

export const QuickPreviewModal = ({ template, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [viewport, setViewport] = useState('mobile'); // default mobile preview like Cinelove
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Reset audio when template changes or modal closes
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlayingMusic(false);
    }
  }, [isOpen, template]);

  const toggleModalAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => setIsPlayingMusic(false));
    }
  };

  if (!isOpen || !template) return null;

  let parsedConfig;
  try {
    parsedConfig =
      typeof template.defaultConfigJson === 'string'
        ? JSON.parse(template.defaultConfigJson)
        : template.defaultConfigJson || getDefaultConfigByCategory(template.category);
  } catch {
    parsedConfig = getDefaultConfigByCategory(template.category);
  }

  const audioUrl = template.audioUrl || parsedConfig?.music?.audioUrl;
  const musicTitle = template.musicTitle || parsedConfig?.music?.title || 'Nhạc Nền Preview';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-sm">
      {/* Hidden audio element for preview */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="none"
          onEnded={() => setIsPlayingMusic(false)}
        />
      )}

      <div className="bg-gray-950 border border-gray-800 rounded-[32px] w-full h-[92vh] max-w-7xl flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Topbar */}
        <div className="h-16 bg-gray-900/90 border-b border-gray-800 px-4 sm:px-6 flex items-center justify-between gap-2 flex-shrink-0">
          {/* Title & Category info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-extrabold text-white text-sm sm:text-base truncate">
              {template.name}
            </span>
            <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold uppercase tracking-wider flex-shrink-0">
              {template.category}
            </span>
            {template.badge && (
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold uppercase">
                {template.badge}
              </span>
            )}
          </div>

          {/* Center: Music Player & Device Switcher */}
          <div className="flex items-center gap-3">
            {audioUrl && (
              <button
                type="button"
                onClick={toggleModalAudio}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isPlayingMusic
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                title="Bật / tắt nhạc nền"
              >
                {isPlayingMusic ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <Music className="w-3.5 h-3.5 text-rose-300" />
                <span className="hidden md:inline max-w-[120px] truncate">{musicTitle}</span>
              </button>
            )}

            {/* Viewport Switcher */}
            <div className="flex items-center bg-gray-800/80 p-1 rounded-xl border border-gray-700">
              <button
                onClick={() => setViewport('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  viewport === 'mobile' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mô phỏng di động</span>
              </button>
              <button
                onClick={() => setViewport('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  viewport === 'desktop' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                navigate(`/customize/${template.id}`);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-md shadow-rose-600/20"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dùng Mẫu Này</span>
            </button>
            <a
              href={`/preview/${template.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              title="Mở toàn màn hình trong tab mới"
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
        <div className="flex-1 bg-gray-950 overflow-y-auto flex items-center justify-center p-2 sm:p-6">
          {viewport === 'desktop' ? (
            <div className="w-full h-full rounded-2xl overflow-y-auto shadow-2xl bg-white no-scrollbar border border-gray-800">
              <LandingPageRenderer config={parsedConfig} isPreview={true} />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <DeviceSimulator initialOs="ios" showToolbar={true}>
                <LandingPageRenderer config={parsedConfig} isPreview={true} />
              </DeviceSimulator>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickPreviewModal;
