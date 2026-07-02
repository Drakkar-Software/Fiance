import React from "react";
import { Linking } from "react-native";
import { Text } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { parseInlineMarkdown } from "@/lib/rich-text-parse";
import { BASE_URL, localizedPath } from "@/lib/seo-urls";

interface RichTextProps {
  children: string;
  className?: string;
  style?: object;
  linkClassName?: string;
}

/** Web: real `<a href>` for internal links so crawlers can follow the site graph. */
export function RichText({
  children,
  className,
  style,
  linkClassName = "text-primary-500 underline font-semibold",
}: RichTextProps) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const segments = parseInlineMarkdown(children);
  const lang = i18n.language === "en" ? "en" : "fr";

  const resolveHref = (href: string): string => {
    if (href.startsWith("/")) {
      return `${BASE_URL}${localizedPath(lang, href)}`;
    }
    return href;
  };

  const openHref = (href: string) => {
    if (href.startsWith("/")) {
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
        const href = resolveHref(segment.href);
        const isInternal = segment.href.startsWith("/");
        if (isInternal) {
          return (
            <a
              key={i}
              href={href}
              className={linkClassName}
              onClick={(event) => {
                event.preventDefault();
                openHref(segment.href);
              }}
            >
              {segment.label}
            </a>
          );
        }
        return (
          <a
            key={i}
            href={href}
            className={linkClassName}
            target="_blank"
            rel="noopener noreferrer"
          >
            {segment.label}
          </a>
        );
      })}
    </Text>
  );
}
