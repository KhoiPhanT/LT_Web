import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Theme Vàng Amber - Đen Carbon - Trắng Chuẩn Gara 2026
        brand: {
          dark: "#09090b",       // Obsidian black
          cardDark: "#18181b",   // Dark zinc card
          light: "#f4f4f5",      // Light canvas
          cardLight: "#ffffff",  // Pure white card
          borderDark: "#27272a",
          borderLight: "#e4e4e7",
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Vàng Amber chính thức
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        'amber-glow': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'amber-subtle': '0 0 15px -3px rgba(245, 158, 11, 0.15)',
      }
    },
  },
  plugins: [],
};

export default config;
