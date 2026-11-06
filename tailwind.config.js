/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Storybook palette. No pink or blue anywhere.
      colors: {
        sun: '#FFC93C',
        tangerine: '#FF9A3C',
        coral: '#FF7A66',
        mint: '#8EE3C2',
        emerald: '#1FA67A',
        turquoise: '#27C4C4',
        lavender: '#B8A6F0',
        ivory: '#FFF8EA',
        champagne: '#E8D3A0',
        gold: '#C9A24E',
        plum: '#2B1A57',
        ink: '#3A2A52',
        'ink-soft': '#6B5A82',
      },
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
        sans: ['Quicksand', 'system-ui', 'sans-serif'],
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
