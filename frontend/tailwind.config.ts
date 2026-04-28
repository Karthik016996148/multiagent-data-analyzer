import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "rgba(255,255,255,0.03)",
          hover: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.08)",
        },
        dark: {
          bg: "#09090b",
          card: "#0f0f13",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px",
      },
      typography: {
        invert: {
          css: {
            "--tw-prose-body": "rgb(228 228 231)",
            "--tw-prose-headings": "rgb(250 250 250)",
            "--tw-prose-links": "rgb(167 139 250)",
            "--tw-prose-bold": "rgb(250 250 250)",
            "--tw-prose-code": "rgb(167 139 250)",
            "--tw-prose-pre-bg": "rgba(0 0 0 / 0.4)",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
