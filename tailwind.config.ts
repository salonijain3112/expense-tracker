import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // or 'media' if you prefer
  theme: {
    extend: {
      colors: {
        'brand-primary': '#1a1a1a',
        'brand-secondary': '#f5f5f7',
        'brand-accent': '#4B0082', // A deep indigo for accents
        'income': '#22c55e', // Green-500
        'expense': '#ef4444', // Red-500
        'dark-bg': '#0f0f0f',
        'dark-card': '#1c1c1e',
        'dark-text': '#f5f5f7',
        'dark-subtle': '#a1a1a6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
