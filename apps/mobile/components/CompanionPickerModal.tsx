import React, { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native-css/components";
import { Platform, useWindowDimensions } from "react-native";
import { Search, Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  Column,
  Row,
  Text as UIText,
  TextInput as UITextInput,
  Button as UIButton,
  List,
  ListItem,
  useNativeState,
} from "@expo/ui";
import { useGuestsStore } from "@/store/useGuestsStore";
import { Sheet } from "@fiance/ui/components";
import { ForgeHost } from "@fiance/ui/primitives/host";
import { theme } from "@/lib/theme";

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
  const searchState = useNativeState("");

  useEffect(() => {
    if (visible) {
      setSelected(currentCompanionId);
      setSearch("");
      searchState.value = "";
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

  const handleConfirm = () => {
    if (selected) onSelect(selected);
    else onClear();
  };

  // iOS: @expo/ui BottomSheet hosts RN content via an RNHostView bridge whose touch
  // handler desyncs on resize. This is a row-of-choices menu sheet, so its content is
  // rebuilt entirely from @expo/ui-native components (List/ListItem) instead of RN
  // Pressables. Avatar initials + selected checkmark stay RN — ListItem's leading/
  // trailing slots are the one bridge point @expo/ui itself wraps safely.
  if (Platform.OS === "ios") {
    return (
      <Sheet visible={visible} onDismiss={onClose} backgroundColor={theme.card}>
        <ForgeHost style={{ flex: 1 }} useViewportSizeMeasurement>
          <Column style={{ padding: 20 }} spacing={12}>
            <UIText textStyle={{ fontSize: 18, fontWeight: "700" }}>
              {t("companionLabel")}
            </UIText>
            <UITextInput
              value={searchState}
              onChangeText={(text) => {
                searchState.value = text;
                setSearch(text);
              }}
              placeholder={t("searchCompanion")}
              autoCapitalize="none"
            />
            <List>
              {filteredGuests.map((g) => (
                <ListItem
                  key={g.id}
                  onPress={() => setSelected(selected === g.id ? null : g.id)}
                  leading={
                    <View className="w-8 h-8 rounded-lg bg-accent-blush dark:bg-primary-900 items-center justify-center">
                      <Text className="text-primary-500 font-bold text-xs">
                        {g.firstName[0]}
                        {g.lastName[0]}
                      </Text>
                    </View>
                  }
                  trailing={selected === g.id ? <Check size={18} color="#EC4899" /> : undefined}
                >
                  {`${g.firstName} ${g.lastName}`}
                </ListItem>
              ))}
            </List>
            {filteredGuests.length === 0 && (
              <UIText textStyle={{ textAlign: "center" }}>{t("noGuests")}</UIText>
            )}
            <Row spacing={12}>
              <UIButton variant="filled" label={t("common:confirm")} onPress={handleConfirm} />
              <UIButton variant="outlined" label={t("common:cancel")} onPress={onClose} />
            </Row>
          </Column>
        </ForgeHost>
      </Sheet>
    );
  }

  return (
    <Sheet visible={visible} onDismiss={onClose}>
      <View className="bg-accent-card rounded-t-3xl px-5 pt-5 pb-8">
        <Text className="text-lg font-bold text-ink mb-3">
          {t("companionLabel")}
        </Text>

        {/* Search */}
        <View className="flex-row items-center bg-accent-paper rounded-xl px-3 py-2 mb-3">
          <Search size={16} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base text-ink"
            placeholder={t("searchCompanion")}
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>

        {/* Guest list */}
        <ScrollView style={{ maxHeight }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          {filteredGuests.map((g) => (
            <Pressable
              key={g.id}
              onPress={() => setSelected(selected === g.id ? null : g.id)}
              className={`flex-row items-center px-3 py-3 rounded-xl mb-1 ${
                selected === g.id
                  ? "bg-primary-50 dark:bg-primary-950"
                  : "active:bg-accent-paper dark:active:bg-accent-card"
              }`}
            >
              <View className="w-8 h-8 rounded-lg bg-accent-blush dark:bg-primary-900 items-center justify-center mr-3">
                <Text className="text-primary-500 font-bold text-xs">
                  {g.firstName[0]}
                  {g.lastName[0]}
                </Text>
              </View>
              <Text className="flex-1 text-base text-ink">
                {g.firstName} {g.lastName}
              </Text>
              {selected === g.id && <Check size={18} color="#EC4899" />}
            </Pressable>
          ))}
          {filteredGuests.length === 0 && (
            <Text className="text-center text-mute py-6">
              {t("noGuests")}
            </Text>
          )}
        </ScrollView>

        {/* Footer buttons */}
        <View className="flex-row gap-3 mt-4">
          <Pressable
            onPress={handleConfirm}
            className="flex-1 py-3.5 rounded-2xl items-center bg-primary-500 active:opacity-80"
          >
            <Text className="text-white font-semibold text-base">
              {t("common:confirm")}
            </Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            className="flex-1 py-3.5 rounded-2xl items-center bg-accent-paper active:opacity-80"
          >
            <Text className="text-ink-soft font-medium text-base">
              {t("common:cancel")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Sheet>
  );
}
