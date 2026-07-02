import React, { useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { LegendList } from "@legendapp/list";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Users, ChevronDown, ChevronUp } from "lucide-react-native";
import { useGuestsStore, computeCounts } from "@/store/useGuestsStore";
import { useInvitationTypesStore } from "@/store/useInvitationTypesStore";
import { useWeddingPartyStore } from "@/store/useWeddingPartyStore";
import {
  RSVP_STATUS_LABELS,
  RSVP_STATUS_COLORS,
  DIET_LABELS,
} from "@/db/types";
import type { RsvpStatus } from "@/db/types";
import { StatusBadge } from "@/components/StatusBadge";
import { FAB } from "@/components/FAB";
import { useIsWideScreen } from "@/lib/useIsWideScreen";
import { EmptyState } from "@/components/EmptyState";
import { SearchBar } from "@/components/SearchBar";
import { Avatar } from "@/components/Avatar";
import type { Guest } from "@/db/schema";
import type { GuestGroup } from "@fiance/sdk";

type GuestListItem =
  | { kind: "guest"; guest: Guest }
  | { kind: "group-header"; group: GuestGroup; count: number; collapsed: boolean };

export default function GuestsListScreen() {
  return (
    <View className="flex-1 bg-accent-paper">
      <GuestsView />
    </View>
  );
}

// ─── Guest Card ─────────────────────────────────────────────────────────

function GuestCard({ guest, invitationTypeLabel }: { guest: Guest; invitationTypeLabel: string }) {
  const { t } = useTranslation("guests");
  const router = useRouter();
  const companionName = useGuestsStore((s) => {
    if (!guest.companionId) return null;
    const c = s.guests.find((g) => g.id === guest.companionId);
    return c ? `${c.firstName} ${c.lastName}` : null;
  });
  const roleLabel = useWeddingPartyStore((s) => {
    const names = s.weddingRoleAssignments
      .filter((a) => a.guestId === guest.id)
      .map((a) => s.weddingRoles.find((r) => r.id === a.roleId)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : null;
  });

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/(tabs)/guests/[id]",
          params: { id: guest.id },
        })
      }
      className="bg-accent-card rounded-2xl p-4 mb-2 border border-hair active:opacity-80"
    >
      <View className="flex-row items-center">
        <View className="mr-3">
          <Avatar ini={`${guest.firstName[0]}${guest.lastName[0]}`} size={40} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-ink">
            {guest.firstName} {guest.lastName}
          </Text>
          <Text className="text-sm text-mute mt-0.5">
            {roleLabel ? `${roleLabel} · ` : ""}
            {invitationTypeLabel}
            {(guest.childrenCount ?? 0) > 0 ? ` · ${guest.childrenCount} ${t("child")}` : ""}
            {guest.diet && guest.diet !== "STANDARD"
              ? ` · ${t(DIET_LABELS[guest.diet as keyof typeof DIET_LABELS])}`
              : ""}
          </Text>
          {companionName && (
            <Text className="text-xs text-mute mt-0.5">
              {t("withCompanion", { name: companionName })}
            </Text>
          )}
        </View>
        <StatusBadge
          label={t(RSVP_STATUS_LABELS[guest.rsvpStatus as RsvpStatus] || "")}
          color={RSVP_STATUS_COLORS[guest.rsvpStatus as RsvpStatus] || "#9CA3AF"}
        />
      </View>
    </Pressable>
  );
}

// ─── Guests View ─────────────────────────────────────────────────────────

function GuestsView() {
  const { t } = useTranslation("guests");
  const router = useRouter();
  const isWide = useIsWideScreen();
  const guests = useGuestsStore((s) => s.guests);
  const groups = useGuestsStore((s) => s.groups);
  const invitationTypes = useInvitationTypesStore((s) => s.invitationTypes);
  const counts = useMemo(() => computeCounts(guests), [guests]);
  const [search, setSearch] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Map invitationType id → label for display
  const typeLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const it of invitationTypes) map.set(it.id, it.label);
    return map;
  }, [invitationTypes]);

  // Set of type IDs that require sleeping
  const sleepingTypeIds = useMemo(
    () => new Set(invitationTypes.filter((it) => it.needsSleeping).map((it) => it.id)),
    [invitationTypes]
  );

  // Count accepted guests whose type needsSleeping and have no accommodation
  const noAccomCount = useMemo(
    () => guests.filter(
      (g) => g.rsvpStatus === "ACCEPTED" && sleepingTypeIds.has(g.invitationType) && !g.accommodationId
    ).length,
    [guests, sleepingTypeIds]
  );

  const filteredGuests = useMemo(() => {
    return guests
      .filter((g) => {
        if (rsvpFilter === "NO_TABLE") {
          if (g.rsvpStatus !== "ACCEPTED" || g.tableId || g.noTableNeeded) return false;
        } else if (rsvpFilter === "NO_ACCOM") {
          if (g.rsvpStatus !== "ACCEPTED" || !sleepingTypeIds.has(g.invitationType) || g.accommodationId) return false;
        } else if (rsvpFilter !== "ALL" && g.rsvpStatus !== rsvpFilter) {
          return false;
        }
        if (typeFilter !== "ALL" && g.invitationType !== typeFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            g.firstName.toLowerCase().includes(q) ||
            g.lastName.toLowerCase().includes(q) ||
            g.email?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) =>
        `${a.lastName}${a.firstName}`.localeCompare(
          `${b.lastName}${b.firstName}`
        )
      );
  }, [guests, search, rsvpFilter, typeFilter, sleepingTypeIds]);

  const groupedGuests = useMemo(() => {
    if (groups.length === 0) return null;
    const ungrouped = filteredGuests.filter((g) => !g.groupId);
    const byGroup = groups
      .map((group) => ({
        group,
        guests: filteredGuests.filter((g) => g.groupId === group.id),
      }))
      .filter((section) => section.guests.length > 0);
    return { ungrouped, byGroup };
  }, [filteredGuests, groups]);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = useCallback((groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  // Flatten grouped/ungrouped guests into a single virtualizable list,
  // expanding group headers into the stream and skipping a group's guests
  // while it's collapsed.
  const listData = useMemo<GuestListItem[]>(() => {
    if (!groupedGuests) {
      return filteredGuests.map((guest) => ({ kind: "guest" as const, guest }));
    }
    const items: GuestListItem[] = groupedGuests.ungrouped.map((guest) => ({ kind: "guest" as const, guest }));
    for (const { group, guests: gList } of groupedGuests.byGroup) {
      const collapsed = collapsedGroups.has(group.id);
      items.push({ kind: "group-header", group, count: gList.length, collapsed });
      if (!collapsed) {
        for (const guest of gList) items.push({ kind: "guest", guest });
      }
    }
    return items;
  }, [groupedGuests, filteredGuests, collapsedGroups]);

  const renderItem = useCallback(
    ({ item }: { item: GuestListItem }) => {
      if (item.kind === "group-header") {
        const Chevron = item.collapsed ? ChevronDown : ChevronUp;
        return (
          <View className="px-4">
            <Pressable
              onPress={() => toggleGroup(item.group.id)}
              className="flex-row items-center justify-between mt-3 mb-2"
            >
              <Text className="text-xs font-semibold text-typography-400 uppercase tracking-wider">
                {item.group.name}
                <Text className="text-xs text-typography-300"> ({item.count})</Text>
              </Text>
              <Chevron size={14} color="#9CA3AF" />
            </Pressable>
          </View>
        );
      }
      return (
        <View className="px-4">
          <GuestCard
            guest={item.guest}
            invitationTypeLabel={typeLabels.get(item.guest.invitationType) ?? item.guest.invitationType}
          />
        </View>
      );
    },
    [toggleGroup, typeLabels]
  );

  const keyExtractor = useCallback(
    (item: GuestListItem) => (item.kind === "group-header" ? `g-${item.group.id}` : `u-${item.guest.id}`),
    []
  );

  const rsvpTabs = [
    { key: "ALL", label: t("all"), count: counts.total },
    { key: "ACCEPTED", label: t("confirmed"), count: counts.accepted },
    { key: "PENDING", label: t("pending"), count: counts.pending },
    { key: "DECLINED", label: t("declined"), count: counts.declined },
    { key: "MAYBE", label: t("maybe"), count: counts.maybe },
    { key: "NO_TABLE", label: t("noTable"), count: counts.no_table_count },
    ...(noAccomCount > 0 || rsvpFilter === "NO_ACCOM"
      ? [{ key: "NO_ACCOM", label: t("noAccommodation"), count: noAccomCount }]
      : []),
  ];

  const typeCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const g of guests) {
      map.set(g.invitationType, (map.get(g.invitationType) ?? 0) + 1);
    }
    return map;
  }, [guests]);

  const typeTabs = invitationTypes.map((it) => ({
    key: it.id,
    label: it.label,
    count: typeCounts.get(it.id) ?? 0,
  }));

  const listHeader = (
    <>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder={t("searchGuest")}
        className="px-4 pt-5 pb-2"
      />

      {/* Filters — single row: RSVP (filled) + separator + Type (outline, toggle) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-6 mb-10"
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: "center" }}
      >
        {rsvpTabs.map((tab) => {
          const isActive = tab.key === rsvpFilter;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setRsvpFilter(tab.key)}
              className={`px-4 py-2 rounded-full border ${
                isActive
                  ? "bg-primary-500 border-primary-500"
                  : "bg-accent-card border-hair"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive ? "text-white" : "text-mute"
                }`}
              >
                {tab.label} ({tab.count})
              </Text>
            </Pressable>
          );
        })}
        <View className="w-px bg-hair my-1" />
        {typeTabs.map((tab) => {
          const isActive = tab.key === typeFilter;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setTypeFilter(isActive ? "ALL" : tab.key)}
              className={`px-4 py-2 rounded-full border ${
                isActive
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                  : "bg-accent-card border-hair"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive
                    ? "text-primary-500"
                    : "text-mute"
                }`}
              >
                {tab.label} ({tab.count})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );

  return (
    <View className="relative flex-1">
      {/* Guest list */}
      {filteredGuests.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("noGuests")}
          description={t("addFirstGuest")}
          actionLabel={t("addGuest")}
          onAction={() => router.push("/(tabs)/guests/new" as any)}
          secondaryActionLabel={t("importExternalGuests")}
          onSecondaryAction={() => router.push("/settings/import-external")}
        />
      ) : (
        <LegendList
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={84}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listHeader}
          ListFooterComponent={<View className="h-24" />}
        />
      )}

      {isWide && (
        <FAB
          onPress={() =>
            router.push({
              pathname: "/(tabs)/guests/[id]",
              params: { id: "new" },
            })
          }
        />
      )}

    </View>
  );
}

// Groups and table-list management moved to dedicated routes
// (groups.tsx, table-management.tsx), reached via the header overflow menu.
