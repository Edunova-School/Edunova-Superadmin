/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F6F2",
        navy: {
          950: "#0B1524",
          900: "#0E1C30",
          800: "#14263F",
          700: "#1E3A8A",
        },
        gold: {
          DEFAULT: "#B8901F",
          light: "#D4AF6A",
          dark: "#8F6E14",
        },
        signal: {
          good: "#1E7A4C",
          warn: "#B8791F",
          bad: "#B3382C",
        },
      },
      fontFamily: {
        serif: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,21,36,0.04), 0 1px 1px rgba(11,21,36,0.03)",
      },
    },
  },
  plugins: [],
};
