/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        khaki: {
          50: '#f6f5ee',
          100: '#eae7d6',
          200: '#d8d2ae',
          300: '#c2b981',
          400: '#aea25f',
          500: '#8f8248',
          600: '#71663a',
          700: '#584f30',
          800: '#48412c',
          900: '#3e3827',
        },
        stone: {
          50: '#f7f7f6',
          100: '#e9e8e5',
          200: '#d3d1cb',
          300: '#b3b0a6',
          400: '#8f8b7f',
          500: '#726e63',
          600: '#5a564d',
          700: '#4a473f',
          800: '#3d3a35',
          900: '#26241f',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.7s ease-out forwards',
      },
    },
  },
  plugins: [],
};
