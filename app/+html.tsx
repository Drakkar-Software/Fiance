import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="theme-color" content="#EC4899" />

        {/* Primary SEO meta tags */}
        <title>
          WeddingOS — Organisez votre mariage simplement | Budget, Invités, Prestataires
        </title>
        <meta
          name="description"
          content="Application gratuite et privée pour organiser votre mariage : budget, liste d'invités, plan de table, prestataires, planning, checklist et mood board. Fonctionne hors ligne. Données 100% privées."
        />
        <meta
          name="keywords"
          content="organisation mariage, planifier mariage, budget mariage, liste invités mariage, plan de table mariage, prestataires mariage, wedding planner, application mariage, checklist mariage, planning mariage, RSVP mariage, mood board mariage, organisateur mariage, rétro planning mariage, jour J, app mariage gratuite, préparatifs mariage, gestion mariage, décoration mariage, traiteur mariage"
        />
        <meta name="author" content="WeddingOS" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://wedding-os.pages.dev/" />

        {/* Alternate language */}
        <link rel="alternate" hrefLang="fr" href="https://wedding-os.pages.dev/" />
        <link rel="alternate" hrefLang="en" href="https://wedding-os.pages.dev/" />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://wedding-os.pages.dev/"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="WeddingOS" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta
          property="og:title"
          content="WeddingOS — Organisez votre mariage simplement"
        />
        <meta
          property="og:description"
          content="Application gratuite et privée pour organiser votre mariage : budget, invités, plan de table, prestataires, planning et mood board. 100% hors ligne."
        />
        <meta property="og:image" content="/assets/icon-512.png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta
          property="og:image:alt"
          content="WeddingOS — Application d'organisation de mariage"
        />
        <meta property="og:url" content="https://wedding-os.pages.dev/" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="WeddingOS — Organisez votre mariage simplement"
        />
        <meta
          name="twitter:description"
          content="Application gratuite et privée pour organiser votre mariage : budget, invités, plan de table, prestataires, planning et mood board."
        />
        <meta name="twitter:image" content="/assets/icon-512.png" />
        <meta
          name="twitter:image:alt"
          content="WeddingOS — Application d'organisation de mariage"
        />

        {/* App linking */}
        <meta name="application-name" content="WeddingOS" />
        <meta name="apple-mobile-web-app-title" content="WeddingOS" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "WeddingOS",
              applicationCategory: "LifestyleApplication",
              operatingSystem: "iOS, Android, Web",
              description:
                "Application gratuite et privée pour organiser votre mariage : budget, liste d'invités, plan de table, prestataires, planning, checklist et mood board. Fonctionne hors ligne.",
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
              featureList: [
                "Gestion du budget mariage",
                "Liste d'invités et RSVP",
                "Plan de table interactif",
                "Gestion des prestataires",
                "Comparateur de traiteurs",
                "Planning et checklist",
                "Mood board d'inspiration",
                "Programme du jour J",
                "Page web de mariage partageable",
                "Synchronisation chiffrée",
                "Mode hors ligne",
                "Multi-mariage",
              ],
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
