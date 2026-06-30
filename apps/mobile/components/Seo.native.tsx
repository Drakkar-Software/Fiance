import React from "react";

interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
}

export function Seo(_props: SeoProps) {
  return null;
}
