import { useEffect } from "react";
import { Platform } from "react-native";

interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

function setMeta(nameOrProperty: string, content: string, isProperty = false) {
  if (typeof document === "undefined") return;
  const attr = isProperty ? "property" : "name";
  const selector = `meta[${attr}="${nameOrProperty}"]`;
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, nameOrProperty);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Sets per-page SEO meta tags on web. No-op on native. */
export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    if (Platform.OS !== "web") return;

    document.title = meta.title;
    setMeta("description", meta.description);
    setMeta("og:title", meta.ogTitle ?? meta.title, true);
    setMeta("og:description", meta.ogDescription ?? meta.description, true);
    setMeta("twitter:title", meta.ogTitle ?? meta.title);
    setMeta("twitter:description", meta.ogDescription ?? meta.description);
    if (meta.ogImage) {
      setMeta("og:image", meta.ogImage, true);
      setMeta("twitter:image", meta.ogImage);
    }
    if (meta.canonical) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = meta.canonical;
    }
  }, [meta.title, meta.description, meta.canonical, meta.ogTitle, meta.ogDescription, meta.ogImage]);
}
