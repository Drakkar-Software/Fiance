import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Share,
} from "react-native";
import { format } from "date-fns";
import { Share2, ChevronRight, Cloud, CloudOff, Heart, CheckCircle2, Lock, PlusCircle } from "lucide-react-native";
import { isLockEnabled, setLockEnabled } from "@/lib/app-lock";
import { isPremium } from "@/lib/premium";
import { PinSetup } from "@/components/PinSetup";
import {
  initStarfish,
  teardownStarfish,
  getStarfishStore,
  getLastSyncTimestamp,
} from "@/lib/starfish";
import { deriveAuthToken, deriveEncryptionKey, buildInviteUrl, generatePassphrase } from "@/lib/identity";
import { useWeddingStore } from "@/store/useWeddingStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { recalculateDueDates } from "@/lib/planning";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  SectionTitle,
  FormCard,
  InputRow,
} from "@/components/FormSection";

export default function SettingsScreen() {
  const { t } = useTranslation("settings");
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const wedding = useWeddingStore((s) => s.wedding);
  const updateWedding = useWeddingStore((s) => s.updateWedding);
  const tasks = usePlanningStore((s) => s.tasks);
  const setTasks = usePlanningStore((s) => s.setTasks);

  const registry = useWeddingRegistryStore((s) => s.registry);
  const switchWedding = useWeddingRegistryStore((s) => s.switchWedding);
  const createWedding = useWeddingRegistryStore((s) => s.createWedding);
  const updateRegistryWedding = useWeddingRegistryStore((s) => s.updateWedding);

  const activeEntry = registry?.weddings.find(
    (w) => w.id === registry.activeWeddingId
  );

  // Wedding label (stored in registry, not wedding store)
  const [weddingLabel, _setWeddingLabel] = useState(activeEntry?.label || "");
  const setWeddingLabel = useCallback((value: string) => {
    _setWeddingLabel(value);
    if (activeEntry?.id) {
      updateRegistryWedding(activeEntry.id, { label: value });
    }
  }, [activeEntry?.id]);

  // Wedding fields — local state for smooth typing, save to store immediately
  const [partner1, _setPartner1] = useState(wedding?.partner1Name || "");
  const setPartner1 = useCallback((value: string) => {
    _setPartner1(value);
    updateWedding({ partner1Name: value || null });
  }, []);

  const [partner2, _setPartner2] = useState(wedding?.partner2Name || "");
  const setPartner2 = useCallback((value: string) => {
    _setPartner2(value);
    updateWedding({ partner2Name: value || null });
  }, []);

  const [weddingDate, _setWeddingDate] = useState(wedding?.weddingDate || "");
  const setWeddingDate = useCallback((value: string) => {
    _setWeddingDate(value);
    updateWedding({ weddingDate: value || null });
  }, []);

  const [venueName, _setVenueName] = useState(wedding?.venueName || "");
  const setVenueName = useCallback((value: string) => {
    _setVenueName(value);
    updateWedding({ venueName: value || null });
  }, []);

  // Recalculate due dates when wedding date changes
  useEffect(() => {
    if (weddingDate && weddingDate !== wedding?.weddingDate) {
      const updated = recalculateDueDates(tasks, weddingDate);
      setTasks(updated);
    }
  }, [weddingDate]);

  // Sync state — use local state to force re-render after toggle
  const [syncEnabled, setSyncEnabled] = useState(!!getStarfishStore());
  const lastSync = syncEnabled ? getLastSyncTimestamp() : null;

  const handleToggleSync = useCallback(async () => {
    if (syncEnabled) {
      teardownStarfish();
      setSyncEnabled(false);
      return;
    }

    if (!isPremium()) {
      Alert.alert(
        "Fonctionnalité premium",
        "La synchronisation et le partage nécessitent un abonnement premium."
      );
      return;
    }

    if (!isPremium()) {
      Alert.alert(
        "Fonctionnalité premium",
        "La synchronisation et le partage nécessitent un abonnement premium."
      );
      return;
    }

    const password = activeEntry?.seedPhrase;
    const serverUrl = activeEntry?.serverUrl || process.env.EXPO_PUBLIC_SYNC_URL;
    if (!password || !serverUrl) {
      Alert.alert(
        "Synchronisation impossible",
        "Aucun serveur ou mot de passe configuré pour ce mariage."
      );
      return;
    }

    // Persist serverUrl if it was missing from the entry
    if (!activeEntry?.serverUrl && activeEntry?.id) {
      useWeddingRegistryStore.getState().updateWedding(activeEntry.id, { serverUrl });
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
    setSyncEnabled(true);
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

  const handleCreateNewWedding = useCallback(() => {
    Alert.alert(
      "Nouveau mariage",
      "Créer un nouveau mariage ? Vous pourrez basculer entre vos mariages à tout moment.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Créer",
          onPress: async () => {
            const passphrase = generatePassphrase();
            await createWedding("Mon mariage", passphrase);
          },
        },
      ]
    );
  }, [createWedding]);

  // App lock
  const [lockEnabled, setLockEnabledState] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);

  useEffect(() => {
    isLockEnabled().then(setLockEnabledState);
  }, []);

  const handleToggleLock = useCallback(() => {
    if (lockEnabled) {
      Alert.alert(
        "Désactiver le verrouillage",
        "L'application ne sera plus protégée par un code PIN.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Désactiver",
            style: "destructive",
            onPress: () => {
              setLockEnabled(false).then(() => setLockEnabledState(false));
            },
          },
        ]
      );
    } else {
      setShowPinSetup(true);
    }
  }, [lockEnabled]);


  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      showsVerticalScrollIndicator={false}
    >
      {/* Wedding info */}
      <View className="px-4 pt-4">
        <SectionTitle>Informations du mariage</SectionTitle>
        <FormCard>
          <InputRow label="Nom du mariage" value={weddingLabel} onChangeText={setWeddingLabel} placeholder="Mon mariage" />
          <InputRow label="Marié(e) 1" value={partner1} onChangeText={setPartner1} placeholder="Prénom + Nom" />
          <InputRow label="Marié(e) 2" value={partner2} onChangeText={setPartner2} placeholder="Prénom + Nom" />
          <InputRow label="Date du mariage" value={weddingDate} onChangeText={setWeddingDate} placeholder="2026-09-12" />
          <InputRow label="Lieu principal" value={venueName} onChangeText={setVenueName} placeholder="Nom du lieu" />
        </FormCard>
      </View>

      {/* Sauvegarde et partage */}
      <View className="px-4">
        <SectionTitle>Sauvegarde et partage</SectionTitle>
        <Text className="text-sm text-gray-500 dark:text-gray-400 leading-5 mb-3 -mt-1">
          {syncEnabled
            ? "Vos données sont sauvegardées de manière chiffrée sur un serveur sécurisé. En cas de perte ou changement d'appareil, vous pourrez les restaurer. Vous pouvez partager le mariage avec votre partenaire via le lien d'invitation ci-dessous."
            : "Vos données sont stockées uniquement sur cet appareil. En cas de suppression de l'app, de vidage du cache navigateur, ou de perte de l'appareil, toutes vos données seront définitivement perdues. Activez la synchronisation pour sauvegarder vos données et partager le mariage avec votre partenaire."}
        </Text>
        <Pressable
          onPress={handleToggleSync}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100 dark:border-gray-800 active:opacity-80"
        >
          <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: syncEnabled ? "#ECFDF5" : "#F3F4F6" }}
          >
            {syncEnabled ? (
              <Cloud size={20} color="#10B981" />
            ) : (
              <CloudOff size={20} color="#9CA3AF" />
            )}
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-medium text-gray-900 dark:text-white">
              {syncEnabled ? "Synchronisation activée" : "Synchronisation désactivée"}
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              {syncEnabled
                ? lastSync
                  ? `Dernière synchro : ${format(new Date(lastSync), "dd/MM/yyyy HH:mm")}`
                  : "Les données sont synchronisées automatiquement"
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
        {activeEntry?.seedPhrase && (
          <Pressable
            onPress={syncEnabled ? handleInvite : undefined}
            className={`bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100 dark:border-gray-800 ${
              syncEnabled ? "active:opacity-80" : "opacity-50"
            }`}
          >
            <View className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center">
              <Share2 size={20} color={syncEnabled ? "#EC4899" : "#9CA3AF"} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-medium text-gray-900 dark:text-white">
                Partager un lien d'invitation
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">
                {syncEnabled
                  ? "Envoyer un lien pour rejoindre ce mariage"
                  : "Activez la synchronisation pour partager"}
              </Text>
            </View>
            <ChevronRight size={18} color="#C0C0C8" />
          </Pressable>
        )}
      </View>

      {/* Mes mariages */}
      <View className="px-4 mt-4">
        <SectionTitle>Mes mariages</SectionTitle>
        {registry?.weddings.map((w) => {
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
                <Heart
                  size={20}
                  color={isActive ? "#EC4899" : "#9CA3AF"}
                  fill={isActive ? "#EC4899" : "transparent"}
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
                <CheckCircle2 size={20} color="#EC4899" />
              )}
            </Pressable>
          );
        })}
        <Pressable
          onPress={handleCreateNewWedding}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2 border border-dashed border-gray-300 dark:border-gray-700 flex-row items-center active:opacity-80"
        >
          <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-gray-50 dark:bg-gray-800">
            <PlusCircle size={20} color="#9CA3AF" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-gray-500 dark:text-gray-400">
              Créer un nouveau mariage
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Security */}
      <View className="px-4 mt-4">
        <SectionTitle>Sécurité</SectionTitle>
        <Pressable
          onPress={handleToggleLock}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2 border border-gray-100 dark:border-gray-800 flex-row items-center active:opacity-80"
        >
          <View className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 items-center justify-center">
            <Lock size={20} color={lockEnabled ? "#EC4899" : "#C0C0C8"} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base text-gray-900 dark:text-white font-medium">
              Verrouillage de l'app
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              {lockEnabled ? "PIN + biométrie activé" : "Désactivé"}
            </Text>
          </View>
          <View
            className="w-12 h-7 rounded-full justify-center px-0.5"
            style={{ backgroundColor: lockEnabled ? "#EC4899" : "#D1D5DB" }}
          >
            <View
              className="w-6 h-6 rounded-full bg-white"
              style={{ alignSelf: lockEnabled ? "flex-end" : "flex-start" }}
            />
          </View>
        </Pressable>
      </View>

      {/* Language */}
      <View className="px-4 mt-4">
        <SectionTitle>{t("language")}</SectionTitle>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setLanguage("fr")}
            className={`flex-1 py-3 rounded-2xl items-center border ${
              language === "fr"
                ? "bg-primary-500 border-primary-500"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            }`}
          >
            <Text className={`text-base font-medium ${language === "fr" ? "text-white" : "text-gray-500"}`}>
              Français
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLanguage("en")}
            className={`flex-1 py-3 rounded-2xl items-center border ${
              language === "en"
                ? "bg-primary-500 border-primary-500"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            }`}
          >
            <Text className={`text-base font-medium ${language === "en" ? "text-white" : "text-gray-500"}`}>
              English
            </Text>
          </Pressable>
        </View>
      </View>

      <PinSetup
        visible={showPinSetup}
        onComplete={() => {
          setShowPinSetup(false);
          setLockEnabledState(true);
        }}
        onCancel={() => setShowPinSetup(false)}
      />

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
              Vos données restent chiffrées, sur votre appareil et nos serveurs.
            </Text>
          </View>
        </View>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}

