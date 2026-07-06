import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { Sprig } from "@/components/Sprig";
import { Seo } from "@/components/Seo";
import { BlogPostCard } from "@/components/marketing/BlogPostCard";
import { MarketingLink } from "@/components/marketing/MarketingLink";
import { FreeToolsStrip } from "@/components/marketing/FreeToolsStrip";
import { getPublishedBlogPosts, buildBlogJsonLd } from "@/lib/blog";
import { localizedSeo, localizedPath } from "@/lib/seo-urls";

export function BlogIndexPage() {
  const { t, i18n } = useTranslation("marketing");
  const lang = i18n.language === "en" ? "en" : "fr";
  const posts = getPublishedBlogPosts(lang);
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const post of posts) {
      if (!seen.has(post.categoryKey)) seen.set(post.categoryKey, post.category);
    }
    return Array.from(seen, ([key, label]) => ({ key, label }));
  }, [posts]);

  const filtered = category === "all" ? posts : posts.filter((p) => p.categoryKey === category);
  const featured = category === "all" ? filtered[0] : null;
  const rest = category === "all" ? filtered.slice(1) : filtered;

  return (
    <View className="w-full">
      <Seo
        title={t("blog.meta.title")}
        description={t("blog.meta.description")}
        ogDescription={t("blog.meta.ogDescription")}
        {...localizedSeo(lang, "/blog")}
        jsonLd={buildBlogJsonLd(posts, lang, t("blog.meta.description"))}
      />

      <View className="w-full py-16 px-6 bg-accent-cream items-center">
        <View style={{ maxWidth: 700, width: "100%", alignItems: "center" }}>
          <Script size={17} style={{ marginBottom: 14 }}>
            {t("blog.hero.eyebrow")}
          </Script>
          <Text
            className="text-xs font-semibold text-primary-500 uppercase tracking-widest text-center"
            style={{ marginBottom: 16 }}
          >
            {t("blog.hero.badge")}
          </Text>
          <Display
            as="h1"
            size={48}
            weight="600"
            style={{ marginBottom: 12, lineHeight: 52, textAlign: "center" }}
          >
            {t("blog.hero.headline")}
          </Display>
          <View style={{ marginVertical: 16 }}>
            <Sprig size={24} />
          </View>
          <Text
            className="text-lg text-typography-500 text-center"
            style={{ lineHeight: 28 }}
          >
            {t("blog.hero.subtitle")}
          </Text>
        </View>
      </View>

      {posts.length > 0 && (
        <View className="w-full pt-6 pb-6 px-6 bg-accent-cream items-center">
          <View className="flex-row flex-wrap justify-center" style={{ gap: 10, maxWidth: 900 }}>
            {[{ key: "all", label: t("blog.categories.all") }, ...categories].map((c) => {
              const active = category === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  className={`px-4 py-2 rounded-full border active:opacity-70 ${
                    active ? "bg-primary-500 border-primary-500" : "bg-white border-accent-rose-light"
                  }`}
                >
                  <Text className={`text-sm font-semibold ${active ? "text-white" : "text-typography-600"}`}>
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {posts.length === 0 ? (
        <View className="w-full py-24 px-6 items-center bg-white">
          <Display
            as="h2"
            size={26}
            weight="600"
            style={{ textAlign: "center", marginBottom: 14 }}
          >
            {t("blog.emptyTitle")}
          </Display>
          <Text
            className="text-typography-500 text-center"
            style={{ fontSize: 16, lineHeight: 26, maxWidth: 400 }}
          >
            {t("blog.emptyBody")}
          </Text>
        </View>
      ) : (
        <View className="w-full py-12 px-6 bg-white">
          <View style={{ maxWidth: 1100, alignSelf: "center", width: "100%" }}>
            {featured && (
              <View style={{ marginBottom: 16 }}>
                <Text className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-4">
                  {t("blog.featuredLabel")}
                </Text>
                <BlogPostCard post={featured} featured lang={lang} />
              </View>
            )}

            {rest.length > 0 && (
              <View className="flex-row flex-wrap" style={{ gap: 20, marginTop: 12 }}>
                {rest.map((post) => (
                  <View key={post.slug} style={{ flexBasis: 300, flexGrow: 1, maxWidth: 560 }}>
                    <BlogPostCard post={post} lang={lang} />
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      <FreeToolsStrip
        toolIds={["seatingChart", "budget", "timeline"]}
        className="w-full py-16 px-6 bg-accent-cream"
      />

      <View className="w-full py-16 px-6 bg-accent-blush items-center">
        <View style={{ maxWidth: 600, width: "100%", alignItems: "center" }}>
          <Display
            as="h2"
            size={30}
            weight="600"
            style={{ textAlign: "center", marginBottom: 20, lineHeight: 38 }}
          >
            {t("blog.ctaTitle")}
          </Display>
          <MarketingLink
            href="/home"
            title={t("blog.ctaButton")}
            className="bg-primary-500 rounded-full active:opacity-70 px-8 py-3.5"
          >
            <Text className="text-base font-semibold text-white">
              {t("blog.ctaButton")}
            </Text>
          </MarketingLink>
        </View>
      </View>
    </View>
  );
}
