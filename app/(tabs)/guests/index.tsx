import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Search, XCircle, Users, AlertTriangle, LayoutGrid,
  Trash2, FolderOpen,
} from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { useGuestsStore, computeCounts } from "@/store/useGuestsStore";
import {
  RSVP_STATUS_LABELS,
  RSVP_STATUS_COLORS,
  INVITATION_TYPE_LABELS,
  DIET_LABELS,
} from "@/db/types";
import type { RsvpStatus, InvitationType } from "@/db/types";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterTabs } from "@/components/FilterTabs";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";

type InviteAspect = "guests" | "groups" | "tables";

export default function GuestsListScreen() {
  const { t } = useTranslation("guests");
  const [aspect, setAspect] = useState<InviteAspect>("guests");

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Segmented control */}
      <View className="px-4 pt-3 pb-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {(["guests", "groups", "tables"] as const).map((key) => (
            <Pressable
              key={key}
              onPress={() => setAspect(key)}
              className={`flex-1 py-2 rounded-lg items-center ${
                aspect === key ? "bg-white dark:bg-gray-700 shadow-sm" : ""
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  aspect === key
                    ? "text-primary-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {key === "guests"
                  ? t("common:tabs.guests")
                  : key === "groups"
                  ? t("groups")
                  : t("tables")}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

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

// ─── Guests View ─────────────────────────────────────────────────────────

function GuestsView() {
  const { t } = useTranslation("guests");
  const router = useRouter();
  const guests = useGuestsStore((s) => s.guests);
  const counts = useMemo(() => computeCounts(guests), [guests]);
  const [search, setSearch] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const filteredGuests = useMemo(() => {
    return guests
      .filter((g) => {
        // RSVP / no-table filter
        if (rsvpFilter === "NO_TABLE") {
          if (g.rsvpStatus !== "ACCEPTED" || g.tableId || g.noTableNeeded) return false;
        } else if (rsvpFilter !== "ALL" && g.rsvpStatus !== rsvpFilter) {
          return false;
        }
        // Invitation type filter
        if (typeFilter !== "ALL" && g.invitationType !== typeFilter) return false;
        // Search
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
  }, [guests, search, rsvpFilter, typeFilter]);

  const rsvpTabs = [
    { key: "ALL", label: t("all"), count: counts.total },
    { key: "ACCEPTED", label: t("confirmed"), count: counts.accepted },
    { key: "PENDING", label: t("pending"), count: counts.pending },
    { key: "DECLINED", label: t("declined"), count: counts.declined },
    { key: "MAYBE", label: t("maybe"), count: counts.maybe },
    { key: "NO_TABLE", label: t("noTable"), count: counts.nb_no_table },
  ];

  const typeCounts = useMemo(() => {
    const c = { CEREMONY: 0, COCKTAIL: 0, FULL: 0, BOTH_DAYS: 0 };
    for (const g of guests) {
      if (g.invitationType in c) c[g.invitationType as keyof typeof c]++;
    }
    return c;
  }, [guests]);

  const typeTabs = [
    { key: "ALL", label: t("all"), count: counts.total },
    { key: "CEREMONY", label: t("invitationTypes.CEREMONY"), count: typeCounts.CEREMONY },
    { key: "COCKTAIL", label: t("invitationTypes.COCKTAIL"), count: typeCounts.COCKTAIL },
    { key: "FULL", label: t("invitationTypes.FULL"), count: typeCounts.FULL },
    { key: "BOTH_DAYS", label: t("invitationTypes.BOTH_DAYS"), count: typeCounts.BOTH_DAYS },
  ];

  return (
    <View className="flex-1">
      {/* Search */}
      <View className="px-4 pt-3">
        <View className="flex-row items-center bg-white dark:bg-gray-900 rounded-xl px-3.5 py-2.5 border border-gray-100 dark:border-gray-800">
          <Search size={18} color="#C0C0C8" />
          <TextInput
            className="flex-1 ml-2.5 text-base text-gray-900 dark:text-white"
            placeholder={t("searchGuest")}
            placeholderTextColor="#C0C0C8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <XCircle size={18} color="#C0C0C8" />
            </Pressable>
          )}
        </View>
      </View>

      {/* RSVP filter */}
      <View className="mt-3">
        <FilterTabs
          tabs={rsvpTabs}
          activeKey={rsvpFilter}
          onSelect={setRsvpFilter}
        />
      </View>

      {/* Invitation type filter */}
      <View className="mt-1">
        <FilterTabs
          tabs={typeTabs}
          activeKey={typeFilter}
          onSelect={setTypeFilter}
        />
      </View>

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
          {filteredGuests.map((guest) => (
            <Pressable
              key={guest.id}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/guests/[id]",
                  params: { id: guest.id },
                })
              }
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2 border border-gray-100 dark:border-gray-800 active:opacity-80"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-accent-blush dark:bg-primary-900 items-center justify-center mr-3">
                  <Text className="text-primary-500 font-bold text-sm">
                    {guest.firstName[0]}
                    {guest.lastName[0]}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {guest.firstName} {guest.lastName}
                  </Text>
                  <Text className="text-sm text-gray-400 mt-0.5">
                    {t(INVITATION_TYPE_LABELS[guest.invitationType as InvitationType])}
                    {guest.isChild ? " · " + t("child") : ""}
                    {guest.diet && guest.diet !== "STANDARD"
                      ? ` · ${t(DIET_LABELS[guest.diet as keyof typeof DIET_LABELS])}`
                      : ""}
                  </Text>
                </View>
                <StatusBadge
                  label={t(RSVP_STATUS_LABELS[guest.rsvpStatus as RsvpStatus] || "")}
                  color={RSVP_STATUS_COLORS[guest.rsvpStatus as RsvpStatus] || "#9CA3AF"}
                />
              </View>
            </Pressable>
          ))}
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
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
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
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2.5 border border-gray-100 dark:border-gray-800"
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
                      <FolderOpen size={16} color="#EC4899" />
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
                    <View className="px-2.5 py-1 rounded-full bg-gray-50 dark:bg-gray-800">
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
                      <View className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 items-center justify-center mr-2">
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
          {/* Add table form */}
          {showAdd && (
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
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
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2.5 border border-gray-100 dark:border-gray-800"
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
                      <LayoutGrid size={16} color="#EC4899" />
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
                          : "bg-gray-50 dark:bg-gray-800"
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
                      <View className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 items-center justify-center mr-2">
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
