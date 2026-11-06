/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Storybook palette. No pink or blue anywhere.
      colors: {
        // Little Wonderland palette
        ocean: '#183D4B',
        forest: '#263B42',
        jade: '#347D76',
        turquoise: '#77B7B0',
        sun: '#F0B94B',
        champagne: '#B8A16A',
        coral: '#E98C56',
        lavender: '#8974BD',
        ivory: '#F1E8D6',
        // legacy names used by older components, mapped onto the new palette
        tangerine: '#E98C56',
        mint: '#77B7B0',
        emerald: '#347D76',
        gold: '#B8A16A',
        plum: '#183D4B',
        ink: '#263B42',
        'ink-soft': '#46666B',
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
