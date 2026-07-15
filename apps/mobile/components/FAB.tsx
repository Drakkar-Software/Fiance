import React, { type ComponentProps } from "react";
import { View } from "react-native-css/components";
import { FAB as UiFAB } from "@fiance/ui/components";
import { Lock } from "lucide-react-native";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";

interface FABProps extends ComponentProps<typeof UiFAB> {
  /** Free-tier cap reached — tapping still opens the paywall (never disabled),
   * but a small lock badge makes that outcome expected instead of a surprise. */
  locked?: boolean;
}

/** Floating add button, hidden for a view-only collaborator on the current surface.
 * `UiFAB` is itself absolutely positioned (bottom/right) against its screen — the
 * lock badge below is rendered as a sibling (not a wrapper) at matching absolute
 * coordinates so it doesn't change UiFAB's own positioning context. */
export function FAB({ locked = false, ...props }: FABProps) {
  const canEdit = useCanEditHere();
  if (!canEdit) return null;
  return (
    <>
      <UiFAB {...props} />
      {locked && (
        <View
          pointerEvents="none"
          className="w-5 h-5 rounded-full bg-white dark:bg-accent-card items-center justify-center"
          style={{ position: "absolute", bottom: 24 + 56 - 16, right: 24 - 2, elevation: 7 }}
        >
          <View className="w-4 h-4 rounded-full bg-primary-500 items-center justify-center">
            <Lock size={9} color="#fff" />
          </View>
        </View>
      )}
    </>
  );
}
