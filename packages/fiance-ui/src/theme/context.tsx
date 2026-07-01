import React, { createContext, useContext } from "react";
import type { ForgeTheme } from "./types";
import { defaultTheme } from "./default";

const ForgeThemeContext = createContext<ForgeTheme>(defaultTheme);

interface ForgeThemeProviderProps {
  theme?: {
    colors?: Partial<ForgeTheme["colors"]>;
  };
  children: React.ReactNode;
}

export function ForgeThemeProvider({ theme, children }: ForgeThemeProviderProps) {
  const merged: ForgeTheme = {
    ...defaultTheme,
    ...theme,
    colors: { ...defaultTheme.colors, ...theme?.colors },
  };
  return (
    <ForgeThemeContext.Provider value={merged}>
      {children}
    </ForgeThemeContext.Provider>
  );
}

export function useForgeTheme(): ForgeTheme {
  return useContext(ForgeThemeContext);
}
