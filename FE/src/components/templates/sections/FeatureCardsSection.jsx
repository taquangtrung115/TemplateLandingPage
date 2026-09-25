import React from 'react';
import { Layers, Zap, Shield, Cpu, Activity, Clock, Compass } from 'lucide-react';
import { getSafeCssColor } from '../../../utils/safeUrl';

/**
 * FeatureCardsSection Component
 * Dành cho Landing Page Sản Phẩm SaaS hoặc Ứng Dụng Năng Suất (App Showcase)
 * Hiển thị grid các tính năng nổi bật (3 cards Gentle Productivity hoặc 6 cards 3x2 SaaS)
 * kèm các chỉ số thống kê metrics uy tín.
 *
 * @param {Object} props
 * @param {Array} [props.featureCardsGrid] Danh sách thẻ tính năng
 * @param {Array} [props.metrics] Chỉ số thống kê (50K+ users, 99.99% uptime...)
 * @param {string} [props.primaryColor='#10b981'] Màu chủ đạo
 * @param {boolean} [props.isHighlighted=false] Trạng thái đang chỉnh sửa
 */
export default function FeatureCardsSection({
  featureCardsGrid = [],
  metrics = [],
  headings = {},
  primaryColor = '#10b981',
  isHighlighted = false,
}) {
  primaryColor = getSafeCssColor(primaryColor, '#10b981');

  if (!featureCardsGrid || featureCardsGrid.length === 0) {
    return null;
  }

  const icons = [Layers, Zap, Cpu, Activity, Shield, Clock, Compass];

  return (
    <section
      data-testid="feature-cards-section"
      className={`py-20 px-4 relative transition-all duration-300 ${
        isHighlighted ? 'ring-4 ring-emerald-500/40 bg-emerald-50/10' : ''
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
            <Zap className="w-3.5 h-3.5" />
            <span>{headings?.eyebrow || 'Điểm nổi bật'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            {headings?.title || 'Điều làm nên khác biệt'}
          </h2>
          <p className="text-sm sm:text-base opacity-75 font-normal max-w-xl mx-auto">
            {headings?.subtitle || 'Khám phá các ưu điểm nổi bật và giá trị bạn nhận được.'}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div
          className={`grid gap-6 mb-16 ${
            featureCardsGrid.length <= 3
              ? 'grid-cols-1 md:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {featureCardsGrid.map((feature, idx) => {
            const IconComp = icons[idx % icons.length];
            return (
              <div
                key={feature.id || idx}
                className="group p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-md"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor,
                    }}
                  >
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-xs leading-relaxed opacity-75">
                    {feature.description || feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Metrics Highlights if available */}
        {metrics && metrics.length > 0 && (
          <div className="pt-12 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className="text-center p-6 rounded-2xl bg-white/5 border border-white/5"
              >
                <span
                  className="block text-3xl sm:text-4xl font-black mb-1"
                  style={{ color: primaryColor }}
                >
                  {m.value}
                </span>
                <span className="text-xs opacity-75 font-medium">{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
