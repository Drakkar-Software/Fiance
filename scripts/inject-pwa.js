const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "dist", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

const pwaHead = `
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/assets/icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="WeddingOS" />`;

const swRegister = `<script>if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js")</script>`;

html = html.replace("</head>", `${pwaHead}\n  </head>`);
html = html.replace('lang="en"', 'lang="fr"');
html = html.replace("</body>", `${swRegister}\n</body>`);

fs.writeFileSync(htmlPath, html);
console.log("PWA tags + service worker injected into dist/index.html");
