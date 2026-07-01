import type { ForgeTheme } from "./types";

export const defaultTheme: ForgeTheme = {
  colors: {
    primary: "#3B82F6",     // blue-500
    destructive: "#EF4444", // red-500
    onPrimary: "#FFFFFF",
    surface: "#FFFFFF", // matches --color-background-0 (light) in tailwind/theme.css
  },
};
