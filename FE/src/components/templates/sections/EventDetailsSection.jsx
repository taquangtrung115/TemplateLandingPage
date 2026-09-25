import React from 'react';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import ScrollReveal from '../../common/ScrollReveal';
import { getSafeHttpUrl } from '../../../utils/safeUrl';

/**
 * @param {Object} props
 * @param {Object} props.eventDetails
 * @param {string} props.primaryColor
 * @param {boolean} props.isHighlighted
 */
export const EventDetailsSection = React.memo(function EventDetailsSection({
  eventDetails = {},
  primaryColor = '#e11d48',
  isHighlighted = false,
}) {
  const mapDirectLink = getSafeHttpUrl(eventDetails?.mapDirectLink);
  const mapEmbedUrl = getSafeHttpUrl(eventDetails?.mapEmbedUrl);

  return (
    <section
      className={`py-20 px-4 sm:px-6 bg-white/50 backdrop-blur-md border-y border-gray-200/40 relative z-20 transition-all duration-300 ${
        isHighlighted ? 'animate-live-edit' : ''
      }`}
    >
      <ScrollReveal animation={eventDetails?.animation || 'fade-up'}>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-gray-100/80">
            <Calendar className="w-3.5 h-3.5" />
            <span>Thông Tin Buổi Tiệc</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {eventDetails?.ceremonyName || 'Lễ Thành Hôn & Tiệc Mừng'}
          </h2>

          <div
            className="text-xl sm:text-2xl font-bold"
            style={{ color: primaryColor }}
          >
            {eventDetails?.time || '17:30 - 25/10/2026'}
          </div>

          <div className="space-y-1">
            <p className="text-lg font-bold">{eventDetails?.venueName || 'Trung tâm Hội nghị'}</p>
            <p className="text-sm opacity-70 flex items-center justify-center gap-1.5 max-w-md mx-auto">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{eventDetails?.address || 'Hồ Chí Minh'}</span>
            </p>
          </div>

          {eventDetails?.dressCode && (
            <div className="pt-2">
              <span className="inline-block px-5 py-2 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 shadow-sm border border-gray-200/50">
                Dress Code: <span className="font-bold">{eventDetails.dressCode}</span>
              </span>
            </div>
          )}

          {mapDirectLink && (
            <div className="pt-3">
              <a
                href={mapDirectLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: primaryColor }}
              >
                <span>Xem bản đồ chỉ đường trên Google Maps</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Embedded Google Maps if URL is provided */}
          {mapEmbedUrl && (
            <div className="pt-6 max-w-2xl mx-auto overflow-hidden rounded-2xl shadow-lg border border-gray-200">
              <iframe
                title="Venue Map"
                src={mapEmbedUrl}
                width="100%"
                height="280"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
});

export default EventDetailsSection;
