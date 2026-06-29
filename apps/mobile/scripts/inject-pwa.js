const fs = require("fs");
const path = require("path");

const seo = require("../i18n/locales/fr/seo.json");

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

// Cloudflare Pages excludes directories starting with "." from deployment.
// Font TTFs land in dist/assets/node_modules/.pnpm/ — rename to drop the dot,
// then prepend a rewrite rule so bundle requests still resolve correctly.
// The SPA catch-all (/* /index.html 200) is already the last line of
// public/_redirects; prepending the font rule keeps it last — correct precedence.
const dotPnpmPath = path.join(__dirname, "..", "dist", "assets", "node_modules", ".pnpm");
const pnpmPath = path.join(__dirname, "..", "dist", "assets", "node_modules", "pnpm");
if (fs.existsSync(dotPnpmPath)) {
  fs.renameSync(dotPnpmPath, pnpmPath);
  const redirectsPath = path.join(__dirname, "..", "dist", "_redirects");
  const existing = fs.readFileSync(redirectsPath, "utf8");
  fs.writeFileSync(redirectsPath, "/assets/node_modules/.pnpm/* /assets/node_modules/pnpm/:splat 200\n" + existing);
  console.log("Font assets: renamed .pnpm → pnpm, prepended rewrite rule to _redirects");
}
