/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0B0E14',
        panel: '#12161F',
        hairline: '#232838',
        gold: '#D4AF37',
        signal: '#4C6FFF',
        bronze: {
          light: '#C98A4B',
          dark: '#7A4E23',
        },
        silver: {
          light: '#D8DCE2',
          dark: '#868C97',
        },
        goldtier: {
          light: '#F3D879',
          dark: '#9C7A1E',
        },
        ultimate: {
          light: '#4B2E83',
          dark: '#170F2B',
        },
      },
      fontFamily: {
        display: ['var(--font-oswald)', 'Impact', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
