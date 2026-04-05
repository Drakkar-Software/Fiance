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
import * as Crypto from "expo-crypto";
import { useVendorsStore } from "@/store/useVendorsStore";
import {
  VENDOR_TYPE_LABELS,
  VENDOR_STATUS_LABELS,
  VENDOR_STATUS_COLORS,
} from "@/db/types";
import type { VendorType, VendorStatus } from "@/db/types";
import { getVendorTypeConfig } from "@/lib/vendorTypeConfig";
import type { CustomSection } from "@/lib/vendorTypeConfig";
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
  const typeConfig = getVendorTypeConfig(type as VendorType);

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

  // Date fields (exist in schema but were not surfaced before)
  const [quoteDate, setQuoteDate] = useState(existingVendor?.quoteDate || "");
  const [validityDate, setValidityDate] = useState(existingVendor?.validityDate || "");
  const [depositDueDate, setDepositDueDate] = useState(existingVendor?.depositDueDate || "");
  const [balanceDueDate, setBalanceDueDate] = useState(existingVendor?.balanceDueDate || "");
  const [showDates, setShowDates] = useState(
    !!(existingVendor?.quoteDate || existingVendor?.validityDate || existingVendor?.depositDueDate || existingVendor?.balanceDueDate)
  );

  // Custom fields from JSON
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, any>>(
    existingVendor?.customFields ? JSON.parse(existingVendor.customFields) : {}
  );

  const typeName = VENDOR_TYPE_LABELS[type as VendorType] || type;

  const updateCustomField = (key: string, value: any) => {
    setCustomFieldsData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Erreur", "Le nom est obligatoire");
      return;
    }

    const now = new Date().toISOString();
    const hasCustomFields = Object.keys(customFieldsData).some(
      (k) => customFieldsData[k] != null && customFieldsData[k] !== "" && customFieldsData[k] !== 0
    );

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
      quoteDate: quoteDate || null,
      validityDate: validityDate || null,
      depositDueDate: depositDueDate || null,
      balanceDueDate: balanceDueDate || null,
      customFields: hasCustomFields ? JSON.stringify(customFieldsData) : null,
      updatedAt: now,
    };

    if (isNew) {
      addVendor({
        ...vendorData,
        id: Crypto.randomUUID(),
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
            label={typeConfig.basePriceLabel || "Prix total (€)"}
            value={basePrice}
            onChangeText={setBasePrice}
            keyboardType="numeric"
          />
          {typeConfig.showPricePerPerson === "visible" && (
            <InputRow
              label={typeConfig.pricePerPersonLabel || "Prix par personne (€)"}
              value={pricePerPerson}
              onChangeText={setPricePerPerson}
              keyboardType="numeric"
            />
          )}
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

        {/* Dates section (collapsible) */}
        <Pressable
          onPress={() => setShowDates(!showDates)}
          className="flex-row items-center justify-between mb-2 mt-1"
        >
          <SectionTitle>Dates</SectionTitle>
          <Ionicons
            name={showDates ? "chevron-up" : "chevron-down"}
            size={16}
            color="#9CA3AF"
          />
        </Pressable>
        {showDates && (
          <FormCard>
            <InputRow label="Date du devis" value={quoteDate} onChangeText={setQuoteDate} placeholder="2026-03-15" />
            <InputRow label="Validité du devis" value={validityDate} onChangeText={setValidityDate} placeholder="2026-04-15" />
            <InputRow label="Date limite acompte" value={depositDueDate} onChangeText={setDepositDueDate} placeholder="2026-05-01" />
            <InputRow label="Date limite solde" value={balanceDueDate} onChangeText={setBalanceDueDate} placeholder="2026-08-01" />
          </FormCard>
        )}

        {/* Type-specific custom sections */}
        {typeConfig.customSections.length > 0 && (
          <>
            <SectionTitle>{`Détails ${typeName.toLowerCase()}`}</SectionTitle>
            <FormCard>
              {typeConfig.customSections.map((section) => (
                <CustomFieldRenderer
                  key={section.key}
                  section={section}
                  value={customFieldsData[section.key]}
                  onChange={(val) => updateCustomField(section.key, val)}
                />
              ))}
            </FormCard>
          </>
        )}

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

function CustomFieldRenderer({
  section,
  value,
  onChange,
}: {
  section: CustomSection;
  value: any;
  onChange: (val: any) => void;
}) {
  if (section.type === "counter") {
    return (
      <InputRow
        label={section.label}
        value={value?.toString() || ""}
        onChangeText={(t) => onChange(t ? parseInt(t, 10) || 0 : null)}
        keyboardType="numeric"
        placeholder={section.placeholder}
      />
    );
  }

  if (section.type === "text") {
    return (
      <InputRow
        label={section.label}
        value={value || ""}
        onChangeText={onChange}
        placeholder={section.placeholder}
      />
    );
  }

  if (section.type === "checklist" && section.options) {
    const selected: string[] = Array.isArray(value) ? value : [];
    return (
      <View>
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          {section.label}
        </Text>
        {section.options.map((opt) => {
          const isChecked = selected.includes(opt);
          return (
            <Pressable
              key={opt}
              onPress={() => {
                if (isChecked) {
                  onChange(selected.filter((s) => s !== opt));
                } else {
                  onChange([...selected, opt]);
                }
              }}
              className="flex-row items-center py-2"
            >
              <Ionicons
                name={isChecked ? "checkbox" : "square-outline"}
                size={20}
                color={isChecked ? "#EC4899" : "#D1D5DB"}
              />
              <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2.5">
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return null;
}
