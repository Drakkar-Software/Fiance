import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native-css/components";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { LayoutGrid } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { useGuestsStore } from "@/store/useGuestsStore";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { PlanView } from "@/components/SeatingPlanView";

export default function TablesScreen() {
  const { t } = useTranslation("guests");
  const tables = useGuestsStore((s) => s.tables);
  const guests = useGuestsStore((s) => s.guests);
  const addTable = useGuestsStore((s) => s.addTable);
  const removeTable = useGuestsStore((s) => s.removeTable);
  const [showAdd, setShowAdd] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  return (
    <View className="flex-1 bg-accent-paper">
      {/* Add table form */}
      {showAdd && (
        <View className="mx-4 mt-4 bg-accent-card rounded-2xl p-4 border border-primary-200 dark:border-primary-800">
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
          />
          <TextInput
            className="text-base text-ink border-b border-hair pb-2 mb-3"
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
              <Text className="text-mute text-sm">
                {t("common:cancel")}
              </Text>
            </Pressable>
          </View>
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
        <PlanView
          tables={tables}
          guests={guests}
          updateTable={(id, updates) => useGuestsStore.getState().updateTable(id, updates)}
        />
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
