import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#E8B817', dark: '#C49A0E', light: '#F5D660' },
        charcoal: { DEFAULT: '#3D3D3D', dark: '#2D2D2D', light: '#5A5A5A' },
        cream: '#FAFAF6',
        sage: '#8FA98F',
        surface: '#FAFAF6',
        background: '#FAFAF6',
      },
      fontFamily: {
        sans: ['DM Sans', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: { xl: '16px', '2xl': '20px' },
    },
  },
  plugins: [],
};

export default config;
