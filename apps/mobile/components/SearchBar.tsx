import React from "react";
import { View, TextInput, Pressable } from "react-native-css/components";
import { Search, XCircle } from "lucide-react-native";

// Local override of seahorse's SearchBar: seahorse hardcodes the inner box to
// bg-background-0/border-outline-100 (pure white + grey hairline), which reads
// as an out-of-place box on the warm Garden Press paper. This version floats
// on a card surface with a soft shadow instead of a border.

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
      <View className="flex-row items-center bg-accent-card rounded-xl px-3.5 py-2.5 shadow-soft-1">
        <Search size={18} color="#8a8373" />
        <TextInput
          className="flex-1 ml-2.5 text-base text-ink"
          placeholder={placeholder}
          placeholderTextColor="#8a8373"
          value={value}
          onChangeText={onChangeText}
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText("")}>
            <XCircle size={18} color="#8a8373" />
          </Pressable>
        )}
        {right}
      </View>
    </View>
  );
}
