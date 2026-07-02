import React, { useState, useRef, useEffect } from "react";
import { Platform } from "react-native";
import { View, Text, ScrollView } from "react-native-css/components";
import { foregroundStyle } from "../../primitives/_host/modifiers";
import DateTimePicker from "@expo/ui/community/datetime-picker";
import { Pressable } from "../../primitives/pressable";
import { Button } from "../../primitives/button";
import { BottomSheet } from "../../primitives/bottom-sheet";
import { useForgeTheme } from "../../theme/context";

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));
const ITEM_HEIGHT = 44;

interface TimePickerModalProps {
  visible: boolean;
  value: string;
  onSelect: (time: string) => void;
  onClear: () => void;
  onClose: () => void;
  confirmLabel?: string;
  clearLabel?: string;
  hoursLabel?: string;
  minutesLabel?: string;
}

export function TimePickerModal({
  visible,
  value,
  onSelect,
  onClear,
  onClose,
  confirmLabel = "Confirm",
  clearLabel = "Clear",
  hoursLabel = "Hours",
  minutesLabel = "Minutes",
}: TimePickerModalProps) {
  const { colors } = useForgeTheme();
  const hourRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const minuteRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  const [selectedHour, setSelectedHour] = useState("12");
  const [selectedMinute, setSelectedMinute] = useState("00");

  useEffect(() => {
    if (!visible) return;

    const parts = value ? value.split(":") : [];
    const rawHH = parts[0] ?? "";
    const rawMM = parts[1] ?? "";
    const h = HOURS.includes(rawHH) ? rawHH : "12";
    const parsedMin = parseInt(rawMM, 10);
    const m =
      MINUTES.includes(rawMM)
        ? rawMM
        : !isNaN(parsedMin)
          ? ((Math.round(parsedMin / 5) * 5) % 60).toString().padStart(2, "0")
          : "00";
    setSelectedHour(h);
    setSelectedMinute(m);

    const timer = setTimeout(() => {
      const hIdx = HOURS.indexOf(h);
      const mIdx = MINUTES.indexOf(m);
      if (hIdx >= 0) hourRef.current?.scrollTo({ y: hIdx * ITEM_HEIGHT, animated: false });
      if (mIdx >= 0) minuteRef.current?.scrollTo({ y: mIdx * ITEM_HEIGHT, animated: false });
    }, 100);

    return () => clearTimeout(timer);
  }, [visible, value]);

  const handleConfirm = () => {
    onSelect(`${selectedHour}:${selectedMinute}`);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  // Mobile: native @expo/ui DateTimePicker instead of the hand-rolled scroll
  // wheels — web keeps the exact implementation below. Reuses the same
  // selectedHour/selectedMinute state and handleConfirm/handleClear (the
  // native wheel fires onValueChange continuously while scrolling, so unlike
  // DatePickerModal this must NOT auto-close — commit only on Confirm).
  // Minutes are rounded to the nearest 5 to match the original MINUTES step;
  // the community module doesn't support a minuteInterval prop.
  if (Platform.OS !== "web") {
    const timeValue = new Date();
    timeValue.setHours(parseInt(selectedHour, 10), parseInt(selectedMinute, 10), 0, 0);

    return (
      <BottomSheet
        visible={visible}
        onDismiss={onClose}
        snapPoints={Platform.OS === "ios" ? ["45%"] : undefined}
        backgroundColor={colors.surface}
      >
        <View className="bg-background-0 rounded-t-3xl px-5 pt-5 pb-8">
          <DateTimePicker
            value={timeValue}
            mode="time"
            display="spinner"
            onValueChange={(_event, date) => {
              if (!date) return;
              setSelectedHour(date.getHours().toString().padStart(2, "0"));
              setSelectedMinute(((Math.round(date.getMinutes() / 5) * 5) % 60).toString().padStart(2, "0"));
            }}
          />
          <View className="flex-row gap-3 mt-4">
            <View className="flex-1">
              <Button
                fill
                variant="text"
                label={confirmLabel}
                onPress={handleConfirm}
                modifiers={[foregroundStyle(colors.onPrimary)]}
                style={{ backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 16 }}
              />
            </View>
            <View className="flex-1">
              <Button
                fill
                variant="outlined"
                label={clearLabel}
                onPress={handleClear}
                style={{ paddingVertical: 12, borderRadius: 16 }}
              />
            </View>
          </View>
        </View>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet visible={visible} onDismiss={onClose}>
      <View className="bg-background-0 rounded-t-3xl px-5 pt-5 pb-8">
        <Text className="text-center text-3xl font-bold text-typography-900 mb-4">
          {selectedHour}:{selectedMinute}
        </Text>

        <View className="flex-row gap-4" style={{ height: ITEM_HEIGHT * 5 }}>
          {/* Hours */}
          <View className="flex-1">
            <Text className="text-xs font-semibold text-typography-400 uppercase tracking-wider text-center mb-2">
              {hoursLabel}
            </Text>
            <ScrollView ref={hourRef} showsVerticalScrollIndicator={false} className="flex-1" nestedScrollEnabled>
              {HOURS.map((h) => (
                <Pressable
                  key={h}
                  onPress={() => setSelectedHour(h)}
                  className={`items-center justify-center rounded-xl mx-1 ${selectedHour === h ? "bg-primary-500" : ""}`}
                  style={{ height: ITEM_HEIGHT }}
                >
                  <Text
                    className={`text-lg ${selectedHour === h ? "text-white font-semibold" : "text-typography-700"}`}
                  >
                    {h}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <Text className="text-2xl font-bold text-typography-300 self-center">:</Text>

          {/* Minutes */}
          <View className="flex-1">
            <Text className="text-xs font-semibold text-typography-400 uppercase tracking-wider text-center mb-2">
              {minutesLabel}
            </Text>
            <ScrollView ref={minuteRef} showsVerticalScrollIndicator={false} className="flex-1" nestedScrollEnabled>
              {MINUTES.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setSelectedMinute(m)}
                  className={`items-center justify-center rounded-xl mx-1 ${selectedMinute === m ? "bg-primary-500" : ""}`}
                  style={{ height: ITEM_HEIGHT }}
                >
                  <Text
                    className={`text-lg ${selectedMinute === m ? "text-white font-semibold" : "text-typography-700"}`}
                  >
                    {m}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        <View className="flex-row gap-3 mt-4">
          <View className="flex-1">
            <Button
              fill
              variant="text"
              label={confirmLabel}
              onPress={handleConfirm}
              modifiers={[foregroundStyle("#FFFFFF")]}
              style={{ backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 16 }}
            />
          </View>
          <View className="flex-1">
            <Button
              fill
              variant="outlined"
              label={clearLabel}
              onPress={handleClear}
              style={{ paddingVertical: 12, borderRadius: 16 }}
            />
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}
