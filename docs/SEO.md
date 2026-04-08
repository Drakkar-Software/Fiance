# SEO & ASO Strategy — WeddingOS

This document covers the full SEO (web), ASO (App Store / Play Store), and keyword strategy for WeddingOS.

---

## Keyword Strategy

### Primary Keywords (High Volume, High Intent)

| Keyword | Lang | Search Intent | Where Used |
|---------|------|---------------|------------|
| organisation mariage | FR | Core planning intent | meta description, keywords, JSON-LD |
| budget mariage | FR | #1 pain point for couples | meta keywords, feature list |
| liste invités mariage | FR | Guest management searches | meta keywords, feature list |
| plan de table mariage | FR | High-intent, specific feature | meta keywords, feature list |
| prestataires mariage | FR | Vendor management | title, meta keywords |
| planning mariage | FR | Broad planning query | meta keywords |
| checklist mariage | FR | Action-oriented searchers | meta keywords, description |
| wedding planner | FR/EN | Bilingual searchers | meta keywords |
| application mariage | FR | App-specific discovery | meta keywords |
| planifier mariage | FR | Verb-form planning intent | meta keywords |

### Secondary Keywords (Long-Tail, High Conversion)

| Keyword | Lang | Search Intent |
|---------|------|---------------|
| RSVP mariage | FR | Specific feature |
| mood board mariage | FR | Inspiration seekers |
| rétro planning mariage | FR | Timeline planning |
| jour J | FR | Wedding day coordination |
| app mariage gratuite | FR | Price-sensitive users |
| préparatifs mariage | FR | Early-stage planners |
| organisateur mariage | FR | Tool-seeking intent |
| traiteur mariage | FR | Caterer comparison |
| décoration mariage | FR | Ideas/mood board |
| gestion mariage | FR | Management tool seekers |

### English Keywords (for EN locale / international reach)

| Keyword | Search Intent |
|---------|---------------|
| wedding planner app | App discovery |
| wedding budget tracker | Budget feature |
| guest list manager | Guest management |
| seating chart planner | Table planning |
| wedding checklist | Task management |
| wedding planning app free | Price-sensitive |
| wedding organizer | Tool discovery |
| wedding vendor management | Vendor feature |
| wedding mood board | Inspiration |
| offline wedding app | Privacy/offline USP |

---

## Web SEO Implementation

### Meta Tags (`app/+html.tsx`)

All texts sourced from `i18n/locales/{lang}/seo.json`.

| Tag | Content |
|-----|---------|
| `<title>` | `WeddingOS — Organisez votre mariage simplement \| Budget, Invités, Prestataires` |
| `meta description` | 160-char description covering all major features + offline + privacy USP |
| `meta keywords` | 20 high-value French wedding terms |
| `meta robots` | `index, follow` |
| `link canonical` | `https://wedding-os.pages.dev/` |
| `link hreflang` | `fr`, `en`, `x-default` |

### Open Graph

| Property | Value |
|----------|-------|
| `og:type` | `website` |
| `og:locale` | `fr_FR` (alternate: `en_US`) |
| `og:title` | `WeddingOS — Organisez votre mariage simplement` |
| `og:description` | Short feature summary with offline USP |
| `og:image` | `/assets/icon-512.png` (512x512) |
| `og:url` | `https://wedding-os.pages.dev/` |

### Twitter Card

| Property | Value |
|----------|-------|
| `twitter:card` | `summary_large_image` |
| `twitter:title` | Same as OG title |
| `twitter:description` | Short description |
| `twitter:image` | `/assets/icon-512.png` |

### JSON-LD Structured Data

Type: `schema.org/SoftwareApplication`

```json
{
  "@type": "SoftwareApplication",
  "applicationCategory": "LifestyleApplication",
  "operatingSystem": "iOS, Android, Web",
  "offers": { "price": "0", "priceCurrency": "EUR" },
  "featureList": ["12 features from seo.json"],
  "inLanguage": ["fr", "en"]
}
```

### Crawler Directives

**`robots.txt`**:
- Allow: `/`, `/wedding/`
- Disallow: `/_expo/`, `/assets/`
- Sitemap: `https://wedding-os.pages.dev/sitemap.xml`

### HTTP Headers (`_headers` — Cloudflare Pages)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Assets: `Cache-Control: public, max-age=31536000, immutable`

---

## PWA Manifest (`manifest.json`)

Generated at build time from `i18n/locales/fr/seo.json` via `scripts/inject-pwa.js`.

| Field | Value |
|-------|-------|
| `name` | From `seo.manifestName` |
| `short_name` | `WeddingOS` |
| `description` | From `seo.manifestDescription` |
| `categories` | `lifestyle`, `productivity`, `utilities` |
| `lang` | `fr` |
| `display` | `standalone` |
| `shortcuts` | Budget, Invités, Planning (descriptions from translations) |

---

## Apple App Store ASO

### App Store Connect Fields

| Field | Recommended Value |
|-------|-------------------|
| **App Name** (30 chars) | `WeddingOS - Organiser Mariage` |
| **Subtitle** (30 chars) | `Budget, Invités & Planning` |
| **Keywords** (100 chars) | `mariage,wedding,budget,invités,prestataires,planning,checklist,RSVP,table,traiteur,organisateur,jour` |
| **Category** | Lifestyle (primary), Productivity (secondary) |
| **Promotional Text** | Planifiez votre mariage en toute sérénité : budget, invités, prestataires, planning et inspiration. 100% gratuit, 100% privé, fonctionne hors ligne. |

### App Store Description (recommended)

> **Organisez votre mariage simplement avec WeddingOS**
>
> WeddingOS est l'application gratuite et 100% privée pour planifier votre mariage de A à Z. Toutes vos données restent sur votre appareil — aucun compte requis, aucune donnée partagée.
>
> **Budget mariage**
> Suivez vos dépenses par catégorie (traiteur, lieu, photographe, fleuriste...). Visualisez le budget engagé vs confirmé. Recevez des alertes pour les acomptes à venir.
>
> **Liste d'invités & RSVP**
> Gérez vos invités avec suivi des RSVP, régimes alimentaires, accompagnants et groupes. Voyez en temps réel le nombre de confirmations.
>
> **Plan de table**
> Créez vos tables, assignez vos invités et suivez les places disponibles.
>
> **Prestataires**
> Comparez plus de 20 types de prestataires. Outil de comparaison de traiteurs avec scoring automatique. Suivi des devis, acomptes et statuts.
>
> **Planning & Checklist**
> Plus de 50 tâches pré-remplies avec dates automatiques. Vue timeline et kanban. Rappels personnalisables.
>
> **Mood board**
> Collectez vos inspirations : photos, couleurs, liens, tags. Organisez par collections.
>
> **Programme du Jour J**
> Créez le déroulé de votre journée et partagez-le avec vos invités via un lien.
>
> **Pourquoi WeddingOS ?**
> - 100% gratuit, sans publicité
> - Fonctionne hors ligne
> - Données privées (chiffrement AES-256)
> - Multi-mariage
> - Français et anglais

### iOS `infoPlist` Descriptions (in `app.json`)

| Key | Value |
|-----|-------|
| `NSPhotoLibraryUsageDescription` | WeddingOS a besoin d'accéder à vos photos pour vos idées d'inspiration mariage. |
| `NSCameraUsageDescription` | WeddingOS a besoin de l'appareil photo pour capturer vos inspirations mariage. |
| `NSFaceIDUsageDescription` | Utilisez Face ID pour déverrouiller WeddingOS. |

---

## Google Play Store ASO

### Play Console Fields

| Field | Recommended Value |
|-------|-------------------|
| **App Name** (30 chars) | `WeddingOS - Organiser Mariage` |
| **Short Description** (80 chars) | `Organisez votre mariage gratuitement : budget, invités, prestataires et planning` |
| **Category** | Lifestyle |
| **Content Rating** | Everyone |
| **Tags** | Wedding, Planner, Budget, Organizer |

### Full Description (recommended)

Same as the Apple App Store description above — Google Play allows up to 4000 characters. Use the same structure with keyword-rich headers.

### Google Play Specific Tips

- Include keywords naturally in the first 2 lines (they appear in search)
- Use bullet points for feature scanning
- Mention "gratuit" / "free" and "hors ligne" / "offline" prominently
- Add "sans publicité" (no ads) as a differentiator

---

## Translation Architecture

All SEO texts are managed in the i18n system:

```
i18n/locales/
├── fr/seo.json    # French SEO texts (primary)
├── en/seo.json    # English SEO texts
```

### Key mapping

| Translation Key | Used In |
|-----------------|---------|
| `seo.title` | `<title>` tag |
| `seo.description` | `<meta description>`, JSON-LD |
| `seo.shortDescription` | Twitter card description |
| `seo.keywords` | `<meta keywords>` |
| `seo.ogTitle` | OG & Twitter title |
| `seo.ogDescription` | OG description |
| `seo.ogImageAlt` | OG & Twitter image alt |
| `seo.manifestName` | PWA manifest name |
| `seo.manifestDescription` | PWA manifest description |
| `seo.weddingOf` | Dynamic public page title |
| `seo.defaultDescription` | Fallback OG description |
| `seo.featureList.*` | JSON-LD feature list |
| `seo.shortcuts.*` | PWA shortcut descriptions |

### Build-time usage

- `app/+html.tsx` imports `i18n/locales/fr/seo.json` directly (static render)
- `scripts/inject-pwa.js` reads `i18n/locales/fr/seo.json` to generate `dist/manifest.json`

### Runtime usage

- `app/wedding/[id].tsx` uses `useTranslation(["wedding-page", "seo"])` for dynamic OG meta on public wedding pages

---

## Files Modified

| File | Purpose |
|------|---------|
| `app/+html.tsx` | Web SEO meta tags, JSON-LD, OG, Twitter (from translations) |
| `app.json` | iOS/Android app store metadata, descriptions |
| `public/robots.txt` | Crawler directives |
| `public/manifest.json` | PWA manifest (source, overwritten at build) |
| `public/_headers` | Cloudflare security & cache headers |
| `scripts/inject-pwa.js` | PWA injection + manifest generation from translations |
| `package.json` | npm description, keywords, homepage |
| `i18n/locales/fr/seo.json` | French SEO translations |
| `i18n/locales/en/seo.json` | English SEO translations |
| `i18n/index.ts` | Register `seo` namespace |
| `app/wedding/[id].tsx` | Dynamic OG meta using `t()` |
