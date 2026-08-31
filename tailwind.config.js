/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-azure': 'linear-gradient(to right, #1e3c72, #2a5298)',
      },
    },
  },
  plugins: [],
}
