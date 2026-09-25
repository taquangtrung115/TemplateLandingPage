import React, { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import ScrollReveal from '../../common/ScrollReveal';
import { interactionApi } from '../../../api/interactionApi';
import { getSafeLinkUrl } from '../../../utils/safeUrl';

const createEmptyRsvpForm = () => ({
  guestName: '',
  email: '',
  phone: '',
  attendingStatus: 'attending',
  numberOfGuests: 1,
  dietaryNotes: '',
  wishes: '',
});

/**
 * @param {Object} props
 * @param {Object} props.rsvp
 * @param {string} props.primaryColor
 * @param {string|null} props.customizationId
 * @param {string|null} props.customizationVersionId
 * @param {boolean} props.isPreview
 * @param {boolean} props.exportMode
 * @param {string|null} props.responseUrl
 * @param {boolean} props.isHighlighted
 */
export const RsvpSection = React.memo(function RsvpSection({
  rsvp = {},
  primaryColor = '#e11d48',
  customizationId = null,
  customizationVersionId = null,
  isPreview = false,
  exportMode = false,
  responseUrl = null,
  isHighlighted = false,
}) {
  const [rsvpForm, setRsvpForm] = useState(createEmptyRsvpForm);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const responseLink = getSafeLinkUrl(responseUrl);
  const canSubmit = !isPreview && rsvp?.enabled === true && Boolean(customizationId && customizationVersionId);

  if ((isPreview && rsvp?.enabled === false) || (!isPreview && rsvp?.enabled !== true)) return null;

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    if (rsvpSubmitting) return;
    if (!rsvpForm.guestName.trim()) return;
    if (!canSubmit) return;

    setRsvpSubmitting(true);
    setSubmitError('');
    try {
      await interactionApi.submitRsvp({
        customizationId,
        customizationVersionId,
        ...rsvpForm,
        numberOfGuests: parseInt(rsvpForm.numberOfGuests, 10) || 1,
      });
      setRsvpSubmitted(true);
    } catch {
      setSubmitError('Không gửi được phản hồi. Thông tin bạn đã nhập vẫn được giữ lại, vui lòng thử lại.');
    } finally {
      setRsvpSubmitting(false);
    }
  };

  return (
    <section
      id="rsvp-section"
      className={`py-24 px-4 sm:px-6 max-w-2xl mx-auto relative z-20 transition-all duration-300 ${
        isHighlighted ? 'animate-live-edit rounded-3xl' : ''
      }`}
    >
      <ScrollReveal animation={rsvp?.animation || 'fade-up'}>
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl border border-gray-100">
          <div className="text-center mb-8 space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest opacity-60">Xác Nhận Tham Dự</span>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: primaryColor }}>
              Gửi Lời Phản Hồi
            </h2>
            {rsvp?.note && (
              <p className="text-xs text-gray-500 max-w-md mx-auto pt-1">{rsvp.note}</p>
            )}
          </div>

          {!canSubmit ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center text-sm text-amber-900" role="status">
              <p>{exportMode ? 'Phản hồi chỉ nhận trên trang công khai của phiên bản đã xuất bản.' : 'Bản xem trước không gửi phản hồi.'}</p>
              {responseLink ? (
                <a href={responseLink} className="inline-block mt-2 font-semibold underline" target="_blank" rel="noopener noreferrer">
                  Mở trang công khai để phản hồi
                </a>
              ) : (
                <p className="mt-1 text-xs">Phản hồi hiện chưa khả dụng trên trang này.</p>
              )}
            </div>
          ) : rsvpSubmitted ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-500 animate-bounce" />
              <h3 className="text-xl font-bold text-gray-900">Cảm ơn bạn đã phản hồi!</h3>
              <p className="text-sm text-gray-600">
                Thông tin tham dự của bạn đã được ghi nhận. Chúng mình rất mong chờ được đón tiếp bạn!
              </p>
              <button
                type="button"
                onClick={() => {
                  setRsvpForm(createEmptyRsvpForm());
                  setRsvpSubmitted(false);
                }}
                className="mt-4 text-xs font-semibold underline text-gray-500 hover:text-gray-800"
              >
                Gửi phản hồi khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-4 text-left">
              {submitError && (
                <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700" role="alert">
                  {submitError}
                </p>
              )}
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
                    {rsvp?.allowPlusOnes !== false && (
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
                      backgroundColor: rsvpForm.attendingStatus === 'attending' ? primaryColor : undefined,
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

              {rsvp?.allowDietaryNotes && (
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
  );
});

export default RsvpSection;
