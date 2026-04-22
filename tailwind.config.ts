import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ═══════════════════════════════════════════════════════════
        // iOS 18 SYSTEM COLORS (Dark Mode)
        // ═══════════════════════════════════════════════════════════

        // Backgrounds iOS
        background: {
          primary: '#000000',      // Noir pur iOS
          secondary: '#1C1C1E',    // Elevated background
          tertiary: '#2C2C2E',     // Grouped background
        },

        // iOS System Blue (Primary action color)
        primary: {
          DEFAULT: '#0A84FF',      // iOS Blue (liens, actions)
          hover: '#409CFF',
          pressed: '#0066CC',
        },

        // Accent color (Brand blue - same as iOS blue for consistency)
        accent: {
          DEFAULT: '#4CB0F1',      // Brand accent
          hover: '#6BC1F5',
          pressed: '#3A9CD8',
        },

        // iOS System colors
        red: '#FF453A',            // iOS destructive
        green: '#32D74B',          // iOS success
        yellow: '#FFD60A',         // iOS warning
        orange: '#FF9F0A',         // iOS orange

        // iOS Gray scale
        gray: {
          1: '#8E8E93',            // Secondary label
          2: '#636366',            // Tertiary label
          3: '#48484A',            // Quaternary label
          4: '#3A3A3C',            // Separator
          5: '#2C2C2E',            // Fill
          6: '#1C1C1E',            // Secondary background
        },

        // Text iOS (Label colors)
        label: {
          primary: '#FFFFFF',
          secondary: 'rgba(235,235,245,0.6)',
          tertiary: 'rgba(235,235,245,0.3)',
          quaternary: 'rgba(235,235,245,0.18)',
        },

        // iOS semantic colors
        ios: {
          base: '#000000',
          elevated: '#1C1C1E',
          'elevated-2': '#2C2C2E',
          'elevated-3': '#3A3A3C',
          blue: '#0A84FF',
          'blue-hover': '#409CFF',
          'blue-pressed': '#0066CC',
          success: '#32D74B',
          'success-muted': 'rgba(50, 215, 75, 0.15)',
          error: '#FF453A',
          'error-muted': 'rgba(255, 69, 58, 0.15)',
          warning: '#FFD60A',
          'warning-muted': 'rgba(255, 214, 10, 0.15)',
          separator: 'rgba(84, 84, 88, 0.65)',
          'separator-opaque': '#38383A',
        },
        dark: {
          950: '#000000',
          900: '#1C1C1E',
          800: '#2C2C2E',
          700: '#3A3A3C',
        },
        surface: {
          900: '#000000',
          800: '#1C1C1E',
          700: '#2C2C2E',
          600: '#3A3A3C',
          500: '#48484A',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Helvetica Neue',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        'ios-display-lg': ['34px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'ios-display-md': ['28px', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '700' }],
        'ios-title-lg': ['22px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'ios-title-md': ['17px', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
        'ios-title-sm': ['15px', { lineHeight: '1.4', fontWeight: '600' }],
        'ios-body-lg': ['17px', { lineHeight: '1.5', fontWeight: '400' }],
        'ios-body-md': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        'ios-body-sm': ['13px', { lineHeight: '1.45', fontWeight: '400' }],
        'ios-label-lg': ['15px', { lineHeight: '1.35', fontWeight: '500' }],
        'ios-label-md': ['13px', { lineHeight: '1.35', letterSpacing: '0.02em', fontWeight: '500' }],
        'ios-label-sm': ['11px', { lineHeight: '1.3', letterSpacing: '0.04em', fontWeight: '500' }],
        'ios-caption': ['12px', { lineHeight: '1.35', letterSpacing: '0.02em', fontWeight: '400' }],
      },
      spacing: {
        'ios-1': '4px',
        'ios-2': '8px',
        'ios-3': '12px',
        'ios-4': '16px',
        'ios-5': '20px',
        'ios-6': '24px',
        'ios-8': '32px',
        'ios-10': '40px',
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
      borderRadius: {
        'ios-sm': '8px',
        'ios-md': '12px',
        'ios-lg': '16px',
        'ios-xl': '20px',
        'ios-full': '9999px',
        // Legacy
        'card': '12px',
        'button': '12px',
        'input': '12px',
        'chip': '8px',
      },
      boxShadow: {
        'ios-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'ios-md': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'ios-lg': '0 8px 24px rgba(0, 0, 0, 0.5)',
        'ios-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        // Legacy
        'card': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.4)',
      },
      transitionTimingFunction: {
        'ios': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'ios-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ios-decel': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      transitionDuration: {
        'ios-instant': '100ms',
        'ios-fast': '150ms',
        'ios-normal': '250ms',
        'ios-slow': '350ms',
      },
      backdropBlur: {
        'ios': '20px',
      },
      animation: {
        'ios-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ios-spin': 'spin 1s linear infinite',
      },
      minHeight: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}

export default config
