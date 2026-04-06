import { useState, useCallback, useEffect, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart, PlusCircle, ArrowLeft } from "lucide-react-native";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";
import { initStarfish, getStarfishStore } from "@/lib/starfish";
import { decodeInviteToken, deriveAuthToken, deriveEncryptionKey } from "@/lib/identity";
import OnboardingScreen from "./onboarding";

async function initAndPull(password: string, weddingId: string, serverUrl: string) {
  const authToken = await deriveAuthToken(password);
  const encryptionKey = await deriveEncryptionKey(password, weddingId);
  initStarfish({
    serverUrl,
    authToken,
    userId: authToken.slice(0, 16),
    encryptionKey,
  });
  const sf = getStarfishStore();
  sf?.getState().pull();
}

function useJoinAndNavigate() {
  const router = useRouter();
  const registry = useWeddingRegistryStore((s) => s.registry);
  const createWedding = useWeddingRegistryStore((s) => s.createWedding);
  const switchWedding = useWeddingRegistryStore((s) => s.switchWedding);

  return useCallback(
    async (label: string, password: string) => {
      let entry: WeddingRegistryEntry | undefined;
      const existing = registry?.weddings.find(
        (w) => w.seedPhrase === password,
      );
      if (existing) {
        await switchWedding(existing.id);
        entry = existing;
      } else {
        entry = await createWedding(label, password);
      }
      const serverUrl = entry?.serverUrl || process.env.EXPO_PUBLIC_SYNC_URL;
      if (serverUrl && entry) {
        try {
          await initAndPull(password, entry.id, serverUrl);
        } catch {
          // Sync failure shouldn't block the join — data will sync later
        }
      }
      router.replace("/");
    },
    [registry, createWedding, switchWedding, router],
  );
}

export default function JoinScreen() {
  const { t } = useLocalSearchParams<{ t?: string }>();

  const invite = useMemo(() => decodeInviteToken(t), [t]);

  const name = invite?.name;
  const password = invite?.password;

  const registry = useWeddingRegistryStore((s) => s.registry);
  const alreadyJoined = registry?.weddings.some((w) => w.seedPhrase === password);
  const hasWeddings = registry != null && registry.weddings.length > 0;
  const [confirmed, setConfirmed] = useState(false);
  const joinAndNavigate = useJoinAndNavigate();

  // Already joined this wedding — switch to it and go home
  if (alreadyJoined) {
    return <AlreadyJoinedRedirect password={password!} />;
  }

  if (hasWeddings && !confirmed) {
    return <ConfirmJoin weddingName={name} onConfirm={() => setConfirmed(true)} />;
  }

  return (
    <OnboardingScreen
      inviteName={name}
      invitePassword={password}
      onJoinOverride={joinAndNavigate}
    />
  );
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

function ConfirmJoin({
  weddingName,
  onConfirm,
}: {
  weddingName?: string;
  onConfirm: () => void;
}) {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950 justify-center px-6">
      <View className="items-center mb-10">
        <View className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900 items-center justify-center mb-5">
          <Heart size={36} color="#EC4899" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          Nouveau mariage
        </Text>
        <Text className="text-base text-gray-400 mt-2 text-center">
          Vous avez déjà un mariage enregistré.{"\n"}
          Souhaitez-vous en rejoindre un nouveau{weddingName ? ` (${weddingName})` : ""} ?
        </Text>
      </View>

      <Pressable
        onPress={onConfirm}
        className="bg-primary-500 rounded-2xl py-4 items-center mb-3 active:bg-primary-600"
      >
        <View className="flex-row items-center">
          <PlusCircle size={20} color="#fff" />
          <Text className="text-white font-semibold text-base ml-2">
            Oui, rejoindre
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => router.replace("/")}
        className="bg-white dark:bg-gray-900 rounded-2xl py-4 items-center border border-gray-200 dark:border-gray-700 active:opacity-80"
      >
        <View className="flex-row items-center">
          <ArrowLeft size={20} color="#EC4899" />
          <Text className="text-gray-900 dark:text-white font-semibold text-base ml-2">
            Non, revenir à l'accueil
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
