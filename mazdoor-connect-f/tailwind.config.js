/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50:  '#FFF0E8',
          100: '#FFD9C2',
          400: '#F07040',
          500: '#E8500A',
          600: '#B83D08',
        },
        green: {
          50:  '#E1F5EE',
          500: '#1D9E75',
          600: '#156B54',
        },
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
