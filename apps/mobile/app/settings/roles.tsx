import React, { useCallback, useState } from "react";
import { ScrollView, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react-native";
import {
  FEATURE_SURFACES,
  roleCanWrite,
  type FeatureSurface,
  type PermissionAction,
  type PermissionMatrix,
  type RoleDefinition,
} from "@fiance/sdk";
import { usePermissionsStore } from "@/store/usePermissionsStore";
import { Display } from "@/components/Display";
import { Label } from "@/components/Label";
import { Chip } from "@/components/Chip";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { RenameSheet } from "@/components/RenameSheet";
import { theme } from "@/lib/theme";

type Level = "none" | PermissionAction;
const LEVELS: Level[] = ["none", "view", "edit"];

/** Seal-style monogram — olive for built-in roles, clay for custom ones (a built-in vs custom signal). */
function Monogram({ label, tone }: { label: string; tone: string }) {
  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: `${tone}1f`,
        borderWidth: 1.5,
        borderColor: `${tone}55`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Display size={19} weight="500" color={tone}>
        {(label.trim()[0] ?? "?").toUpperCase()}
      </Display>
    </View>
  );
}

export default function RolesScreen() {
  const { t } = useTranslation("settings");
  const roles = usePermissionsStore((s) => s.roles);
  const assignments = usePermissionsStore((s) => s.assignments);
  const addRole = usePermissionsStore((s) => s.addRole);
  const updateRole = usePermissionsStore((s) => s.updateRole);
  const removeRole = usePermissionsStore((s) => s.removeRole);
  const removeAssignment = usePermissionsStore((s) => s.removeAssignment);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [removeAssignmentId, setRemoveAssignmentId] = useState<string | null>(null);

  const roleLabel = useCallback(
    (r: RoleDefinition) => (r.isSystem ? t(r.name) : r.name),
    [t],
  );
  const surfaceLabel = useCallback(
    (s: FeatureSurface) => t(`surface${s.charAt(0).toUpperCase()}${s.slice(1)}`),
    [t],
  );
  const roleTone = (r: RoleDefinition) => (r.isSystem ? theme.olive : theme.clay);

  const roleSummary = useCallback(
    (r: RoleDefinition) => {
      const granted = FEATURE_SURFACES.filter((s) => r.matrix[s]);
      if (granted.length === 0) return t("roleNoAccessSummary");
      if (granted.length === FEATURE_SURFACES.length && granted.every((s) => r.matrix[s] === "edit")) {
        return t("roleFullAccess");
      }
      return granted.map(surfaceLabel).join(" · ");
    },
    [t, surfaceLabel],
  );

  const setSurfaceLevel = (role: RoleDefinition, surface: FeatureSurface, level: Level) => {
    const matrix: PermissionMatrix = { ...role.matrix };
    if (level === "none") delete matrix[surface];
    else matrix[surface] = level;
    // Derive the tier: any edit grant ⇒ writable (cosmetic); all-view ⇒ server read-only.
    const hasEdit = Object.values(matrix).some((a) => a === "edit");
    updateRole(role.id, { matrix, tier: hasEdit ? "app-cosmetic" : "app-readonly" });
  };

  const createRole = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    const id = Crypto.randomUUID();
    addRole({ id, name: trimmed, isSystem: false, tier: "app-readonly", matrix: {}, createdAt: now, updatedAt: now });
    setEditingId(id);
  };

  const editingRole = roles.find((r) => r.id === editingId) ?? null;

  // ─── Role editor ────────────────────────────────────────────────────────────
  if (editingRole) {
    const readOnly = editingRole.isSystem;
    const tone = roleTone(editingRole);
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.paper }}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        <Pressable
          onPress={() => setEditingId(null)}
          hitSlop={8}
          style={{ flexDirection: "row", alignItems: "center", gap: 2, marginBottom: 16 }}
        >
          <ChevronLeft size={18} color={theme.mute} />
          <Label color={theme.mute}>{t("rolesSectionTitle")}</Label>
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <Monogram label={roleLabel(editingRole)} tone={tone} />
          <View style={{ flex: 1 }}>
            <Display size={24} weight="500" color={theme.ink} numberOfLines={1}>
              {roleLabel(editingRole)}
            </Display>
            <Chip color={roleCanWrite(editingRole) ? theme.clay : theme.olive} style={{ marginTop: 4 }}>
              <Label color={roleCanWrite(editingRole) ? theme.clay : theme.olive}>
                {roleCanWrite(editingRole) ? t("roleCanEditHint") : t("roleReadOnlyHint")}
              </Label>
            </Chip>
          </View>
        </View>

        <View
          style={{
            backgroundColor: `${theme.mustard}14`,
            borderRadius: 14,
            padding: 12,
            marginTop: 12,
            marginBottom: 20,
          }}
        >
          <Display size={12.5} color={theme.mute} style={{ lineHeight: 18 }}>
            {t("roleEnforcementNote")}
          </Display>
        </View>

        {FEATURE_SURFACES.map((surface) => {
          const current: Level = editingRole.matrix[surface] ?? "none";
          return (
            <View
              key={surface}
              style={{
                backgroundColor: theme.card,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: theme.hair,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <Display size={15.5} weight="500" color={theme.ink} style={{ marginBottom: 12 }}>
                {surfaceLabel(surface)}
              </Display>
              <View style={{ flexDirection: "row", backgroundColor: theme.paper, borderRadius: 12, padding: 3, gap: 3 }}>
                {LEVELS.map((lvl) => {
                  const active = current === lvl;
                  return (
                    <Pressable
                      key={lvl}
                      disabled={readOnly}
                      onPress={() => setSurfaceLevel(editingRole, surface, lvl)}
                      style={{
                        flex: 1,
                        paddingVertical: 9,
                        borderRadius: 10,
                        alignItems: "center",
                        backgroundColor: active ? tone : "transparent",
                        opacity: readOnly && !active ? 0.35 : 1,
                      }}
                    >
                      <Label size={11} color={active ? "#ffffff" : theme.ink}>
                        {lvl === "none" ? t("roleNoAccess") : lvl === "view" ? t("roleCanView") : t("roleCanEditLabel")}
                      </Label>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        {!editingRole.isSystem && (
          <Pressable
            onPress={() => setDeleteRoleId(editingRole.id)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 12,
              paddingVertical: 14,
              borderRadius: 14,
              backgroundColor: `${theme.clay}12`,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Trash2 size={17} color={theme.clay} />
            <Label size={12} color={theme.clay}>{t("deleteRole")}</Label>
          </Pressable>
        )}

        <ConfirmSheet
          visible={!!deleteRoleId}
          title={t("deleteRoleTitle")}
          message={t("deleteRoleMsg", { name: roleLabel(editingRole) })}
          confirmLabel={t("delete")}
          destructive
          onConfirm={() => {
            if (deleteRoleId) removeRole(deleteRoleId);
            setDeleteRoleId(null);
            setEditingId(null);
          }}
          onCancel={() => setDeleteRoleId(null)}
        />
      </ScrollView>
    );
  }

  // ─── Role + collaborator list ─────────────────────────────────────────────
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.paper }}
      contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
    >
      <Label color={theme.clay} style={{ marginBottom: 6 }}>{t("rolesSectionTitle")}</Label>
      <Display size={13} color={theme.mute} style={{ lineHeight: 19, marginBottom: 16 }}>
        {t("rolesSectionDesc")}
      </Display>

      <View style={{ gap: 10 }}>
        {roles.map((r) => {
          const tone = roleTone(r);
          const editable = roleCanWrite(r);
          return (
            <Pressable
              key={r.id}
              onPress={() => setEditingId(r.id)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                backgroundColor: theme.card,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: theme.hair,
                paddingHorizontal: 14,
                paddingVertical: 14,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Monogram label={roleLabel(r)} tone={tone} />
              <View style={{ flex: 1 }}>
                <Display size={17} weight="500" color={theme.ink} numberOfLines={1}>
                  {roleLabel(r)}
                </Display>
                <Display size={12.5} color={theme.mute} numberOfLines={1} style={{ marginTop: 1 }}>
                  {roleSummary(r)}
                </Display>
              </View>
              <Chip color={editable ? theme.clay : theme.olive}>
                <Label color={editable ? theme.clay : theme.olive}>
                  {editable ? t("roleCanEditLabel") : t("roleCanView")}
                </Label>
              </Chip>
              <ChevronRight size={17} color={theme.hairStrong ?? theme.mute} />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => setShowCreate(true)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginTop: 14,
          paddingVertical: 15,
          borderRadius: 16,
          backgroundColor: theme.clay,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Plus size={18} color="#ffffff" />
        <Label size={12} color="#ffffff">{t("createRole")}</Label>
      </Pressable>

      <View style={{ height: 28 }} />
      <Label color={theme.clay} style={{ marginBottom: 10 }}>{t("collaboratorsSectionTitle")}</Label>
      {assignments.length === 0 ? (
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.hair,
            padding: 18,
            alignItems: "center",
          }}
        >
          <Display size={13.5} color={theme.mute} style={{ textAlign: "center", lineHeight: 19 }}>
            {t("noCollaborators")}
          </Display>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {assignments.map((a) => {
            const role = roles.find((r) => r.id === a.roleId);
            const name = a.label ?? (role ? roleLabel(role) : t("unknownRole"));
            return (
              <View
                key={a.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  backgroundColor: theme.card,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: theme.hair,
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                }}
              >
                <Monogram label={name} tone={theme.mustard} />
                <View style={{ flex: 1 }}>
                  <Display size={16} weight="500" color={theme.ink} numberOfLines={1}>
                    {name}
                  </Display>
                  <Display size={12.5} color={theme.mute} numberOfLines={1} style={{ marginTop: 1 }}>
                    {role ? roleLabel(role) : t("unknownRole")}
                  </Display>
                </View>
                <Pressable onPress={() => setRemoveAssignmentId(a.id)} hitSlop={8}>
                  <Trash2 size={17} color={theme.clay} />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      <RenameSheet
        visible={showCreate}
        title={t("createRole")}
        initialValue=""
        placeholder={t("roleNamePlaceholder")}
        onConfirm={(value) => {
          setShowCreate(false);
          createRole(value);
        }}
        onCancel={() => setShowCreate(false)}
      />

      <ConfirmSheet
        visible={!!removeAssignmentId}
        title={t("removeCollaboratorTitle")}
        message={t("removeCollaboratorMsg")}
        confirmLabel={t("removeCollaborator")}
        destructive
        onConfirm={() => {
          if (removeAssignmentId) removeAssignment(removeAssignmentId);
          setRemoveAssignmentId(null);
        }}
        onCancel={() => setRemoveAssignmentId(null)}
      />
    </ScrollView>
  );
}
