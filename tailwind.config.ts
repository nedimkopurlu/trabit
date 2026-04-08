import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        critical: "rgb(var(--color-critical) / <alpha-value>)",
        medium: "rgb(var(--color-medium) / <alpha-value>)",
        low: "rgb(var(--color-low) / <alpha-value>)",
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        fg: "rgb(var(--color-fg) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
export default config;
