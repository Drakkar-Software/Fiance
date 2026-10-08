import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
import seo from "@/i18n/locales/fr/seo.json";
import { BASE_URL } from "@/lib/seo-urls";

const OG_IMAGE = `${BASE_URL}/assets/og-image.png`;

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

        {/* Invariant meta — per-page title/description/robots set by <Seo> */}
        <meta name="keywords" content={seo.keywords} />
        <meta name="author" content="Fiancé" />

        {/* Hreflang is emitted per-page by <Seo alternates=.../> (real /fr /en URLs) */}

        {/* Open Graph invariants — type, site name, locale, default image */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Fiancé" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={seo.ogImageAlt} />

        {/* Twitter Card invariants */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:image:alt" content={seo.ogImageAlt} />

        {/* App linking */}
        <meta name="application-name" content="Fiancé" />
        <meta name="apple-mobile-web-app-title" content="Fiancé" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* JSON-LD Structured Data — global @graph (SoftwareApplication + WebSite + Organization) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "SoftwareApplication",
                  "@id": `${BASE_URL}/#app`,
                  name: "Fiancé",
                  url: BASE_URL,
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "iOS, Android, Web",
                  description: seo.description,
                  inLanguage: ["fr", "en"],
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "EUR",
                  },
                  author: {
                    "@type": "Organization",
                    "@id": `${BASE_URL}/#org`,
                    name: "Drakkar Software",
                    url: "https://drakkar.software",
                  },
                  downloadUrl: BASE_URL,
                  screenshot: `${BASE_URL}/assets/icon-512.png`,
                  featureList,
                },
                {
                  "@type": "WebSite",
                  "@id": `${BASE_URL}/#website`,
                  name: "Fiancé",
                  url: BASE_URL,
                  publisher: { "@id": `${BASE_URL}/#org` },
                },
                {
                  "@type": "Organization",
                  "@id": `${BASE_URL}/#org`,
                  name: "Drakkar Software",
                  url: "https://drakkar.software",
                },
              ],
            }),
          }}
        />

        {/* Garden Press typefaces — non-blocking (display=swap already in URL) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="preload"
          as="style"
          // @ts-ignore — onload is a valid HTML attribute for preload trick
          onLoad="this.onload=null;this.rel='stylesheet'"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500;1,9..144,600&family=Caveat:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500;1,9..144,600&family=Caveat:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap"
          />
        </noscript>

        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/assets/favicon.png" />
        <link rel="apple-touch-icon" href="/assets/icon.png" />

        {/*
          Loading indicator, in plain HTML and CSS. It has to appear BEFORE the
          app code — a React-rendered one would arrive with what it announces —
          so it lives in the prerender and the bundle only dismisses it
          (lib/loading-indicator.ts).

          It only shows on an app page: marketing pages ship their text in the
          HTML already, and covering that would replace readable content with a
          wait. The tell is the role="progressbar" the prerender carries, which
          no marketing page has. A browser without :has() shows nothing, i.e.
          the behaviour before this change.

          The background paints immediately (app paper colour, so no white
          flash); the ring and label only after 350 ms, so a warm-cache load
          never shows an indicator. Dark mode follows the system rather than the
          in-app setting, which lives in localStorage and is unreadable from a
          stylesheet.
        */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
#app-loading{display:none}
#root:has([role="progressbar"]) ~ #app-loading{display:flex}
html[data-app-mounted] #app-loading{display:none}
#app-loading{position:fixed;inset:0;z-index:2147483000;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:#fdf4ef;color:#616f6a;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;font-size:15px}
#app-loading > *{opacity:0;animation:app-loading-appear .25s ease-out .35s forwards}
#app-loading .ring{width:34px;height:34px;border-radius:50%;border:3px solid rgba(0,145,110,.18);border-top-color:#00916e;animation:app-loading-appear .25s ease-out .35s forwards,app-loading-spin .9s linear infinite}
@keyframes app-loading-appear{to{opacity:1}}
@keyframes app-loading-spin{to{transform:rotate(360deg)}}
@media (prefers-color-scheme:dark){#app-loading{background:#0d1714;color:#eaf5f0}}
@media (prefers-reduced-motion:reduce){#app-loading .ring{animation:app-loading-appear .25s ease-out .35s forwards}}
`,
          }}
        />
        <ScrollViewStyleReset />
      </head>
      <body>
        {children}
        {/* See the stylesheet at the top of this file. */}
        <div id="app-loading">
          <div className="ring" />
          <div>Chargement…</div>
        </div>
        {/* Service Worker — registered from every pre-rendered entry point */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js")`,
          }}
        />
      </body>
    </html>
  );
}
