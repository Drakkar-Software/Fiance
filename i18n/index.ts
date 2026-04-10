import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";

import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";
import enGuests from "./locales/en/guests.json";
import enVendors from "./locales/en/vendors.json";
import enPlanning from "./locales/en/planning.json";
import enBudget from "./locales/en/budget.json";
import enIdeas from "./locales/en/ideas.json";
import enSettings from "./locales/en/settings.json";
import enWeddingPage from "./locales/en/wedding-page.json";
import enSeo from "./locales/en/seo.json";
import enMarketing from "./locales/en/marketing.json";

import frCommon from "./locales/fr/common.json";
import frDashboard from "./locales/fr/dashboard.json";
import frGuests from "./locales/fr/guests.json";
import frVendors from "./locales/fr/vendors.json";
import frPlanning from "./locales/fr/planning.json";
import frBudget from "./locales/fr/budget.json";
import frIdeas from "./locales/fr/ideas.json";
import frSettings from "./locales/fr/settings.json";
import frWeddingPage from "./locales/fr/wedding-page.json";
import frSeo from "./locales/fr/seo.json";
import frMarketing from "./locales/fr/marketing.json";

const deviceLang = getLocales()[0]?.languageCode ?? "fr";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  lng: deviceLang === "en" ? "en" : "fr",
  fallbackLng: "fr",
  ns: [
    "common",
    "dashboard",
    "guests",
    "vendors",
    "planning",
    "budget",
    "ideas",
    "settings",
    "wedding-page",
    "seo",
    "marketing",
  ],
  defaultNS: "common",
  resources: {
    en: {
      common: enCommon,
      dashboard: enDashboard,
      guests: enGuests,
      vendors: enVendors,
      planning: enPlanning,
      budget: enBudget,
      ideas: enIdeas,
      settings: enSettings,
      "wedding-page": enWeddingPage,
      seo: enSeo,
      marketing: enMarketing,
    },
    fr: {
      common: frCommon,
      dashboard: frDashboard,
      guests: frGuests,
      vendors: frVendors,
      planning: frPlanning,
      budget: frBudget,
      ideas: frIdeas,
      settings: frSettings,
      "wedding-page": frWeddingPage,
      seo: frSeo,
      marketing: frMarketing,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
