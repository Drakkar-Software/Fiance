import { Platform, useWindowDimensions } from "react-native";

const DESKTOP_BREAKPOINT = 1024;

/** True on web when the viewport is >= 1024px wide. Always false on native. */
export function useIsWideScreen(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= DESKTOP_BREAKPOINT;
}
