import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { ChevronRight, X } from "lucide-react-native";
import { theme as GP } from "@/lib/theme";

/**
 * Generic dashboard banner card (icon + title + description, optional press /
 * dismiss). Extracted from the home PWA-install / resync banners so the widget
 * banner and any future banner share one look.
 */
interface HomeBannerProps {
  /** Leading icon element (e.g. a lucide icon). */
  icon: React.ReactNode;
  /** Icon circle background. Defaults to the clay-soft tint. */
  iconBg?: string;
  title: string;
  description: string;
  /** Makes the whole card pressable. */
  onPress?: () => void;
  /** Shows a trailing dismiss "X" wired to this callback. */
  onDismiss?: () => void;
  /** Shows a trailing chevron (ignored when onDismiss is set). */
  showChevron?: boolean;
}

export function HomeBanner({
  icon,
  iconBg,
  title,
  description,
  onPress,
  onDismiss,
  showChevron,
}: HomeBannerProps) {
  const content = (
    <>
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: iconBg ?? GP.claySoft }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-ink">{title}</Text>
        <Text className="text-xs text-mute mt-0.5">{description}</Text>
      </View>
      {onDismiss ? (
        <Pressable onPress={onDismiss} className="p-1">
          <X size={18} color={GP.mute} />
        </Pressable>
      ) : showChevron ? (
        <ChevronRight size={18} color={GP.mute} />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className="bg-accent-card rounded-2xl px-4 py-3 mb-3 border border-hair flex-row items-center active:opacity-70"
      >
        {content}
      </Pressable>
    );
  }
  return (
    <View className="bg-accent-card rounded-2xl px-4 py-3 mb-3 border border-hair flex-row items-center">
      {content}
    </View>
  );
}
