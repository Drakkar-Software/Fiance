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

export default function SettingsScreen() {
  const wedding = useWeddingStore((s) => s.wedding);
  const updateWedding = useWeddingStore((s) => s.updateWedding);
  const tasks = usePlanningStore((s) => s.tasks);
  const setTasks = usePlanningStore((s) => s.setTasks);
  const categories = usePlanningStore((s) => s.categories);
  const setCategories = usePlanningStore((s) => s.setCategories);

  const [partner1, setPartner1] = useState(wedding?.partner1Name || "");
  const [partner2, setPartner2] = useState(wedding?.partner2Name || "");
  const [weddingDate, setWeddingDate] = useState(
    wedding?.weddingDate || ""
  );
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
    initStarfish({
      serverUrl,
      authToken,
      userId,
      encryptionKey: key,
    });

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

    // Recalculate task due dates if wedding date changed
    if (newDate && newDate !== oldDate) {
      const updated = recalculateDueDates(tasks, newDate);
      setTasks(updated);
    }

    Alert.alert("Enregistré", "Les réglages ont été mis à jour.");
  }, [
    partner1,
    partner2,
    weddingDate,
    venueName,
    budgetTarget,
    currency,
    wedding,
    tasks,
  ]);

  const handleGenerateTemplate = useCallback(() => {
    if (categories.length === 0) {
      const cats = generateDefaultCategories();
      setCategories(cats);
      const templateTasks = generateTemplateTasks(
        cats,
        wedding?.weddingDate || undefined
      );
      setTasks([...tasks, ...templateTasks]);
    } else {
      const templateTasks = generateTemplateTasks(
        categories,
        wedding?.weddingDate || undefined
      );
      setTasks([...tasks, ...templateTasks]);
    }
    Alert.alert(
      "Planning généré",
      "Le planning type de préparation a été ajouté."
    );
  }, [categories, tasks, wedding]);

  const guestCount = useGuestsStore((s) => s.guests.length);
  const vendorCount = useVendorsStore((s) => s.vendors.length);
  const taskCount = usePlanningStore((s) => s.tasks.length);
  const ideaCount = useIdeasStore((s) => s.ideas.length);

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Wedding info */}
      <View className="px-4 pt-4">
        <SectionTitle>Informations du mariage</SectionTitle>
        <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6">
          <InputRow
            label="Marié(e) 1"
            value={partner1}
            onChangeText={setPartner1}
            placeholder="Prénom + Nom"
          />
          <InputRow
            label="Marié(e) 2"
            value={partner2}
            onChangeText={setPartner2}
            placeholder="Prénom + Nom"
          />
          <InputRow
            label="Date du mariage (ISO)"
            value={weddingDate}
            onChangeText={setWeddingDate}
            placeholder="2026-09-12"
          />
          <InputRow
            label="Lieu principal"
            value={venueName}
            onChangeText={setVenueName}
            placeholder="Nom du lieu"
          />
          <InputRow
            label="Budget cible (€)"
            value={budgetTarget}
            onChangeText={setBudgetTarget}
            placeholder="30000"
            keyboardType="numeric"
          />
          <InputRow
            label="Devise"
            value={currency}
            onChangeText={setCurrency}
            placeholder="EUR"
          />
        </View>

        <Pressable
          onPress={handleSave}
          className="bg-primary-500 rounded-xl py-3 items-center mb-6 active:bg-primary-600"
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
          className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-3 flex-row items-center shadow-sm active:opacity-80"
        >
          <Ionicons name="calendar" size={24} color="#EC4899" />
          <View className="ml-3 flex-1">
            <Text className="text-base font-medium text-gray-900 dark:text-white">
              Générer le planning type
            </Text>
            <Text className="text-sm text-gray-500">
              33 tâches de préparation avec deadlines relatives
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </Pressable>
      </View>

      {/* Stats */}
      <View className="px-4 mt-4">
        <SectionTitle>Statistiques</SectionTitle>
        <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6">
          <StatRow label="Invités" value={guestCount} />
          <StatRow label="Prestataires" value={vendorCount} />
          <StatRow label="Tâches" value={taskCount} />
          <StatRow label="Idées" value={ideaCount} />
        </View>
      </View>

      {/* Starfish Sync */}
      <View className="px-4">
        <SectionTitle>Synchronisation</SectionTitle>
        <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-3 shadow-sm">
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
              className="bg-primary-500 rounded-lg py-2.5 items-center mt-3 active:bg-primary-600"
            >
              <Text className="text-white font-semibold text-sm">
                Activer la synchronisation
              </Text>
            </Pressable>
          ) : (
            <View className="mt-3">
              {/* Status row */}
              <View className="flex-row items-center mb-3">
                <Ionicons
                  name={syncError ? "cloud-offline" : "cloud-done"}
                  size={20}
                  color={syncError ? "#EF4444" : "#10B981"}
                />
                <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {syncError
                    ? syncError
                    : lastSync
                    ? `Dernière sync : ${new Date(lastSync).toLocaleString()}`
                    : "Synchronisation active"}
                </Text>
              </View>

              {/* Sync now button */}
              <Pressable
                onPress={handleSyncNow}
                disabled={syncing}
                className="bg-primary-500 rounded-lg py-2.5 items-center mb-2 active:bg-primary-600"
              >
                {syncing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-sm">
                    Synchroniser maintenant
                  </Text>
                )}
              </Pressable>

              {/* Disable button */}
              <Pressable
                onPress={handleDisableSync}
                className="rounded-lg py-2 items-center active:opacity-70"
              >
                <Text className="text-red-500 text-sm">
                  Désactiver la synchronisation
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Encryption key display */}
        {encKey && (
          <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-3 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-sm text-gray-500 mb-1">
                  Clé de chiffrement
                </Text>
                <Text className="text-xs text-gray-700 dark:text-gray-300 font-mono">
                  {encKeyVisible ? encKey : "••••••••••••••••"}
                </Text>
              </View>
              <Pressable onPress={() => setEncKeyVisible(!encKeyVisible)}>
                <Ionicons
                  name={encKeyVisible ? "eye-off" : "eye"}
                  size={20}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Security placeholder */}
      <View className="px-4 mt-4">
        <SectionTitle>Sécurité</SectionTitle>
        <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-3 shadow-sm">
          <View className="flex-row items-center">
            <Ionicons name="lock-closed-outline" size={24} color="#9CA3AF" />
            <View className="ml-3">
              <Text className="text-base text-gray-900 dark:text-white">
                Verrouillage de l'app
              </Text>
              <Text className="text-sm text-gray-500">
                PIN ou biométrie (Face ID / Empreinte)
              </Text>
            </View>
          </View>
        </View>
        <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6 shadow-sm">
          <View className="flex-row items-center">
            <Ionicons name="shield-checkmark-outline" size={24} color="#9CA3AF" />
            <View className="ml-3">
              <Text className="text-base text-gray-900 dark:text-white">
                Chiffrement
              </Text>
              <Text className="text-sm text-gray-500">
                SQLCipher AES-256 · Backup chiffré AES-GCM
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* About */}
      <View className="px-4 mb-8">
        <SectionTitle>À propos</SectionTitle>
        <View className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
          <Text className="text-base font-medium text-gray-900 dark:text-white">
            WeddingOS
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Version 1.0.0
          </Text>
          <Text className="text-xs text-gray-400 mt-2">
            Privacy-first · Offline-first · Aucune télémétrie
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            Vos données restent chiffrées, sur votre appareil et votre serveur Starfish.
          </Text>
        </View>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-sm font-medium text-gray-500 mb-2 uppercase">
      {children}
    </Text>
  );
}

function InputRow({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View className="border-b border-gray-100 dark:border-gray-800 py-3">
      <Text className="text-sm text-gray-500 mb-1">{label}</Text>
      <TextInput
        className="text-base text-gray-900 dark:text-white"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
      />
    </View>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-50 dark:border-gray-800">
      <Text className="text-base text-gray-700 dark:text-gray-300">
        {label}
      </Text>
      <Text className="text-base font-semibold text-gray-900 dark:text-white">
        {value}
      </Text>
    </View>
  );
}
