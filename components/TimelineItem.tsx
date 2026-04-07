import React from "react";
import { View, Pressable } from "react-native";

interface TimelineItemProps {
  left: React.ReactNode;
  showConnector?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
}

export function TimelineItem({
  left,
  showConnector = false,
  onPress,
  children,
}: TimelineItemProps) {
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      {...(onPress ? { onPress } : {})}
      className="flex-row active:opacity-80"
    >
      <View className="w-14 items-center mr-3">
        {left}
        {showConnector && (
          <View className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2 mb-0" />
        )}
      </View>
      <View className="flex-1">{children}</View>
    </Wrapper>
  );
}
