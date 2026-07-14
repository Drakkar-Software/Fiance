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
import { useWeddingPartyStore } from "@/store/useWeddingPartyStore";
import { useMealSelectionsStore } from "@/store/useMealSelectionsStore";
import { useWeddingEventsStore } from "@/store/useWeddingEventsStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useSeatingConstraintsStore } from "@/store/useSeatingConstraintsStore";
import { useCommunicationsStore } from "@/store/useCommunicationsStore";
import {
  MEAL_CHOICE_LABELS,
  SEATING_CONSTRAINT_TYPE_LABELS,
  COMMUNICATION_CHANNEL_LABELS,
  type MealChoice,
  type SeatingConstraintType,
  type CommunicationChannel,
} from "@fiance/sdk";
import { useGuestRsvpUrl } from "@/lib/rsvp-sync";
import {
  RSVP_STATUS_LABELS,
  RSVP_STATUS_COLORS,
  DIET_LABELS,
  TRANSPORT_MODE_LABELS,
} from "@/db/types";
import type {
  RsvpStatus,
  Diet,
  TransportMode,
} from "@/db/types";
import {
  UserPlus,
  XCircle,
  Share2,
  BedDouble,
  Tag,
  ChevronRight,
  Mail,
  CheckCircle2,
  Circle,
  LayoutGrid,
  Utensils,
  Car,
  Gift,
  FileText,
  UsersRound,
  Ban,
  type LucideIcon,
} from "lucide-react-native";
import { Sheet } from "@fiance/ui/components";
import { toast } from "@/lib/toast/sonner";
import { analytics } from "@/lib/analytics";
import { useCanAddMore, FREE_LIMITS } from "@/lib/limits";
import { PaywallSheet } from "@/components/PaywallSheet";
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
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";
import { theme as GP } from "@/lib/theme";
import { HorizontalChipSelect } from "@/components/HorizontalChipSelect";
import { StatusSelector } from "@/components/StatusSelector";
import { PageHeader } from "@/components/PageHeader";
import { Seal } from "@/components/Seal";
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

type SheetKey = "role" | "contact" | "rsvp" | "placement" | "meal" | "transport" | "postWedding" | "notes";

export default function GuestDetailScreen() {
  const { t } = useTranslation("guests");
  const canEdit = useCanEditHere();
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
  const weddingRoles = useWeddingPartyStore((s) => s.weddingRoles);
  const weddingRoleAssignments = useWeddingPartyStore((s) => s.weddingRoleAssignments);
  const addRoleAssignment = useWeddingPartyStore((s) => s.addRoleAssignment);
  const removeRoleAssignment = useWeddingPartyStore((s) => s.removeRoleAssignment);
  const seatingConstraints = useSeatingConstraintsStore((s) => s.seatingConstraints);
  const communications = useCommunicationsStore((s) => s.communications);
  const toggleRecipient = useCommunicationsStore((s) => s.toggleRecipient);
  const mealSelections = useMealSelectionsStore((s) => s.mealSelections);
  const addMealSelection = useMealSelectionsStore((s) => s.addMealSelection);
  const updateMealSelection = useMealSelectionsStore((s) => s.updateMealSelection);
  const weddingEvents = useWeddingEventsStore((s) => s.weddingEvents);
  const getPrimaryEvent = useWeddingEventsStore((s) => s.getPrimaryEvent);
  const vendors = useVendorsStore((s) => s.vendors);
  const shuttleVendors = vendors.filter((v) => v.type === "SHUTTLE");

  const weddingDate = useWeddingStore((s) => s.wedding?.weddingDate);
  const isPostWedding = weddingDate ? new Date(weddingDate) < new Date() : false;
  const accommodations = useAccommodationsStore((s) => s.accommodations);
  const invitationTypes = useInvitationTypesStore((s) => s.invitationTypes);
  const registry = useWeddingRegistryStore((s) => s.registry);
  const activeEntry = registry?.weddings.find((w) => w.id === registry.activeWeddingId);

  const isNew = id === "new";
  const existing = guests.find((g) => g.id === id);
  // Defense-in-depth: the guests list's FAB/header already gate this on the
  // happy path, but this screen is directly reachable by URL on web (deep
  // link, stale bookmark) — re-check at the actual write boundary too.
  const canAddGuest = useCanAddMore("guests", guests.length);
  const [showPaywall, setShowPaywall] = useState(false);

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
  const [transportMode, setTransportMode] = useState<TransportMode>(
    (existing?.transportMode as TransportMode) || "car"
  );
  const [shuttleVendorId, setShuttleVendorId] = useState(existing?.shuttleVendorId || "");
  const [shuttlePickupLocation, setShuttlePickupLocation] = useState(existing?.shuttlePickupLocation || "");
  const [shuttlePickupTime, setShuttlePickupTime] = useState(existing?.shuttlePickupTime || "");
  const [parkingNeeded, setParkingNeeded] = useState(existing?.parkingNeeded || false);
  const [arrivalNotes, setArrivalNotes] = useState(existing?.arrivalNotes || "");
  const [showDelete, setShowDelete] = useState(false);
  const [showCompanionPicker, setShowCompanionPicker] = useState(false);
  const [showCompanionConfirm, setShowCompanionConfirm] = useState(false);
  const [pendingCompanionId, setPendingCompanionId] = useState("");
  const [activeSheet, setActiveSheet] = useState<SheetKey | null>(null);
  const rsvpUrl = useGuestRsvpUrl(isNew ? undefined : id, activeEntry);

  const canSave = firstName.trim().length > 0 && lastName.trim().length > 0;

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(t("common:error"), t("firstLastRequired"));
      return;
    }
    if (isNew && !canAddGuest) {
      toast.error(t("common:premiumLimits.guests", { limit: FREE_LIMITS.guests }));
      setShowPaywall(true);
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
      transportMode,
      shuttleVendorId: shuttleVendorId || null,
      shuttlePickupLocation: shuttlePickupLocation || null,
      shuttlePickupTime: shuttlePickupTime || null,
      parkingNeeded,
      parkingNotes: existing?.parkingNotes ?? null,
      arrivalNotes: arrivalNotes || null,
      updatedAt: now,
    };

    const guestId = isNew ? Crypto.randomUUID() : id!;
    if (isNew) {
      addGuest({ ...guestData, id: guestId, createdAt: now } as Guest);
      analytics.capture("guest_added");
    } else {
      updateGuest(guestId, guestData);
      const logisticsChanged =
        transportMode !== (existing?.transportMode || "car") ||
        (shuttleVendorId || null) !== existing?.shuttleVendorId ||
        (arrivalNotes || null) !== existing?.arrivalNotes ||
        parkingNeeded !== (existing?.parkingNeeded || false);
      if (logisticsChanged) analytics.capture("guest_logistics_updated");
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
    analytics.capture("guest_deleted");
    setShowDelete(false);
    router.back();
  };

  const guestRoles = isNew ? [] : weddingRoleAssignments.filter((a) => a.guestId === id);
  const guestConstraints = isNew ? [] : seatingConstraints.filter((c) => c.guestIds.includes(id!));
  const mealSelection = isNew ? null : mealSelections.find((m) => m.guestId === id) ?? null;
  const handleMealChoiceChange = (mealChoice: MealChoice) => {
    if (isNew || !id) return;
    if (mealSelection) {
      updateMealSelection(mealSelection.id, { mealChoice });
    } else {
      const now = new Date().toISOString();
      const primaryEvent = weddingEvents.length > 0 ? getPrimaryEvent() : null;
      addMealSelection({
        id: Crypto.randomUUID(),
        guestId: id,
        eventId: primaryEvent?.id ?? null,
        mealChoice,
        courses: null,
        notes: null,
        createdAt: now,
        updatedAt: now,
      });
      analytics.capture("meal_choice_set");
    }
  };

  // ─── Section summaries (drive the compact rows below) ────────────────────

  const roleName = (a: (typeof guestRoles)[number]) =>
    weddingRoles.find((r) => r.id === a.roleId)?.name ?? "";
  const roleSummary = guestRoles.length > 0
    ? guestRoles.map(roleName).filter(Boolean).join(", ")
    : t("sections.roleEmpty");

  const contactSummary = [email, phone].filter(Boolean).join(" · ") || t("sections.contactEmpty");

  const invitationTypeLabel = invitationTypes.find((it) => it.id === invitationType)?.label ?? invitationType;
  const rsvpSummary = `${t(RSVP_STATUS_LABELS[rsvpStatus])} · ${invitationTypeLabel}`;

  const tableName = noTableNeeded
    ? t("common:noTableNeeded")
    : tables.find((tbl) => tbl.id === tableId)?.name ?? t("unassigned");
  const accommodationName = accommodations.find((a) => a.id === accommodationId)?.name;
  const placementSummary = guestConstraints.length > 0
    ? `${tableName} · ${t("sections.constraintCount", { count: guestConstraints.length })}`
    : tableName;

  const mealLabel = !isNew
    ? t(MEAL_CHOICE_LABELS[(mealSelection?.mealChoice as MealChoice) || "STANDARD"])
    : null;
  const mealDietSummary = mealLabel ? `${t(DIET_LABELS[diet])} · ${mealLabel}` : t(DIET_LABELS[diet]);

  const transportSummary = [
    t(TRANSPORT_MODE_LABELS[transportMode]),
    accommodationName,
    parkingNeeded ? t("logistics.parkingNeeded") : null,
  ].filter(Boolean).join(" · ");

  const postWeddingSummary = thankYouSent ? t("thankYouSent") : t("sections.postWeddingPending");

  const notesSummary = notes.trim() || t("sections.notesEmpty");

  return (
    <View className="flex-1 bg-accent-paper">
      <Stack.Screen
        options={{
          title: firstName || lastName ? `${firstName} ${lastName}`.trim() : "",
          headerRight: () => (
            <SaveHeaderButton label={t("common:save")} enabled={canSave} onPress={handleSave} />
          ),
        }}
      />
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {!isNew && (
          <View style={{ position: "relative", marginBottom: 16, overflow: "visible" }}>
            <PageHeader
              eyebrow={t("guest")}
              title={firstName || t("guest")}
              tagline={lastName || undefined}
              titleSize={26}
              style={{ paddingHorizontal: 0, paddingTop: 0 }}
            />
            {rsvpStatus === "ACCEPTED" && (
              <Seal label="✓" sublabel={t("confirmed").toLowerCase()} color="#6e7a4a" size={40} angle={-8} style={{ position: "absolute", top: -8, right: 8 }} />
            )}
          </View>
        )}
        {guestRoles.length > 0 && (
          <Pressable
            onPress={() => setActiveSheet("role")}
            className="flex-row flex-wrap gap-1.5 mb-4"
          >
            {guestRoles.map((r) => (
              <View key={r.id} className="px-2.5 py-1 rounded-full bg-accent-clay-soft dark:bg-primary-900">
                <Text className="text-xs font-medium text-primary-600">{roleName(r)}</Text>
              </View>
            ))}
          </Pressable>
        )}

        {/* Name — always visible, required to save */}
        <SectionTitle>{t("personalInfo")}</SectionTitle>
        <FormCard>
          <InputRow label={t("firstName")} value={firstName} onChangeText={setFirstName} />
          <InputRow label={t("lastName")} value={lastName} onChangeText={setLastName} />
        </FormCard>

        {/* Everything else: compact summary rows, each opening a bottom sheet */}
        {!isNew && (
          <GuestSectionRow
            icon={UsersRound}
            title={t("sections.role")}
            summary={roleSummary}
            onPress={() => setActiveSheet("role")}
          />
        )}
        <GuestSectionRow
          icon={Mail}
          title={t("sections.contact")}
          summary={contactSummary}
          onPress={() => setActiveSheet("contact")}
        />
        <GuestSectionRow
          icon={CheckCircle2}
          title={t("sections.rsvpInvitation")}
          summary={rsvpSummary}
          onPress={() => setActiveSheet("rsvp")}
        />
        <GuestSectionRow
          icon={LayoutGrid}
          title={t("sections.placement")}
          summary={placementSummary}
          onPress={() => setActiveSheet("placement")}
        />
        <GuestSectionRow
          icon={Utensils}
          title={t("sections.mealDiet")}
          summary={mealDietSummary}
          onPress={() => setActiveSheet("meal")}
        />
        <GuestSectionRow
          icon={Car}
          title={t("sections.transport")}
          summary={transportSummary}
          onPress={() => setActiveSheet("transport")}
        />
        {isPostWedding && (
          <GuestSectionRow
            icon={Gift}
            title={t("postWedding")}
            summary={postWeddingSummary}
            onPress={() => setActiveSheet("postWedding")}
          />
        )}
        <GuestSectionRow
          icon={FileText}
          title={t("notes")}
          summary={notesSummary}
          onPress={() => setActiveSheet("notes")}
        />

        {!isNew && (
          <View className="flex-row gap-3 mb-3 mt-1">
            {activeEntry?.seedPhrase && (
              <Pressable
                onPress={async () => {
                  const url = rsvpUrl;
                  if (!url) return;
                  analytics.capture("guest_rsvp_shared");
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
                className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-2xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950 active:opacity-70"
              >
                <Share2 size={16} color={GP.clay} />
                <Text className="text-sm font-semibold text-primary-500">{t("rsvpLink")}</Text>
              </Pressable>
            )}
            <View className="flex-1">
              <DeleteButton compact label={t("deleteGuest")} onPress={() => setShowDelete(true)} />
            </View>
          </View>
        )}

        <View className="h-24" />
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

      {/* ─── Section sheets ─────────────────────────────────────────────── */}

      <GuestSheet title={t("sections.contact")} visible={activeSheet === "contact"} onDismiss={() => setActiveSheet(null)}>
        <InputRow label={t("email")} value={email} onChangeText={setEmail} keyboardType="email-address" />
        <InputRow label={t("phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <InputRow label={t("address")} value={address} onChangeText={setAddress} />
      </GuestSheet>

      {!isNew && (
        <GuestSheet title={t("sections.role")} visible={activeSheet === "role"} onDismiss={() => setActiveSheet(null)}>
          {guestRoles.length > 0 && (
            <View className="mb-3">
              {guestRoles.map((r) => (
                <View key={r.id} className="flex-row items-center justify-between py-2 border-b border-hair">
                  <Text className="text-sm text-ink">{roleName(r)}</Text>
                  <Pressable onPress={() => removeRoleAssignment(r.id)}>
                    <XCircle size={16} color="#9CA3AF" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          {weddingRoles.length === 0 ? (
            <Pressable
              onPress={() => {
                setActiveSheet(null);
                router.push("/(tabs)/guests/wedding-party");
              }}
              className="active:opacity-60"
            >
              <Text className="text-xs text-mute mb-1">{t("weddingParty.noRolesYet")}</Text>
              <Text className="text-xs text-primary-500 font-medium">{t("weddingParty.manageRoles")}</Text>
            </Pressable>
          ) : (
            <>
              <Text className="text-xs text-mute mb-2 font-medium">{t("weddingParty.addRole")}</Text>
              <HorizontalChipSelect
                options={weddingRoles
                  .filter((role) => !guestRoles.some((r) => r.roleId === role.id))
                  .map((role) => ({ key: role.id, label: role.name }))}
                activeKey=""
                onSelect={(roleId) => {
                  const now = new Date().toISOString();
                  addRoleAssignment({
                    id: Crypto.randomUUID(),
                    roleId,
                    guestId: id!,
                    notes: null,
                    sortOrder: null,
                    createdAt: now,
                    updatedAt: now,
                  });
                  analytics.capture("wedding_role_assigned");
                }}
              />
              <Pressable
                onPress={() => {
                  setActiveSheet(null);
                  router.push("/(tabs)/guests/wedding-party");
                }}
                className="mt-3 active:opacity-60"
              >
                <Text className="text-xs text-primary-500 font-medium">{t("weddingParty.manageRoles")}</Text>
              </Pressable>
            </>
          )}
        </GuestSheet>
      )}

      <GuestSheet title={t("sections.rsvpInvitation")} visible={activeSheet === "rsvp"} onDismiss={() => setActiveSheet(null)}>
        <Text className="text-xs text-mute mb-2 font-medium">{t("rsvpLabel")}</Text>
        <StatusSelector
          options={RSVP_STATUSES.map((s) => ({
            key: s,
            label: t(RSVP_STATUS_LABELS[s]),
            color: RSVP_STATUS_COLORS[s],
          }))}
          activeKey={rsvpStatus}
          onSelect={(k) => setRsvpStatus(k as RsvpStatus)}
        />

        <Text className="text-xs text-mute mb-2 mt-3 font-medium">{t("invitationType")}</Text>
        {invitationTypes.length > 0 ? (
          <HorizontalChipSelect
            options={invitationTypes.map((it) => ({ key: it.id, label: it.label }))}
            activeKey={invitationType}
            onSelect={setInvitationType}
          />
        ) : (
          <Pressable
            onPress={() => { setActiveSheet(null); router.push("/(tabs)/guests/invitation-types"); }}
            className="flex-row items-center gap-1.5 active:opacity-60"
          >
            <Tag size={14} color="#9CA3AF" />
            <Text className="text-xs text-mute dark:text-mute">
              {t("noInvitationTypes")} —{" "}
              <Text className="text-primary-500 font-medium">{t("newInvitationType")}</Text>
            </Text>
          </Pressable>
        )}

        <Text className="text-xs text-mute mt-4 mb-2 font-medium">
          {t("companionLabel")}
        </Text>
        <Pressable
          onPress={() => setShowCompanionPicker(true)}
          className={`px-3.5 py-2.5 rounded-xl border flex-row items-center ${
            companionId
              ? "bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-800"
              : "bg-accent-card border-hair"
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
              <Text className="text-sm text-mute ml-2">
                {t("selectCompanion")}
              </Text>
            </>
          )}
        </Pressable>
        <View className="flex-row items-center justify-between py-3 border-b border-hair mt-1">
          <Text className="text-base text-ink-soft">{t("childrenLabel")}</Text>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => setChildrenCount(Math.max(0, childrenCount - 1))}
              className="w-8 h-8 rounded-full bg-accent-paper items-center justify-center"
            >
              <Text className="text-lg text-mute">−</Text>
            </Pressable>
            <Text className="text-base font-semibold text-ink w-6 text-center">{childrenCount}</Text>
            <Pressable
              onPress={() => setChildrenCount(childrenCount + 1)}
              className="w-8 h-8 rounded-full bg-accent-paper items-center justify-center"
            >
              <Text className="text-lg text-mute">+</Text>
            </Pressable>
          </View>
        </View>

        {!isNew && (
          <>
            <Text className="text-xs text-mute mb-2 mt-4 font-medium">{t("sections.communications")}</Text>
            {communications.length > 0 ? (
              communications.map((comm) => {
                const sent = comm.recipients.some((r) => r.guestId === id);
                return (
                  <Pressable
                    key={comm.id}
                    onPress={() => toggleRecipient(comm.id, id!, new Date().toISOString())}
                    className="flex-row items-center py-2 border-b border-hair"
                  >
                    {sent ? <CheckCircle2 size={16} color="#6e7a4a" /> : <Circle size={16} color="#C0C0C8" />}
                    <View className="flex-1 ml-2.5">
                      <Text className="text-sm text-ink" numberOfLines={1}>{comm.label}</Text>
                      {comm.channel && (
                        <Text className="text-xs text-mute mt-0.5">
                          {t(COMMUNICATION_CHANNEL_LABELS[comm.channel as CommunicationChannel])}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <Text className="text-xs text-mute mb-2">{t("sections.communicationsEmpty")}</Text>
            )}
            <Pressable
              onPress={() => { setActiveSheet(null); router.push("/(tabs)/guests/communications"); }}
              className="mt-2 active:opacity-60"
            >
              <Text className="text-xs text-primary-500 font-medium">{t("sections.viewAllCommunications")}</Text>
            </Pressable>
          </>
        )}
      </GuestSheet>

      <GuestSheet title={t("sections.placement")} visible={activeSheet === "placement"} onDismiss={() => setActiveSheet(null)}>
        <Text className="text-xs text-mute mb-2 font-medium">{t("table")}</Text>
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

        {groups.length > 0 && (
          <>
            <Text className="text-xs text-mute mt-4 mb-2 font-medium">{t("groupLabel")}</Text>
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

        {!isNew && (
          <>
            <Text className="text-xs text-mute mb-2 mt-4 font-medium">{t("sections.placementConstraints")}</Text>
            {guestConstraints.length > 0 ? (
              guestConstraints.map((c) => {
                const otherNames = c.guestIds
                  .filter((gid) => gid !== id)
                  .map((gid) => {
                    const g = guests.find((gg) => gg.id === gid);
                    return g ? `${g.firstName} ${g.lastName}` : "";
                  })
                  .filter(Boolean)
                  .join(", ");
                return (
                  <View key={c.id} className="flex-row items-center py-2 border-b border-hair">
                    <Ban size={14} color="#EF4444" />
                    <View className="flex-1 ml-2.5">
                      <Text className="text-sm text-ink">
                        {t(SEATING_CONSTRAINT_TYPE_LABELS[c.type as SeatingConstraintType])}
                      </Text>
                      {otherNames && <Text className="text-xs text-mute mt-0.5">{otherNames}</Text>}
                    </View>
                  </View>
                );
              })
            ) : (
              <Text className="text-xs text-mute mb-2">{t("sections.constraintsEmpty")}</Text>
            )}
            <Pressable
              onPress={() => {
                setActiveSheet(null);
                router.push("/(tabs)/guests/seating-constraints");
              }}
              className="mt-2 active:opacity-60"
            >
              <Text className="text-xs text-primary-500 font-medium">{t("sections.manageConstraints")}</Text>
            </Pressable>
          </>
        )}
      </GuestSheet>

      <GuestSheet title={t("sections.mealDiet")} visible={activeSheet === "meal"} onDismiss={() => setActiveSheet(null)}>
        <Text className="text-xs text-mute mb-2 font-medium">{t("dietLabel")}</Text>
        <ChipSelect
          options={DIETS}
          value={diet}
          onChange={setDiet}
          labels={Object.fromEntries(DIETS.map((d) => [d, t(DIET_LABELS[d])])) as Record<Diet, string>}
        />
        {(diet === "ALLERGY" || diet === "VEGETARIAN" || diet === "VEGAN") && (
          <TextInput
            className="text-base text-ink pt-3 mt-3"
            placeholder={t("dietDetails")}
            placeholderTextColor="#D0D0D8"
            value={dietNotes}
            onChangeText={setDietNotes}
            multiline
            editable={canEdit}
          />
        )}

        {!isNew && (
          <>
            <Text className="text-xs text-mute mb-2 mt-4 font-medium">{t("mealChoiceSection")}</Text>
            <ChipSelect
              options={Object.keys(MEAL_CHOICE_LABELS) as MealChoice[]}
              value={(mealSelection?.mealChoice as MealChoice) || "STANDARD"}
              onChange={handleMealChoiceChange}
              labels={Object.fromEntries(
                (Object.keys(MEAL_CHOICE_LABELS) as MealChoice[]).map((m) => [m, t(MEAL_CHOICE_LABELS[m])])
              ) as Record<MealChoice, string>}
            />
          </>
        )}
      </GuestSheet>

      <GuestSheet title={t("sections.transport")} visible={activeSheet === "transport"} onDismiss={() => setActiveSheet(null)}>
        <Text className="text-xs text-mute mb-2 font-medium">{t("logistics.transportModeLabel")}</Text>
        <ChipSelect
          options={["car", "train", "shuttle", "taxi"] as TransportMode[]}
          value={transportMode}
          onChange={setTransportMode}
          labels={Object.fromEntries(
            (["car", "train", "shuttle", "taxi"] as TransportMode[]).map((m) => [m, t(TRANSPORT_MODE_LABELS[m])])
          ) as Record<TransportMode, string>}
        />

        <Text className="text-xs text-mute mb-2 mt-4 font-medium">{t("accommodationSection")}</Text>
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
              <View className="mt-2">
                <InputRow
                  label={t("roomNumber")}
                  value={roomNumber}
                  onChangeText={setRoomNumber}
                />
              </View>
            )}
          </>
        ) : (
          <Pressable
            onPress={() => { setActiveSheet(null); router.push("/(tabs)/guests/accommodations"); }}
            className="flex-row items-center gap-1.5 active:opacity-60"
          >
            <BedDouble size={14} color="#9CA3AF" />
            <Text className="text-xs text-mute dark:text-mute">
              {t("noAccommodations")} —{" "}
              <Text className="text-primary-500 font-medium">{t("newAccommodation")}</Text>
            </Text>
          </Pressable>
        )}

        {transportMode === "shuttle" && shuttleVendors.length > 0 && (
          <View className="mt-3">
            <Text className="text-xs text-mute mb-2 font-medium">{t("logistics.shuttleVendor")}</Text>
            <ChipSelect
              options={["", ...shuttleVendors.map((v) => v.id)]}
              value={shuttleVendorId}
              onChange={setShuttleVendorId}
              labels={Object.fromEntries([
                ["", t("none")],
                ...shuttleVendors.map((v) => [v.id, v.name]),
              ])}
            />
            <InputRow
              label={t("logistics.shuttlePickupLocation")}
              value={shuttlePickupLocation}
              onChangeText={setShuttlePickupLocation}
            />
            <InputRow
              label={t("logistics.shuttlePickupTime")}
              value={shuttlePickupTime}
              onChangeText={setShuttlePickupTime}
              placeholder="17:30"
            />
          </View>
        )}
        <View className="mt-3">
          <ToggleRow
            label={t("logistics.parkingNeeded")}
            value={parkingNeeded}
            onToggle={() => setParkingNeeded(!parkingNeeded)}
          />
        </View>
        <InputRow
          label={t("logistics.arrivalNotes")}
          value={arrivalNotes}
          onChangeText={setArrivalNotes}
          placeholder={t("logistics.arrivalNotesPlaceholder")}
        />
      </GuestSheet>

      {isPostWedding && (
        <GuestSheet title={t("postWedding")} visible={activeSheet === "postWedding"} onDismiss={() => setActiveSheet(null)}>
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
        </GuestSheet>
      )}

      <GuestSheet title={t("notes")} visible={activeSheet === "notes"} onDismiss={() => setActiveSheet(null)}>
        <TextInput
          className="text-base text-ink min-h-[120px]"
          placeholder={t("freeNotes")}
          placeholderTextColor="#D0D0D8"
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
          editable={canEdit}
        />
      </GuestSheet>

      <PaywallSheet visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </View>
  );
}

function GuestSectionRow({
  icon: Icon,
  title,
  summary,
  onPress,
}: {
  icon: LucideIcon;
  title: string;
  summary: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair flex-row items-center active:opacity-70"
    >
      <View className="w-9 h-9 rounded-full bg-accent-clay-soft dark:bg-primary-900 items-center justify-center mr-3">
        <Icon size={16} color="#b96a4a" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-ink">{title}</Text>
        <Text className="text-xs text-mute mt-0.5" numberOfLines={1}>
          {summary}
        </Text>
      </View>
      <ChevronRight size={16} color="#C0C0C8" />
    </Pressable>
  );
}

function GuestSheet({
  title,
  visible,
  onDismiss,
  children,
}: {
  title: string;
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation("common");
  return (
    <Sheet
      visible={visible}
      onDismiss={onDismiss}
      // GuestSheet's content is capped by the ScrollView's own maxHeight below,
      // so it never needs the full native medium/large fallback. Two points
      // (compact default, draggable up) since sub-sheets vary a lot in length —
      // role/placement/notes are short, rsvp/contact can run much longer.
      snapPoints={Platform.OS === "ios" ? ["55%", "85%"] : undefined}
    >
      <View className="bg-accent-card rounded-t-3xl px-5 pt-5 pb-8">
        <Text className="text-lg font-bold text-ink mb-3">{title}</Text>
        <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          {children}
        </ScrollView>
        <Pressable
          onPress={onDismiss}
          className="mt-4 py-3 rounded-2xl items-center bg-primary-500 active:opacity-80"
        >
          <Text className="text-white font-semibold text-base">{t("done")}</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

export async function generateStaticParams() { return []; }
