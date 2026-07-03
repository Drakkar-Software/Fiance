import React from "react";
import { View, Text } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Users, Wallet, Clock } from "lucide-react-native";
import { Display } from "@/components/Display";
import { MarketingLink } from "@/components/marketing/MarketingLink";
import { theme as GP } from "@/lib/theme";
import { localizedPath } from "@/lib/seo-urls";

export type FreeToolId = "seatingChart" | "budget" | "timeline";

const TOOL_PATHS: Record<FreeToolId, string> = {
  seatingChart: "/tools/seating-chart",
  budget: "/tools/budget-calculator",
  timeline: "/tools/timeline",
};

const TOOL_ICONS: Record<FreeToolId, { Icon: typeof Users; tint: string; color: string }> = {
  seatingChart: { Icon: Users, tint: GP.oliveSoft, color: GP.olive },
  budget: { Icon: Wallet, tint: GP.claySoft, color: GP.clay },
  timeline: { Icon: Clock, tint: GP.blueSoft, color: GP.blue },
};

function ToolCard({
  id,
  title,
  description,
  cta,
  href,
}: {
  id: FreeToolId;
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  const { Icon, tint, color } = TOOL_ICONS[id];
  return (
    <MarketingLink
      href={href as any}
      title={title}
      className="bg-white rounded-2xl p-5 border border-accent-rose-light active:opacity-80 hover:shadow-lg"
      style={{ flex: 1, minWidth: 220 }}
    >
      <View
        className="items-center justify-center rounded-2xl mb-4"
        style={{ width: 48, height: 48, backgroundColor: tint }}
      >
        <Icon size={22} color={color} />
      </View>
      <Text className="text-base font-semibold text-typography-900 mb-1">
        {title}
      </Text>
      <Text className="text-sm text-typography-500 leading-5 mb-4">
        {description}
      </Text>
      <Text className="text-sm font-semibold text-primary-500">{cta} →</Text>
    </MarketingLink>
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
  const { t, i18n } = useTranslation("marketing");
  const lang = i18n.language === "en" ? "en" : "fr";

  if (toolIds.length === 0) return null;

  return (
    <View className={className}>
      <View style={{ maxWidth: 1100, width: "100%", alignSelf: "center" }}>
        {showHeader && (
          <>
            <Display
              as="h2"
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
              id={id}
              title={t(`landing.tools.${id}.title`)}
              description={t(`landing.tools.${id}.description`)}
              cta={t(`landing.tools.${id}.cta`)}
              href={localizedPath(lang, TOOL_PATHS[id])}
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
