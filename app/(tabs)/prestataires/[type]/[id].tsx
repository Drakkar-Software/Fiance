import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { v4 as uuid } from "uuid";
import { useVendorsStore } from "@/store/useVendorsStore";
import {
  VENDOR_TYPE_LABELS,
  VENDOR_STATUS_LABELS,
  VENDOR_STATUS_COLORS,
} from "@/db/types";
import type { VendorType, VendorStatus } from "@/db/types";
import { RatingStars } from "@/components/RatingStars";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { SectionTitle, FormCard, InputRow, ToggleRow } from "@/components/FormSection";
import type { Vendor } from "@/db/schema";

const STATUS_OPTIONS: VendorStatus[] = [
  "PROSPECT",
  "QUOTE_RECEIVED",
  "NEGOTIATING",
  "BOOKED",
  "CANCELLED",
];

export default function VendorDetailScreen() {
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>();
  const router = useRouter();
  const vendors = useVendorsStore((s) => s.vendors);
  const addVendor = useVendorsStore((s) => s.addVendor);
  const updateVendor = useVendorsStore((s) => s.updateVendor);
  const removeVendor = useVendorsStore((s) => s.removeVendor);

  const isNew = id === "new";
  const existingVendor = vendors.find((v) => v.id === id);

  const [name, setName] = useState(existingVendor?.name || "");
  const [contactName, setContactName] = useState(existingVendor?.contactName || "");
  const [phone, setPhone] = useState(existingVendor?.phone || "");
  const [email, setEmail] = useState(existingVendor?.email || "");
  const [website, setWebsite] = useState(existingVendor?.website || "");
  const [status, setStatus] = useState<VendorStatus>(
    (existingVendor?.status as VendorStatus) || "PROSPECT"
  );
  const [basePrice, setBasePrice] = useState(existingVendor?.basePrice?.toString() || "");
  const [pricePerPerson, setPricePerPerson] = useState(existingVendor?.pricePerPerson?.toString() || "");
  const [depositAmount, setDepositAmount] = useState(existingVendor?.depositAmount?.toString() || "");
  const [depositPaid, setDepositPaid] = useState(existingVendor?.depositPaid || false);
  const [rating, setRating] = useState(existingVendor?.rating || 0);
  const [notes, setNotes] = useState(existingVendor?.notes || "");
  const [showDelete, setShowDelete] = useState(false);

  const typeName = VENDOR_TYPE_LABELS[type as VendorType] || type;

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Erreur", "Le nom est obligatoire");
      return;
    }

    const now = new Date().toISOString();
    const vendorData: Partial<Vendor> = {
      name: name.trim(),
      type: type!,
      contactName: contactName || null,
      phone: phone || null,
      email: email || null,
      website: website || null,
      status,
      basePrice: basePrice ? parseFloat(basePrice) : null,
      pricePerPerson: pricePerPerson ? parseFloat(pricePerPerson) : null,
      depositAmount: depositAmount ? parseFloat(depositAmount) : null,
      depositPaid,
      rating,
      notes: notes || null,
      updatedAt: now,
    };

    if (isNew) {
      addVendor({
        ...vendorData,
        id: uuid(),
        createdAt: now,
      } as Vendor);
    } else {
      updateVendor(id!, vendorData);
    }
    router.back();
  };

  const handleDelete = () => {
    removeVendor(id!);
    setShowDelete(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <Stack.Screen
        options={{
          title: isNew ? `Nouveau ${typeName}` : name || typeName,
          headerRight: () => (
            <Pressable onPress={handleSave} className="mr-2">
              <Text className="text-primary-500 font-semibold text-base">
                Enregistrer
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Status selector */}
        <SectionTitle>Statut</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5"
          contentContainerStyle={{ gap: 8 }}
        >
          {STATUS_OPTIONS.map((s) => (
            <Pressable key={s} onPress={() => setStatus(s)}>
              <StatusBadge
                label={VENDOR_STATUS_LABELS[s]}
                color={status === s ? VENDOR_STATUS_COLORS[s] : "#D1D5DB"}
                size="md"
              />
            </Pressable>
          ))}
        </ScrollView>

        {/* Information section */}
        <SectionTitle>Informations</SectionTitle>
        <FormCard>
          <InputRow label="Nom de l'entreprise *" value={name} onChangeText={setName} />
          <InputRow label="Contact / Responsable" value={contactName} onChangeText={setContactName} />
          <InputRow label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <InputRow label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <InputRow label="Site web" value={website} onChangeText={setWebsite} />
        </FormCard>

        {/* Pricing section */}
        <SectionTitle>Tarification</SectionTitle>
        <FormCard>
          <InputRow
            label="Prix total (€)"
            value={basePrice}
            onChangeText={setBasePrice}
            keyboardType="numeric"
          />
          <InputRow
            label="Prix par personne (€)"
            value={pricePerPerson}
            onChangeText={setPricePerPerson}
            keyboardType="numeric"
          />
          <InputRow
            label="Acompte (€)"
            value={depositAmount}
            onChangeText={setDepositAmount}
            keyboardType="numeric"
          />
          <ToggleRow
            label="Acompte versé"
            value={depositPaid}
            onToggle={() => setDepositPaid(!depositPaid)}
          />
        </FormCard>

        {/* Rating */}
        <SectionTitle>Note personnelle</SectionTitle>
        <FormCard>
          <RatingStars rating={rating} onChange={setRating} size={32} />
        </FormCard>

        {/* Notes */}
        <SectionTitle>Notes</SectionTitle>
        <FormCard>
          <TextInput
            className="text-base text-gray-900 dark:text-white min-h-[100px]"
            placeholder="Observations, détails du devis..."
            placeholderTextColor="#D0D0D8"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </FormCard>

        {/* Delete button */}
        {!isNew && (
          <Pressable
            onPress={() => setShowDelete(true)}
            className="bg-red-50 dark:bg-red-950 rounded-2xl p-4 mb-8 items-center border border-red-100 dark:border-red-900"
          >
            <Text className="text-red-500 font-semibold text-sm">
              Supprimer ce prestataire
            </Text>
          </Pressable>
        )}

        <View className="h-8" />
      </ScrollView>

      <ConfirmSheet
        visible={showDelete}
        title="Supprimer ce prestataire ?"
        message="Cette action est irréversible. Toutes les données associées seront perdues."
        confirmLabel="Supprimer"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}
