import React from "react";
import { Link } from "expo-router";
import { Pressable, type PressableProps } from "react-native-css/components";

type MarketingLinkProps = PressableProps & {
  href: string;
  /** Ignored on native; used on web for language alternate links. */
  hrefLang?: string;
  /** Visible link title for SEO (web `title` attribute on the anchor). */
  title?: string;
  children: React.ReactNode;
};

/**
 * Crawlable internal link for marketing pages.
 * Renders a real `<a href>` on web via expo-router Link; keeps SPA navigation on native.
 */
export function MarketingLink({ href, title, children, className, ...rest }: MarketingLinkProps) {
  return (
    <Link href={href as any} asChild>
      <Pressable
        accessibilityRole="link"
        className={className}
        {...(title ? ({ title } as object) : {})}
        {...rest}
      >
        {children}
      </Pressable>
    </Link>
  );
}
