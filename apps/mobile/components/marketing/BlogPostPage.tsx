import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { Avatar } from "@/components/Avatar";
import { Seo } from "@/components/Seo";
import {
  getBlogPost,
  buildPostJsonLd,
  formatBlogDate,
  BLOG_AUTHOR,
  type BlogSection,
} from "@/lib/blog";
import { RichText } from "@/lib/rich-text";
import {
  FreeToolsStrip,
  getBlogToolIds,
} from "@/components/marketing/FreeToolsStrip";

// ─── Section renderer ───────────────────────────────────────────────────────

function ArticleSection({ section }: { section: BlogSection }) {
  const type = section.type ?? "text";

  if (type === "quote") {
    return (
      <View
        className="border-l-2 border-primary-500 pl-5"
        style={{ marginBottom: 32, marginTop: 4 }}
      >
        <Script size={20} color="#b96a4a" style={{ lineHeight: 30 }}>
          {section.quote ?? ""}
        </Script>
      </View>
    );
  }

  if (type === "callout") {
    return (
      <View
        className="bg-accent-blush rounded-2xl px-6 py-5"
        style={{ marginBottom: 32 }}
      >
        {(section.paragraphs ?? []).map((para, i) => (
          <RichText
            key={i}
            className="text-typography-700"
            style={{
              fontSize: 15,
              lineHeight: 26,
              marginBottom:
                i < (section.paragraphs?.length ?? 0) - 1 ? 8 : 0,
            }}
          >
            {para}
          </RichText>
        ))}
      </View>
    );
  }

  if (type === "list") {
    return (
      <View style={{ marginBottom: 32 }}>
        {section.title && (
          <Display
            size={22}
            weight="600"
            style={{ marginBottom: 14, lineHeight: 30 }}
          >
            {section.title}
          </Display>
        )}
        {(section.items ?? []).map((item, i) => (
          <View key={i} className="flex-row gap-3" style={{ marginBottom: 8 }}>
            <Text
              className="text-primary-500 font-bold"
              style={{ fontSize: 16, lineHeight: 28, minWidth: 16 }}
            >
              •
            </Text>
            <RichText
              className="text-typography-500 flex-1"
              style={{ fontSize: 16, lineHeight: 28 }}
            >
              {item}
            </RichText>
          </View>
        ))}
      </View>
    );
  }

  // Default: "text"
  return (
    <View style={{ marginBottom: 32 }}>
      {section.title && (
        <Display
          size={22}
          weight="600"
          style={{ marginBottom: 14, lineHeight: 30 }}
        >
          {section.title}
        </Display>
      )}
      {(section.paragraphs ?? []).map((para, i) => (
        <RichText
          key={i}
          className="text-typography-500"
          style={{ fontSize: 16, lineHeight: 28, marginBottom: 12 }}
        >
          {para}
        </RichText>
      ))}
    </View>
  );
}

// ─── Page component ─────────────────────────────────────────────────────────

interface BlogPostPageProps {
  slug: string;
}

export function BlogPostPage({ slug }: BlogPostPageProps) {
  const { t } = useTranslation("marketing");
  const router = useRouter();
  const lang = i18n.language === "en" ? "en" : "fr";
  const post = getBlogPost(lang, slug);

  if (!post) {
    return (
      <View className="w-full py-24 px-6 items-center bg-white">
        <Display
          size={28}
          weight="600"
          style={{ textAlign: "center", marginBottom: 16 }}
        >
          {t("blog.postNotFound")}
        </Display>
        <Pressable
          onPress={() => router.push("/blog" as any)}
          className="active:opacity-60"
        >
          <Text className="text-primary-500 font-semibold" style={{ fontSize: 15 }}>
            {t("blog.backToBlog")}
          </Text>
        </Pressable>
      </View>
    );
  }

  const canonical = `https://fiance.drakkar.software/blog/${post.slug}`;

  return (
    <View className="w-full">
      <Seo
        title={`${post.title} | Fiancé`}
        description={post.excerpt}
        ogDescription={t("blog.meta.ogDescription")}
        canonical={canonical}
        ogImage={post.heroImage}
        jsonLd={buildPostJsonLd(post, lang)}
      />

      {/* Article hero */}
      <View className="w-full pt-10 pb-10 px-6 bg-accent-cream">
        <View style={{ maxWidth: 700, width: "100%", alignSelf: "center" }}>
          {/* Back */}
          <Pressable
            onPress={() => router.push("/blog" as any)}
            className="active:opacity-60"
            style={{ marginBottom: 20 }}
          >
            <Text className="text-sm text-primary-500 font-semibold">
              {t("blog.backToBlog")}
            </Text>
          </Pressable>

          {/* Category chip */}
          <View
            className="border border-accent-rose-light rounded-full"
            style={{ alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, marginBottom: 14 }}
          >
            <Text className="text-xs font-semibold text-typography-500 uppercase tracking-wide">
              {post.category}
            </Text>
          </View>

          {/* Title */}
          <Display
            size={40}
            weight="700"
            style={{ marginBottom: 14, lineHeight: 48 }}
          >
            {post.title}
          </Display>

          {/* Excerpt */}
          <Script size={18} style={{ marginBottom: 20, lineHeight: 27 }}>
            {post.excerpt}
          </Script>

          {/* Compact meta row */}
          <View className="flex-row items-center flex-wrap gap-2">
            <Avatar ini={BLOG_AUTHOR.avatarInitials} size={28} />
            <Text className="text-sm font-semibold text-typography-700">
              {BLOG_AUTHOR.name}
            </Text>
            <Text className="text-xs text-typography-400">·</Text>
            <Text className="text-xs text-typography-400">
              {formatBlogDate(post.date, lang)}
            </Text>
            <Text className="text-xs text-typography-400">·</Text>
            <Text className="text-xs text-typography-400">
              {t("blog.readingTime", { count: post.readingMinutes })}
            </Text>
          </View>
        </View>
      </View>

      {/* Article body */}
      <View className="w-full bg-white py-12 px-6">
        <View style={{ maxWidth: 700, width: "100%", alignSelf: "center" }}>
          {post.sections.map((section, i) => (
            <ArticleSection key={i} section={section} />
          ))}

          <FreeToolsStrip
            toolIds={getBlogToolIds(post.categoryKey)}
            showHeader={false}
            className="w-full py-0 px-0 bg-white"
          />

          {/* Author bio */}
          <View
            className="border border-accent-rose-light rounded-2xl p-6"
            style={{ marginTop: 32 }}
          >
            <Text
              className="text-xs font-semibold text-typography-400 uppercase tracking-widest"
              style={{ marginBottom: 14 }}
            >
              {t("blog.authorBioTitle")}
            </Text>
            <View className="flex-row items-center gap-3">
              <Avatar ini={BLOG_AUTHOR.avatarInitials} size={44} />
              <View>
                <Text className="text-base font-semibold text-typography-900">
                  {BLOG_AUTHOR.name}
                </Text>
                <Text
                  className="text-sm text-typography-400"
                  style={{ marginTop: 2 }}
                >
                  {t("blog.authorRole")}
                </Text>
              </View>
            </View>
          </View>

          {/* Back link */}
          <View
            className="border-t border-accent-rose-light"
            style={{ paddingTop: 28, marginTop: 24 }}
          >
            <Pressable
              onPress={() => router.push("/blog" as any)}
              className="active:opacity-60"
            >
              <Text
                className="text-primary-500 font-semibold"
                style={{ fontSize: 15 }}
              >
                {t("blog.backToBlog")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
