import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  initStarfish,
  teardownStarfish,
  getStarfishStore,
} from "@/lib/starfish";
import { deriveAuthToken, deriveEncryptionKey, buildInviteUrl } from "@/lib/identity";
import { useWeddingStore } from "@/store/useWeddingStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useIdeasStore } from "@/store/useIdeasStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import {
  generateDefaultCategories,
  generateTemplateTasks,
  recalculateDueDates,
} from "@/lib/planning";
import {
  SectionTitle,
  FormCard,
  InputRow,
} from "@/components/FormSection";

export default function SettingsScreen() {
  const wedding = useWeddingStore((s) => s.wedding);
  const updateWedding = useWeddingStore((s) => s.updateWedding);
  const tasks = usePlanningStore((s) => s.tasks);
  const setTasks = usePlanningStore((s) => s.setTasks);
  const categories = usePlanningStore((s) => s.categories);
  const setCategories = usePlanningStore((s) => s.setCategories);

  const registry = useWeddingRegistryStore((s) => s.registry);
  const switchWedding = useWeddingRegistryStore((s) => s.switchWedding);

  const activeEntry = registry?.weddings.find(
    (w) => w.id === registry.activeWeddingId
  );

  const [partner1, setPartner1] = useState(wedding?.partner1Name || "");
  const [partner2, setPartner2] = useState(wedding?.partner2Name || "");
  const [weddingDate, setWeddingDate] = useState(wedding?.weddingDate || "");
  const [venueName, setVenueName] = useState(wedding?.venueName || "");
  const [budgetTarget, setBudgetTarget] = useState(
    wedding?.budgetTarget?.toString() || ""
  );
  const [currency, setCurrency] = useState(wedding?.currency || "EUR");

  // Sync state
  const syncEnabled = !!getStarfishStore();

  const handleToggleSync = useCallback(async () => {
    if (syncEnabled) {
      teardownStarfish();
      return;
    }

    const password = activeEntry?.seedPhrase;
    const serverUrl = activeEntry?.serverUrl;
    if (!password || !serverUrl) {
      Alert.alert(
        "Synchronisation impossible",
        "Aucun serveur ou mot de passe configuré pour ce mariage."
      );
      return;
    }

    const authToken = await deriveAuthToken(password);
    const encryptionKey = await deriveEncryptionKey(
      password,
      activeEntry?.id || "default"
    );

    initStarfish({
      serverUrl,
      authToken,
      userId: authToken.slice(0, 16),
      encryptionKey,
    });
  }, [syncEnabled, activeEntry]);

  const handleInvite = useCallback(async () => {
    const password = activeEntry?.seedPhrase;
    const name = activeEntry?.label;
    if (!password || !name) {
      Alert.alert("Erreur", "Aucun mot de passe associé à ce mariage.");
      return;
    }
    const url = buildInviteUrl(name, password);
    try {
      await Share.share({
        message: `Rejoins notre mariage sur WeddingOS !\n${url}`,
      });
    } catch {
      // User cancelled share
    }
  }, [activeEntry]);

  const handleSave = useCallback(() => {
    const oldDate = wedding?.weddingDate;
    const newDate = weddingDate || null;

    updateWedding({
      partner1Name: partner1 || null,
      partner2Name: partner2 || null,
      weddingDate: newDate,
      venueName: venueName || null,
      budgetTarget: budgetTarget ? parseFloat(budgetTarget) : null,
      currency: currency || "EUR",
    });

    if (newDate && newDate !== oldDate) {
      const updated = recalculateDueDates(tasks, newDate);
      setTasks(updated);
    }

    Alert.alert("Enregistré", "Les réglages ont été mis à jour.");
  }, [partner1, partner2, weddingDate, venueName, budgetTarget, currency, wedding, tasks]);

  const handleGenerateTemplate = useCallback(() => {
    if (categories.length === 0) {
      const cats = generateDefaultCategories();
      setCategories(cats);
      const templateTasks = generateTemplateTasks(cats, wedding?.weddingDate || undefined);
      setTasks([...tasks, ...templateTasks]);
    } else {
      const templateTasks = generateTemplateTasks(categories, wedding?.weddingDate || undefined);
      setTasks([...tasks, ...templateTasks]);
    }
    Alert.alert("Planning généré", "Le planning type de préparation a été ajouté.");
  }, [categories, tasks, wedding]);

  const guestCount = useGuestsStore((s) => s.guests.length);
  const vendorCount = useVendorsStore((s) => s.vendors.length);
  const taskCount = usePlanningStore((s) => s.tasks.length);
  const ideaCount = useIdeasStore((s) => s.ideas.length);

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      showsVerticalScrollIndicator={false}
    >
      {/* Wedding info */}
      <View className="px-4 pt-4">
        <SectionTitle>Informations du mariage</SectionTitle>
        <FormCard>
          <InputRow label="Marié(e) 1" value={partner1} onChangeText={setPartner1} placeholder="Prénom + Nom" />
          <InputRow label="Marié(e) 2" value={partner2} onChangeText={setPartner2} placeholder="Prénom + Nom" />
          <InputRow label="Date du mariage" value={weddingDate} onChangeText={setWeddingDate} placeholder="2026-09-12" />
          <InputRow label="Lieu principal" value={venueName} onChangeText={setVenueName} placeholder="Nom du lieu" />
          <InputRow label="Budget cible (€)" value={budgetTarget} onChangeText={setBudgetTarget} placeholder="30000" keyboardType="numeric" />
          <InputRow label="Devise" value={currency} onChangeText={setCurrency} placeholder="EUR" />
        </FormCard>

        <Pressable
          onPress={handleSave}
          className="bg-primary-500 rounded-2xl py-3.5 items-center mb-6 active:bg-primary-600"
        >
          <Text className="text-white font-semibold text-base">
            Enregistrer les modifications
          </Text>
        </Pressable>
      </View>

      {/* Invite */}
      {activeEntry?.seedPhrase && (
        <View className="px-4">
          <SectionTitle>Inviter</SectionTitle>
          <Pressable
            onPress={handleInvite}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100 dark:border-gray-800 active:opacity-80"
          >
            <View className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center">
              <Ionicons name="share-outline" size={20} color="#EC4899" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-medium text-gray-900 dark:text-white">
                Partager un lien d'invitation
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">
                Envoyer un lien pour rejoindre ce mariage
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C0C0C8" />
          </Pressable>
        </View>
      )}

      {/* Planning template */}
      <View className="px-4">
        <SectionTitle>Planning</SectionTitle>
        <Pressable
          onPress={handleGenerateTemplate}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100 dark:border-gray-800 active:opacity-80"
        >
          <View className="w-10 h-10 rounded-xl bg-accent-blush dark:bg-primary-900 items-center justify-center">
            <Ionicons name="calendar" size={20} color="#EC4899" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-medium text-gray-900 dark:text-white">
              Générer le planning type
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              33 tâches avec deadlines relatives
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#C0C0C8" />
        </Pressable>
      </View>

      {/* Stats */}
      <View className="px-4 mt-4">
        <SectionTitle>Statistiques</SectionTitle>
        <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-5 border border-gray-100 dark:border-gray-800">
          <View className="flex-row flex-wrap">
            <StatCell label="Invités" value={guestCount} color="#E8B4B8" />
            <StatCell label="Prestataires" value={vendorCount} color="#C9956B" />
            <StatCell label="Tâches" value={taskCount} color="#7B9A7B" />
            <StatCell label="Idées" value={ideaCount} color="#EC4899" />
          </View>
        </View>
      </View>

      {/* Synchronisation */}
      <View className="px-4">
        <SectionTitle>Synchronisation</SectionTitle>
        <Pressable
          onPress={handleToggleSync}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100 dark:border-gray-800 active:opacity-80"
        >
          <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: syncEnabled ? "#ECFDF5" : "#F3F4F6" }}
          >
            <Ionicons
              name={syncEnabled ? "cloud-done" : "cloud-offline-outline"}
              size={20}
              color={syncEnabled ? "#10B981" : "#9CA3AF"}
            />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-medium text-gray-900 dark:text-white">
              {syncEnabled ? "Synchronisation activée" : "Synchronisation désactivée"}
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              {syncEnabled
                ? "Les données sont synchronisées automatiquement"
                : "Appuyez pour activer la synchronisation"}
            </Text>
          </View>
          <View
            className="w-12 h-7 rounded-full justify-center px-0.5"
            style={{ backgroundColor: syncEnabled ? "#EC4899" : "#D1D5DB" }}
          >
            <View
              className="w-6 h-6 rounded-full bg-white"
              style={{ alignSelf: syncEnabled ? "flex-end" : "flex-start" }}
            />
          </View>
        </Pressable>
      </View>

      {/* Mes mariages */}
      {registry && registry.weddings.length > 0 && (
        <View className="px-4 mt-4">
          <SectionTitle>Mes mariages</SectionTitle>
          {registry.weddings.map((w) => {
            const isActive = w.id === registry.activeWeddingId;
            return (
              <Pressable
                key={w.id}
                onPress={() => {
                  if (!isActive) switchWedding(w.id);
                }}
                className={`bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2 border flex-row items-center active:opacity-80 ${
                  isActive
                    ? "border-primary-300 dark:border-primary-700"
                    : "border-gray-100 dark:border-gray-800"
                }`}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{
                    backgroundColor: isActive ? "#EC489915" : "#F3F4F6",
                  }}
                >
                  <Ionicons
                    name={isActive ? "heart" : "heart-outline"}
                    size={20}
                    color={isActive ? "#EC4899" : "#9CA3AF"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900 dark:text-white">
                    {w.label}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {isActive ? "Mariage actif" : "Appuyez pour basculer"}
                  </Text>
                </View>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={20} color="#EC4899" />
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Security */}
      <View className="px-4 mt-4">
        <SectionTitle>Sécurité</SectionTitle>
        <SettingsRow
          icon="lock-closed-outline"
          title="Verrouillage de l'app"
          subtitle="PIN ou biométrie"
        />
        <SettingsRow
          icon="shield-checkmark-outline"
          title="Chiffrement"
          subtitle="AES-256 · Backup chiffré AES-GCM"
        />
      </View>

      {/* About */}
      <View className="px-4 mt-4 mb-8">
        <SectionTitle>À propos</SectionTitle>
        <View className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            WeddingOS
          </Text>
          <Text className="text-sm text-gray-400 mt-1">
            Version 1.0.0
          </Text>
          <View className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
            <Text className="text-xs text-gray-400 leading-4">
              Privacy-first · Offline-first · Aucune télémétrie{"\n"}
              Vos données restent chiffrées, sur votre appareil et votre serveur.
            </Text>
          </View>
        </View>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2 border border-gray-100 dark:border-gray-800 flex-row items-center">
      <View className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 items-center justify-center">
        <Ionicons name={icon} size={20} color="#C0C0C8" />
      </View>
      <View className="ml-3">
        <Text className="text-base text-gray-900 dark:text-white font-medium">
          {title}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function StatCell({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View className="w-1/2 items-center py-2">
      <Text className="text-2xl font-bold" style={{ color }}>
        {value}
      </Text>
      <Text className="text-xs text-gray-400 mt-0.5">{label}</Text>
    </View>
  );
}
