import React from "react";
import { View, TextInput, Pressable } from "react-native";
import { Search, XCircle } from "lucide-react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  right?: React.ReactNode;
  className?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder,
  right,
  className,
}: SearchBarProps) {
  return (
    <View className={className}>
      <View className="flex-row items-center bg-white dark:bg-gray-900 rounded-xl px-3.5 py-2.5 border border-gray-100 dark:border-gray-800">
        <Search size={18} color="#C0C0C8" />
        <TextInput
          className="flex-1 ml-2.5 text-base text-gray-900 dark:text-white"
          placeholder={placeholder}
          placeholderTextColor="#C0C0C8"
          value={value}
          onChangeText={onChangeText}
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText("")}>
            <XCircle size={18} color="#C0C0C8" />
          </Pressable>
        )}
        {right}
      </View>
    </View>
  );
}
