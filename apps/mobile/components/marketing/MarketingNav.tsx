import React, { useState, useRef } from "react";
import { Modal, Dimensions, Image } from "react-native";
import { View, Text, Pressable } from "react-native-css/components";
import { useRouter, usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import { Globe, Menu, X } from "lucide-react-native";
import { localizedPath, swapLocaleInPath, type MarketingLang } from "@/lib/seo-urls";

const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
] as const;

export function MarketingNav() {
  const { t, i18n } = useTranslation("marketing");
  const router = useRouter();
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
    { label: t("nav.tools"), href: localizedPath(currentLang, "/tools/seating-chart") },
    { label: t("nav.blog"), href: localizedPath(currentLang, "/blog") },
  ];

  function switchLanguage(lang: MarketingLang) {
    router.replace(swapLocaleInPath(pathname, lang) as any);
  }

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
    <View className="w-full bg-accent-cream border-b border-accent-rose-light">
      <View
        className="flex-row items-center justify-between px-6 py-4"
        style={{ maxWidth: 1100, alignSelf: "center", width: "100%" }}
      >
        {/* Logo */}
        <Pressable onPress={() => router.push(localizedPath(currentLang, "/") as any)} className="flex-row items-center gap-2 active:opacity-70">
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require("@/assets/logo.png")}
            style={{ width: 28, height: 28, borderRadius: 7 }}
            resizeMode="cover"
            accessible={false}
          />
          <Text className="text-lg font-bold text-primary-500">Fiancé</Text>
        </Pressable>

        {/* Desktop nav links */}
        <View className="hidden md:flex flex-row items-center gap-6">
          {links.map((link) => (
            <Pressable
              key={link.href}
              onPress={() => router.push(link.href as any)}
              className="active:opacity-60"
            >
              <Text className="text-sm text-typography-600 hover:text-typography-900">
                {link.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Right side actions */}
        <View className="flex-row items-center gap-3">
          {/* Language button */}
          <Pressable
            ref={langButtonRef}
            onPress={handleLangPress}
            className="flex-row items-center gap-1 p-2 active:opacity-60"
          >
            <Globe size={16} className="text-typography-500" />
            <Text className="text-xs font-semibold text-typography-500 uppercase">{currentLang}</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/home" as any)}
            className="hidden md:flex bg-primary-500 px-4 py-2 rounded-full active:opacity-70"
          >
            <Text className="text-sm font-semibold text-white">{t("nav.openApp")}</Text>
          </Pressable>

          {/* Mobile hamburger */}
          <Pressable
            onPress={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 active:opacity-60"
          >
            {menuOpen ? (
              <X size={20} className="text-typography-700" />
            ) : (
              <Menu size={20} className="text-typography-700" />
            )}
          </Pressable>
        </View>
      </View>

      {/* Language dropdown — Modal renders via ReactDOM.createPortal on web, escaping all
          overflow/stacking contexts. Position: absolute inside Modal = viewport coordinates. */}
      <Modal
        visible={langOpen}
        transparent
        animationType="none"
        onRequestClose={() => setLangOpen(false)}
      >
        {/* Backdrop — catches outside clicks */}
        <Pressable
          onPress={() => setLangOpen(false)}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
        {/* Dropdown panel */}
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
              <Pressable
                key={lang.code}
                onPress={() => {
                  switchLanguage(lang.code);
                  setLangOpen(false);
                }}
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
              </Pressable>
            ))}
          </View>
        )}
      </Modal>

      {/* Mobile menu */}
      {menuOpen && (
        <View className="md:hidden border-t border-accent-rose-light px-6 py-4 gap-4">
          {links.map((link) => (
            <Pressable
              key={link.href}
              onPress={() => {
                setMenuOpen(false);
                router.push(link.href as any);
              }}
              className="py-2 active:opacity-60"
            >
              <Text className="text-base text-typography-700">{link.label}</Text>
            </Pressable>
          ))}
          {/* Language selector */}
          <View className="flex-row gap-2">
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                onPress={() => switchLanguage(lang.code)}
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
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => {
              setMenuOpen(false);
              router.push("/home" as any);
            }}
            className="bg-primary-500 px-4 py-3 rounded-full items-center active:opacity-70"
          >
            <Text className="text-sm font-semibold text-white">{t("nav.openApp")}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
