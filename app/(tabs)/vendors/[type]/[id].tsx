import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TextInput, Pressable } from "react-native-css/components";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ChevronUp, ChevronDown, CheckSquare, Square, Trash2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
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
import { analytics } from "@/lib/analytics";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { SectionTitle, FormCard, InputRow, DateRow, ToggleRow, ChipSelect } from "@/components/FormSection";
import { DeleteButton } from "@/components/DeleteButton";
import { Display } from "@/components/Display";
import { SaveHeaderButton } from "@/components/SaveHeaderButton";
import { StatusSelector } from "@/components/StatusSelector";
import type { Vendor, VendorPayment } from "@/db/schema";

const STATUS_OPTIONS: VendorStatus[] = [
  "PROSPECT",
  "QUOTE_RECEIVED",
  "NEGOTIATING",
  "BOOKED",
  "CANCELLED",
];

export default function VendorDetailScreen() {
  const { t } = useTranslation("vendors");
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

  const [notes, setNotes] = useState(existingVendor?.notes || "");
  const [showDelete, setShowDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<"infos" | "tarif" | "paiements">("infos");

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

  const canSave = name.trim().length > 0;

  const typeName = t(VENDOR_TYPE_LABELS[type as VendorType]) || type;

  const updateCustomField = (key: string, value: any) => {
    setCustomFieldsData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t("common:error"), t("nameRequired"));
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
      analytics.capture("vendor_added", { category: type });
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
    <View className="flex-1 bg-accent-paper">
      <Stack.Screen
        options={{
          title: isNew ? t("new", { type: typeName }) : name || typeName,
          headerRight: () => (
            <SaveHeaderButton label={t("common:save")} enabled={canSave} onPress={handleSave} />
          ),
        }}
      />

      {/* Tab bar */}
      <View className="flex-row mx-4 mt-3 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {(["infos", "tarif", ...(isNew ? [] : ["paiements"])] as ("infos" | "tarif" | "paiements")[]).map((tab) => {
          const tabKeys = { infos: "tabInfo", tarif: "tabPricing", paiements: "tabPayments" } as const;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg items-center ${activeTab === tab ? "bg-accent-card shadow-sm" : ""}`}
            >
              <Text className={`text-sm font-medium ${activeTab === tab ? "text-primary-500" : "text-mute"}`}>
                {t(tabKeys[tab])}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView className="flex-1 px-4 pt-3" showsVerticalScrollIndicator={false}>
        {activeTab === "infos" && (
          <>
            <SectionTitle>{t("statusLabel")}</SectionTitle>
            <StatusSelector
              options={STATUS_OPTIONS.map((s) => ({
                key: s,
                label: t(VENDOR_STATUS_LABELS[s]),
                color: VENDOR_STATUS_COLORS[s],
              }))}
              activeKey={status}
              onSelect={(k) => setStatus(k as VendorStatus)}
            />

            <SectionTitle>{t("information")}</SectionTitle>
            <FormCard>
              <InputRow label={t("companyName")} value={name} onChangeText={setName} />
              <InputRow label={t("contact")} value={contactName} onChangeText={setContactName} />
              <InputRow label={t("phoneLabel")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <InputRow label={t("emailLabel")} value={email} onChangeText={setEmail} keyboardType="email-address" />
              <InputRow label={t("website")} value={website} onChangeText={setWebsite} />
            </FormCard>

            {typeConfig.customSections.length > 0 && (
              <>
                <SectionTitle>{t("details", { type: typeName.toLowerCase() })}</SectionTitle>
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

            <SectionTitle>{t("notesLabel")}</SectionTitle>
            <FormCard>
              <TextInput
                className="text-base text-ink min-h-[80px]"
                placeholder={t("notesPlaceholder")}
                placeholderTextColor="#D0D0D8"
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </FormCard>

            {!isNew && (
              <DeleteButton label={t("deleteVendor")} onPress={() => setShowDelete(true)} />
            )}
          </>
        )}

        {activeTab === "tarif" && (
          <>
            <SectionTitle>{t("pricing")}</SectionTitle>
            <FormCard>
              <InputRow
                label={typeConfig.basePriceLabel || t("totalPrice")}
                value={basePrice}
                onChangeText={setBasePrice}
                keyboardType="numeric"
              />
              {typeConfig.showPricePerPerson === "visible" && (
                <InputRow
                  label={typeConfig.pricePerPersonLabel || t("pricePerPerson")}
                  value={pricePerPerson}
                  onChangeText={setPricePerPerson}
                  keyboardType="numeric"
                />
              )}
              <InputRow
                label={t("deposit")}
                value={depositAmount}
                onChangeText={setDepositAmount}
                keyboardType="numeric"
              />
              <ToggleRow
                label={t("depositPaid")}
                value={depositPaid}
                onToggle={() => setDepositPaid(!depositPaid)}
              />
            </FormCard>

            <Pressable
              onPress={() => setShowDates(!showDates)}
              className="flex-row items-center justify-between mb-2 mt-1"
            >
              <SectionTitle>{t("dates")}</SectionTitle>
              {showDates ? (
                <ChevronUp size={16} color="#9CA3AF" />
              ) : (
                <ChevronDown size={16} color="#9CA3AF" />
              )}
            </Pressable>
            {showDates && (
              <FormCard>
                <DateRow label={t("quoteDate")} value={quoteDate} onChange={setQuoteDate} />
                <DateRow label={t("validityDate")} value={validityDate} onChange={setValidityDate} />
                <DateRow label={t("depositDueDate")} value={depositDueDate} onChange={setDepositDueDate} />
                <DateRow label={t("balanceDueDate")} value={balanceDueDate} onChange={setBalanceDueDate} />
              </FormCard>
            )}
          </>
        )}

        {activeTab === "paiements" && !isNew && (
          <PaymentsTab vendorId={id!} />
        )}

        <View className="h-8" />
      </ScrollView>

      <ConfirmSheet
        visible={showDelete}
        title={t("deleteVendorConfirm")}
        message={t("irreversible")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}

const PAYMENT_METHODS = ["cash", "check", "transfer", "card", "other"] as const;
type PaymentMethod = typeof PAYMENT_METHODS[number];

function PaymentsTab({ vendorId }: { vendorId: string }) {
  const { t } = useTranslation("budget");
  const { t: tV } = useTranslation("vendors");
  const addPayment = useVendorsStore((s) => s.addPayment);
  const removePayment = useVendorsStore((s) => s.removePayment);
  const allPayments = useVendorsStore((s) => s.vendorPayments);
  const payments = useMemo(
    () => allPayments.filter((p) => p.vendorId === vendorId),
    [allPayments, vendorId]
  );
  const totalPaid = useMemo(
    () => payments.reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("transfer");
  const [label, setLabel] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!amount.trim()) return;
    const now = new Date().toISOString();
    addPayment({
      id: Crypto.randomUUID(),
      vendorId,
      amount: parseFloat(amount),
      paidDate: paidDate || now.split("T")[0],
      dueDate: null,
      method,
      label: label || null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    } as VendorPayment);
    setAmount("");
    setPaidDate("");
    setMethod("transfer");
    setLabel("");
    setShowAdd(false);
  };

  return (
    <View>
      {/* Total */}
      <View className="bg-primary-50 dark:bg-primary-950 rounded-2xl p-4 mb-3 flex-row items-center justify-between border border-primary-100 dark:border-primary-900">
        <Text className="text-sm font-medium text-mute">{t("totalPaid")}</Text>
        <Display size={22} weight="500" color="#b96a4a">{totalPaid.toFixed(2)} €</Display>
      </View>

      {/* Payments list */}
      {payments.map((p) => (
        <View
          key={p.id}
          className="bg-accent-card rounded-xl p-3.5 mb-2 border border-hair flex-row items-center"
        >
          <View className="flex-1">
            <Text className="text-base font-semibold text-ink">
              {p.amount.toFixed(2)} €
            </Text>
            <Text className="text-xs text-mute mt-0.5">
              {p.paidDate}
              {p.method ? ` · ${t(`paymentMethods.${p.method}`)}` : ""}
            </Text>
            {p.label && (
              <Text className="text-xs text-mute mt-0.5">{p.label}</Text>
            )}
          </View>
          <Pressable
            onPress={() => setDeleteId(p.id)}
            className="w-8 h-8 items-center justify-center"
          >
            <Trash2 size={16} color="#EF4444" />
          </Pressable>
        </View>
      ))}

      {payments.length === 0 && !showAdd && (
        <Text className="text-sm text-mute mb-3">{tV("noPayments")}</Text>
      )}

      {/* Add form */}
      {showAdd ? (
        <FormCard>
          <InputRow
            label={t("paymentAmount")}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <DateRow label={t("paymentDate")} value={paidDate} onChange={setPaidDate} />
          <Text className="text-xs text-mute mb-2 mt-3 font-medium">{t("paymentMethod")}</Text>
          <ChipSelect
            options={PAYMENT_METHODS as unknown as string[]}
            value={method}
            onChange={(v) => setMethod(v as PaymentMethod)}
            labels={Object.fromEntries(
              PAYMENT_METHODS.map((m) => [m, t(`paymentMethods.${m}`)])
            ) as Record<string, string>}
          />
          <InputRow label={t("paymentLabel")} value={label} onChangeText={setLabel} />
          <View className="flex-row gap-2 mt-3">
            <Pressable
              onPress={handleAdd}
              className="flex-1 bg-primary-500 py-2.5 rounded-xl items-center active:bg-primary-600"
            >
              <Text className="text-white font-semibold text-sm">{t("addPayment")}</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowAdd(false)}
              className="flex-1 bg-gray-100 dark:bg-gray-800 py-2.5 rounded-xl items-center"
            >
              <Text className="text-mute text-sm">{t("common:cancel")}</Text>
            </Pressable>
          </View>
        </FormCard>
      ) : (
        <Pressable
          onPress={() => setShowAdd(true)}
          className="bg-primary-50 dark:bg-primary-950 rounded-xl py-3 items-center border border-dashed border-primary-200 dark:border-primary-800 active:opacity-80 mt-1"
        >
          <Text className="text-sm font-semibold text-primary-500">+ {t("addPayment")}</Text>
        </Pressable>
      )}

      <ConfirmSheet
        visible={!!deleteId}
        title={tV("deletePayment")}
        message={tV("irreversible")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={() => {
          if (deleteId) removePayment(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
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
  const { t } = useTranslation("vendors");

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

  if (section.type === "date") {
    return (
      <DateRow
        label={section.label}
        value={value || ""}
        onChange={onChange}
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
        <Text className="text-sm font-medium text-mute mb-2">
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
              {isChecked ? (
                <CheckSquare size={20} color="#b96a4a" />
              ) : (
                <Square size={20} color="#D1D5DB" />
              )}
              <Text className="text-sm text-ink-soft ml-2.5">
                {t(opt)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return null;
}
