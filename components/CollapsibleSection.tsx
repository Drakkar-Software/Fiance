import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";

interface CollapsibleSectionProps {
  title: string;
  count?: number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  count,
  defaultExpanded = true,
  children,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View className="mb-4">
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="flex-row items-center justify-between mt-3 mb-2"
      >
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
          {count != null && (
            <Text className="text-xs text-gray-300 dark:text-gray-600">
              {" "}
              ({count})
            </Text>
          )}
        </Text>
        {expanded ? (
          <ChevronUp size={14} color="#9CA3AF" />
        ) : (
          <ChevronDown size={14} color="#9CA3AF" />
        )}
      </Pressable>
      {expanded && children}
    </View>
  );
}
