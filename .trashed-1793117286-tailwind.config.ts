import type { Config } from 'tailwindcss';

// PERMANENT BRAND PALETTE — approved Soft Feminine Premium identity.
// Seasons never override these tokens; a season can only add a small tinted
// overlay/badge on top of this core system (see src/app/page.tsx).
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: '#D98FA1', // Primary Rose — permanent primary
          dark: '#C17389',    // deeper rose for hover states / footer
          light: '#D7B8C4',   // Soft Mauve — permanent secondary
        },
        blush: '#F7D7DC',   // Soft Blush — surfaces, borders, section backgrounds
        peach: '#F3C6B8',   // Peach — accent surfaces
        sand: '#EADDCB',    // Warm Cream (accent tone) — used for warm surfaces, not the page bg
        mauve: '#D7B8C4',   // Soft Mauve
        sage: '#C8D5C1',    // Soft Sage — accents, "new" badges
        gold: '#E6C9A8',    // Secondary Gold / Champagne — accent, used sparingly
        muted: '#A89CA0',   // Neutral Gray — secondary text/borders
        cream: '#FFF9F5',   // Warm Cream — permanent page background
        forest: '#6B8F71',  // functional utility color only (in-stock, WhatsApp) — never a dominant brand color
        ink: '#4A3B38',     // warm dark brown/gray text — never harsh black
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      borderRadius: {
        card: '20px',
        xl2: '28px',
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(74, 59, 56, 0.15)',
        softer: '0 4px 16px -8px rgba(74, 59, 56, 0.12)',
      },
    },
  },
  plugins: [],
};
export default config;
