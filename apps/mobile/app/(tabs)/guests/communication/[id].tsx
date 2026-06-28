import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react-native";
import { useCommunicationsStore } from "@/store/useCommunicationsStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { EmptyState } from "@/components/EmptyState";
import { DateRow } from "@/components/FormSection";
import { Avatar } from "@/components/Avatar";
import { theme as GP } from "@/lib/theme";
import { Users } from "lucide-react-native";

export default function CommunicationRosterScreen() {
  const { t } = useTranslation("guests");
  const { id } = useLocalSearchParams<{ id: string }>();
  const comm = useCommunicationsStore((s) => s.communications.find((c) => c.id === id));
  const toggleRecipient = useCommunicationsStore((s) => s.toggleRecipient);
  const setRecipientDate = useCommunicationsStore((s) => s.setRecipientDate);
  const guests = useGuestsStore((s) => s.guests);

  if (!comm) {
    return (
      <View className="flex-1 bg-accent-paper items-center justify-center">
        <Text className="text-mute">{t("communicationNotFound")}</Text>
      </View>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <View className="flex-1 bg-accent-paper">
      {comm.date || comm.notes ? (
        <View className="px-4 pt-3 pb-2 border-b border-hair bg-accent-card">
          {comm.date ? (
            <Text className="text-xs text-mute">{comm.date}</Text>
          ) : null}
          {comm.notes ? (
            <Text className="text-sm text-ink-soft mt-0.5">{comm.notes}</Text>
          ) : null}
        </View>
      ) : null}

      {guests.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("noGuests")}
          description={t("addFirstGuest")}
          actionLabel=""
          onAction={() => {}}
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-3" showsVerticalScrollIndicator={false}>
          <Text className="text-xs font-semibold text-mute uppercase tracking-wider mb-3">
            {t("communicationRecipients")} — {comm.recipients.length}/{guests.length}
          </Text>
          {guests.map((guest) => {
            const recipient = comm.recipients.find((r) => r.guestId === guest.id);
            const received = !!recipient;
            const initials = `${guest.firstName[0] ?? ""}${guest.lastName[0] ?? ""}`.toUpperCase();

            return (
              <View key={guest.id} className="bg-accent-card rounded-2xl mb-2 border border-hair overflow-hidden">
                <Pressable
                  onPress={() => toggleRecipient(comm.id, guest.id, today)}
                  className="flex-row items-center p-3 active:opacity-70"
                >
                  <Avatar ini={initials} size={36} />
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-medium text-ink">
                      {guest.firstName} {guest.lastName}
                    </Text>
                  </View>
                  <View
                    className="w-7 h-7 rounded-full items-center justify-center"
                    style={{ backgroundColor: received ? GP.clay : "transparent", borderWidth: received ? 0 : 1.5, borderColor: "#D0D0D8" }}
                  >
                    {received ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
                  </View>
                </Pressable>
                {received ? (
                  <View className="px-3 pb-3 border-t border-hair">
                    <DateRow
                      label={t("communicationSentAt")}
                      value={recipient.sentAt ?? ""}
                      onChange={(v) => setRecipientDate(comm.id, guest.id, v || null)}
                    />
                  </View>
                ) : null}
              </View>
            );
          })}
          <View className="h-10" />
        </ScrollView>
      )}
    </View>
  );
}
