import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Component hiển thị màn hình tải mở đầu đếm số mượt từ 0% đến 100%
 * Theo chuẩn prompt: Counter ở góc dưới bên trái (bottom-left), số to text-7xl md:text-9xl tabular-nums,
 * đếm từ 0 đến 100 trong 2000ms (20ms/bước), dừng 200ms, fade-out 700ms.
 *
 * @param {Object} props
 * @param {Function} props.onComplete Callback khi đếm xong 100% và kết thúc animation fade out
 * @param {number} [props.durationMs=2000] Tổng thời gian đếm từ 0 đến 100
 * @param {number} [props.holdDelayMs=200] Thời gian dừng ở 100% trước khi fade-out
 * @param {number} [props.fadeDurationMs=700] Thời gian mờ dần
 */
export default function SplashScreen({
  onComplete,
  durationMs = 2000,
  holdDelayMs = 200,
  fadeDurationMs = 700,
}) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    let animFrameId = null;
    let fallbackTimer = null;
    let holdTimer = null;
    let fadeOutTimer = null;
    const startTime = performance.now();

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setProgress(100);

      holdTimer = setTimeout(() => {
        setIsFadingOut(true);
        fadeOutTimer = setTimeout(() => {
          onComplete?.();
        }, fadeDurationMs);
      }, holdDelayMs);
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

    // Safety fallback timer to guarantee splash screen never hangs
    fallbackTimer = setTimeout(() => {
      finish();
    }, Math.max(durationMs + holdDelayMs + 600, 3000));

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (holdTimer) clearTimeout(holdTimer);
      if (fadeOutTimer) clearTimeout(fadeOutTimer);
    };
  }, [durationMs, holdDelayMs, fadeDurationMs, onComplete]);

  return (
    <div
      role="status"
      aria-label="Loading splash screen"
      className={`fixed inset-0 z-50 flex flex-col justify-between items-start p-8 md:p-16 bg-gray-950 text-white transition-opacity duration-700 ease-out select-none pointer-events-none ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background ambient lighting glow */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-glow" />

      {/* Top Left: Brand Logo & MotionSites Info */}
      <div className="flex items-center space-x-3.5 z-10">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-rose-500/25">
          <Sparkles className="w-5 h-5 animate-spin-slow" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
            Motion<span className="text-rose-500">Sites</span>
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
            Cinelove Template Engine
          </p>
        </div>
      </div>

      {/* Bottom Left: Giant Counter & Progress Indicator */}
      <div className="z-10 space-y-4 max-w-xl">
        <div className="flex items-baseline">
          <span className="text-7xl md:text-9xl font-bold tabular-nums tracking-tighter text-white leading-none">
            {progress}
          </span>
          <span className="text-3xl md:text-5xl font-bold text-rose-500 ml-2">%</span>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-64 sm:w-96 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 rounded-full transition-all duration-75 ease-out shadow-md shadow-rose-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-gray-400 tracking-wider font-medium">
          Đang khởi tạo không gian tương tác...
        </p>
      </div>
    </div>
  );
}
