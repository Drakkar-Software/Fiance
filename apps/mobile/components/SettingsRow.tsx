import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { ChevronRight } from "lucide-react-native";

/** Standard settings row: icon, label, optional sublabel, chevron. */
export function SettingsRow({
  icon,
  label,
  sublabel,
  onPress,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center py-3.5 active:opacity-70 ${!last ? "border-b border-hair" : ""}`}
    >
      <View className="w-8 h-8 items-center justify-center mr-3">{icon}</View>
      <View className="flex-1">
        <Text className="text-base text-ink font-medium">{label}</Text>
        {sublabel && (
          <Text className="text-xs text-mute mt-0.5">{sublabel}</Text>
        )}
      </View>
      <ChevronRight size={16} color="#C0C0C8" />
    </Pressable>
  );
}

/**
 * Web-only file-pick row. Uses a native <label>+<input type="file"> so the
 * browser opens the file picker via its own mechanism — bypasses the JS
 * programmatic click restriction in Safari PWA standalone mode.
 * Returns the file's raw bytes.
 */
export function WebFilePickRow({
  icon,
  label,
  sublabel,
  accept,
  last = false,
  onFile,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  accept: string;
  last?: boolean;
  onFile: (bytes: Uint8Array, name: string) => void;
}) {
  const borderStyle = last ? {} : { borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.08)", borderBottomStyle: "solid" as const };
  return (
    // @ts-ignore — <label> is valid HTML on web; not a RN primitive
    <label style={{ display: "flex", flexDirection: "row", alignItems: "center", paddingTop: 14, paddingBottom: 14, cursor: "pointer", ...borderStyle }}>
      {/* @ts-ignore */}
      <input
        type="file"
        accept={accept}
        style={{ position: "absolute", opacity: 0, width: 1, height: 1, pointerEvents: "none" } as any}
        onChange={(e: any) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const name = file.name;
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result) onFile(new Uint8Array(reader.result as ArrayBuffer), name);
          };
          reader.readAsArrayBuffer(file);
          e.target.value = "";
        }}
      />
      <div style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, color: "var(--color-ink, #1a1a1a)", fontWeight: "500" }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: "var(--color-mute, #9ca3af)", marginTop: 2 }}>{sublabel}</div>}
      </div>
      <ChevronRight size={16} color="#C0C0C8" />
    </label>
  );
}
