import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        ink: "#14131b",
        canvas: "#f6f5f2",
        brand: "#5b3df5",
        meta: "#2563eb",
        itviec: "#e4322b",
        linkedin: "#0a9396",
        free: "#16a34a",
      },
    },
  },
  plugins: [],
};
export default config;
