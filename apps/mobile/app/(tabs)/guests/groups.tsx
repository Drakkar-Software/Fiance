import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { FolderOpen, Trash2 } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { useGuestsStore } from "@/store/useGuestsStore";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { FormActions } from "@/components/FormSection";

export default function GroupsScreen() {
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
    <View className="relative flex-1 bg-accent-paper">
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
              <Text className="text-base font-semibold text-ink mb-3">
                {t("newGroup")}
              </Text>
              <TextInput
                className="text-base text-ink border-b border-hair pb-2 mb-3"
                placeholder={t("groupName")}
                placeholderTextColor="#D0D0D8"
                value={newGroupName}
                onChangeText={setNewGroupName}
                autoFocus
              />
              <FormActions
                saveLabel={t("createGroup")}
                cancelLabel={t("common:cancel")}
                onSave={handleAdd}
                onCancel={() => setShowAdd(false)}
              />
            </View>
          )}

          {/* Groups list */}
          {groups.map((group) => {
            const groupGuests = guestsByGroup.get(group.id) ?? [];

            return (
              <View
                key={group.id}
                className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair"
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
                        className="text-base font-semibold text-ink flex-1"
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
                      <Text className="text-base font-semibold text-ink">
                        {group.name}
                      </Text>
                    )}
                  </Pressable>
                  <View className="flex-row items-center gap-2">
                    <View className="px-2.5 py-1 rounded-full bg-accent-paper">
                      <Text className="text-xs font-semibold text-mute">
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
                    </View>
                  ))
                ) : (
                  <Text className="text-sm text-mute mt-1">
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
