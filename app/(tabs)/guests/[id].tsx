import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable } from "react-native-css/components";
import { Alert, Share, Platform } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import { useInvitationTypesStore } from "@/store/useInvitationTypesStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { useGuestRsvpUrl } from "@/lib/rsvp-sync";
import {
  RSVP_STATUS_LABELS,
  RSVP_STATUS_COLORS,
  DIET_LABELS,
} from "@/db/types";
import type {
  RsvpStatus,
  Diet,
} from "@/db/types";
import { UserPlus, XCircle, Share2, BedDouble, Tag } from "lucide-react-native";
import { toast } from "@/lib/toast/sonner";
import { analytics } from "@/lib/analytics";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { CompanionPickerModal } from "@/components/CompanionPickerModal";
import {
  SectionTitle,
  FormCard,
  InputRow,
  ToggleRow,
  ChipSelect,
} from "@/components/FormSection";
import { DeleteButton } from "@/components/DeleteButton";
import { SaveHeaderButton } from "@/components/SaveHeaderButton";
import { HorizontalChipSelect } from "@/components/HorizontalChipSelect";
import { StatusSelector } from "@/components/StatusSelector";
import type { Guest } from "@/db/schema";

const RSVP_STATUSES: RsvpStatus[] = ["PENDING", "ACCEPTED", "DECLINED", "MAYBE"];
const DIETS: Diet[] = [
  "STANDARD",
  "VEGETARIAN",
  "VEGAN",
  "HALAL",
  "KOSHER",
  "ALLERGY",
];

export default function GuestDetailScreen() {
  const { t } = useTranslation("guests");
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const guests = useGuestsStore((s) => s.guests);
  const tables = useGuestsStore((s) => s.tables);
  const groups = useGuestsStore((s) => s.groups);
  const addGuest = useGuestsStore((s) => s.addGuest);
  const updateGuest = useGuestsStore((s) => s.updateGuest);
  const removeGuest = useGuestsStore((s) => s.removeGuest);
  const linkCompanion = useGuestsStore((s) => s.linkCompanion);
  const unlinkCompanion = useGuestsStore((s) => s.unlinkCompanion);

  const weddingDate = useWeddingStore((s) => s.wedding?.weddingDate);
  const isPostWedding = weddingDate ? new Date(weddingDate) < new Date() : false;
  const accommodations = useAccommodationsStore((s) => s.accommodations);
  const invitationTypes = useInvitationTypesStore((s) => s.invitationTypes);
  const registry = useWeddingRegistryStore((s) => s.registry);
  const activeEntry = registry?.weddings.find((w) => w.id === registry.activeWeddingId);

  const isNew = id === "new";
  const existing = guests.find((g) => g.id === id);

  const [firstName, setFirstName] = useState(existing?.firstName || "");
  const [lastName, setLastName] = useState(existing?.lastName || "");
  const [groupId, setGroupId] = useState(existing?.groupId || "");
  const [invitationType, setInvitationType] = useState<string>(
    existing?.invitationType || "FULL"
  );
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>(
    (existing?.rsvpStatus as RsvpStatus) || "PENDING"
  );
  const [childrenCount, setChildrenCount] = useState(existing?.childrenCount ?? 0);
  const [diet, setDiet] = useState<Diet>((existing?.diet as Diet) || "STANDARD");
  const [dietNotes, setDietNotes] = useState(existing?.dietNotes || "");
  const [email, setEmail] = useState(existing?.email || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [address, setAddress] = useState(existing?.address || "");
  const [tableId, setTableId] = useState(existing?.tableId || "");
  const [noTableNeeded, setNoTableNeeded] = useState(existing?.noTableNeeded || false);
  const [giftDescription, setGiftDescription] = useState(existing?.giftDescription || "");
  const [thankYouSent, setThankYouSent] = useState(existing?.thankYouSent || false);
  const [notes, setNotes] = useState(existing?.notes || "");
  const [companionId, setCompanionId] = useState(existing?.companionId || "");
  const [accommodationId, setAccommodationId] = useState(existing?.accommodationId || "");
  const [roomNumber, setRoomNumber] = useState(existing?.roomNumber || "");
  const [showDelete, setShowDelete] = useState(false);
  const [showCompanionPicker, setShowCompanionPicker] = useState(false);
  const [showCompanionConfirm, setShowCompanionConfirm] = useState(false);
  const [pendingCompanionId, setPendingCompanionId] = useState("");
  const rsvpUrl = useGuestRsvpUrl(isNew ? undefined : id, activeEntry);

  const canSave = firstName.trim().length > 0 && lastName.trim().length > 0;

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(t("common:error"), t("firstLastRequired"));
      return;
    }

    const now = new Date().toISOString();
    const guestData: Partial<Guest> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      groupId: groupId || null,
      invitationType,
      rsvpStatus,
      rsvpDate:
        rsvpStatus !== "PENDING" && rsvpStatus !== existing?.rsvpStatus
          ? now
          : existing?.rsvpDate || null,
      childrenCount,
      diet,
      dietNotes: dietNotes || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      tableId: tableId || null,
      noTableNeeded,
      giftDescription: giftDescription || null,
      thankYouSent,
      thankYouSentDate: thankYouSent && !existing?.thankYouSent
        ? now
        : existing?.thankYouSentDate || null,
      accommodationId: accommodationId || null,
      roomNumber: roomNumber || null,
      notes: notes || null,
      updatedAt: now,
    };

    const guestId = isNew ? Crypto.randomUUID() : id!;
    if (isNew) {
      addGuest({ ...guestData, id: guestId, createdAt: now } as Guest);
      analytics.capture("guest_added");
    } else {
      updateGuest(guestId, guestData);
    }

    // Handle companion linking
    if (companionId && companionId !== existing?.companionId) {
      linkCompanion(guestId, companionId);
    } else if (!companionId && existing?.companionId) {
      unlinkCompanion(guestId);
    }

    router.back();
  };

  const handleDelete = () => {
    removeGuest(id!);
    setShowDelete(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-accent-paper">
      <Stack.Screen
        options={{
          title: isNew
            ? t("newGuest")
            : `${firstName} ${lastName}`.trim() || t("guest"),
          headerRight: () => (
            <SaveHeaderButton label={t("common:save")} enabled={canSave} onPress={handleSave} />
          ),
        }}
      />
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Personal info */}
        <SectionTitle>{t("personalInfo")}</SectionTitle>
        <FormCard>
          <InputRow label={t("firstName")} value={firstName} onChangeText={setFirstName} />
          <InputRow label={t("lastName")} value={lastName} onChangeText={setLastName} />
          <InputRow label={t("email")} value={email} onChangeText={setEmail} keyboardType="email-address" />
          <InputRow label={t("phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <InputRow label={t("address")} value={address} onChangeText={setAddress} />

          {groups.length > 0 && (
            <>
              <Text className="text-xs text-gray-400 mt-3 mb-2 font-medium">{t("groupLabel")}</Text>
              <HorizontalChipSelect
                options={[
                  { key: "", label: t("none") },
                  ...groups.map((g) => ({ key: g.id, label: g.name })),
                ]}
                activeKey={groupId}
                onSelect={setGroupId}
                className="mb-0"
              />
            </>
          )}

          {/* Companion picker */}
          <Text className="text-xs text-gray-400 mt-3 mb-2 font-medium">
            {t("companionLabel")}
          </Text>
          <Pressable
            onPress={() => setShowCompanionPicker(true)}
            className={`px-3.5 py-2.5 rounded-xl border flex-row items-center ${
              companionId
                ? "bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-800"
                : "bg-accent-card border-gray-200 dark:border-gray-700"
            }`}
          >
            {companionId ? (
              <>
                <UserPlus size={16} color="#b96a4a" />
                <Text className="text-sm text-primary-500 font-medium ml-2 flex-1">
                  {(() => {
                    const c = guests.find((g) => g.id === companionId);
                    return c ? `${c.firstName} ${c.lastName}` : "";
                  })()}
                </Text>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setCompanionId("");
                  }}
                >
                  <XCircle size={16} color="#9CA3AF" />
                </Pressable>
              </>
            ) : (
              <>
                <UserPlus size={16} color="#9CA3AF" />
                <Text className="text-sm text-gray-400 ml-2">
                  {t("selectCompanion")}
                </Text>
              </>
            )}
          </Pressable>
          <View className="flex-row items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
            <Text className="text-base text-gray-700 dark:text-gray-300">{t("childrenLabel")}</Text>
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
              >
                <Text className="text-lg text-gray-500">−</Text>
              </Pressable>
              <Text className="text-base font-semibold text-gray-900 dark:text-white w-6 text-center">{childrenCount}</Text>
              <Pressable
                onPress={() => setChildrenCount(childrenCount + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
              >
                <Text className="text-lg text-gray-500">+</Text>
              </Pressable>
            </View>
          </View>
        </FormCard>

        {/* RSVP */}
        <SectionTitle>RSVP</SectionTitle>
        <StatusSelector
          options={RSVP_STATUSES.map((s) => ({
            key: s,
            label: t(RSVP_STATUS_LABELS[s]),
            color: RSVP_STATUS_COLORS[s],
          }))}
          activeKey={rsvpStatus}
          onSelect={(k) => setRsvpStatus(k as RsvpStatus)}
        />

        {/* Invitation Type */}
        <SectionTitle>{t("invitationType")}</SectionTitle>
        {invitationTypes.length > 0 ? (
          <HorizontalChipSelect
            options={invitationTypes.map((it) => ({ key: it.id, label: it.label }))}
            activeKey={invitationType}
            onSelect={setInvitationType}
          />
        ) : (
          <Pressable
            onPress={() => router.push("/(tabs)/guests/invitation-types")}
            className="flex-row items-center gap-1.5 mb-4 active:opacity-60"
          >
            <Tag size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {t("noInvitationTypes")} —{" "}
              <Text className="text-primary-500 font-medium">{t("newInvitationType")}</Text>
            </Text>
          </Pressable>
        )}

        {/* Table */}
        <SectionTitle>{t("table")}</SectionTitle>
        <HorizontalChipSelect
          options={[
            { key: "", label: t("unassigned") },
            { key: "__no_table__", label: t("common:noTableNeeded") },
            ...tables.map((tbl) => ({ key: tbl.id, label: tbl.name })),
          ]}
          activeKey={noTableNeeded ? "__no_table__" : tableId}
          onSelect={(key) => {
            if (key === "__no_table__") { setTableId(""); setNoTableNeeded(true); }
            else { setTableId(key); setNoTableNeeded(false); }
          }}
        />

        {/* Accommodation */}
        <SectionTitle>{t("accommodationSection")}</SectionTitle>
        {accommodations.length > 0 ? (
          <>
            <HorizontalChipSelect
              options={[
                { key: "", label: t("none") },
                ...accommodations.map((a) => ({ key: a.id, label: a.name })),
              ]}
              activeKey={accommodationId}
              onSelect={setAccommodationId}
            />
            {accommodationId && (
              <FormCard>
                <InputRow
                  label={t("roomNumber")}
                  value={roomNumber}
                  onChangeText={setRoomNumber}
                />
              </FormCard>
            )}
          </>
        ) : (
          <Pressable
            onPress={() => router.push("/(tabs)/guests/accommodations")}
            className="flex-row items-center gap-1.5 mb-4 active:opacity-60"
          >
            <BedDouble size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {t("noAccommodations")} —{" "}
              <Text className="text-primary-500 font-medium">{t("newAccommodation")}</Text>
            </Text>
          </Pressable>
        )}

        {/* Diet */}
        <SectionTitle>{t("dietLabel")}</SectionTitle>
        <View className="mb-5">
          <ChipSelect
            options={DIETS}
            value={diet}
            onChange={setDiet}
            labels={Object.fromEntries(DIETS.map((d) => [d, t(DIET_LABELS[d])])) as Record<Diet, string>}
          />
          {(diet === "ALLERGY" || diet === "VEGETARIAN" || diet === "VEGAN") && (
            <TextInput
              className="text-base text-gray-900 dark:text-white pt-3 mt-3"
              placeholder={t("dietDetails")}
              placeholderTextColor="#D0D0D8"
              value={dietNotes}
              onChangeText={setDietNotes}
              multiline
            />
          )}
        </View>

        {/* Post-wedding: thank-you tracking */}
        {isPostWedding && (
          <>
            <SectionTitle>{t("postWedding")}</SectionTitle>
            <FormCard>
              <InputRow
                label={t("giftDescription")}
                value={giftDescription}
                onChangeText={setGiftDescription}
              />
              <ToggleRow
                label={t("thankYouSent")}
                value={thankYouSent}
                onToggle={() => setThankYouSent(!thankYouSent)}
              />
            </FormCard>
          </>
        )}

        {/* Notes */}
        <SectionTitle>{t("notes")}</SectionTitle>
        <FormCard>
          <TextInput
            className="text-base text-gray-900 dark:text-white min-h-[80px]"
            placeholder={t("freeNotes")}
            placeholderTextColor="#D0D0D8"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </FormCard>

        {!isNew && activeEntry?.seedPhrase && (
          <Pressable
            onPress={async () => {
              const url = rsvpUrl;
              if (!url) return;
              if (Platform.OS === "web") {
                try {
                  if (navigator.share) {
                    await navigator.share({ url });
                  } else {
                    await navigator.clipboard.writeText(url);
                    toast.success(t("linkCopied"));
                  }
                } catch {
                  // share dismissed or clipboard blocked — silently ignore
                }
              } else {
                try {
                  await Share.share({ message: url, url });
                } catch {
                  // share dismissed
                }
              }
            }}
            className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950 mb-3 active:opacity-70"
          >
            <Share2 size={16} color="#b96a4a" />
            <Text className="text-sm font-semibold text-primary-500">{t("rsvpLink")}</Text>
          </Pressable>
        )}


        {!isNew && (
          <DeleteButton label={t("deleteGuest")} onPress={() => setShowDelete(true)} />
        )}

        <View className="h-8" />
      </ScrollView>

      <ConfirmSheet
        visible={showDelete}
        title={t("deleteGuestConfirm")}
        message={t("irreversible")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />

      <CompanionPickerModal
        visible={showCompanionPicker}
        currentGuestId={isNew ? "__new__" : id!}
        currentCompanionId={companionId || null}
        onSelect={(selectedId) => {
          const target = guests.find((g) => g.id === selectedId);
          if (
            target?.companionId &&
            target.companionId !== (isNew ? "__new__" : id)
          ) {
            setPendingCompanionId(selectedId);
            setShowCompanionPicker(false);
            setShowCompanionConfirm(true);
          } else {
            setCompanionId(selectedId);
            setShowCompanionPicker(false);
          }
        }}
        onClear={() => {
          setCompanionId("");
          setShowCompanionPicker(false);
        }}
        onClose={() => setShowCompanionPicker(false)}
      />

      <ConfirmSheet
        visible={showCompanionConfirm}
        title={t("companionConflictTitle")}
        message={(() => {
          const target = guests.find((g) => g.id === pendingCompanionId);
          const old = guests.find((g) => g.id === target?.companionId);
          return t("companionConflictMessage", {
            name: target ? `${target.firstName} ${target.lastName}` : "",
            currentCompanion: old ? `${old.firstName} ${old.lastName}` : "",
          });
        })()}
        onConfirm={() => {
          setCompanionId(pendingCompanionId);
          setPendingCompanionId("");
          setShowCompanionConfirm(false);
        }}
        onCancel={() => {
          setPendingCompanionId("");
          setShowCompanionConfirm(false);
        }}
      />
    </View>
  );
}
