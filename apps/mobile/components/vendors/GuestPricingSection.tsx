import React, { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import { Plus, X } from "lucide-react-native";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useGuestsStore, computeCounts } from "@/store/useGuestsStore";
import { useInvitationTypesStore } from "@/store/useInvitationTypesStore";
import { ToggleRow } from "@/components/FormSection";
import type { QuotePricing } from "@/db/schema";
import { formatMoney } from "@/components/MoneyDisplay";

/**
 * Guest count backing an invitation-type id, matching the guest screen. `countAll` (all invited,
 * default) vs confirmed-only (ACCEPTED) selects the pool — same rule as the budget calc.
 */
function resolveGuestCount(
  typeId: string,
  counts: ReturnType<typeof computeCounts>,
  countAll: boolean
): number {
  const byType = countAll ? counts.inv_by_type_all : counts.inv_by_type;
  return byType[typeId] ?? 0;
}

export function GuestPricingSection({ vendorId }: { vendorId: string }) {
  const { t } = useTranslation("vendors");
  const allPricings = useVendorsStore((s) => s.quotePricings);
  const addQuotePricing = useVendorsStore((s) => s.addQuotePricing);
  const updateQuotePricing = useVendorsStore((s) => s.updateQuotePricing);
  const removeQuotePricing = useVendorsStore((s) => s.removeQuotePricing);
  const vendor = useVendorsStore((s) => s.vendors.find((v) => v.id === vendorId));
  const updateVendor = useVendorsStore((s) => s.updateVendor);
  const invitationTypes = useInvitationTypesStore((s) => s.invitationTypes);
  const guests = useGuestsStore((s) => s.guests);
  const counts = useMemo(() => computeCounts(guests), [guests]);

  const [showPicker, setShowPicker] = useState(false);
  const fixedFee = vendor?.fixedFee ?? null;
  // Default = count all invited guests; explicit false = confirmed (ACCEPTED) only.
  const countAll = vendor?.countAllGuests !== false;

  const typeIds = useMemo(() => new Set(invitationTypes.map((it) => it.id)), [invitationTypes]);
  const labelOf = (id: string) => invitationTypes.find((it) => it.id === id)?.label ?? id;

  // Only lines whose pricingKey is a live invitation-type id (ignore legacy lowercase caterer keys).
  const lines = useMemo(
    () => allPricings.filter((p) => p.vendorId === vendorId && typeIds.has(p.pricingKey)),
    [allPricings, vendorId, typeIds]
  );

  const usedTypes = useMemo(() => new Set(lines.map((l) => l.pricingKey)), [lines]);
  const remaining = invitationTypes.filter((it) => !usedTypes.has(it.id));

  const total =
    lines.reduce(
      (sum, l) => sum + (l.pricePerPerson || 0) * resolveGuestCount(l.pricingKey, counts, countAll),
      0
    ) + (fixedFee || 0);

  const addLine = (typeId: string) => {
    addQuotePricing({
      id: Crypto.randomUUID(),
      vendorId,
      pricingKey: typeId,
      pricePerPerson: null,
      guestCountOverride: null,
      staffFee: null,
      travelFee: null,
    } as QuotePricing);
    setShowPicker(false);
  };

  return (
    <View className="bg-accent-card mt-3 mb-2 rounded-2xl p-4 border border-hair">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-base font-semibold text-ink">{t("guestPricingTitle")}</Text>
        {total > 0 && (
          <Text className="text-base font-bold text-primary-500">{formatMoney(total)}</Text>
        )}
      </View>
      <Text className="text-xs text-mute mb-2">{t("guestPricingHint")}</Text>

      {/* Count mode: all invited vs confirmed only */}
      <ToggleRow
        label={t("countAllGuestsLabel")}
        value={countAll}
        onToggle={() => updateVendor(vendorId, { countAllGuests: countAll ? false : true })}
      />
      <Text className="text-xs text-mute mt-1 mb-3">{t("countAllGuestsHint")}</Text>

      {lines.length === 0 && (
        <Text className="text-sm text-mute mb-3">{t("pricingEmpty")}</Text>
      )}

      {lines.map((line) => {
        const count = resolveGuestCount(line.pricingKey, counts, countAll);
        const subtotal = (line.pricePerPerson || 0) * count;
        return (
          <View
            key={line.id}
            className="flex-row items-center py-2 border-b border-hair"
          >
            <View className="flex-1">
              <Text className="text-sm font-medium text-ink">{labelOf(line.pricingKey)}</Text>
              <Text className="text-xs text-mute mt-0.5">
                {t("guestCountBadge", { count })}
                {subtotal > 0 ? ` · ${formatMoney(subtotal)}` : ""}
              </Text>
            </View>
            <View className="w-24 bg-accent-paper rounded-lg px-2 py-1 flex-row items-center">
              <TextInput
                className="flex-1 text-sm text-ink"
                textAlign="right"
                value={line.pricePerPerson != null ? line.pricePerPerson.toString() : ""}
                onChangeText={(v: string) =>
                  updateQuotePricing(line.id, { pricePerPerson: v ? parseFloat(v) : null })
                }
                placeholder="—"
                placeholderTextColor="#C0C0C8"
                keyboardType="numeric"
              />
              <Text className="text-xs text-mute ml-1">{t("perGuestUnit")}</Text>
            </View>
            <Pressable
              onPress={() => removeQuotePricing(line.id)}
              className="w-8 h-8 items-center justify-center ml-1"
            >
              <X size={15} color="#EF4444" />
            </Pressable>
          </View>
        );
      })}

      {/* Fixed fee — costs independent of guest count */}
      <View className="flex-row items-center py-2 mt-1">
        <View className="flex-1">
          <Text className="text-sm font-medium text-ink">{t("fixedFeeLabel")}</Text>
          <Text className="text-xs text-mute mt-0.5">{t("fixedFeeHint")}</Text>
        </View>
        <View className="w-24 bg-accent-paper rounded-lg px-2 py-1 flex-row items-center">
          <TextInput
            className="flex-1 text-sm text-ink"
            textAlign="right"
            value={fixedFee != null ? fixedFee.toString() : ""}
            onChangeText={(v: string) =>
              updateVendor(vendorId, { fixedFee: v ? parseFloat(v) : null })
            }
            placeholder="—"
            placeholderTextColor="#C0C0C8"
            keyboardType="numeric"
          />
          <Text className="text-xs text-mute ml-1">€</Text>
        </View>
      </View>

      {/* Type picker */}
      {remaining.length > 0 &&
        (showPicker ? (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {remaining.map((it) => (
              <Pressable
                key={it.id}
                onPress={() => addLine(it.id)}
                className="px-3 py-2 bg-accent-paper border border-hair rounded-full active:opacity-80"
              >
                <Text className="text-sm text-ink">{it.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Pressable
            onPress={() => setShowPicker(true)}
            className="flex-row items-center justify-center gap-1.5 mt-3 py-2.5 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950 active:opacity-80"
          >
            <Plus size={15} color="#b96a4a" />
            <Text className="text-sm font-semibold text-primary-500">{t("addPricingLine")}</Text>
          </Pressable>
        ))}
    </View>
  );
}
