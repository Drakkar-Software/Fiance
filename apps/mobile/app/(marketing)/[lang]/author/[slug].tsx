import React from "react";
import { useLocalSearchParams } from "expo-router";
import { AuthorPage } from "@/components/marketing/AuthorPage";
import { BLOG_AUTHOR_SLUGS, type BlogAuthorSlug } from "@/lib/blog";

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  return BLOG_AUTHOR_SLUGS.map((slug) => ({ lang: params.lang, slug }));
}

export default function AuthorRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const resolved = BLOG_AUTHOR_SLUGS.includes(slug as BlogAuthorSlug)
    ? (slug as BlogAuthorSlug)
    : "paul";
  return <AuthorPage slug={resolved} />;
}
