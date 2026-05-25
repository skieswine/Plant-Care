/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        mint: {
          50:  '#f0faf5',
          100: '#d6f2e3',
          200: '#aee5c8',
          300: '#7dd1aa',
          400: '#4db88a',
          500: '#2d9e6f',
          600: '#1d7d54',
        },
        earth: {
          50:  '#fdf8f3',
          100: '#f5ede3',
          200: '#e8d5bc',
          300: '#c4a882',
          400: '#a07850',
          500: '#7a5530',
          600: '#5c3d1e',
        },
        cream: '#faf8f3',
        leaf:  '#3d7a4f',
        bark:  '#8B6914',
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
