import React, { useRef, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { CheckCircle2, Circle, Calendar } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { getDateLocale } from "@/i18n/dateFnsLocale";
import { DatePickerModal } from "./DatePickerModal";

/** Section heading for form screens */
export function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">
      {children}
    </Text>
  );
}

/** Card wrapper for form sections */
export function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-5 border border-gray-100 dark:border-gray-800">
      {children}
    </View>
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
  const inputRef = useRef<TextInput>(null);
  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      className="border-b border-gray-50 dark:border-gray-800 py-3"
    >
      <Text className="text-xs text-gray-400 mb-1 font-medium">{label}</Text>
      <TextInput
        ref={inputRef}
        className="text-base text-gray-900 dark:text-white"
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="#D0D0D8"
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </Pressable>
  );
}

/** Date picker row — taps open a calendar modal */
export function DateRow({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const locale = getDateLocale();

  const displayValue = value
    ? format(parseISO(value), "d MMM yyyy", { locale })
    : null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between border-b border-gray-50 dark:border-gray-800 py-3"
      >
        <View className="flex-1">
          <Text className="text-xs text-gray-400 mb-1 font-medium">
            {label}
          </Text>
          <Text
            className={`text-base ${displayValue ? "text-gray-900 dark:text-white" : "text-gray-300"}`}
          >
            {displayValue ?? placeholder ?? t("selectDate")}
          </Text>
        </View>
        <Calendar size={18} color="#9CA3AF" />
      </Pressable>
      <DatePickerModal
        visible={open}
        value={value}
        onSelect={onChange}
        onClear={() => onChange("")}
        onClose={() => setOpen(false)}
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
      className="flex-row items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800"
    >
      <Text className="text-base text-gray-700 dark:text-gray-300">
        {label}
      </Text>
      {value ? (
        <CheckCircle2 size={24} color="#10B981" />
      ) : (
        <Circle size={24} color="#D1D5DB" />
      )}
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
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            }`}
          >
            <Text
              className={`text-sm ${
                isActive
                  ? "text-white font-medium"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {labels[opt]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
