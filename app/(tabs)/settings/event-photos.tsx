import React, { useCallback, useMemo } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native-css/components";
import { Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import * as Crypto from "expo-crypto";
import { Camera, Plus, Trash2 } from "lucide-react-native";
import { useWeddingStore } from "@/store/useWeddingStore";
import { PageHeader } from "@/components/PageHeader";

export interface EventPhoto {
  id: string;
  uri: string;
  createdAt: string;
}

const GRID_COLUMNS = 3;
const GRID_GAP = 4;
const screenWidth = Dimensions.get("window").width;
const photoSize = Math.floor((Math.min(screenWidth, 600) - 32 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS);

export default function EventPhotosScreen() {
  const { t } = useTranslation("settings");
  const wedding = useWeddingStore((s) => s.wedding);
  const updateWedding = useWeddingStore((s) => s.updateWedding);

  const photos: EventPhoto[] = useMemo(() => {
    if (!wedding?.eventPhotos) return [];
    try {
      return JSON.parse(wedding.eventPhotos);
    } catch {
      return [];
    }
  }, [wedding?.eventPhotos]);

  const savePhotos = useCallback(
    (items: EventPhoto[]) => {
      updateWedding({ eventPhotos: JSON.stringify(items) });
    },
    [updateWedding]
  );

  const handleAdd = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (result.canceled) return;
    const newPhotos: EventPhoto[] = result.assets.map((asset) => ({
      id: Crypto.randomUUID(),
      uri: asset.uri,
      createdAt: new Date().toISOString(),
    }));
    savePhotos([...photos, ...newPhotos]);
  }, [photos, savePhotos]);

  const handleDelete = useCallback(
    (id: string) => {
      savePhotos(photos.filter((p) => p.id !== id));
    },
    [photos, savePhotos]
  );

  return (
    <ScrollView
      className="flex-1 bg-accent-paper"
      showsVerticalScrollIndicator={false}
    >
      <PageHeader
        eyebrow={t("eventPhotosTitle")}
        title={photos.length}
        tagline={t("photosTagline")}
        titleSize={44}
      />
      <View className="px-4 pt-2">
        <Text className="text-sm text-mute leading-5 mb-3">
          {t("eventPhotosSubtitle")}
        </Text>

        {photos.length === 0 ? (
          <>
            <View className="bg-accent-card rounded-2xl p-8 mb-3 border border-hair items-center">
              <Camera size={40} color="#D1D5DB" />
              <Text className="text-base font-medium text-mute mt-3">
                {t("eventPhotosEmpty")}
              </Text>
              <Text className="text-sm text-mute text-center mt-1 leading-5">
                {t("eventPhotosEmptyDesc")}
              </Text>
            </View>
            <Pressable
              onPress={handleAdd}
              className="bg-accent-card rounded-2xl p-4 mb-3 border border-dashed border-hair dark:border-hair flex-row items-center justify-center active:opacity-80"
            >
              <Plus size={20} color="#9CA3AF" />
              <Text className="text-base font-medium text-mute ml-2">
                {t("eventPhotosAdd")}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <View className="flex-row flex-wrap" style={{ gap: GRID_GAP }}>
              {photos.map((photo) => (
                <View
                  key={photo.id}
                  style={{ width: photoSize, height: photoSize }}
                  className="rounded-xl overflow-hidden"
                >
                  <Image
                    source={{ uri: photo.uri }}
                    style={{ width: photoSize, height: photoSize }}
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => handleDelete(photo.id)}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/50 items-center justify-center active:opacity-70"
                  >
                    <Trash2 size={13} color="#fff" />
                  </Pressable>
                </View>
              ))}
              <Pressable
                onPress={handleAdd}
                style={{ width: photoSize, height: photoSize }}
                className="rounded-xl border border-dashed border-hair dark:border-hair items-center justify-center bg-accent-card active:opacity-70"
              >
                <Plus size={24} color="#9CA3AF" />
              </Pressable>
            </View>
          </>
        )}
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
