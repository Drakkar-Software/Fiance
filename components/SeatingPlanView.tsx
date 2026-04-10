import React, { useState, useMemo, useRef, useCallback } from "react";
import { View, Text, ScrollView } from "react-native-css/components";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import type { Table, Guest } from "@/db/schema";

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
  initialX: number;
  initialY: number;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
}

function DraggableTable({
  table,
  guests,
  isSelected,
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
  const dragDistance = useSharedValue(0);

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

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      isDragging.value = true;
      dragDistance.value = 0;
    })
    .onChange((e) => {
      translateX.value = Math.max(0, Math.min(CANVAS_W - tableWidth, startX.value + e.translationX));
      translateY.value = Math.max(0, Math.min(CANVAS_H - size, startY.value + e.translationY));
      dragDistance.value = Math.abs(e.translationX) + Math.abs(e.translationY);
    })
    .onEnd(() => {
      isDragging.value = false;
      if (dragDistance.value < 4) {
        runOnJS(handleSelect)();
      } else {
        runOnJS(handleDragEnd)(translateX.value, translateY.value);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    zIndex: isDragging.value ? 10 : 1,
    opacity: isDragging.value ? 0.85 : 1,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[{ position: "absolute", left: 0, top: 0, width: tableWidth, height: size }, animatedStyle]}
      >
        <View
          style={{ borderRadius: isRound ? size / 2 : 12, borderWidth: isSelected ? 2.5 : 1, flex: 1 }}
          className={`items-center justify-center ${
            isFull
              ? "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700"
              : isSelected
              ? "bg-primary-50 dark:bg-primary-950 border-primary-400"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
          }`}
        >
          <Text
            className="text-xs font-bold text-gray-700 dark:text-gray-200 text-center px-1"
            numberOfLines={1}
          >
            {table.name}
          </Text>
          <Text className={`text-xs font-semibold mt-0.5 ${isFull ? "text-red-500" : "text-gray-400"}`}>
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
  updateTable: (id: string, updates: Partial<Table>) => void;
}

export function PlanView({ tables, guests, updateTable }: Props) {
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

  return (
    <View className="flex-1">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{ width: CANVAS_W, height: CANVAS_H }}
            className="bg-gray-100 dark:bg-gray-900 m-4 rounded-2xl overflow-hidden"
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
                  className="bg-gray-200 dark:bg-gray-700"
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
                  initialX={x}
                  initialY={y}
                  onSelect={() => setSelectedId((prev) => (prev === table.id ? null : table.id))}
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

      {/* Selected table detail */}
      {selectedTable && (
        <View className="mx-4 mb-4 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-primary-200 dark:border-primary-800">
          <Text className="text-sm font-bold text-gray-900 dark:text-white mb-2">
            {selectedTable.name} — {selectedGuests.length}/{selectedTable.capacity ?? "∞"} invités
          </Text>
          {selectedGuests.length === 0 ? (
            <Text className="text-sm text-gray-400">Aucun invité assigné</Text>
          ) : (
            <View className="flex-row flex-wrap gap-1.5">
              {selectedGuests.map((g) => (
                <View key={g.id} className="bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                  <Text className="text-xs text-gray-600 dark:text-gray-300">
                    {g.firstName} {g.lastName[0]}.
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
