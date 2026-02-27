import type { Config } from 'tailwindcss';
import { colors } from './src/tokens/colors';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../apps/*/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        surface: colors.surface,
        background: colors.background,
        border: colors.border,
        success: colors.success,
        error: colors.error,
        warning: colors.warning,
      },
      textColor: {
        primary: colors.text.primary,
        muted: colors.text.muted,
        inverse: colors.text.inverse,
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
