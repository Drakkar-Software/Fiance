import React from "react";
import { Platform } from "react-native";
import { View, Text, ScrollView } from "react-native-css/components";
import { BottomSheet } from "../../primitives/bottom-sheet";
import { useForgeTheme } from "../../theme/context";

interface SheetScaffoldProps {
  visible: boolean;
  onDismiss: () => void;
  /** Sheet heading — rendered with consistent placement/typography across all sheets. */
  title?: string;
  children: React.ReactNode;
  /** Pinned below the content (e.g. action buttons). */
  footer?: React.ReactNode;
  /** Cap the body height and make it scroll (long/variable content). */
  scrollable?: boolean;
  /** Max body height when `scrollable`. */
  maxContentHeight?: number;
  /**
   * iOS static detent(s). Defaults to a compact single detent so short sheets
   * don't open at the tall native medium/large fallback (see the @expo/ui
   * BottomSheet notes in CLAUDE.md). Pass a taller/2-point value for long content.
   */
  snapPoints?: (string | number)[];
}

/**
 * Standard bottom-sheet shell. Uniformizes every sheet: always paints the OS
 * sheet with the theme surface color (so nothing ghosts through the translucent
 * default material), always renders the title in the same place/style, applies
 * consistent rounded-top padding, and defaults to a compact iOS detent. Compose
 * content as `children` and actions as `footer`.
 */
export function SheetScaffold({
  visible,
  onDismiss,
  title,
  children,
  footer,
  scrollable = false,
  maxContentHeight = 460,
  snapPoints,
}: SheetScaffoldProps) {
  const { colors } = useForgeTheme();
  return (
    <BottomSheet
      visible={visible}
      onDismiss={onDismiss}
      backgroundColor={colors.surface}
      snapPoints={snapPoints ?? (Platform.OS === "ios" ? ["45%"] : undefined)}
    >
      <View style={{ backgroundColor: colors.surface }} className="rounded-t-3xl px-5 pt-5 pb-8">
        {title ? (
          <Text className="text-lg font-bold text-typography-900 mb-3">{title}</Text>
        ) : null}
        {scrollable ? (
          <ScrollView
            style={{ maxHeight: maxContentHeight }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
        {footer ? <View className="mt-4">{footer}</View> : null}
      </View>
    </BottomSheet>
  );
}
