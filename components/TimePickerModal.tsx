import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";

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
  const hourRef = useRef<ScrollView>(null);
  const minuteRef = useRef<ScrollView>(null);

  const [hh, mm] = value ? value.split(":") : ["", ""];
  const [selectedHour, setSelectedHour] = useState(hh || "12");
  const [selectedMinute, setSelectedMinute] = useState(
    MINUTES.includes(mm) ? mm : "00"
  );

  useEffect(() => {
    if (visible) {
      const h = hh || "12";
      const m = MINUTES.includes(mm) ? mm : "00";
      setSelectedHour(h);
      setSelectedMinute(m);

      // Auto-scroll to selection after render
      setTimeout(() => {
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
      }, 50);
    }
  }, [visible]);

  const handleConfirm = () => {
    onSelect(`${selectedHour}:${selectedMinute}`);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/40 justify-end"
        onPress={onClose}
      >
        <Pressable
          className="bg-white dark:bg-gray-900 rounded-t-3xl px-5 pt-5 pb-8"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700 self-center mb-4" />

          {/* Current selection */}
          <Text className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {selectedHour}:{selectedMinute}
          </Text>

          {/* Columns */}
          <View className="flex-row gap-4" style={{ height: ITEM_HEIGHT * 5 }}>
            {/* Hours */}
            <View className="flex-1">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-2">
                {t("hours")}
              </Text>
              <ScrollView
                ref={hourRef}
                showsVerticalScrollIndicator={false}
                className="flex-1"
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
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {h}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Separator */}
            <Text className="text-2xl font-bold text-gray-300 dark:text-gray-600 self-center">
              :
            </Text>

            {/* Minutes */}
            <View className="flex-1">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-2">
                {t("minutes")}
              </Text>
              <ScrollView
                ref={minuteRef}
                showsVerticalScrollIndicator={false}
                className="flex-1"
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
                          : "text-gray-700 dark:text-gray-300"
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
              className="flex-1 py-3 rounded-2xl items-center bg-gray-100 dark:bg-gray-800 active:opacity-80"
            >
              <Text className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                {t("clear")}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
