import React, { useState } from "react";
import { Modal, View, Text, Pressable } from "react-native-css/components";
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

export function StackMenu({ items }: StackMenuProps) {
  const [open, setOpen] = useState(false);

  const handleItem = (onPress: () => void) => {
    setOpen(false);
    onPress();
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="w-9 h-9 items-center justify-center rounded-lg active:opacity-60 mr-1"
        hitSlop={8}
      >
        <EllipsisVertical size={20} color="#6B7280" />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        {/* Overlay — tap outside to dismiss */}
        <Pressable
          className="flex-1"
          onPress={() => setOpen(false)}
        >
          {/* Menu card — top-right of screen, aligned under header */}
          <View className="absolute top-14 right-4 bg-accent-card rounded-2xl shadow-lg border border-hair overflow-hidden min-w-[180px]">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <Pressable
                  key={index}
                  onPress={() => handleItem(item.onPress)}
                  className={`flex-row items-center px-4 py-3.5 active:bg-accent-paper dark:active:bg-accent-card ${
                    index > 0 ? "border-t border-hair" : ""
                  }`}
                >
                  {Icon && (
                    <View className="mr-3">
                      <Icon size={16} color="#6B7280" />
                    </View>
                  )}
                  <Text className="text-sm font-medium text-ink-soft">
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
