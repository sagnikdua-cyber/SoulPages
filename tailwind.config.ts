import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        soul: {
          indigo: "#1E293B", // Deep, intelligent, trust
          purple: "#A78BFA", // Emotional, creative, spiritual
          gold: "#FDE047",   // Growth, hope, glow
          sky: "#BAE6FD",    // Peace, clarity, memory
          lavender: "#C4B5FD",
          bg: "#0F172A",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      backdropBlur: {
        xs: "2px",
      },
      gridTemplateColumns: {
        '15': 'repeat(15, minmax(0, 1fr))',
        '20': 'repeat(20, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
};
export default config;
