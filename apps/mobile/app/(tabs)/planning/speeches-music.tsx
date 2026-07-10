import React, { useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Mic2, Music2, Star, Trash2, Pencil } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { PLAYLIST_MOMENT_LABELS } from "@fiance/sdk";
import type { PlaylistMoment } from "@fiance/sdk";
import { useSpeechesMusicStore } from "@/store/useSpeechesMusicStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useWeddingPartyStore } from "@/store/useWeddingPartyStore";
import { SegmentedControl } from "@/components/SegmentedControl";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { ChipSelect, ToggleRow, FormActions } from "@/components/FormSection";
import { HorizontalChipSelect } from "@/components/HorizontalChipSelect";
import { printDjWitnessPack } from "@/lib/print-dj-pack";
import { analytics } from "@/lib/analytics";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";
import type { PlaylistTrack } from "@/db/schema";

const MOMENTS = Object.keys(PLAYLIST_MOMENT_LABELS) as PlaylistMoment[];

interface TrackForm {
  title: string;
  artist: string;
  moment: PlaylistMoment;
  mustPlay: boolean;
  dayOfItemId: string;
  notes: string;
}

function emptyTrackForm(): TrackForm {
  return { title: "", artist: "", moment: "PARTY", mustPlay: false, dayOfItemId: "", notes: "" };
}

export default function SpeechesMusicScreen() {
  const { t } = useTranslation("planning");
  const canEdit = useCanEditHere();
  const router = useRouter();
  const [tab, setTab] = useState<"speeches" | "music">("speeches");

  const speeches = useSpeechesMusicStore((s) => s.speeches);
  const tracks = useSpeechesMusicStore((s) => s.playlistTracks);
  const addPlaylistTrack = useSpeechesMusicStore((s) => s.addPlaylistTrack);
  const updatePlaylistTrack = useSpeechesMusicStore((s) => s.updatePlaylistTrack);
  const removePlaylistTrack = useSpeechesMusicStore((s) => s.removePlaylistTrack);
  const dayOfItems = usePlanningStore((s) => s.dayOfItems);
  const vendors = useVendorsStore((s) => s.vendors);
  const guests = useGuestsStore((s) => s.guests);
  const roles = useWeddingPartyStore((s) => s.weddingRoles);

  const djVendor = useMemo(() => vendors.find((v) => v.type === "DJ") ?? null, [vendors]);
  const dayOfMap = useMemo(() => new Map(dayOfItems.map((d) => [d.id, d.time])), [dayOfItems]);
  const guestMap = useMemo(
    () => new Map(guests.map((g) => [g.id, `${g.firstName} ${g.lastName}`.trim()])),
    [guests]
  );
  const roleMap = useMemo(() => new Map(roles.map((r) => [r.id, r.name])), [roles]);

  const handleExport = useCallback(async () => {
    const momentLabels = Object.fromEntries(MOMENTS.map((m) => [m, t(PLAYLIST_MOMENT_LABELS[m])]));
    await printDjWitnessPack(speeches, tracks, dayOfItems, djVendor, guests, roles, momentLabels);
    analytics.capture("export_data", { format: "pdf", kind: "dj_pack" });
  }, [speeches, tracks, dayOfItems, djVendor, guests, roles, t]);

  // ─── Music tab: inline add/edit form ──────────────────────────────────────
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TrackForm>(emptyTrackForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setShowAdd(false);
    setEditingId(null);
    setForm(emptyTrackForm());
  };

  const handleSaveTrack = () => {
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    const data: Partial<PlaylistTrack> = {
      title: form.title.trim(),
      artist: form.artist.trim() || null,
      moment: form.moment,
      mustPlay: form.mustPlay,
      dayOfItemId: form.dayOfItemId || null,
      notes: form.notes.trim() || null,
    };
    if (editingId) {
      updatePlaylistTrack(editingId, data);
    } else {
      addPlaylistTrack({
        ...data,
        id: Crypto.randomUUID(),
        sortOrder: tracks.length + 1,
        createdAt: now,
        updatedAt: now,
      } as PlaylistTrack);
      analytics.capture("playlist_track_added");
    }
    resetForm();
  };

  const handleEditTrack = (track: PlaylistTrack) => {
    setEditingId(track.id);
    setShowAdd(false);
    setForm({
      title: track.title,
      artist: track.artist || "",
      moment: track.moment as PlaylistMoment,
      mustPlay: track.mustPlay ?? false,
      dayOfItemId: track.dayOfItemId || "",
      notes: track.notes || "",
    });
  };

  const momentLabelsMap = useMemo(
    () => Object.fromEntries(MOMENTS.map((m) => [m, t(PLAYLIST_MOMENT_LABELS[m])])) as Record<PlaylistMoment, string>,
    [t]
  );

  const tracksByMoment = useMemo(() => {
    const byMoment = new Map<string, PlaylistTrack[]>();
    for (const m of MOMENTS) byMoment.set(m, []);
    for (const track of tracks) {
      const list = byMoment.get(track.moment) ?? [];
      list.push(track);
      byMoment.set(track.moment, list);
    }
    return byMoment;
  }, [tracks]);

  const renderTrackForm = () => (
    <View className="bg-accent-card rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
      <Text className="text-base font-semibold text-ink mb-3">
        {editingId ? t("music.editTrack") : t("music.newTrack")}
      </Text>
      <TextInput
        className="text-base text-ink border-b border-hair pb-2 mb-3"
        placeholder={t("music.titlePlaceholder")}
        placeholderTextColor="#D0D0D8"
        value={form.title}
        onChangeText={(title) => setForm((f) => ({ ...f, title }))}
        editable={canEdit}
      />
      <TextInput
        className="text-base text-ink border-b border-hair pb-2 mb-3"
        placeholder={t("music.artistPlaceholder")}
        placeholderTextColor="#D0D0D8"
        value={form.artist}
        onChangeText={(artist) => setForm((f) => ({ ...f, artist }))}
        editable={canEdit}
      />
      <ChipSelect options={MOMENTS} value={form.moment} onChange={(moment) => setForm((f) => ({ ...f, moment }))} labels={momentLabelsMap} />
      {dayOfItems.length > 0 && (
        <View className="mt-3">
          <Text className="text-xs text-mute mb-1.5 font-medium">{t("music.linkedDayOfItem")}</Text>
          <HorizontalChipSelect
            options={[
              { key: "", label: t("common:none") },
              ...dayOfItems.map((d) => ({ key: d.id, label: `${d.title} · ${d.time}` })),
            ]}
            activeKey={form.dayOfItemId}
            onSelect={(dayOfItemId) => setForm((f) => ({ ...f, dayOfItemId }))}
          />
        </View>
      )}
      <View className="mt-3">
        <ToggleRow label={t("music.mustPlay")} value={form.mustPlay} onToggle={() => setForm((f) => ({ ...f, mustPlay: !f.mustPlay }))} />
      </View>
      <TextInput
        className="text-base text-ink border-b border-hair pb-2 mt-3"
        placeholder={t("music.notesPlaceholder")}
        placeholderTextColor="#D0D0D8"
        value={form.notes}
        onChangeText={(notes) => setForm((f) => ({ ...f, notes }))}
        editable={canEdit}
      />
      <View className="mt-4">
        <FormActions
          saveLabel={editingId ? t("common:save") : t("common:create")}
          cancelLabel={t("common:cancel")}
          onSave={handleSaveTrack}
          onCancel={resetForm}
        />
      </View>
    </View>
  );

  const renderTrackRow = (track: PlaylistTrack) => {
    if (editingId === track.id) return <View key={track.id}>{renderTrackForm()}</View>;
    return (
      <View key={track.id} className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-1.5">
            {track.mustPlay ? <Star size={13} color="#c9922f" fill="#c9922f" /> : null}
            <Text className="text-base font-semibold text-ink flex-1" numberOfLines={1}>
              {track.title}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            {canEdit && (
              <Pressable onPress={() => handleEditTrack(track)} className="w-8 h-8 items-center justify-center">
                <Pencil size={15} color="#9CA3AF" />
              </Pressable>
            )}
            {canEdit && (
              <Pressable onPress={() => setDeleteId(track.id)} className="w-8 h-8 items-center justify-center">
                <Trash2 size={15} color="#EF4444" />
              </Pressable>
            )}
          </View>
        </View>
        {track.artist ? <Text className="text-xs text-mute mt-0.5">{track.artist}</Text> : null}
      </View>
    );
  };

  return (
    <View className="relative flex-1 bg-accent-paper">
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={handleExport} className="mr-2 px-3 py-1.5 rounded-lg active:opacity-60">
              <Text className="text-primary-500 text-sm font-semibold">{t("music.exportPack")}</Text>
            </Pressable>
          ),
        }}
      />
      <SegmentedControl
        segments={[
          { key: "speeches", label: t("speeches.tab") },
          { key: "music", label: t("music.tab") },
        ]}
        activeKey={tab}
        onSelect={(key) => setTab(key as "speeches" | "music")}
      />

      {tab === "speeches" ? (
        speeches.length === 0 ? (
          <EmptyState
            icon={Mic2}
            title={t("speeches.empty")}
            description={t("speeches.emptyDesc")}
            actionLabel={t("speeches.addSpeech")}
            onAction={() => router.push({ pathname: "/(tabs)/planning/speech", params: { id: "new" } })}
          />
        ) : (
          <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
            {[...speeches]
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((speech) => {
                const speaker = speech.guestId ? guestMap.get(speech.guestId) ?? speech.speakerName : speech.speakerName;
                const roleName = speech.roleId ? roleMap.get(speech.roleId) : null;
                const cueTime = speech.dayOfItemId ? dayOfMap.get(speech.dayOfItemId) : null;
                return (
                  <Pressable
                    key={speech.id}
                    onPress={() => router.push({ pathname: "/(tabs)/planning/speech", params: { id: speech.id } })}
                    className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair active:opacity-80"
                  >
                    <Text className="text-base font-semibold text-ink">{speech.title || t("speeches.untitled")}</Text>
                    <Text className="text-xs text-mute mt-0.5">
                      {speaker ? speaker : t("speeches.noSpeaker")}
                      {roleName ? ` · ${roleName}` : ""}
                      {speech.durationMin != null ? ` · ${speech.durationMin} min` : ""}
                      {cueTime ? ` · ${cueTime}` : ""}
                    </Text>
                  </Pressable>
                );
              })}
            <View className="h-24" />
          </ScrollView>
        )
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {djVendor && (
            <View className="bg-accent-card rounded-2xl p-4 mb-4 border border-hair flex-row items-center gap-2">
              <Music2 size={18} color="#b96a4a" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-ink">{djVendor.name}</Text>
                <Text className="text-xs text-mute" numberOfLines={1}>
                  {[djVendor.contactName, djVendor.phone, djVendor.email].filter(Boolean).join(" · ")}
                </Text>
              </View>
            </View>
          )}

          {showAdd && renderTrackForm()}

          {tracks.length === 0 && !showAdd ? (
            <EmptyState
              icon={Music2}
              title={t("music.empty")}
              description={t("music.emptyDesc")}
              actionLabel={t("music.addTrack")}
              onAction={() => setShowAdd(true)}
            />
          ) : (
            MOMENTS.map((moment) => {
              const momentTracks = tracksByMoment.get(moment) ?? [];
              if (momentTracks.length === 0) return null;
              return (
                <View key={moment} className="mb-2">
                  <Text className="text-xs font-semibold text-mute uppercase tracking-wider mt-3 mb-2">
                    {momentLabelsMap[moment]}
                  </Text>
                  {momentTracks.map(renderTrackRow)}
                </View>
              );
            })
          )}
          <View className="h-24" />
        </ScrollView>
      )}

      <FAB
        onPress={() => {
          if (tab === "speeches") {
            router.push({ pathname: "/(tabs)/planning/speech", params: { id: "new" } });
          } else {
            resetForm();
            setShowAdd(true);
          }
        }}
      />

      <ConfirmSheet
        visible={!!deleteId}
        title={t("music.deleteTrack")}
        message={t("music.irreversible")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={() => {
          if (deleteId) removePlaylistTrack(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}

export async function generateStaticParams() { return []; }
