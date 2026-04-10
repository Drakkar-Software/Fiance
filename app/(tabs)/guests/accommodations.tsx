import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { Home, Trash2, Pencil } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { FormCard, DateRow, InputRow } from "@/components/FormSection";
import type { Accommodation } from "@/db/schema";

type FormState = {
  name: string;
  address: string;
  phone: string;
  website: string;
  checkInDate: string;
  checkOutDate: string;
  roomCount: string;
  pricePerNight: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  address: "",
  phone: "",
  website: "",
  checkInDate: "",
  checkOutDate: "",
  roomCount: "",
  pricePerNight: "",
};

export default function AccommodationsScreen() {
  const { t } = useTranslation("guests");
  const accommodations = useAccommodationsStore((s) => s.accommodations);
  const addAccommodation = useAccommodationsStore((s) => s.addAccommodation);
  const updateAccommodation = useAccommodationsStore((s) => s.updateAccommodation);
  const removeAccommodation = useAccommodationsStore((s) => s.removeAccommodation);
  const guests = useGuestsStore((s) => s.guests);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const setField = (key: keyof FormState) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowAdd(false);
  };

  const handleAdd = () => {
    if (!form.name.trim()) {
      Alert.alert(t("common:error"), t("accommodationNameRequired"));
      return;
    }
    const now = new Date().toISOString();
    addAccommodation({
      id: Crypto.randomUUID(),
      name: form.name.trim(),
      address: form.address || null,
      phone: form.phone || null,
      website: form.website || null,
      checkInDate: form.checkInDate || null,
      checkOutDate: form.checkOutDate || null,
      roomCount: form.roomCount ? parseInt(form.roomCount) : null,
      pricePerNight: form.pricePerNight ? parseFloat(form.pricePerNight) : null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    } as Accommodation);
    resetForm();
  };

  const handleEdit = (acc: Accommodation) => {
    setForm({
      name: acc.name,
      address: acc.address || "",
      phone: acc.phone || "",
      website: acc.website || "",
      checkInDate: acc.checkInDate || "",
      checkOutDate: acc.checkOutDate || "",
      roomCount: acc.roomCount != null ? String(acc.roomCount) : "",
      pricePerNight: acc.pricePerNight != null ? String(acc.pricePerNight) : "",
    });
    setEditingId(acc.id);
    setShowAdd(false);
  };

  const handleSaveEdit = () => {
    if (!form.name.trim() || !editingId) return;
    updateAccommodation(editingId, {
      name: form.name.trim(),
      address: form.address || null,
      phone: form.phone || null,
      website: form.website || null,
      checkInDate: form.checkInDate || null,
      checkOutDate: form.checkOutDate || null,
      roomCount: form.roomCount ? parseInt(form.roomCount) : null,
      pricePerNight: form.pricePerNight ? parseFloat(form.pricePerNight) : null,
    });
    resetForm();
  };

  // Summary stats
  const acceptedGuests = guests.filter((g) => g.rsvpStatus === "ACCEPTED");
  const totalRooms = accommodations.reduce((sum, a) => sum + (a.roomCount ?? 0), 0);
  const assignedCount = acceptedGuests.filter((g) => g.accommodationId).length;
  const remaining = totalRooms - assignedCount;

  const formFields = (
    <>
      <InputRow label={t("accommodationName")} value={form.name} onChangeText={setField("name")} />
      <InputRow label={t("accommodationAddress")} value={form.address} onChangeText={setField("address")} />
      <InputRow label={t("accommodationPhone")} value={form.phone} onChangeText={setField("phone")} keyboardType="phone-pad" />
      <InputRow label={t("accommodationWebsite")} value={form.website} onChangeText={setField("website")} />
      <DateRow label={t("checkIn")} value={form.checkInDate} onChange={setField("checkInDate")} />
      <DateRow label={t("checkOut")} value={form.checkOutDate} onChange={setField("checkOutDate")} />
      <InputRow label={t("roomCount")} value={form.roomCount} onChangeText={setField("roomCount")} keyboardType="numeric" />
      <InputRow label={t("pricePerNight")} value={form.pricePerNight} onChangeText={setField("pricePerNight")} keyboardType="numeric" />
    </>
  );

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
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {/* Summary banner */}
          {totalRooms > 0 && (
            <View className="bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 mb-4 border border-gray-100 dark:border-gray-800 flex-row justify-around">
              <View className="items-center">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">{totalRooms}</Text>
                <Text className="text-xs text-gray-400">{t("roomCount")}</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-primary-500">{assignedCount}</Text>
                <Text className="text-xs text-gray-400">{t("confirmed")}</Text>
              </View>
              <View className="items-center">
                <Text className={`text-lg font-bold ${remaining < 0 ? "text-red-500" : remaining === 0 ? "text-amber-500" : "text-green-500"}`}>{remaining}</Text>
                <Text className="text-xs text-gray-400">{t("remaining")}</Text>
              </View>
            </View>
          )}

          {/* Add form */}
          {showAdd && (
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
              <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">{t("newAccommodation")}</Text>
              <FormCard>
                {formFields}
                <View className="flex-row gap-2 mt-2">
                  <Pressable onPress={handleAdd} className="flex-1 bg-primary-500 py-2.5 rounded-xl items-center active:bg-primary-600">
                    <Text className="text-white font-semibold text-sm">{t("common:create")}</Text>
                  </Pressable>
                  <Pressable onPress={resetForm} className="flex-1 bg-gray-100 dark:bg-gray-800 py-2.5 rounded-xl items-center">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">{t("common:cancel")}</Text>
                  </Pressable>
                </View>
              </FormCard>
            </View>
          )}

          {/* List */}
          {accommodations.map((acc) => {
            const guestCount = guests.filter((g) => g.accommodationId === acc.id).length;
            const isFull = acc.roomCount != null && guestCount >= acc.roomCount;
            const isOver = acc.roomCount != null && guestCount > acc.roomCount;

            if (editingId === acc.id) {
              return (
                <View key={acc.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2.5 border border-primary-200 dark:border-primary-800">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">{acc.name}</Text>
                  <FormCard>
                    {formFields}
                    <View className="flex-row gap-2 mt-2">
                      <Pressable onPress={handleSaveEdit} className="flex-1 bg-primary-500 py-2.5 rounded-xl items-center active:bg-primary-600">
                        <Text className="text-white font-semibold text-sm">{t("common:save")}</Text>
                      </Pressable>
                      <Pressable onPress={resetForm} className="flex-1 bg-gray-100 dark:bg-gray-800 py-2.5 rounded-xl items-center">
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">{t("common:cancel")}</Text>
                      </Pressable>
                    </View>
                  </FormCard>
                </View>
              );
            }

            return (
              <View key={acc.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2.5 border border-gray-100 dark:border-gray-800">
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center flex-1">
                    <View className="w-8 h-8 rounded-lg bg-accent-blush dark:bg-primary-900 items-center justify-center mr-2">
                      <Home size={16} color="#EC4899" />
                    </View>
                    <Text className="text-base font-semibold text-gray-900 dark:text-white flex-1">{acc.name}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    {/* Capacity badge */}
                    <View className={`px-2 py-0.5 rounded-full mr-1 ${isOver ? "bg-red-100" : isFull ? "bg-amber-100" : "bg-green-50"}`}>
                      <Text className={`text-xs font-semibold ${isOver ? "text-red-600" : isFull ? "text-amber-600" : "text-green-700"}`}>
                        {acc.roomCount != null ? `${guestCount}/${acc.roomCount}` : guestCount}
                      </Text>
                    </View>
                    <Pressable onPress={() => handleEdit(acc)} className="w-8 h-8 items-center justify-center">
                      <Pencil size={15} color="#9CA3AF" />
                    </Pressable>
                    <Pressable onPress={() => setDeleteId(acc.id)} className="w-8 h-8 items-center justify-center">
                      <Trash2 size={15} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>

                {acc.address && (
                  <Text className="text-xs text-gray-400 mt-1 ml-10">{acc.address}</Text>
                )}

                <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-2 ml-10">
                  {acc.checkInDate && (
                    <Text className="text-xs text-gray-500">{t("checkIn")}: {acc.checkInDate}</Text>
                  )}
                  {acc.checkOutDate && (
                    <Text className="text-xs text-gray-500">{t("checkOut")}: {acc.checkOutDate}</Text>
                  )}
                  {acc.pricePerNight != null && (
                    <Text className="text-xs text-gray-500">{acc.pricePerNight}€ {t("pricePerNight").toLowerCase()}</Text>
                  )}
                </View>
              </View>
            );
          })}

          <View className="h-24" />
        </ScrollView>
      )}

      <FAB onPress={() => { resetForm(); setShowAdd(true); }} />

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
