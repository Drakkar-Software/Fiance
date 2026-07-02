import React from "react";
import { View, Text } from "react-native-css/components";
import type { LucideIcon } from "lucide-react-native";
import { foregroundStyle } from "../../primitives/_host/modifiers";
import { Button } from "../../primitives/button";
import { useForgeTheme } from "../../theme/context";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** NativeWind className for the icon background circle. Default: background-900. */
  iconBgClassName?: string;
  /** Color passed to the icon. Default: typography-400. */
  iconColor?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  iconBgClassName = "bg-background-900",
  iconColor = "rgb(163, 163, 163)",
}: EmptyStateProps) {
  const { colors } = useForgeTheme();
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className={`w-24 h-24 rounded-full ${iconBgClassName} items-center justify-center mb-5`}>
        <Icon size={40} color={iconColor} />
      </View>
      <Text className="text-lg font-semibold text-typography-900 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-sm text-typography-400 mt-2 text-center leading-5">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        // Full-width (within the padded empty-state column) so the CTA is a
        // comfortable, prominent pill — never the tiny hug-content button the
        // native filled variant used to produce. variant="text" + custom fill +
        // foregroundStyle avoids the .borderedProminent chrome halo.
        <View className="mt-6 self-stretch">
          <Button
            fill
            variant="text"
            label={actionLabel}
            onPress={onAction}
            modifiers={[foregroundStyle(colors.onPrimary)]}
            style={{ backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 16 }}
          />
        </View>
      )}
    </View>
  );
}
