import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/Display";

export type FreeToolId = "seatingChart" | "budget" | "timeline";

const TOOL_HREFS: Record<FreeToolId, string> = {
  seatingChart: "/tools/seating-chart",
  budget: "/tools/budget-calculator",
  timeline: "/tools/timeline",
};

function ToolCard({
  title,
  description,
  cta,
  href,
}: {
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(href as any)}
      className="bg-white rounded-2xl p-5 border border-accent-rose-light active:opacity-80"
      style={{ flex: 1, minWidth: 220 }}
    >
      <Text className="text-base font-semibold text-typography-900 mb-1">
        {title}
      </Text>
      <Text className="text-sm text-typography-500 leading-5 mb-4">
        {description}
      </Text>
      <Text className="text-sm font-semibold text-primary-500">{cta} →</Text>
    </Pressable>
  );
}

interface FreeToolsStripProps {
  toolIds: FreeToolId[];
  /** Show section title and subtitle (landing.tools.*). Default true. */
  showHeader?: boolean;
  className?: string;
}

export function FreeToolsStrip({
  toolIds,
  showHeader = true,
  className = "w-full py-12 px-6 bg-accent-cream",
}: FreeToolsStripProps) {
  const { t } = useTranslation("marketing");

  if (toolIds.length === 0) return null;

  return (
    <View className={className}>
      <View style={{ maxWidth: 1100, width: "100%", alignSelf: "center" }}>
        {showHeader && (
          <>
            <Display
              size={28}
              weight="600"
              style={{ textAlign: "center", marginBottom: 8 }}
            >
              {t("landing.tools.title")}
            </Display>
            <Text className="text-base text-typography-500 text-center mb-8">
              {t("landing.tools.subtitle")}
            </Text>
          </>
        )}
        <View className="flex-row flex-wrap gap-4">
          {toolIds.map((id) => (
            <ToolCard
              key={id}
              title={t(`landing.tools.${id}.title`)}
              description={t(`landing.tools.${id}.description`)}
              cta={t(`landing.tools.${id}.cta`)}
              href={TOOL_HREFS[id]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

/** Map blog category to the most relevant free online tools. */
export function getBlogToolIds(categoryKey: string): FreeToolId[] {
  switch (categoryKey) {
    case "budget":
      return ["budget"];
    case "seating":
      return ["seatingChart"];
    case "guests":
      return ["budget", "seatingChart"];
    case "vendors":
      return ["budget"];
    case "ideas":
      return ["budget"];
    case "planning":
    default:
      return ["budget", "seatingChart", "timeline"];
  }
}
