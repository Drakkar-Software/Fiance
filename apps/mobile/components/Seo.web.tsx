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
  noindex = false,
  jsonLd,
}: SeoProps) {
  // This file only exists to be picked up by Metro's `.web.tsx` platform
  // resolution. If it ever ends up in a native bundle regardless, `expo-router/head`
  // resolves to its native Handoff/Spotlight implementation there, which throws
  // without an `origin` set in the Expo Config — bail out instead of crashing.
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
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDesc} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDesc} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {jsonLd && (
        // eslint-disable-next-line react/no-danger
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
    </Head>
  );
}
