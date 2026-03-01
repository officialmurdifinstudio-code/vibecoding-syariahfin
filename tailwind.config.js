/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#34d399",
          DEFAULT: "#059669", // Emerald green
          dark: "#065f46",
        },
        secondary: {
          light: "#fde047",
          DEFAULT: "#eab308", // Gold
          dark: "#ca8a04",
        },
        background: "#f8fafc",
        surface: "#ffffff",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
