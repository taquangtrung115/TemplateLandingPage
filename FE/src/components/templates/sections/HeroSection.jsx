import React from 'react';
import { ChevronRight } from 'lucide-react';
import ScrollReveal from '../../common/ScrollReveal';
import { getSafeCssColor, getSafeCssUrl, getSafeLinkUrl, getSafeResourceUrl } from '../../../utils/safeUrl';

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80';

/**
 * @param {Object} props
 * @param {Object} props.hero
 * @param {Object} props.theme
 * @param {Object} props.timeLeft
 * @param {boolean} props.isHighlighted
 */
export const HeroSection = React.memo(function HeroSection({
  hero = {},
  theme = {},
  timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 },
  isHighlighted = false,
}) {
  const accentColor = getSafeCssColor(theme?.accentColor, '#fef08a');
  const primaryColor = getSafeCssColor(theme?.primaryColor, '#e11d48');
  const coverImage = getSafeCssUrl(hero?.coverImageUrl || FALLBACK_HERO);
  const coverImageUrl = getSafeResourceUrl(hero?.coverImageUrl || FALLBACK_HERO);
  const videoUrl = getSafeResourceUrl(hero?.videoUrl);
  const ctaUrl = getSafeLinkUrl(hero?.ctaUrl);
  const hasVideo = Boolean(videoUrl);
  const layout = ['left', 'split', 'editorial'].includes(hero?.layout) ? hero.layout : 'center';
  const isSplit = layout === 'split';

  return (
    <header
      className={`relative min-h-screen ${isSplit ? 'grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center text-center lg:text-left' : `flex flex-col ${layout === 'left' ? 'items-start text-left' : 'items-center text-center'}`} justify-center px-4 py-24 bg-cover bg-center overflow-hidden transition-all duration-300 ${
        isHighlighted ? 'animate-live-edit' : ''
      }`}
      style={{
        backgroundImage: !hasVideo
          ? `linear-gradient(rgba(0,0,0,0.52), rgba(0,0,0,0.68))${coverImage ? `, ${coverImage}` : ''}`
          : undefined,
      }}
    >
      {/* Video Background Mockup/Support */}
      {hasVideo && (
        <>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover -z-10"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] -z-10" />
        </>
      )}

      <ScrollReveal animation={hero?.animation || theme?.defaultAnimation || 'fade-up'} duration={800}>
        <div className={`relative z-20 max-w-4xl text-white space-y-6 ${isSplit || layout === 'left' ? 'mx-0 lg:mr-auto' : 'mx-auto'} ${layout === 'editorial' ? 'max-w-5xl border-y border-white/30 py-10' : ''}`}>
          {layout === 'editorial' && (
            <div className="text-xs sm:text-sm uppercase tracking-[0.35em] font-semibold text-white/80">
              {hero?.editorialLabel || 'A day to remember'}
            </div>
          )}
          {hero?.badge && (
            <div
              className="inline-block px-5 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-widest uppercase border border-white/40 bg-white/10 backdrop-blur-md shadow-lg"
              style={{ borderColor: accentColor }}
            >
              {hero.badge}
            </div>
          )}

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-xl">
            {hero?.title || 'Minh & Linh'}
          </h1>

          {hero?.subtitle && (
            <p className="text-lg sm:text-2xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
              {hero.subtitle}
            </p>
          )}

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
          {ctaUrl && (
            <div className="pt-6">
              <a
                href={ctaUrl}
                target={/^https?:/i.test(ctaUrl) ? '_blank' : undefined}
                rel={/^https?:/i.test(ctaUrl) ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                <span>{hero?.callToActionText || 'Tìm hiểu thêm'}</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </ScrollReveal>

      {isSplit && (
        <div className="hidden lg:block relative z-20 w-full max-w-xl justify-self-center">
          <div className="relative aspect-[4/5] max-h-[70vh] overflow-hidden rounded-[2rem] border border-white/30 shadow-2xl rotate-1">
            {coverImageUrl && <img src={coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            {hero?.imageCaption && (
              <p className="absolute bottom-6 left-6 right-6 text-left text-white text-sm font-medium">
                {hero.imageCaption}
              </p>
            )}
          </div>
        </div>
      )}
    </header>
  );
});

export default HeroSection;
