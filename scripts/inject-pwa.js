const fs = require("fs");
const path = require("path");

const seo = require("../i18n/locales/fr/seo.json");

const htmlPath = path.join(__dirname, "..", "dist", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

const pwaHead = `
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/assets/icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Fiancé" />`;

const swRegister = `<script>if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js")</script>`;

html = html.replace("</head>", `${pwaHead}\n  </head>`);
html = html.replace('lang="en"', 'lang="fr"');
html = html.replace("</body>", `${swRegister}\n</body>`);

fs.writeFileSync(htmlPath, html);
console.log("PWA tags + service worker injected into dist/index.html");

// Generate manifest.json from translation keys
const manifest = {
  id: "/",
  name: seo.manifestName,
  short_name: "Fiancé",
  description: seo.manifestDescription,
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  theme_color: "#EC4899",
  background_color: "#ffffff",
  lang: "fr",
  dir: "ltr",
  categories: ["lifestyle", "productivity", "utilities"],
  iarc_rating_id: "",
  prefer_related_applications: false,
  icons: [
    { src: "/assets/favicon.png", sizes: "48x48", type: "image/png" },
    { src: "/assets/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/assets/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/assets/icon.png", sizes: "1024x1024", type: "image/png" },
  ],
  shortcuts: [
    {
      name: "Budget",
      short_name: "Budget",
      url: "/(tabs)/budget",
      description: seo.shortcuts.budget,
      icons: [{ src: "/assets/favicon.png", sizes: "48x48" }],
    },
    {
      name: "Invités",
      short_name: "Invités",
      url: "/(tabs)/guests",
      description: seo.shortcuts.guests,
      icons: [{ src: "/assets/favicon.png", sizes: "48x48" }],
    },
    {
      name: "Planning",
      short_name: "Planning",
      url: "/(tabs)/planning",
      description: seo.shortcuts.planning,
      icons: [{ src: "/assets/favicon.png", sizes: "48x48" }],
    },
  ],
};

const manifestPath = path.join(__dirname, "..", "dist", "manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log("manifest.json generated from translations into dist/manifest.json");
