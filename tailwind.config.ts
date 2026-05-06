import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1C2C",
          50: "#E7ECF1",
          100: "#C5D0DA",
          200: "#8FA1B3",
          300: "#5A728B",
          400: "#2E4761",
          500: "#0B1C2C",
          600: "#091624",
          700: "#06101A",
          800: "#040A11",
          900: "#020508",
        },
        sand: {
          DEFAULT: "#C8A96A",
          50: "#FBF6EC",
          100: "#F4E9CE",
          200: "#E7D29D",
          300: "#DABA6C",
          400: "#C8A96A",
          500: "#B08F4E",
          600: "#8B7039",
          700: "#665225",
          800: "#403415",
          900: "#1F1908",
        },
        ivory: "#F8F6F2",
        ink: "#1A1A1A",
        line: "#E8E4DB",
        muted: {
          DEFAULT: "#6B6B6B",
          foreground: "#6B6B6B",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11,28,44,0.04), 0 8px 24px rgba(11,28,44,0.06)",
        lift: "0 2px 6px rgba(11,28,44,0.05), 0 16px 40px rgba(11,28,44,0.08)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
