import { useEffect, useRef, useState } from "react";
import { View, ScrollView } from "react-native-css/components";
import { Slot, useLocalSearchParams, usePathname } from "expo-router";
import { I18nextProvider } from "react-i18next";
import { getI18nForLang } from "@/i18n";
import { normalizeLang } from "@/lib/seo-urls";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

const SCROLLED_THRESHOLD = 12;

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
  const [scrolled, setScrolled] = useState(false);
  const i18nInstance = getI18nForLang(normalizeLang(lang));

  useEffect(() => {
    // Scrolling to 0 fires `onScroll` with contentOffset.y === 0, which resets
    // `scrolled` on its own — no separate setState needed here.
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [pathname]);

  return (
    <I18nextProvider i18n={i18nInstance}>
      <View style={{ flex: 1 }}>
        <MarketingNav scrolled={scrolled} />
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          className="bg-accent-cream"
          scrollEventThrottle={16}
          onScroll={(e: any) => {
            const y = e.nativeEvent.contentOffset.y;
            setScrolled((prev) => (y > SCROLLED_THRESHOLD ? true : y > SCROLLED_THRESHOLD - 4 ? prev : false));
          }}
        >
          <Slot />
          <MarketingFooter />
        </ScrollView>
      </View>
    </I18nextProvider>
  );
}
