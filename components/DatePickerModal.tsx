import React, { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  format,
  parseISO,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { getDateLocale } from "@/i18n/dateFnsLocale";

interface DatePickerModalProps {
  visible: boolean;
  value: string;
  onSelect: (date: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function DatePickerModal({
  visible,
  value,
  onSelect,
  onClear,
  onClose,
}: DatePickerModalProps) {
  const { t } = useTranslation("common");
  const locale = getDateLocale();

  const selectedDate = value ? parseISO(value) : null;
  const [displayMonth, setDisplayMonth] = useState(
    selectedDate ?? new Date()
  );

  // Reset to the selected date's month (or today) each time the modal opens
  useEffect(() => {
    if (visible) {
      setDisplayMonth(selectedDate ?? new Date());
    }
  }, [visible]);

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(displayMonth);
    const monthEnd = endOfMonth(displayMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    const rows: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  }, [displayMonth]);

  const dayHeaders = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return format(d, "EEEEEE", { locale });
    });
  }, [locale]);

  const handleDayPress = (day: Date) => {
    onSelect(format(day, "yyyy-MM-dd"));
    onClose();
  };

  const handleToday = () => {
    const now = new Date();
    setDisplayMonth(now);
    onSelect(format(now, "yyyy-MM-dd"));
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

          {/* Month navigation */}
          <View className="flex-row items-center justify-between mb-3">
            <Pressable
              onPress={() => setDisplayMonth(subMonths(displayMonth, 1))}
              className="p-2"
            >
              <ChevronLeft size={20} color="#9CA3AF" />
            </Pressable>
            <Text className="text-base font-semibold text-gray-900 dark:text-white capitalize">
              {format(displayMonth, "MMMM yyyy", { locale })}
            </Text>
            <Pressable
              onPress={() => setDisplayMonth(addMonths(displayMonth, 1))}
              className="p-2"
            >
              <ChevronRight size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Day-of-week headers */}
          <View className="flex-row mb-1">
            {dayHeaders.map((d, i) => (
              <View key={i} className="flex-1 items-center py-1">
                <Text className="text-xs font-medium text-gray-400 uppercase">
                  {d}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          {weeks.map((week, wi) => (
            <View key={wi} className="flex-row">
              {week.map((day, di) => {
                const inMonth = isSameMonth(day, displayMonth);
                const selected = selectedDate && isSameDay(day, selectedDate);
                const today = isToday(day);

                return (
                  <Pressable
                    key={di}
                    onPress={() => inMonth && handleDayPress(day)}
                    className="flex-1 items-center justify-center py-2"
                  >
                    <View
                      className={`w-9 h-9 items-center justify-center rounded-full ${
                        selected
                          ? "bg-primary-500"
                          : today && inMonth
                            ? "border border-primary-500"
                            : ""
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          selected
                            ? "text-white font-semibold"
                            : !inMonth
                              ? "text-gray-300 dark:text-gray-600"
                              : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {format(day, "d")}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}

          {/* Footer buttons */}
          <View className="flex-row gap-3 mt-4">
            <Pressable
              onPress={handleToday}
              className="flex-1 py-3 rounded-2xl items-center bg-primary-500 active:opacity-80"
            >
              <Text className="text-white font-semibold text-sm">
                {t("today")}
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
