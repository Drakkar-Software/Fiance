import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, Pressable, ScrollView } from "react-native-css/components";
import type { ScrollView as RNScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0")
);
const ITEM_HEIGHT = 44;

interface TimePickerModalProps {
  visible: boolean;
  value: string;
  onSelect: (time: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function TimePickerModal({
  visible,
  value,
  onSelect,
  onClear,
  onClose,
}: TimePickerModalProps) {
  const { t } = useTranslation("common");
  const sheetRef = useRef<BottomSheetModal>(null);
  const hourRef = useRef<RNScrollView>(null);
  const minuteRef = useRef<RNScrollView>(null);

  const [selectedHour, setSelectedHour] = useState("12");
  const [selectedMinute, setSelectedMinute] = useState("00");

  useEffect(() => {
    if (!visible) {
      sheetRef.current?.dismiss();
      return;
    }

    // Parse and validate value — handle legacy free-text data gracefully
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

    sheetRef.current?.present();

    // Auto-scroll to selection after layout
    const timer = setTimeout(() => {
      const hIdx = HOURS.indexOf(h);
      const mIdx = MINUTES.indexOf(m);
      if (hIdx >= 0) {
        hourRef.current?.scrollTo({ y: hIdx * ITEM_HEIGHT, animated: false });
      }
      if (mIdx >= 0) {
        minuteRef.current?.scrollTo({
          y: mIdx * ITEM_HEIGHT,
          animated: false,
        });
      }
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

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      backgroundStyle={{ backgroundColor: "transparent" }}
      handleComponent={() => null}
    >
      <BottomSheetView>
        <View className="bg-accent-card rounded-t-3xl px-5 pt-5 pb-8">
          <View className="w-10 h-1 rounded-full bg-hair self-center mb-4" />

          {/* Current selection */}
          <Text className="text-center text-3xl font-bold text-ink mb-4">
            {selectedHour}:{selectedMinute}
          </Text>

          {/* Columns */}
          <View className="flex-row gap-4" style={{ height: ITEM_HEIGHT * 5 }}>
            {/* Hours */}
            <View className="flex-1">
              <Text className="text-xs font-semibold text-mute uppercase tracking-wider text-center mb-2">
                {t("hours")}
              </Text>
              <ScrollView
                ref={hourRef}
                showsVerticalScrollIndicator={false}
                className="flex-1"
                nestedScrollEnabled
              >
                {HOURS.map((h) => (
                  <Pressable
                    key={h}
                    onPress={() => setSelectedHour(h)}
                    className={`items-center justify-center rounded-xl mx-1 ${
                      selectedHour === h ? "bg-primary-500" : ""
                    }`}
                    style={{ height: ITEM_HEIGHT }}
                  >
                    <Text
                      className={`text-lg ${
                        selectedHour === h
                          ? "text-white font-semibold"
                          : "text-ink-soft"
                      }`}
                    >
                      {h}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Separator */}
            <Text className="text-2xl font-bold text-mute dark:text-mute self-center">
              :
            </Text>

            {/* Minutes */}
            <View className="flex-1">
              <Text className="text-xs font-semibold text-mute uppercase tracking-wider text-center mb-2">
                {t("minutes")}
              </Text>
              <ScrollView
                ref={minuteRef}
                showsVerticalScrollIndicator={false}
                className="flex-1"
                nestedScrollEnabled
              >
                {MINUTES.map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setSelectedMinute(m)}
                    className={`items-center justify-center rounded-xl mx-1 ${
                      selectedMinute === m ? "bg-primary-500" : ""
                    }`}
                    style={{ height: ITEM_HEIGHT }}
                  >
                    <Text
                      className={`text-lg ${
                        selectedMinute === m
                          ? "text-white font-semibold"
                          : "text-ink-soft"
                      }`}
                    >
                      {m}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Footer buttons */}
          <View className="flex-row gap-3 mt-4">
            <Pressable
              onPress={handleConfirm}
              className="flex-1 py-3 rounded-2xl items-center bg-primary-500 active:opacity-80"
            >
              <Text className="text-white font-semibold text-sm">
                {t("confirm")}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleClear}
              className="flex-1 py-3 rounded-2xl items-center bg-accent-paper active:opacity-80"
            >
              <Text className="text-ink-soft font-medium text-sm">
                {t("clear")}
              </Text>
            </Pressable>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
