import React, { useState, useMemo, useRef, useCallback } from "react";
import { View, Text, ScrollView } from "react-native-css/components";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Ban } from "lucide-react-native";
import { Sheet } from "@fiance/ui/components";
import { validateSeatingPlan } from "@fiance/sdk";
import type { Table, Guest, SeatingConstraint } from "@/db/schema";

const CANVAS_W = 700;
const CANVAS_H = 600;
const TABLE_SIZE_BASE = 64;

function autoArrange(tables: Table[]): Record<string, { x: number; y: number }> {
  const cols = Math.ceil(Math.sqrt(tables.length));
  const gapX = Math.floor((CANVAS_W - 80) / Math.max(cols, 1));
  const gapY = Math.floor((CANVAS_H - 80) / Math.max(Math.ceil(tables.length / cols), 1));
  const result: Record<string, { x: number; y: number }> = {};
  tables.forEach((t, i) => {
    result[t.id] = {
      x: 40 + (i % cols) * gapX,
      y: 40 + Math.floor(i / cols) * gapY,
    };
  });
  return result;
}

interface DraggableTableProps {
  table: Table;
  guests: Guest[];
  isSelected: boolean;
  hasConflict: boolean;
  initialX: number;
  initialY: number;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
}

function DraggableTable({
  table,
  guests,
  isSelected,
  hasConflict,
  initialX,
  initialY,
  onSelect,
  onDragEnd,
}: DraggableTableProps) {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // Stable callback refs — avoids stale closures inside runOnJS worklets
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const handleDragEnd = useCallback((x: number, y: number) => {
    onDragEndRef.current(x, y);
  }, []);
  const handleSelect = useCallback(() => {
    onSelectRef.current();
  }, []);

  // Sync position from DB/auto-arrange when props change (not during drag)
  const prevPos = useRef({ x: initialX, y: initialY });
  if (prevPos.current.x !== initialX || prevPos.current.y !== initialY) {
    prevPos.current = { x: initialX, y: initialY };
    if (!isDragging.value) {
      translateX.value = initialX;
      translateY.value = initialY;
    }
  }

  const capacity = table.capacity ?? 8;
  const tableGuests = guests.filter((g) => g.tableId === table.id);
  const filled = tableGuests.length;
  const isFull = filled >= capacity;
  const isRound = (table.shape ?? "round") === "round";
  const size = Math.max(TABLE_SIZE_BASE, Math.min(96, TABLE_SIZE_BASE + capacity * 3));
  const tableWidth = isRound ? size : Math.round(size * 1.4);

  // Tap handles selection; Pan (minDistance=5) handles drag.
  // Race ensures only one activates: tap wins for clicks, pan wins once drag starts.
  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(handleSelect)();
  });

  const pan = Gesture.Pan()
    .minDistance(5)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      isDragging.value = true;
    })
    .onChange((e) => {
      translateX.value = Math.max(0, Math.min(CANVAS_W - tableWidth, startX.value + e.translationX));
      translateY.value = Math.max(0, Math.min(CANVAS_H - size, startY.value + e.translationY));
    })
    .onEnd(() => {
      isDragging.value = false;
      runOnJS(handleDragEnd)(translateX.value, translateY.value);
    });

  const gesture = Gesture.Race(pan, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    zIndex: isDragging.value ? 10 : 1,
    opacity: isDragging.value ? 0.85 : 1,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[{ position: "absolute", left: 0, top: 0, width: tableWidth, height: size }, animatedStyle]}
      >
        <View
          style={{ borderRadius: isRound ? size / 2 : 12, borderWidth: isSelected || hasConflict ? 2.5 : 1, flex: 1 }}
          className={`items-center justify-center ${
            hasConflict
              ? "bg-red-50 dark:bg-red-950 border-red-400 dark:border-red-600"
              : isFull
              ? "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700"
              : isSelected
              ? "bg-primary-50 dark:bg-primary-950 border-primary-400"
              : "bg-accent-card border-hair dark:border-hair"
          }`}
        >
          {hasConflict && (
            <View
              style={{ position: "absolute", top: -6, right: -6 }}
              className="w-5 h-5 rounded-full bg-red-500 items-center justify-center"
            >
              <Ban size={11} color="#FFFFFF" />
            </View>
          )}
          <Text
            className="text-xs font-bold text-ink-soft dark:text-mute text-center px-1"
            numberOfLines={1}
          >
            {table.name}
          </Text>
          <Text className={`text-xs font-semibold mt-0.5 ${isFull || hasConflict ? "text-red-500" : "text-mute"}`}>
            {filled}/{capacity}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

interface Props {
  tables: Table[];
  guests: Guest[];
  seatingConstraints?: SeatingConstraint[];
  updateTable: (id: string, updates: Partial<Table>) => void;
}

export function PlanView({ tables, guests, seatingConstraints = [], updateTable }: Props) {
  const { t } = useTranslation("guests");
  const allAtOrigin = tables.every((t) => (t.positionX ?? 0) === 0 && (t.positionY ?? 0) === 0);
  const autoPositions = useMemo(
    () => (allAtOrigin ? autoArrange(tables) : null),
    [tables, allAtOrigin],
  );

  const getPos = (t: Table) =>
    autoPositions ? autoPositions[t.id] : { x: t.positionX ?? 0, y: t.positionY ?? 0 };

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedTable = selectedId ? tables.find((t) => t.id === selectedId) : null;
  const selectedGuests = selectedId ? guests.filter((g) => g.tableId === selectedId) : [];

  const conflictedGuestIds = useMemo(() => {
    const { violations } = validateSeatingPlan(guests, tables, seatingConstraints);
    return new Set(violations.flatMap((v) => v.guestIds));
  }, [guests, tables, seatingConstraints]);

  return (
    <View className="flex-1">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{ width: CANVAS_W, height: CANVAS_H }}
            className="bg-accent-paper m-4 rounded-2xl overflow-hidden"
          >
            {/* Grid dots */}
            {Array.from({ length: 8 }).map((_, row) =>
              Array.from({ length: 9 }).map((_, col) => (
                <View
                  key={`${row}-${col}`}
                  style={{
                    position: "absolute",
                    left: col * (CANVAS_W / 8) + 4,
                    top: row * (CANVAS_H / 7) + 4,
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                  }}
                  className="bg-hair"
                />
              )),
            )}

            {/* Tables */}
            {tables.map((table) => {
              const { x, y } = getPos(table);
              return (
                <DraggableTable
                  key={table.id}
                  table={table}
                  guests={guests}
                  isSelected={selectedId === table.id}
                  hasConflict={guests.some((g) => g.tableId === table.id && conflictedGuestIds.has(g.id))}
                  initialX={x}
                  initialY={y}
                  onSelect={() => {
                    setSelectedId(table.id);
                  }}
                  onDragEnd={(newX, newY) => {
                    if (allAtOrigin && autoPositions) {
                      // Commit all auto-arranged positions before the first manual placement
                      tables.forEach((t) => {
                        const pos = autoPositions[t.id];
                        if (pos) updateTable(t.id, { positionX: pos.x, positionY: pos.y });
                      });
                    }
                    updateTable(table.id, { positionX: newX, positionY: newY });
                  }}
                />
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>

      <Sheet visible={!!selectedId} onDismiss={() => setSelectedId(null)}>
        <View className="bg-accent-card rounded-t-3xl px-5 pt-5 pb-8">
            {selectedTable && (
              <>
                <Text className="text-lg font-bold text-ink">
                  {selectedTable.name}
                </Text>
                <Text className="text-sm text-mute mb-4">
                  {selectedGuests.length} / {selectedTable.capacity ?? "∞"}
                </Text>

                <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                  {selectedGuests.length === 0 ? (
                    <Text className="text-center text-mute py-6">
                      {t("noGuestsAssigned")}
                    </Text>
                  ) : (
                    selectedGuests.map((guest) => (
                      <View
                        key={guest.id}
                        className="flex-row items-center py-2.5 border-b border-hair"
                      >
                        <View className="w-8 h-8 rounded-lg bg-accent-blush dark:bg-primary-900 items-center justify-center mr-3">
                          <Text className="text-primary-500 font-bold text-xs">
                            {guest.firstName[0]}{guest.lastName[0]}
                          </Text>
                        </View>
                        <Text className="flex-1 text-base text-ink">
                          {guest.firstName} {guest.lastName}
                        </Text>
                        {conflictedGuestIds.has(guest.id) && (
                          <View className="flex-row items-center gap-1 mr-2">
                            <Ban size={12} color="#EF4444" />
                            <Text className="text-xs text-red-500 font-medium">
                              {t("seatingConflict")}
                            </Text>
                          </View>
                        )}
                        {guest.rsvpStatus && (
                          <View
                            className={`px-2 py-0.5 rounded-full ${
                              guest.rsvpStatus === "ACCEPTED"
                                ? "bg-green-100 dark:bg-green-900"
                                : guest.rsvpStatus === "DECLINED"
                                ? "bg-red-100 dark:bg-red-900"
                                : guest.rsvpStatus === "MAYBE"
                                ? "bg-yellow-100 dark:bg-yellow-900"
                                : "bg-accent-paper"
                            }`}
                          >
                            <Text
                              className={`text-xs font-medium ${
                                guest.rsvpStatus === "ACCEPTED"
                                  ? "text-green-700 dark:text-green-300"
                                  : guest.rsvpStatus === "DECLINED"
                                  ? "text-red-700 dark:text-red-300"
                                  : guest.rsvpStatus === "MAYBE"
                                  ? "text-yellow-700 dark:text-yellow-300"
                                  : "text-mute"
                              }`}
                            >
                              {t(`rsvp.${guest.rsvpStatus}`)}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))
                  )}
                </ScrollView>
              </>
            )}
        </View>
      </Sheet>
    </View>
  );
}
