import React from "react";
import { Platform } from "react-native";
import BottomSheetNative, { BottomSheetView } from "@expo/ui/community/bottom-sheet";

interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  /** Paint the sheet background with this color (all platforms, via backgroundStyle). */
  backgroundColor?: string;
}

/**
 * Cross-platform modal shell: @expo/ui community BottomSheet drop-in.
 * SwiftUI sheet on iOS, Material3 ModalBottomSheet on Android, vaul drawer on web —
 * single import, no platform branching, no native module touched on web.
 */
export function BottomSheet({ visible, onDismiss, children, backgroundColor }: BottomSheetProps) {
  return (
    <BottomSheetNative
      index={visible ? 0 : -1}
      enablePanDownToClose
      onDismiss={onDismiss}
      backgroundStyle={backgroundColor ? { backgroundColor } : undefined}
      // iOS: fitToContents re-measures + resizes the sheet after present, which
      // desyncs the RNHostView touch handler (rows show a press state but onPress
      // never fires). Static medium/large detents skip that post-present resize.
      {...(Platform.OS === "ios" ? { enableDynamicSizing: false } : {})}
    >
      <BottomSheetView>{children}</BottomSheetView>
    </BottomSheetNative>
  );
}
