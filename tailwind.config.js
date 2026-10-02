/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'] },
    },
  },
  plugins: [],
};
