import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Tablet,
  Wifi,
  Battery,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Sparkles,
  Signal
} from 'lucide-react';

export const DEVICE_CATALOG = {
  ios: [
    {
      id: 'iphone-15-pro-max',
      name: 'iPhone 15 Pro Max',
      os: 'ios',
      width: 430,
      height: 932,
      notchType: 'dynamic-island',
      borderRadius: 'rounded-[50px]',
      bezelWidth: 'border-[10px]',
      screenRadius: 'rounded-[40px]',
      scaleDefault: 0.8
    },
    {
      id: 'iphone-15',
      name: 'iPhone 15 / 14 Pro',
      os: 'ios',
      width: 393,
      height: 852,
      notchType: 'dynamic-island',
      borderRadius: 'rounded-[48px]',
      bezelWidth: 'border-[9px]',
      screenRadius: 'rounded-[38px]',
      scaleDefault: 0.85
    },
    {
      id: 'iphone-se',
      name: 'iPhone SE (3rd Gen)',
      os: 'ios',
      width: 375,
      height: 667,
      notchType: 'classic-bezel',
      borderRadius: 'rounded-[36px]',
      bezelWidth: 'border-[12px]',
      screenRadius: 'rounded-[20px]',
      scaleDefault: 0.95,
      hasHomeButton: true
    },
    {
      id: 'ipad-mini',
      name: 'iPad Mini (Tablet)',
      os: 'ios',
      width: 768,
      height: 1024,
      notchType: 'tablet',
      borderRadius: 'rounded-[32px]',
      bezelWidth: 'border-[14px]',
      screenRadius: 'rounded-[22px]',
      scaleDefault: 0.65
    }
  ],
  android: [
    {
      id: 'galaxy-s24-ultra',
      name: 'Samsung Galaxy S24 Ultra',
      os: 'android',
      width: 412,
      height: 915,
      notchType: 'punch-hole-center',
      borderRadius: 'rounded-[32px]',
      bezelWidth: 'border-[8px]',
      screenRadius: 'rounded-[24px]',
      scaleDefault: 0.82
    },
    {
      id: 'pixel-8-pro',
      name: 'Google Pixel 8 Pro',
      os: 'android',
      width: 412,
      height: 892,
      notchType: 'punch-hole-center',
      borderRadius: 'rounded-[44px]',
      bezelWidth: 'border-[8px]',
      screenRadius: 'rounded-[36px]',
      scaleDefault: 0.82
    },
    {
      id: 'xiaomi-14',
      name: 'Xiaomi 14',
      os: 'android',
      width: 393,
      height: 851,
      notchType: 'punch-hole-center',
      borderRadius: 'rounded-[40px]',
      bezelWidth: 'border-[7px]',
      screenRadius: 'rounded-[32px]',
      scaleDefault: 0.85
    },
    {
      id: 'galaxy-z-fold',
      name: 'Galaxy Z Fold (Cover)',
      os: 'android',
      width: 344,
      height: 882,
      notchType: 'punch-hole-center',
      borderRadius: 'rounded-[36px]',
      bezelWidth: 'border-[7px]',
      screenRadius: 'rounded-[28px]',
      scaleDefault: 0.85
    }
  ]
};

export default function DeviceSimulator({
  children,
  initialOs = 'ios',
  initialDeviceId = 'iphone-15-pro-max',
  showToolbar = true,
  className = ''
}) {
  const [activeOs, setActiveOs] = useState(initialOs);
  const [selectedDeviceId, setSelectedDeviceId] = useState(initialDeviceId);
  const [scaleMode, setScaleMode] = useState('auto'); // 'auto' | '100' | '85' | '75'
  const [calculatedScale, setCalculatedScale] = useState(0.8);
  const [currentTime, setCurrentTime] = useState('09:41');

  const containerRef = useRef(null);
  const screenContentRef = useRef(null);

  // Find active device
  const currentDevices = DEVICE_CATALOG[activeOs] || DEVICE_CATALOG.ios;
  const activeDevice =
    currentDevices.find((d) => d.id === selectedDeviceId) ||
    currentDevices[0] ||
    DEVICE_CATALOG.ios[0];

  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Compute Auto-Fit Scale based on container height
  useEffect(() => {
    if (!containerRef.current) return;

    const calculateFitScale = () => {
      if (!containerRef.current) return;
      const containerHeight = containerRef.current.clientHeight;
      const containerWidth = containerRef.current.clientWidth;

      if (scaleMode === '100') {
        setCalculatedScale(1);
        return;
      }
      if (scaleMode === '85') {
        setCalculatedScale(0.85);
        return;
      }
      if (scaleMode === '75') {
        setCalculatedScale(0.75);
        return;
      }

      // Auto mode: Fit height with 40px margin
      const targetHeight = activeDevice.height + 48;
      const targetWidth = activeDevice.width + 32;

      const scaleY = containerHeight > 100 ? (containerHeight - 32) / targetHeight : 0.8;
      const scaleX = containerWidth > 100 ? (containerWidth - 32) / targetWidth : 0.8;

      const bestScale = Math.min(1, Math.min(scaleY, scaleX));
      setCalculatedScale(Math.max(0.4, Number(bestScale.toFixed(2))));
    };

    calculateFitScale();

    const resizeObserver = new ResizeObserver(() => {
      calculateFitScale();
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeDevice, scaleMode]);

  const handleOsChange = (os) => {
    setActiveOs(os);
    const firstDeviceOfOs = DEVICE_CATALOG[os][0];
    setSelectedDeviceId(firstDeviceOfOs.id);
  };

  const handleResetScroll = () => {
    if (screenContentRef.current) {
      screenContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-start w-full h-full overflow-hidden bg-slate-900/60 backdrop-blur-sm select-none ${className}`}
    >
      {/* Simulator Control Toolbar */}
      {showToolbar && (
        <div className="z-30 flex flex-wrap items-center justify-between w-full gap-2 px-4 py-2 border-b border-slate-700/60 bg-slate-900/90 text-xs text-slate-300 shrink-0 shadow-md">
          {/* OS Switcher */}
          <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-slate-800 border border-slate-700">
            <button
              type="button"
              onClick={() => handleOsChange('ios')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                activeOs === 'ios'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Apple iOS</span>
            </button>
            <button
              type="button"
              onClick={() => handleOsChange('android')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                activeOs === 'android'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>
          </div>

          {/* Device Model Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg outline-none cursor-pointer hover:border-slate-600 focus:ring-1 focus:ring-rose-500"
            >
              {currentDevices.map((dev) => (
                <option key={dev.id} value={dev.id}>
                  {dev.name} ({dev.width} × {dev.height})
                </option>
              ))}
            </select>
          </div>

          {/* Zoom & Action Controls */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center p-0.5 rounded-lg bg-slate-800 border border-slate-700">
              <button
                type="button"
                onClick={() => setScaleMode('auto')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  scaleMode === 'auto'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tự động thu phóng vừa vặn khung hình"
              >
                Auto ({Math.round(calculatedScale * 100)}%)
              </button>
              <button
                type="button"
                onClick={() => setScaleMode('100')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  scaleMode === '100'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => setScaleMode('75')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  scaleMode === '75'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                75%
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetScroll}
              className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
              title="Cuộn về đầu trang"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Simulator Device Frame Area */}
      <div className="relative flex-1 w-full overflow-auto flex items-start justify-center p-4">
        <div
          style={{
            transform: `scale(${calculatedScale})`,
            transformOrigin: 'top center',
            width: `${activeDevice.width}px`,
            height: `${activeDevice.height}px`,
            marginBottom: `${Math.max(20, (activeDevice.height * (1 - calculatedScale)))}px`
          }}
          className={`relative shrink-0 shadow-2xl transition-transform duration-200 ease-out`}
        >
          {/* Outer Hardware Bezel */}
          <div
            className={`relative w-full h-full bg-slate-950 border-neutral-800/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.15)] ring-1 ring-black/40 overflow-hidden flex flex-col ${activeDevice.borderRadius} ${activeDevice.bezelWidth}`}
          >
            {/* Volume / Power Buttons Simulators (Side Accents) */}
            <div className="absolute -left-3.5 top-24 w-1 h-12 bg-neutral-700 rounded-l-md pointer-events-none" />
            <div className="absolute -left-3.5 top-40 w-1 h-12 bg-neutral-700 rounded-l-md pointer-events-none" />
            <div className="absolute -right-3.5 top-28 w-1 h-16 bg-neutral-700 rounded-r-md pointer-events-none" />

            {/* TOP STATUS BAR */}
            <div className="relative z-40 flex items-center justify-between w-full h-11 px-6 text-white text-[13px] font-semibold tracking-tight shrink-0 bg-transparent select-none pointer-events-none">
              {/* Left: Clock */}
              <div className="flex items-center gap-1">
                <span>{currentTime}</span>
              </div>

              {/* Center Notch / Dynamic Island / Punch Hole */}
              {activeDevice.notchType === 'dynamic-island' && (
                <div className="absolute left-1/2 -translate-x-1/2 top-2 w-28 h-7 bg-black rounded-full flex items-center justify-end px-2.5 shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-blue-900/60" />
                  </div>
                </div>
              )}

              {activeDevice.notchType === 'punch-hole-center' && (
                <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-4 h-4 bg-black rounded-full flex items-center justify-center shadow-inner">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-800" />
                </div>
              )}

              {activeDevice.notchType === 'classic-bezel' && (
                <div className="absolute left-1/2 -translate-x-1/2 top-2 w-14 h-1 bg-neutral-700 rounded-full" />
              )}

              {/* Right: Status Icons */}
              <div className="flex items-center gap-2 text-slate-200">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[11px] font-medium">98%</span>
                  <Battery className="w-4 h-4 fill-white" />
                </div>
              </div>
            </div>

            {/* SCREEN VIEWPORT CONTENT CONTAINER */}
            <div
              ref={screenContentRef}
              className={`relative flex-1 w-full h-full overflow-y-auto overflow-x-hidden bg-white text-slate-900 ${activeDevice.screenRadius}`}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#94a3b8 transparent'
              }}
            >
              {children}
            </div>

            {/* BOTTOM BAR: Home Indicator / Android Nav Bar */}
            {activeDevice.os === 'ios' && !activeDevice.hasHomeButton && (
              <div className="relative z-40 w-full h-5 flex items-center justify-center bg-transparent pointer-events-none shrink-0 pb-1">
                <div className="w-32 h-1 bg-slate-400/80 rounded-full shadow-sm" />
              </div>
            )}

            {activeDevice.os === 'android' && (
              <div className="relative z-40 w-full h-4 flex items-center justify-center bg-transparent pointer-events-none shrink-0 pb-1">
                <div className="w-20 h-1 bg-slate-400/70 rounded-full" />
              </div>
            )}

            {/* Classic Home Button for iPhone SE */}
            {activeDevice.hasHomeButton && (
              <div className="relative z-40 w-full h-12 flex items-center justify-center bg-slate-950 shrink-0">
                <div className="w-9 h-9 rounded-full border border-neutral-700 bg-neutral-900 shadow-inner flex items-center justify-center">
                  <div className="w-3 h-3 rounded border border-neutral-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
