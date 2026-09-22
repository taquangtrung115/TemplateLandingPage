import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import MotionParticles from './MotionParticles';
import FloatingMusicPlayer from './FloatingMusicPlayer';
import { extractPersonsList } from '../../utils/animationConstants';

import HeroSection from './sections/HeroSection';
import PersonsSection from './sections/PersonsSection';
import EventDetailsSection from './sections/EventDetailsSection';
import TimelineSection from './sections/TimelineSection';
import GallerySection from './sections/GallerySection';
import ExtraSections from './sections/ExtraSections';
import RsvpSection from './sections/RsvpSection';
import WishesSection from './sections/WishesSection';

// New specialized sections for diverse formats
import SpeakersSection from './sections/SpeakersSection';
import PricingSection from './sections/PricingSection';
import ServicesSection from './sections/ServicesSection';
import FeatureCardsSection from './sections/FeatureCardsSection';
import HierarchicalCardsSection from './sections/HierarchicalCardsSection';

/**
 * Orchestrator Component renders the complete responsive Landing Page
 * Composed of memoized sub-components for optimal 60fps rendering performance.
 * Supports 6 distinct formats: Romance, Tech Summit, App Showcase, Dental Clinic, SaaS, Birthday.
 */
export const LandingPageRenderer = ({
  config,
  customizationId = null,
  isPreview = false,
  activeEditSection = null,
  editFeedbackKey = null,
}) => {
  // Defensive fallbacks for all sections
  const theme = config?.theme || {};
  const hero = config?.hero || {};
  const couple = config?.coupleOrCelebrant || {};
  const eventDetails = config?.eventDetails || {};
  const timeline = config?.timeline || [];
  const gallery = config?.gallery || [];
  const rsvp = config?.rsvp || {};
  const music = config?.music || {};
  const wishes = config?.wishes || {};
  const extraSections = config?.extraSections || [];

  // Specialized data for diverse landing page templates
  const speakers = config?.speakers || [];
  const pricingTickets = config?.pricingTickets || [];
  const pricingPackages = config?.pricingPackages || [];
  const servicesGrid = config?.servicesGrid || [];
  const treatmentProcess = config?.treatmentProcess || [];
  const booking = config?.booking || {};
  const featureCardsGrid = config?.featureCardsGrid || [];
  const metrics = config?.metrics || [];
  const hierarchicalCards = Array.isArray(config?.hierarchicalCards) ? config.hierarchicalCards : [];

  // Color & Theme styles
  const primaryColor = theme.primaryColor || '#e11d48';
  const secondaryColor = theme.secondaryColor || '#f43f5e';
  const backgroundColor = theme.backgroundColor || '#ffffff';
  const textColor = theme.textColor || '#1e293b';
  const fontFamily = theme.fontFamily || 'Playfair Display';

  // Dynamic Persons array
  const personsList = extractPersonsList(couple);

  // Lightbox state for gallery
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Countdown state for hero section
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Q&A accordion state: map `${sectionId}-${itemIdx}` -> boolean open
  const [openQaIndex, setOpenQaIndex] = useState({});

  // Copy STK status
  const [copiedStk, setCopiedStk] = useState(false);

  const toggleQa = (sectionId, itemIdx) => {
    const key = `${sectionId}-${itemIdx}`;
    setOpenQaIndex((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyStk = (stk) => {
    if (!stk) return;
    navigator.clipboard.writeText(stk);
    setCopiedStk(true);
    setTimeout(() => setCopiedStk(false), 2000);
  };

  useEffect(() => {
    if (!hero.eventDate) return;

    const calculateTime = () => {
      const difference = new Date(hero.eventDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [hero.eventDate]);

  return (
    <div
      key={editFeedbackKey}
      className="relative w-full overflow-x-hidden transition-colors duration-300 select-none"
      style={{
        backgroundColor,
        color: textColor,
        fontFamily: `'${fontFamily}', serif, system-ui`,
      }}
    >
      {/* Background Particles Canvas */}
      <MotionParticles effect={theme.particlesEffect || 'petals'} />

      {/* Floating Audio Player */}
      {music?.enabled && (
        <FloatingMusicPlayer
          audioUrl={music.audioUrl}
          title={music.title}
          autoPlay={music.autoPlay}
        />
      )}

      {/* 1. Hero Section */}
      <HeroSection
        hero={hero}
        theme={theme}
        timeLeft={timeLeft}
        rsvpEnabled={rsvp?.enabled ?? true}
        isHighlighted={activeEditSection === 'hero' || activeEditSection === 'theme'}
      />

      {/* 2. Dynamic Couple / Celebrant Section (nếu có người) */}
      {personsList.length > 0 && (
        <PersonsSection
          couple={couple}
          personsList={personsList}
          primaryColor={primaryColor}
          isHighlighted={
            activeEditSection === 'couple' || activeEditSection === 'coupleOrCelebrant'
          }
        />
      )}

      {/* 3. Feature Cards Section (SaaS & ADHD Planner format) */}
      {featureCardsGrid.length > 0 && (
        <FeatureCardsSection
          featureCardsGrid={featureCardsGrid}
          metrics={metrics}
          primaryColor={primaryColor}
          isHighlighted={activeEditSection === 'features'}
        />
      )}

      {/* 3.1 Dynamic Hierarchical Cards Section (Card Builder) */}
      {hierarchicalCards.length > 0 && (
        <HierarchicalCardsSection
          hierarchicalCards={hierarchicalCards}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          isHighlighted={activeEditSection === 'cards' || activeEditSection === 'hierarchicalCards'}
        />
      )}

      {/* 4. Dental & Medical Services Section */}
      {servicesGrid.length > 0 && (
        <ServicesSection
          servicesGrid={servicesGrid}
          treatmentProcess={treatmentProcess}
          booking={booking}
          primaryColor={primaryColor}
          isHighlighted={activeEditSection === 'services'}
        />
      )}

      {/* 5. Keynote Speakers Section (Tech Summit format) */}
      {speakers.length > 0 && (
        <SpeakersSection
          speakers={speakers}
          primaryColor={primaryColor}
          isHighlighted={activeEditSection === 'speakers'}
        />
      )}

      {/* 6. Pricing & Passes Section (Summit & SaaS format) */}
      {(pricingTickets.length > 0 || pricingPackages.length > 0) && (
        <PricingSection
          pricingTickets={pricingTickets}
          pricingPackages={pricingPackages}
          primaryColor={primaryColor}
          isHighlighted={activeEditSection === 'pricing'}
        />
      )}

      {/* 7. Event Details Section (nếu có thông tin sự kiện) */}
      {(eventDetails.ceremonyName || eventDetails.venueName || eventDetails.address) && (
        <EventDetailsSection
          eventDetails={eventDetails}
          primaryColor={primaryColor}
          isHighlighted={activeEditSection === 'event' || activeEditSection === 'eventDetails'}
        />
      )}

      {/* 8. Interactive Timeline */}
      {timeline.length > 0 && (
        <TimelineSection
          timeline={timeline}
          timelineAnimation={config?.timelineAnimation || 'fade-up'}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          isHighlighted={activeEditSection === 'timeline'}
        />
      )}

      {/* 9. Photo Gallery with Lightbox trigger */}
      {gallery.length > 0 && (
        <GallerySection
          gallery={gallery}
          galleryAnimation={config?.galleryAnimation || 'fade-up'}
          primaryColor={primaryColor}
          onOpenLightbox={(idx) => setLightboxIndex(idx)}
          isHighlighted={activeEditSection === 'gallery'}
        />
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && gallery[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={gallery[lightboxIndex].url}
              alt="Preview"
              className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl"
            />
            {gallery[lightboxIndex].caption && (
              <p className="text-white text-center mt-3 text-sm font-medium">
                {gallery[lightboxIndex].caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 10. Extra Sections (Thank You, VietQR, Q&A, Custom) */}
      {extraSections.length > 0 && (
        <ExtraSections
          extraSections={extraSections}
          primaryColor={primaryColor}
          openQaIndex={openQaIndex}
          toggleQa={toggleQa}
          copiedStk={copiedStk}
          handleCopyStk={handleCopyStk}
          isHighlighted={activeEditSection === 'extra'}
          activeEditSection={activeEditSection}
        />
      )}

      {/* 11. RSVP Section */}
      {rsvp?.enabled !== false && (
        <RsvpSection
          rsvp={rsvp}
          primaryColor={primaryColor}
          customizationId={customizationId}
          isHighlighted={activeEditSection === 'rsvp'}
        />
      )}

      {/* 12. Guestbook Wall */}
      {wishes?.enabled !== false && (
        <WishesSection
          wishes={wishes}
          primaryColor={primaryColor}
          customizationId={customizationId}
          isHighlighted={activeEditSection === 'wishes'}
        />
      )}

      {/* Footer of Landing Page */}
      <footer className="py-12 px-4 text-center text-xs opacity-60 border-t border-gray-200/50 relative z-20">
        <p className="font-medium">
          {hero.title || 'Motion Landing Page'} • Forever & Always
        </p>
        <p className="mt-1 text-[11px] opacity-75">
          Created with Motion Landing Page Builder
        </p>
      </footer>
    </div>
  );
};

export default LandingPageRenderer;
