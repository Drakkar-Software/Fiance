import { format as fnsFormat, isValid, type Locale } from "date-fns";
import { fr } from "date-fns/locale";
import { enUS } from "date-fns/locale";
import i18n from "./index";

export const getDateLocale = () => (i18n.language === "fr" ? fr : enUS);

/** format() wrapper that returns fallback instead of throwing on invalid dates */
export function safeFormat(
  date: Date | number,
  fmt: string,
  opts?: { locale?: Locale },
): string {
  if (!isValid(date)) return "—";
  return fnsFormat(date, fmt, opts);
}
