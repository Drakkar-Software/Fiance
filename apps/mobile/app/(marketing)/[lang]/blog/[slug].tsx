import React from "react";
import { useLocalSearchParams } from "expo-router";
import { BlogPostPage } from "@/components/marketing/BlogPostPage";
import { getBlogSlugs } from "@/lib/blog";

/**
 * Return real slugs so Expo static export prerenders each post to a standalone
 * HTML file with baked-in <title>, canonical, og:*, and BlogPosting JSON-LD.
 * An empty array would only emit a placeholder and skip static metadata.
 * `params.lang` is already resolved (fr/en) by the parent [lang] segment —
 * fan out slugs under each locale.
 */
export async function generateStaticParams({ params }: { params: { lang: string } }) {
  return getBlogSlugs().map((slug) => ({ lang: params.lang, slug }));
}

export default function BlogPost() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <BlogPostPage slug={slug ?? ""} />;
}
