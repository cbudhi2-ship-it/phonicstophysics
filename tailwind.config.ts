import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1F2D4A",
          soft: "#2C3E63",
        },
        coral: {
          DEFAULT: "#F08A3E",
          dark: "#E0762A",
        },
        teal: "#2E9C8E",
        gold: "#F4B740",
        cream: "#FBF5EC",
        line: "#EADFCB",
        muted: "#6B7280",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(31,45,74,.08)",
      },
      borderRadius: {
        pill: "999px",
      },
      maxWidth: {
        wrap: "1080px",
      },
    },
  },
  plugins: [],
};

export default config;
