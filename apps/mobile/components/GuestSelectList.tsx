import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native-css/components";
import { Check } from "lucide-react-native";
import { SearchBar } from "@/components/SearchBar";
import { Avatar } from "@/components/Avatar";
import type { Guest } from "@/db/schema";

/** Searchable, checkable guest list — embedded inline inside add/edit forms. */
export function GuestSelectList({
  guests,
  selectedIds,
  onToggle,
  searchPlaceholder,
  maxHeight = 220,
}: {
  guests: Guest[];
  selectedIds: Set<string>;
  onToggle: (guestId: string) => void;
  searchPlaceholder?: string;
  maxHeight?: number;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search) return guests;
    const q = search.toLowerCase();
    return guests.filter((g) => `${g.firstName} ${g.lastName}`.toLowerCase().includes(q));
  }, [guests, search]);

  return (
    <View>
      <SearchBar value={search} onChangeText={setSearch} placeholder={searchPlaceholder} />
      <ScrollView style={{ maxHeight }} className="mt-2" nestedScrollEnabled showsVerticalScrollIndicator>
        {filtered.map((g) => {
          const selected = selectedIds.has(g.id);
          return (
            <Pressable
              key={g.id}
              onPress={() => onToggle(g.id)}
              className="flex-row items-center justify-between py-2 px-1 border-b border-hair"
            >
              <View className="flex-row items-center gap-2.5 flex-1">
                <Avatar ini={`${g.firstName[0] ?? ""}${g.lastName[0] ?? ""}`} size={28} />
                <Text className="text-sm text-ink flex-1" numberOfLines={1}>
                  {g.firstName} {g.lastName}
                </Text>
              </View>
              {selected && <Check size={16} color="#6e7a4a" />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
