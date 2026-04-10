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
  presets: [require("nativewind/preset"), require("@drakkar.software/seahorse/tailwind-preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
        },
        accent: {
          gold: "#C9956B",
          "gold-light": "#E8D5C0",
          sage: "#7B9A7B",
          "sage-light": "#D5E5D0",
          blush: "#F2E0DA",
          cream: "#FBF7F2",
          rose: "#E8B4B8",
          "rose-light": "#F5DDE0",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
