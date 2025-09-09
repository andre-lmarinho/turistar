// tailwind.config.js
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'geist-sans': ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
        'geist-mono': ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular'],
        'architects-daughter': ['var(--font-architects-daughter)', 'cursive'],
      },
    },
  },
};

export default config;
