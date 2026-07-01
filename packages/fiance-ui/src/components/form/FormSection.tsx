import React, { useState } from "react";
import { View, Text } from "react-native-css/components";
import { Pressable } from "../../primitives/pressable";
import { Input } from "../../primitives/input";
import { Checkbox } from "../../primitives/checkbox";
import { Card } from "../../primitives/card";
import { Calendar, Clock } from "lucide-react-native";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import type { Locale } from "date-fns";
import { DatePickerModal } from "../sheets/DatePickerModal";
import { TimePickerModal } from "../sheets/TimePickerModal";

/** Section heading for form screens */
export function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-typography-400 mb-2 uppercase tracking-wider">
      {children}
    </Text>
  );
}

/** Card wrapper for form sections */
export function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <Card variant="elevated" className="rounded-2xl p-4 mb-5 border border-outline-100">
      {children}
    </Card>
  );
}

/** Standard text input row inside a FormCard */
export function InputRow({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  onBlur,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  multiline?: boolean;
  onBlur?: () => void;
}) {
  return (
    <View className="border-b border-outline-50 py-3">
      <Text className="text-xs text-typography-400 mb-1 font-medium">{label}</Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="rgb(212, 212, 212)"
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

/** Date picker row — taps open a calendar modal */
export function DateRow({
  label,
  value,
  onChange,
  placeholder,
  dateLocale = enUS,
  selectDateLabel = "Select date",
  todayLabel,
  clearLabel,
}: {
  label: string;
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  /** date-fns locale for formatting and calendar headers. Defaults to enUS. */
  dateLocale?: Locale;
  selectDateLabel?: string;
  todayLabel?: string;
  clearLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  let displayValue: string | null = null;
  if (value) {
    const parsed = parseISO(value);
    if (!isNaN(parsed.getTime())) {
      displayValue = format(parsed, "d MMM yyyy", { locale: dateLocale });
    }
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between border-b border-outline-50 py-3"
      >
        <View className="flex-1">
          <Text className="text-xs text-typography-400 mb-1 font-medium">{label}</Text>
          <Text
            className={`text-base ${displayValue ? "text-typography-900" : "text-typography-300"}`}
          >
            {displayValue ?? placeholder ?? selectDateLabel}
          </Text>
        </View>
        <Calendar size={18} className="text-typography-400" />
      </Pressable>
      <DatePickerModal
        visible={open}
        value={value}
        onSelect={onChange}
        onClear={() => onChange("")}
        onClose={() => setOpen(false)}
        dateLocale={dateLocale}
        todayLabel={todayLabel}
        clearLabel={clearLabel}
      />
    </>
  );
}

/** Time picker row — taps open a time picker modal */
export function TimeRow({
  label,
  value,
  onChange,
  placeholder,
  selectTimeLabel = "Select time",
  confirmLabel,
  clearLabel,
  hoursLabel,
  minutesLabel,
}: {
  label: string;
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  selectTimeLabel?: string;
  confirmLabel?: string;
  clearLabel?: string;
  hoursLabel?: string;
  minutesLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between border-b border-outline-50 py-3"
      >
        <View className="flex-1">
          <Text className="text-xs text-typography-400 mb-1 font-medium">{label}</Text>
          <Text
            className={`text-base ${value ? "text-typography-900" : "text-typography-300"}`}
          >
            {value || placeholder || selectTimeLabel}
          </Text>
        </View>
        <Clock size={18} className="text-typography-400" />
      </Pressable>
      <TimePickerModal
        visible={open}
        value={value}
        onSelect={onChange}
        onClear={() => onChange("")}
        onClose={() => setOpen(false)}
        confirmLabel={confirmLabel}
        clearLabel={clearLabel}
        hoursLabel={hoursLabel}
        minutesLabel={minutesLabel}
      />
    </>
  );
}

/** Toggle row with checkbox */
export function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center justify-between py-3 border-b border-outline-50"
    >
      <Text className="text-base text-typography-700">{label}</Text>
      <Checkbox value={value} onValueChange={() => onToggle()} />
    </Pressable>
  );
}

/** Chip selector (single select from a list) */
export function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labels: Record<T, string>;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            className={`px-3.5 py-2 rounded-full border ${
              isActive
                ? "bg-primary-500 border-primary-500"
                : "bg-background-0 border-outline-200"
            }`}
          >
            <Text
              className={`text-sm ${isActive ? "text-white font-medium" : "text-typography-500"}`}
            >
              {labels[opt]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
