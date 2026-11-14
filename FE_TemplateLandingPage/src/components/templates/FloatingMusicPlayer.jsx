import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';

export const FloatingMusicPlayer = ({ audioUrl, title = 'Bản Nhạc Nền', autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioUrl) return;

    if (autoPlay && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Autoplay blocked by browser policy
            setIsPlaying(false);
          });
      }
    }
  }, [audioUrl, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!audioUrl) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <audio ref={audioRef} src={audioUrl} loop preload="metadata" />

      <div
        onClick={togglePlay}
        className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md cursor-pointer transition-all duration-300 ${
          isPlaying
            ? 'bg-black/80 text-white hover:bg-black/90 scale-100 ring-2 ring-white/30'
            : 'bg-white/90 text-gray-800 hover:bg-white border border-gray-200'
        }`}
        title={isPlaying ? 'Tạm dừng nhạc' : 'Bật nhạc nền'}
      >
        <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/20">
          {isPlaying ? (
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 bg-rose-400 h-full animate-[pulse_0.6s_ease-in-out_infinite]" />
              <span className="w-0.5 bg-rose-400 h-2/3 animate-[pulse_0.8s_ease-in-out_infinite_0.2s]" />
              <span className="w-0.5 bg-rose-400 h-full animate-[pulse_0.7s_ease-in-out_infinite_0.4s]" />
            </div>
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
        </div>

        <div className="flex flex-col text-left pr-1">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 flex items-center gap-1">
            <Music className="w-2.5 h-2.5" />
            {isPlaying ? 'Đang phát' : 'Nhạc nền'}
          </span>
          <span className="text-xs font-semibold max-w-[130px] truncate">
            {title}
          </span>
        </div>

        <button
          onClick={toggleMute}
          className="p-1 rounded-full hover:bg-white/20 transition-colors opacity-70 hover:opacity-100"
          title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

export default FloatingMusicPlayer;
