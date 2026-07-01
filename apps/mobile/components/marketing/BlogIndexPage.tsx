import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { Sprig } from "@/components/Sprig";
import { Seo } from "@/components/Seo";
import { BlogPostCard } from "@/components/marketing/BlogPostCard";
import { FreeToolsStrip } from "@/components/marketing/FreeToolsStrip";
import { getBlogPosts, buildBlogJsonLd } from "@/lib/blog";
import { localizedSeo, localizedPath } from "@/lib/seo-urls";

export function BlogIndexPage() {
  const { t, i18n } = useTranslation("marketing");
  const router = useRouter();
  const lang = i18n.language === "en" ? "en" : "fr";
  const posts = getBlogPosts(lang);
  const [category, setCategory] = useState("all");

  // Categories present in the actual post data — no guessing at an enum that could
  // drift from the real `categoryKey`/`category` values across the ~74 posts.
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

      {/* Hero */}
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
            size={48}
            weight="600"
            style={{ marginBottom: 12, lineHeight: 52 }}
          >
            {t("blog.hero.headline")}
          </Display>
          {/* Single botanical Sprig divider — the Garden Press restraint */}
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

      {/* Category filter */}
      {posts.length > 0 && (
        <View className="w-full pt-6 px-6 bg-accent-cream items-center">
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
        /* Empty state */
        <View className="w-full py-24 px-6 items-center bg-white">
          <Display
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
            {/* Featured post */}
            {featured && (
              <View style={{ marginBottom: 16 }}>
                <Text className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-4">
                  {t("blog.featuredLabel")}
                </Text>
                <BlogPostCard
                  post={featured}
                  featured
                  lang={lang}
                  onPress={() =>
                    router.push(localizedPath(lang, `/blog/${featured.slug}`) as any)
                  }
                />
              </View>
            )}

            {/* Remaining posts — responsive 2-col grid via flexBasis */}
            {rest.length > 0 && (
              <View
                className="flex-row flex-wrap"
                style={{ gap: 20, marginTop: 12 }}
              >
                {rest.map((post) => (
                  <View
                    key={post.slug}
                    style={{ flexBasis: 300, flexGrow: 1, maxWidth: 560 }}
                  >
                    <BlogPostCard
                      post={post}
                      lang={lang}
                      onPress={() =>
                        router.push(localizedPath(lang, `/blog/${post.slug}`) as any)
                      }
                    />
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

      {/* CTA strip */}
      <View className="w-full py-16 px-6 bg-accent-blush items-center">
        <View style={{ maxWidth: 600, width: "100%", alignItems: "center" }}>
          <Display
            size={30}
            weight="600"
            style={{ textAlign: "center", marginBottom: 20, lineHeight: 38 }}
          >
            {t("blog.ctaTitle")}
          </Display>
          <Pressable
            onPress={() => router.push("/home" as any)}
            className="bg-primary-500 rounded-full active:opacity-70"
            style={{ paddingHorizontal: 32, paddingVertical: 14 }}
          >
            <Text className="text-base font-semibold text-white">
              {t("blog.ctaButton")}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
