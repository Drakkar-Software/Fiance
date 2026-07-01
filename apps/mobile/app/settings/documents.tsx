import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { FileText, Trash2 } from "lucide-react-native";
import { useDocumentsStore } from "@/store/useDocumentsStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { FilterTabs } from "@/components/FilterTabs";
import { isDocumentAvailableOnDevice, deleteDocumentFile } from "@/lib/documents";
import { DOCUMENT_OWNER_TYPE_LABELS, type DocumentOwnerType } from "@fiance/sdk";
import type { Document } from "@/db/schema";

const OWNER_TYPES: DocumentOwnerType[] = ["VENDOR", "GUEST", "LEGAL", "HONEYMOON", "WEDDING"];

export default function DocumentsHubScreen() {
  const { t } = useTranslation("vendors");
  const documents = useDocumentsStore((s) => s.documents);
  const removeDocument = useDocumentsStore((s) => s.removeDocument);
  const vendors = useVendorsStore((s) => s.vendors);
  const guests = useGuestsStore((s) => s.guests);
  const [filter, setFilter] = useState<"ALL" | DocumentOwnerType>("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "ALL" ? documents : documents.filter((d) => d.ownerType === filter)),
    [documents, filter]
  );

  const ownerLabel = (doc: Document): string | null => {
    if (doc.ownerType === "VENDOR") return vendors.find((v) => v.id === doc.ownerId)?.name ?? null;
    if (doc.ownerType === "GUEST") {
      const g = guests.find((x) => x.id === doc.ownerId);
      return g ? `${g.firstName} ${g.lastName}` : null;
    }
    return null;
  };

  const tabs = [
    { key: "ALL", label: t("common:all"), count: documents.length },
    ...OWNER_TYPES.map((ot) => ({
      key: ot,
      label: t(DOCUMENT_OWNER_TYPE_LABELS[ot]),
      count: documents.filter((d) => d.ownerType === ot).length,
    })),
  ];

  return (
    <View className="relative flex-1 bg-accent-paper">
      <FilterTabs tabs={tabs} activeKey={filter} onSelect={(k) => setFilter(k as typeof filter)} />

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title={t("noDocuments")} />
      ) : (
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {filtered.map((doc) => {
            const available = isDocumentAvailableOnDevice(doc.localUri);
            const owner = ownerLabel(doc);
            return (
              <View key={doc.id} className="bg-accent-card rounded-xl p-3.5 mb-2 border border-hair flex-row items-center">
                <FileText size={18} color="#b96a4a" style={{ marginRight: 10 }} />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-ink" numberOfLines={1}>{doc.label}</Text>
                  <Text className="text-xs text-mute mt-0.5">
                    {t(DOCUMENT_OWNER_TYPE_LABELS[doc.ownerType as DocumentOwnerType])}
                    {owner ? ` · ${owner}` : ""}
                  </Text>
                  {!available && (
                    <Text className="text-xs text-red-500 mt-0.5">{t("documentUnavailable")}</Text>
                  )}
                </View>
                <Pressable onPress={() => setDeleteId(doc.id)} className="w-8 h-8 items-center justify-center">
                  <Trash2 size={16} color="#EF4444" />
                </Pressable>
              </View>
            );
          })}
          <View className="h-8" />
        </ScrollView>
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
