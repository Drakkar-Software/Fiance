import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import {
  initStarfish,
  getStarfishStore,
  teardownStarfish,
} from "@/lib/starfish";
import { useWeddingStore } from "@/store/useWeddingStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useIdeasStore } from "@/store/useIdeasStore";
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

  const [partner1, setPartner1] = useState(wedding?.partner1Name || "");
  const [partner2, setPartner2] = useState(wedding?.partner2Name || "");
  const [weddingDate, setWeddingDate] = useState(wedding?.weddingDate || "");
  const [venueName, setVenueName] = useState(wedding?.venueName || "");
  const [budgetTarget, setBudgetTarget] = useState(
    wedding?.budgetTarget?.toString() || ""
  );
  const [currency, setCurrency] = useState(wedding?.currency || "EUR");

  // Starfish sync state
  const [serverUrl, setServerUrl] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [encKeyVisible, setEncKeyVisible] = useState(false);
  const [encKey, setEncKey] = useState<string | null>(null);

  // Load saved sync config on mount
  React.useEffect(() => {
    (async () => {
      const url = await SecureStore.getItemAsync("starfish_server_url");
      const token = await SecureStore.getItemAsync("starfish_auth_token");
      const key = await SecureStore.getItemAsync("starfish_encryption_key");
      const last = await SecureStore.getItemAsync("starfish_last_sync");
      if (url) setServerUrl(url);
      if (token) setAuthToken(token);
      if (key) setEncKey(key);
      if (last) setLastSync(last);
      if (url && token && key) setSyncEnabled(true);
    })();
  }, []);

  const handleSetupSync = useCallback(async () => {
    if (!serverUrl || !authToken) {
      Alert.alert("Erreur", "Veuillez renseigner l'URL du serveur et le token.");
      return;
    }

    let key = encKey;
    if (!key) {
      const bytes = Crypto.getRandomValues(new Uint8Array(32));
      key = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setEncKey(key);
      await SecureStore.setItemAsync("starfish_encryption_key", key);
      Alert.alert(
        "Clé de chiffrement générée",
        "Conservez cette clé en lieu sûr. Elle est nécessaire pour récupérer vos données."
      );
    }

    await SecureStore.setItemAsync("starfish_server_url", serverUrl);
    await SecureStore.setItemAsync("starfish_auth_token", authToken);

    const userId = wedding?.id?.toString() || "default";
    initStarfish({ serverUrl, authToken, userId, encryptionKey: key });
    setSyncEnabled(true);
  }, [serverUrl, authToken, encKey, wedding]);

  const handleSyncNow = useCallback(async () => {
    const sf = getStarfishStore();
    if (!sf) {
      Alert.alert("Erreur", "La synchronisation n'est pas configurée.");
      return;
    }

    setSyncing(true);
    setSyncError(null);
    try {
      await sf.getState().pull();
      await sf.getState().flush();
      const now = new Date().toISOString();
      setLastSync(now);
      await SecureStore.setItemAsync("starfish_last_sync", now);
    } catch (e: any) {
      setSyncError(e.message || "Erreur de synchronisation");
    } finally {
      setSyncing(false);
    }
  }, []);

  const handleDisableSync = useCallback(() => {
    teardownStarfish();
    setSyncEnabled(false);
  }, []);

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

      {/* Starfish Sync */}
      <View className="px-4">
        <SectionTitle>Synchronisation</SectionTitle>
        <FormCard>
          <InputRow
            label="URL du serveur Starfish"
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="https://sync.example.com"
          />
          <InputRow
            label="Token d'authentification"
            value={authToken}
            onChangeText={setAuthToken}
            placeholder="Bearer token"
          />

          {!syncEnabled ? (
            <Pressable
              onPress={handleSetupSync}
              className="bg-primary-500 rounded-xl py-2.5 items-center mt-4 active:bg-primary-600"
            >
              <Text className="text-white font-semibold text-sm">
                Activer la synchronisation
              </Text>
            </Pressable>
          ) : (
            <View className="mt-4">
              {/* Status row */}
              <View className="flex-row items-center mb-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-2.5"
                  style={{ backgroundColor: syncError ? "#FEF2F2" : "#ECFDF5" }}
                >
                  <Ionicons
                    name={syncError ? "cloud-offline" : "cloud-done"}
                    size={16}
                    color={syncError ? "#EF4444" : "#10B981"}
                  />
                </View>
                <Text className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                  {syncError
                    ? syncError
                    : lastSync
                    ? `Dernière sync : ${new Date(lastSync).toLocaleString()}`
                    : "Synchronisation active"}
                </Text>
              </View>

              <Pressable
                onPress={handleSyncNow}
                disabled={syncing}
                className="bg-primary-500 rounded-xl py-2.5 items-center mb-2 active:bg-primary-600"
              >
                {syncing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-sm">
                    Synchroniser maintenant
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={handleDisableSync}
                className="rounded-xl py-2 items-center active:opacity-70"
              >
                <Text className="text-red-400 text-sm">
                  Désactiver la synchronisation
                </Text>
              </Pressable>
            </View>
          )}
        </FormCard>

        {/* Encryption key */}
        {encKey && (
          <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-xs text-gray-400 mb-1 font-medium">
                  Clé de chiffrement
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                  {encKeyVisible ? encKey : "••••••••••••••••••••"}
                </Text>
              </View>
              <Pressable
                onPress={() => setEncKeyVisible(!encKeyVisible)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons
                  name={encKeyVisible ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#C0C0C8"
                />
              </Pressable>
            </View>
          </View>
        )}
      </View>

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
              Vos données restent chiffrées, sur votre appareil et votre serveur Starfish.
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
