import React from "react";
import { Platform, useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { useSettingsStore } from "@/store/useSettingsStore";
import { SearchBar } from "@/components/SearchBar";

interface ScreenSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Native header search (real UISearchBar / Android SearchView) on iOS/Android,
 * via expo-router's headerSearchBarOptions. There's no native OS search
 * control on web, so it falls back to the in-content warm SearchBar there.
 */
export function ScreenSearch({ value, onChangeText, placeholder, className }: ScreenSearchProps) {
  const appColorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = appColorScheme === "dark" || (appColorScheme === "system" && systemScheme === "dark");

  if (Platform.OS === "web") {
    return (
      <SearchBar value={value} onChangeText={onChangeText} placeholder={placeholder} className={className} />
    );
  }

  return (
    <Stack.Screen
      options={{
        headerSearchBarOptions: {
          placeholder,
          onChangeText: (e) => onChangeText(e.nativeEvent.text),
          onCancelButtonPress: () => onChangeText(""),
          onClose: () => onChangeText(""),
          hideWhenScrolling: false,
          tintColor: "#b96a4a",
          textColor: isDark ? "#f4ecd8" : "#2a2418",
          hintTextColor: isDark ? "#9a9080" : "#8a8373",
          barTintColor: isDark ? "#231e17" : "#fdfaf1",
        },
      }}
    />
  );
}
