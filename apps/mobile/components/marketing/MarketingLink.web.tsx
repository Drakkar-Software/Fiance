import React from "react";
import { useRouter } from "expo-router";

type MarketingLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  hrefLang?: string;
  title?: string;
  children: React.ReactNode;
};

/**
 * Crawlable marketing link with optional hreflang (web only).
 * Uses a native anchor so crawlers see href + hreflang in the HTML body.
 */
export function MarketingLink({
  href,
  hrefLang,
  title,
  children,
  className,
  onClick,
  ...rest
}: MarketingLinkProps) {
  const router = useRouter();

  return (
    <a
      href={href}
      hrefLang={hrefLang}
      title={title}
      className={className}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        onClick?.(event as unknown as React.MouseEvent<HTMLAnchorElement>);
        router.push(href as any);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
