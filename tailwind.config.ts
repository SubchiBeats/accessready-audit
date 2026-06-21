import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          50: "#f6f7f8",
          100: "#e6e8eb",
          200: "#cbd0d6",
          300: "#aab2bd",
          400: "#7e8998",
          500: "#626d7a",
          600: "#4d5661",
          700: "#3f4650",
          800: "#252b33",
          900: "#151a20",
          950: "#0b0f14"
        },
        navy: {
          700: "#12385f",
          800: "#0b2c4f",
          900: "#08223d"
        },
        teal: {
          600: "#007f78",
          700: "#006b65"
        },
        risk: {
          critical: "#b42318",
          serious: "#c2410c",
          moderate: "#b7791f",
          minor: "#276749",
          review: "#3451b2"
        }
      },
      boxShadow: {
        focus: "0 0 0 3px rgba(0, 127, 120, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
