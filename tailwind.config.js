/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        persian: {
          gold: "#d4af37",
          crimson: "#9b111e",
          turquoise: "#30d5c8",
          navy: "#0a192f",
        },
        admin: {
          dark: "#11141a",
          card: "#181c24",
          border: "rgba(255,255,255,0.08)",
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Vazirmatn'",
          "'Noto Sans Arabic'",
          "sans-serif"
        ],
      },
    },
  },
  plugins: [],
}
