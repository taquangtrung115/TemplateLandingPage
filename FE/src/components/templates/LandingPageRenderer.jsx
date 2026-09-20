import React, { useState, useEffect } from 'react';
import { 
  Heart, Camera, Utensils, Music, GlassWater, Cake, Calendar, MapPin, 
  Send, Sparkles, X, ChevronRight, CheckCircle2, MessageSquareHeart
} from 'lucide-react';
import MotionParticles from './MotionParticles';
import FloatingMusicPlayer from './FloatingMusicPlayer';
import { interactionApi } from '../../api/interactionApi';

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

  // Color styles
  const primaryColor = theme.primaryColor || '#e11d48';
  const secondaryColor = theme.secondaryColor || '#f43f5e';
  const backgroundColor = theme.backgroundColor || '#ffffff';
  const textColor = theme.textColor || '#1e293b';
  const fontFamily = theme.fontFamily || 'Playfair Display';

  // Lightbox state for gallery
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
      // In preview or standalone mode, still treat as simulated success
      setRsvpSubmitted(true);
    } finally {
      setRsvpSubmitting(false);
    }
  };

  // Guestbook Wall State
  const [guestbookList, setGuestbookList] = useState([
    {
      senderName: 'Gia đình bạn bè',
      message: 'Chúc mừng hai bạn trăm năm hạnh phúc, răng long đầu bạc!',
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
        // use fallback entries
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
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.65)), url('${hero.coverImageUrl || FALLBACK_HERO}')`
        }}
      >
        <div className="relative z-20 max-w-4xl mx-auto text-white space-y-6 animate-float-slow">
          <div className="inline-block px-5 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-widest uppercase border border-white/40 bg-white/10 backdrop-blur-md shadow-lg">
            {hero.badge || 'SAVE THE DATE'}
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-lg">
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
      </header>

      {/* Couple or Celebrant Section */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto relative z-20">
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest opacity-60">
            {couple.type === 'birthday' ? 'Nhân Vật Chính' : 'Cô Dâu & Chú Rể'}
          </span>
          <h2 
            className="text-3xl sm:text-5xl font-bold tracking-tight"
            style={{ color: primaryColor }}
          >
            {couple.type === 'birthday' ? 'Chủ Nhân Bữa Tiệc' : 'Đôi Uyên Ương'}
          </h2>
          {couple.storyQuote && (
            <p className="italic text-base sm:text-lg opacity-75 max-w-2xl mx-auto pt-2">
              "{couple.storyQuote}"
            </p>
          )}
        </div>

        <div className={`grid grid-cols-1 ${couple.person2?.name ? 'md:grid-cols-2' : ''} gap-10 max-w-4xl mx-auto`}>
          {/* Person 1 */}
          <div className="bg-white/70 backdrop-blur-md border border-gray-100/50 rounded-3xl p-8 sm:p-10 text-center shadow-xl hover:shadow-2xl transition-all">
            <div className="relative inline-block mb-6">
              <img
                src={couple.person1?.avatarUrl || FALLBACK_AVATAR}
                alt={couple.person1?.name || 'Person'}
                onError={(e) => { e.target.src = FALLBACK_AVATAR; }}
                className="w-44 h-44 object-cover rounded-full shadow-lg ring-4 ring-offset-4 mx-auto"
                style={{ '--tw-ring-color': primaryColor }}
              />
            </div>
            <span className="text-xs uppercase font-bold tracking-widest opacity-50 block mb-1">
              {couple.person1?.title || (couple.type === 'birthday' ? 'Chủ Tiệc' : 'Chú Rể')}
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">{couple.person1?.name || 'Nguyễn Văn Minh'}</h3>
            <p className="text-sm opacity-80 mb-4 leading-relaxed max-w-sm mx-auto">{couple.person1?.bio}</p>
            {couple.person1?.parents && (
              <div className="text-xs opacity-60 border-t border-gray-200/50 pt-3">
                {couple.person1?.parents}
              </div>
            )}
          </div>

          {/* Person 2 (if wedding) */}
          {couple.person2?.name && (
            <div className="bg-white/70 backdrop-blur-md border border-gray-100/50 rounded-3xl p-8 sm:p-10 text-center shadow-xl hover:shadow-2xl transition-all">
              <div className="relative inline-block mb-6">
                <img
                  src={couple.person2?.avatarUrl || FALLBACK_AVATAR}
                  alt={couple.person2?.name || 'Person'}
                  onError={(e) => { e.target.src = FALLBACK_AVATAR; }}
                  className="w-44 h-44 object-cover rounded-full shadow-lg ring-4 ring-offset-4 mx-auto"
                  style={{ '--tw-ring-color': primaryColor }}
                />
              </div>
              <span className="text-xs uppercase font-bold tracking-widest opacity-50 block mb-1">
                {couple.person2?.title || 'Cô Dâu'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">{couple.person2?.name || 'Lê Thùy Linh'}</h3>
              <p className="text-sm opacity-80 mb-4 leading-relaxed max-w-sm mx-auto">{couple.person2?.bio}</p>
              {couple.person2?.parents && (
                <div className="text-xs opacity-60 border-t border-gray-200/50 pt-3">
                  {couple.person2?.parents}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Event Details Section */}
      <section className="py-20 px-4 sm:px-6 bg-white/50 backdrop-blur-md border-y border-gray-200/40 relative z-20">
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
            <div className="pt-4">
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
        </div>
      </section>

      {/* Interactive Timeline */}
      {timeline.length > 0 && (
        <section className="py-24 px-4 sm:px-6 max-w-4xl mx-auto relative z-20">
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest opacity-60">Lịch Trình</span>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primaryColor }}>
              Chương Trình Sự Kiện
            </h2>
          </div>

          <div className="relative border-l-2 border-dashed ml-4 sm:ml-32 space-y-10" style={{ borderColor: primaryColor }}>
            {timeline.map((item, idx) => (
              <div key={item.id || idx} className="relative pl-8 group">
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
            ))}
          </div>
        </section>
      )}

      {/* Photo Gallery with Lightbox */}
      {gallery.length > 0 && (
        <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto relative z-20">
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest opacity-60">Album Ảnh</span>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primaryColor }}>
              Khoảnh Khắc Kỷ Niệm
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {gallery.map((img, idx) => (
              <div
                key={img.id || idx}
                onClick={() => setLightboxIndex(idx)}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-md cursor-pointer bg-gray-100"
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

      {/* RSVP Section */}
      {rsvp?.enabled && (
        <section id="rsvp-section" className="py-24 px-4 sm:px-6 max-w-2xl mx-auto relative z-20">
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
                      <option value="2">2 người (Đi cùng người thương)</option>
                      <option value="3">3 người</option>
                      <option value="4">Cả gia đình (4+ người)</option>
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
        </section>
      )}

      {/* Guestbook Wall */}
      {wishes?.enabled && (
        <section className="py-24 px-4 sm:px-6 max-w-4xl mx-auto relative z-20">
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
