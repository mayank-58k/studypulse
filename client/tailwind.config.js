/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 900: "#0f1117", 800: "#1a1d2e", 700: "#252840" },
        gold: { 400: "#f0b429", 500: "#d69e2e" },
        neon: {
          primary: "#00ff88",
          secondary: "#00d4ff",
          warning: "#ff6b35",
          accent: "#ff00ff"
        }
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"]
      },
      keyframes: {
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 5px rgba(0, 255, 136, 0.5), 0 0 10px rgba(0, 212, 255, 0.3)"
          },
          "50%": {
            boxShadow: "0 0 20px rgba(0, 255, 136, 0.8), 0 0 30px rgba(0, 212, 255, 0.6)"
          }
        },
        flicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": {
            opacity: "1"
          },
          "20%, 24%, 55%": {
            opacity: "0.4"
          }
        },
        confetti: {
          "0%": {
            transform: "translate(0, 0) rotate(0deg)",
            opacity: "1"
          },
          "100%": {
            transform: "translate(var(--tx), var(--ty)) rotate(720deg)",
            opacity: "0"
          }
        }
      },
      animation: {
        glow: "glow 2s ease-in-out infinite",
        flicker: "flicker 3s ease-in-out",
        confetti: "confetti 3s ease-out"
      }
    }
  },
  plugins: []
};

