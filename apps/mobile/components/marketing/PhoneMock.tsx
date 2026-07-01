import React, { useEffect } from "react";
import { Platform } from "react-native";
import { View, Text } from "react-native-css/components";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { Signal, Wifi, BatteryFull, House, Wallet, Users, LayoutGrid } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/components/Avatar";
import { Script } from "@/components/Script";
import { Display } from "@/components/Display";
import { formatMoney } from "@/components/MoneyDisplay";
import { theme as GP } from "@/lib/theme";
import { ConicRing } from "@/components/marketing/ConicRing";
import { useCountUp } from "@/components/marketing/effects";

const BUDGET_SPENT = 8400;
const BUDGET_MAX = 12000;
const BUDGET_PCT = Math.round((BUDGET_SPENT / BUDGET_MAX) * 100);
const PLANNING_PCT = 67;

const TABS = [
  { key: "home", icon: House },
  { key: "budget", icon: Wallet },
  { key: "guests", icon: Users },
  { key: "plan", icon: LayoutGrid },
] as const;

/** Hero device mock — the "app peek" that replaced the static vignette card.
 *  Floats gently on every platform (Reanimated); tilts toward the cursor on web only. */
export function PhoneMock() {
  const { t } = useTranslation("marketing");
  const spent = useCountUp(BUDGET_SPENT);
  const barWidth = useSharedValue(0);
  const float = useSharedValue(0);
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);

  useEffect(() => {
    barWidth.value = withDelay(250, withTiming(BUDGET_PCT, { duration: 1400, easing: Easing.out(Easing.cubic) }));
    float.value = withRepeat(
      withSequence(
        withTiming(-14, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [barWidth, float]);

  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));
  const tiltStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${tiltX.value}deg` }, { rotateX: `${tiltY.value}deg` }],
  }));
  const barStyle = useAnimatedStyle(() => ({ width: `${barWidth.value}%` }));

  // Web-only mouse parallax — cast to `any` since onMouseMove/onMouseLeave are
  // DOM events react-native-web forwards, not part of the RN View prop types.
  const sceneHandlers: any =
    Platform.OS === "web"
      ? {
          onMouseMove: (e: any) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const cx = (e.clientX - rect.left - rect.width / 2) / rect.width;
            const cy = (e.clientY - rect.top - rect.height / 2) / rect.height;
            tiltX.value = withTiming(cx * 5, { duration: 250 });
            tiltY.value = withTiming(-cy * 5, { duration: 250 });
          },
          onMouseLeave: () => {
            tiltX.value = withTiming(0, { duration: 300 });
            tiltY.value = withTiming(0, { duration: 300 });
          },
        }
      : {};

  return (
    <View {...sceneHandlers} style={{ width: "100%", maxWidth: 300, alignItems: "center" }}>
      <Animated.View style={floatStyle}>
        <Animated.View
          style={[
            tiltStyle,
            {
              width: 260,
              borderRadius: 48,
              padding: 11,
              backgroundColor: "#201a12",
              shadowColor: GP.ink,
              shadowOffset: { width: 0, height: 40 },
              shadowOpacity: 0.4,
              shadowRadius: 60,
              elevation: 14,
            },
          ]}
        >
          <View style={{ backgroundColor: GP.card, borderRadius: 38, overflow: "hidden" }}>
            {/* Notch */}
            <View
              style={{
                position: "absolute",
                top: 11,
                left: "50%",
                marginLeft: -40,
                width: 80,
                height: 22,
                borderRadius: 999,
                backgroundColor: "#141009",
                zIndex: 4,
              }}
            />
            {/* Status bar */}
            <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 20, paddingTop: 13, paddingBottom: 4 }}>
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 11.5, color: GP.ink }}>9:41</Text>
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Signal size={12} color={GP.ink} />
                <Wifi size={12} color={GP.ink} />
                <BatteryFull size={14} color={GP.ink} />
              </View>
            </View>

            {/* Dashboard */}
            <View style={{ padding: 14, paddingTop: 8, gap: 10 }}>
              <View className="flex-row items-start justify-between">
                <View>
                  <Script size={13} style={{ marginBottom: 1 }} color={GP.mute}>
                    {t("landing.hero.phone.eyebrow")}
                  </Script>
                  <Display size={19} weight="600">
                    {t("landing.features.publicPage.peek.coupleNames")}
                  </Display>
                </View>
                <View style={{ backgroundColor: GP.claySoft, borderRadius: 11, paddingHorizontal: 9, paddingVertical: 5, alignItems: "center" }}>
                  <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 15, color: GP.clay, lineHeight: 15 }}>
                    {t("landing.hero.phone.countdown")}
                  </Text>
                  <Text style={{ fontSize: 8, color: "#b08468", letterSpacing: 0.5, marginTop: 1 }}>
                    {t("landing.hero.phone.date")}
                  </Text>
                </View>
              </View>

              {/* Budget card */}
              <View style={{ backgroundColor: "#f6ecdf", borderRadius: 16, padding: 14 }}>
                <View className="flex-row items-center justify-between" style={{ marginBottom: 7 }}>
                  <Text style={{ fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", color: GP.mustard }}>
                    {t("landing.hero.peek.budgetLabel")}
                  </Text>
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10, color: GP.mute }}>{BUDGET_PCT}%</Text>
                </View>
                <View className="flex-row items-baseline" style={{ gap: 5, marginBottom: 9 }}>
                  <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 25, color: GP.ink, lineHeight: 25 }}>
                    {formatMoney(spent)}
                  </Text>
                  <Text style={{ fontFamily: "Inter_500Medium", fontSize: 11, color: GP.mute }}>/ {formatMoney(BUDGET_MAX)}</Text>
                </View>
                <View style={{ height: 6, borderRadius: 4, backgroundColor: "rgba(42,36,24,0.08)", overflow: "hidden" }}>
                  <Animated.View style={[barStyle, { height: "100%", borderRadius: 4, backgroundColor: GP.clay }]} />
                </View>
                <Text style={{ fontSize: 10, color: GP.mute, marginTop: 7 }}>
                  {t("landing.hero.peek.budgetRemaining", { amount: formatMoney(BUDGET_MAX - BUDGET_SPENT) })}
                </Text>
              </View>

              {/* Guests + Planning */}
              <View className="flex-row" style={{ gap: 9 }}>
                <View style={{ flex: 1, backgroundColor: "#f7f2e8", borderRadius: 14, padding: 12 }}>
                  <Text style={{ fontFamily: "Inter_700Bold", fontSize: 8.5, letterSpacing: 1.2, textTransform: "uppercase", color: GP.olive, marginBottom: 8 }}>
                    {t("landing.hero.peek.guestsLabel")}
                  </Text>
                  <View className="flex-row" style={{ marginBottom: 8 }}>
                    <Avatar ini="M" tone={GP.claySoft} size={20} />
                    <View style={{ marginLeft: -7 }}>
                      <Avatar ini="J" tone={GP.oliveSoft} size={20} />
                    </View>
                    <View style={{ marginLeft: -7 }}>
                      <Avatar ini="L" tone={GP.mustardSoft} size={20} />
                    </View>
                  </View>
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10.5, color: GP.inkSoft, marginBottom: 5 }}>
                    {t("landing.hero.phone.guestsCount")}
                  </Text>
                  <View className="flex-row items-center" style={{ gap: 5 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: GP.olive }} />
                    <Text style={{ fontSize: 9.5, color: GP.inkSoft }}>{t("landing.hero.peek.rsvp")}</Text>
                  </View>
                </View>
                <View style={{ flex: 1, backgroundColor: "#f7f2e8", borderRadius: 14, padding: 12, alignItems: "center" }}>
                  <Text style={{ fontFamily: "Inter_700Bold", fontSize: 8.5, letterSpacing: 1.2, textTransform: "uppercase", color: GP.blue, marginBottom: 8, alignSelf: "flex-start" }}>
                    {t("landing.hero.phone.planningLabel")}
                  </Text>
                  <View style={{ width: 52, height: 52, alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <ConicRing size={52} strokeWidth={6} segments={[{ percent: PLANNING_PCT, color: GP.blue }]} />
                    <Text style={{ position: "absolute", fontFamily: "Fraunces_600SemiBold", fontSize: 13, color: GP.ink }}>
                      {PLANNING_PCT}%
                    </Text>
                  </View>
                  <Text style={{ fontSize: 9.5, color: GP.mute, marginTop: 8 }}>{t("landing.hero.phone.planningTasks")}</Text>
                </View>
              </View>
            </View>

            {/* Tab bar */}
            <View
              className="flex-row justify-around items-center"
              style={{ paddingHorizontal: 10, paddingTop: 9, paddingBottom: 4, borderTopWidth: 1, borderTopColor: "rgba(42,36,24,0.07)" }}
            >
              {TABS.map((tab, i) => {
                const Icon = tab.icon;
                const active = i === 0;
                const color = active ? GP.clay : GP.mute;
                return (
                  <View key={tab.key} style={{ alignItems: "center", gap: 3 }}>
                    <Icon size={17} color={color} />
                    <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 8, color }}>
                      {t(`landing.hero.phone.tabs.${tab.key}`)}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={{ alignItems: "center", paddingBottom: 8, paddingTop: 3 }}>
              <View style={{ width: 96, height: 4, borderRadius: 2, backgroundColor: GP.ink, opacity: 0.22 }} />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
