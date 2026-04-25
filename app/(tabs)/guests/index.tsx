import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Users, AlertTriangle, LayoutGrid,
  Trash2, FolderOpen, Map as MapIcon,
} from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { useGuestsStore, computeCounts } from "@/store/useGuestsStore";
import { useInvitationTypesStore } from "@/store/useInvitationTypesStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import {
  RSVP_STATUS_LABELS,
  RSVP_STATUS_COLORS,
  DIET_LABELS,
} from "@/db/types";
import type { RsvpStatus } from "@/db/types";
import { StatusBadge } from "@/components/StatusBadge";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { SegmentedControl } from "@/components/SegmentedControl";
import { SearchBar } from "@/components/SearchBar";
import { Avatar } from "@/components/Avatar";
import type { Guest } from "@/db/schema";

type InviteAspect = "guests" | "groups" | "tables";

export default function GuestsListScreen() {
  const { t } = useTranslation("guests");
  const [aspect, setAspect] = useState<InviteAspect>("guests");

  return (
    <View className="flex-1 bg-accent-paper">
      <SegmentedControl
        segments={[
          { key: "guests", label: t("common:tabs.guests") },
          { key: "groups", label: t("groups") },
          { key: "tables", label: t("tables") },
        ]}
        activeKey={aspect}
        onSelect={(key) => setAspect(key as InviteAspect)}
      />

      {aspect === "guests" ? (
        <GuestsView />
      ) : aspect === "groups" ? (
        <GroupsView />
      ) : (
        <TablesView />
      )}
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

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/(tabs)/guests/[id]",
          params: { id: guest.id },
        })
      }
      className="bg-accent-card rounded-2xl p-4 mb-2 border border-gray-100 dark:border-gray-800 active:opacity-80"
    >
      <View className="flex-row items-center">
        <View className="mr-3">
          <Avatar ini={`${guest.firstName[0]}${guest.lastName[0]}`} size={40} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            {guest.firstName} {guest.lastName}
          </Text>
          <Text className="text-sm text-gray-400 mt-0.5">
            {invitationTypeLabel}
            {(guest.childrenCount ?? 0) > 0 ? ` · ${guest.childrenCount} ${t("child")}` : ""}
            {guest.diet && guest.diet !== "STANDARD"
              ? ` · ${t(DIET_LABELS[guest.diet as keyof typeof DIET_LABELS])}`
              : ""}
          </Text>
          {companionName && (
            <Text className="text-xs text-gray-400 mt-0.5">
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

  return (
    <View className="flex-1">
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder={t("searchGuest")}
        className="px-4 pt-3"
      />

      {/* Filters — single row: RSVP (filled) + separator + Type (outline, toggle) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3 mb-4"
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
                  : "bg-accent-card border-gray-200 dark:border-gray-700"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive ? "text-white" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {tab.label} ({tab.count})
              </Text>
            </Pressable>
          );
        })}
        <View className="w-px bg-gray-200 dark:bg-gray-700 my-1" />
        {typeTabs.map((tab) => {
          const isActive = tab.key === typeFilter;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setTypeFilter(isActive ? "ALL" : tab.key)}
              className={`px-4 py-2 rounded-full border ${
                isActive
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                  : "bg-accent-card border-gray-200 dark:border-gray-700"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive
                    ? "text-primary-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {tab.label} ({tab.count})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Guest list */}
      {filteredGuests.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("noGuests")}
          description={t("addFirstGuest")}
          actionLabel={t("addGuest")}
          onAction={() => router.push("/(tabs)/guests/new" as any)}
        />
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {groupedGuests ? (
            <>
              {groupedGuests.ungrouped.map((guest) => (
                <GuestCard key={guest.id} guest={guest} invitationTypeLabel={typeLabels.get(guest.invitationType) ?? guest.invitationType} />
              ))}
              {groupedGuests.byGroup.map(({ group, guests: gList }) => (
                <CollapsibleSection
                  key={group.id}
                  title={group.name}
                  count={gList.length}
                >
                  {gList.map((guest) => (
                    <GuestCard key={guest.id} guest={guest} invitationTypeLabel={typeLabels.get(guest.invitationType) ?? guest.invitationType} />
                  ))}
                </CollapsibleSection>
              ))}
            </>
          ) : (
            filteredGuests.map((guest) => (
              <GuestCard key={guest.id} guest={guest} invitationTypeLabel={typeLabels.get(guest.invitationType) ?? guest.invitationType} />
            ))
          )}
          <View className="h-24" />
        </ScrollView>
      )}

      <FAB
        onPress={() =>
          router.push({
            pathname: "/(tabs)/guests/[id]",
            params: { id: "new" },
          })
        }
      />

    </View>
  );
}

// ─── Groups View ────────────────────────────────────────────────────────

function GroupsView() {
  const { t } = useTranslation("guests");
  const groups = useGuestsStore((s) => s.groups);
  const guests = useGuestsStore((s) => s.guests);
  const addGroup = useGuestsStore((s) => s.addGroup);
  const updateGroup = useGuestsStore((s) => s.updateGroup);
  const removeGroup = useGuestsStore((s) => s.removeGroup);
  const [showAdd, setShowAdd] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const guestsByGroup = useMemo(() => {
    const map = new Map<string, typeof guests>();
    for (const g of guests) {
      if (g.groupId) {
        const arr = map.get(g.groupId);
        if (arr) arr.push(g);
        else map.set(g.groupId, [g]);
      }
    }
    return map;
  }, [guests]);

  const handleAdd = () => {
    if (!newGroupName.trim()) {
      Alert.alert(t("common:error"), t("groupNameRequired"));
      return;
    }
    const now = new Date().toISOString();
    addGroup({
      id: Crypto.randomUUID(),
      name: newGroupName.trim(),
      createdAt: now,
      updatedAt: now,
    });
    setNewGroupName("");
    setShowAdd(false);
  };

  return (
    <View className="flex-1">
      {groups.length === 0 && !showAdd ? (
        <EmptyState
          icon={FolderOpen}
          title={t("noGroups")}
          description={t("createGroupsDesc")}
          actionLabel={t("createGroup2")}
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Add group form */}
          {showAdd && (
            <View className="bg-accent-card rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
              <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                {t("newGroup")}
              </Text>
              <TextInput
                className="text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-3"
                placeholder={t("groupName")}
                placeholderTextColor="#D0D0D8"
                value={newGroupName}
                onChangeText={setNewGroupName}
                autoFocus
              />
              <View className="flex-row gap-2">
                <Pressable
                  onPress={handleAdd}
                  className="flex-1 bg-primary-500 py-2.5 rounded-xl items-center active:bg-primary-600"
                >
                  <Text className="text-white font-semibold text-sm">{t("createGroup")}</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowAdd(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 py-2.5 rounded-xl items-center"
                >
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">{t("common:cancel")}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Groups list */}
          {groups.map((group) => {
            const groupGuests = guestsByGroup.get(group.id) ?? [];

            return (
              <View
                key={group.id}
                className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-gray-100 dark:border-gray-800"
              >
                {/* Group header */}
                <View className="flex-row items-center justify-between mb-2">
                  <Pressable
                    onPress={() => {
                      setEditingGroupId(group.id);
                      setEditingName(group.name);
                    }}
                    className="flex-row items-center flex-1"
                  >
                    <View className="w-8 h-8 rounded-lg bg-accent-blush dark:bg-primary-900 items-center justify-center mr-2">
                      <FolderOpen size={16} color="#b96a4a" />
                    </View>
                    {editingGroupId === group.id ? (
                      <TextInput
                        className="text-base font-semibold text-gray-900 dark:text-white flex-1"
                        value={editingName}
                        onChangeText={setEditingName}
                        onBlur={() => {
                          if (editingName.trim()) {
                            updateGroup(group.id, { name: editingName.trim() });
                          }
                          setEditingGroupId(null);
                        }}
                        onSubmitEditing={() => {
                          if (editingName.trim()) {
                            updateGroup(group.id, { name: editingName.trim() });
                          }
                          setEditingGroupId(null);
                        }}
                        autoFocus
                        selectTextOnFocus
                      />
                    ) : (
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">
                        {group.name}
                      </Text>
                    )}
                  </Pressable>
                  <View className="flex-row items-center gap-2">
                    <View className="px-2.5 py-1 rounded-full bg-accent-paper dark:bg-gray-800">
                      <Text className="text-xs font-semibold text-gray-500">
                        {groupGuests.length}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setDeleteId(group.id)}
                      className="w-8 h-8 items-center justify-center"
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>

                {/* Group members */}
                {groupGuests.length > 0 ? (
                  groupGuests.map((g) => (
                    <View
                      key={g.id}
                      className="flex-row items-center py-2 border-t border-gray-50 dark:border-gray-800"
                    >
                      <View className="w-7 h-7 rounded-lg bg-accent-paper dark:bg-gray-800 items-center justify-center mr-2">
                        <Text className="text-xs font-bold text-gray-400">
                          {g.firstName[0]}
                          {g.lastName[0]}
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                        {g.firstName} {g.lastName}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-sm text-gray-400 mt-1">
                    {t("noGroupMembers")}
                  </Text>
                )}
              </View>
            );
          })}

          <View className="h-24" />
        </ScrollView>
      )}

      <FAB onPress={() => setShowAdd(true)} />

      <ConfirmSheet
        visible={!!deleteId}
        title={t("deleteGroup")}
        message={t("deleteGroupMsg")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={() => {
          if (deleteId) removeGroup(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}

// ─── Tables View ─────────────────────────────────────────────────────────

function TablesView() {
  const { t } = useTranslation("guests");
  const router = useRouter();
  const tables = useGuestsStore((s) => s.tables);
  const guests = useGuestsStore((s) => s.guests);
  const addTable = useGuestsStore((s) => s.addTable);
  const updateTable = useGuestsStore((s) => s.updateTable);
  const removeTable = useGuestsStore((s) => s.removeTable);
  const [showAdd, setShowAdd] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAdd = () => {
    if (!newTableName.trim()) {
      Alert.alert(t("common:error"), t("tableNameRequired"));
      return;
    }
    addTable({
      id: Crypto.randomUUID(),
      name: newTableName.trim(),
      capacity: newTableCapacity ? parseInt(newTableCapacity) : null,
      notes: null,
      positionX: null,
      positionY: null,
      shape: null,
    });
    setNewTableName("");
    setNewTableCapacity("");
    setShowAdd(false);
  };

  const unassignedCount = useMemo(
    () => guests.filter((g) => g.rsvpStatus === "ACCEPTED" && !g.tableId).length,
    [guests]
  );

  return (
    <View className="flex-1">
      {/* Unassigned guests warning */}
      {unassignedCount > 0 && (
        <View className="mx-4 mt-4 bg-amber-50 dark:bg-amber-950 rounded-xl p-3 flex-row items-center border border-amber-100 dark:border-amber-900">
          <View className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900 items-center justify-center mr-2">
            <AlertTriangle size={14} color="#F59E0B" />
          </View>
          <Text className="text-sm text-amber-700 dark:text-amber-300 flex-1">
            {t("guestsAcceptedNoTable", { count: unassignedCount })}
          </Text>
        </View>
      )}

      {tables.length === 0 && !showAdd ? (
        <EmptyState
          icon={LayoutGrid}
          title={t("noTables")}
          description={t("createTablesDesc")}
          actionLabel={t("createTable2")}
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Plan view link */}
          {tables.length > 0 && (
            <Pressable
              onPress={() => router.push("/(tabs)/guests/tables")}
              className="flex-row items-center justify-center gap-2 mb-4 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-950 border border-primary-100 dark:border-primary-900 active:opacity-70"
            >
              <MapIcon size={16} color="#b96a4a" />
              <Text className="text-sm font-semibold text-primary-500">{t("openPlanView")}</Text>
            </Pressable>
          )}

          {/* Add table form */}
          {showAdd && (
            <View className="bg-accent-card rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
              <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                {t("newTable")}
              </Text>
              <TextInput
                className="text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-3"
                placeholder={t("tableName")}
                placeholderTextColor="#D0D0D8"
                value={newTableName}
                onChangeText={setNewTableName}
                autoFocus
              />
              <TextInput
                className="text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-3"
                placeholder={t("capacity")}
                placeholderTextColor="#D0D0D8"
                value={newTableCapacity}
                onChangeText={setNewTableCapacity}
                keyboardType="numeric"
              />
              <View className="flex-row gap-2">
                <Pressable
                  onPress={handleAdd}
                  className="flex-1 bg-primary-500 py-2.5 rounded-xl items-center active:bg-primary-600"
                >
                  <Text className="text-white font-semibold text-sm">{t("createTable")}</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowAdd(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 py-2.5 rounded-xl items-center"
                >
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">{t("common:cancel")}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Tables list */}
          {tables.map((table) => {
            const tableGuests = guests.filter((g) => g.tableId === table.id);
            const isFull =
              table.capacity != null && tableGuests.length >= table.capacity;

            return (
              <View
                key={table.id}
                className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-gray-100 dark:border-gray-800"
              >
                {/* Table header */}
                <View className="flex-row items-center justify-between mb-2">
                  <Pressable
                    onPress={() => {
                      setEditingTableId(table.id);
                      setEditingName(table.name);
                    }}
                    className="flex-row items-center flex-1"
                  >
                    <View className="w-8 h-8 rounded-lg bg-accent-blush dark:bg-primary-900 items-center justify-center mr-2">
                      <LayoutGrid size={16} color="#b96a4a" />
                    </View>
                    {editingTableId === table.id ? (
                      <TextInput
                        className="text-base font-semibold text-gray-900 dark:text-white flex-1"
                        value={editingName}
                        onChangeText={setEditingName}
                        onBlur={() => {
                          if (editingName.trim()) {
                            updateTable(table.id, { name: editingName.trim() });
                          }
                          setEditingTableId(null);
                        }}
                        onSubmitEditing={() => {
                          if (editingName.trim()) {
                            updateTable(table.id, { name: editingName.trim() });
                          }
                          setEditingTableId(null);
                        }}
                        autoFocus
                        selectTextOnFocus
                      />
                    ) : (
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">
                        {table.name}
                      </Text>
                    )}
                  </Pressable>
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`px-2.5 py-1 rounded-full ${
                        isFull
                          ? "bg-red-50 dark:bg-red-900"
                          : "bg-accent-paper dark:bg-gray-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isFull ? "text-red-500" : "text-gray-500"
                        }`}
                      >
                        {tableGuests.length}
                        {table.capacity ? `/${table.capacity}` : ""}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setDeleteId(table.id)}
                      className="w-8 h-8 items-center justify-center"
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>

                {/* Assigned guests (read-only) */}
                {tableGuests.length > 0 ? (
                  tableGuests.map((g) => (
                    <View
                      key={g.id}
                      className="flex-row items-center py-2 border-t border-gray-50 dark:border-gray-800"
                    >
                      <View className="w-7 h-7 rounded-lg bg-accent-paper dark:bg-gray-800 items-center justify-center mr-2">
                        <Text className="text-xs font-bold text-gray-400">
                          {g.firstName[0]}
                          {g.lastName[0]}
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                        {g.firstName} {g.lastName}
                      </Text>
                      {g.diet && g.diet !== "STANDARD" && (
                        <Text className="text-xs text-amber-500 font-medium">
                          {t(DIET_LABELS[g.diet as keyof typeof DIET_LABELS])}
                        </Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text className="text-sm text-gray-400 mt-1">
                    {t("noGuestsAssigned")}
                  </Text>
                )}
              </View>
            );
          })}

          <View className="h-24" />
        </ScrollView>
      )}

      <FAB onPress={() => setShowAdd(true)} />

      <ConfirmSheet
        visible={!!deleteId}
        title={t("deleteTable")}
        message={t("deleteTableMsg")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={() => {
          if (deleteId) removeTable(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}
