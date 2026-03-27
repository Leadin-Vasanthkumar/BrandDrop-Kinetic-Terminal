import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#efffe3",
        "background": "#0A0A0A",
        "primary-container": "#39FF14",
        "on-primary": "#053900",
        "secondary": "#72de58",
        "surface": "#131313",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-low": "#1c1b1b",
        "surface-container": "#201f1f",
        "surface-container-high": "#2a2a2a",
        "surface-container-highest": "#353534",
        "on-surface": "#e5e2e1",
        "on-surface-variant": "#baccb0",
        "outline": "#85967c",
        "outline-variant": "#3c4b35",
        "error": "#ffb4ab",
        "error-container": "#93000a",
      },
      fontFamily: {
        headline: ["var(--font-space-grotesk)"],
        body: ["var(--font-manrope)"],
        label: ["var(--font-inter)"],
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
