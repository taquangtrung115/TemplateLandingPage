import React from 'react';
import {
  HeartHandshake,
  QrCode,
  Copy,
  Check,
  HelpCircle,
  ChevronDown,
  FileText,
} from 'lucide-react';
import ScrollReveal from '../../common/ScrollReveal';
import { getSafeResourceUrl } from '../../../utils/safeUrl';

/**
 * @param {Object} props
 * @param {Array} props.extraSections
 * @param {string} props.primaryColor
 * @param {Object} props.openQaIndex
 * @param {Function} props.toggleQa
 * @param {boolean} props.copiedStk
 * @param {Function} props.handleCopyStk
 * @param {boolean} props.isHighlighted
 * @param {string|null} props.activeEditSection
 */
export const ExtraSections = React.memo(function ExtraSections({
  extraSections = [],
  primaryColor = '#e11d48',
  openQaIndex = {},
  toggleQa,
  copiedStk = false,
  handleCopyStk,
  isHighlighted = false,
  activeEditSection = null,
  exportMode = false,
}) {
  const visibleSections = extraSections.filter((sec) => sec.enabled !== false);
  if (visibleSections.length === 0) return null;

  return (
    <>
      {visibleSections.map((sec, idx) => {
        // Check highlight for this specific extra section or general extra
        const isSecHighlighted =
          isHighlighted ||
          activeEditSection === 'extra' ||
          activeEditSection === sec.id ||
          activeEditSection === `extra-${sec.id}`;

        // VietQR Code auto-generated link
        const vietQrUrlCandidate = sec.qrBank?.qrImageUrl
          ? sec.qrBank.qrImageUrl
          : sec.qrBank?.accountNumber
          ? `https://img.vietqr.io/image/${encodeURIComponent(
              sec.qrBank.bankName || 'MB'
            )}-${encodeURIComponent(sec.qrBank.accountNumber)}-compact2.jpg?accountName=${encodeURIComponent(
              sec.qrBank.accountHolder || ''
            )}&amount=0`
          : null;
        const vietQrUrl = getSafeResourceUrl(vietQrUrlCandidate);
        const sectionImageUrl = getSafeResourceUrl(sec.imageUrl);
        const sectionAnchorId = typeof sec.id === 'string' && /^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(sec.id)
          ? sec.id
          : undefined;

        return (
          <section
            key={sec.id || idx}
            id={sectionAnchorId}
            className={`py-20 px-4 sm:px-6 max-w-4xl mx-auto relative z-20 transition-all duration-300 ${
              isSecHighlighted ? 'animate-live-edit rounded-3xl' : ''
            }`}
          >
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
                  {sectionImageUrl && (
                    <img
                      src={sectionImageUrl}
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
                          <span className="font-mono font-bold text-gray-900">
                            {sec.qrBank?.accountNumber || 'N/A'}
                          </span>
                          {!exportMode && sec.qrBank?.accountNumber && (
                            <button
                              type="button"
                              onClick={() => handleCopyStk?.(sec.qrBank.accountNumber)}
                              className="text-xs p-1 text-gray-500 hover:text-amber-600 rounded"
                              title="Sao chép số tài khoản"
                            >
                              {copiedStk ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Chủ tài khoản:</span>
                        <span className="font-bold uppercase text-gray-800">
                          {sec.qrBank?.accountHolder || 'N/A'}
                        </span>
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
                      const isOpen = exportMode || openQaIndex[`${sec.id || idx}-${qIdx}`];
                      return (
                        <div
                          key={qIdx}
                          className="border border-gray-200/80 rounded-2xl overflow-hidden bg-white/90 shadow-sm transition-all"
                        >
                          {exportMode ? (
                            <div className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 font-bold text-sm text-gray-800">
                              <span>{item.question}</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleQa?.(sec.id || idx, qIdx)}
                              className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 font-bold text-sm text-gray-800 hover:bg-gray-50/70"
                            >
                            <span>{item.question}</span>
                            <ChevronDown
                              className={`w-4 h-4 text-gray-500 transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                            </button>
                          )}
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
                  {sectionImageUrl && (
                    <img
                      src={sectionImageUrl}
                      alt={sec.title || 'Custom image'}
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
    </>
  );
});

export default ExtraSections;
