import React from 'react';
import { Layers, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { getAnimationClass } from '../../../utils/animationConstants';
import { getSafeCssColor } from '../../../utils/safeUrl';

/**
 * HierarchicalCardsSection Component
 * Hiển thị cấu trúc thẻ lồng nhau động (Card Builder)
 * Card Cha -> Header Card -> Sub Header -> Content -> Danh sách Sub Cards con
 */
export default function HierarchicalCardsSection({
  hierarchicalCards = [],
  primaryColor = '#e11d48',
  secondaryColor = '#f43f5e',
  isHighlighted = false,
}) {
  primaryColor = getSafeCssColor(primaryColor, '#e11d48');
  secondaryColor = getSafeCssColor(secondaryColor, '#f43f5e');
  const cards = Array.isArray(hierarchicalCards) ? hierarchicalCards : [];

  if (cards.length === 0) {
    return null;
  }

  const getCardStyle = (preset, customBg, customText) => {
    switch (preset) {
      case 'glass':
        return 'backdrop-blur-md bg-white/10 dark:bg-slate-900/40 border border-white/20 dark:border-slate-700/50 shadow-xl';
      case 'solid':
        return 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-lg';
      case 'gradient':
        return 'bg-gradient-to-br from-white/90 to-white/40 dark:from-slate-900/90 dark:to-slate-950/70 border border-white/30 dark:border-slate-800 shadow-2xl';
      case 'luxury':
        return 'bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border border-amber-500/30 shadow-[0_10px_30px_-10px_rgba(212,175,55,0.2)] text-amber-50';
      case 'minimal':
      default:
        return 'bg-transparent border border-current/15 shadow-sm';
    }
  };

  return (
    <section
      data-testid="hierarchical-cards-section"
      className={`py-16 px-4 sm:px-6 relative transition-all duration-300 ${
        isHighlighted ? 'ring-4 ring-rose-500/30 bg-rose-50/5' : ''
      }`}
    >
      <div className="max-w-5xl mx-auto space-y-10">
        {cards.map((card, idx) => {
          const subCards = Array.isArray(card.subCards) ? card.subCards : [];
          const presetClass = getCardStyle(card.stylePreset, card.backgroundColor, card.textColor);
          const animationClass = getAnimationClass(card.animation || 'fade-up', true);
          const cardBackgroundColor = getSafeCssColor(card.backgroundColor, '') || undefined;
          const cardTextColor = getSafeCssColor(card.textColor, '') || undefined;

          return (
            <div
              key={card.id || idx}
              className={`rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl ${presetClass} ${animationClass}`}
              style={{
                backgroundColor: cardBackgroundColor,
                color: cardTextColor,
              }}
            >
              {/* Header Card Cha */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-current/10 pb-6 mb-6">
                <div className="space-y-1.5 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-1 bg-current/10">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    <span>Khối Nội Dung {idx + 1}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                    {card.title || 'Tiêu đề khối thẻ'}
                  </h3>
                  {card.subHeader && (
                    <p className="text-sm sm:text-base font-medium opacity-80">
                      {card.subHeader}
                    </p>
                  )}
                </div>
              </div>

              {/* Main Content */}
              {card.content && (
                <div className="text-sm sm:text-base leading-relaxed opacity-85 mb-8 whitespace-pre-line">
                  {card.content}
                </div>
              )}

              {/* Nested Sub Cards List */}
              {subCards.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs uppercase font-bold tracking-wider opacity-70 mb-3 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Chi Tiết Thành Phần ({subCards.length})</span>
                  </h4>
                  <div
                    className={`grid gap-4 ${
                      subCards.length === 1
                        ? 'grid-cols-1'
                        : subCards.length === 2
                        ? 'grid-cols-1 md:grid-cols-2'
                        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}
                  >
                    {subCards.map((sub, sIdx) => {
                      const subAnim = getAnimationClass(sub.animation || 'zoom-in', true);
                      return (
                        <div
                          key={sub.id || sIdx}
                          className={`p-4 sm:p-5 rounded-2xl bg-current/5 border border-current/10 hover:bg-current/10 transition-all duration-200 flex flex-col justify-between ${subAnim}`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-bold text-sm sm:text-base flex items-center gap-2">
                                <CheckCircle2
                                  className="w-4 h-4 shrink-0"
                                  style={{ color: primaryColor }}
                                />
                                <span>{sub.title || `Mục con ${sIdx + 1}`}</span>
                              </h5>
                              {sub.subHeader && (
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-current/10 opacity-80">
                                  {sub.subHeader}
                                </span>
                              )}
                            </div>
                            {sub.content && (
                              <p className="text-xs leading-relaxed opacity-75 mt-1.5">
                                {sub.content}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
