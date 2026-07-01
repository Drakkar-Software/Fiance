import React from "react";
import { Image } from "react-native";
import { View, Text, Pressable } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/Display";
import { Postit } from "@/components/Postit";
import { Seal } from "@/components/Seal";
import { theme as GP } from "@/lib/theme";
import {
  BLOG_AUTHOR,
  formatBlogMonth,
  formatBlogYear,
  type BlogPost,
} from "@/lib/blog";

interface BlogPostCardProps {
  post: BlogPost;
  featured?: boolean;
  lang: string;
  onPress: () => void;
}

export function BlogPostCard({
  post,
  featured = false,
  lang,
  onPress,
}: BlogPostCardProps) {
  const { t } = useTranslation("marketing");
  const imageHeight = featured ? 260 : 190;

  return (
    <Pressable onPress={onPress} className="active:opacity-80 hover:shadow-lg">
      <View className="bg-white rounded-2xl border border-accent-rose-light overflow-hidden">
        {/* Hero image — Postit category tag overlaid bottom-left */}
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: post.heroImage }}
            style={{ width: "100%", height: imageHeight }}
            resizeMode="cover"
            accessible={false}
          />
          <View style={{ position: "absolute", bottom: 10, left: 12 }}>
            <Postit size="sm" angle={-1.5}>
              {post.category}
            </Postit>
          </View>
        </View>

        {/* Content */}
        <View style={{ padding: 20 }}>
          <Display
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

          {/* Footer: byline left, wax seal date stamp right */}
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-semibold text-typography-400 uppercase tracking-widest">
                {t("blog.by")} {BLOG_AUTHOR.name}
              </Text>
              <Text className="text-xs text-typography-400" style={{ marginTop: 2 }}>
                {t("blog.readingTime", { count: post.readingMinutes })}
              </Text>
            </View>

            {/* Signature element: wax seal date stamp */}
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
    </Pressable>
  );
}
