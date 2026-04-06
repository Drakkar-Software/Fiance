import { create } from "zustand";
import { secureGet, secureSet } from "@/lib/secure-store";
import { getLocales } from "expo-localization";
import i18n from "@/i18n";

type Language = "en" | "fr";

interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void;
  loadLanguage: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: "en",
  setLanguage: (lang) => {
    set({ language: lang });
    i18n.changeLanguage(lang);
    secureSet("app_language", lang);
  },
  loadLanguage: async () => {
    const stored = await secureGet("app_language");
    if (stored === "en" || stored === "fr") {
      set({ language: stored });
      i18n.changeLanguage(stored);
    } else {
      const deviceLang = getLocales()[0]?.languageCode ?? "en";
      const lang: Language = deviceLang === "fr" ? "fr" : "en";
      set({ language: lang });
      i18n.changeLanguage(lang);
    }
  },
}));
