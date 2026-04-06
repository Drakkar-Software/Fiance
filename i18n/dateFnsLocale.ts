import { fr } from "date-fns/locale";
import { enUS } from "date-fns/locale";
import i18n from "./index";

export const getDateLocale = () => (i18n.language === "fr" ? fr : enUS);
