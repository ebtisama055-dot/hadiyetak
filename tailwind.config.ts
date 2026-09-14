import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: '#7A2340',
          dark: '#591830',
          light: '#9C3A57',
        },
        cream: '#FBF6F0',
        blush: '#F3E4E0',
        gold: '#C9A15A',
        forest: '#3F5D45',
        ink: '#2B2320',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      borderRadius: {
        card: '18px',
      },
    },
  },
  plugins: [],
};
export default config;
