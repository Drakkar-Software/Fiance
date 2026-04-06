import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Heart, PlusCircle, Link, ArrowLeft } from "lucide-react-native";
import { generatePassphrase } from "@/lib/identity";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";

type Mode = "choose" | "create" | "join";

interface OnboardingProps {
  /** Pre-filled from a deep link invite */
  inviteName?: string;
  invitePassword?: string;
  /** Override join handler (e.g. to navigate after creation) */
  onJoinOverride?: (label: string, password: string) => Promise<void>;
}

export default function OnboardingScreen({
  inviteName,
  invitePassword,
  onJoinOverride,
}: OnboardingProps = {}) {
  const [mode, setMode] = useState<Mode>(
    inviteName && invitePassword ? "join" : "choose"
  );
  const createWedding = useWeddingRegistryStore((s) => s.createWedding);

  if (mode === "choose") {
    return <ChooseMode onSelect={setMode} />;
  }

  if (mode === "create") {
    return (
      <CreateWeddingForm
        onBack={() => setMode("choose")}
        onCreate={async (label) => {
          const passphrase = generatePassphrase();
          await createWedding(label, passphrase);
        }}
      />
    );
  }

  return (
    <JoinWeddingForm
      onBack={() => setMode("choose")}
      initialName={inviteName}
      initialPassword={invitePassword}
      onJoin={onJoinOverride ?? (async (label, password) => {
        await createWedding(label, password);
      })}
    />
  );
}

function ChooseMode({ onSelect }: { onSelect: (m: Mode) => void }) {
  const { t } = useTranslation("common");
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950 justify-center px-6">
      <View className="items-center mb-10">
        <View className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900 items-center justify-center mb-5">
          <Heart size={36} color="#EC4899" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          WeddingOS
        </Text>
        <Text className="text-base text-gray-400 mt-2 text-center">
          {t("onboarding.tagline")}
        </Text>
      </View>

      <Pressable
        onPress={() => onSelect("create")}
        className="bg-primary-500 rounded-2xl py-4 items-center mb-3 active:bg-primary-600"
      >
        <View className="flex-row items-center">
          <PlusCircle size={20} color="#fff" />
          <Text className="text-white font-semibold text-base ml-2">
            {t("onboarding.createWedding")}
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => onSelect("join")}
        className="bg-white dark:bg-gray-900 rounded-2xl py-4 items-center border border-gray-200 dark:border-gray-700 active:opacity-80"
      >
        <View className="flex-row items-center">
          <Link size={20} color="#EC4899" />
          <Text className="text-gray-900 dark:text-white font-semibold text-base ml-2">
            {t("onboarding.joinWedding")}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

function CreateWeddingForm({
  onBack,
  onCreate,
}: {
  onBack: () => void;
  onCreate: (label: string) => Promise<void>;
}) {
  const { t } = useTranslation("common");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!label.trim()) {
      Alert.alert(t("error"), t("onboarding.weddingNameRequired"));
      return;
    }
    setSaving(true);
    try {
      await onCreate(label.trim());
    } catch (e: any) {
      Alert.alert(t("error"), e.message);
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}
      >
        <Pressable onPress={onBack} className="mb-6">
          <ArrowLeft size={24} color="#9CA3AF" />
        </Pressable>

        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("onboarding.newWedding")}
        </Text>
        <Text className="text-base text-gray-400 mb-8">
          {t("onboarding.autoPassword")}
        </Text>

        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
          {t("onboarding.weddingNameLabel")}
        </Text>
        <TextInput
          className="bg-white dark:bg-gray-900 rounded-xl px-4 py-3.5 text-base text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 mb-8"
          placeholder={t("onboarding.weddingNamePlaceholder")}
          placeholderTextColor="#C0C0C8"
          value={label}
          onChangeText={setLabel}
          autoFocus
        />

        <Pressable
          onPress={handleCreate}
          disabled={saving}
          className="bg-primary-500 rounded-2xl py-4 items-center active:bg-primary-600"
        >
          <Text className="text-white font-semibold text-base">
            {saving ? t("onboarding.creating") : t("create")}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function JoinWeddingForm({
  onBack,
  onJoin,
  initialName,
  initialPassword,
}: {
  onBack: () => void;
  onJoin: (label: string, password: string) => Promise<void>;
  initialName?: string;
  initialPassword?: string;
}) {
  const { t } = useTranslation("common");
  const [label, setLabel] = useState(initialName || "");
  const [password, setPassword] = useState(initialPassword || "");
  const [saving, setSaving] = useState(false);

  const handleJoin = async () => {
    if (!label.trim()) {
      Alert.alert(t("error"), t("onboarding.nameRequired"));
      return;
    }
    if (!password.trim()) {
      Alert.alert(t("error"), t("onboarding.passwordRequired"));
      return;
    }
    setSaving(true);
    try {
      await onJoin(label.trim(), password.trim());
    } catch (e: any) {
      Alert.alert(t("error"), e.message);
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}
      >
        <Pressable onPress={onBack} className="mb-6">
          <ArrowLeft size={24} color="#9CA3AF" />
        </Pressable>

        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("onboarding.joinTitle")}
        </Text>
        <Text className="text-base text-gray-400 mb-8">
          {t("onboarding.enterPassword")}
        </Text>

        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
          {t("onboarding.weddingNameLabel")}
        </Text>
        <TextInput
          className="bg-white dark:bg-gray-900 rounded-xl px-4 py-3.5 text-base text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 mb-4"
          placeholder={t("onboarding.weddingNamePlaceholder")}
          placeholderTextColor="#C0C0C8"
          value={label}
          onChangeText={setLabel}
        />

        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
          {t("onboarding.password")}
        </Text>
        <TextInput
          className="bg-white dark:bg-gray-900 rounded-xl px-4 py-3.5 text-base text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 mb-8"
          placeholder={t("onboarding.passwordPlaceholder")}
          placeholderTextColor="#C0C0C8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Pressable
          onPress={handleJoin}
          disabled={saving}
          className="bg-primary-500 rounded-2xl py-4 items-center active:bg-primary-600"
        >
          <Text className="text-white font-semibold text-base">
            {saving ? t("onboarding.joining") : t("onboarding.join")}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
