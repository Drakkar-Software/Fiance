import React, { useState, useEffect } from "react";
import { Seo } from "@/components/Seo";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Image } from "react-native-css/components";
import { Alert, Platform, ActivityIndicator } from "react-native";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import { PlusCircle, Link, ArrowLeft, CheckCircle2, ScanLine } from "lucide-react-native";
import { generatePassphrase, parseInviteUrl } from "@/lib/identity";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { QRScannerScreen } from "@/components/QRScannerScreen";
import { analytics } from "@/lib/analytics";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { PageHeader } from "@/components/PageHeader";

type Mode = "choose" | "create" | "join";

export default function OnboardingScreen() {
  const [mode, setMode] = useState<Mode>("choose");
  const [inviteParams, setInviteParams] = useState<{ name: string; password: string } | null>(null);
  const createWedding = useWeddingRegistryStore((s) => s.createWedding);

  // Handle invite deep links
  useEffect(() => {
    function handleUrl({ url }: { url: string }) {
      const params = parseInviteUrl(url);
      if (!params) return;
      setInviteParams(params);
      setMode("join");
    }

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    const sub = Linking.addEventListener("url", handleUrl);
    return () => sub.remove();
  }, []);

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
          analytics.capture("wedding_created", { method: "new" });
          // Navigation to /home is handled by _layout.tsx after DatabaseProvider mounts
        }}
      />
    );
  }

  return (
    <JoinWeddingForm
      onBack={() => setMode("choose")}
      initialName={inviteParams?.name}
      initialPassword={inviteParams?.password}
      onJoin={async (label, password) => {
        await createWedding(label, password);
        analytics.capture("wedding_created", { method: "invite" });
        // Navigation to /home is handled by _layout.tsx after DatabaseProvider mounts
      }}
    />
  );
}

function ChooseMode({ onSelect }: { onSelect: (m: Mode) => void }) {
  const { t } = useTranslation("common");
  return (
    <View className="flex-1 bg-accent-paper justify-center items-center">
      <Seo title="Fiancé" description="" noindex />
      <View style={{ width: "100%", maxWidth: 480, paddingHorizontal: 24 }}>
        <View className="items-center mb-10">
          <Image
            source={require("@/assets/icon.png")}
            style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 20 }}
            resizeMode="contain"
          />
          <Display size={32} italic style={{ textAlign: "center" }}>
            Fiancé
          </Display>
          <Script size={16} color="#9CA3AF" weight="400" style={{ marginTop: 6, textAlign: "center" }}>
            {t("onboarding.tagline")}
          </Script>
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
          className="bg-accent-card rounded-2xl py-4 items-center border border-hair active:opacity-80"
        >
          <View className="flex-row items-center">
            <Link size={20} color="#b96a4a" />
            <Text className="text-ink font-semibold text-base ml-2">
              {t("onboarding.joinWedding")}
            </Text>
          </View>
        </Pressable>
      </View>
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
      className="flex-1 bg-accent-paper"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ justifyContent: "center", flexGrow: 1, alignItems: "center" }}
      >
        <View style={{ width: "100%", maxWidth: 480, paddingHorizontal: 24 }}>
          <Pressable onPress={onBack} className="mb-6">
            <ArrowLeft size={24} color="#9CA3AF" />
          </Pressable>

          <PageHeader
            eyebrow={t("onboarding.createEyebrow")}
            title={t("onboarding.newWedding")}
            tagline={t("onboarding.createTagline")}
            titleSize={28}
            style={{ paddingHorizontal: 0, paddingTop: 0, marginBottom: 8 }}
          />
          <Text className="text-base text-mute mb-8">
            {t("onboarding.autoPassword")}
          </Text>

          <Text className="text-sm font-medium text-mute mb-1.5 ml-1">
            {t("onboarding.weddingNameLabel")}
          </Text>
          <TextInput
            className="bg-accent-card rounded-xl px-4 py-3.5 text-base text-ink border border-hair mb-8"
            placeholder={t("onboarding.weddingNamePlaceholder")}
            placeholderTextColor="#C0C0C8"
            value={label}
            onChangeText={setLabel}
            autoFocus
          />

          <Pressable
            onPress={handleCreate}
            disabled={saving}
            style={{ opacity: saving ? 0.6 : 1 }}
            className="bg-primary-500 rounded-2xl py-4 items-center active:bg-primary-600"
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {saving && <ActivityIndicator size="small" color="#fff" />}
              <Text className="text-white font-semibold text-base">
                {saving ? t("onboarding.creating") : t("create")}
              </Text>
            </View>
          </Pressable>
        </View>
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
  const [password] = useState(initialPassword || "");
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleJoin = async (name: string, pwd: string) => {
    setSaving(true);
    try {
      await onJoin(name.trim(), pwd.trim());
    } catch (e: any) {
      Alert.alert(t("error"), e.message);
      setSaving(false);
    }
  };

  const handleScanned = async (url: string) => {
    setScanning(false);
    const params = parseInviteUrl(url);
    if (!params) {
      Alert.alert(t("error"), t("onboarding.invalidQR"));
      return;
    }
    await handleJoin(params.name, params.password);
  };

  // Deep link path: pre-filled from invite URL
  if (initialPassword) {
    return (
      <KeyboardAvoidingView
        className="flex-1 bg-accent-paper"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ justifyContent: "center", flexGrow: 1, alignItems: "center" }}
        >
          <View style={{ width: "100%", maxWidth: 480, paddingHorizontal: 24 }}>
            <Pressable onPress={onBack} className="mb-6">
              <ArrowLeft size={24} color="#9CA3AF" />
            </Pressable>

            <PageHeader
              eyebrow={t("onboarding.joinEyebrow")}
              title={t("onboarding.joinTitle")}
              tagline={t("onboarding.joinTagline")}
              titleSize={28}
              style={{ paddingHorizontal: 0, paddingTop: 0, marginBottom: 8 }}
            />

            <Text className="text-sm font-medium text-mute mb-1.5 ml-1">
              {t("onboarding.weddingNameLabel")}
            </Text>
            <TextInput
              className="bg-accent-card rounded-xl px-4 py-3.5 text-base text-ink border border-hair mb-4"
              placeholder={t("onboarding.weddingNamePlaceholder")}
              placeholderTextColor="#C0C0C8"
              value={label}
              onChangeText={setLabel}
            />

            <View className="flex-row items-center gap-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 rounded-xl px-4 py-3.5 mb-8">
              <CheckCircle2 size={18} color="#10B981" />
              <Text className="text-sm font-medium text-emerald-700 dark:text-emerald-300 flex-1">
                {t("onboarding.inviteReady")}
              </Text>
            </View>

            <Pressable
              onPress={() => handleJoin(label, password)}
              disabled={saving}
              style={{ opacity: saving ? 0.6 : 1 }}
              className="bg-primary-500 rounded-2xl py-4 items-center active:bg-primary-600"
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {saving && <ActivityIndicator size="small" color="#fff" />}
                <Text className="text-white font-semibold text-base">
                  {saving ? t("onboarding.joining") : t("onboarding.join")}
                </Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Manual path: scan QR code
  return (
    <View className="flex-1 bg-accent-paper">
      <Seo title="Fiancé" description="" noindex />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ justifyContent: "center", flexGrow: 1, alignItems: "center" }}
      >
        <View style={{ width: "100%", maxWidth: 480, paddingHorizontal: 24 }}>
          <Pressable onPress={onBack} className="mb-6">
            <ArrowLeft size={24} color="#9CA3AF" />
          </Pressable>

          <Display size={28} italic style={{ marginBottom: 8 }}>
            {t("onboarding.joinTitle")}
          </Display>

          <Pressable
            onPress={() => setScanning(true)}
            disabled={saving}
            style={{ opacity: saving ? 0.6 : 1 }}
            className="bg-primary-500 rounded-2xl py-4 items-center active:bg-primary-600 mb-6"
          >
            <View className="flex-row items-center gap-2">
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <ScanLine size={20} color="#fff" />}
              <Text className="text-white font-semibold text-base">
                {saving ? t("onboarding.joining") : t("onboarding.scanQR")}
              </Text>
            </View>
          </Pressable>

          <View className="bg-primary-50 dark:bg-primary-950 border border-primary-100 dark:border-primary-900 rounded-2xl px-5 py-4">
            <Text className="text-sm text-primary-700 dark:text-primary-300 leading-5">
              {t("onboarding.scanGuide")}
            </Text>
          </View>
        </View>
      </ScrollView>

      {scanning && (
        <QRScannerScreen
          onScanned={handleScanned}
          onClose={() => setScanning(false)}
        />
      )}
    </View>
  );
}
