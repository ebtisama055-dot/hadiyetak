import type { Config } from 'tailwindcss';

// PERMANENT BRAND PALETTE — warm, restrained, premium. Seasons never override
// these tokens; a season can only add small overlay elements (hero copy/image,
// announcement bar, a seasonal badge) that sit on top of this core system.
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: '#5C2A3A', // deep plum / restrained burgundy — permanent primary
          dark: '#401D28',
          light: '#B98189', // dusty rose — permanent secondary
        },
        cream: '#FBF7F2', // warm ivory — permanent background
        blush: '#EFE6DA', // warm taupe/sand — permanent neutral surface & borders
        gold: '#B8935B', // restrained warm gold — permanent accent, used sparingly
        forest: '#3F5D45', // functional utility color only (in-stock, WhatsApp) — never a dominant brand color
        ink: '#2B2725', // deep charcoal — permanent text
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
