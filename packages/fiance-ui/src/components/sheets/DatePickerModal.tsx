import React, { useState, useMemo, useEffect } from "react";
import { Platform } from "react-native";
import { View, Text } from "react-native-css/components";
import DateTimePicker from "@expo/ui/community/datetime-picker";
import { Pressable } from "../../primitives/pressable";
import { Button } from "../../primitives/button";
import { useForgeTheme } from "../../theme/context";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
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
import { enUS, fr } from "date-fns/locale";
import type { Locale } from "date-fns";
import { BottomSheet } from "../../primitives/bottom-sheet";

interface DatePickerModalProps {
  visible: boolean;
  value: string;
  onSelect: (date: string) => void;
  onClear: () => void;
  onClose: () => void;
  /** date-fns locale for month/day names. Defaults to enUS. */
  dateLocale?: Locale;
  todayLabel?: string;
  clearLabel?: string;
}

export function DatePickerModal({
  visible,
  value,
  onSelect,
  onClear,
  onClose,
  dateLocale = enUS,
  todayLabel = "Today",
  clearLabel = "Clear",
}: DatePickerModalProps) {
  const { colors } = useForgeTheme();
  const selectedDate = value ? parseISO(value) : null;
  const [displayMonth, setDisplayMonth] = useState(selectedDate ?? new Date());

  useEffect(() => {
    if (visible) setDisplayMonth(selectedDate ?? new Date());
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
      return format(d, "EEEEEE", { locale: dateLocale });
    });
  }, [dateLocale]);

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

  // Mobile: native @expo/ui DateTimePicker instead of the hand-rolled calendar
  // grid — web keeps the exact implementation below (the community module
  // doesn't render reliably on web, matching SegmentedControl's split).
  if (Platform.OS !== "web") {
    return (
      <BottomSheet
        visible={visible}
        onDismiss={onClose}
        snapPoints={Platform.OS === "ios" ? ["55%"] : undefined}
        backgroundColor={colors.surface}
      >
        <View className="bg-accent-card rounded-t-3xl px-5 pt-5 pb-8">
          <DateTimePicker
            value={selectedDate ?? new Date()}
            mode="date"
            display="inline"
            locale={dateLocale === fr ? "fr_FR" : "en_US"}
            onValueChange={(_event, date) => {
              if (!date) return;
              onSelect(format(date, "yyyy-MM-dd"));
              onClose();
            }}
          />
          <View className="flex-row gap-3 mt-4">
            <View className="flex-1">
              <Button
                fill
                variant="text"
                label={todayLabel}
                onPress={handleToday}
                labelColor={colors.onPrimary}
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
    <BottomSheet visible={visible} onDismiss={onClose} backgroundColor={colors.surface}>
      <View className="bg-accent-card rounded-t-3xl px-5 pt-5 pb-8">
        {/* Month navigation */}
        <View className="flex-row items-center justify-between mb-3">
          <Pressable
            onPress={() => setDisplayMonth(subMonths(displayMonth, 1))}
            className="p-2"
          >
            <ChevronLeft size={20} className="text-typography-400" />
          </Pressable>
          <Text className="text-base font-semibold text-typography-900 capitalize">
            {format(displayMonth, "MMMM yyyy", { locale: dateLocale })}
          </Text>
          <Pressable
            onPress={() => setDisplayMonth(addMonths(displayMonth, 1))}
            className="p-2"
          >
            <ChevronRight size={20} className="text-typography-400" />
          </Pressable>
        </View>

        {/* Day-of-week headers */}
        <View className="flex-row mb-1">
          {dayHeaders.map((d, i) => (
            <View key={i} className="flex-1 items-center py-1">
              <Text className="text-xs font-medium text-typography-400 uppercase">{d}</Text>
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
                            ? "text-typography-300"
                            : "text-typography-700"
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
          <View className="flex-1">
            <Button
              fill
              variant="text"
              label={todayLabel}
              onPress={handleToday}
              labelColor={colors.onPrimary}
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
