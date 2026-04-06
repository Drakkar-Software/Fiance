import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Search, Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useGuestsStore } from "@/store/useGuestsStore";

interface CompanionPickerModalProps {
  visible: boolean;
  currentGuestId: string;
  currentCompanionId: string | null;
  onSelect: (companionId: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function CompanionPickerModal({
  visible,
  currentGuestId,
  currentCompanionId,
  onSelect,
  onClear,
  onClose,
}: CompanionPickerModalProps) {
  const { t } = useTranslation("guests");
  const guests = useGuestsStore((s) => s.guests);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(currentCompanionId);

  // Reset selection when modal opens
  React.useEffect(() => {
    if (visible) {
      setSelected(currentCompanionId);
      setSearch("");
    }
  }, [visible, currentCompanionId]);

  const filteredGuests = useMemo(() => {
    const others = guests.filter((g) => g.id !== currentGuestId);
    if (!search.trim()) return others.sort((a, b) => a.lastName.localeCompare(b.lastName));
    const q = search.toLowerCase();
    return others
      .filter(
        (g) =>
          g.firstName.toLowerCase().includes(q) ||
          g.lastName.toLowerCase().includes(q)
      )
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [guests, currentGuestId, search]);

  const { height: windowHeight } = useWindowDimensions();
  const maxHeight = windowHeight * 0.6;

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

          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {t("companionLabel")}
          </Text>

          {/* Search */}
          <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 mb-3">
            <Search size={16} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-base text-gray-900 dark:text-white"
              placeholder={t("searchCompanion")}
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
          </View>

          {/* Guest list */}
          <ScrollView style={{ maxHeight }} showsVerticalScrollIndicator={false}>
            {filteredGuests.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => setSelected(selected === g.id ? null : g.id)}
                className={`flex-row items-center px-3 py-3 rounded-xl mb-1 ${
                  selected === g.id
                    ? "bg-primary-50 dark:bg-primary-950"
                    : "active:bg-gray-50 dark:active:bg-gray-800"
                }`}
              >
                <View className="w-8 h-8 rounded-lg bg-accent-blush dark:bg-primary-900 items-center justify-center mr-3">
                  <Text className="text-primary-500 font-bold text-xs">
                    {g.firstName[0]}
                    {g.lastName[0]}
                  </Text>
                </View>
                <Text className="flex-1 text-base text-gray-900 dark:text-white">
                  {g.firstName} {g.lastName}
                </Text>
                {selected === g.id && <Check size={18} color="#EC4899" />}
              </Pressable>
            ))}
            {filteredGuests.length === 0 && (
              <Text className="text-center text-gray-400 py-6">
                {t("noGuests")}
              </Text>
            )}
          </ScrollView>

          {/* Footer buttons */}
          <View className="flex-row gap-3 mt-4">
            <Pressable
              onPress={() => {
                if (selected) onSelect(selected);
                else onClear();
              }}
              className="flex-1 py-3.5 rounded-2xl items-center bg-primary-500 active:opacity-80"
            >
              <Text className="text-white font-semibold text-base">
                {t("common:confirm")}
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              className="flex-1 py-3.5 rounded-2xl items-center bg-gray-100 dark:bg-gray-800 active:opacity-80"
            >
              <Text className="text-gray-700 dark:text-gray-300 font-medium text-base">
                {t("common:cancel")}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
