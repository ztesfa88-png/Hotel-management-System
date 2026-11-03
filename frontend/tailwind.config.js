/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff5f0',
          100: '#ffe8dc',
          200: '#ffceb8',
          300: '#ffaa88',
          400: '#ff7c4d',
          500: '#e8501e',
          600: '#c93e10',
          700: '#a8300c',
          800: '#7e240a',
          900: '#5a1a07',
        },
        stone: {
          50:  '#faf9f7',
          100: '#f3f1ee',
          200: '#e8e4de',
          300: '#d4cec5',
          400: '#b5ad9f',
          500: '#928880',
          600: '#6f6560',
          700: '#4a4540',
          800: '#2e2a26',
          900: '#1a1816',
        },
        gold: '#c9a96e',
      },
      fontFamily: {
        sans:    ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        ui:      ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury':    '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'luxury-lg': '0 12px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        'luxury-xl': '0 24px 80px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08)',
        'brand':     '0 4px 16px rgba(232,80,30,0.28)',
        'brand-lg':  '0 8px 28px rgba(232,80,30,0.35)',
      },
      animation: {
        'fade-up':   'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':   'fadeIn 0.4s ease forwards',
        'slide-down':'slideDown 0.28s ease forwards',
        'ken-burns': 'kenBurns 12s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeUp:    { from: { opacity:'0', transform:'translateY(28px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        fadeIn:    { from: { opacity:'0' },                               to: { opacity:'1' } },
        slideDown: { from: { opacity:'0', transform:'translateY(-10px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        kenBurns:  { from: { transform:'scale(1) translateX(0)' },         to: { transform:'scale(1.08) translateX(-16px)' } },
      },
    },
  },
  plugins: [],
};
