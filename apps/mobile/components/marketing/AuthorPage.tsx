import React from "react";
import { View, Text } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { Avatar } from "@/components/Avatar";
import { Seo } from "@/components/Seo";
import { MarketingLink } from "@/components/marketing/MarketingLink";
import { BlogPostCard } from "@/components/marketing/BlogPostCard";
import {
  getBlogAuthor,
  getPostsByAuthor,
  buildAuthorPersonJsonLd,
  type BlogAuthorSlug,
} from "@/lib/blog";
import { localizedSeo, localizedPath } from "@/lib/seo-urls";

interface AuthorPageProps {
  slug: BlogAuthorSlug;
}

export function AuthorPage({ slug }: AuthorPageProps) {
  const { t, i18n } = useTranslation("marketing");
  const lang = i18n.language === "en" ? "en" : "fr";
  const author = getBlogAuthor(slug);
  const posts = getPostsByAuthor(slug, lang);
  const prefix = `authors.${slug}`;
  const role = t(`${prefix}.role`);
  const bio = t(`${prefix}.bio`);
  const expertise = t(`${prefix}.expertise`, { returnObjects: true }) as string[];
  const seo = localizedSeo(lang, `/author/${slug}`);

  return (
    <View className="w-full">
      <Seo
        title={t(`${prefix}.meta.title`)}
        description={t(`${prefix}.meta.description`)}
        {...seo}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            buildAuthorPersonJsonLd(slug, lang, { role, bio }),
            {
              "@type": "ProfilePage",
              "@id": `${seo.canonical}#profile`,
              url: seo.canonical,
              name: t(`${prefix}.meta.title`),
              description: t(`${prefix}.meta.description`),
              inLanguage: lang === "en" ? "en-US" : "fr-FR",
              mainEntity: { "@id": `${seo.canonical}#person` },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Fiancé", item: localizedPath(lang, "/") },
                { "@type": "ListItem", position: 2, name: t("blog.hero.headline"), item: localizedPath(lang, "/blog") },
                { "@type": "ListItem", position: 3, name: author.name, item: seo.canonical },
              ],
            },
          ],
        }}
      />

      <View className="w-full py-16 px-6 bg-accent-cream">
        <View style={{ maxWidth: 700, width: "100%", alignSelf: "center" }}>
          <MarketingLink
            href={localizedPath(lang, "/blog") as any}
            title={t("blog.backToBlog")}
            className="active:opacity-60"
            style={{ marginBottom: 20 }}
          >
            <Text className="text-sm text-primary-500 font-semibold">{t("blog.backToBlog")}</Text>
          </MarketingLink>

          <View className="flex-row items-center gap-4" style={{ marginBottom: 20 }}>
            <Avatar ini={author.avatarInitials} size={72} />
            <View className="flex-1">
              <Display as="h1" size={40} weight="700" style={{ lineHeight: 48 }}>
                {author.name}
              </Display>
              <Script size={18} style={{ marginTop: 4, lineHeight: 26 }}>
                {role}
              </Script>
            </View>
          </View>

          <Text className="text-base text-typography-600" style={{ lineHeight: 26, marginBottom: 24 }}>
            {bio}
          </Text>

          <Display as="h2" size={22} weight="600" style={{ marginBottom: 12 }}>
            {t("authors.expertiseTitle")}
          </Display>
          <View className="gap-2" style={{ marginBottom: 8 }}>
            {expertise.map((item) => (
              <View key={item} className="flex-row gap-3">
                <Text className="text-primary-500 font-bold">•</Text>
                <Text className="text-typography-600 flex-1" style={{ lineHeight: 24 }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className="w-full py-12 px-6 bg-white">
        <View style={{ maxWidth: 1100, width: "100%", alignSelf: "center" }}>
          <Display as="h2" size={28} weight="600" style={{ marginBottom: 20 }}>
            {t("authors.articlesBy", { name: author.name })}
          </Display>
          {posts.length === 0 ? (
            <Text className="text-typography-500">{t("authors.noArticlesYet")}</Text>
          ) : (
            <View className="flex-row flex-wrap" style={{ gap: 20 }}>
              {posts.map((post) => (
                <View key={post.slug} style={{ flexBasis: 300, flexGrow: 1, maxWidth: 560 }}>
                  <BlogPostCard post={post} lang={lang} />
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
