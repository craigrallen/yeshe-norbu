import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#f5ca00',  // Yeshin Norbu gold (from Divi theme)
          dark: '#d4af00',
          light: '#f9e066',
        },
        charcoal: {
          DEFAULT: '#58595b',  // Yeshin Norbu charcoal
          dark: '#3d3e40',
          light: '#6b6c6e',
        },
        surface: '#edeae6',    // Off-white from Divi settings
        background: '#f4f4f4',
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
