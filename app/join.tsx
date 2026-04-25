import { useState, useCallback, useEffect, useMemo } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native-css/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Heart, PlusCircle, ArrowLeft, AlertCircle } from "lucide-react-native";
import { Display } from "@/components/Display";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { decodeInviteToken } from "@/lib/identity";

function useJoinAndNavigate() {
  const router = useRouter();
  const registry = useWeddingRegistryStore((s) => s.registry);
  const createWedding = useWeddingRegistryStore((s) => s.createWedding);
  const switchWedding = useWeddingRegistryStore((s) => s.switchWedding);

  return useCallback(
    async (label: string, password: string, memberId?: string) => {
      const existing = registry?.weddings.find(
        (w) => w.seedPhrase === password,
      );
      if (existing) {
        await switchWedding(existing.id);
      } else {
        await createWedding(label, password, undefined, memberId);
      }
      router.replace("/");
    },
    [registry, createWedding, switchWedding, router],
  );
}

export default function JoinScreen() {
  const { t: token } = useLocalSearchParams<{ t?: string }>();
  const invite = useMemo(() => decodeInviteToken(token), [token]);

  const registry = useWeddingRegistryStore((s) => s.registry);
  const [confirmed, setConfirmed] = useState(false);
  const joinAndNavigate = useJoinAndNavigate();

  // No valid invite token → show error
  if (!invite) {
    return <InvalidInvite />;
  }

  const name = invite.name;
  const password = invite.password;

  const alreadyJoined = registry?.weddings.some((w) => w.seedPhrase === password);
  const hasWeddings = registry != null && registry.weddings.length > 0;

  // Already joined this wedding — switch to it and go home
  if (alreadyJoined) {
    return <AlreadyJoinedRedirect password={password} />;
  }

  if (hasWeddings && !confirmed) {
    return <ConfirmJoin weddingName={name} onConfirm={() => setConfirmed(true)} />;
  }

  return <AutoJoin name={name} password={password} memberId={invite.memberId} onJoin={joinAndNavigate} />;
}

function AlreadyJoinedRedirect({ password }: { password: string }) {
  const router = useRouter();
  const registry = useWeddingRegistryStore((s) => s.registry);
  const switchWedding = useWeddingRegistryStore((s) => s.switchWedding);

  useEffect(() => {
    const existing = registry?.weddings.find((w) => w.seedPhrase === password);
    if (existing) {
      switchWedding(existing.id).then(() => router.replace("/"));
    } else {
      router.replace("/");
    }
  }, [registry, switchWedding, router, password]);

  return null;
}

function AutoJoin({
  name,
  password,
  memberId,
  onJoin,
}: {
  name: string;
  password: string;
  memberId?: string;
  onJoin: (label: string, password: string, memberId?: string) => Promise<void>;
}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onJoin(name, password, memberId); }, []);

  return (
    <View className="flex-1 bg-accent-paper items-center justify-center">
      <ActivityIndicator size="large" color="#b96a4a" />
    </View>
  );
}

function InvalidInvite() {
  const { t } = useTranslation("common");
  const router = useRouter();

  return (
    <View className="flex-1 bg-accent-paper justify-center px-6">
      <View className="items-center mb-10">
        <View className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900 items-center justify-center mb-5">
          <AlertCircle size={36} color="#EF4444" />
        </View>
        <Display size={26} italic style={{ textAlign: "center" }}>
          {t("onboarding.inviteFailed")}
        </Display>
      </View>
      <Pressable
        onPress={() => router.replace("/")}
        className="bg-accent-card rounded-2xl py-4 items-center border border-hair active:opacity-80"
      >
        <View className="flex-row items-center">
          <ArrowLeft size={20} color="#b96a4a" />
          <Text className="text-ink font-semibold text-base ml-2">
            {t("join.noGoBack")}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

function ConfirmJoin({
  weddingName,
  onConfirm,
}: {
  weddingName?: string;
  onConfirm: () => void;
}) {
  const { t } = useTranslation("common");
  const router = useRouter();

  return (
    <View className="flex-1 bg-accent-paper justify-center px-6">
      <View className="items-center mb-10">
        <View className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900 items-center justify-center mb-5">
          <Heart size={36} color="#b96a4a" />
        </View>
        <Display size={26} italic style={{ textAlign: "center" }}>
          {t("join.newWedding")}
        </Display>
        <Text className="text-base text-mute mt-2 text-center">
          {t("join.alreadyHaveWedding")}{"\n"}
          {t("join.confirmJoin", { name: weddingName ? ` (${weddingName})` : "" })}
        </Text>
      </View>

      <Pressable
        onPress={onConfirm}
        className="bg-primary-500 rounded-2xl py-4 items-center mb-3 active:bg-primary-600"
      >
        <View className="flex-row items-center">
          <PlusCircle size={20} color="#fff" />
          <Text className="text-white font-semibold text-base ml-2">
            {t("join.yesJoin")}
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => router.replace("/")}
        className="bg-accent-card rounded-2xl py-4 items-center border border-hair active:opacity-80"
      >
        <View className="flex-row items-center">
          <ArrowLeft size={20} color="#b96a4a" />
          <Text className="text-ink font-semibold text-base ml-2">
            {t("join.noGoBack")}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
