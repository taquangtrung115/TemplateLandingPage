import React from 'react';
import ScrollReveal from '../../common/ScrollReveal';
import { getSafeResourceUrl } from '../../../utils/safeUrl';

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80';

/**
 * @param {Object} props
 * @param {Array} props.gallery
 * @param {string} props.galleryAnimation
 * @param {string} props.primaryColor
 * @param {Function} props.onOpenLightbox
 * @param {boolean} props.exportMode
 * @param {boolean} props.isHighlighted
 */
export const GallerySection = React.memo(function GallerySection({
  gallery = [],
  galleryAnimation = 'fade-up',
  primaryColor = '#e11d48',
  onOpenLightbox,
  exportMode = false,
  isHighlighted = false,
}) {
  if (!gallery || gallery.length === 0) return null;

  return (
    <section
      className={`py-24 px-4 sm:px-6 max-w-6xl mx-auto relative z-20 transition-all duration-300 ${
        isHighlighted ? 'animate-live-edit rounded-3xl' : ''
      }`}
    >
      <ScrollReveal animation={galleryAnimation || 'fade-up'}>
        <div className="text-center mb-16 space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest opacity-60">Album Ảnh</span>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primaryColor }}>
            Khoảnh Khắc Kỷ Niệm
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {gallery.map((img, idx) => {
          const imageUrl = getSafeResourceUrl(img.url);
          if (!imageUrl) return null;
          return (
            <ScrollReveal
              key={img.id || idx}
              animation={img.animation || 'zoom-in'}
              delay={idx * 80}
            >
              <div
                onClick={exportMode ? undefined : () => onOpenLightbox?.(idx)}
                className={`group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-md bg-gray-100 transition-transform duration-500 ${exportMode ? '' : 'cursor-pointer hover:-translate-y-1'}`}
              >
                <img
                  src={imageUrl}
                  alt={img.caption || 'Gallery'}
                  onError={(e) => {
                    e.target.src = FALLBACK_HERO;
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {(!exportMode || img.caption) && (
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity flex items-end p-4 ${exportMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <p className="text-white text-xs font-medium">{img.caption || 'Nhấp để xem'}</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
});

export default GallerySection;
