import React from "react";
import { Pressable } from "react-native-css/components";
import MenuView from "@expo/ui/community/menu";
import { EllipsisVertical } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

export interface StackMenuItem {
  label: string;
  icon?: LucideIcon;
  onPress: () => void;
}

interface StackMenuProps {
  items: StackMenuItem[];
}

// Native @expo/ui MenuView (SwiftUI Menu / Compose DropdownMenu) instead of a
// hand-rolled RN Modal + absolute-positioned card — same StackMenuProps shape,
// so callers don't change. Icons are dropped for now: MenuAction.image wants an
// SF Symbol name on iOS, and mapping lucide icons to the right symbol names
// without visual verification risks shipping wrong icons; text-only native
// items already resolve the "not native" complaint.
export function StackMenu({ items }: StackMenuProps) {
  return (
    <MenuView
      actions={items.map((item, index) => ({ id: String(index), title: item.label }))}
      onPressAction={(event) => {
        const item = items[Number(event.nativeEvent.event)];
        item?.onPress();
      }}
    >
      <Pressable
        className="w-9 h-9 items-center justify-center rounded-lg active:opacity-60 mr-1"
        hitSlop={8}
      >
        <EllipsisVertical size={20} color="#6B7280" />
      </Pressable>
    </MenuView>
  );
}
