import React from 'react';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';
import { getSafeCssColor, getSafeLinkUrl } from '../../../utils/safeUrl';

/**
 * ServicesSection Component
 * Dành cho Landing Page Phòng Khám Nha Khoa, Trung Tâm Y Tế & Chăm Sóc Sức Khỏe
 * Hiển thị danh mục dịch vụ điều trị (Veneers, Bọc răng sứ, Tẩy trắng, Implant)
 * kèm quy trình điều trị chuẩn y khoa và liên kết đặt hẹn.
 *
 * @param {Object} props
 * @param {Array} [props.servicesGrid] Danh sách 4 dịch vụ nha khoa
 * @param {Array} [props.treatmentProcess] Quy trình 4 bước điều trị
 * @param {Object} [props.booking] Cấu hình đặt hẹn tư vấn
 * @param {string} [props.primaryColor='#0ea5e9'] Màu chủ đạo
 * @param {boolean} [props.isHighlighted=false] Trạng thái đang chỉnh sửa
 */
export default function ServicesSection({
  servicesGrid = [],
  treatmentProcess = [],
  booking = {},
  headings = {},
  primaryColor = '#0ea5e9',
  isHighlighted = false,
}) {
  primaryColor = getSafeCssColor(primaryColor, '#0ea5e9');
  const bookingCtaUrl = getSafeLinkUrl(booking?.ctaUrl);
  const hasServices = Array.isArray(servicesGrid) && servicesGrid.length > 0;
  const canShowBooking = booking?.enabled !== false && Boolean(bookingCtaUrl);

  if (!hasServices && !canShowBooking) return null;

  return (
    <section
      data-testid="services-section"
      className={`py-20 px-4 relative transition-all duration-300 ${
        isHighlighted ? 'ring-4 ring-sky-500/40 bg-sky-50/20' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border"
            style={{
              borderColor: `${primaryColor}40`,
              color: primaryColor,
              backgroundColor: `${primaryColor}10`,
            }}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{headings?.eyebrow || 'Dịch vụ'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900">
            {headings?.title || 'Giải pháp dành cho bạn'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-normal max-w-xl mx-auto">
            {headings?.subtitle || 'Khám phá các dịch vụ và chọn lựa phù hợp với nhu cầu của bạn.'}
          </p>
        </div>

        {/* 4 Services Grid */}
        {hasServices && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {servicesGrid.map((srv, idx) => {
            const ctaUrl = getSafeLinkUrl(srv.ctaUrl);
            return (
              <div
                key={srv.id || idx}
                className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
              <div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                  }}
                >
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-sky-600 transition-colors">
                  {srv.name}
                </h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                    Chi phí từ
                  </span>
                  <span className="text-sm font-extrabold text-gray-900" style={{ color: primaryColor }}>
                    {srv.priceFrom || 'Liên hệ'}
                  </span>
                </div>
                {ctaUrl && (
                  <a
                    href={ctaUrl}
                    target={/^https?:/i.test(ctaUrl) ? '_blank' : undefined}
                    rel={/^https?:/i.test(ctaUrl) ? 'noopener noreferrer' : undefined}
                    aria-label={`${srv.ctaText || 'Tìm hiểu thêm'}: ${srv.name || ''}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-sky-700"
                  >
                    <span>{srv.ctaText || 'Tìm hiểu thêm'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
              </div>
            );
          })}
        </div>}

        {/* Treatment Process Steps (4 steps) */}
        {treatmentProcess.length > 0 && (
          <div className="mb-20 bg-gray-50/80 rounded-3xl p-8 sm:p-12 border border-gray-100">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span
                className="text-xs font-bold uppercase tracking-widest block mb-1"
                style={{ color: primaryColor }}
              >
                {headings?.processEyebrow || 'Quy trình'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {headings?.processTitle || 'Các bước triển khai'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {treatmentProcess.map((step, idx) => (
                <div key={idx} className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <span
                    className="text-4xl font-black block mb-3 opacity-20"
                    style={{ color: primaryColor }}
                  >
                    {step.step || `0${idx + 1}`}
                  </span>
                  <h4 className="text-base font-bold text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appointment Booking Box */}
        {canShowBooking && (
          <div
            id="booking-form-box"
            className="rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, #0369a1 100%)`,
            }}
          >
            <div className="max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
                {booking.title || 'Đặt Lịch Hẹn Tư Vấn Miễn Phí'}
              </h3>
              <p className="text-sm opacity-90 mb-8 font-light leading-relaxed">
                {booking.description || 'Xem lựa chọn phù hợp và liên hệ qua đường dẫn đặt lịch.'}
              </p>

              {bookingCtaUrl && (
                <a
                  href={bookingCtaUrl}
                  target={/^https?:/i.test(bookingCtaUrl) ? '_blank' : undefined}
                  rel={/^https?:/i.test(bookingCtaUrl) ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-950 text-white font-bold text-xs shadow-lg hover:bg-black transition-all"
                >
                  <span>{booking.ctaText || 'Đặt lịch tư vấn'}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
