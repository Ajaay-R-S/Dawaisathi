import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saathi: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        emergency: {
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        }
      },
      fontSize: {
        'elder-base': ['1.125rem', { lineHeight: '1.75rem' }],
        'elder-lg': ['1.25rem', { lineHeight: '1.875rem' }],
        'elder-xl': ['1.5rem', { lineHeight: '2rem' }],
        'elder-2xl': ['1.875rem', { lineHeight: '2.25rem' }],
      }
    },
  },
  plugins: [],
};
export default config;
