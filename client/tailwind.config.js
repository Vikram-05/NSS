/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0e0e10",
        paper: "#f6f1e7",
        cream: "#fbf7ef",
        ember: "#c2452d",
        moss: "#3f5a3f",
        sand: "#e5dcc9",
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        sans: ['"Inter"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        grain: "0 1px 0 rgba(0,0,0,.15), 0 12px 40px -20px rgba(0,0,0,.35)",
      },
    },
  },
  plugins: [],
};