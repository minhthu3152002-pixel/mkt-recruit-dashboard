import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-body)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        ink: "#171622",
        muted: "#8a8a9e",
        canvas: "#f4f5f7",
        pink: { DEFAULT: "#ec2c69", 600: "#d61f59", soft: "#fde4ed" },
        blue: { DEFAULT: "#2f6bff", 600: "#215ae0", soft: "#e4ecff" },
        up: "#16a34a",
        down: "#ef4444",
        // kênh (dùng cho chart/badge)
        meta: "#2f6bff",
        linkedin: "#0a66c2",
        itviec: "#ec2c69",
        topdev: "#f97316",
        free: "#22c55e",
      },
      boxShadow: {
        card: "0 4px 20px rgba(23,22,34,0.05)",
        pill: "0 6px 16px rgba(236,44,105,0.28)",
      },
      borderRadius: {
        "2xl": "20px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
export default config;
