import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";
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

interface Props {
  tables: Table[];
  guests: Guest[];
  updateTable: (id: string, updates: Partial<Table>) => void;
}

export function PlanView({ tables, guests, updateTable }: Props) {
  const allAtOrigin = tables.every((t) => (t.positionX ?? 0) === 0 && (t.positionY ?? 0) === 0);
  const autoPositions = useMemo(
    () => (allAtOrigin ? autoArrange(tables) : null),
    [tables, allAtOrigin]
  );

  const getPos = (t: Table) =>
    autoPositions
      ? autoPositions[t.id]
      : { x: t.positionX ?? 0, y: t.positionY ?? 0 };

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const resolvePos = (t: Table) => positions[t.id] ?? getPos(t);

  const makePanResponder = useCallback(
    (tableId: string) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => setDraggingId(tableId),
        onPanResponderMove: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
          const base = getPos(tables.find((t) => t.id === tableId)!);
          setPositions((prev) => ({
            ...prev,
            [tableId]: {
              x: Math.max(0, Math.min(CANVAS_W - TABLE_SIZE_BASE, base.x + gs.dx)),
              y: Math.max(0, Math.min(CANVAS_H - TABLE_SIZE_BASE, base.y + gs.dy)),
            },
          }));
        },
        onPanResponderRelease: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
          const base = getPos(tables.find((t) => t.id === tableId)!);
          const newX = Math.max(0, Math.min(CANVAS_W - TABLE_SIZE_BASE, base.x + gs.dx));
          const newY = Math.max(0, Math.min(CANVAS_H - TABLE_SIZE_BASE, base.y + gs.dy));
          if (!allAtOrigin) {
            updateTable(tableId, { positionX: newX, positionY: newY });
          }
          setDraggingId(null);
          if (Math.abs(gs.dx) < 4 && Math.abs(gs.dy) < 4) {
            setSelectedId((prev) => (prev === tableId ? null : tableId));
          }
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tables, allAtOrigin]
  );

  const panResponders = useMemo(
    () => Object.fromEntries(tables.map((t) => [t.id, makePanResponder(t.id)])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tables.length]
  );

  const selectedTable = selectedId ? tables.find((t) => t.id === selectedId) : null;
  const selectedGuests = selectedId ? guests.filter((g) => g.tableId === selectedId) : [];

  return (
    <View className="flex-1">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ width: CANVAS_W, height: CANVAS_H }} className="bg-gray-100 dark:bg-gray-900 m-4 rounded-2xl overflow-hidden">
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
              ))
            )}

            {/* Tables */}
            {tables.map((table) => {
              const { x, y } = resolvePos(table);
              const tableGuests = guests.filter((g) => g.tableId === table.id);
              const capacity = table.capacity ?? 8;
              const filled = tableGuests.length;
              const isFull = filled >= capacity;
              const isSelected = selectedId === table.id;
              const isDragging = draggingId === table.id;
              const isRound = (table.shape ?? "round") === "round";
              const size = Math.max(TABLE_SIZE_BASE, Math.min(96, TABLE_SIZE_BASE + capacity * 3));

              return (
                <View
                  key={table.id}
                  {...panResponders[table.id].panHandlers}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    width: isRound ? size : size * 1.4,
                    height: size,
                    zIndex: isDragging ? 10 : 1,
                    opacity: isDragging ? 0.85 : 1,
                  }}
                >
                  <View
                    style={{
                      borderRadius: isRound ? size / 2 : 12,
                      borderWidth: isSelected ? 2.5 : 1,
                    }}
                    className={`flex-1 items-center justify-center
                      ${isFull ? "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700" :
                        isSelected ? "bg-primary-50 dark:bg-primary-950 border-primary-400" :
                        "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                      }`}
                  >
                    <Text className="text-xs font-bold text-gray-700 dark:text-gray-200 text-center px-1" numberOfLines={1}>
                      {table.name}
                    </Text>
                    <Text className={`text-xs font-semibold mt-0.5 ${isFull ? "text-red-500" : "text-gray-400"}`}>
                      {filled}/{capacity}
                    </Text>
                  </View>
                </View>
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
