import React, { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import { Plus, X } from "lucide-react-native";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useGuestsStore, computeCounts } from "@/store/useGuestsStore";
import { INVITATION_TYPE_LABELS, INVITATION_TYPE_GUEST_SOURCE } from "@/db/types";
import type { InvitationType } from "@/db/types";
import type { QuotePricing } from "@/db/schema";
import { formatMoney } from "@/components/MoneyDisplay";

const INVITATION_TYPES = Object.keys(INVITATION_TYPE_LABELS) as InvitationType[];

/** Exact accepted-guest count backing a given invitation type (estimate baked into computeCounts). */
function resolveGuestCount(type: string, counts: ReturnType<typeof computeCounts>): number {
  const value = (counts as Record<string, number>)[INVITATION_TYPE_GUEST_SOURCE[type as InvitationType]];
  return typeof value === "number" ? value : 0;
}

export function GuestPricingSection({ vendorId }: { vendorId: string }) {
  const { t } = useTranslation("vendors");
  const allPricings = useVendorsStore((s) => s.quotePricings);
  const addQuotePricing = useVendorsStore((s) => s.addQuotePricing);
  const updateQuotePricing = useVendorsStore((s) => s.updateQuotePricing);
  const removeQuotePricing = useVendorsStore((s) => s.removeQuotePricing);
  const vendor = useVendorsStore((s) => s.vendors.find((v) => v.id === vendorId));
  const updateVendor = useVendorsStore((s) => s.updateVendor);
  const guests = useGuestsStore((s) => s.guests);
  const counts = useMemo(() => computeCounts(guests), [guests]);

  const [showPicker, setShowPicker] = useState(false);
  const fixedFee = vendor?.fixedFee ?? null;

  // Only per-invitation-type lines (ignore any legacy lowercase caterer keys on this vendor).
  const lines = useMemo(
    () =>
      allPricings.filter(
        (p) => p.vendorId === vendorId && INVITATION_TYPES.includes(p.pricingKey as InvitationType)
      ),
    [allPricings, vendorId]
  );

  const usedTypes = useMemo(() => new Set(lines.map((l) => l.pricingKey)), [lines]);
  const remaining = INVITATION_TYPES.filter((ty) => !usedTypes.has(ty));

  const total =
    lines.reduce(
      (sum, l) => sum + (l.pricePerPerson || 0) * resolveGuestCount(l.pricingKey, counts),
      0
    ) + (fixedFee || 0);

  const addLine = (type: InvitationType) => {
    addQuotePricing({
      id: Crypto.randomUUID(),
      vendorId,
      pricingKey: type,
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
      <Text className="text-xs text-mute mb-3">{t("guestPricingHint")}</Text>

      {lines.length === 0 && (
        <Text className="text-sm text-mute mb-3">{t("pricingEmpty")}</Text>
      )}

      {lines.map((line) => {
        const count = resolveGuestCount(line.pricingKey, counts);
        const subtotal = (line.pricePerPerson || 0) * count;
        return (
          <View
            key={line.id}
            className="flex-row items-center py-2 border-b border-hair"
          >
            <View className="flex-1">
              <Text className="text-sm font-medium text-ink">
                {t(INVITATION_TYPE_LABELS[line.pricingKey as InvitationType])}
              </Text>
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
            {remaining.map((ty) => (
              <Pressable
                key={ty}
                onPress={() => addLine(ty)}
                className="px-3 py-2 bg-accent-paper border border-hair rounded-full active:opacity-80"
              >
                <Text className="text-sm text-ink">{t(INVITATION_TYPE_LABELS[ty])}</Text>
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
