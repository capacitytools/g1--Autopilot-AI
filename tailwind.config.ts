import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // G1-Tech brand: forest green
        brand: {
          50: "#f0f7f2",
          100: "#dcebe1",
          200: "#b8d7c4",
          300: "#8bbd9f",
          400: "#5a9d78",
          500: "#2f7d4f", // primary action
          600: "#1f6340",
          700: "#194e34",
          800: "#143d29",
          900: "#0f2f20",
        },
        // Neutral surfaces
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f6f7f8",
          border: "#e5e7eb",
        },
        // Text
        ink: {
          DEFAULT: "#111827", // primary text
          muted: "#4b5563",   // secondary text
          subtle: "#6b7280",  // tertiary
        },
        // Status
        status: {
          success: "#15803d",
          warning: "#b45309",
          danger: "#b91c1c",
          info: "#1d4ed8",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;