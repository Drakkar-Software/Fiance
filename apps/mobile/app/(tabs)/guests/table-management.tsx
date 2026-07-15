import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { AlertTriangle, LayoutGrid, Trash2, Map as MapIcon, Ban } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { validateSeatingPlan } from "@fiance/sdk";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useSeatingConstraintsStore } from "@/store/useSeatingConstraintsStore";
import { DIET_LABELS } from "@/db/types";
import { FAB } from "@/components/FAB";
import { useCan } from "@/lib/permissions/usePermissions";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { HeaderAddButton } from "@/components/HeaderAddButton";

export default function TableManagementScreen() {
  const { t } = useTranslation("guests");
  const router = useRouter();
  const canEdit = useCan("guests", "edit");
  const tables = useGuestsStore((s) => s.tables);
  const guests = useGuestsStore((s) => s.guests);
  const addTable = useGuestsStore((s) => s.addTable);
  const updateTable = useGuestsStore((s) => s.updateTable);
  const removeTable = useGuestsStore((s) => s.removeTable);
  const seatingConstraints = useSeatingConstraintsStore((s) => s.seatingConstraints);
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

  const { violations } = useMemo(
    () => validateSeatingPlan(guests, tables, seatingConstraints),
    [guests, tables, seatingConstraints]
  );
  const conflictedGuestIds = useMemo(
    () => new Set(violations.flatMap((v) => v.guestIds)),
    [violations]
  );
  const hardViolationCount = violations.filter((v) => v.isHard).length;

  return (
    <View className="relative flex-1 bg-accent-paper">
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderAddButton
              accessibilityLabel={t("createTable2")}
              onPress={() => setShowAdd(true)}
            />
          ),
        }}
      />
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

      {/* Seating constraint conflicts */}
      {violations.length > 0 && (
        <Pressable
          onPress={() => router.push("/(tabs)/guests/seating-constraints")}
          className="mx-4 mt-3 bg-red-50 dark:bg-red-950 rounded-xl p-3 flex-row items-center border border-red-100 dark:border-red-900 active:opacity-70"
        >
          <View className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900 items-center justify-center mr-2">
            <Ban size={14} color="#EF4444" />
          </View>
          <Text className="text-sm text-red-700 dark:text-red-300 flex-1">
            {t("seatingConstraintConflicts", { count: violations.length })}
            {hardViolationCount > 0 ? ` (${t("seatingConstraintHardCount", { count: hardViolationCount })})` : ""}
          </Text>
        </Pressable>
      )}

      {tables.length === 0 && !showAdd ? (
        <EmptyState
          icon={LayoutGrid}
          title={t("noTables")}
          description={t("createTablesDesc")}
          actionLabel={canEdit ? t("createTable2") : undefined}
          onAction={canEdit ? () => setShowAdd(true) : undefined}
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
              <Text className="text-base font-semibold text-ink mb-3">
                {t("newTable")}
              </Text>
              <TextInput
                className="text-base text-ink border-b border-hair pb-2 mb-3"
                placeholder={t("tableName")}
                placeholderTextColor="#D0D0D8"
                value={newTableName}
                onChangeText={setNewTableName}
                autoFocus
                editable={canEdit}
              />
              <TextInput
                className="text-base text-ink border-b border-hair pb-2 mb-3"
                placeholder={t("capacity")}
                placeholderTextColor="#D0D0D8"
                value={newTableCapacity}
                onChangeText={setNewTableCapacity}
                keyboardType="numeric"
                editable={canEdit}
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
                  className="flex-1 bg-accent-paper py-2.5 rounded-xl items-center"
                >
                  <Text className="text-mute text-sm">{t("common:cancel")}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Tables list */}
          {tables.map((table) => {
            const tableGuests = guests.filter((g) => g.tableId === table.id);
            const isFull =
              table.capacity != null && tableGuests.length >= table.capacity;
            const tableHasConflict = tableGuests.some((g) => conflictedGuestIds.has(g.id));

            return (
              <View
                key={table.id}
                className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair"
              >
                {/* Table header */}
                <View className="flex-row items-center justify-between mb-2">
                  <Pressable
                    onPress={() => {
                      if (!canEdit) return;
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
                        className="text-base font-semibold text-ink flex-1"
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
                        editable={canEdit}
                      />
                    ) : (
                      <Text className="text-base font-semibold text-ink">
                        {table.name}
                      </Text>
                    )}
                    {tableHasConflict && (
                      <View className="w-6 h-6 rounded-full bg-red-50 dark:bg-red-950 items-center justify-center ml-1.5">
                        <Ban size={13} color="#EF4444" />
                      </View>
                    )}
                  </Pressable>
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`px-2.5 py-1 rounded-full ${
                        isFull
                          ? "bg-red-50 dark:bg-red-900"
                          : "bg-accent-paper"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isFull ? "text-red-500" : "text-mute"
                        }`}
                      >
                        {tableGuests.length}
                        {table.capacity ? `/${table.capacity}` : ""}
                      </Text>
                    </View>
                    {canEdit && (
                      <Pressable
                        onPress={() => setDeleteId(table.id)}
                        className="w-8 h-8 items-center justify-center"
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Assigned guests (read-only) */}
                {tableGuests.length > 0 ? (
                  tableGuests.map((g) => (
                    <View
                      key={g.id}
                      className="flex-row items-center py-2 border-t border-hair"
                    >
                      <View className="w-7 h-7 rounded-lg bg-accent-paper items-center justify-center mr-2">
                        <Text className="text-xs font-bold text-mute">
                          {g.firstName[0]}
                          {g.lastName[0]}
                        </Text>
                      </View>
                      <Text className="text-sm text-ink-soft flex-1">
                        {g.firstName} {g.lastName}
                      </Text>
                      {conflictedGuestIds.has(g.id) && (
                        <View className="flex-row items-center gap-1 mr-2">
                          <Ban size={12} color="#EF4444" />
                          <Text className="text-xs text-red-500 font-medium">
                            {t("seatingConflict")}
                          </Text>
                        </View>
                      )}
                      {g.diet && g.diet !== "STANDARD" && (
                        <Text className="text-xs text-amber-500 font-medium">
                          {t(DIET_LABELS[g.diet as keyof typeof DIET_LABELS])}
                        </Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text className="text-sm text-mute mt-1">
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
