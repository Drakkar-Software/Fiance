import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TextInput, Pressable } from "react-native-css/components";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ChevronUp, ChevronDown, CheckSquare, Square, Trash2, FileText, Upload } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useGuestsStore, computeCounts } from "@/store/useGuestsStore";
import { useDocumentsStore } from "@/store/useDocumentsStore";
import { calculateVendorTotal, isVendorDynamicPricing } from "@/lib/budget";
import { formatMoney } from "@/components/MoneyDisplay";
import { GuestPricingSection } from "@/components/vendors/GuestPricingSection";
import { pickAndStoreDocument, isDocumentAvailableOnDevice, deleteDocumentFile } from "@/lib/documents";
import { selectVendorInGroup } from "@/lib/vendor-comparison";
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
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";
import { StatusSelector } from "@/components/StatusSelector";
import { SegmentedControl } from "@/components/SegmentedControl";
import { PageHeader } from "@/components/PageHeader";
import { Seal } from "@/components/Seal";
import { PremiumGate } from "@/components/PremiumGate";
import { PaywallSheet } from "@/components/PaywallSheet";
import { useHasFeature, useCanAddMore, FREE_LIMITS } from "@/lib/limits";
import { toast } from "@/lib/toast/sonner";
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
  const canEdit = useCanEditHere();
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
  const [depositAmount, setDepositAmount] = useState(existingVendor?.depositAmount?.toString() || "");
  const [depositPaid, setDepositPaid] = useState(existingVendor?.depositPaid || false);

  const [notes, setNotes] = useState(existingVendor?.notes || "");
  const [showDelete, setShowDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<"infos" | "tarif" | "paiements" | "documents">("infos");

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

  // Dynamic per-invitation-type pricing (Tarif tab).
  const quotePricings = useVendorsStore((s) => s.quotePricings);
  const guests = useGuestsStore((s) => s.guests);
  const vendorPricings = useMemo(() => quotePricings.filter((p) => p.vendorId === id), [quotePricings, id]);
  const counts = useMemo(() => computeCounts(guests), [guests]);
  const isDynamic = existingVendor ? isVendorDynamicPricing(existingVendor, vendorPricings) : false;
  const computedTotal = existingVendor ? calculateVendorTotal(existingVendor, counts, vendorPricings) : 0;
  const setDynamicPricing = (val: boolean) => {
    if (!isNew && id) updateVendor(id, { dynamicPricing: val, updatedAt: new Date().toISOString() });
  };

  const typeName = t(VENDOR_TYPE_LABELS[type as VendorType]) || type;

  const sameTypeVendors = existingVendor ? vendors.filter((v) => v.type === existingVendor.type) : [];
  const isComparable = !isNew && sameTypeVendors.length >= 2;
  const hasQuoteComparison = useHasFeature("quoteComparison");
  // Defense-in-depth: the vendors list's FAB/header already gate this on the
  // happy path, but this screen is directly reachable by URL on web (deep
  // link, stale bookmark) — re-check at the actual write boundary too.
  const canAddVendor = useCanAddMore("vendors", vendors.length);
  const [showPaywall, setShowPaywall] = useState(false);
  const isRetained = existingVendor?.isSelected === true;

  const updateCustomField = (key: string, value: any) => {
    setCustomFieldsData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t("common:error"), t("nameRequired"));
      return;
    }
    if (isNew && !canAddVendor) {
      toast.error(t("common:premiumLimits.vendors", { limit: FREE_LIMITS.vendors }));
      setShowPaywall(true);
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
    analytics.capture("vendor_deleted", { category: type });
    setShowDelete(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-accent-paper">
      <Stack.Screen
        options={{
          title: name || "",
          headerRight: () => (
            <SaveHeaderButton label={t("common:save")} enabled={canSave} onPress={handleSave} />
          ),
        }}
      />

      {/* Tab bar */}
      <View className="mx-4 mt-3">
        <SegmentedControl
          compact
          segments={(["infos", "tarif", ...(isNew ? [] : ["paiements", "documents"])] as ("infos" | "tarif" | "paiements" | "documents")[]).map((tab) => {
            const tabKeys = { infos: "tabInfo", tarif: "tabPricing", paiements: "tabPayments", documents: "tabDocuments" } as const;
            return { key: tab, label: t(tabKeys[tab]) };
          })}
          activeKey={activeTab}
          onSelect={(key) => setActiveTab(key as "infos" | "tarif" | "paiements" | "documents")}
        />
      </View>

      <ScrollView className="flex-1 px-4 pt-3" showsVerticalScrollIndicator={false}>
        {activeTab === "infos" && (
          <>
            {!isNew && (
              <View style={{ position: "relative", marginBottom: 8, overflow: "visible" }}>
                <PageHeader
                  eyebrow={typeName}
                  title={name || typeName}
                  tagline={contactName || undefined}
                  titleSize={28}
                  style={{ paddingHorizontal: 0, paddingTop: 0 }}
                />
                {status === "BOOKED" && (
                  <Seal label="✓" sublabel={t("status.BOOKED").toLowerCase()} color="#6e7a4a" size={42} angle={-6} style={{ position: "absolute", top: -12, right: 8 }} />
                )}
              </View>
            )}
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

            {isComparable && (
              <>
                <SectionTitle>{t("comparison.title")}</SectionTitle>
                <PremiumGate locked={!hasQuoteComparison}>
                  <View className="mb-5">
                    <ToggleRow
                      label={t("comparison.retained")}
                      value={isRetained}
                      onToggle={() => {
                        if (isRetained) {
                          updateVendor(existingVendor!.id, { isSelected: false });
                        } else {
                          selectVendorInGroup(vendors, updateVendor, existingVendor!.id);
                          analytics.capture("vendor_selected_for_budget");
                        }
                      }}
                    />
                    <Pressable
                      onPress={() => router.push({ pathname: "/(tabs)/vendors/compare", params: { type } })}
                      className="mt-2"
                    >
                      <Text className="text-sm text-primary-500 font-medium">{t("comparison.viewAll")}</Text>
                    </Pressable>
                  </View>
                </PremiumGate>
              </>
            )}

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
                editable={canEdit}
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
              {!isNew && (
                <ToggleRow
                  label={t("dynamicPricingToggle")}
                  value={isDynamic}
                  onToggle={() => setDynamicPricing(!isDynamic)}
                />
              )}
              {isDynamic && !isNew ? (
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-sm text-ink-soft">
                    {typeConfig.basePriceLabel || t("totalPrice")}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <View className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950">
                      <Text className="text-xs text-primary-500 font-medium">
                        {t("computedTotalBadge")}
                      </Text>
                    </View>
                    <Text className="text-base font-semibold text-ink">
                      {formatMoney(computedTotal)}
                    </Text>
                  </View>
                </View>
              ) : (
                <InputRow
                  label={typeConfig.basePriceLabel || t("totalPrice")}
                  value={basePrice}
                  onChangeText={setBasePrice}
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

            {isDynamic && !isNew && <GuestPricingSection vendorId={id!} />}

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

        {activeTab === "documents" && !isNew && (
          <DocumentsTab vendorId={id!} />
        )}

        <View className="h-24" />
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
      <PaywallSheet visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </View>
  );
}

const PAYMENT_METHODS = ["cash", "check", "transfer", "card", "other"] as const;
type PaymentMethod = typeof PAYMENT_METHODS[number];

function PaymentsTab({ vendorId }: { vendorId: string }) {
  const { t } = useTranslation("budget");
  const { t: tV } = useTranslation("vendors");
  const canEdit = useCanEditHere();
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
    analytics.capture("vendor_payment_added");
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
          {canEdit && (
            <Pressable
              onPress={() => setDeleteId(p.id)}
              className="w-8 h-8 items-center justify-center"
            >
              <Trash2 size={16} color="#EF4444" />
            </Pressable>
          )}
        </View>
      ))}

      {payments.length === 0 && !showAdd && (
        <Text className="text-sm text-mute mb-3">{tV("noPayments")}</Text>
      )}

      {/* Add form */}
      {showAdd && canEdit ? (
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
              className="flex-1 bg-accent-paper py-2.5 rounded-xl items-center"
            >
              <Text className="text-mute text-sm">{t("common:cancel")}</Text>
            </Pressable>
          </View>
        </FormCard>
      ) : canEdit ? (
        <Pressable
          onPress={() => setShowAdd(true)}
          className="bg-primary-50 dark:bg-primary-950 rounded-xl py-3 items-center border border-primary-200 dark:border-primary-800 active:opacity-80 mt-1"
        >
          <Text className="text-sm font-semibold text-primary-500">+ {t("addPayment")}</Text>
        </Pressable>
      ) : null}

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

function DocumentsTab({ vendorId }: { vendorId: string }) {
  const { t } = useTranslation("vendors");
  const canEdit = useCanEditHere();
  const allDocuments = useDocumentsStore((s) => s.documents);
  const addDocument = useDocumentsStore((s) => s.addDocument);
  const removeDocument = useDocumentsStore((s) => s.removeDocument);
  const documents = useMemo(
    () => allDocuments.filter((d) => d.ownerType === "VENDOR" && d.ownerId === vendorId),
    [allDocuments, vendorId]
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handlePick = async () => {
    const docId = Crypto.randomUUID();
    try {
      const picked = await pickAndStoreDocument(docId);
      if (!picked) return;
      const now = new Date().toISOString();
      addDocument({
        id: docId,
        ownerType: "VENDOR",
        ownerId: vendorId,
        label: picked.fileName,
        fileName: picked.fileName,
        mimeType: picked.mimeType,
        localUri: picked.localUri,
        fileSize: picked.fileSize,
        uploadedAt: now,
        notes: null,
        createdAt: now,
        updatedAt: now,
      });
      analytics.capture("document_attached");
    } catch {
      Alert.alert(t("common:error"), t("documentPickError"));
    }
  };

  return (
    <View>
      {documents.map((doc) => {
        const available = isDocumentAvailableOnDevice(doc.localUri);
        return (
          <View key={doc.id} className="bg-accent-card rounded-xl p-3.5 mb-2 border border-hair flex-row items-center">
            <FileText size={18} color="#b96a4a" style={{ marginRight: 10 }} />
            <View className="flex-1">
              <Text className="text-base font-semibold text-ink" numberOfLines={1}>{doc.label}</Text>
              <Text className="text-xs text-mute mt-0.5">{doc.fileName}</Text>
              {!available && (
                <Text className="text-xs text-red-500 mt-0.5">{t("documentUnavailable")}</Text>
              )}
            </View>
            {canEdit && (
              <Pressable
                onPress={() => setDeleteId(doc.id)}
                className="w-8 h-8 items-center justify-center"
              >
                <Trash2 size={16} color="#EF4444" />
              </Pressable>
            )}
          </View>
        );
      })}

      {documents.length === 0 && (
        <Text className="text-sm text-mute mb-3">{t("noDocuments")}</Text>
      )}

      {canEdit && (
        <Pressable
          onPress={handlePick}
          className="bg-primary-50 dark:bg-primary-950 rounded-xl py-3 flex-row items-center justify-center gap-2 border border-primary-200 dark:border-primary-800 active:opacity-80 mt-1"
        >
          <Upload size={15} color="#b96a4a" />
          <Text className="text-sm font-semibold text-primary-500">{t("addDocument")}</Text>
        </Pressable>
      )}

      <ConfirmSheet
        visible={!!deleteId}
        title={t("deleteDocument")}
        message={t("irreversible")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={async () => {
          if (deleteId) {
            const doc = documents.find((d) => d.id === deleteId);
            if (doc) await deleteDocumentFile(doc.localUri);
            removeDocument(deleteId);
          }
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

export async function generateStaticParams() { return []; }
