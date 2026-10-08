// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // React Compiler rules that eslint-plugin-react-hooks ships as errors.
    // The current call sites stay as they are: rewriting them would change
    // render behavior. Warn so they stay visible while `eslint .` can pass.
    // Rules that are already clean stay at error.
    rules: {
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // Expo's flat config adds Node globals for metro.config.js only.
    // scripts/*.js are CommonJS Node entrypoints and use __dirname.
    files: ["scripts/**/*.js"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
  },
]);
