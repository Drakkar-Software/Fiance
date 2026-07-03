import React, { useState, useRef } from "react";
import { Modal, Dimensions, Image } from "react-native";
import { View, Text, Pressable } from "react-native-css/components";
import { usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import { Globe, Menu, X } from "lucide-react-native";
import { MarketingLink } from "@/components/marketing/MarketingLink";
import { localizedPath, swapLocaleInPath, type MarketingLang } from "@/lib/seo-urls";

const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
] as const;

interface MarketingNavProps {
  /** Whether the page has scrolled past the fold — swaps the transparent bar for a
   *  frosted, bordered one. Passed down from the ScrollView in `[lang]/_layout.tsx`
   *  since the nav sits outside it and can't read window scroll on its own. */
  scrolled?: boolean;
}

export function MarketingNav({ scrolled = false }: MarketingNavProps) {
  const { t, i18n } = useTranslation("marketing");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const currentLang: MarketingLang = i18n.language === "en" ? "en" : "fr";
  const langButtonRef = useRef<any>(null);

  const links = [
    { label: t("nav.seatingChart"), href: localizedPath(currentLang, "/feature/seating-chart") },
    { label: t("nav.budget"), href: localizedPath(currentLang, "/feature/budget") },
    { label: t("nav.photos"), href: localizedPath(currentLang, "/feature/photos") },
    { label: t("nav.toolsTimeline"), href: localizedPath(currentLang, "/tools/timeline") },
    { label: t("nav.blog"), href: localizedPath(currentLang, "/blog") },
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  function handleLangPress() {
    if (langOpen) {
      setLangOpen(false);
      return;
    }
    if (langButtonRef.current) {
      langButtonRef.current.measureInWindow((x: number, y: number, w: number, h: number) => {
        const screenWidth = typeof window !== "undefined" ? window.innerWidth : Dimensions.get("window").width;
        setDropdownPos({ top: y + h + 4, right: screenWidth - x - w });
        setLangOpen(true);
      });
    } else {
      setLangOpen(true);
    }
  }

  return (
    <View
      style={
        {
          width: "100%",
          backgroundColor: scrolled ? "rgba(247,242,232,0.92)" : "rgba(242,236,224,0.4)",
          borderBottomWidth: 1,
          borderBottomColor: scrolled ? "rgba(42,36,24,0.1)" : "rgba(42,36,24,0)",
          transitionProperty: "background-color, border-color, box-shadow",
          transitionDuration: "0.3s",
          ...(scrolled
            ? { shadowColor: "#2a2418", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 3 }
            : null),
        } as any
      }
    >
      <View
        className="flex-row items-center justify-between px-6 py-4"
        style={{ maxWidth: 1100, alignSelf: "center", width: "100%" }}
      >
        {/* Logo */}
        <MarketingLink
          href={localizedPath(currentLang, "/") as any}
          title={t("nav.homeTitle")}
          className="flex flex-row items-center gap-2 active:opacity-70"
        >
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require("@/assets/logo.png")}
            style={{ width: 28, height: 28, borderRadius: 7 }}
            resizeMode="cover"
            accessibilityLabel={t("nav.logoAlt")}
            alt={t("nav.logoAlt")}
          />
          <Text className="text-lg font-bold text-primary-500">Fiancé</Text>
        </MarketingLink>

        {/* Desktop nav links */}
        <View className="hidden md:flex flex-row items-center gap-1">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <MarketingLink
                key={link.href}
                href={link.href as any}
                title={link.label}
                className={`px-3.5 py-2 rounded-full active:opacity-60 ${active ? "bg-accent-blush" : ""}`}
              >
                <Text
                  className={
                    active
                      ? "text-sm font-semibold text-primary-500"
                      : "text-sm text-typography-600 hover:text-typography-900"
                  }
                >
                  {link.label}
                </Text>
              </MarketingLink>
            );
          })}
        </View>

        {/* Right side actions */}
        <View className="flex-row items-center gap-3">
          {/* Language button */}
          <Pressable
            ref={langButtonRef}
            onPress={handleLangPress}
            className="flex-row items-center gap-1 p-2 active:opacity-60"
            accessibilityLabel={t("nav.language")}
          >
            <Globe size={16} className="text-typography-500" />
            <Text className="text-xs font-semibold text-typography-500 uppercase">{currentLang}</Text>
          </Pressable>

          <MarketingLink
            href="/home"
            title={t("nav.openApp")}
            className="hidden md:flex bg-primary-500 px-4 py-2 rounded-full active:opacity-70"
          >
            <Text className="text-sm font-semibold text-white">{t("nav.openApp")}</Text>
          </MarketingLink>

          {/* Mobile hamburger */}
          <Pressable
            onPress={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 active:opacity-60"
            accessibilityLabel={menuOpen ? t("nav.menuClose") : t("nav.menuOpen")}
          >
            {menuOpen ? (
              <X size={20} className="text-typography-700" />
            ) : (
              <Menu size={20} className="text-typography-700" />
            )}
          </Pressable>
        </View>
      </View>

      {/* Language dropdown */}
      <Modal
        visible={langOpen}
        transparent
        animationType="none"
        onRequestClose={() => setLangOpen(false)}
      >
        <Pressable
          onPress={() => setLangOpen(false)}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
        {dropdownPos && (
          <View
            className="bg-white border border-accent-rose-light rounded-xl py-1 shadow-sm"
            style={{
              position: "absolute",
              top: dropdownPos.top,
              right: dropdownPos.right,
              minWidth: 120,
            }}
          >
            {LANGUAGES.map((lang) => (
              <MarketingLink
                key={lang.code}
                href={swapLocaleInPath(pathname, lang.code) as any}
                hrefLang={lang.code}
                title={lang.label}
                onPress={() => setLangOpen(false)}
                className="px-4 py-2.5 active:opacity-60"
              >
                <Text
                  className={`text-sm ${
                    currentLang === lang.code
                      ? "font-semibold text-primary-500"
                      : "text-typography-600"
                  }`}
                >
                  {lang.label}
                </Text>
              </MarketingLink>
            ))}
          </View>
        )}
      </Modal>

      {/* Mobile menu */}
      {menuOpen && (
        <View className="md:hidden border-t border-accent-rose-light px-6 py-4 gap-4">
          {links.map((link) => (
            <MarketingLink
              key={link.href}
              href={link.href as any}
              title={link.label}
              onPress={() => setMenuOpen(false)}
              className="py-2 active:opacity-60"
            >
              <Text className="text-base text-typography-700">{link.label}</Text>
            </MarketingLink>
          ))}
          <View className="flex-row gap-2">
            {LANGUAGES.map((lang) => (
              <MarketingLink
                key={lang.code}
                href={swapLocaleInPath(pathname, lang.code) as any}
                hrefLang={lang.code}
                title={lang.label}
                onPress={() => setMenuOpen(false)}
                className={`flex-1 py-2.5 rounded-xl items-center border active:opacity-70 ${
                  currentLang === lang.code
                    ? "bg-primary-500 border-primary-500"
                    : "bg-white border-accent-rose-light"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    currentLang === lang.code ? "text-white" : "text-typography-600"
                  }`}
                >
                  {lang.label}
                </Text>
              </MarketingLink>
            ))}
          </View>
          <MarketingLink
            href="/home"
            title={t("nav.openApp")}
            onPress={() => setMenuOpen(false)}
            className="bg-primary-500 px-4 py-3 rounded-full items-center active:opacity-70"
          >
            <Text className="text-sm font-semibold text-white">{t("nav.openApp")}</Text>
          </MarketingLink>
        </View>
      )}
    </View>
  );
}
