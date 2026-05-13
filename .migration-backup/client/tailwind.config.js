/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          50: '#f0fff4',
          100: '#dcffe4',
          200: '#b9ffcb',
          300: '#85ffab',
          400: '#39ff14',
          500: '#00ff41',
          600: '#00cc33',
          700: '#009922',
          800: '#006615',
          900: '#003309',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cinzel', 'serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'scanline': 'scanline 8s linear infinite',
      },
    },
  },
  plugins: [],
}
