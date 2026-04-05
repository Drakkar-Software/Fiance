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
import { Ionicons } from "@expo/vector-icons";
import { v4 as uuid } from "uuid";
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
      notes: notes || null,
      updatedAt: now,
    };

    if (isNew) {
      addGuest({ ...guestData, id: uuid(), createdAt: now } as Guest);
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
        <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6">
          <InputRow label="Prénom *" value={firstName} onChangeText={setFirstName} />
          <InputRow label="Nom *" value={lastName} onChangeText={setLastName} />
          <InputRow label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <InputRow label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <InputRow label="Adresse" value={address} onChangeText={setAddress} />

          <Text className="text-sm text-gray-500 mt-3 mb-2">Côté</Text>
          <View className="flex-row gap-2">
            {SIDES.map((s) => (
              <Pressable
                key={s}
                onPress={() => setSide(s)}
                className={`px-3 py-2 rounded-full ${
                  side === s
                    ? "bg-primary-500"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <Text
                  className={`text-sm ${
                    side === s ? "text-white font-medium" : "text-gray-600"
                  }`}
                >
                  {SIDE_LABELS[s]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Invitation */}
        <SectionTitle>Invitation</SectionTitle>
        <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6">
          <Text className="text-sm text-gray-500 mb-2">
            Type d'invitation
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {INVITATION_TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setInvitationType(t)}
                className={`px-3 py-2 rounded-full ${
                  invitationType === t
                    ? "bg-primary-500"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <Text
                  className={`text-sm ${
                    invitationType === t
                      ? "text-white font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {INVITATION_TYPE_LABELS[t]}
                </Text>
              </Pressable>
            ))}
          </View>

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

        {/* RSVP */}
        <SectionTitle>RSVP</SectionTitle>
        <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6">
          <View className="flex-row flex-wrap gap-2">
            {RSVP_STATUSES.map((s) => (
              <Pressable key={s} onPress={() => setRsvpStatus(s)}>
                <StatusBadge
                  label={RSVP_STATUS_LABELS[s]}
                  color={
                    rsvpStatus === s ? RSVP_STATUS_COLORS[s] : "#D1D5DB"
                  }
                  size="md"
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Table */}
        {tables.length > 0 && (
          <>
            <SectionTitle>Table</SectionTitle>
            <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => setTableId("")}
                    className={`px-3 py-2 rounded-full ${
                      !tableId
                        ? "bg-primary-500"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        !tableId ? "text-white font-medium" : "text-gray-600"
                      }`}
                    >
                      Non assigné
                    </Text>
                  </Pressable>
                  {tables.map((t) => (
                    <Pressable
                      key={t.id}
                      onPress={() => setTableId(t.id)}
                      className={`px-3 py-2 rounded-full ${
                        tableId === t.id
                          ? "bg-primary-500"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          tableId === t.id
                            ? "text-white font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        {t.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          </>
        )}

        {/* Diet */}
        <SectionTitle>Régime alimentaire</SectionTitle>
        <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6">
          <View className="flex-row flex-wrap gap-2 mb-3">
            {DIETS.map((d) => (
              <Pressable
                key={d}
                onPress={() => setDiet(d)}
                className={`px-3 py-2 rounded-full ${
                  diet === d
                    ? "bg-primary-500"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <Text
                  className={`text-sm ${
                    diet === d ? "text-white font-medium" : "text-gray-600"
                  }`}
                >
                  {DIET_LABELS[d]}
                </Text>
              </Pressable>
            ))}
          </View>
          {(diet === "ALLERGY" || diet === "VEGETARIAN" || diet === "VEGAN") && (
            <TextInput
              className="text-base text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-800 pt-3 mt-2"
              placeholder="Précisions (allergies, restrictions...)"
              placeholderTextColor="#9CA3AF"
              value={dietNotes}
              onChangeText={setDietNotes}
              multiline
            />
          )}
        </View>

        {/* Notes */}
        <SectionTitle>Notes</SectionTitle>
        <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6">
          <TextInput
            className="text-base text-gray-900 dark:text-white min-h-[80px]"
            placeholder="Notes libres..."
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Delete */}
        {!isNew && (
          <Pressable
            onPress={() => setShowDelete(true)}
            className="bg-red-50 dark:bg-red-950 rounded-xl p-4 mb-8 items-center"
          >
            <Text className="text-red-500 font-semibold">
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

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-sm font-medium text-gray-500 mb-2 uppercase">
      {children}
    </Text>
  );
}

function InputRow({
  label,
  value,
  onChangeText,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad";
}) {
  return (
    <View className="border-b border-gray-100 dark:border-gray-800 py-3">
      <Text className="text-sm text-gray-500 mb-1">{label}</Text>
      <TextInput
        className="text-base text-gray-900 dark:text-white"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}

function ToggleRow({
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
      className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800"
    >
      <Text className="text-base text-gray-700 dark:text-gray-300">
        {label}
      </Text>
      <Ionicons
        name={value ? "checkbox" : "square-outline"}
        size={24}
        color={value ? "#10B981" : "#9CA3AF"}
      />
    </Pressable>
  );
}
