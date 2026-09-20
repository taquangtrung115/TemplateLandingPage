import React from 'react';
import { ChevronRight } from 'lucide-react';
import ScrollReveal from '../../common/ScrollReveal';

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80';

/**
 * @param {Object} props
 * @param {Object} props.hero
 * @param {Object} props.theme
 * @param {Object} props.timeLeft
 * @param {boolean} props.rsvpEnabled
 * @param {boolean} props.isHighlighted
 */
export const HeroSection = React.memo(function HeroSection({
  hero = {},
  theme = {},
  timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 },
  rsvpEnabled = true,
  isHighlighted = false,
}) {
  const accentColor = theme?.accentColor || '#fef08a';
  const primaryColor = theme?.primaryColor || '#e11d48';

  return (
    <header
      className={`relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-24 bg-cover bg-center overflow-hidden transition-all duration-300 ${
        isHighlighted ? 'animate-live-edit' : ''
      }`}
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.52), rgba(0,0,0,0.68)), url('${hero?.coverImageUrl || FALLBACK_HERO}')`,
      }}
    >
      <ScrollReveal animation={hero?.animation || theme?.defaultAnimation || 'fade-up'} duration={800}>
        <div className="relative z-20 max-w-4xl mx-auto text-white space-y-6">
          <div
            className="inline-block px-5 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-widest uppercase border border-white/40 bg-white/10 backdrop-blur-md shadow-lg"
            style={{ borderColor: accentColor }}
          >
            {hero?.badge || 'SAVE THE DATE'}
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-xl">
            {hero?.title || 'Minh & Linh'}
          </h1>

          <p className="text-lg sm:text-2xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
            {hero?.subtitle || 'Hân hoan thông báo ngày chung đôi hạnh phúc'}
          </p>

          {/* Countdown Clock */}
          {hero?.eventDate && (
            <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-lg mx-auto pt-6">
              {[
                { label: 'Ngày', val: timeLeft.days },
                { label: 'Giờ', val: timeLeft.hours },
                { label: 'Phút', val: timeLeft.minutes },
                { label: 'Giây', val: timeLeft.seconds },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-5 text-center shadow-lg transition-transform hover:scale-105"
                >
                  <span className="block text-2xl sm:text-4xl md:text-5xl font-extrabold text-white">
                    {String(item.val ?? 0).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-300 font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Call To Action Button */}
          {rsvpEnabled && (
            <div className="pt-6">
              <a
                href="#rsvp-section"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                <span>{hero?.callToActionText || 'Xác nhận tham dự'}</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </ScrollReveal>
    </header>
  );
});

export default HeroSection;
