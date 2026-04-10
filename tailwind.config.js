const seahorsePreset = require("@drakkar.software/seahorse/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [seahorsePreset],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.stories.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
    },
  },
  plugins: [],
};
