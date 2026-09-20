import React from 'react';
import { Camera, Heart, Utensils, Music, GlassWater, Cake, Sparkles } from 'lucide-react';
import ScrollReveal from '../../common/ScrollReveal';

const renderTimelineIcon = (iconName) => {
  switch (iconName?.toLowerCase()) {
    case 'camera':
      return <Camera className="w-5 h-5" />;
    case 'heart':
      return <Heart className="w-5 h-5" />;
    case 'utensils':
      return <Utensils className="w-5 h-5" />;
    case 'music':
      return <Music className="w-5 h-5" />;
    case 'glasswater':
      return <GlassWater className="w-5 h-5" />;
    case 'cake':
      return <Cake className="w-5 h-5" />;
    default:
      return <Sparkles className="w-5 h-5" />;
  }
};

/**
 * @param {Object} props
 * @param {Array} props.timeline
 * @param {string} props.timelineAnimation
 * @param {string} props.primaryColor
 * @param {string} props.secondaryColor
 * @param {boolean} props.isHighlighted
 */
export const TimelineSection = React.memo(function TimelineSection({
  timeline = [],
  timelineAnimation = 'fade-up',
  primaryColor = '#e11d48',
  secondaryColor = '#f43f5e',
  isHighlighted = false,
}) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <section
      className={`py-24 px-4 sm:px-6 max-w-4xl mx-auto relative z-20 transition-all duration-300 ${
        isHighlighted ? 'animate-live-edit rounded-3xl' : ''
      }`}
    >
      <ScrollReveal animation={timelineAnimation || 'fade-up'}>
        <div className="text-center mb-16 space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest opacity-60">Lịch Trình</span>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primaryColor }}>
            Chương Trình Sự Kiện
          </h2>
        </div>
      </ScrollReveal>

      <div
        className="relative border-l-2 border-dashed ml-4 sm:ml-32 space-y-10"
        style={{ borderColor: primaryColor }}
      >
        {timeline.map((item, idx) => (
          <ScrollReveal
            key={item.id || idx}
            animation={item.animation || 'fade-up'}
            delay={idx * 100}
          >
            <div className="relative pl-8 group">
              {/* Timeline Icon Marker */}
              <div
                className="absolute -left-5 top-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: primaryColor }}
              >
                {renderTimelineIcon(item.icon)}
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                <div
                  className="text-xs font-bold uppercase tracking-wider mb-1"
                  style={{ color: secondaryColor }}
                >
                  {item.time}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
});

export default TimelineSection;
