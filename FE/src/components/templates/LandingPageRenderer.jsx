import React, { useState, useEffect } from 'react';
import { 
  Heart, Camera, Utensils, Music, GlassWater, Cake, Calendar, MapPin, 
  Send, Sparkles, X, ChevronRight, ChevronDown, CheckCircle2, MessageSquareHeart,
  QrCode, Copy, Check, HelpCircle, HeartHandshake, FileText
} from 'lucide-react';
import MotionParticles from './MotionParticles';
import FloatingMusicPlayer from './FloatingMusicPlayer';
import ScrollReveal from '../common/ScrollReveal';
import { interactionApi } from '../../api/interactionApi';
import { extractPersonsList } from '../../utils/animationConstants';

// Icon mapper helper
const renderTimelineIcon = (iconName) => {
  switch (iconName?.toLowerCase()) {
    case 'camera': return <Camera className="w-5 h-5" />;
    case 'heart': return <Heart className="w-5 h-5" />;
    case 'utensils': return <Utensils className="w-5 h-5" />;
    case 'music': return <Music className="w-5 h-5" />;
    case 'glasswater': return <GlassWater className="w-5 h-5" />;
    case 'cake': return <Cake className="w-5 h-5" />;
    default: return <Sparkles className="w-5 h-5" />;
  }
};

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80';
const FALLBACK_HERO = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80';

export const LandingPageRenderer = ({ config, customizationId = null, isPreview = false }) => {
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
  const extraSections = (config?.extraSections || []).filter(sec => sec.enabled !== false);

  // Color & Theme styles
  const primaryColor = theme.primaryColor || '#e11d48';
  const secondaryColor = theme.secondaryColor || '#f43f5e';
  const accentColor = theme.accentColor || '#fef08a';
  const backgroundColor = theme.backgroundColor || '#ffffff';
  const textColor = theme.textColor || '#1e293b';
  const fontFamily = theme.fontFamily || 'Playfair Display';

  // Dynamic Persons array
  const personsList = extractPersonsList(couple);

  // Lightbox state for gallery
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Q&A accordion state: map index -> boolean open
  const [openQaIndex, setOpenQaIndex] = useState({});

  // Copy STK status
  const [copiedStk, setCopiedStk] = useState(false);

  const toggleQa = (sectionId, itemIdx) => {
    const key = `${sectionId}-${itemIdx}`;
    setOpenQaIndex(prev => ({ ...prev, [key]: !prev[key] }));
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

  // RSVP Form State
  const [rsvpForm, setRsvpForm] = useState({
    guestName: '',
    email: '',
    phone: '',
    attendingStatus: 'attending',
    numberOfGuests: 1,
    dietaryNotes: '',
    wishes: '',
  });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    if (!rsvpForm.guestName.trim()) return;

    setRsvpSubmitting(true);
    try {
      if (customizationId) {
        await interactionApi.submitRsvp({
          customizationId,
          ...rsvpForm,
          numberOfGuests: parseInt(rsvpForm.numberOfGuests, 10) || 1,
        });
      }
      setRsvpSubmitted(true);
    } catch {
      // In preview or standalone mode, treat as simulated success
      setRsvpSubmitted(true);
    } finally {
      setRsvpSubmitting(false);
    }
  };

  // Guestbook Wall State
  const [guestbookList, setGuestbookList] = useState([
    {
      senderName: 'Gia đình & Bạn bè',
      message: 'Chúc mừng ngày chung đôi hạnh phúc trọn vẹn, trăm năm đầu bạc răng long!',
      createdAtUtc: new Date().toISOString()
    }
  ]);
  const [guestbookForm, setGuestbookForm] = useState({ senderName: '', message: '' });
  const [guestbookSubmitting, setGuestbookSubmitting] = useState(false);

  useEffect(() => {
    if (!customizationId || !wishes?.enabled) return;
    const fetchGuestbook = async () => {
      try {
        const entries = await interactionApi.getGuestbook(customizationId);
        if (entries && entries.length > 0) {
          setGuestbookList(entries);
        }
      } catch {
        // use fallback
      }
    };
    fetchGuestbook();
  }, [customizationId, wishes?.enabled]);

  const handleGuestbookSubmit = async (e) => {
    e.preventDefault();
    if (!guestbookForm.senderName.trim() || !guestbookForm.message.trim()) return;

    setGuestbookSubmitting(true);
    const newEntry = {
      senderName: guestbookForm.senderName,
      message: guestbookForm.message,
      createdAtUtc: new Date().toISOString()
    };

    try {
      if (customizationId) {
        await interactionApi.submitGuestbook({
          customizationId,
          ...guestbookForm,
        });
      }
      setGuestbookList(prev => [newEntry, ...prev]);
      setGuestbookForm({ senderName: '', message: '' });
    } catch {
      setGuestbookList(prev => [newEntry, ...prev]);
      setGuestbookForm({ senderName: '', message: '' });
    } finally {
      setGuestbookSubmitting(false);
    }
  };

  // Determine person grid layout based on number of persons
  const getPersonsGridClass = (count) => {
    if (count === 1) return 'max-w-md mx-auto grid grid-cols-1';
    if (count === 2) return 'max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8';
    if (count === 3) return 'max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6';
    return 'max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
  };

  return (
    <div 
      className="relative w-full overflow-x-hidden transition-colors duration-300 select-none"
      style={{
        backgroundColor,
        color: textColor,
        fontFamily: `'${fontFamily}', serif, system-ui`
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

      {/* Hero Section */}
      <header
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-24 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.52), rgba(0,0,0,0.68)), url('${hero.coverImageUrl || FALLBACK_HERO}')`
        }}
      >
        <ScrollReveal animation={hero.animation || theme.defaultAnimation || 'fade-up'} duration={800}>
          <div className="relative z-20 max-w-4xl mx-auto text-white space-y-6">
            <div 
              className="inline-block px-5 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-widest uppercase border border-white/40 bg-white/10 backdrop-blur-md shadow-lg"
              style={{ borderColor: accentColor }}
            >
              {hero.badge || 'SAVE THE DATE'}
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-xl">
              {hero.title || 'Minh & Linh'}
            </h1>

            <p className="text-lg sm:text-2xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
              {hero.subtitle || 'Hân hoan thông báo ngày chung đôi hạnh phúc'}
            </p>

            {/* Countdown Clock */}
            {hero.eventDate && (
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
                      {String(item.val).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-300 font-medium">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Call To Action Button */}
            {rsvp?.enabled && (
              <div className="pt-6">
                <a
                  href="#rsvp-section"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>{hero.callToActionText || 'Xác nhận tham dự'}</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </ScrollReveal>
      </header>

      {/* Dynamic Couple / Celebrant Section */}
      <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-20">
        <ScrollReveal animation={couple.animation || 'fade-up'}>
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest opacity-60">
              {couple.type === 'birthday' ? 'Nhân Vật Chính' : couple.type === 'event' ? 'Ban Tổ Chức & Diễn Giả' : 'Cô Dâu & Chú Rể'}
            </span>
            <h2 
              className="text-3xl sm:text-5xl font-bold tracking-tight"
              style={{ color: primaryColor }}
            >
              {couple.type === 'birthday' ? 'Chủ Nhân Bữa Tiệc' : couple.type === 'event' ? 'Gương Mặt Đại Diện' : 'Đôi Uyên Ương'}
            </h2>
            {couple.storyQuote && (
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
                      onError={(e) => { e.target.src = FALLBACK_AVATAR; }}
                      className="w-36 h-36 sm:w-44 sm:h-44 object-cover rounded-full shadow-lg ring-4 ring-offset-4 mx-auto"
                      style={{ '--tw-ring-color': primaryColor }}
                    />
                  </div>
                  <span className="text-xs uppercase font-bold tracking-widest opacity-50 block mb-1">
                    {person.title || `Nhân vật ${idx + 1}`}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3">{person.name || 'Họ và tên'}</h3>
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

      {/* Event Details Section */}
      <section className="py-20 px-4 sm:px-6 bg-white/50 backdrop-blur-md border-y border-gray-200/40 relative z-20">
        <ScrollReveal animation={eventDetails.animation || 'fade-up'}>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-gray-100/80">
              <Calendar className="w-3.5 h-3.5" />
              <span>Thông Tin Buổi Tiệc</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {eventDetails.ceremonyName || 'Lễ Thành Hôn & Tiệc Mừng'}
            </h2>

            <div 
              className="text-xl sm:text-2xl font-bold"
              style={{ color: primaryColor }}
            >
              {eventDetails.time || '17:30 - 25/10/2026'}
            </div>

            <div className="space-y-1">
              <p className="text-lg font-bold">{eventDetails.venueName || 'Trung tâm Hội nghị'}</p>
              <p className="text-sm opacity-70 flex items-center justify-center gap-1.5 max-w-md mx-auto">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{eventDetails.address || 'Hồ Chí Minh'}</span>
              </p>
            </div>

            {eventDetails.dressCode && (
              <div className="pt-2">
                <span className="inline-block px-5 py-2 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 shadow-sm border border-gray-200/50">
                  Dress Code: <span className="font-bold">{eventDetails.dressCode}</span>
                </span>
              </div>
            )}

            {eventDetails.mapDirectLink && (
              <div className="pt-3">
                <a
                  href={eventDetails.mapDirectLink}
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
            {eventDetails.mapEmbedUrl && (
              <div className="pt-6 max-w-2xl mx-auto overflow-hidden rounded-2xl shadow-lg border border-gray-200">
                <iframe
                  title="Venue Map"
                  src={eventDetails.mapEmbedUrl}
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

      {/* Interactive Timeline */}
      {timeline.length > 0 && (
        <section className="py-24 px-4 sm:px-6 max-w-4xl mx-auto relative z-20">
          <ScrollReveal animation={config.timelineAnimation || 'fade-up'}>
            <div className="text-center mb-16 space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest opacity-60">Lịch Trình</span>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primaryColor }}>
                Chương Trình Sự Kiện
              </h2>
            </div>
          </ScrollReveal>

          <div className="relative border-l-2 border-dashed ml-4 sm:ml-32 space-y-10" style={{ borderColor: primaryColor }}>
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
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: secondaryColor }}>
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
      )}

      {/* Photo Gallery with Lightbox */}
      {gallery.length > 0 && (
        <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto relative z-20">
          <ScrollReveal animation={config.galleryAnimation || 'fade-up'}>
            <div className="text-center mb-16 space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest opacity-60">Album Ảnh</span>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primaryColor }}>
                Khoảnh Khắc Kỷ Niệm
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {gallery.map((img, idx) => (
              <ScrollReveal 
                key={img.id || idx} 
                animation={img.animation || 'zoom-in'} 
                delay={idx * 80}
              >
                <div
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-md cursor-pointer bg-gray-100 transition-transform duration-500 hover:-translate-y-1"
                >
                  <img
                    src={img.url}
                    alt={img.caption || 'Gallery'}
                    onError={(e) => { e.target.src = FALLBACK_HERO; }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-xs font-medium">{img.caption || 'Nhấp để xem'}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
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
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
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

      {/* Extra Sections (Thank You, VietQR, Q&A, Custom) */}
      {extraSections.map((sec, idx) => {
        // VietQR Code auto-generated link
        const vietQrUrl = sec.qrBank?.qrImageUrl 
          ? sec.qrBank.qrImageUrl 
          : sec.qrBank?.accountNumber 
            ? `https://img.vietqr.io/image/${encodeURIComponent(sec.qrBank.bankName || 'MB')}-${encodeURIComponent(sec.qrBank.accountNumber)}-compact2.jpg?accountName=${encodeURIComponent(sec.qrBank.accountHolder || '')}&amount=0`
            : null;

        return (
          <section key={sec.id || idx} className="py-20 px-4 sm:px-6 max-w-4xl mx-auto relative z-20">
            <ScrollReveal animation={sec.animation || 'fade-up'}>
              {/* Type: Thank You */}
              {sec.type === 'thankYou' && (
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100 text-center space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-rose-50 text-rose-600">
                    <HeartHandshake className="w-4 h-4" />
                    <span>{sec.subtitle || 'Tri Ân & Cảm Ơn'}</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primaryColor }}>
                    {sec.title || 'Lời Cảm Ơn'}
                  </h2>
                  {sec.imageUrl && (
                    <img
                      src={sec.imageUrl}
                      alt="Thank you"
                      className="max-h-64 w-auto object-cover rounded-2xl mx-auto shadow-md"
                    />
                  )}
                  <p className="text-base sm:text-lg opacity-85 leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
                    {sec.content || 'Cảm ơn bạn đã luôn đồng hành cùng chúng mình!'}
                  </p>
                </div>
              )}

              {/* Type: VietQR Gift Box */}
              {sec.type === 'giftQr' && (
                <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl border border-amber-100 text-center space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-50 text-amber-700">
                    <QrCode className="w-4 h-4" />
                    <span>Hộp Quà Chúc Mừng</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    {sec.title || 'Gửi Quà Mừng & Chúc Phúc'}
                  </h2>
                  {sec.subtitle && (
                    <p className="text-sm text-gray-500 max-w-md mx-auto">{sec.subtitle}</p>
                  )}

                  <div className="max-w-md mx-auto p-6 bg-amber-50/40 rounded-2xl border border-amber-200/60 space-y-4">
                    {vietQrUrl && (
                      <div className="bg-white p-3 rounded-2xl inline-block shadow-md mx-auto border">
                        <img
                          src={vietQrUrl}
                          alt="VietQR code"
                          className="w-56 h-auto object-contain mx-auto rounded-lg"
                        />
                      </div>
                    )}

                    <div className="space-y-1 text-sm text-left bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Ngân hàng:</span>
                        <span className="font-bold text-gray-800">{sec.qrBank?.bankName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs">Số tài khoản:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-gray-900">{sec.qrBank?.accountNumber || 'N/A'}</span>
                          {sec.qrBank?.accountNumber && (
                            <button
                              type="button"
                              onClick={() => handleCopyStk(sec.qrBank.accountNumber)}
                              className="text-xs p-1 text-gray-500 hover:text-amber-600 rounded"
                              title="Sao chép số tài khoản"
                            >
                              {copiedStk ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Chủ tài khoản:</span>
                        <span className="font-bold uppercase text-gray-800">{sec.qrBank?.accountHolder || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Type: Q&A Accordion */}
              {sec.type === 'qa' && (
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-50 text-blue-600">
                      <HelpCircle className="w-4 h-4" />
                      <span>Hỏi Đáp</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primaryColor }}>
                      {sec.title || 'Câu Hỏi Thường Gặp'}
                    </h2>
                    {sec.subtitle && (
                      <p className="text-sm opacity-70 max-w-md mx-auto">{sec.subtitle}</p>
                    )}
                  </div>

                  <div className="space-y-3 pt-4">
                    {(sec.items || []).map((item, qIdx) => {
                      const isOpen = openQaIndex[`${sec.id || idx}-${qIdx}`];
                      return (
                        <div
                          key={qIdx}
                          className="border border-gray-200/80 rounded-2xl overflow-hidden bg-white/90 shadow-sm transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => toggleQa(sec.id || idx, qIdx)}
                            className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 font-bold text-sm text-gray-800 hover:bg-gray-50/70"
                          >
                            <span>{item.question}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Type: Custom block */}
              {sec.type === 'custom' && (
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100 text-center space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-700">
                    <FileText className="w-4 h-4" />
                    <span>{sec.subtitle || 'Thông Báo'}</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primaryColor }}>
                    {sec.title || 'Nội Dung Tùy Biến'}
                  </h2>
                  {sec.imageUrl && (
                    <img
                      src={sec.imageUrl}
                      alt={sec.title}
                      className="max-h-72 w-auto object-cover rounded-2xl mx-auto shadow-md"
                    />
                  )}
                  {sec.content && (
                    <p className="text-base opacity-85 leading-relaxed max-w-2xl mx-auto whitespace-pre-line text-left sm:text-center">
                      {sec.content}
                    </p>
                  )}
                </div>
              )}
            </ScrollReveal>
          </section>
        );
      })}

      {/* RSVP Section */}
      {rsvp?.enabled && (
        <section id="rsvp-section" className="py-24 px-4 sm:px-6 max-w-2xl mx-auto relative z-20">
          <ScrollReveal animation={rsvp.animation || 'fade-up'}>
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl border border-gray-100">
              <div className="text-center mb-8 space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest opacity-60">Xác Nhận Tham Dự</span>
                <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primaryColor }}>
                  Gửi Lời Phản Hồi
                </h2>
                {rsvp.note && (
                  <p className="text-xs text-gray-500 max-w-md mx-auto pt-1">{rsvp.note}</p>
                )}
              </div>

              {rsvpSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-500 animate-bounce" />
                  <h3 className="text-xl font-bold text-gray-900">Cảm ơn bạn đã phản hồi!</h3>
                  <p className="text-sm text-gray-600">
                    Thông tin tham dự của bạn đã được ghi nhận. Chúng mình rất mong chờ được đón tiếp bạn!
                  </p>
                  <button
                    type="button"
                    onClick={() => setRsvpSubmitted(false)}
                    className="mt-4 text-xs font-semibold underline text-gray-500 hover:text-gray-800"
                  >
                    Gửi phản hồi khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Họ và tên của bạn *
                    </label>
                    <input
                      type="text"
                      required
                      value={rsvpForm.guestName}
                      onChange={(e) => setRsvpForm({ ...rsvpForm, guestName: e.target.value })}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white text-gray-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={rsvpForm.phone}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, phone: e.target.value })}
                        placeholder="0912 345 678"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Số lượng khách
                      </label>
                      <select
                        value={rsvpForm.numberOfGuests}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, numberOfGuests: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white text-gray-900"
                      >
                        <option value="1">1 người</option>
                        {rsvp.allowPlusOnes !== false && (
                          <>
                            <option value="2">2 người (Đi cùng người thương)</option>
                            <option value="3">3 người</option>
                            <option value="4">Cả gia đình (4+ người)</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Bạn sẽ tham dự chứ?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRsvpForm({ ...rsvpForm, attendingStatus: 'attending' })}
                        className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
                          rsvpForm.attendingStatus === 'attending'
                            ? 'border-transparent text-white shadow-md'
                            : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                        style={{
                          backgroundColor: rsvpForm.attendingStatus === 'attending' ? primaryColor : undefined
                        }}
                      >
                        ✓ Chắc chắn tham dự
                      </button>
                      <button
                        type="button"
                        onClick={() => setRsvpForm({ ...rsvpForm, attendingStatus: 'declined' })}
                        className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
                          rsvpForm.attendingStatus === 'declined'
                            ? 'border-transparent bg-gray-700 text-white shadow-md'
                            : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        ✕ Rất tiếc không thể
                      </button>
                    </div>
                  </div>

                  {rsvp.allowDietaryNotes && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Ghi chú ăn kiêng (nếu có)
                      </label>
                      <input
                        type="text"
                        value={rsvpForm.dietaryNotes}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, dietaryNotes: e.target.value })}
                        placeholder="Ăn chay, dị ứng hải sản..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white text-gray-900"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Lời chúc gửi đến chúng mình
                    </label>
                    <textarea
                      rows={2}
                      value={rsvpForm.wishes}
                      onChange={(e) => setRsvpForm({ ...rsvpForm, wishes: e.target.value })}
                      placeholder="Gửi lời chúc tốt đẹp nhất..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white text-gray-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={rsvpSubmitting}
                    className="w-full py-3.5 rounded-xl font-bold text-white shadow-xl hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {rsvpSubmitting ? (
                      <span>Đang gửi...</span>
                    ) : (
                      <>
                        <span>Gửi Phản Hồi Tham Dự</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Guestbook Wall */}
      {wishes?.enabled && (
        <section className="py-24 px-4 sm:px-6 max-w-4xl mx-auto relative z-20">
          <ScrollReveal animation={wishes.animation || 'fade-up'}>
            <div className="text-center mb-16 space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest opacity-60">Lưu Niệm</span>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primaryColor }}>
                {wishes.title || 'Sổ Lưu Bút & Lời Chúc'}
              </h2>
              <p className="text-sm opacity-75 max-w-md mx-auto">
                {wishes.subtitle || 'Hãy để lại những lời chúc yêu thương nhất'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Form */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                  <MessageSquareHeart className="w-5 h-5 text-rose-500" />
                  <span>Để lại lời chúc của bạn</span>
                </h3>
                <form onSubmit={handleGuestbookSubmit} className="space-y-3">
                  <input
                    type="text"
                    required
                    value={guestbookForm.senderName}
                    onChange={(e) => setGuestbookForm({ ...guestbookForm, senderName: e.target.value })}
                    placeholder="Tên của bạn *"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white text-gray-900"
                  />
                  <textarea
                    required
                    rows={3}
                    value={guestbookForm.message}
                    onChange={(e) => setGuestbookForm({ ...guestbookForm, message: e.target.value })}
                    placeholder="Viết lời chúc tại đây... *"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white text-gray-900"
                  />
                  <button
                    type="submit"
                    disabled={guestbookSubmitting}
                    className="w-full py-2.5 rounded-xl font-bold text-white text-sm shadow-md transition-all hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {guestbookSubmitting ? 'Đang gửi...' : 'Gửi Lời Chúc'}
                  </button>
                </form>
              </div>

              {/* List */}
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 no-scrollbar">
                {guestbookList.map((entry, idx) => (
                  <div key={idx} className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-gray-100 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-gray-900">{entry.senderName}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(entry.createdAtUtc).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed italic">"{entry.message}"</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Footer of Landing Page */}
      <footer className="py-12 px-4 text-center text-xs opacity-60 border-t border-gray-200/50 relative z-20">
        <p className="font-medium">
          {hero.title || 'Minh & Linh'} • Forever & Always
        </p>
        <p className="mt-1 text-[11px] opacity-75">
          Created with Motion Landing Page Builder
        </p>
      </footer>
    </div>
  );
};

export default LandingPageRenderer;
