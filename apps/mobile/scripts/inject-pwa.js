const fs = require("fs");
const path = require("path");

const seo = require("../i18n/locales/fr/seo.json");

const DIST = path.join(__dirname, "..", "dist");

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
    { src: "/favicon.png", sizes: "48x48", type: "image/png" },
    { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/icon.png", sizes: "1024x1024", type: "image/png" },
  ],
  shortcuts: [
    {
      name: "Budget",
      short_name: "Budget",
      url: "/(tabs)/budget",
      description: seo.shortcuts.budget,
      icons: [{ src: "/favicon.png", sizes: "48x48" }],
    },
    {
      name: "Invités",
      short_name: "Invités",
      url: "/(tabs)/guests",
      description: seo.shortcuts.guests,
      icons: [{ src: "/favicon.png", sizes: "48x48" }],
    },
    {
      name: "Planning",
      short_name: "Planning",
      url: "/(tabs)/planning",
      description: seo.shortcuts.planning,
      icons: [{ src: "/favicon.png", sizes: "48x48" }],
    },
  ],
};

fs.writeFileSync(path.join(DIST, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("manifest.json generated from translations into dist/manifest.json");

/**
 * Expo static export emits `page.html` files. Crawlers and sitemap use clean
 * URLs (`/blog/my-post`). Promote each file to `my-post/index.html` so hosts
 * serve the prerendered HTML (with title, canonical, JSON-LD) at the clean path.
 */
function promoteHtmlFilesToDirectories(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".html") || name === "index.html") continue;
    const slug = name.slice(0, -".html".length);
    if (slug.includes("[") || slug.includes("]")) continue;
    const src = path.join(dir, name);
    const targetDir = path.join(dir, slug);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.renameSync(src, path.join(targetDir, "index.html"));
    count++;
  }
  return count;
}

function promoteRootPage(name) {
  const src = path.join(DIST, `${name}.html`);
  if (!fs.existsSync(src)) return false;
  const targetDir = path.join(DIST, name);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.renameSync(src, path.join(targetDir, "index.html"));
  return true;
}

// SEO marketing routes: /blog/:slug, /tools/:slug, /feature/:slug
const blogCount = promoteHtmlFilesToDirectories(path.join(DIST, "blog"));
const toolsCount = promoteHtmlFilesToDirectories(path.join(DIST, "tools"));
const featureCount = promoteHtmlFilesToDirectories(path.join(DIST, "feature"));
for (const page of ["privacy", "terms"]) {
  promoteRootPage(page);
}
console.log(
  `Clean URLs: promoted ${blogCount} blog, ${toolsCount} tools, ${featureCount} feature pages to directory/index.html`
);

// Remove dynamic route placeholders (empty shell pages, bad for SEO)
function removeDynamicPlaceholders(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name.includes("[") || name.includes("]")) {
      fs.rmSync(path.join(dir, name), { recursive: true, force: true });
      console.log(`Removed dynamic placeholder: ${path.join(dir, name)}`);
    }
  }
}
removeDynamicPlaceholders(path.join(DIST, "blog"));
removeDynamicPlaceholders(path.join(DIST, "tools"));
removeDynamicPlaceholders(path.join(DIST, "feature"));

// Expo also exports the (marketing) route group as a literal folder — duplicate
// content at /(marketing)/blog/... that splits SEO signals. Remove it.
const marketingDir = path.join(DIST, "(marketing)");
if (fs.existsSync(marketingDir)) {
  fs.rmSync(marketingDir, { recursive: true, force: true });
  console.log("Removed duplicate dist/(marketing) route-group export");
}

// Cloudflare Pages excludes directories starting with "." from deployment.
// Font TTFs land in dist/assets/node_modules/.pnpm/ — rename to drop the dot,
// then prepend a rewrite rule so bundle requests still resolve correctly.
// public/_redirects holds legacy 301 rules only. SPA fallback is configured in
// wrangler.toml via not_found_handling = "single-page-application".
const dotPnpmPath = path.join(DIST, "assets", "node_modules", ".pnpm");
const pnpmPath = path.join(DIST, "assets", "node_modules", "pnpm");
if (fs.existsSync(dotPnpmPath)) {
  fs.renameSync(dotPnpmPath, pnpmPath);
  const redirectsPath = path.join(DIST, "_redirects");
  const existing = fs.readFileSync(redirectsPath, "utf8");
  fs.writeFileSync(
    redirectsPath,
    "/assets/node_modules/.pnpm/* /assets/node_modules/pnpm/:splat 200\n" + existing
  );
  console.log("Font assets: renamed .pnpm → pnpm, prepended rewrite rule to _redirects");
}
