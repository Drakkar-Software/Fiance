import { useEffect, useRef } from "react";
import { View, ScrollView } from "react-native-css/components";
import { Slot, useLocalSearchParams, usePathname } from "expo-router";
import { I18nextProvider } from "react-i18next";
import { getI18nForLang } from "@/i18n";
import { normalizeLang } from "@/lib/seo-urls";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

/**
 * Static export prerenders this segment once per `generateStaticParams` entry
 * (fr, en). Wrapping the subtree in an I18nextProvider bound to that locale's
 * cloned instance means every `useTranslation()` below resolves the right
 * language — no per-component changes needed beyond dropping direct reads of
 * the default `i18n` singleton (which never changes language here).
 */
export function generateStaticParams() {
  return [{ lang: "fr" }, { lang: "en" }];
}

export default function MarketingLocaleLayout() {
  const { lang } = useLocalSearchParams<{ lang: string }>();
  const pathname = usePathname();
  const scrollRef = useRef<any>(null);
  const i18nInstance = getI18nForLang(normalizeLang(lang));

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [pathname]);

  return (
    <I18nextProvider i18n={i18nInstance}>
      <View style={{ flex: 1 }}>
        <MarketingNav />
        <ScrollView ref={scrollRef} style={{ flex: 1 }} className="bg-accent-cream">
          <Slot />
          <MarketingFooter />
        </ScrollView>
      </View>
    </I18nextProvider>
  );
}
