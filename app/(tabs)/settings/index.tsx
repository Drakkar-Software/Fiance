import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
import { ConfirmSheet } from "@/components/ConfirmSheet";

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
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

      {/* Sync placeholder */}
      <View className="px-4">
        <SectionTitle>Synchronisation</SectionTitle>
        <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-3 shadow-sm">
          <View className="flex-row items-center">
            <Ionicons name="cloud-outline" size={24} color="#9CA3AF" />
            <View className="ml-3">
              <Text className="text-base text-gray-900 dark:text-white">
                Sauvegarde cloud
              </Text>
              <Text className="text-sm text-gray-500">
                iCloud (iOS) · Google Drive (Android/Web)
              </Text>
            </View>
          </View>
        </View>
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
            Toutes vos données restent sur votre appareil.
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
