import { useState, useCallback, useEffect, useMemo } from "react";
import { Seo } from "@/components/Seo";
import { View, Text, Pressable, ActivityIndicator } from "react-native-css/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Linking from "expo-linking";
import { Heart, PlusCircle, ArrowLeft, AlertCircle } from "lucide-react-native";
import { Display } from "@/components/Display";
import { PageHeader } from "@/components/PageHeader";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { decodeInviteToken, parseInviteUrl } from "@/lib/identity";

// Captured at module-load time — before Expo Router mounts and rewrites web
// history (replaceState strips the fragment). null on native (no window).
const bootHref = typeof window !== "undefined" ? window.location.href : null;

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
      router.replace("/home" as any);
    },
    [registry, createWedding, switchWedding, router],
  );
}

export default function JoinScreen() {
  const { t: queryToken } = useLocalSearchParams<{ t?: string }>();

  // undefined = still resolving; null = resolved but no URL; string = resolved URL
  const [url, setUrl] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    // On web, bootHref is captured before Expo Router rewrites history (strips #fragment).
    // On native, fall back to getInitialURL() which receives the deep-link URL from the OS.
    if (bootHref) setUrl(bootHref);
    else Linking.getInitialURL().then((u) => setUrl(u ?? null));
    const sub = Linking.addEventListener("url", ({ url: incoming }) => setUrl(incoming));
    return () => sub.remove();
  }, []);

  // Payload lives in the URL fragment (#), not a query param — mirrors onboarding.tsx
  const invite = useMemo(
    () => (url ? parseInviteUrl(url) : null) ?? decodeInviteToken(queryToken),
    [url, queryToken],
  );

  const registry = useWeddingRegistryStore((s) => s.registry);
  const [confirmed, setConfirmed] = useState(false);
  const joinAndNavigate = useJoinAndNavigate();

  // Still resolving the initial URL — avoid flashing the error screen
  if (url === undefined && !queryToken) {
    return (
      <View className="flex-1 bg-accent-paper items-center justify-center">
        <ActivityIndicator size="large" color="#b96a4a" />
      </View>
    );
  }

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

  // Always show the confirmation screen before joining — lets the user review
  // the wedding name and decide. First-time users skip the "you already have a
  // wedding" copy; users with existing weddings see the conflict warning too.
  if (!confirmed) {
    return (
      <ConfirmJoin
        weddingName={name}
        hasOtherWeddings={hasWeddings}
        onConfirm={() => setConfirmed(true)}
      />
    );
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
      <Seo title="Fiancé" description="" noindex />
      <View className="items-center mb-10">
        <View className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900 items-center justify-center mb-5">
          <AlertCircle size={36} color="#EF4444" />
        </View>
        <PageHeader
          eyebrow={t("join.eyebrow")}
          title={t("onboarding.inviteFailed")}
          titleSize={24}
          style={{ paddingHorizontal: 0, paddingTop: 0 }}
        />
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
  hasOtherWeddings,
  onConfirm,
}: {
  weddingName?: string;
  hasOtherWeddings: boolean;
  onConfirm: () => void;
}) {
  const { t } = useTranslation("common");
  const router = useRouter();

  return (
    <View className="flex-1 bg-accent-paper justify-center px-6">
      <Seo title="Fiancé" description="" noindex />
      <View className="items-center mb-10">
        <View className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900 items-center justify-center mb-5">
          <Heart size={36} color="#b96a4a" />
        </View>
        <PageHeader
          eyebrow={t("join.inviteEyebrow")}
          title={t("join.joinThisWedding")}
          tagline={weddingName}
          titleSize={26}
          style={{ paddingHorizontal: 0, paddingTop: 0 }}
        />
        {hasOtherWeddings && (
          <Text className="text-base text-mute mt-2 text-center">
            {t("join.alreadyHaveWedding")}{"\n"}
            {t("join.confirmJoin", { name: weddingName ? ` (${weddingName})` : "" })}
          </Text>
        )}
        {!hasOtherWeddings && (
          <Text className="text-base text-mute mt-2 text-center">
            {t("join.joinThisWeddingFirst")}
          </Text>
        )}
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
