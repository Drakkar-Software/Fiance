import React from "react";
import { View, Text } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { MarketingLink } from "@/components/marketing/MarketingLink";
import { getLegalDocs } from "@/lib/legal";
import { Seo } from "@/components/Seo";
import { localizedSeo, localizedPath } from "@/lib/seo-urls";

interface LegalPageProps {
  docKey: "terms" | "privacy";
  metaTitle: string;
  metaDescription: string;
}

export function LegalPage({ docKey, metaTitle, metaDescription }: LegalPageProps) {
  const { t, i18n } = useTranslation("marketing");
  const lang = i18n.language === "en" ? "en" : "fr";
  const docs = getLegalDocs(lang);
  const doc = docs[docKey];
  const isEn = lang === "en";
  const seo = localizedSeo(lang, `/${docKey}`);

  return (
    <View className="w-full">
      <Seo title={metaTitle} description={metaDescription} {...seo} />
      {/* Hero */}
      <View className="w-full py-16 px-6 bg-accent-cream">
        <View style={{ maxWidth: 700, width: "100%", alignSelf: "center" }}>
          <Script size={20} style={{ marginBottom: 12 }}>
            Fiancé · {isEn ? "Legal" : "Légal"}
          </Script>
          <Display as="h1" size={44} weight="700" style={{ marginBottom: 12, lineHeight: 52 }}>
            {doc.title}
          </Display>
          <Script size={19} style={{ marginBottom: 20, lineHeight: 27 }}>
            {doc.subtitle}
          </Script>
          <Text className="text-xs font-semibold text-typography-400 uppercase tracking-widest">
            {isEn ? "Last updated" : "Mis à jour"} · {doc.updated}
          </Text>
        </View>
      </View>

      {/* Sections */}
      <View className="w-full bg-white py-16 px-6">
        <View style={{ maxWidth: 700, width: "100%", alignSelf: "center" }}>
          {doc.sections.map((section, i) => (
            <View key={section.title} style={{ marginBottom: 40 }}>
              {/* Number + rule */}
              <View className="flex-row items-center gap-3" style={{ marginBottom: 14 }}>
                <Display size={13} weight="600" color="#b96a4a" style={{ letterSpacing: 1, minWidth: 26 }}>
                  {String(i + 1).padStart(2, "0")}
                </Display>
                <View className="flex-1 h-px bg-accent-rose-light" />
              </View>
              {/* Section title */}
              <Display as="h2" size={19} weight="600" style={{ marginBottom: 12, lineHeight: 26 }}>
                {section.title}
              </Display>
              {/* Paragraphs */}
              {section.paragraphs.map((para, j) => (
                <Text
                  key={j}
                  className="text-typography-500"
                  style={{ fontSize: 15, lineHeight: 26, marginBottom: 12 }}
                >
                  {para}
                </Text>
              ))}
            </View>
          ))}

          {/* Back link */}
          <View className="border-t border-accent-rose-light" style={{ paddingTop: 28, marginTop: 8 }}>
            <MarketingLink href={localizedPath(lang, "/") as any} title={t("legal.backToHome")} className="active:opacity-60">
              <Text className="text-primary-500 font-semibold" style={{ fontSize: 15 }}>
                ← {t("legal.backToHome")}
              </Text>
            </MarketingLink>
          </View>
        </View>
      </View>
    </View>
  );
}
