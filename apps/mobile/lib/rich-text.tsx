import React from "react";
import { Linking } from "react-native";
import { Text } from "react-native-css/components";
import { useRouter } from "expo-router";
import { parseInlineMarkdown } from "@/lib/rich-text-parse";

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
  const segments = parseInlineMarkdown(children);

  const openHref = (href: string) => {
    if (href.startsWith("/")) {
      router.push(href as any);
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
