/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#d4af37",
          light: "#f3d573",
          dark: "#aa8c2c",
        },
      },
      fontFamily: {
        moul: ["Moul", "serif"],
        kantumruy: ["Kantumruy Pro", "sans-serif"],
      },
    },
  },
  plugins: [],
};
