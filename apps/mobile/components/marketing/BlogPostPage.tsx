import React from "react";
import { View, Text } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { Avatar } from "@/components/Avatar";
import { Seo } from "@/components/Seo";
import { MarketingLink } from "@/components/marketing/MarketingLink";
import {
  getPublishedBlogPost,
  buildPostJsonLd,
  formatBlogDate,
  postAlternates,
  getPostAuthor,
  toSchemaDateTime,
  type BlogSection,
} from "@/lib/blog";
import { authorProfileUrl } from "@/lib/blog-authors";
import { localizedUrl, localizedPath } from "@/lib/seo-urls";
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
            as="h2"
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
          as="h2"
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
  const { t, i18n } = useTranslation("marketing");
  const lang = i18n.language === "en" ? "en" : "fr";
  const post = getPublishedBlogPost(lang, slug);

  if (!post) {
    return (
      <View className="w-full py-24 px-6 items-center bg-white">
        <Display
          as="h1"
          size={28}
          weight="600"
          style={{ textAlign: "center", marginBottom: 16 }}
        >
          {t("blog.postNotFound")}
        </Display>
        <MarketingLink href={localizedPath(lang, "/blog") as any} title={t("blog.backToBlog")} className="active:opacity-60">
          <Text className="text-primary-500 font-semibold" style={{ fontSize: 15 }}>
            {t("blog.backToBlog")}
          </Text>
        </MarketingLink>
      </View>
    );
  }

  const canonical = localizedUrl(lang, `/blog/${post.slug}`);
  const author = getPostAuthor(post);
  const modified = post.updated ?? post.date;
  const showUpdated = post.updated != null && post.updated !== post.date;

  return (
    <View className="w-full">
      <Seo
        title={`${post.title} | Fiancé`}
        description={post.excerpt}
        ogTitle={post.title}
        ogDescription={post.excerpt}
        canonical={canonical}
        alternates={postAlternates(post.slug)}
        ogImage={post.heroImage}
        ogImageAlt={post.heroImageAlt}
        ogType="article"
        articlePublishedTime={toSchemaDateTime(post.date)}
        articleModifiedTime={toSchemaDateTime(modified)}
        articleAuthor={author.name}
        jsonLd={buildPostJsonLd(post, lang)}
      />

      {/* Article hero */}
      <View className="w-full pt-10 pb-10 px-6 bg-accent-cream">
        <View style={{ maxWidth: 700, width: "100%", alignSelf: "center" }}>
          {/* Back */}
          <MarketingLink
            href={localizedPath(lang, "/blog") as any}
            title={t("blog.backToBlog")}
            className="active:opacity-60"
            style={{ marginBottom: 20 }}
          >
            <Text className="text-sm text-primary-500 font-semibold">
              {t("blog.backToBlog")}
            </Text>
          </MarketingLink>

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
            as="h1"
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
            <Avatar ini={author.avatarInitials} size={28} />
            <MarketingLink
              href={authorProfileUrl(author.slug, lang) as any}
              title={author.name}
              className="active:opacity-60"
            >
              <Text className="text-sm font-semibold text-typography-700">{author.name}</Text>
            </MarketingLink>
            <Text className="text-xs text-typography-400">·</Text>
            <Text className="text-xs text-typography-400">
              {t("blog.publishedOn")} {formatBlogDate(post.date, lang)}
            </Text>
            {showUpdated && (
              <>
                <Text className="text-xs text-typography-400">·</Text>
                <Text className="text-xs text-typography-400">
                  {t("blog.updatedOn")} {formatBlogDate(post.updated!, lang)}
                </Text>
              </>
            )}
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
              <Avatar ini={author.avatarInitials} size={44} />
              <View className="flex-1">
                <MarketingLink
                  href={authorProfileUrl(author.slug, lang) as any}
                  title={author.name}
                  className="active:opacity-60"
                >
                  <Text className="text-base font-semibold text-typography-900">{author.name}</Text>
                </MarketingLink>
                <Text className="text-sm text-typography-400" style={{ marginTop: 2 }}>
                  {t(`authors.${author.slug}.role`)}
                </Text>
              </View>
            </View>
          </View>

          {/* Back link */}
          <View
            className="border-t border-accent-rose-light"
            style={{ paddingTop: 28, marginTop: 24 }}
          >
            <MarketingLink
              href={localizedPath(lang, "/blog") as any}
              title={t("blog.backToBlog")}
              className="active:opacity-60"
            >
              <Text
                className="text-primary-500 font-semibold"
                style={{ fontSize: 15 }}
              >
                {t("blog.backToBlog")}
              </Text>
            </MarketingLink>
          </View>
        </View>
      </View>
    </View>
  );
}
