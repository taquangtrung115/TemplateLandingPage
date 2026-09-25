import React, { useEffect, useState } from 'react';
import { MessageSquareHeart } from 'lucide-react';
import ScrollReveal from '../../common/ScrollReveal';
import { interactionApi } from '../../../api/interactionApi';
import { getSafeLinkUrl } from '../../../utils/safeUrl';

const PAGE_SIZE = 8;

/**
 * @param {Object} props
 * @param {Object} props.wishes
 * @param {string} props.primaryColor
 * @param {string|null} props.customizationId
 * @param {string|null} props.customizationVersionId
 * @param {boolean} props.isPreview
 * @param {boolean} props.exportMode
 * @param {string|null} props.responseUrl
 * @param {boolean} props.isHighlighted
 */
export const WishesSection = React.memo(function WishesSection({
  wishes = {},
  primaryColor = '#e11d48',
  customizationId = null,
  customizationVersionId = null,
  isPreview = false,
  exportMode = false,
  responseUrl = null,
  isHighlighted = false,
}) {
  const [guestbookList, setGuestbookList] = useState([]);
  const [guestbookForm, setGuestbookForm] = useState({ senderName: '', message: '' });
  const [guestbookSubmitting, setGuestbookSubmitting] = useState(false);
  const [guestbookLoading, setGuestbookLoading] = useState(false);
  const [guestbookError, setGuestbookError] = useState('');
  const [guestbookPage, setGuestbookPage] = useState(1);
  const [guestbookTotal, setGuestbookTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const responseLink = getSafeLinkUrl(responseUrl);
  const canInteract = !isPreview && wishes?.enabled === true && Boolean(customizationId && customizationVersionId);

  useEffect(() => {
    if (!canInteract || wishes?.enabled === false) {
      setGuestbookList([]);
      setGuestbookTotal(0);
      setGuestbookError('');
      return undefined;
    }

    let isCurrentRequest = true;
    const fetchGuestbook = async () => {
      setGuestbookLoading(true);
      setGuestbookError('');
      try {
        const result = await interactionApi.getGuestbook(customizationId, {
          versionId: customizationVersionId,
          page: guestbookPage,
          pageSize: PAGE_SIZE,
        });
        const data = Array.isArray(result?.data) ? result.data : [];
        if (isCurrentRequest) {
          setGuestbookList(data);
          setGuestbookTotal(Number.isFinite(Number(result?.total)) ? Number(result.total) : data.length);
        }
      } catch {
        if (isCurrentRequest) {
          setGuestbookList([]);
          setGuestbookTotal(0);
          setGuestbookError('Không tải được lời chúc. Vui lòng thử lại.');
        }
      } finally {
        if (isCurrentRequest) setGuestbookLoading(false);
      }
    };

    fetchGuestbook();
    return () => {
      isCurrentRequest = false;
    };
  }, [canInteract, customizationId, customizationVersionId, guestbookPage, refreshKey, wishes?.enabled]);

  if ((isPreview && wishes?.enabled === false) || (!isPreview && wishes?.enabled !== true)) return null;

  const handleGuestbookSubmit = async (e) => {
    e.preventDefault();
    if (guestbookSubmitting || !canInteract) return;
    if (!guestbookForm.senderName.trim() || !guestbookForm.message.trim()) return;

    setGuestbookSubmitting(true);
    setGuestbookError('');
    try {
      await interactionApi.submitGuestbook({
        customizationId,
        customizationVersionId,
        ...guestbookForm,
      });
      setGuestbookForm({ senderName: '', message: '' });
      setGuestbookPage(1);
      setRefreshKey((current) => current + 1);
    } catch {
      setGuestbookError('Không gửi được lời chúc. Nội dung bạn đã nhập vẫn được giữ lại, vui lòng thử lại.');
    } finally {
      setGuestbookSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(guestbookTotal / PAGE_SIZE));

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
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <MessageSquareHeart className="w-5 h-5 text-rose-500" />
              <span>Để lại lời chúc của bạn</span>
            </h3>
            {canInteract ? (
              <form onSubmit={handleGuestbookSubmit} className="space-y-3">
                {guestbookError && (
                  <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700" role="alert">
                    {guestbookError}
                  </p>
                )}
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
                  className="w-full py-2.5 rounded-xl font-bold text-white text-sm shadow-md transition-all hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                  style={{ backgroundColor: primaryColor }}
                >
                  {guestbookSubmitting ? 'Đang gửi...' : 'Gửi Lời Chúc'}
                </button>
              </form>
            ) : (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center text-sm text-amber-900" role="status">
                <p>{exportMode ? 'Lời chúc chỉ nhận trên trang công khai của phiên bản đã xuất bản.' : 'Bản xem trước không gửi lời chúc.'}</p>
                {responseLink ? (
                  <a href={responseLink} className="inline-block mt-2 font-semibold underline" target="_blank" rel="noopener noreferrer">
                    Mở trang công khai để gửi lời chúc
                  </a>
                ) : (
                  <p className="mt-1 text-xs">Lời chúc hiện chưa khả dụng trên trang này.</p>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 no-scrollbar" aria-live="polite">
              {guestbookLoading ? (
                <p className="text-sm text-gray-500 text-center py-8">Đang tải lời chúc...</p>
              ) : guestbookError && guestbookList.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-rose-700">{guestbookError}</p>
                  <button
                    type="button"
                    onClick={() => setRefreshKey((current) => current + 1)}
                    className="mt-2 text-xs font-semibold underline"
                  >
                    Thử tải lại
                  </button>
                </div>
              ) : guestbookList.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Chưa có lời chúc nào.</p>
              ) : guestbookList.map((entry) => (
                <div
                  key={entry.id || `${entry.senderName}-${entry.createdAtUtc}-${entry.message}`}
                  className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-gray-100 text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-gray-900">{entry.senderName}</span>
                    <span className="text-[10px] text-gray-400">
                      {entry.createdAtUtc ? new Date(entry.createdAtUtc).toLocaleDateString('vi-VN') : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed italic">“{entry.message}”</p>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-xs">
                <button
                  type="button"
                  disabled={guestbookLoading || guestbookPage <= 1}
                  onClick={() => setGuestbookPage((page) => Math.max(1, page - 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
                >
                  Trước
                </button>
                <span className="text-gray-500">Trang {guestbookPage} / {totalPages}</span>
                <button
                  type="button"
                  disabled={guestbookLoading || guestbookPage >= totalPages}
                  onClick={() => setGuestbookPage((page) => Math.min(totalPages, page + 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
});

export default WishesSection;
