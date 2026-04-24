/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 900: "#0a0a0f", 800: "#0d1117", 700: "#101722", 600: "#19222f" },
        gold: { 400: "#f0b429", 500: "#d69e2e" },
        neon: {
          primary: "#00ff88",
          secondary: "#00d4ff",
          warning: "#ff6b35",
          danger: "#ff4d4f",
          accent: "#9b5cff"
        }
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      keyframes: {
        glow: {
          "0%, 100%": { boxShadow: "0 0 6px rgba(0,255,136,.25), 0 0 24px rgba(0,212,255,.15)" },
          "50%": { boxShadow: "0 0 16px rgba(0,255,136,.45), 0 0 36px rgba(0,212,255,.25)" }
        },
        flicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "1" },
          "20%, 24%, 55%": { opacity: ".45" }
        },
        pulseWarning: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,77,79,.4)" },
          "70%": { boxShadow: "0 0 0 14px rgba(255,77,79,0)" }
        }
      },
      animation: {
        glow: "glow 2.2s ease-in-out infinite",
        flicker: "flicker 2.8s ease-in-out infinite",
        pulseWarning: "pulseWarning 1.8s infinite"
      }
    }
  },
  plugins: []
};
