import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import Svg, { Path } from "react-native-svg";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { theme as GP } from "@/lib/theme";
import { ANDROID_STORE_URL, IOS_STORE_URL } from "@/lib/store-links";

const APPLE_GLYPH =
  "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.766z";

const PLAY_GLYPH =
  "M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z";

function StoreBadge({
  href,
  eyebrow,
  name,
  label,
  glyph,
}: {
  href: string;
  eyebrow: string;
  name: string;
  label: string;
  glyph: string;
}) {
  return (
    <Link href={href as any} asChild>
      <Pressable
        accessibilityLabel={label}
        className="flex-row items-center rounded-full active:opacity-70 hover:opacity-90"
        style={{ backgroundColor: GP.ink, gap: 11, paddingHorizontal: 22, paddingVertical: 10, minHeight: 54 }}
      >
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path d={glyph} fill="#ffffff" />
        </Svg>
        <View>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 10,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.72)",
            }}
          >
            {eyebrow}
          </Text>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16.5, color: "#ffffff", marginTop: 1 }}>
            {name}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

/** App Store + Google Play download links, styled as Garden Press ink pills. */
export function StoreBadges({ center }: { center?: boolean }) {
  const { t } = useTranslation("marketing");
  return (
    <View className={`flex-row flex-wrap gap-3 ${center ? "justify-center" : ""}`}>
      <StoreBadge
        href={IOS_STORE_URL}
        eyebrow={t("landing.stores.ios.eyebrow")}
        name={t("landing.stores.ios.name")}
        label={t("landing.stores.ios.label")}
        glyph={APPLE_GLYPH}
      />
      <StoreBadge
        href={ANDROID_STORE_URL}
        eyebrow={t("landing.stores.android.eyebrow")}
        name={t("landing.stores.android.name")}
        label={t("landing.stores.android.label")}
        glyph={PLAY_GLYPH}
      />
    </View>
  );
}
