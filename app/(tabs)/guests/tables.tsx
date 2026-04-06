import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  LayoutGrid,
  Trash2,
  Plus,
  X,
  UserPlus,
  UserMinus,
} from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { useGuestsStore } from "@/store/useGuestsStore";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { DIET_LABELS } from "@/db/types";

export default function TablesScreen() {
  const { t } = useTranslation("guests");
  const tables = useGuestsStore((s) => s.tables);
  const guests = useGuestsStore((s) => s.guests);
  const addTable = useGuestsStore((s) => s.addTable);
  const removeTable = useGuestsStore((s) => s.removeTable);
  const updateGuest = useGuestsStore((s) => s.updateGuest);
  const [showAdd, setShowAdd] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // Which table is in "assign mode" (showing unassigned guest picker)
  const [assigningTableId, setAssigningTableId] = useState<string | null>(null);

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

  const unassigned = useMemo(
    () => guests
      .filter((g) => g.rsvpStatus === "ACCEPTED" && !g.tableId && !g.noTableNeeded)
      .sort((a, b) =>
        `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`)
      ),
    [guests]
  );

  const assignGuest = (guestId: string, tableId: string) => {
    updateGuest(guestId, { tableId });
  };

  const unassignGuest = (guestId: string) => {
    updateGuest(guestId, { tableId: null });
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Unassigned guests warning */}
      {unassigned.length > 0 && (
        <View className="mx-4 mt-4 bg-amber-50 dark:bg-amber-950 rounded-xl p-3 flex-row items-center border border-amber-100 dark:border-amber-900">
          <View className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900 items-center justify-center mr-2">
            <AlertTriangle size={14} color="#F59E0B" />
          </View>
          <Text className="text-sm text-amber-700 dark:text-amber-300 flex-1">
            {t("guestsAcceptedNoTable", { count: unassigned.length })}
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
                  <Text className="text-white font-semibold text-sm">
                    {t("createTable")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowAdd(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 py-2.5 rounded-xl items-center"
                >
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    {t("common:cancel")}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Tables list */}
          {tables.map((table) => {
            const tableGuests = guests.filter((g) => g.tableId === table.id);
            const isFull =
              table.capacity != null && tableGuests.length >= table.capacity;
            const isAssigning = assigningTableId === table.id;

            return (
              <View
                key={table.id}
                className={`bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2.5 border ${
                  isAssigning
                    ? "border-primary-300 dark:border-primary-700"
                    : "border-gray-100 dark:border-gray-800"
                }`}
              >
                {/* Table header */}
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    <View className="w-8 h-8 rounded-lg bg-accent-blush dark:bg-primary-900 items-center justify-center mr-2">
                      <LayoutGrid size={16} color="#EC4899" />
                    </View>
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">
                      {table.name}
                    </Text>
                  </View>
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
                      onPress={() =>
                        setAssigningTableId(isAssigning ? null : table.id)
                      }
                      className={`w-8 h-8 items-center justify-center rounded-lg ${
                        isAssigning ? "bg-primary-50 dark:bg-primary-900" : ""
                      }`}
                    >
                      {isAssigning ? (
                        <X size={16} color="#EC4899" />
                      ) : (
                        <UserPlus size={16} color="#EC4899" />
                      )}
                    </Pressable>
                    <Pressable
                      onPress={() => setDeleteId(table.id)}
                      className="w-8 h-8 items-center justify-center"
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>

                {/* Assigned guests */}
                {tableGuests.length > 0 ? (
                  tableGuests.map((g) => (
                    <Pressable
                      key={g.id}
                      onPress={() =>
                        Alert.alert(
                          g.firstName + " " + g.lastName,
                          "Retirer de cette table ?",
                          [
                            { text: "Annuler", style: "cancel" },
                            {
                              text: "Retirer",
                              style: "destructive",
                              onPress: () => unassignGuest(g.id),
                            },
                          ]
                        )
                      }
                      className="flex-row items-center py-2 border-t border-gray-50 dark:border-gray-800 active:opacity-60"
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
                        <Text className="text-xs text-amber-500 font-medium mr-2">
                          {t(DIET_LABELS[g.diet as keyof typeof DIET_LABELS])}
                        </Text>
                      )}
                      <UserMinus size={14} color="#C0C0C8" />
                    </Pressable>
                  ))
                ) : (
                  <Text className="text-sm text-gray-400 mt-1">
                    Aucun invité assigné
                  </Text>
                )}

                {/* Inline guest picker for this table */}
                {isAssigning && (
                  <View className="mt-3 pt-3 border-t border-primary-100 dark:border-primary-900">
                    <Text className="text-xs font-semibold text-primary-500 mb-2 uppercase tracking-wider">
                      Ajouter un invité
                    </Text>
                    {unassigned.length === 0 ? (
                      <Text className="text-sm text-gray-400">
                        Tous les invités acceptés sont assignés
                      </Text>
                    ) : (
                      <View className="flex-row flex-wrap gap-2">
                        {unassigned.map((g) => (
                          <Pressable
                            key={g.id}
                            onPress={() => assignGuest(g.id, table.id)}
                            className="flex-row items-center bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl active:bg-primary-50 dark:active:bg-primary-900 border border-gray-100 dark:border-gray-700"
                          >
                            <Plus size={12} color="#EC4899" />
                            <Text className="text-sm text-gray-700 dark:text-gray-300 ml-1.5">
                              {g.firstName} {g.lastName}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {/* Unassigned guests section */}
          {unassigned.length > 0 && tables.length > 0 && (
            <View className="mt-4 mb-2">
              <Text className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Invités sans table ({unassigned.length})
              </Text>
              {unassigned.map((g) => (
                <View
                  key={g.id}
                  className="bg-white dark:bg-gray-900 rounded-xl p-3 mb-1.5 border border-dashed border-gray-200 dark:border-gray-700 flex-row items-center"
                >
                  <View className="w-7 h-7 rounded-lg bg-accent-blush dark:bg-primary-900 items-center justify-center mr-2">
                    <Text className="text-xs font-bold text-primary-500">
                      {g.firstName[0]}
                      {g.lastName[0]}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    {g.firstName} {g.lastName}
                  </Text>
                  {g.diet && g.diet !== "STANDARD" && (
                    <Text className="text-xs text-amber-500 font-medium mr-2">
                      {t(DIET_LABELS[g.diet as keyof typeof DIET_LABELS])}
                    </Text>
                  )}
                  {/* Quick-assign to table */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="max-w-[160px]"
                  >
                    <View className="flex-row gap-1.5">
                      {tables.map((t) => (
                        <Pressable
                          key={t.id}
                          onPress={() => assignGuest(g.id, t.id)}
                          className="px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900 active:bg-primary-100"
                        >
                          <Text className="text-xs font-medium text-primary-500">
                            {t.name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              ))}
            </View>
          )}

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
