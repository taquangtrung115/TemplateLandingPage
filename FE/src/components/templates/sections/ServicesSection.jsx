import React, { useState } from 'react';
import { Stethoscope, Sparkles, CheckCircle2, Calendar, Phone, Clock, ArrowRight } from 'lucide-react';

/**
 * ServicesSection Component
 * Dành cho Landing Page Phòng Khám Nha Khoa, Trung Tâm Y Tế & Chăm Sóc Sức Khỏe
 * Hiển thị danh mục dịch vụ điều trị (Veneers, Bọc răng sứ, Tẩy trắng, Implant)
 * kèm quy trình điều trị chuẩn y khoa và form đặt hẹn tư vấn nhanh.
 *
 * @param {Object} props
 * @param {Array} [props.servicesGrid] Danh sách 4 dịch vụ nha khoa
 * @param {Array} [props.treatmentProcess] Quy trình 4 bước điều trị
 * @param {Object} [props.booking] Cấu hình đặt hẹn tư vấn
 * @param {string} [props.primaryColor='#0ea5e9'] Màu chủ đạo
 * @param {boolean} [props.isHighlighted=false] Trạng thái đang chỉnh sửa
 * @param {Function} [props.onBookService] Callback khi đặt lịch
 */
export default function ServicesSection({
  servicesGrid = [],
  treatmentProcess = [],
  booking = {},
  primaryColor = '#0ea5e9',
  isHighlighted = false,
  onBookService,
}) {
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', service: '' });
  const [isBooked, setIsBooked] = useState(false);

  if (!servicesGrid || servicesGrid.length === 0) {
    return null;
  }

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone) return;
    setIsBooked(true);
    onBookService?.(bookingForm);
  };

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
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Chuyên Khoa Răng Hàm Mặt Cao Cấp</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900">
            Dịch Vụ Nha Khoa Thẩm Mỹ Toàn Diện
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-normal max-w-xl mx-auto">
            Công nghệ Scan 3D không xâm lấn, bảo tồn men răng tối đa cùng đội ngũ bác sĩ chuyên khoa đầu ngành.
          </p>
        </div>

        {/* 4 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {servicesGrid.map((srv, idx) => (
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
                <button
                  type="button"
                  onClick={() => {
                    setBookingForm((prev) => ({ ...prev, service: srv.name }));
                    document.getElementById('booking-form-box')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-2 rounded-xl text-gray-400 hover:text-white transition-colors"
                  style={{ ':hover': { backgroundColor: primaryColor } }}
                >
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Treatment Process Steps (4 steps) */}
        {treatmentProcess.length > 0 && (
          <div className="mb-20 bg-gray-50/80 rounded-3xl p-8 sm:p-12 border border-gray-100">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span
                className="text-xs font-bold uppercase tracking-widest block mb-1"
                style={{ color: primaryColor }}
              >
                Tiêu Chuẩn Châu Âu
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Quy Trình 4 Bước Điều Trị Nhẹ Nhàng
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
        {booking?.enabled !== false && (
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
                Nhận ngay phác đồ nụ cười 3D Digital Smile Design và bảng dự toán chi phí chi tiết từ bác sĩ chuyên khoa.
              </p>

              {isBooked ? (
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                  <div>
                    <h5 className="font-bold text-sm">Đặt lịch thành công!</h5>
                    <p className="text-xs opacity-90">Bác sĩ tư vấn sẽ gọi lại cho bạn trong vòng 15 phút.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Họ và tên của bạn"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-white text-gray-900 text-xs font-medium focus:outline-none shadow-sm"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Số điện thoại"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-white text-gray-900 text-xs font-medium focus:outline-none shadow-sm"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gray-950 text-white font-bold text-xs shadow-lg hover:bg-black transition-all"
                  >
                    Gửi Thông Tin
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
