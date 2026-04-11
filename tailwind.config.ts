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
        // Monad brand purple as primary
        monad: {
          50: "#F0EDFF",
          100: "#E0D9FF",
          200: "#C4B8FF",
          300: "#A593FF",
          400: "#836EF9",
          500: "#6B52E8",
          600: "#5440C7",
          700: "#3D2FA0",
          800: "#2A1F7A",
          900: "#1A1354",
        },
        // App background scale
        surface: {
          0: "#07070F",
          1: "#0D0D18",
          2: "#12121F",
          3: "#181827",
          4: "#1E1E30",
          5: "#26263A",
        },
        // Accent
        cyan: {
          400: "#00D4FF",
          500: "#00B8E0",
        },
        // Borders
        border: {
          DEFAULT: "#1E1E30",
          subtle: "#161625",
          bright: "#2E2E48",
        },
        // Text
        ink: {
          DEFAULT: "#F0F0FF",
          muted: "#8888AA",
          faint: "#44445A",
        },
        // Status colors
        success: "#00E5A0",
        warning: "#FFB547",
        danger: "#FF4D6A",
        info: "#836EF9",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
        display: ["var(--font-syne)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grid-pattern":
          "linear-gradient(to right, #1E1E30 1px, transparent 1px), linear-gradient(to bottom, #1E1E30 1px, transparent 1px)",
        "monad-glow":
          "radial-gradient(ellipse at 50% 0%, rgba(131, 110, 249, 0.15) 0%, transparent 70%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "slide-in-left": "slideInLeft 0.3s ease forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        glow: {
          from: { boxShadow: "0 0 20px rgba(131, 110, 249, 0.3)" },
          to: { boxShadow: "0 0 40px rgba(131, 110, 249, 0.6)" },
        },
      },
      boxShadow: {
        monad: "0 0 0 1px rgba(131, 110, 249, 0.3), 0 4px 24px rgba(131, 110, 249, 0.15)",
        "monad-lg": "0 0 0 1px rgba(131, 110, 249, 0.4), 0 8px 48px rgba(131, 110, 249, 0.25)",
        "surface-raised": "0 4px 24px rgba(0, 0, 0, 0.4)",
        "inner-glow": "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
