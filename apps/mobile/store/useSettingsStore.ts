import { Platform } from "react-native";
import { create } from "zustand";
import { secureGet, secureSet } from "@/lib/secure-store";
import { getLocales } from "expo-localization";
import i18n from "@/i18n";

type Language = "en" | "fr";
type ColorScheme = "system" | "light" | "dark";

const COLOR_SCHEME_KEY = "wos_color_scheme";

interface SettingsState {
  language: Language;
  notificationsEnabled: boolean;
  dayOfReminderLeadMinutes: number;
  colorScheme: ColorScheme;
  setLanguage: (lang: Language) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDayOfReminderLeadMinutes: (minutes: number) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  loadLanguage: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  loadColorScheme: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: "fr",
  notificationsEnabled: Platform.OS !== "web",
  dayOfReminderLeadMinutes: 10,
  colorScheme: "light",
  setLanguage: (lang) => {
    set({ language: lang });
    i18n.changeLanguage(lang);
    secureSet("app_language", lang);
  },
  setNotificationsEnabled: (enabled) => {
    set({ notificationsEnabled: enabled });
    secureSet("notifications_enabled", enabled ? "true" : "false");
  },
  setDayOfReminderLeadMinutes: (minutes) => {
    set({ dayOfReminderLeadMinutes: minutes });
    secureSet("day_of_reminder_lead_minutes", String(minutes));
  },
  setColorScheme: (scheme) => {
    set({ colorScheme: scheme });
    if (Platform.OS === "web") {
      try { localStorage.setItem(COLOR_SCHEME_KEY, scheme); } catch {}
    } else {
      secureSet(COLOR_SCHEME_KEY, scheme);
    }
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
    const storedLead = await secureGet("day_of_reminder_lead_minutes");
    const parsedLead = storedLead != null ? parseInt(storedLead, 10) : NaN;
    if (!isNaN(parsedLead)) {
      set({ dayOfReminderLeadMinutes: parsedLead });
    }
    // Default remains 10 if never set
  },
  loadColorScheme: async () => {
    let stored: string | null = null;
    if (Platform.OS === "web") {
      try { stored = localStorage.getItem(COLOR_SCHEME_KEY); } catch {}
    } else {
      stored = await secureGet(COLOR_SCHEME_KEY);
    }
    if (stored === "light" || stored === "dark") {
      set({ colorScheme: stored });
    }
    // "system" stored from a previous version is discarded; default "light" remains
  },
}));
