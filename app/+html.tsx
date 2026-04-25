import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
import seo from "@/i18n/locales/fr/seo.json";

export default function Root({ children }: PropsWithChildren) {
  const featureList = Object.values(seo.featureList);

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="theme-color" content="#b96a4a" />

        {/* Primary SEO meta tags */}
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <meta name="author" content="Fiancé" />
        <meta name="robots" content="index, follow" />

        {/* Alternate language */}
        <link rel="alternate" hrefLang="fr" href="https://fiance.pages.dev/" />
        <link rel="alternate" hrefLang="en" href="https://fiance.pages.dev/" />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://fiance.pages.dev/"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Fiancé" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:title" content={seo.ogTitle} />
        <meta property="og:description" content={seo.ogDescription} />
        <meta property="og:image" content="/assets/icon-512.png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:alt" content={seo.ogImageAlt} />
        <meta property="og:url" content="https://fiance.pages.dev/" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.ogTitle} />
        <meta name="twitter:description" content={seo.shortDescription} />
        <meta name="twitter:image" content="/assets/icon-512.png" />
        <meta name="twitter:image:alt" content={seo.ogImageAlt} />

        {/* App linking */}
        <meta name="application-name" content="Fiancé" />
        <meta name="apple-mobile-web-app-title" content="Fiancé" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Fiancé",
              applicationCategory: "LifestyleApplication",
              operatingSystem: "iOS, Android, Web",
              description: seo.description,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "5",
                ratingCount: "1",
              },
              featureList,
              inLanguage: ["fr", "en"],
              screenshot: "/assets/icon-512.png",
            }),
          }}
        />

        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/assets/favicon.png" />
        <link rel="apple-touch-icon" href="/assets/icon.png" />
        <ScrollViewStyleReset />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
