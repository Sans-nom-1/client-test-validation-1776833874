// iOS Premium Design Tokens
// Based on Apple Human Interface Guidelines

export const tokens = {
  // ═══════════════════════════════════════════════════════════════
  // COLORS (Dark Mode)
  // ═══════════════════════════════════════════════════════════════
  colors: {
    // Backgrounds (du plus profond au plus eleve)
    bgBase: '#000000',
    bgElevated: '#1C1C1E',
    bgElevated2: '#2C2C2E',
    bgElevated3: '#3A3A3C',

    // Surface avec blur (iOS frosted glass)
    bgBlur: 'rgba(28, 28, 30, 0.8)',

    // Accent (unique)
    accent: '#D4AF37',
    accentMuted: 'rgba(212, 175, 55, 0.15)',
    accentPressed: '#B8962E',

    // Texte
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    textTertiary: 'rgba(255, 255, 255, 0.4)',
    textDisabled: 'rgba(255, 255, 255, 0.25)',

    // Semantique
    success: '#30D158',
    successMuted: 'rgba(48, 209, 88, 0.15)',
    error: '#FF453A',
    errorMuted: 'rgba(255, 69, 58, 0.15)',
    warning: '#FFD60A',
    warningMuted: 'rgba(255, 214, 10, 0.15)',

    // Separateurs
    separator: 'rgba(255, 255, 255, 0.08)',
    separatorOpaque: '#38383A',
  },

  // ═══════════════════════════════════════════════════════════════
  // TYPOGRAPHY (SF Pro scale)
  // ═══════════════════════════════════════════════════════════════
  typography: {
    displayLarge: { size: '34px', weight: 700, lineHeight: 1.2, tracking: '-0.02em' },
    displayMedium: { size: '28px', weight: 700, lineHeight: 1.25, tracking: '-0.02em' },
    titleLarge: { size: '22px', weight: 600, lineHeight: 1.3, tracking: '-0.01em' },
    titleMedium: { size: '17px', weight: 600, lineHeight: 1.35, tracking: '-0.01em' },
    titleSmall: { size: '15px', weight: 600, lineHeight: 1.4, tracking: '0' },
    bodyLarge: { size: '17px', weight: 400, lineHeight: 1.5, tracking: '0' },
    bodyMedium: { size: '15px', weight: 400, lineHeight: 1.5, tracking: '0' },
    bodySmall: { size: '13px', weight: 400, lineHeight: 1.45, tracking: '0' },
    labelLarge: { size: '15px', weight: 500, lineHeight: 1.35, tracking: '0' },
    labelMedium: { size: '13px', weight: 500, lineHeight: 1.35, tracking: '0.02em' },
    labelSmall: { size: '11px', weight: 500, lineHeight: 1.3, tracking: '0.04em' },
    caption: { size: '12px', weight: 400, lineHeight: 1.35, tracking: '0.02em' },
  },

  // ═══════════════════════════════════════════════════════════════
  // SPACING (base 4px)
  // ═══════════════════════════════════════════════════════════════
  spacing: {
    '0': '0',
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '8': '32px',
    '10': '40px',
    '12': '48px',
  },

  // ═══════════════════════════════════════════════════════════════
  // RADIUS
  // ═══════════════════════════════════════════════════════════════
  radius: {
    none: '0',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },

  // ═══════════════════════════════════════════════════════════════
  // SHADOWS (subtiles iOS)
  // ═══════════════════════════════════════════════════════════════
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(212, 175, 55, 0.3)',
  },

  // ═══════════════════════════════════════════════════════════════
  // ANIMATION
  // ═══════════════════════════════════════════════════════════════
  animation: {
    duration: {
      instant: '100ms',
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easing: {
      default: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // Z-INDEX
  // ═══════════════════════════════════════════════════════════════
  zIndex: {
    base: 0,
    elevated: 10,
    sticky: 100,
    overlay: 200,
    modal: 300,
    toast: 400,
  },
} as const

export type DesignTokens = typeof tokens
