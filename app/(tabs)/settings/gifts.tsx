import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { Trash2, ExternalLink, Gift, CheckCircle2, Circle } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { useGiftsStore } from "@/store/useGiftsStore";
import type { Gift as GiftType } from "@/db/schema";
import { FAB } from "@/components/FAB";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { EmptyState } from "@/components/EmptyState";
import { SectionTitle, FormCard, InputRow, ChipSelect } from "@/components/FormSection";

const CATEGORIES = ["maison", "voyage", "experience", "autre"] as const;
type Category = (typeof CATEGORIES)[number];

export default function GiftsScreen() {
  const { t } = useTranslation("settings");
  const gifts = useGiftsStore((s) => s.gifts);
  const addGift = useGiftsStore((s) => s.addGift);
  const updateGift = useGiftsStore((s) => s.updateGift);
  const removeGift = useGiftsStore((s) => s.removeGift);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formCategory, setFormCategory] = useState<Category>("autre");

  const openAdd = () => {
    setFormTitle(""); setFormDescription(""); setFormPrice(""); setFormUrl(""); setFormCategory("autre");
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (gift: GiftType) => {
    setFormTitle(gift.title);
    setFormDescription(gift.description || "");
    setFormPrice(gift.price?.toString() || "");
    setFormUrl(gift.url || "");
    setFormCategory((gift.category as Category) || "autre");
    setEditingId(gift.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formTitle.trim()) return;
    const now = new Date().toISOString();
    if (editingId) {
      updateGift(editingId, {
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        price: formPrice ? parseFloat(formPrice) : null,
        url: formUrl.trim() || null,
        category: formCategory,
        updatedAt: now,
      });
    } else {
      addGift({
        id: Crypto.randomUUID(),
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        price: formPrice ? parseFloat(formPrice) : null,
        url: formUrl.trim() || null,
        imageUrl: null,
        category: formCategory,
        claimed: false,
        claimedByName: null,
        claimedAt: null,
        sortOrder: gifts.length,
        createdAt: now,
        updatedAt: now,
      });
    }
    setShowForm(false);
  };

  const CATEGORY_LABELS: Record<Category, string> = {
    maison: t("giftCategories.maison"),
    voyage: t("giftCategories.voyage"),
    experience: t("giftCategories.experience"),
    autre: t("giftCategories.autre"),
  };

  if (showForm) {
    return (
      <ScrollView className="flex-1 bg-accent-paper px-4 pt-4">
        <SectionTitle>{editingId ? t("giftTitle") : t("addGift")}</SectionTitle>
        <FormCard>
          <InputRow label={t("giftTitle")} value={formTitle} onChangeText={setFormTitle} placeholder="Voyage de noces" />
          <InputRow label={t("giftDescription")} value={formDescription} onChangeText={setFormDescription} multiline placeholder="Optionnel" />
          <InputRow label={t("giftPrice")} value={formPrice} onChangeText={setFormPrice} keyboardType="numeric" placeholder="150" />
          <InputRow label={t("giftUrl")} value={formUrl} onChangeText={setFormUrl} placeholder="https://..." />
          <View className="py-3">
            <Text className="text-xs text-mute mb-2 font-medium">{t("giftCategory")}</Text>
            <ChipSelect options={[...CATEGORIES]} value={formCategory} onChange={setFormCategory} labels={CATEGORY_LABELS} />
          </View>
        </FormCard>
        <View className="flex-row gap-2 mb-8">
          <Pressable
            onPress={handleSave}
            className="flex-1 bg-primary-500 py-3 rounded-xl items-center active:bg-primary-600"
          >
            <Text className="text-white font-semibold">{t("common:save")}</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowForm(false)}
            className="flex-1 bg-accent-paper py-3 rounded-xl items-center"
          >
            <Text className="text-mute">{t("cancel")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  const unclaimed = gifts.filter((g) => !g.claimed).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const claimed = gifts.filter((g) => g.claimed);

  return (
    <View className="flex-1 bg-accent-paper">
      {gifts.length === 0 ? (
        <EmptyState
          icon={Gift}
          title={t("noGifts")}
          description={t("noGiftsDesc")}
          actionLabel={t("addGift")}
          onAction={openAdd}
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {unclaimed.length > 0 && (
            <>
              <SectionTitle>{`${t("giftUnclaimed")} (${unclaimed.length})`}</SectionTitle>
              {unclaimed.map((gift) => (
                <GiftRow key={gift.id} gift={gift} onPress={() => openEdit(gift)} onDelete={() => setDeleteId(gift.id)} />
              ))}
            </>
          )}
          {claimed.length > 0 && (
            <View className="mt-3">
              <SectionTitle>{`${t("giftClaimed")} (${claimed.length})`}</SectionTitle>
              {claimed.map((gift) => (
                <GiftRow key={gift.id} gift={gift} onPress={() => openEdit(gift)} onDelete={() => setDeleteId(gift.id)} />
              ))}
            </View>
          )}
          <View className="h-24" />
        </ScrollView>
      )}

      <FAB onPress={openAdd} />

      <ConfirmSheet
        visible={!!deleteId}
        title={t("deleteGift")}
        message=""
        confirmLabel={t("delete")}
        destructive
        onConfirm={() => { if (deleteId) removeGift(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}

function GiftRow({
  gift, onPress, onDelete,
}: {
  gift: GiftType;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation("settings");
  return (
    <Pressable
      onPress={onPress}
      className="bg-accent-card rounded-2xl p-4 mb-2 border border-hair active:opacity-80"
    >
      <View className="flex-row items-center">
        <View className="flex-1 mr-2">
          <Text
            className={`text-base font-medium ${
              gift.claimed ? "text-mute line-through" : "text-ink"
            }`}
          >
            {gift.title}
          </Text>
          {gift.price != null && (
            <Text className="text-sm text-primary-500 font-semibold mt-0.5">
              {gift.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </Text>
          )}
          {gift.description ? (
            <Text className="text-sm text-mute mt-0.5" numberOfLines={1}>{gift.description}</Text>
          ) : null}
          {gift.claimed && gift.claimedByName ? (
            <Text className="text-xs text-emerald-500 font-medium mt-1">
              {t("giftClaimedBy", { name: gift.claimedByName })}
            </Text>
          ) : null}
        </View>
        <View className="flex-row items-center gap-2">
          {gift.url ? (
            <Pressable onPress={() => Linking.openURL(gift.url!)} className="w-8 h-8 items-center justify-center">
              <ExternalLink size={15} color="#9CA3AF" />
            </Pressable>
          ) : null}
          {gift.claimed ? (
            <CheckCircle2 size={18} color="#10B981" />
          ) : (
            <Circle size={18} color="#D1D5DB" />
          )}
          <Pressable onPress={onDelete} className="w-8 h-8 items-center justify-center">
            <Trash2 size={15} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
