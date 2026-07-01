import React from "react";
import { View, TextInput, Pressable } from "react-native-css/components";
import { Search, XCircle } from "lucide-react-native";

// Local override of seahorse's SearchBar: seahorse hardcodes the inner box to
// bg-background-0/border-outline-100 (pure white + grey hairline), which reads
// as an out-of-place box on the warm Garden Press paper. This version is a
// compact, fixed-height field: a lighter card fill sits inset on the paper
// with a warm hairline border (no floating shadow) for a refined native feel.

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  right?: React.ReactNode;
  className?: string;
}

export function SearchBar({ value, onChangeText, placeholder, right, className }: SearchBarProps) {
  return (
    <View className={className}>
      <View className="flex-row items-center h-11 bg-accent-card border border-hair rounded-lg px-3">
        <Search size={18} color="#8a8373" />
        <TextInput
          className="flex-1 ml-2 text-base text-ink"
          placeholder={placeholder}
          placeholderTextColor="#8a8373"
          value={value}
          onChangeText={onChangeText}
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText("")} hitSlop={8} className="ml-1.5">
            <XCircle size={18} color="#8a8373" />
          </Pressable>
        )}
        {right}
      </View>
    </View>
  );
}
