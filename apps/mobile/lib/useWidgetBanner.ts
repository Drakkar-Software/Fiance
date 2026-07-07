import { useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Home banner that tells the user how to add the iOS widget. iOS only, shown
// once the user has some agenda/tasks worth glancing at, dismissible forever
// (persisted app-global in AsyncStorage, like the store-review flag).

const KEY = "wos_widget_banner_dismissed";

export function useWidgetBanner(hasContent: boolean) {
  // Start hidden so it never flashes before the flag loads (or off iOS).
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    AsyncStorage.getItem(KEY)
      .then((v) => setDismissed(v === "1"))
      .catch(() => {});
  }, []);

  const dismiss = () => {
    setDismissed(true);
    AsyncStorage.setItem(KEY, "1").catch(() => {});
  };

  return { visible: Platform.OS === "ios" && hasContent && !dismissed, dismiss };
}
