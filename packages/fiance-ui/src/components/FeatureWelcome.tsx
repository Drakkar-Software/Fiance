import React from "react";
import { Modal, Platform, StatusBar as RNStatusBar, useWindowDimensions } from "react-native";
import { View, Text, Pressable, ScrollView } from "react-native-css/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { theme as GP } from "../garden-theme";
import { Display } from "./Display";
import { Script } from "./Script";
import { Label } from "./Label";
import { Sprig } from "./Sprig";
import { Underline } from "./Underline";
import { ScriptButton } from "./ScriptButton";
import { SheetScaffold } from "./sheets/SheetScaffold";

export interface FeatureWelcomeBullet {
  icon: LucideIcon;
  text: string;
}

interface FeatureWelcomeProps {
  visible: boolean;
  /** Called on backdrop/close/back — also the fallback for a missing secondary. */
  onDismiss: () => void;
  /** "fullscreen" is an immersive Modal; "sheet" is a bottom SheetScaffold. */
  variant?: "fullscreen" | "sheet";
  /** Leading feature icon (lucide). */
  icon: LucideIcon;
  /** Accent color (Garden Press hex). Drives the hero band + icon tints. */
  accent?: string;
  eyebrow: string;
  title: string;
  tagline: string;
  bullets: FeatureWelcomeBullet[];
  primaryLabel: string;
  onPrimary: () => void;
  /** Optional low-emphasis "Explorer" link. Omit for a single-CTA welcome. */
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Accessibility label for the fullscreen close button. Default "Fermer". */
  closeLabel?: string;
}

/**
 * Generic, reusable first-visit welcome for a feature area. Explains the
 * feature's goal at a glance (icon + title + a few benefit bullets) and offers
 * a primary CTA (typically "start your first action") plus an optional
 * "explore" link. Purely presentational — copy, persistence and navigation are
 * the caller's job. Garden Press styling throughout.
 *
 * CTAs are plain react-native-css Pressables (no @expo/ui native Button), so
 * this component pulls in no `@expo/ui/swift-ui/modifiers` and stays safe in the
 * web bundle.
 */
export function FeatureWelcome({
  visible,
  onDismiss,
  variant = "fullscreen",
  icon: Icon,
  accent = GP.clay,
  eyebrow,
  title,
  tagline,
  bullets,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  closeLabel = "Fermer",
}: FeatureWelcomeProps) {
  const insets = useSafeAreaInsets();
  // Mirrors the home hero (app/(tabs)/home/index.tsx): real inset, with the
  // Android status-bar height as a fallback (insets can read 0 inside a Modal).
  const topInset = insets.top || RNStatusBar.currentHeight || 0;
  const bulletTint = `${accent}1f`; // ~12% alpha soft fill for the icon chips

  // The fullscreen Modal below is a true window-level overlay, so on a wide web
  // viewport it would otherwise blot out DesktopSidebar (apps/mobile/components/
  // DesktopShell.tsx, shown >= 1024px per useIsWideScreen's DESKTOP_BREAKPOINT).
  // Insetting the modal's own content by the sidebar's fixed width (248px, see
  // DesktopSidebar's styles.sidebar) leaves that strip transparent so the
  // sidebar underneath stays visible and usable.
  const { width: winWidth } = useWindowDimensions();
  const isWideDesktop = Platform.OS === "web" && winWidth >= 1024;
  const SIDEBAR_WIDTH = 248;

  const bulletRows = (
    <View className="bg-accent-card rounded-2xl border border-hair overflow-hidden">
      {bullets.map(({ icon: BulletIcon, text }, i) => (
        <View
          key={i}
          className={`flex-row items-center gap-3 px-4 py-3.5${
            i < bullets.length - 1 ? " border-b border-hair" : ""
          }`}
        >
          <View
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: bulletTint }}
          >
            <BulletIcon size={17} color={accent} />
          </View>
          <Text className="flex-1 text-sm font-medium text-ink leading-5">{text}</Text>
        </View>
      ))}
    </View>
  );

  const ctas = (
    <View>
      <Pressable
        onPress={onPrimary}
        className="rounded-2xl py-4 items-center active:opacity-80"
        style={{ backgroundColor: accent }}
      >
        <Text className="text-white font-semibold text-base">{primaryLabel}</Text>
      </Pressable>
      {secondaryLabel && onSecondary ? (
        <ScriptButton onPress={onSecondary} color={accent} size={17} style={{ marginTop: 4 }}>
          {secondaryLabel}
        </ScriptButton>
      ) : null}
    </View>
  );

  // ─── Sheet variant ────────────────────────────────────────────────────────
  if (variant === "sheet") {
    return (
      <SheetScaffold
        visible={visible}
        onDismiss={onDismiss}
        scrollable
        snapPoints={Platform.OS === "ios" ? ["88%"] : undefined}
        footer={ctas}
      >
        <View className="items-center mb-5">
          <View
            className="w-16 h-16 rounded-3xl items-center justify-center mb-3"
            style={{ backgroundColor: bulletTint }}
          >
            <Icon size={30} color={accent} />
          </View>
          <Label>{eyebrow}</Label>
          <View className="items-center mt-1">
            <Display size={24} italic color={GP.ink} style={{ textAlign: "center" }}>
              {title}
            </Display>
            <View className="mt-1">
              <Underline width={90} color={accent} />
            </View>
          </View>
          <Script size={17} color={GP.mute} style={{ textAlign: "center", marginTop: 8 }}>
            {tagline}
          </Script>
        </View>
        {bulletRows}
      </SheetScaffold>
    );
  }

  // ─── Fullscreen variant ───────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View
        className="flex-1 bg-accent-paper"
        style={
          isWideDesktop
            ? { marginLeft: SIDEBAR_WIDTH, borderLeftWidth: 1, borderLeftColor: GP.hair }
            : undefined
        }
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Clay hero band */}
          <View
            className="px-6 pb-8 relative"
            style={{
              backgroundColor: accent,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              paddingTop: topInset + 20,
            }}
          >
            <View style={{ position: "absolute", top: topInset + 10, right: 70, opacity: 0.4 }}>
              <Sprig size={26} color="#fff" angle={18} />
            </View>
            <View style={{ position: "absolute", top: topInset + 4, left: 24, opacity: 0.28 }}>
              <Sprig size={18} color="#fff" angle={-24} />
            </View>

            <Pressable
              onPress={onDismiss}
              className="absolute p-2 rounded-full active:opacity-60"
              style={{ top: topInset, right: 20, backgroundColor: "rgba(255,255,255,0.18)" }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={closeLabel}
            >
              <X size={18} color="#fff" />
            </Pressable>

            <View
              className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
              style={{ backgroundColor: "rgba(255,255,255,0.16)" }}
            >
              <Icon size={38} color="#fff" />
            </View>

            <Label color="rgba(255,255,255,0.75)">{eyebrow}</Label>
            <View className="mt-1">
              <Display size={32} italic color="#fff">
                {title}
              </Display>
              <View className="mt-2">
                <Underline width={120} color="rgba(255,255,255,0.85)" strokeWidth={2} />
              </View>
            </View>
            <Script size={19} color="rgba(255,255,255,0.85)" style={{ marginTop: 10 }}>
              {tagline}
            </Script>
          </View>

          {/* Body */}
          <View className="px-6 pt-6 pb-4 flex-1" style={{ width: "100%", maxWidth: 520, alignSelf: "center" }}>
            {bulletRows}
          </View>
        </ScrollView>

        {/* Footer CTAs — pinned outside the ScrollView so the primary action is
            always reachable, whatever the bullet count or screen height. */}
        <View
          className="px-6 pt-3 bg-accent-paper border-t border-hair"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
        >
          <View style={{ width: "100%", maxWidth: 520, alignSelf: "center" }}>{ctas}</View>
        </View>
      </View>
    </Modal>
  );
}
