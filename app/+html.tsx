import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#EC4899" />
        {/* Open Graph / Social preview defaults */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="WeddingOS" />
        <meta property="og:title" content="WeddingOS" />
        <meta property="og:description" content="Votre mariage, organisé simplement." />
        <meta property="og:image" content="/assets/icon.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="WeddingOS" />
        <meta name="twitter:description" content="Votre mariage, organisé simplement." />
        <meta name="twitter:image" content="/assets/icon.png" />
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
