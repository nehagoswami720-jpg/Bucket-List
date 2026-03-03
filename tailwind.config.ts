import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      colors: {
        "warm-dark": "#1C1A17",
        "envelope-cream": "#F0E6D3",
        "letter-cream": "#F5EDD9",
        "wax-red": "#8B1A1A",
        "ink": "#2C2416",
      },
    },
  },
  plugins: [],
};
export default config;
