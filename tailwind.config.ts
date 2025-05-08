
import { type Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class"],
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        glow: {
          primary: "#8B5CF6",
          secondary: "#6E59A5",
          blue: "#0EA5E9",
          amber: "#F97316",
          red: "#ea384c",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Noto Sans Arabic", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 10px rgba(99, 102, 241, 0.5)",
        "glow-lg": "0 0 15px rgba(99, 102, 241, 0.7)",
        "glow-amber": "0 0 10px rgba(245, 158, 11, 0.5)",
        "glow-amber-lg": "0 0 15px rgba(245, 158, 11, 0.7)",
        "glow-violet": "0 0 10px rgba(139, 92, 246, 0.6)",
        "glow-violet-lg": "0 0 15px rgba(139, 92, 246, 0.8)",
        "glow-blue": "0 0 10px rgba(14, 165, 233, 0.5)",
        "glow-blue-lg": "0 0 15px rgba(14, 165, 233, 0.7)",
      },
      keyframes: {
        "glow-pulse": {
          "0%": { boxShadow: "0 0 5px rgba(99, 102, 241, 0.5)" },
          "50%": { boxShadow: "0 0 15px rgba(99, 102, 241, 0.8)" },
          "100%": { boxShadow: "0 0 5px rgba(99, 102, 241, 0.5)" },
        },
      },
      animation: {
        "glow-pulse": "glow-pulse 2s infinite ease-in-out",
      },
    },
  },
} satisfies Config;
