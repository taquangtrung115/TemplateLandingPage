import React from 'react';
import { Mic, Linkedin, Twitter, Globe, Building2 } from 'lucide-react';

/**
 * SpeakersSection Component
 * Dành cho Landing Page Hội Nghị, Summit, Workshop công nghệ & AI
 * Hiển thị danh sách diễn giả nổi bật với ảnh avatar, chức vụ, công ty và bio tóm tắt.
 *
 * @param {Object} props
 * @param {Array} [props.speakers] Danh sách diễn giả
 * @param {string} [props.primaryColor='#2563eb'] Màu chủ đạo của sự kiện
 * @param {boolean} [props.isHighlighted=false] Trạng thái đang chỉnh sửa trên Sidebar
 */
export default function SpeakersSection({
  speakers = [],
  primaryColor = '#2563eb',
  isHighlighted = false,
}) {
  if (!speakers || speakers.length === 0) {
    return null;
  }

  return (
    <section
      data-testid="speakers-section"
      className={`py-20 px-4 relative transition-all duration-300 ${
        isHighlighted ? 'ring-4 ring-blue-500/40 bg-blue-50/10' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border"
            style={{
              borderColor: `${primaryColor}40`,
              color: primaryColor,
              backgroundColor: `${primaryColor}10`,
            }}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Keynote Speakers Lineup</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Gặp Gỡ Đội Ngũ Diễn Giả Hàng Đầu
          </h2>
          <p className="text-sm sm:text-base text-gray-400 font-normal max-w-xl mx-auto">
            Các chuyên gia, nhà khoa học và lãnh đạo công nghệ tiên phong chia sẻ tầm nhìn tương lai về trí tuệ nhân tạo.
          </p>
        </div>

        {/* Speakers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {speakers.map((speaker, idx) => (
            <div
              key={speaker.id || idx}
              className="group bg-gray-900/80 border border-gray-800/80 hover:border-gray-700 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Speaker Avatar */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-5 bg-gray-800 shadow-inner">
                  <img
                    src={
                      speaker.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80'
                    }
                    alt={speaker.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
                  {speaker.company && (
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] text-white font-medium">
                      <Building2 className="w-3 h-3 text-blue-400" />
                      <span className="truncate">{speaker.company}</span>
                    </div>
                  )}
                </div>

                {/* Speaker Info */}
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  {speaker.name}
                </h3>
                <p
                  className="text-xs font-semibold mt-1 tracking-wide uppercase"
                  style={{ color: primaryColor }}
                >
                  {speaker.role}
                </p>

                {speaker.bio && (
                  <p className="mt-3 text-xs text-gray-400 leading-relaxed line-clamp-3">
                    {speaker.bio}
                  </p>
                )}
              </div>

              {/* Social Links */}
              <div className="mt-5 pt-4 border-t border-gray-800/60 flex items-center gap-3 text-gray-400">
                <span className="p-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer">
                  <Linkedin className="w-3.5 h-3.5" />
                </span>
                <span className="p-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer">
                  <Twitter className="w-3.5 h-3.5" />
                </span>
                <span className="p-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer">
                  <Globe className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
