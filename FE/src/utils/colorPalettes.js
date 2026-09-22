/**
 * 10 Bảng màu chuẩn chuyên nghiệp cho Landing Page & Thiệp điện tử
 */
export const COLOR_PALETTES = [
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Vàng kim hoàng gia & Đen huyền bí',
    primaryColor: '#D4AF37',
    secondaryColor: '#AA771C',
    accentColor: '#FFF8DC',
    backgroundColor: '#121214',
    textColor: '#F5F5F0',
    tag: 'Sang trọng'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Xanh Cyan neon & Hồng tím công nghệ',
    primaryColor: '#00F0FF',
    secondaryColor: '#FF003C',
    accentColor: '#FFE600',
    backgroundColor: '#0D0D15',
    textColor: '#FFFFFF',
    tag: 'Công nghệ'
  },
  {
    id: 'romantic-rose',
    name: 'Romantic Rose',
    description: 'Đỏ hồng nồng nàn & Kem ngọt ngào',
    primaryColor: '#E11D48',
    secondaryColor: '#F43F5E',
    accentColor: '#FEF08A',
    backgroundColor: '#FFF1F2',
    textColor: '#1E293B',
    tag: 'Lãng mạn'
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Xanh ngọc biển sâu & Xanh da trời',
    primaryColor: '#0284C7',
    secondaryColor: '#0EA5E9',
    accentColor: '#38BDF8',
    backgroundColor: '#F0F9FF',
    textColor: '#0F172A',
    tag: 'Tươi mát'
  },
  {
    id: 'emerald-garden',
    name: 'Emerald Garden',
    description: 'Xanh ngọc lục bảo & Thảo mộc tự nhiên',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    accentColor: '#6EE7B7',
    backgroundColor: '#F0FDF4',
    textColor: '#064E3B',
    tag: 'Thiên nhiên'
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    description: 'Cam hoàng hôn & Hổ phách ấm áp',
    primaryColor: '#EA580C',
    secondaryColor: '#F97316',
    accentColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
    textColor: '#431407',
    tag: 'Ấm áp'
  },
  {
    id: 'minimalist-mono',
    name: 'Minimalist Mono',
    description: 'Đen trắng cổ điển & Xám tro tối giản',
    primaryColor: '#18181B',
    secondaryColor: '#27272A',
    accentColor: '#71717A',
    backgroundColor: '#FFFFFF',
    textColor: '#09090B',
    tag: 'Tối giản'
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    description: 'Tím mộng mơ & Hồng thạch anh',
    primaryColor: '#8B5CF6',
    secondaryColor: '#A78BFA',
    accentColor: '#F472B6',
    backgroundColor: '#FAF5FF',
    textColor: '#3B0764',
    tag: 'Dễ thương'
  },
  {
    id: 'vintage-sepia',
    name: 'Vintage Sepia',
    description: 'Nâu gỗ trầm ấm & Vàng cổ điển',
    primaryColor: '#78350F',
    secondaryColor: '#92400E',
    accentColor: '#FDE68A',
    backgroundColor: '#FEF3C7',
    textColor: '#451A03',
    tag: 'Cổ điển'
  },
  {
    id: 'midnight-velvet',
    name: 'Midnight Velvet',
    description: 'Chàm đêm sâu thẳm & Tím hoàng hôn',
    primaryColor: '#6366F1',
    secondaryColor: '#818CF8',
    accentColor: '#C084FC',
    backgroundColor: '#0B0F19',
    textColor: '#F3F4F6',
    tag: 'Huyền bí'
  }
];

/**
 * Hàm áp dụng nhanh Palette 1-click vào theme config hiện tại
 */
export function applyPaletteToConfig(currentConfig, palette) {
  if (!palette) return currentConfig;

  return {
    ...currentConfig,
    theme: {
      ...currentConfig.theme,
      primaryColor: palette.primaryColor,
      secondaryColor: palette.secondaryColor,
      accentColor: palette.accentColor,
      backgroundColor: palette.backgroundColor,
      textColor: palette.textColor
    }
  };
}
