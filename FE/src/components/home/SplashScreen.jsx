import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Component hiển thị màn hình tải mở đầu đếm số mượt từ 0% đến 100%
 * @param {Object} props
 * @param {Function} props.onComplete Callback khi đếm xong 100% và kết thúc animation fade out
 * @param {number} [props.durationMs=1200] Tổng thời gian đếm từ 0 đến 100
 */
export default function SplashScreen({ onComplete, durationMs = 1200 }) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    let animFrameId = null;
    let fallbackTimer = null;
    let fadeOutTimer = null;
    const startTime = performance.now();

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setProgress(100);
      setIsFadingOut(true);

      fadeOutTimer = setTimeout(() => {
        onComplete?.();
      }, 400);
    };

    // Easing function: easeOutQuart
    const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

    const step = (now) => {
      const elapsed = now - startTime;
      const linearProgress = Math.min(elapsed / durationMs, 1);
      const easedProgress = Math.min(Math.round(easeOutQuart(linearProgress) * 100), 100);

      setProgress(easedProgress);

      if (linearProgress < 1) {
        animFrameId = requestAnimationFrame(step);
      } else {
        finish();
      }
    };

    animFrameId = requestAnimationFrame(step);

    // Fallback safety timer (durationMs + 600ms or 1800ms) to ensure splash screen never gets stuck
    fallbackTimer = setTimeout(() => {
      finish();
    }, Math.max(durationMs + 600, 1800));

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (fadeOutTimer) clearTimeout(fadeOutTimer);
    };
  }, [durationMs, onComplete]);

  return (
    <div
      role="status"
      aria-label="Loading splash screen"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 text-white transition-opacity duration-400 ease-out select-none pointer-events-none ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute w-96 h-96 bg-rose-600/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-glow" />

      {/* Brand & MotionSites Logo */}
      <div className="flex flex-col items-center space-y-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-2xl shadow-rose-500/30 scale-100 animate-float-slow">
          <Sparkles className="w-7 h-7 animate-spin-slow" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-white">
            Motion<span className="text-rose-500">Sites</span>
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
            Cinelove Template Engine
          </p>
        </div>
      </div>

      {/* Percentage Counter */}
      <div className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-white/95 mb-6">
        {progress}
        <span className="text-2xl sm:text-3xl text-rose-500 ml-1">%</span>
      </div>

      {/* Modern Progress Bar */}
      <div className="w-64 sm:w-80 h-1.5 bg-gray-800/80 rounded-full overflow-hidden border border-white/10 relative">
        <div
          className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 rounded-full transition-all duration-75 ease-out shadow-lg shadow-rose-500/50"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Subtle indicator caption */}
      <p className="mt-4 text-xs text-gray-400 tracking-wider font-medium">
        Đang khởi tạo không gian tương tác...
      </p>
    </div>
  );
}
