/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Storybook palette. No pink or blue anywhere.
      colors: {
        // "Little Orb": charcoal-green, champagne gold, ivory, deep emerald. No pink / blue.
        ocean: '#0B100E',
        forest: '#1A241F',
        jade: '#1F6B55',
        turquoise: '#2E7D67',
        sun: '#E3BE74',
        champagne: '#B89A5E',
        coral: '#C9975A',
        lavender: '#6C8F7F',
        ivory: '#EFE6D2',
        // legacy names still used in a few components, mapped onto the new palette
        tangerine: '#C9975A',
        mint: '#2E7D67',
        emerald: '#1F6B55',
        gold: '#B89A5E',
        plum: '#0B100E',
        ink: '#1A241F',
        'ink-soft': '#4A554F',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        twinkle: { '0%,100%': { opacity: '.25', transform: 'scale(.8)' }, '50%': { opacity: '1', transform: 'scale(1.15)' } },
        spinSlow: { to: { transform: 'rotate(360deg)' } },
        flicker: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.55' } },
        eq: { '0%,100%': { transform: 'scaleY(.35)' }, '50%': { transform: 'scaleY(1)' } },
      },
      animation: {
        floaty: 'floaty 5s ease-in-out infinite',
        twinkle: 'twinkle 3.4s ease-in-out infinite',
        'spin-slow': 'spinSlow 40s linear infinite',
        flicker: 'flicker 2.4s ease-in-out infinite',
        eq: 'eq 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
