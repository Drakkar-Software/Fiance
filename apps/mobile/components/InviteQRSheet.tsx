import React, { useEffect, useState } from "react";
import { View, Pressable, Text, TextInput, ActivityIndicator, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import * as Clipboard from "expo-clipboard";
import { shareLink } from "@/lib/share";
import { Sheet } from "@fiance/ui/components";
import { AlertCircle, ChevronRight } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import { theme } from "@/lib/theme";
import { Display } from "@/components/Display";
import { Label } from "@/components/Label";
import { Chip } from "@/components/Chip";
import { usePermissionsStore } from "@/store/usePermissionsStore";
import { roleCanWrite, FEATURE_SURFACES, type FeatureSurface, type RoleDefinition } from "@fiance/sdk";

interface InviteQRSheetProps {
  visible: boolean;
  onClose: () => void;
  generate: (roleId?: string, name?: string) => Promise<string>;
}

type State = "selecting" | "generating" | "ready" | "error";

export function InviteQRSheet({ visible, onClose, generate }: InviteQRSheetProps) {
  const { t } = useTranslation("settings");
  const { width } = useWindowDimensions();
  const roles = usePermissionsStore((s) => s.roles);
  const [state, setState] = useState<State>("selecting");
  const [url, setUrl] = useState("");
  const [detail, setDetail] = useState("");
  const [name, setName] = useState("");

  const roleLabel = (r: RoleDefinition) => (r.isSystem ? t(r.name) : r.name);
  const surfaceLabel = (s: FeatureSurface) =>
    t(`surface${s.charAt(0).toUpperCase()}${s.slice(1)}`);
  const roleSummary = (r: RoleDefinition) => {
    const granted = FEATURE_SURFACES.filter((s) => r.matrix[s]);
    if (granted.length === 0) return t("roleNoAccessSummary");
    if (granted.length === FEATURE_SURFACES.length && granted.every((s) => r.matrix[s] === "edit")) {
      return t("roleFullAccess");
    }
    return granted.map(surfaceLabel).join(" · ");
  };

  // Invite payload embeds a signed cap cert + ephemeral keys (~1.4KB URL) —
  // dense at default size/ECL. ecl="L" trims the module count to 125, and
  // sizing up keeps it scannable (real cameras need ~2px/module). Floor of
  // 250 guarantees that ratio even on the smallest phone widths; capped at
  // 320 for large screens/web. See __tests__/invite-qr-density.test.ts.
  const qrSize = Math.max(250, Math.min(320, Math.round(width - 64)));

  // The last-picked role, so the error-state "retry" regenerates the same scope.
  const [roleId, setRoleId] = useState<string | undefined>(undefined);

  const run = (selectedRoleId?: string) => {
    setRoleId(selectedRoleId);
    setState("generating");
    setDetail("");
    generate(selectedRoleId, name.trim() || undefined)
      .then((link) => {
        setUrl(link);
        setState("ready");
      })
      .catch((err: any) => {
        console.error("[invite] link generation failed:", err);
        setDetail(err?.message ?? String(err));
        setState("error");
      });
  };

  useEffect(() => {
    if (visible) {
      setState("selecting");
    } else {
      setState("selecting");
      setUrl("");
      setDetail("");
      setRoleId(undefined);
      setName("");
    }
  }, [visible]);

  const handleShare = async () => {
    await Clipboard.setStringAsync(url);
    await shareLink(url, "", t("linkCopied"));
  };

  return (
    <Sheet visible={visible} onDismiss={onClose} backgroundColor={theme.card}>
      {/* paddingHorizontal: BottomSheet already adds 16px iOS insets; 8px adds a bit more breathing room.
          paddingTop: BottomSheet handles drag indicator + 16px top chrome — no extra top padding needed.
          Web fallback: these insets substitute for the BottomSheet chrome that only exists on native. */}
      <View style={{ backgroundColor: theme.card, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 40 }}>

        {state === "selecting" && (
          <>
            <View style={{ marginBottom: 18 }}>
              <Label color={theme.clay} style={{ marginBottom: 4 }}>{t("rolePickerEyebrow")}</Label>
              <Display size={21} weight="500" color={theme.ink}>
                {t("rolePickerTitle")}
              </Display>
              <Display size={13} color={theme.mute} style={{ marginTop: 3, lineHeight: 18 }}>
                {t("rolePickerSubtitle")}
              </Display>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Label color={theme.mute} style={{ marginBottom: 6 }}>{t("inviteNameLabel")}</Label>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t("inviteNamePlaceholder")}
                placeholderTextColor={theme.mute}
                autoCapitalize="words"
                returnKeyType="done"
                style={{
                  backgroundColor: theme.paper,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.hair,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: theme.ink,
                }}
              />
            </View>

            <View style={{ gap: 10 }}>
              {roles.map((r) => {
                const tone = r.isSystem ? theme.olive : theme.clay;
                const editable = roleCanWrite(r);
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => run(r.id)}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 13,
                      backgroundColor: theme.paper,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: theme.hair,
                      paddingHorizontal: 14,
                      paddingVertical: 13,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: `${tone}1f`,
                        borderWidth: 1.5,
                        borderColor: `${tone}55`,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Display size={18} weight="500" color={tone}>
                        {(roleLabel(r).trim()[0] ?? "?").toUpperCase()}
                      </Display>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Display size={16} weight="500" color={theme.ink} numberOfLines={1}>
                        {roleLabel(r)}
                      </Display>
                      <Display size={12} color={theme.mute} numberOfLines={1} style={{ marginTop: 1 }}>
                        {roleSummary(r)}
                      </Display>
                    </View>
                    <Chip color={editable ? theme.clay : theme.olive}>
                      <Label color={editable ? theme.clay : theme.olive}>
                        {editable ? t("roleCanEditLabel") : t("roleCanView")}
                      </Label>
                    </Chip>
                    <ChevronRight size={17} color={theme.mute} />
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {state === "generating" && (
          <View style={{ alignItems: "center", paddingVertical: 48, gap: 16 }}>
            <ActivityIndicator size="large" color={theme.clay} />
            <Text style={{ fontSize: 14, color: theme.mute, textAlign: "center" }}>
              {t("inviteGenerating")}
            </Text>
          </View>
        )}

        {state === "ready" && (
          <>
            {/* Header row */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.ink, letterSpacing: -0.3 }}>
                {t("shareInviteLink")}
              </Text>
              <Text style={{ fontSize: 13, color: theme.mute, marginTop: 2 }}>
                {t("scanFromOtherDevice")}
              </Text>
            </View>

            {/* QR code card */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{
                backgroundColor: "#ffffff",
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: theme.hair,
              }}>
                <QRCode value={url} size={qrSize} ecl="L" />
              </View>
            </View>

            {/* Share button */}
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => ({
                backgroundColor: theme.clay,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 16 }}>
                {t("shareLink")}
              </Text>
            </Pressable>
          </>
        )}

        {state === "error" && (
          <>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <View style={{
                width: 44, height: 44, borderRadius: 14,
                backgroundColor: "#fef2f2",
                alignItems: "center", justifyContent: "center",
              }}>
                <AlertCircle size={20} color="#EF4444" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.ink, flex: 1 }}>
                {t("inviteErrorTitle")}
              </Text>
            </View>

            <Text style={{ fontSize: 14, color: theme.mute, lineHeight: 20, marginBottom: 16 }}>
              {t("inviteErrorBody")}
            </Text>

            {detail ? (
              <View style={{
                backgroundColor: theme.paper,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginBottom: 24,
                overflow: "hidden",
              }}>
                <Text
                  selectable
                  numberOfLines={4}
                  style={{ fontSize: 11, color: theme.mute, lineHeight: 16 }}
                >
                  {detail}
                </Text>
              </View>
            ) : (
              <View style={{ marginBottom: 24 }} />
            )}

            <Pressable
              onPress={() => run(roleId)}
              style={({ pressed }) => ({
                backgroundColor: theme.clay,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
                marginBottom: 12,
              })}
            >
              <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 16 }}>
                {t("inviteRetry")}
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({ alignItems: "center", paddingVertical: 8, opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={{ fontSize: 14, color: theme.mute }}>
                {t("cancel")}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </Sheet>
  );
}
