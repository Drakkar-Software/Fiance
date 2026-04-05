import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGuestsStore } from "@/store/useGuestsStore";
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

export default function GuestsListScreen() {
  const router = useRouter();
  const guests = useGuestsStore((s) => s.guests);
  const counts = useGuestsStore((s) => s.getCounts());
  const [search, setSearch] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState<string>("ALL");

  const filteredGuests = useMemo(() => {
    return guests
      .filter((g) => {
        if (rsvpFilter !== "ALL" && g.rsvpStatus !== rsvpFilter) return false;
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
  }, [guests, search, rsvpFilter]);

  const tabs = [
    { key: "ALL", label: "Tous", count: counts.total },
    { key: "ACCEPTED", label: "Acceptés", count: counts.accepted },
    { key: "PENDING", label: "En attente", count: counts.pending },
    { key: "DECLINED", label: "Déclinés", count: counts.declined },
    { key: "MAYBE", label: "Peut-être", count: counts.maybe },
  ];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Stats bar */}
      <View className="bg-white dark:bg-gray-900 px-4 py-3 flex-row justify-between border-b border-gray-100 dark:border-gray-800">
        <View className="items-center">
          <Text className="text-lg font-bold text-emerald-500">
            {counts.accepted}
          </Text>
          <Text className="text-xs text-gray-500">Confirmés</Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {counts.total}
          </Text>
          <Text className="text-xs text-gray-500">Total</Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-blue-500">
            {counts.response_rate}%
          </Text>
          <Text className="text-xs text-gray-500">Réponses</Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/invites/tables")}
          className="items-center"
        >
          <Text className="text-lg font-bold text-primary-500">
            {counts.nb_no_table}
          </Text>
          <Text className="text-xs text-gray-500">Sans table</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View className="px-4 pt-3">
        <View className="flex-row items-center bg-white dark:bg-gray-900 rounded-xl px-3 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-900 dark:text-white"
            placeholder="Rechercher un invité..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* RSVP filter */}
      <View className="mt-3">
        <FilterTabs
          tabs={tabs}
          activeKey={rsvpFilter}
          onSelect={setRsvpFilter}
        />
      </View>

      {/* Guest list */}
      {filteredGuests.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="Aucun invité"
          description="Ajoutez votre premier invité pour commencer"
          actionLabel="Ajouter un invité"
          onAction={() => router.push("/(tabs)/invites/new" as any)}
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
                  pathname: "/(tabs)/invites/[id]",
                  params: { id: guest.id },
                })
              }
              className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-2 shadow-sm active:opacity-80"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mr-3">
                  <Text className="text-primary-500 font-bold text-base">
                    {guest.firstName[0]}
                    {guest.lastName[0]}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {guest.firstName} {guest.lastName}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {INVITATION_TYPE_LABELS[guest.invitationType as InvitationType]}
                    {guest.isChild ? " · Enfant" : ""}
                    {guest.diet && guest.diet !== "STANDARD"
                      ? ` · ${DIET_LABELS[guest.diet as keyof typeof DIET_LABELS]}`
                      : ""}
                  </Text>
                </View>
                <StatusBadge
                  label={RSVP_STATUS_LABELS[guest.rsvpStatus as RsvpStatus] || ""}
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
            pathname: "/(tabs)/invites/[id]",
            params: { id: "new" },
          })
        }
      />
    </View>
  );
}
