import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import { useGuestsStore } from "@/store/useGuestsStore";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { DIET_LABELS } from "@/db/types";

export default function TablesScreen() {
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
      Alert.alert("Erreur", "Le nom de la table est obligatoire");
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

  const unassigned = guests.filter(
    (g) => g.rsvpStatus === "ACCEPTED" && !g.tableId
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Unassigned guests warning */}
      {unassigned.length > 0 && (
        <View className="mx-4 mt-4 bg-amber-50 dark:bg-amber-950 rounded-xl p-3 flex-row items-center border border-amber-100 dark:border-amber-900">
          <View className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900 items-center justify-center mr-2">
            <Ionicons name="alert" size={14} color="#F59E0B" />
          </View>
          <Text className="text-sm text-amber-700 dark:text-amber-300 flex-1">
            {unassigned.length} invité{unassigned.length > 1 ? "s" : ""}{" "}
            accepté{unassigned.length > 1 ? "s" : ""} sans table
          </Text>
        </View>
      )}

      {tables.length === 0 && !showAdd ? (
        <EmptyState
          icon="grid-outline"
          title="Aucune table"
          description="Créez des tables pour organiser votre plan de tables"
          actionLabel="Créer une table"
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {/* Add table form */}
          {showAdd && (
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
              <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Nouvelle table
              </Text>
              <TextInput
                className="text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-3"
                placeholder="Nom de la table"
                placeholderTextColor="#D0D0D8"
                value={newTableName}
                onChangeText={setNewTableName}
                autoFocus
              />
              <TextInput
                className="text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-3"
                placeholder="Capacité"
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
                  <Text className="text-white font-semibold text-sm">Créer</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowAdd(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 py-2.5 rounded-xl items-center"
                >
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    Annuler
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

            return (
              <View
                key={table.id}
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2.5 border border-gray-100 dark:border-gray-800"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-lg bg-accent-blush dark:bg-primary-900 items-center justify-center mr-2">
                      <Ionicons name="grid" size={16} color="#EC4899" />
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
                      onPress={() => setDeleteId(table.id)}
                      className="w-8 h-8 items-center justify-center"
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>

                {tableGuests.length > 0 ? (
                  tableGuests.map((g) => (
                    <View
                      key={g.id}
                      className="flex-row items-center py-2 border-t border-gray-50 dark:border-gray-800"
                    >
                      <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                        {g.firstName} {g.lastName}
                      </Text>
                      {g.diet && g.diet !== "STANDARD" && (
                        <Text className="text-xs text-amber-500 font-medium">
                          {DIET_LABELS[g.diet as keyof typeof DIET_LABELS]}
                        </Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text className="text-sm text-gray-400 mt-1">
                    Aucun invité assigné
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
        title="Supprimer cette table ?"
        message="Les invités assignés seront désassignés."
        confirmLabel="Supprimer"
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
