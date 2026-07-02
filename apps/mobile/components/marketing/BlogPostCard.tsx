import React from "react";
import { Image } from "react-native";
import { View, Text } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/Display";
import { Postit } from "@/components/Postit";
import { Seal } from "@/components/Seal";
import { MarketingLink } from "@/components/marketing/MarketingLink";
import { theme as GP } from "@/lib/theme";
import {
  getPostAuthor,
  formatBlogMonth,
  formatBlogYear,
  type BlogPost,
} from "@/lib/blog";
import { localizedPath } from "@/lib/seo-urls";

interface BlogPostCardProps {
  post: BlogPost;
  featured?: boolean;
  lang: string;
}

export function BlogPostCard({
  post,
  featured = false,
  lang,
}: BlogPostCardProps) {
  const { t } = useTranslation("marketing");
  const imageHeight = featured ? 260 : 190;
  const href = localizedPath(lang === "en" ? "en" : "fr", `/blog/${post.slug}`);
  const author = getPostAuthor(post);

  return (
    <MarketingLink
      href={href as any}
      title={post.title}
      className="active:opacity-80 hover:shadow-lg"
    >
      <View className="bg-white rounded-2xl border border-accent-rose-light overflow-hidden">
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: post.heroImage }}
            style={{ width: "100%", height: imageHeight }}
            resizeMode="cover"
            accessibilityLabel={post.heroImageAlt}
            alt={post.heroImageAlt}
          />
          <View style={{ position: "absolute", bottom: 10, left: 12 }}>
            <Postit size="sm" angle={-1.5}>
              {post.category}
            </Postit>
          </View>
        </View>

        <View style={{ padding: 20 }}>
          <Display
            as="h2"
            size={featured ? 26 : 20}
            weight="600"
            style={{ marginBottom: 8, lineHeight: featured ? 32 : 26 }}
            numberOfLines={3}
          >
            {post.title}
          </Display>

          <Text
            className="text-typography-500"
            style={{ fontSize: 14, lineHeight: 22, marginBottom: 16 }}
            numberOfLines={3}
          >
            {post.excerpt}
          </Text>

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-semibold text-typography-400 uppercase tracking-widest">
                {t("blog.by")} {author.name}
              </Text>
              <Text className="text-xs text-typography-400" style={{ marginTop: 2 }}>
                {t("blog.readingTime", { count: post.readingMinutes })}
              </Text>
            </View>

            <Seal
              label={formatBlogMonth(post.date, lang)}
              sublabel={formatBlogYear(post.date)}
              size={52}
              color={GP.clay}
              bg={GP.claySoft}
              angle={-6}
            />
          </View>
        </View>
      </View>
    </MarketingLink>
  );
}
