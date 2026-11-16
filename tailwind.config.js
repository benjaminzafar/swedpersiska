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
          "'Vazirmatn'",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Noto Sans Arabic'",
          "sans-serif"
        ],
        vazir: [
          "'Vazirmatn'",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "sans-serif"
        ],
      },
      spacing: {
        '0.2': '0.05rem',
        '4.5': '1.125rem',
        '7.5': '1.875rem',
        '8.5': '2.125rem',
        '9.5': '2.375rem',
        '15': '3.75rem',
        '68': '17rem',
      },
      minWidth: {
        '4.5': '1.125rem',
        '5': '1.25rem',
        '8': '2rem',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
