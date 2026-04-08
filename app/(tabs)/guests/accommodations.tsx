import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Home, Trash2 } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { FormCard, DateRow, InputRow } from "@/components/FormSection";
import type { Accommodation } from "@/db/schema";

export default function AccommodationsScreen() {
  const { t } = useTranslation("guests");
  const accommodations = useAccommodationsStore((s) => s.accommodations);
  const addAccommodation = useAccommodationsStore((s) => s.addAccommodation);
  const removeAccommodation = useAccommodationsStore((s) => s.removeAccommodation);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [roomCount, setRoomCount] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setAddress("");
    setPhone("");
    setWebsite("");
    setCheckInDate("");
    setCheckOutDate("");
    setRoomCount("");
    setPricePerNight("");
  };

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert(t("common:error"), t("accommodationNameRequired"));
      return;
    }
    const now = new Date().toISOString();
    addAccommodation({
      id: Crypto.randomUUID(),
      name: name.trim(),
      address: address || null,
      phone: phone || null,
      website: website || null,
      checkInDate: checkInDate || null,
      checkOutDate: checkOutDate || null,
      roomCount: roomCount ? parseInt(roomCount) : null,
      pricePerNight: pricePerNight ? parseFloat(pricePerNight) : null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    } as Accommodation);
    resetForm();
    setShowAdd(false);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {accommodations.length === 0 && !showAdd ? (
        <EmptyState
          icon={Home}
          title={t("noAccommodations")}
          description={t("createAccommodationsDesc")}
          actionLabel={t("newAccommodation")}
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Add form */}
          {showAdd && (
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
              <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                {t("newAccommodation")}
              </Text>
              <FormCard>
                <InputRow
                  label={t("accommodationName")}
                  value={name}
                  onChangeText={setName}
                />
                <InputRow
                  label={t("accommodationAddress")}
                  value={address}
                  onChangeText={setAddress}
                />
                <InputRow
                  label={t("accommodationPhone")}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <InputRow
                  label={t("accommodationWebsite")}
                  value={website}
                  onChangeText={setWebsite}
                />
                <DateRow label={t("checkIn")} value={checkInDate} onChange={setCheckInDate} />
                <DateRow label={t("checkOut")} value={checkOutDate} onChange={setCheckOutDate} />
                <InputRow
                  label={t("roomCount")}
                  value={roomCount}
                  onChangeText={setRoomCount}
                  keyboardType="numeric"
                />
                <InputRow
                  label={t("pricePerNight")}
                  value={pricePerNight}
                  onChangeText={setPricePerNight}
                  keyboardType="numeric"
                />
              </FormCard>
              <View className="flex-row gap-2 mt-2">
                <Pressable
                  onPress={handleAdd}
                  className="flex-1 bg-primary-500 py-2.5 rounded-xl items-center active:bg-primary-600"
                >
                  <Text className="text-white font-semibold text-sm">
                    {t("common:create")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => { resetForm(); setShowAdd(false); }}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 py-2.5 rounded-xl items-center"
                >
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    {t("common:cancel")}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* List */}
          {accommodations.map((acc) => (
            <View
              key={acc.id}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2.5 border border-gray-100 dark:border-gray-800"
            >
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 rounded-lg bg-accent-blush dark:bg-primary-900 items-center justify-center mr-2">
                    <Home size={16} color="#EC4899" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900 dark:text-white flex-1">
                    {acc.name}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setDeleteId(acc.id)}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Trash2 size={16} color="#EF4444" />
                </Pressable>
              </View>

              {acc.address && (
                <Text className="text-xs text-gray-400 mt-1 ml-10">{acc.address}</Text>
              )}

              <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-2 ml-10">
                {acc.checkInDate && (
                  <Text className="text-xs text-gray-500">
                    {t("checkIn")}: {acc.checkInDate}
                  </Text>
                )}
                {acc.checkOutDate && (
                  <Text className="text-xs text-gray-500">
                    {t("checkOut")}: {acc.checkOutDate}
                  </Text>
                )}
                {acc.roomCount != null && (
                  <Text className="text-xs text-gray-500">
                    {acc.roomCount} {t("roomCount").toLowerCase()}
                  </Text>
                )}
                {acc.pricePerNight != null && (
                  <Text className="text-xs text-gray-500">
                    {acc.pricePerNight}€ {t("pricePerNight").toLowerCase()}
                  </Text>
                )}
              </View>
            </View>
          ))}

          <View className="h-24" />
        </ScrollView>
      )}

      <FAB onPress={() => setShowAdd(true)} />

      <ConfirmSheet
        visible={!!deleteId}
        title={t("deleteAccommodation")}
        message={t("deleteAccommodationMsg")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={() => {
          if (deleteId) removeAccommodation(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}
