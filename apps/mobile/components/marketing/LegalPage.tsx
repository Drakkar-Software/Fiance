import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { useRouter } from "expo-router";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { getLegalDocs } from "@/lib/legal";
import { usePageMeta } from "@/lib/use-page-meta";
import i18n from "@/i18n";

interface LegalPageProps {
  docKey: "terms" | "privacy";
  metaTitle: string;
  metaDescription: string;
  metaCanonical: string;
}

export function LegalPage({ docKey, metaTitle, metaDescription, metaCanonical }: LegalPageProps) {
  const router = useRouter();
  const lang = i18n.language === "en" ? "en" : "fr";
  const docs = getLegalDocs(lang);
  const doc = docs[docKey];
  const isEn = lang === "en";

  usePageMeta({ title: metaTitle, description: metaDescription, canonical: metaCanonical });

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/" as any);
  };

  return (
    <View className="w-full">
      {/* Hero */}
      <View className="w-full py-16 px-6 bg-accent-cream">
        <View style={{ maxWidth: 700, width: "100%", alignSelf: "center" }}>
          <Script size={20} style={{ marginBottom: 12 }}>
            Fiancé · {isEn ? "Legal" : "Légal"}
          </Script>
          <Display size={44} weight="700" style={{ marginBottom: 12, lineHeight: 52 }}>
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
              <Display size={19} weight="600" style={{ marginBottom: 12, lineHeight: 26 }}>
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
            <Pressable onPress={handleBack} className="active:opacity-60">
              <Text className="text-primary-500 font-semibold" style={{ fontSize: 15 }}>
                ← {isEn ? "Back to Fiancé" : "Retour à Fiancé"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
