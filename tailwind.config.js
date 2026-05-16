/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        turon: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8ecbff',
          400: '#59aaf6',
          500: '#3287dd',
          600: '#216abf',
          700: '#1B4F8A',
          800: '#183f6c',
          900: '#17375b',
        },
      },
      boxShadow: {
        soft: '0 18px 45px -28px rgba(27, 79, 138, 0.35)',
      },
    },
  },
  plugins: [],
}
