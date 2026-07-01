import React from "react";
import { View, Text } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/Display";

const STAT_KEYS = ["offline", "noAds", "encrypted", "vendors"] as const;

/** Dark stat strip below the hero — quick-scan trust numbers. */
export function MarqueeBar() {
  const { t } = useTranslation("marketing");

  return (
    <View className="w-full bg-typography-900" style={{ paddingVertical: 22, paddingHorizontal: 24 }}>
      <View
        className="flex-row flex-wrap items-center justify-center"
        style={{ gap: 14, columnGap: 40, maxWidth: 1140, width: "100%", alignSelf: "center" }}
      >
        {STAT_KEYS.map((key) => (
          <View key={key} className="flex-row items-center" style={{ gap: 10 }}>
            <Display size={26} weight="700" color="#f5e6a8">
              {t(`landing.marquee.${key}.stat`)}
            </Display>
            <Text className="text-typography-400" style={{ fontSize: 13, lineHeight: 16, maxWidth: 120 }}>
              {t(`landing.marquee.${key}.label`)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
