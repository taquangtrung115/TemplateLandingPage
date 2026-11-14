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
import { getSafeCssColor, getSafeFontFamily, getSafeResourceUrl } from '../../utils/safeUrl';

const DEFAULT_SECTION_ORDER = [
  'hero', 'persons', 'features', 'cards', 'services', 'speakers', 'pricing',
  'event', 'timeline', 'gallery', 'extra', 'rsvp', 'wishes',
];

const getTimeLeft = (eventDate) => {
  const difference = new Date(eventDate).getTime() - Date.now();
  if (!Number.isFinite(difference) || difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

/**
 * Orchestrator Component renders the complete responsive Landing Page
 * Composed of memoized sub-components for optimal 60fps rendering performance.
 * Supports 6 distinct formats: Romance, Tech Summit, App Showcase, Dental Clinic, SaaS, Birthday.
 */
export const LandingPageRenderer = ({
  config,
  customizationId = null,
  customizationVersionId = null,
  isPreview = false,
  exportMode = false,
  responseUrl = null,
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
  const sectionHeadings = config?.sectionHeadings || {};
  const featureCardsGrid = config?.featureCardsGrid || [];
  const metrics = config?.metrics || [];
  const hierarchicalCards = Array.isArray(config?.hierarchicalCards) ? config.hierarchicalCards : [];

  // Color & Theme styles
  const primaryColor = getSafeCssColor(theme.primaryColor, '#e11d48');
  const secondaryColor = getSafeCssColor(theme.secondaryColor, '#f43f5e');
  const backgroundColor = getSafeCssColor(theme.backgroundColor, '#ffffff');
  const textColor = getSafeCssColor(theme.textColor, '#1e293b');
  const fontFamily = getSafeFontFamily(theme.fontFamily, 'Playfair Display');
  const safeAudioUrl = music?.enabled ? getSafeResourceUrl(music.audioUrl) : null;

  // Dynamic Persons array
  const personsList = extractPersonsList(couple);

  // Lightbox state for gallery
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Countdown state for hero section
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(hero.eventDate));

  // Q&A accordion state: map `${sectionId}-${itemIdx}` -> boolean open
  const [openQaIndex, setOpenQaIndex] = useState({});

  // Copy STK status
  const [copiedStk, setCopiedStk] = useState(false);

  const toggleQa = (sectionId, itemIdx) => {
    const key = `${sectionId}-${itemIdx}`;
    setOpenQaIndex((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyStk = async (stk) => {
    if (!stk) return;
    try {
      await navigator.clipboard.writeText(stk);
      setCopiedStk(true);
      setTimeout(() => setCopiedStk(false), 2000);
    } catch {
      setCopiedStk(false);
    }
  };

  useEffect(() => {
    if (!hero.eventDate) return;

    const calculateTime = () => {
      setTimeLeft(getTimeLeft(hero.eventDate));
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [hero.eventDate]);

  const sectionNodes = {
    hero: (
      <HeroSection
        hero={hero}
        theme={{ ...theme, primaryColor, secondaryColor }}
        timeLeft={timeLeft}
        isHighlighted={activeEditSection === 'hero' || activeEditSection === 'theme'}
      />
    ),
    persons: personsList.length > 0 ? (
      <PersonsSection
        couple={couple}
        personsList={personsList}
        primaryColor={primaryColor}
        isHighlighted={activeEditSection === 'couple' || activeEditSection === 'coupleOrCelebrant'}
      />
    ) : null,
    features: featureCardsGrid.length > 0 ? (
      <FeatureCardsSection
        featureCardsGrid={featureCardsGrid}
        metrics={metrics}
        headings={sectionHeadings.features}
        primaryColor={primaryColor}
        isHighlighted={activeEditSection === 'features'}
      />
    ) : null,
    cards: hierarchicalCards.length > 0 ? (
      <HierarchicalCardsSection
        hierarchicalCards={hierarchicalCards}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        isHighlighted={activeEditSection === 'cards' || activeEditSection === 'hierarchicalCards'}
      />
    ) : null,
    services: servicesGrid.length > 0 ? (
      <ServicesSection
        servicesGrid={servicesGrid}
        treatmentProcess={treatmentProcess}
        booking={booking}
        headings={sectionHeadings.services}
        primaryColor={primaryColor}
        isHighlighted={activeEditSection === 'services'}
      />
    ) : null,
    speakers: speakers.length > 0 ? (
      <SpeakersSection
        speakers={speakers}
        headings={sectionHeadings.speakers}
        primaryColor={primaryColor}
        isHighlighted={activeEditSection === 'speakers'}
      />
    ) : null,
    pricing: pricingTickets.length > 0 || pricingPackages.length > 0 ? (
      <PricingSection
        pricingTickets={pricingTickets}
        pricingPackages={pricingPackages}
        headings={sectionHeadings.pricing}
        primaryColor={primaryColor}
        isHighlighted={activeEditSection === 'pricing'}
      />
    ) : null,
    event: eventDetails.ceremonyName || eventDetails.venueName || eventDetails.address ? (
      <EventDetailsSection
        eventDetails={eventDetails}
        primaryColor={primaryColor}
        isHighlighted={activeEditSection === 'event' || activeEditSection === 'eventDetails'}
      />
    ) : null,
    timeline: timeline.length > 0 ? (
      <TimelineSection
        timeline={timeline}
        timelineAnimation={config?.timelineAnimation || 'fade-up'}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        isHighlighted={activeEditSection === 'timeline'}
      />
    ) : null,
    gallery: gallery.length > 0 ? (
      <>
        <GallerySection
          gallery={gallery}
          galleryAnimation={config?.galleryAnimation || 'fade-up'}
          primaryColor={primaryColor}
          onOpenLightbox={(idx) => setLightboxIndex(idx)}
          exportMode={exportMode}
          isHighlighted={activeEditSection === 'gallery'}
        />
        {lightboxIndex !== null && gallery[lightboxIndex] && getSafeResourceUrl(gallery[lightboxIndex].url) && (
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
                src={getSafeResourceUrl(gallery[lightboxIndex].url)}
                alt="Preview"
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl"
              />
              {gallery[lightboxIndex].caption && (
                <p className="text-white text-center mt-3 text-sm font-medium">{gallery[lightboxIndex].caption}</p>
              )}
            </div>
          </div>
        )}
      </>
    ) : null,
    extra: extraSections.length > 0 ? (
      <ExtraSections
        extraSections={extraSections}
        primaryColor={primaryColor}
        openQaIndex={openQaIndex}
        toggleQa={toggleQa}
        copiedStk={copiedStk}
        handleCopyStk={handleCopyStk}
        isHighlighted={activeEditSection === 'extra'}
        activeEditSection={activeEditSection}
        exportMode={exportMode}
      />
    ) : null,
    rsvp: (isPreview ? rsvp?.enabled !== false : rsvp?.enabled === true) ? (
      <RsvpSection
        rsvp={rsvp}
        primaryColor={primaryColor}
        customizationId={customizationId}
        customizationVersionId={customizationVersionId}
        isPreview={isPreview}
        exportMode={exportMode}
        responseUrl={responseUrl}
        isHighlighted={activeEditSection === 'rsvp'}
      />
    ) : null,
    wishes: (isPreview ? wishes?.enabled !== false : wishes?.enabled === true) ? (
      <WishesSection
        wishes={wishes}
        primaryColor={primaryColor}
        customizationId={customizationId}
        customizationVersionId={customizationVersionId}
        isPreview={isPreview}
        exportMode={exportMode}
        responseUrl={responseUrl}
        isHighlighted={activeEditSection === 'wishes'}
      />
    ) : null,
  };

  const configuredOrder = Array.isArray(config?.sectionOrder) ? config.sectionOrder : [];
  const renderedOrder = [];
  for (const sectionKey of configuredOrder) {
    if (DEFAULT_SECTION_ORDER.includes(sectionKey) && !renderedOrder.includes(sectionKey)) {
      renderedOrder.push(sectionKey);
    }
  }
  for (const sectionKey of DEFAULT_SECTION_ORDER) {
    if (!renderedOrder.includes(sectionKey)) renderedOrder.push(sectionKey);
  }

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
      {!exportMode && <MotionParticles effect={theme.particlesEffect || 'petals'} />}

      {/* Floating Audio Player */}
      {music?.enabled && safeAudioUrl && (exportMode ? (
        <div className="fixed bottom-4 right-4 z-40 rounded-xl bg-white/95 p-3 shadow-xl">
          <p className="text-xs font-semibold mb-2">{music.title || 'Nhạc nền'}</p>
          <audio controls preload="none" src={safeAudioUrl} />
        </div>
      ) : (
        <FloatingMusicPlayer
          audioUrl={safeAudioUrl}
          title={music.title}
          autoPlay={music.autoPlay}
        />
      ))}

      {renderedOrder.map((sectionKey) => (
        <React.Fragment key={sectionKey}>{sectionNodes[sectionKey]}</React.Fragment>
      ))}

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
