import React from "react";
import { Platform } from "react-native";
import Head from "expo-router/head";

interface SeoProps {
  title: string;
  description: string;
  canonical?: string;
  /** fr/en alternate URLs for this page — emits hreflang link tags (x-default = fr). */
  alternates?: { fr: string; en: string };
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: "website" | "article";
  /** ISO date or datetime for article Open Graph / meta tags. */
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
}

export function Seo({
  title,
  description,
  canonical,
  alternates,
  ogTitle,
  ogDescription,
  ogImage,
  ogImageAlt,
  ogType = "website",
  articlePublishedTime,
  articleModifiedTime,
  articleAuthor,
  noindex = false,
  jsonLd,
}: SeoProps) {
  if (Platform.OS !== "web") return null;

  const resolvedTitle = ogTitle ?? title;
  const resolvedDesc = ogDescription ?? description;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      {canonical && <link rel="canonical" href={canonical} />}
      {canonical && <meta property="og:url" content={canonical} />}
      {alternates && <link rel="alternate" hrefLang="fr" href={alternates.fr} />}
      {alternates && <link rel="alternate" hrefLang="en" href={alternates.en} />}
      {alternates && <link rel="alternate" hrefLang="x-default" href={alternates.fr} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDesc} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDesc} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
      {ogImageAlt && <meta name="twitter:image:alt" content={ogImageAlt} />}
      {ogType === "article" && articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {ogType === "article" && articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}
      {ogType === "article" && articleAuthor && (
        <meta property="article:author" content={articleAuthor} />
      )}
      {jsonLd && (
        // eslint-disable-next-line react/no-danger
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
    </Head>
  );
}
