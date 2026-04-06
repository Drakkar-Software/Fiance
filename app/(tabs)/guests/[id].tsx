import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import { useGuestsStore } from "@/store/useGuestsStore";
import {
  INVITATION_TYPE_LABELS,
  RSVP_STATUS_LABELS,
  RSVP_STATUS_COLORS,
  DIET_LABELS,
  SIDE_LABELS,
} from "@/db/types";
import type {
  InvitationType,
  RsvpStatus,
  Diet,
  Side,
} from "@/db/types";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import {
  SectionTitle,
  FormCard,
  InputRow,
  ToggleRow,
  ChipSelect,
} from "@/components/FormSection";
import type { Guest } from "@/db/schema";

const INVITATION_TYPES: InvitationType[] = [
  "CEREMONY",
  "COCKTAIL",
  "DINNER",
  "FULL",
  "NEXT_DAY",
];
const RSVP_STATUSES: RsvpStatus[] = ["PENDING", "ACCEPTED", "DECLINED", "MAYBE"];
const DIETS: Diet[] = [
  "STANDARD",
  "VEGETARIAN",
  "VEGAN",
  "HALAL",
  "KOSHER",
  "ALLERGY",
];
const SIDES: Side[] = ["BRIDE", "GROOM", "BOTH"];

export default function GuestDetailScreen() {
  const { t } = useTranslation("guests");
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const guests = useGuestsStore((s) => s.guests);
  const tables = useGuestsStore((s) => s.tables);
  const addGuest = useGuestsStore((s) => s.addGuest);
  const updateGuest = useGuestsStore((s) => s.updateGuest);
  const removeGuest = useGuestsStore((s) => s.removeGuest);

  const isNew = id === "new";
  const existing = guests.find((g) => g.id === id);

  const [firstName, setFirstName] = useState(existing?.firstName || "");
  const [lastName, setLastName] = useState(existing?.lastName || "");
  const [side, setSide] = useState<Side>((existing?.side as Side) || "BOTH");
  const [invitationType, setInvitationType] = useState<InvitationType>(
    (existing?.invitationType as InvitationType) || "FULL"
  );
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>(
    (existing?.rsvpStatus as RsvpStatus) || "PENDING"
  );
  const [isSleeping, setIsSleeping] = useState(existing?.isSleeping || false);
  const [isChild, setIsChild] = useState(existing?.isChild || false);
  const [diet, setDiet] = useState<Diet>((existing?.diet as Diet) || "STANDARD");
  const [dietNotes, setDietNotes] = useState(existing?.dietNotes || "");
  const [email, setEmail] = useState(existing?.email || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [address, setAddress] = useState(existing?.address || "");
  const [tableId, setTableId] = useState(existing?.tableId || "");
  const [noTableNeeded, setNoTableNeeded] = useState(existing?.noTableNeeded || false);
  const [notes, setNotes] = useState(existing?.notes || "");
  const [showDelete, setShowDelete] = useState(false);

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Erreur", "Le prénom et le nom sont obligatoires");
      return;
    }

    const now = new Date().toISOString();
    const guestData: Partial<Guest> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      side,
      invitationType,
      rsvpStatus,
      rsvpDate:
        rsvpStatus !== "PENDING" && rsvpStatus !== existing?.rsvpStatus
          ? now
          : existing?.rsvpDate || null,
      isSleeping,
      isChild,
      diet,
      dietNotes: dietNotes || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      tableId: tableId || null,
      noTableNeeded,
      notes: notes || null,
      updatedAt: now,
    };

    if (isNew) {
      addGuest({ ...guestData, id: Crypto.randomUUID(), createdAt: now } as Guest);
    } else {
      updateGuest(id!, guestData);
    }
    router.back();
  };

  const handleDelete = () => {
    removeGuest(id!);
    setShowDelete(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <Stack.Screen
        options={{
          title: isNew
            ? "Nouvel invité"
            : `${firstName} ${lastName}`.trim() || "Invité",
          headerRight: () => (
            <Pressable onPress={handleSave} className="mr-2">
              <Text className="text-primary-500 font-semibold text-base">
                Enregistrer
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Personal info */}
        <SectionTitle>Informations personnelles</SectionTitle>
        <FormCard>
          <InputRow label="Prénom *" value={firstName} onChangeText={setFirstName} />
          <InputRow label="Nom *" value={lastName} onChangeText={setLastName} />
          <InputRow label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <InputRow label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <InputRow label="Adresse" value={address} onChangeText={setAddress} />

          <Text className="text-xs text-gray-400 mt-3 mb-2 font-medium">Côté</Text>
          <ChipSelect
            options={SIDES}
            value={side}
            onChange={setSide}
            labels={SIDE_LABELS as Record<Side, string>}
          />
        </FormCard>

        {/* Invitation */}
        <SectionTitle>Invitation</SectionTitle>
        <FormCard>
          <Text className="text-xs text-gray-400 mb-2 font-medium">
            Type d'invitation
          </Text>
          <ChipSelect
            options={INVITATION_TYPES}
            value={invitationType}
            onChange={setInvitationType}
            labels={INVITATION_TYPE_LABELS as Record<InvitationType, string>}
          />

          <View className="mt-3">
            <ToggleRow
              label="Dort sur place"
              value={isSleeping}
              onToggle={() => setIsSleeping(!isSleeping)}
            />
            <ToggleRow
              label="Enfant (< 12 ans)"
              value={isChild}
              onToggle={() => setIsChild(!isChild)}
            />
          </View>
        </FormCard>

        {/* RSVP */}
        <SectionTitle>RSVP</SectionTitle>
        <FormCard>
          <View className="flex-row flex-wrap gap-2">
            {RSVP_STATUSES.map((s) => (
              <Pressable key={s} onPress={() => setRsvpStatus(s)}>
                <StatusBadge
                  label={t(RSVP_STATUS_LABELS[s])}
                  color={
                    rsvpStatus === s ? RSVP_STATUS_COLORS[s] : "#D1D5DB"
                  }
                  size="md"
                />
              </Pressable>
            ))}
          </View>
        </FormCard>

        {/* Table */}
        <SectionTitle>Table</SectionTitle>
        <FormCard>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => { setTableId(""); setNoTableNeeded(false); }}
                className={`px-3.5 py-2 rounded-full border ${
                  !tableId && !noTableNeeded
                    ? "bg-primary-500 border-primary-500"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                }`}
              >
                <Text
                  className={`text-sm ${
                    !tableId && !noTableNeeded ? "text-white font-medium" : "text-gray-500"
                  }`}
                >
                  Non assigné
                </Text>
              </Pressable>
              <Pressable
                onPress={() => { setTableId(""); setNoTableNeeded(true); }}
                className={`px-3.5 py-2 rounded-full border ${
                  noTableNeeded
                    ? "bg-primary-500 border-primary-500"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                }`}
              >
                <Text
                  className={`text-sm ${
                    noTableNeeded ? "text-white font-medium" : "text-gray-500"
                  }`}
                >
                  Pas de table
                </Text>
              </Pressable>
              {tables.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => { setTableId(t.id); setNoTableNeeded(false); }}
                  className={`px-3.5 py-2 rounded-full border ${
                    tableId === t.id
                      ? "bg-primary-500 border-primary-500"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      tableId === t.id
                        ? "text-white font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {t.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </FormCard>

        {/* Diet */}
        <SectionTitle>Régime alimentaire</SectionTitle>
        <FormCard>
          <ChipSelect
            options={DIETS}
            value={diet}
            onChange={setDiet}
            labels={DIET_LABELS as Record<Diet, string>}
          />
          {(diet === "ALLERGY" || diet === "VEGETARIAN" || diet === "VEGAN") && (
            <TextInput
              className="text-base text-gray-900 dark:text-white border-t border-gray-50 dark:border-gray-800 pt-3 mt-3"
              placeholder="Précisions (allergies, restrictions...)"
              placeholderTextColor="#D0D0D8"
              value={dietNotes}
              onChangeText={setDietNotes}
              multiline
            />
          )}
        </FormCard>

        {/* Notes */}
        <SectionTitle>Notes</SectionTitle>
        <FormCard>
          <TextInput
            className="text-base text-gray-900 dark:text-white min-h-[80px]"
            placeholder="Notes libres..."
            placeholderTextColor="#D0D0D8"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </FormCard>

        {/* Delete */}
        {!isNew && (
          <Pressable
            onPress={() => setShowDelete(true)}
            className="bg-red-50 dark:bg-red-950 rounded-2xl p-4 mb-8 items-center border border-red-100 dark:border-red-900"
          >
            <Text className="text-red-500 font-semibold text-sm">
              Supprimer cet invité
            </Text>
          </Pressable>
        )}

        <View className="h-8" />
      </ScrollView>

      <ConfirmSheet
        visible={showDelete}
        title="Supprimer cet invité ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}
