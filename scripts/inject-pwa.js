/**
 * Post-build: inject PWA meta tags into dist/index.html
 * Needed because +html.tsx requires output:"static" which breaks with uuid/ESM.
 */
const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "dist", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

const pwaHead = `
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/assets/icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />`;

html = html.replace("</head>", `${pwaHead}\n  </head>`);
html = html.replace('lang="en"', 'lang="fr"');

fs.writeFileSync(htmlPath, html);
console.log("PWA tags injected into dist/index.html");
