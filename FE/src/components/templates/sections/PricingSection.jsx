import React from 'react';
import { Check, Ticket, ArrowRight } from 'lucide-react';
import { getSafeCssColor, getSafeLinkUrl } from '../../../utils/safeUrl';

/**
 * PricingSection Component
 * Dành cho vé tham dự hội nghị (Summit Passes) hoặc gói dịch vụ SaaS
 * Hiển thị các hạng vé, giá bán, ưu đãi đi kèm và nút mua vé/đăng ký.
 *
 * @param {Object} props
 * @param {Array} [props.pricingTickets] Danh sách các hạng vé hội nghị
 * @param {Array} [props.pricingPackages] Danh sách các gói cước SaaS
 * @param {string} [props.primaryColor='#2563eb'] Màu chủ đạo
 * @param {boolean} [props.isHighlighted=false] Trạng thái đang chỉnh sửa
 */
export default function PricingSection({
  pricingTickets = [],
  pricingPackages = [],
  headings = {},
  primaryColor = '#2563eb',
  isHighlighted = false,
}) {
  primaryColor = getSafeCssColor(primaryColor, '#2563eb');
  const items = pricingTickets.length > 0 ? pricingTickets : pricingPackages;

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section
      data-testid="pricing-section"
      className={`py-20 px-4 relative transition-all duration-300 ${
        isHighlighted ? 'ring-4 ring-indigo-500/40 bg-indigo-50/10' : ''
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
            <Ticket className="w-3.5 h-3.5" />
            <span>{headings?.eyebrow || 'Dịch vụ & Gói'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            {headings?.title || 'Chọn lựa phù hợp với bạn'}
          </h2>
          <p className="text-sm sm:text-base text-gray-400 font-normal max-w-xl mx-auto">
            {headings?.subtitle || 'So sánh các lựa chọn và quyền lợi bên dưới.'}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className={`grid gap-8 max-w-5xl mx-auto ${
          items.length === 1
            ? 'grid-cols-1 max-w-md'
            : items.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-3'
        }`}>
          {items.map((item, idx) => {
            const isPopular = item.badge?.toLowerCase().includes('popular') || item.badge?.toLowerCase().includes('hot');
            const ctaUrl = getSafeLinkUrl(item.ctaUrl);

            return (
              <div
                key={item.id || idx}
                className={`relative rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between ${
                  isPopular
                    ? 'bg-gradient-to-b from-gray-900 to-gray-950 border-2 shadow-2xl scale-105 z-10'
                    : 'bg-gray-900/60 border border-gray-800/80 hover:border-gray-700'
                }`}
                style={{
                  borderColor: isPopular ? primaryColor : undefined,
                }}
              >
                {/* Popular / Early Bird Ribbon Badge */}
                {item.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {item.badge}
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                  <p className="text-xs text-gray-400 mb-6 min-h-[32px]">
                    {item.description || 'Truy cập đầy đủ các phiên thuyết trình và workshop thực chiến.'}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-gray-800/80">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      {item.price}
                    </span>
                    {item.originalPrice && (
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        {item.originalPrice}
                      </span>
                    )}
                    {item.billingPeriod && (
                      <span className="text-xs text-gray-400">/{item.billingPeriod}</span>
                    )}
                  </div>

                  {/* Perks List */}
                  <div className="space-y-3 mb-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                      Quyền lợi bao gồm:
                    </span>
                    {(item.perks || []).map((perk, perkIdx) => (
                      <div key={perkIdx} className="flex items-start gap-2.5 text-xs text-gray-300">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: `${primaryColor}25`, color: primaryColor }}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action button */}
                {ctaUrl && (
                  <a
                    href={ctaUrl}
                    target={/^https?:/i.test(ctaUrl) ? '_blank' : undefined}
                    rel={/^https?:/i.test(ctaUrl) ? 'noopener noreferrer' : undefined}
                    className="w-full py-3.5 px-6 rounded-2xl font-bold text-xs shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: isPopular ? primaryColor : 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      border: isPopular ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <span>{item.ctaText || 'Đăng Ký Vé Này'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
