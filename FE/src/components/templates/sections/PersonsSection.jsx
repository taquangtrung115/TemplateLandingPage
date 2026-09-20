import React from 'react';
import ScrollReveal from '../../common/ScrollReveal';

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80';

const getPersonsGridClass = (count) => {
  if (count === 1) return 'max-w-md mx-auto grid grid-cols-1';
  if (count === 2) return 'max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8';
  if (count === 3) return 'max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6';
  return 'max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
};

/**
 * @param {Object} props
 * @param {Object} props.couple
 * @param {Array} props.personsList
 * @param {string} props.primaryColor
 * @param {boolean} props.isHighlighted
 */
export const PersonsSection = React.memo(function PersonsSection({
  couple = {},
  personsList = [],
  primaryColor = '#e11d48',
  isHighlighted = false,
}) {
  return (
    <section
      className={`py-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-20 transition-all duration-300 ${
        isHighlighted ? 'animate-live-edit rounded-3xl' : ''
      }`}
    >
      <ScrollReveal animation={couple?.animation || 'fade-up'}>
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest opacity-60">
            {couple?.type === 'birthday'
              ? 'Nhân Vật Chính'
              : couple?.type === 'event'
              ? 'Ban Tổ Chức & Diễn Giả'
              : 'Cô Dâu & Chú Rể'}
          </span>
          <h2
            className="text-3xl sm:text-5xl font-bold tracking-tight"
            style={{ color: primaryColor }}
          >
            {couple?.type === 'birthday'
              ? 'Chủ Nhân Bữa Tiệc'
              : couple?.type === 'event'
              ? 'Gương Mặt Đại Diện'
              : 'Đôi Uyên Ương'}
          </h2>
          {couple?.storyQuote && (
            <p className="italic text-base sm:text-lg opacity-75 max-w-2xl mx-auto pt-2">
              "{couple.storyQuote}"
            </p>
          )}
        </div>
      </ScrollReveal>

      {/* Dynamic Persons Grid */}
      <div className={getPersonsGridClass(personsList.length)}>
        {personsList.map((person, idx) => (
          <ScrollReveal
            key={person.key || idx}
            animation={person.animation || 'fade-up'}
            delay={idx * 150}
            className="h-full"
          >
            <div className="h-full bg-white/75 backdrop-blur-md border border-gray-100/60 rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between">
              <div>
                <div className="relative inline-block mb-6">
                  <img
                    src={person.avatarUrl || FALLBACK_AVATAR}
                    alt={person.name || 'Person'}
                    onError={(e) => {
                      e.target.src = FALLBACK_AVATAR;
                    }}
                    className="w-36 h-36 sm:w-44 sm:h-44 object-cover rounded-full shadow-lg ring-4 ring-offset-4 mx-auto"
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                </div>
                <span className="text-xs uppercase font-bold tracking-widest opacity-50 block mb-1">
                  {person.title || `Nhân vật ${idx + 1}`}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  {person.name || 'Họ và tên'}
                </h3>
                {person.bio && (
                  <p className="text-sm opacity-80 mb-4 leading-relaxed max-w-sm mx-auto">
                    {person.bio}
                  </p>
                )}
              </div>
              {person.parents && (
                <div className="text-xs opacity-60 border-t border-gray-200/50 pt-3 mt-4">
                  {person.parents}
                </div>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
});

export default PersonsSection;
