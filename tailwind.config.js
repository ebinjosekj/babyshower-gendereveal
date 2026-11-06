/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Champagne / ivory / beige / cocoa only. No pink, no blue.
      colors: {
        ivory: '#FBF7EF',
        cream: '#F6EEDF',
        beige: '#E9DCC3',
        sand: '#D9C6A3',
        champagne: '#E8D3A0',
        gold: '#C9A24E',
        'gold-deep': '#9A7A2F',
        mocha: '#6E5640',
        cocoa: '#4A3626',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        eq: { '0%,100%': { transform: 'scaleY(.35)' }, '50%': { transform: 'scaleY(1)' } },
      },
      animation: { eq: 'eq 1s ease-in-out infinite' },
    },
  },
  plugins: [],
};
