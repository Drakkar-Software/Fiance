import React, { useState } from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Globe, Menu, X } from "lucide-react-native";

export function MarketingNav() {
  const { t } = useTranslation("marketing");
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleLang() {
    i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");
  }

  const links = [
    { label: t("nav.seatingChart"), href: "/seating-chart" },
    { label: t("nav.budget"), href: "/budget" },
    { label: t("nav.photos"), href: "/photos" },
    { label: t("nav.tools"), href: "/tools/seating-chart" },
  ];

  return (
    <View className="w-full bg-accent-cream border-b border-accent-rose-light">
      <View
        className="flex-row items-center justify-between px-6 py-4"
        style={{ maxWidth: 1100, alignSelf: "center", width: "100%" }}
      >
        {/* Logo */}
        <Pressable onPress={() => router.push("/")} className="active:opacity-70">
          <Text className="text-lg font-bold text-primary-500">WeddingOS</Text>
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
          <Pressable onPress={toggleLang} className="p-2 active:opacity-60">
            <Globe size={16} className="text-typography-500" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/")}
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
          <Pressable
            onPress={() => {
              setMenuOpen(false);
              router.push("/");
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
