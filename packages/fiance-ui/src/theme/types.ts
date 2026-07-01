export interface ForgeTheme {
  colors: {
    /** Used for interactive elements with inline styles (FAB shadow, toggle switch, header button).
     * Components using NativeWind `primary-*` class tokens are themed via Tailwind config, not this value. */
    primary: string;
    destructive: string;
  };
}
