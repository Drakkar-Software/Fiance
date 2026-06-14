import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "../i18n/locales/en/common.json";
import enDashboard from "../i18n/locales/en/dashboard.json";
import enGuests from "../i18n/locales/en/guests.json";
import enVendors from "../i18n/locales/en/vendors.json";
import enPlanning from "../i18n/locales/en/planning.json";
import enBudget from "../i18n/locales/en/budget.json";
import enIdeas from "../i18n/locales/en/ideas.json";
import enSettings from "../i18n/locales/en/settings.json";
import enWeddingPage from "../i18n/locales/en/wedding-page.json";

import frCommon from "../i18n/locales/fr/common.json";
import frDashboard from "../i18n/locales/fr/dashboard.json";
import frGuests from "../i18n/locales/fr/guests.json";
import frVendors from "../i18n/locales/fr/vendors.json";
import frPlanning from "../i18n/locales/fr/planning.json";
import frBudget from "../i18n/locales/fr/budget.json";
import frIdeas from "../i18n/locales/fr/ideas.json";
import frSettings from "../i18n/locales/fr/settings.json";
import frWeddingPage from "../i18n/locales/fr/wedding-page.json";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  lng: "fr",
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
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
