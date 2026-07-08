import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import Svg, { Path } from "react-native-svg";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { theme as GP } from "@/lib/theme";
import { ANDROID_STORE_URL, IOS_STORE_URL } from "@/lib/store-links";

// Apple mark, drawn in the badge text color.
const APPLE_GLYPH =
  "M17.05 12.04c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.94 1.16 9.21.77 1.11 1.69 2.36 2.89 2.31 1.16-.05 1.6-.75 3-.75s1.79.75 3.01.72c1.24-.02 2.03-1.13 2.79-2.25.88-1.29 1.24-2.54 1.26-2.61-.03-.01-2.42-.93-2.44-3.69zM14.77 4.93c.64-.78 1.07-1.86.95-2.93-.92.04-2.03.61-2.69 1.38-.59.69-1.11 1.79-.97 2.85 1.02.08 2.07-.52 2.71-1.3z";

function AppleIcon() {
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="#ffffff">
      <Path d={APPLE_GLYPH} />
    </Svg>
  );
}

// Google Play tri-fold play mark, themed to the Garden Press blue.
function PlayIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d="M3.6 2.4c-.3.3-.5.8-.5 1.4v16.4c0 .6.2 1.1.5 1.4l.1.1 9.2-9.2v-.2L3.6 2.4z" fill={GP.blue} />
      <Path d="M16 15.3l-3.1-3.1v-.2L16 8.9l.1.1 3.6 2.1c1 .6 1 1.6 0 2.2l-3.7 2z" fill="#7c9fc4" />
      <Path d="M16.1 15.2L12.9 12l-9.3 9.3c.4.3.9.3 1.5 0l11-6.1z" fill="#b58fc9" />
      <Path d="M16.1 8.8L5.1 2.7c-.6-.3-1.1-.3-1.5 0l9.3 9.3 3.2-3.2z" fill={GP.blue} fillOpacity={0.7} />
    </Svg>
  );
}

function StoreBadge({
  href,
  eyebrow,
  name,
  label,
  icon,
}: {
  href: string;
  eyebrow: string;
  name: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href as any} asChild>
      <Pressable
        accessibilityLabel={label}
        className="flex-row items-center active:opacity-80 hover:opacity-95"
        style={{
          backgroundColor: GP.ink,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.14)",
          borderRadius: 14,
          gap: 11,
          paddingHorizontal: 18,
          paddingVertical: 11,
          minHeight: 56,
        }}
      >
        {icon}
        <View>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 10.5,
              letterSpacing: 0.3,
              color: "rgba(255,255,255,0.62)",
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

/** App Store + Google Play download links, styled as Garden Press ink cards. */
export function StoreBadges({ center }: { center?: boolean }) {
  const { t } = useTranslation("marketing");
  return (
    <View className={`flex-row flex-wrap gap-3 ${center ? "justify-center" : ""}`}>
      <StoreBadge
        href={IOS_STORE_URL}
        eyebrow={t("landing.stores.ios.eyebrow")}
        name={t("landing.stores.ios.name")}
        label={t("landing.stores.ios.label")}
        icon={<AppleIcon />}
      />
      <StoreBadge
        href={ANDROID_STORE_URL}
        eyebrow={t("landing.stores.android.eyebrow")}
        name={t("landing.stores.android.name")}
        label={t("landing.stores.android.label")}
        icon={<PlayIcon />}
      />
    </View>
  );
}
