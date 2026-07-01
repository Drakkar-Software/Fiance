/** Shared helpers for the /fr /en localized marketing URL structure. */

export const BASE_URL = "https://fiance.drakkar.software";

export type MarketingLang = "fr" | "en";

export function normalizeLang(lang: string | string[] | undefined): MarketingLang {
  return lang === "en" ? "en" : "fr";
}

/** Bare path ("/", "/feature/budget") → locale-prefixed path ("/fr", "/fr/feature/budget"). */
export function localizedPath(lang: MarketingLang, path: string): string {
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/** Bare path → absolute locale URL, for canonical/og/JSON-LD use. */
export function localizedUrl(lang: MarketingLang, path: string): string {
  return `${BASE_URL}${localizedPath(lang, path)}`;
}

/** Canonical + fr/en/x-default alternates for a bare marketing path. */
export function localizedSeo(lang: MarketingLang, path: string) {
  return {
    canonical: localizedUrl(lang, path),
    alternates: {
      fr: localizedUrl("fr", path),
      en: localizedUrl("en", path),
    },
  };
}

/** Swap the leading /fr or /en segment of a pathname for another locale. */
export function swapLocaleInPath(pathname: string, lang: MarketingLang): string {
  const rest = pathname.replace(/^\/(fr|en)(?=\/|$)/, "");
  return localizedPath(lang, rest || "/");
}
