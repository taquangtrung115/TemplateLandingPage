import React, { useState, useEffect } from 'react';
import { MessageSquareHeart } from 'lucide-react';
import ScrollReveal from '../../common/ScrollReveal';
import { interactionApi } from '../../../api/interactionApi';

/**
 * @param {Object} props
 * @param {Object} props.wishes
 * @param {string} props.primaryColor
 * @param {string|null} props.customizationId
 * @param {boolean} props.isHighlighted
 */
export const WishesSection = React.memo(function WishesSection({
  wishes = {},
  primaryColor = '#e11d48',
  customizationId = null,
  isHighlighted = false,
}) {
  const [guestbookList, setGuestbookList] = useState([
    {
      senderName: 'Gia đình & Bạn bè',
      message: 'Chúc mừng ngày chung đôi hạnh phúc trọn vẹn, trăm năm đầu bạc răng long!',
      createdAtUtc: new Date().toISOString(),
    },
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

  if (wishes?.enabled === false) return null;

  const handleGuestbookSubmit = async (e) => {
    e.preventDefault();
    if (!guestbookForm.senderName.trim() || !guestbookForm.message.trim()) return;

    setGuestbookSubmitting(true);
    const newEntry = {
      senderName: guestbookForm.senderName,
      message: guestbookForm.message,
      createdAtUtc: new Date().toISOString(),
    };

    try {
      if (customizationId) {
        await interactionApi.submitGuestbook({
          customizationId,
          ...guestbookForm,
        });
      }
      setGuestbookList((prev) => [newEntry, ...prev]);
      setGuestbookForm({ senderName: '', message: '' });
    } catch {
      setGuestbookList((prev) => [newEntry, ...prev]);
      setGuestbookForm({ senderName: '', message: '' });
    } finally {
      setGuestbookSubmitting(false);
    }
  };

  return (
    <section
      className={`py-24 px-4 sm:px-6 max-w-4xl mx-auto relative z-20 transition-all duration-300 ${
        isHighlighted ? 'animate-live-edit rounded-3xl' : ''
      }`}
    >
      <ScrollReveal animation={wishes?.animation || 'fade-up'}>
        <div className="text-center mb-16 space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest opacity-60">Lưu Niệm</span>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primaryColor }}>
            {wishes?.title || 'Sổ Lưu Bút & Lời Chúc'}
          </h2>
          <p className="text-sm opacity-75 max-w-md mx-auto">
            {wishes?.subtitle || 'Hãy để lại những lời chúc yêu thương nhất'}
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
              <div
                key={idx}
                className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-gray-100 text-left"
              >
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
  );
});

export default WishesSection;
