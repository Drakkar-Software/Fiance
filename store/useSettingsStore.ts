import { Platform } from "react-native";
import { create } from "zustand";
import { secureGet, secureSet } from "@/lib/secure-store";
import { getLocales } from "expo-localization";
import i18n from "@/i18n";

type Language = "en" | "fr";

interface SettingsState {
  language: Language;
  notificationsEnabled: boolean;
  setLanguage: (lang: Language) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  loadLanguage: () => Promise<void>;
  loadNotifications: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: "fr",
  notificationsEnabled: Platform.OS !== "web",
  setLanguage: (lang) => {
    set({ language: lang });
    i18n.changeLanguage(lang);
    secureSet("app_language", lang);
  },
  setNotificationsEnabled: (enabled) => {
    set({ notificationsEnabled: enabled });
    secureSet("notifications_enabled", enabled ? "true" : "false");
  },
  loadLanguage: async () => {
    const stored = await secureGet("app_language");
    if (stored === "en" || stored === "fr") {
      set({ language: stored });
      i18n.changeLanguage(stored);
    } else {
      const deviceLang = getLocales()[0]?.languageCode ?? "fr";
      const lang: Language = deviceLang === "en" ? "en" : "fr";
      set({ language: lang });
      i18n.changeLanguage(lang);
    }
  },
  loadNotifications: async () => {
    if (Platform.OS === "web") {
      set({ notificationsEnabled: false });
      return;
    }
    const stored = await secureGet("notifications_enabled");
    if (stored === "true" || stored === "false") {
      set({ notificationsEnabled: stored === "true" });
    }
    // Default remains true on native if never set
  },
}));
