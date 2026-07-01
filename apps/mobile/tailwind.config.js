/**
 * NOTE: This config is NOT consumed by the Tailwind v4 CSS pipeline.
 * The project uses @tailwindcss/postcss (v4) with CSS-first configuration.
 * All theme values (accent colors, primary overrides) live in global.css.
 * This file is retained for IDE tooling and Storybook compatibility only.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.stories.{ts,tsx}",
  ],
  darkMode: "class",
  presets: [require("nativewind/preset"), require("@fiance/ui/tailwind-preset")],
  theme: {
    extend: {
      colors: {
        // Garden Press primary — clay (warm rust-brown)
        primary: {
          50: "#f8e9e0",
          100: "#f0d5c5",
          200: "#e6b89e",
          300: "#d89879",
          400: "#c77c5c",
          500: "#b96a4a",
          600: "#a1573c",
          700: "#84442f",
          800: "#683525",
          900: "#4f271b",
        },
        // Garden Press accent palette
        accent: {
          clay:          "#b96a4a",
          "clay-soft":   "#efd9cd",
          olive:         "#6e7a4a",
          "olive-soft":  "#dde3cc",
          mustard:       "#c9922f",
          "mustard-soft":"#f2e2bd",
          paper:         "#f2ece0",
          card:          "#fdfaf1",
          postit:        "#f5e6a8",
          blue:          "#6b8aa3",
          "blue-soft":   "#d6e0e8",
          // deprecated aliases
          gold:          "#c9922f",
          "gold-light":  "#f2e2bd",
          sage:          "#6e7a4a",
          "sage-light":  "#dde3cc",
          blush:         "#efd9cd",
          cream:         "#f2ece0",
          rose:          "#b96a4a",
          "rose-light":  "#efd9cd",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        script:  ["Caveat", "cursive"],
        sans:    ["Inter", "-apple-system", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
