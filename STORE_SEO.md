# Store SEO — App Store & Google Play ASO

Source of truth for **Fiancé**'s store-listing optimization on the **Apple App Store** (id `6786687256`) and **Google Play** (`software.drakkar.fiance.app`). Split out of `CLAUDE.md` to keep that file focused on codebase guidance. The app ships FR-primary (France storefront) with English as the second market; live listing today is **"Fiancé – Organiser son mariage"**.

Three parts: the **App Store** metadata rules + optimized copy, the **Google Play** equivalents (different mechanics — Play indexes the full description, has no keyword field, normalizes accents), and the cross-store **growth / creative / discovery** levers. Keep this in sync whenever features or store copy change. Marketing wording lives in `apps/mobile/i18n/locales/{fr,en}/marketing.json`; `app.json` `description` is the web/PWA description, **not** the App Store one (App Store / Play fields are managed per-localization in App Store Connect / Play Console).

> **Verification caveat (applies throughout):** rules are anchored to Apple's and Google's own documentation, but exact competitor titles/subtitles/short-descriptions and some vendor benchmark numbers **could not be byte-verified** from the build environment (Apple/Play domains and several ASO-tool blogs return 403). Confirm competitor specifics via an ASO tool (AppTweak / Sensor Tower / Mobile Action) or a device on the target storefront before acting on them.

---

## App Store Optimization (ASO)

Source of truth for the Apple App Store listing copy. The app ships FR-primary (France storefront) with English as the second market. Live listing today: **"Fiancé – Organiser son mariage"** (id `6786687256`). This section captures the ASO rules and the optimized metadata to ship — keep it in sync whenever features or store copy change. Marketing wording lives in `apps/mobile/i18n/locales/{fr,en}/marketing.json`; `app.json` `description` is the web/PWA description, **not** the App Store one (the App Store fields are managed in App Store Connect, per-localization).

### How Apple indexes metadata (the rules that constrain everything below)

| Field | Limit | Indexed for search? | Weight |
|-------|-------|---------------------|--------|
| App Name / Title | **30** | ✅ yes | highest |
| Subtitle | **30** | ✅ yes | 2nd |
| Keywords field (hidden) | **100** | ✅ yes | 3rd |
| Promotional Text | **170** | ❌ no | — (editable without app review) |
| Description | **4000** | ❌ **no** | — (conversion only) |

Load-bearing facts (2025–2026, sourced from Apple Developer/Apple Ads + AppTweak/SplitMetrics/MobileAction):

- **The Description is NOT part of Apple's classic keyword index** (unlike Google Play, which fully indexes it). Its primary job is conversion — only the first ~3 lines (~170 chars) show before "more", so that hook is the highest-leverage copy. Caveat (WWDC25, June 2025): the description **and screenshots** now feed Apple's **AI-generated App Store Tags** and semantic/natural-language search, so the description has *indirect* discovery value. Still write it for humans — never keyword-stuff it (it won't rank the way a Play description does).
- **Ranking weight is Title > Subtitle > Keywords** — this ordering is **ASO practitioner consensus from testing**, not Apple-published. Apple only confirms all three are indexed for "text relevance" and gives no weights. Practically: put the single most valuable keyword in the Title, second tier in the Subtitle, long tail in the Keywords field.
- **Apple combines individual words across Title + Subtitle + Keywords _within one localization_** to form searchable phrases (e.g. "plan" in subtitle + "table" in subtitle → ranks for "plan de table"). So spread component words; don't write whole phrases redundantly.
- **Never duplicate a keyword** across Name/Subtitle/Keywords — Apple indexes each word once; repeats just waste your 160 indexable chars.
- **Keywords field syntax:** comma-separated, **no spaces after commas** (saves chars), **singular by default** (Apple stems plurals, so both usually = a wasteful duplicate — but singular vs plural *can* rank differently, so when you have spare chars and both terms have real volume, testing both is legitimate). **Special characters (`-`, `@`) are treated as blank spaces** — so `faire-part` indexes as the two tokens `faire`+`part` (fine — it still ranks for "faire part"; just know it isn't one atomic token). **Never** put in the keyword field: the brand/app name, the category name, or `app`/`free`/`gratuit`/stop-words ("the/to/for/son/de/la") — all indexed for free or ignored.
- **Words combine only WITHIN a locale, never across locales.** Each localization must carry complete, self-sufficient phrases. (You *may* deliberately repeat a word inside one locale's fields when you need it to form a multi-word phrase — the "no duplication" rule is about not wasting slots, not an absolute ban.)
- **Cross-localization stacking (free extra reach):** each storefront indexes a primary locale + secondary "backend" locales (verified against Apple's official App Store localizations reference). **The France storefront indexes THREE secondary locales: English (U.K.), Italian, and German** → each is a *second keyword bank* that ranks in France (guidance below only fills English (U.K.); Italian/German are extra unused banks). **The US storefront indexes exactly 9 secondaries** — Arabic, Chinese (Simplified), Chinese (Traditional), French, Korean, Portuguese (Brazil), Russian, Spanish (Mexico), Vietnamese → place *additional English* terms in those keyword fields to rank in the US. Never duplicate across the primary and its secondaries.
- **Accents (FR) — Apple only:** on the **App Store**, accented ≠ unaccented at indexing (`rétroplanning` and `retroplanning` are different tokens), and mobile users often type the unaccented form. Tactic: **accented forms in the visible Title/Subtitle** (credibility), **unaccented high-volume variants in the hidden Keywords field** (`retroplanning`, `invites`, `fete`, `prestataires`) — without duplicating a word already in the title/subtitle. (Apps targeting the accented form often *also* rank for the unaccented one, so this is a volume-capture optimization, not strictly either/or.) **Google Play normalizes accents** — do NOT double them there; see the Play section.
- **2025–2026 signals (WWDC25):** Apple added **AI-generated App Store Tags** (LLM reads metadata + description + screenshots), **semantic/natural-language search**, **Custom Product Page keyword binding** (a CPP can rank for its assigned keywords), and screenshot-text is now read for discovery (AI extraction, not classic OCR — real but not a firmly confirmed ranking surface; put captions near the top of screenshots). The keyword field is **100 today**, but WWDC25 demos showed **107 chars** — a possible near-future bump; treat 100 as the hard limit. None of the 30/30/100 limits or the Title/Subtitle/Keywords structure changed.

### Positioning (what to own vs. what to avoid)

Fiancé's differentiators map almost perfectly onto this category's whitespace:

- **Own the whitespace incumbents structurally can't claim:** privacy-first / **sans compte** / no sign-up / **hors-ligne** / no ads / no vendor spam / "your data stays on your device." Every major competitor (Zola, The Knot, WeddingWire, Bridebook, Joy, Mariages.net, Zankyou, Mariages.io) is account-gated and monetized via registry, vendor lead-gen, or a cash-fund wallet — the opposite of this app. These terms are low-*search-volume* (put them in the Description + keyword field, not the precious Subtitle) but high-*conversion* — they're the reason to choose us.
- **Own the under-contested high-intent keywords:** **seating chart / plan de table** (mostly owned by single-purpose niche apps, buried in incumbents' all-in-one listings) and, in FR, **rétroplanning** (well-searched, under-used by US-localized competitors who say "checklist" / "liste de tâches").
- **Don't fight on prestataires / annuaire / vendor marketplace / registry / wedding website:** Mariages.net (67k+ vendors) and Zola/Knot own these with capital and inventory we don't match. Mention vendors as *your own vendor notebook*, not a directory.
- Table-stakes quartet everyone lists (have them, but they don't differentiate alone): **checklist, budget, guest list, countdown**.

### Optimized metadata to ship

**🇫🇷 French (fr-FR — primary storefront locale)**
- **App Name (29/30):** `Fiancé : Organisation Mariage`
- **Subtitle (30/30):** `Budget, invités, plan de table`
- **Keywords (97/100):** `retroplanning,checklist,prestataire,rsvp,faire-part,invitation,planning,tache,ceremonie,placement`
- **Description — hook (first 3 lines, pre-"plus"):**
  > Organisez tout votre mariage au même endroit — invités, RSVP, plan de table, budget, prestataires et rétroplanning. 100 % privé, fonctionne hors ligne. Sans compte, sans publicité, sans démarchage.
- **Description — body:**
  > Fiancé est l'application d'organisation de mariage pensée pour les couples qui veulent tout gérer sereinement, sans céder leurs données.
  >
  > ✓ Liste d'invités & RSVP — suivez les confirmations, les accompagnants et les régimes alimentaires
  > ✓ Plan de table — glisser-déposer, tables rondes ou rectangulaires, export PDF
  > ✓ Budget mariage — suivez chaque dépense et acompte en temps réel
  > ✓ Prestataires — comparez, contactez et suivez traiteur, photographe, DJ, fleuriste…
  > ✓ Rétroplanning & checklist — ne rien oublier jusqu'au grand jour
  > ✓ Compte à rebours & widget — gardez le jour J en tête
  > ✓ Partage de photos — un album privé pour vos invités via QR code, sans compte
  > ✓ Site de mariage — partagez les infos avec vos invités
  >
  > 🔒 100 % privé — vos données restent sur votre téléphone. Aucune publicité, aucun tracking, aucune revente.
  > 📶 Hors ligne — tout fonctionne sans connexion. Synchronisation optionnelle chiffrée AES-256 avec votre partenaire.
  > 🆓 Gratuit — sans abonnement caché.
  >
  > Créez votre mariage en 30 secondes, sans inscription. Téléchargez Fiancé et commencez à organiser dès aujourd'hui.

**🇬🇧🇺🇸 English (en-US — primary for English storefronts)**
- **App Name (23/30):** `Fiancé: Wedding Planner`
- **Subtitle (28/30):** `Guest List, Budget & Seating`
- **Keywords (99/100):** `checklist,rsvp,countdown,chart,table,vendor,todo,organizer,private,offline,invitation,tracker,noads`
- **Description — hook (first 3 lines):**
  > Plan your entire wedding in one place — guest list, RSVPs, seating chart, budget, vendors and checklist. 100% private, works offline. No account, no ads, no vendor spam.
- **Description — body:**
  > Fiancé is the all-in-one wedding planner for couples who want to organize everything calmly — without handing over their data.
  >
  > ✓ Guest list & RSVP — track replies, plus-ones and dietary needs
  > ✓ Seating chart — drag & drop, round or rectangular tables, PDF export
  > ✓ Wedding budget — track every expense and deposit in real time
  > ✓ Vendors — compare, contact and track caterer, photographer, DJ, florist…
  > ✓ Checklist & timeline — never forget a thing before the big day
  > ✓ Countdown & widget — keep the date front of mind
  > ✓ Photo sharing — a private album for guests via QR code, no account
  > ✓ Wedding website — share details with your guests
  >
  > 🔒 100% private — your data stays on your device. No ads, no tracking, no data selling.
  > 📶 Offline — everything works without a connection. Optional AES-256 encrypted sync with your partner.
  > 🆓 Free — no hidden subscription.
  >
  > Create your wedding in 30 seconds, no sign-up. Download Fiancé and start planning today.

> Char counts verified against the 30/30/100 limits. Every keyword-field term is checked to **not** repeat any word already in that locale's Name or Subtitle (e.g. the fr-FR keyword field deliberately omits `organisation`, `mariage`, `budget`, `invités`, `plan`, `table`), and contains no brand/category/stop-words.

### Cross-localization stacking plan (App Store Connect — free extra keyword reach)

- **France storefront → enable the English (U.K.) localization** as a second keyword bank (indexed by the FR store). Name it `Fiancé: Wedding Planner`; fill its keyword field with English wedding terms French users also search, no fr-FR duplicates: `wedding,planner,seating,guest,countdown,vendor,rsvp,checklist,private,offline`.
- **France also indexes Italian and German** (two more free keyword banks the base plan leaves empty). Optional extra reach: add Italian (`matrimonio,invitati,tavoli,budget,scaletta,checklist`) and German (`hochzeit,gäste,tischplan,budget,checklist,countdown`) keyword fields — French users searching those terms, and IT/DE speakers in France, then rank too.
- **US storefront → fill the 9 secondary locales' keyword fields with additional English long-tail** (Spanish (Mexico), French, Portuguese (Brazil), Korean, Russian, Arabic, Chinese ×2, Vietnamese): `honeymoon,registry,save,date,bridal,groom,ceremony,reception,marriage,engagement,couples` — expands the indexable footprint from 160 toward ~1,440 chars.
- **Promotional Text (170, non-indexed, editable without review):** use for seasonal/timely hooks (e.g. "Nouvelle saison des mariages — organisez le vôtre, 100 % privé.").

### Maintenance rules

- When a feature is **added or renamed**, re-evaluate the **Subtitle** and **Keywords** first (highest ROI), not the Description.
- Never let a keyword appear in more than one of Name/Subtitle/Keywords **within a locale** — it's wasted space. Re-run the dedup check after any edit.
- Keep the **Description tuned for conversion, not keywords** (Apple doesn't index it). Protect the first 3 lines as the hook.
- Keep FR **accented** in the visible Title/Subtitle and push **unaccented** high-volume variants into the hidden keyword field.
- Exact competitor 30-char **subtitles could not be byte-verified** from this environment (Apple domains blocked); before a competitive-copy decision, confirm live via an ASO tool (AppTweak / Sensor Tower / Mobile Action) or a device set to the target storefront.

## Google Play Store Optimization (Play ASO)

Source of truth for the **Google Play** listing (`software.drakkar.fiance.app`). Play is optimized **separately from Apple** because the ranking mechanics are fundamentally different — do not copy the App Store keyword strategy here. Play fields are managed in Play Console, per-locale.

### Play vs. Apple — the differences that flip the whole strategy

| | App Store (Apple) | Google Play |
|---|---|---|
| Hidden keyword field | ✅ 100 chars | ❌ **none — doesn't exist** |
| Long **description** indexed for search? | ❌ no (conversion only) | ✅ **yes — fully indexed** |
| Where keywords go | Title + Subtitle + keyword field | **Title + Short description + Full description** (the descriptions *are* the keyword surface) |
| Keyword repetition | wasteful (indexed once) | **helpful in moderation** (repeat each core term ~3–5×, naturally) |
| Cross-locale stacking | ✅ yes (backend locales) | ❌ **no** — each locale self-contained (Google auto-translates/semantic-matches for some free reach) |
| Accents (é/è) | **distinct tokens** — index both forms | **normalized** — accented ranks for unaccented; do **NOT** double them |
| Keyword-list ("comma salad") copy | harmless in desc (not indexed) | **rejection risk** — metadata policy bans repetitive keywords |

- **Field limits:** Title **30**, Short description **80**, Full description **4000** (all three indexed; weight **Title > Short > Full**). Stable since the 2021 title cut from 50→30.
- **The long description IS a ranking asset** (not just conversion). Weave each target keyword **~3–5× in natural prose** (≈2–3% density; ~1 exact match per 250 chars). First ~167 chars show before "read more" — put primary keywords there, readably. Google's NLP **penalizes stuffing** — no synonym dumps.
- **Repetition across Title + Short + Full is positive on Play** (a relevance stack), unlike Apple where repeats waste slots. Still don't repeat the exact same phrase mechanically.
- **Metadata policy (rejection triggers, stricter than Apple):** in Title / Short description / icon / developer name — **no emojis, no ALL-CAPS** (unless it's the real brand), **no promo words** ("#1", "Best", "Top", "New", **"Free"/"Gratuit"**, "Sale"), no price, no "download now" CTAs in graphics, **no repetitive/irrelevant keyword lists**. (Emoji/✓ bullets are fine in the *long description* body — use sparingly, never as keyword substitutes.)
- **No cross-locale stacking:** set **fr-FR as the default locale** (untargeted locales fall back to it), add full **en-US** (+ en-GB) localizations. Don't expect English to "leak" into the FR store — localize deliberately.
- **Behavioral signals gate ranking** (much more than Apple): install **velocity**, ratings + review responses, **D1/D7/D30 retention**, low uninstalls, and **Android Vitals** (crashes/ANRs). The offline-first, no-account UX should help retention.
- **Play-only levers:** **Store Listing Experiments** (free built-in A/B test of icon/screenshots/short + full description — note the **Title is NOT testable**), and **Custom Store Listings** with **keyword-level targeting** (2025) for high-intent terms like "plan de table" / "seating chart". **Tags** (up to 5, from Google's fixed list) drive browse/Explore discovery, **not** keyword search.

### Optimized Play metadata to ship

**🇫🇷 French (fr-FR — default locale)**
- **Title (29/30):** `Fiancé : Organisation Mariage`
- **Short description (72/80):** `Invités, RSVP, plan de table, budget, rétroplanning. Privé et hors ligne`
- **Full description (indexed — weave keywords naturally):**
  > Organisez tout votre mariage au même endroit : invités, RSVP, plan de table, budget, prestataires et rétroplanning. Fiancé est 100 % privé et fonctionne hors ligne — sans compte, sans publicité, sans démarchage de prestataires.
  >
  > Fiancé est l'application d'organisation de mariage pensée pour les couples qui veulent tout gérer sereinement, sans céder leurs données personnelles.
  >
  > ✓ Liste d'invités & RSVP — suivez les confirmations, les accompagnants et les régimes alimentaires
  > ✓ Plan de table — glisser-déposer, tables rondes ou rectangulaires, export PDF
  > ✓ Budget mariage — suivez chaque dépense et acompte en temps réel
  > ✓ Prestataires — comparez, contactez et suivez traiteur, photographe, DJ, fleuriste (votre carnet, pas un annuaire)
  > ✓ Rétroplanning & checklist — un planning personnalisé pour ne rien oublier jusqu'au jour J
  > ✓ Compte à rebours & widget — gardez la date de votre mariage en tête
  > ✓ Partage de photos — un album privé pour vos invités via QR code, sans compte
  > ✓ Site de mariage — partagez les infos avec vos invités
  >
  > Privé — vos données restent sur votre téléphone. Aucune publicité, aucun tracking, aucune revente.
  > Hors ligne — tout fonctionne sans connexion. Synchronisation optionnelle chiffrée AES-256 avec votre partenaire.
  > Sans abonnement caché.
  >
  > Créez votre mariage en 30 secondes, sans inscription. Téléchargez Fiancé et commencez à organiser votre mariage dès aujourd'hui.

  Target density (FR): `mariage` ~8–12×, `plan de table` 2–3×, `invités` 3–4×, `rétroplanning` 2–3×, `budget` 3–4×, `prestataires` 2×, `RSVP` 2×, `privé`/`hors ligne`/`sans compte` 2–3× each — all already woven above; keep it that way on edits.

**🇬🇧🇺🇸 English (en-US — full localization)**
- **Title (23/30):** `Fiancé: Wedding Planner`
- **Short description (74/80):** `Guest list, RSVP, seating, budget, checklist. Private, offline, no account`
- **Full description (indexed — weave keywords naturally):**
  > Plan your entire wedding in one place: guest list, RSVPs, seating chart, budget, vendors and checklist. Fiancé is 100% private and works offline — no account, no ads, no vendor spam.
  >
  > Fiancé is the all-in-one wedding planner for couples who want to organize everything calmly — without handing over their data.
  >
  > ✓ Guest list & RSVP — track replies, plus-ones and dietary needs
  > ✓ Seating chart — drag & drop, round or rectangular tables, PDF export
  > ✓ Wedding budget — track every expense and deposit in real time
  > ✓ Vendors — compare, contact and track caterer, photographer, DJ, florist (your own notebook, not a directory)
  > ✓ Checklist & timeline — a personalized wedding checklist so you never forget a thing before the big day
  > ✓ Countdown & widget — keep your wedding date front of mind
  > ✓ Photo sharing — a private album for guests via QR code, no account
  > ✓ Wedding website — share details with your guests
  >
  > Private — your data stays on your device. No ads, no tracking, no data selling.
  > Offline — everything works without a connection. Optional AES-256 encrypted sync with your partner.
  > No hidden subscription.
  >
  > Create your wedding in 30 seconds, no sign-up. Download Fiancé and start planning your wedding today.

  Target density (EN): `wedding` ~8–12×, `seating chart` 2×, `guest list` 3×, `budget` 3×, `checklist` 2×, `vendors` 2×, `RSVP` 2×, `private`/`offline`/`no account` 2–3× each.

### Play maintenance rules

- **Title:** keep it policy-clean (no "Gratuit/Free", no "#1", no emoji, no ALL-CAPS). Put the #1 keyword (`Mariage` / `Wedding Planner`) here — the highest-weight, fastest-moving lever (rank shifts in 48–72h after a title change).
- **Short description (80):** the 2nd-highest-weighted field and the most under-optimized — pack the high-value keywords the Title lacks, still reading naturally; don't repeat Title words.
- **Full description:** on a feature add/rename, re-weave the new term ~3–5× in natural prose and put it in the hook (first ~167 chars). Never convert it into a keyword list — that's a rejection trigger.
- **Accents:** write correctly accented everywhere in FR (Play normalizes, so unaccented is covered for free) — do **not** duplicate accented/unaccented as on Apple.
- **Don't fight the directory game** (Mariages.net, Zankyou) or registry/cash-fund (Mariages.io "wallet") — frame vendors as *your own notebook*. Own the whitespace no Play competitor can: **private / no account / offline / no ads** (indexed here, so it earns free long-tail) plus **plan de table / rétroplanning / seating chart**.
- Competitor **titles and 80-char short descriptions could not be byte-verified** here (Play + mirrors blocked); confirm live via an ASO tool or a device on the target storefront before mirroring competitor copy. Closest FR structural analogs to study: **MyWed**, **Weddi**, **Mariage de A à Z**; closest "no-ads/clean" EN analog: **The Big Day**.

## ASO growth, creative & discovery (both stores)

Everything above is **metadata** (keyword ranking). This section is the rest of ASO — the creative, behavioral, seasonal, and advanced-surface levers that move **conversion** and **discovery**, which now feed ranking on both stores. Sourced from Apple/Google official docs + AppTweak/MobileAction/SplitMetrics/Phiture/Gummicube (2025–2026). Numbers marked "practitioner-measured" are vendor benchmarks, not store-published — directional.

### Keyword research workflow (repeatable)

- **Score every candidate on the triad: volume × difficulty × relevance.** Small/new-app target zone = **low difficulty, mid/low but real volume, high-relevance long-tail first** (rule of thumb difficulty <~30–40, popularity ~20–40 — tool-relative). "plan de table mariage" beats "mariage". Long-tail converts better and builds the authority to later contest heads. Bucket into: high-opportunity → Title/Subtitle; test; long-tail → ship first.
- **Volume signals:** Apple Search Ads "Popularity" (7-day normalized impressions) is the classic free-ish iOS proxy but **directional only, and since Oct 2025 the API returns nothing below ~35** (no data ≠ zero volume). Always cross-check with **App Store + Play search autocomplete** (free, real queries) and, for Play + seasonality, **Google Trends / Keyword Planner**.
- **Gap analysis:** pick **5–8 *keyword* competitors** (apps that actually rank for your terms, not brands you consider rivals), pull their ranked keyword sets, target their **unique low-difficulty high-intent** terms. **Skip directory/registry gaps** (off-positioning). Re-scan every **60–90 days**. Mine **reviews** (yours + competitors') for the phrases users actually type.
- **Change cadence & measurement:** App Store metadata **~every 4 weeks** (algorithm needs 3–4 wks to settle), Play **~6–8 weeks**. Snapshot ranks before shipping, change **one variable at a time**, then read rank at **7–14 days** (first signal), **4–8 weeks** (confidence), **~30 days** (downloads). Track daily, decide monthly. (Promotional Text is the exception — change anytime, see below.)

### Creative & conversion (highest-leverage after the icon)

The funnel: **impression → page view = TTR** (driven by icon + name/subtitle + first 1–3 screenshots / Play video-poster) and **page view → install = CVR** (full gallery, captions, video, hook, ratings). Optimize **icon + first screenshot first** — they compound on every impression. Practitioner lift: icon ≈ +30%, screenshots ≈ +22%.

- **Icon:** one idea, legible at 60px, **no text** (the name sits beside it), high contrast + a distinctive background color the incumbents don't own (our clay `#b96a4a`). **You cannot ship one file to both stores:** Apple wants a **square full-bleed, layered for iOS 26 Liquid Glass** (don't bake in rounded corners/shadows/glass — the system applies them); Play wants a **512² adaptive icon** (fg+bg layers, keep art in the center 72/108 dp safe zone). Icon A/B winners lift ~3–6% (iOS) / ~8–12% (Play).
- **Screenshots:** **~100% of visitors see the first 1–3; only ~9% reach the end** — front-load. Portrait. Apple shows the **first 2–3 in search**; sequence them as a story: (1) hero "organise tout votre mariage", (2) the standout **plan de table / seating chart**, (3) trust "100 % privé, hors ligne, sans compte". **Captions: 3–5 words, benefit-led, top of frame.** Apple now requires only the **6.9″ (1290×2796) portrait set** (auto-scales down; 5.5″ retired) + an iPad 13″ set if supported; Play wants 1080×1920 + tablet sets. **Localized screenshots ≈ +10–20% CVR** in non-English locales — ship distinct FR (primary) and EN sets, adapting the hero message, not just translating.
- **WWDC25 — captions now double as discovery:** Apple's AI reads screenshot text (semantic extraction) to build App Store Tags + power natural-language search. Put **real category phrases** ("plan de table", "budget mariage", "100 % privé") as top captions on the first 3 shots — conversion *and* discovery from the same words. Don't stuff; review/deactivate assigned Tags in App Store Connect.
- **App preview video:** optional and only if clearly better than your first two screenshots (Apple **autoplays it muted and it displaces the hero screenshot**). Apple: **15–30s, 30fps, muted-autoplay**, first 3–5s decide, show real UI. Play: a **YouTube URL, ≤~2min**, autoplays over the feature graphic.
- **Feature graphic (Play only, required):** **1024×500, no alpha**, keep the center clear (a play-button overlays it when a video is attached), minimal text, vibrant/high-contrast, localize + A/B test it.
- **A/B testing:** Apple **PPO** (up to 3 treatments; **icon/screenshots/video only**, no text; one test at a time, ≤90 days; **icon variants must ship in the binary**; needs App Review). Play **Store Listing Experiments** (icon/screenshots/feature graphic/**short+full description** — but **Title is NOT testable**; multiple/localized concurrent; optimize for **retained first-time installers**). Both: **one variable at a time, run ≥7 days, wait for significance, test bold changes** (subtle ones never reach significance on a small app). Test order by ROI: first screenshot → icon → video → feature graphic.

### Ratings, reviews & behavioral signals

- **Rating is the biggest conversion lever after icon/screenshots.** Keep **≥4.0 (floor), target ≥4.5**. Practitioner-measured: a **0.4-star gap ≈ 25% fewer installs**; **3.6→4.2 ≈ +60% conversion**; **90% of featured apps are 4.0+**. Algorithms weigh average + volume + **velocity + recency** — a steady trickle beats a one-time burst.
- **Prompt via the native APIs only, at a moment of delight** (after finishing a seating table, first RSVP, checklist milestone) — **never on launch, never wired to a button, never mid-task**. Apple `requestReview` (`StoreKit`): **max 3 prompts/user/365 days**, no feedback on whether it showed. Play In-App Review API: **~monthly quota, render the card unmodified**, and for any explicit "rate us" button **deep-link to the store listing** (not the API — the quota makes the card often not appear). **Banned on both, actively enforced:** incentivized reviews and sentiment **gating/pre-screening** ("do you like the app?" before the prompt).
- **Respond to reviews** (especially negative, especially on Play — it's a Play ranking + conversion factor): ~**+0.7★** on the responded review, ~38–70% of users revise, and the update refreshes recency. Reply within 24–48h, specific and human. **Play also indexes review text for search** — descriptive user reviews ("plan de table", "budget mariage") are a Play-only keyword lever.
- **Behavioral signals now gate ranking on both** (weight shifted from raw downloads → retention/quality): install **velocity** (recent rate, category-relative — concentrate installs into peaks), **conversion rate** (high impressions + low CVR *hurts* rank), **retention** (D1 ~25–35% / D7 ~10–15% benchmarks), **uninstalls**. **Android Vitals (Play, hard gate):** user-perceived **crash rate ≥1.09%** or **ANR ≥0.47%** (overall; 8% per-device) → demoted, no keyword work overcomes it; **excessive partial wake locks affect visibility from March 1 2026** (audit the encrypted-sync path). The no-account/offline 30-second onboarding is a **retention asset — protect it**.

### Seasonality (wedding-specific — a lever most listings ignore)

- **Engagement season = late Nov → mid-Feb** (~**47% of couples engage Thanksgiving→Valentine's**; December is the #1 proposal month). This is the **acquisition peak** for a *planning* app — newly-engaged couples download immediately. Target "just engaged / start planning / on se marie / fiancé(e)s".
- **Wedding-execution season = ~Jan → Oct, search peaks July** — seating chart / plan de table, day-of timeline, RSVP, final headcount.
- **Act ~3–4 weeks ahead:** ship the engagement angle by **mid-Nov**, the execution angle by **late March**. Rotate seasonal hooks through **Apple Promotional Text** (free to change) + **In-App Events** / **Play LiveOps Events**; time **featuring nominations** 6–8 weeks before each peak; concentrate paid/PR install velocity into the peak (velocity is category-relative).

### Getting featured (editorial)

- **Apple — Featuring Nominations** (App Store Connect, self-serve; types: New Content / App Enhancements / App Launch). Lead time **min 2 weeks, up to 3 months; 6–8 weeks before an app launch**. Scored on 7 criteria: UX, **UI design**, innovation, uniqueness, **accessibility**, **localization**, product-page quality (+ ratings). Editors reward **latest-OS-feature adoption** (our **iOS widget**, Live Activities), **privacy leadership** (our whole story), **strong FR localization**, and **timeliness** (wedding season). Nominate feature ships as "App Enhancements" and the seasonal moment as "New Content".
- **Play — no public nomination form**; earn Editors' Choice via **quality + clean Android Vitals + regular updates (1–2×/month)** + Play Console Help. LiveOps/Promotional Content signals active investment → improves feature odds.

### Apple advanced surfaces

- **In-App Events** — bonus indexed search real estate: event **name (30) + short desc (50) are indexed** (long desc 120 is not) = **~80 extra indexed chars per event**. Max **10 live / 15 staged**, ≤31 days, pre-promote ≤14 days, needs a Universal Link + independent review. Must be genuinely new/timed content (no daily/awareness/price-only events). Use "Major Update" on real feature ships, "Special Event" for wedding season.
- **Custom Product Pages (CPP)** — **up to 70** (raised Oct 2025); alternate screenshots/preview/promo text (same name/subtitle/icon), each with its own URL. **July 2025 "Search Visibility" keyword binding**: assign already-ranking keywords to a CPP so *that* page shows in organic search for them. **CPPs do NOT expand your keyword index** — they change *which page* appears. Build one each for seating / budget / RSVP / privacy audiences (screenshots leading with that feature); reuse for Apple Search Ads ad groups.
- **Product Page Optimization (PPO)** — the A/B tool (see Creative above): icon/screenshots/video only, 3 treatments, ≤90 days.
- **Promotional Text (170, ~70 before the fold)** — **editable anytime WITHOUT app review**, **not indexed** → pure conversion/timeliness. Refresh every 2–4 weeks for seasons/feature ships; use as a crude A/B tool (copy A two weeks vs copy B two weeks).
- **Apple Search Ads ↔ organic are one system:** a tiny **Discovery campaign** (Search Match + broad match) + the **Search Terms report** reveals the real queries that convert — feed winners into Title/Subtitle/keywords, add irrelevant ones as negatives. Paid install **velocity lifts organic rank** for the same term (then lower the bid). From **March 2026** paid search slots expand to positions 2–5.
- **App Clips** — install-free, account-free slices launched via **QR / NFC / Safari banner**; **not in App Store search / don't affect keyword rank**, but editors like them and they drive full installs + ratings. **Directly fits the QR photo-sharing feature**: guests scan a QR at the wedding to upload photos with no install/account. Card copy: title 30, subtitle 56.
- **Privacy "Nutrition" label / "Data Not Collected" badge** — a trust/conversion surface (not ranking) our privacy-first model can max out vs account-gated rivals; keep it accurate (Apple audits) and echo it in screenshots/description.
- **Web→app:** add `<meta name="apple-itunes-app" content="app-id=6786687256, app-argument=…">` to `fiance.drakkar.software` pages for the native **Smart App Banner** (iOS Safari), and configure **Universal Links** (AASA file) so shared wedding-website / photo links deep-link into the app. iOS Safari only.
- **WWDC25 AI Tags & semantic search** — you can't set Tags but you **influence** them: write metadata/description in **natural scenario phrasing** ("organiser son mariage sans compte", "plan de table glisser-déposer"), put category phrases in **screenshot captions**, and encourage everyday-language reviews. The LLM reads metadata + description + screenshots + (indirectly) reviews together.

### Play advanced surfaces & web-SEO synergy

- **Custom Store Listings (CSLs)** — **up to 50** (100 for partners); target by country / install-state / pre-registration / **deep-link URL** / **search keyword (2025)**. **Unlike Apple CPPs, keyword-targeted CSLs DO rank in Play search** — a searcher for the term sees the tailored page. Build keyword CSLs for `plan de table`/`seating chart`, `rétroplanning`, `budget mariage`, `faire-part/RSVP`, plus a **deep-link CSL bound to the website CTA** so web→Play lands message-matched. Console's **Gemini** can draft CSL copy (EN-first) from a keyword recommendation.
- **Store Listing Experiments** — the Play A/B tool (Title not testable; optimize retained installers — see Creative above).
- **Tags & category** — **≤5 tags from Google's fixed list** drive **browse/Explore/"similar apps"**, **not search**; pick only obviously-relevant ones. Category: **Lifestyle** (or Productivity).
- **Website ↔ Play SEO synergy (Apple has no equivalent):** Play listings rank in **Google web Search**, and Google uses **off-platform signals — backlinks + branded search demand — for Play ranking**. The blog + web tools at `fiance.drakkar.software` build topical authority that feeds Play discovery. **Verify Android App Links** (`assetlinks.json`) mapping web seating/budget/timeline pages to matching app screens **only where content matches** (Google indexes the web page, then opens the app) — reported ~15–25% install uplift. Let the site own long-tail informational queries and the Play page own install-intent queries (avoid cannibalization).
- **Pre-registration & launch:** pre-reg converts ~30–40% at launch (max 90-day campaign); **Day-1 install velocity is a strong ranking signal**. Staged rollout: start 5–20%, watch crash/ANR ≥24h, ramp; you can halt (prior version auto-restores).
- **LiveOps / Promotional Content** — Offers / Events / Major Updates (max 1 week live); signals active investment → editorial odds + re-engagement. Use for wedding season + major feature drops.
- **I/O 2026 "Ask Play" (Gemini)** — a chat overlay on the listing answers prospective-user questions from **listing copy + screenshots + web content** before install (Play's analog of Apple's AI Tags). Write metadata so an LLM can accurately state the differentiators (private, offline, no account, seating chart, rétroplanning).

### Additional wedding keyword opportunities (beyond the shipped picks)

Component words matter (Apple combines within a locale; Play indexes the description) — ensure these appear somewhere (Subtitle, keyword field, or description prose), without duplicating the shipped picks.

- **EN — add:** `save the date`, `wedding website` (we ship it; 74% of couples use one), `guest list manager`, `wedding planning` (gerund vs "planner"), `table plan`/`seating plan` (British — indexed in the France store's English (U.K.) bank), `plus one`, `wedding timeline`/`day of`, `wedding budget calculator`, and seasonal `just engaged`/`engagement`. Description-prose/secondary-bank only: `bride`, `groom`, `bridal`, `honeymoon`, `ceremony`, `reception`.
- **FR — add:** `wedding planner` (**high-volume loanword in France**), `organiser`/`organiser son mariage` (the verb form, distinct from "organisation"), `compte à rebours` (we ship the countdown/widget), `plan de salle` (venue layout ≠ plan de table), `préparatifs mariage`, `placement invités`, `check-list mariage`, and description-prose niches `témoins`/`demoiselle d'honneur`/`cortège`, `PACS`.
- **AVOID:** FR **`liste de mariage`** — in French it means the **gift registry** (off-positioning; pulls mismatched, low-converting traffic that hurts rank). Likewise EN/FR **registry / marketplace / annuaire** terms — we're privacy-first, not a monetized directory.
- **Accents:** Apple only — accented in the visible Title/Subtitle, unaccented high-volume variants (`retroplanning`, `invites`, `fete`, `prestataires`, `ceremonie`, `temoins`, `preparatifs`) in the hidden keyword field. **Play normalizes accents — never double them there.**
