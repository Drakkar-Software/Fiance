import React from "react";
import { useLocalSearchParams } from "expo-router";
import { BlogPostPage } from "@/components/marketing/BlogPostPage";
import { getBlogSlugs } from "@/lib/blog";

/**
 * Return real slugs so Expo static export prerenders each post to a standalone
 * HTML file with baked-in <title>, canonical, og:*, and BlogPosting JSON-LD.
 * An empty array would only emit a placeholder and skip static metadata.
 */
export async function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export default function BlogPost() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <BlogPostPage slug={slug ?? ""} />;
}
