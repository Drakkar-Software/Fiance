import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { Sprig } from "@/components/Sprig";
import { Seo } from "@/components/Seo";
import { BlogPostCard } from "@/components/marketing/BlogPostCard";
import { getBlogPosts, buildBlogJsonLd } from "@/lib/blog";

export function BlogIndexPage() {
  const { t } = useTranslation("marketing");
  const router = useRouter();
  const lang = i18n.language === "en" ? "en" : "fr";
  const posts = getBlogPosts(lang);
  const [featured, ...rest] = posts;

  return (
    <View className="w-full">
      <Seo
        title={t("blog.meta.title")}
        description={t("blog.meta.description")}
        ogDescription={t("blog.meta.ogDescription")}
        canonical={t("blog.meta.canonical")}
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
                    router.push(`/blog/${featured.slug}` as any)
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
                        router.push(`/blog/${post.slug}` as any)
                      }
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

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
