import React from "react";
import { Linking } from "react-native";
import { Text } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { parseInlineMarkdown } from "@/lib/rich-text-parse";
import { localizedPath } from "@/lib/seo-urls";

interface RichTextProps {
  children: string;
  className?: string;
  style?: object;
  linkClassName?: string;
}

/** Render paragraph text with optional inline markdown links. */
export function RichText({
  children,
  className,
  style,
  linkClassName = "text-primary-500 underline font-semibold",
}: RichTextProps) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const segments = parseInlineMarkdown(children);

  // Blog content authors write relative links like "/tools/budget-calculator" —
  // prefix with the current locale so they land on a route that actually exists.
  const openHref = (href: string) => {
    if (href.startsWith("/")) {
      const lang = i18n.language === "en" ? "en" : "fr";
      router.push(localizedPath(lang, href) as any);
      return;
    }
    void Linking.openURL(href);
  };

  return (
    <Text className={className} style={style}>
      {segments.map((segment, i) => {
        if (segment.type === "text") {
          return <Text key={i}>{segment.value}</Text>;
        }
        return (
          <Text
            key={i}
            accessibilityRole="link"
            className={linkClassName}
            onPress={() => openHref(segment.href)}
          >
            {segment.label}
          </Text>
        );
      })}
    </Text>
  );
}
