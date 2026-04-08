import type { StorybookConfig } from "storybook/internal/types";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-mcp"],
  framework: "@storybook/react-vite",
  docs: {
    autodocs: "tag",
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native": "react-native-web-lite",
      "react-native-svg": "react-native-svg/css",
      "lucide-react-native": "lucide-react",
      "expo-localization": resolve(__dirname, "mocks/expo-localization.ts"),
      "@": resolve(__dirname, ".."),
    };
    config.resolve.extensions = [
      ".web.tsx",
      ".web.ts",
      ".web.js",
      ".tsx",
      ".ts",
      ".js",
    ];
    config.define = {
      ...(config.define || {}),
      "process.env": "{}",
      __DEV__: "true",
    };
    return config;
  },
};
export default config;
