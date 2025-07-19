// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'geist-sans': ['var(--font-geist)', 'ui-sans-serif', 'system-ui'],
        'geist-mono': ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular'],
        'architects-daughter': ['var(--font-architects-daughter)', 'cursive'],
      },
    },
  },
  variants: {
    extend: {
      backgroundOpacity: ['hover', 'focus'],
    },
  },
};
