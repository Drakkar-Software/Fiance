import { postPair, pairsToArrays } from "./blog-posts-shared";
import type { BlogSection } from "./blog-types";

const fiancePlanningFr = (paragraphs: string[]): BlogSection => ({
  type: "text",
  title: "Comment Fiancé peut vous aider",
  paragraphs,
});

const fiancePlanningEn = (paragraphs: string[]): BlogSection => ({
  type: "text",
  title: "How Fiancé can help",
  paragraphs,
});

const FIANCE_MODEL_FR =
  "Fiancé est une app respectueuse de la vie privée : sans pub, sans abonnement. Budget, invités, RSVP, plan de table, prestataires, planning, tâches, timeline jour J, suivi des invitations et hébergement invités sont gratuits. Un achat unique à vie débloque la sync chiffrée multi-appareils (iOS, Android, web), le partage couple et la page publique complète.";

const FIANCE_MODEL_EN =
  "Fiancé is a privacy-respecting app: no ads, no subscription. Budget, guests, RSVP, seating chart, vendors, planning, tasks, day-of timeline, invitation tracking, and guest lodging are free. A one-time lifetime purchase unlocks encrypted multi-device sync (iOS, Android, web), partner sharing, and the full public page.";

const FIANCE_FREE_FEATURES_FR = [
  "Budget : dépenses, acomptes, échéances, export PDF/CSV",
  "Invités et RSVP en ligne (page publique, sans compte invité)",
  "Plan de table drag-and-drop, sync RSVP, export PDF traiteur",
  "Prestataires : devis, statuts prospect → réservé, comparateur traiteur",
  "Planning : checklist, tâches, rétroplanning calé sur la date",
  "Timeline jour J minute par minute, mode lecture le grand jour",
  "Suivi invitations : save-the-date, faire-part, communications par invité",
  "Hébergement invités : hôtels, gîtes, qui loge où",
];

const FIANCE_FREE_FEATURES_EN = [
  "Budget: expenses, deposits, due dates, PDF/CSV export",
  "Guests and online RSVP (public page, no guest account)",
  "Drag-and-drop seating chart, RSVP sync, caterer PDF export",
  "Vendors: quotes, prospect → booked status, caterer comparator",
  "Planning: checklist, tasks, timeline tied to wedding date",
  "Day-of timeline minute by minute, read mode on the big day",
  "Invitation tracking: save-the-date, invites, per-guest comms",
  "Guest lodging: hotels, rentals, who stays where",
];

const FIANCE_PREMIUM_FR = [
  "Achat unique à vie, jamais d'abonnement mensuel",
  "Sync chiffrée multi-appareils : iOS, Android et web",
  "Partage du mariage avec votre conjoint",
  "Page publique complète pour vos invités (RSVP, FAQ, programme)",
];

const FIANCE_PREMIUM_EN = [
  "One-time lifetime purchase, never a monthly subscription",
  "Encrypted multi-device sync: iOS, Android, and web",
  "Share the wedding with your partner",
  "Full public page for guests (RSVP, FAQ, schedule)",
];

const fianceFreeListFr = (): BlogSection => ({
  type: "list",
  title: "Fonctions Fiancé incluses gratuitement",
  items: FIANCE_FREE_FEATURES_FR,
});

const fianceFreeListEn = (): BlogSection => ({
  type: "list",
  title: "Fiancé features included free",
  items: FIANCE_FREE_FEATURES_EN,
});

const fiancePremiumListFr = (): BlogSection => ({
  type: "list",
  title: "Premium : achat unique à vie (pas d'abonnement)",
  items: FIANCE_PREMIUM_FR,
});

const fiancePremiumListEn = (): BlogSection => ({
  type: "list",
  title: "Premium: one-time lifetime purchase (no subscription)",
  items: FIANCE_PREMIUM_EN,
});

const pairs = [
  postPair({
    slug: "fiance-vs-mariages-net",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Fiancé vs Mariages.net : quel outil pour organiser votre mariage ?",
    titleEn: "Fiancé vs Mariages.net: which tool to plan your wedding?",
    excerptFr:
      "Annuaire prestataires vs app privée : budget, RSVP, plan de table, pubs et données. Un comparatif honnête entre les deux approches.",
    excerptEn:
      "Vendor directory vs private app: budget, RSVP, seating, ads, and data. An honest comparison of both approaches.",
    readingMinutes: 8,
    heroAltFr: "Comparatif Fiancé et Mariages.net",
    heroAltEn: "Fiancé vs Mariages.net comparison",
    date: "2026-07-02",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Mariages.net est la référence française pour trouver un traiteur, une salle ou un photographe. Le groupe The Knot Worldwide revendique plus de 77 000 prestataires et des outils gratuits : budget, checklist, invités, plan de table, site de mariage.",
          FIANCE_MODEL_FR,
          "Ce n'est pas un annuaire prestataires. Les deux outils peuvent coexister.",
        ],
      },
      {
        type: "list",
        title: "Ce que Mariages.net fait bien",
        items: [
          "Base prestataires massive en France, avec avis et photos",
          "Outils gratuits connectés entre eux (budget, invités, tables)",
          "Site de mariage et RSVP via le planificateur web",
          "Communauté et retours d'expérience (forum, magazine)",
          "Application mobile dédiée",
        ],
      },
      fianceFreeListFr(),
      fiancePremiumListFr(),
      {
        type: "text",
        title: "Tableau comparatif rapide",
        paragraphs: [
          "| Critère | Fiancé | Mariages.net |",
          "| Annuaire prestataires | Non (vous ajoutez les vôtres) | Oui, cœur du produit |",
          "| Compte invité RSVP | Non requis | Compte / site couple |",
          "| Publicités | Aucune | Emails et mises en avant prestataires |",
          "| Données | Locales, sync chiffrée (achat unique) | Cloud compte Mariages.net |",
          "| Abonnement | Non (achat unique optionnel) | Non (marketplace) |",
          "| Page publique invités | Oui (RSVP sans compte) | Oui (via site couple) |",
          "| Plan de table avancé | Oui, PDF export | Oui, basique à intermédiaire |",
          "| Prix couple | Gratuit + premium à vie optionnel | Gratuit (monétisé marketplace) |",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Notre recommandation : utilisez Mariages.net pour la découverte de prestataires si vous en avez besoin, puis centralisez budget, RSVP, plan de table et jour J dans Fiancé. Voir aussi [Excel vs application mariage](/blog/excel-vs-application-mariage).",
        ],
      },
      fiancePlanningFr([
        "Testez Fiancé sans compte via le [simulateur budget](/tools/budget-calculator), le [plan de table](/tools/seating-chart) et la [timeline jour J](/tools/timeline). Importez ensuite votre liste et vos devis dans l'app iOS, Android ou web.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Mariages.net is the French go-to for finding a caterer, venue, or photographer. The Knot Worldwide group claims 77,000+ vendors and free tools: budget, checklist, guests, seating, wedding website.",
          FIANCE_MODEL_EN,
          "It is not a vendor directory. Both tools can coexist.",
        ],
      },
      {
        type: "list",
        title: "What Mariages.net does well",
        items: [
          "Massive vendor database in France with reviews and photos",
          "Free connected tools (budget, guests, tables)",
          "Wedding site and RSVP through the web planner",
          "Community and inspiration (forum, magazine)",
          "Dedicated mobile app",
        ],
      },
      fianceFreeListEn(),
      fiancePremiumListEn(),
      {
        type: "text",
        title: "Quick comparison table",
        paragraphs: [
          "| Criteria | Fiancé | Mariages.net |",
          "| Vendor directory | No (you add your own) | Yes, core product |",
          "| Guest RSVP account | Not required | Couple site / account |",
          "| Ads | None | Vendor emails and promoted listings |",
          "| Data | Local, encrypted sync (one-time purchase) | Mariages.net cloud account |",
          "| Subscription | No (optional lifetime purchase) | No (marketplace) |",
          "| Guest public page | Yes (RSVP without account) | Yes (via couple site) |",
          "| Advanced seating | Yes, PDF export | Yes, basic to intermediate |",
          "| Couple pricing | Free + optional lifetime premium | Free (marketplace monetized) |",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Our take: use Mariages.net for vendor discovery if you need it, then centralize budget, RSVP, seating, and day-of in Fiancé. See also [Excel vs wedding app](/blog/excel-vs-application-mariage).",
        ],
      },
      fiancePlanningEn([
        "Try Fiancé without an account via the [budget calculator](/tools/budget-calculator), [seating chart](/tools/seating-chart), and [day-of timeline](/tools/timeline). Then import your list and quotes into the iOS, Android, or web app.",
      ]),
    ],
  }),

  postPair({
    slug: "fiance-vs-zankyou",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Fiancé vs Zankyou : site de mariage ou vrai planificateur ?",
    titleEn: "Fiancé vs Zankyou: wedding website or real planner?",
    excerptFr:
      "Liste de mariage, site invités, annuaire : les forces de Zankyou. Budget détaillé, plan de table, offline : celles de Fiancé.",
    excerptEn:
      "Gift registry, guest site, directory: Zankyou's strengths. Detailed budget, seating, offline: Fiancé's.",
    readingMinutes: 7,
    heroAltFr: "Comparatif Fiancé et Zankyou",
    heroAltEn: "Fiancé vs Zankyou comparison",
    date: "2026-07-03",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Zankyou est connu en France pour son site de mariage gratuit, sa liste de cadeaux (cagnotte ou carte partenaire) et son annuaire de prestataires. La plateforme, fondée en Espagne, s'intègre désormais à l'écosystème Mariages.net / The Knot.",
          FIANCE_MODEL_FR,
        ],
      },
      {
        type: "list",
        title: "Forces de Zankyou",
        items: [
          "Site de mariage personnalisable (programme, hébergement, save-the-date)",
          "Liste de mariage en ligne avec virement ou carte partenaire",
          "RSVP et communication invités via le site",
          "Annuaire prestataires et magazine inspiration",
          "Gratuit pour les couples (modèle marketplace)",
        ],
      },
      fianceFreeListFr(),
      fiancePremiumListFr(),
      {
        type: "text",
        title: "Quel outil selon votre profil",
        paragraphs: [
          "Choisissez Zankyou si la liste de mariage et un site vitrine beau sont votre priorité numéro un, et si vous acceptez une navigation orientée prestataires.",
          "Choisissez Fiancé si vous voulez un cockpit unique pour le budget réel, le plan de table traiteur, le déroulé jour J et la confidentialité des données invités (adresses, allergies, plafond budget).",
        ],
      },
      fiancePlanningFr([
        "Fiancé inclut une [page web de mariage](/blog/creer-page-web-mariage) et le [RSVP en ligne](/blog/rsvp-en-ligne-sans-compte). Pour la liste cadeaux, vous pouvez lier une cagnotte externe depuis la FAQ invités. Commencez par le [budget](/tools/budget-calculator).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Zankyou is known in France for its free wedding website, gift registry (cash pot or partner card), and vendor directory. The Spain-founded platform now sits inside the Mariages.net / The Knot ecosystem.",
          FIANCE_MODEL_EN,
        ],
      },
      {
        type: "list",
        title: "Zankyou strengths",
        items: [
          "Custom wedding site (schedule, lodging, save-the-date)",
          "Online gift list with bank transfer or partner card",
          "RSVP and guest comms through the site",
          "Vendor directory and inspiration magazine",
          "Free for couples (marketplace model)",
        ],
      },
      fianceFreeListEn(),
      fiancePremiumListEn(),
      {
        type: "text",
        title: "Which tool for your profile",
        paragraphs: [
          "Pick Zankyou if the gift registry and a polished showcase site are priority one, and you accept vendor-oriented navigation.",
          "Pick Fiancé if you want one cockpit for real budget, caterer seating chart, day-of run sheet, and guest data privacy (addresses, allergies, budget cap).",
        ],
      },
      fiancePlanningEn([
        "Fiancé includes a [wedding web page](/blog/creer-page-web-mariage) and [online RSVP](/blog/rsvp-en-ligne-sans-compte). For gifts, link an external cash fund from the guest FAQ. Start with [budget](/tools/budget-calculator).",
      ]),
    ],
  }),

  postPair({
    slug: "fiance-vs-mywed",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Fiancé vs MyWed : deux apps tout-en-un face à face",
    titleEn: "Fiancé vs MyWed: two all-in-one apps compared",
    excerptFr:
      "Tâches, budget, invités, sync couple : MyWed et Fiancé visent le même usage. Différences sur la vie privée, le plan de table et le modèle économique.",
    excerptEn:
      "Tasks, budget, guests, couple sync: MyWed and Fiancé target the same job. Differences on privacy, seating, and pricing model.",
    readingMinutes: 7,
    heroAltFr: "Comparatif Fiancé et MyWed",
    heroAltEn: "Fiancé vs MyWed comparison",
    date: "2026-07-05",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "MyWed se présente comme une app tout-en-un : liste d'invités, tâches, budget, prestataires, sync multi-appareils. Plus de 800 000 couples l'utilisent selon la fiche Google Play.",
          FIANCE_MODEL_FR,
        ],
      },
      {
        type: "list",
        title: "Points communs",
        items: [
          "Liste invités avec RSVP et groupes",
          "Checklist / rétroplanning calé sur la date",
          "Suivi budget et prestataires",
          "Sync à deux (conjoint ou famille)",
          "Apps mobiles iOS et Android",
        ],
      },
      fianceFreeListFr(),
      fiancePremiumListFr(),
      {
        type: "list",
        title: "Différences clés",
        items: [
          "Fiancé : pas d'abonnement, premium = achat unique à vie",
          "Fiancé : RSVP public sans compte invité",
          "Fiancé : données locales par défaut, zéro pub",
          "MyWed : compte cloud central, modèle SaaS classique",
          "MyWed : notifications push tâches, 11 langues",
        ],
      },
      {
        type: "quote",
        quote:
          "Le bon critère n'est pas « qui a le plus de modules », mais « où vivent vos données invités et qui peut les voir ».",
      },
      fiancePlanningFr([
        "Comparez sur un vrai cas : importez 80 invités, posez un budget à 18 000 €, construisez un [plan de table](/tools/seating-chart) et exportez la [timeline](/tools/timeline). Fiancé est gratuit sur ces briques essentielles.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "MyWed pitches itself as all-in-one: guest list, tasks, budget, vendors, multi-device sync. Google Play lists 800,000+ couples.",
          FIANCE_MODEL_EN,
        ],
      },
      {
        type: "list",
        title: "Shared ground",
        items: [
          "Guest list with RSVP and groups",
          "Checklist / timeline tied to wedding date",
          "Budget and vendor tracking",
          "Two-person sync (partner or family)",
          "iOS and Android mobile apps",
        ],
      },
      fianceFreeListEn(),
      fiancePremiumListEn(),
      {
        type: "list",
        title: "Key differences",
        items: [
          "Fiancé: free with no subscription, premium = one-time lifetime purchase",
          "Fiancé: public RSVP without guest account, couple public page",
          "Fiancé: encrypted multi-device sync (iOS, Android, web) with premium",
          "Fiancé: zero ads, local data by default",
          "MyWed: central cloud account, classic SaaS model",
          "MyWed: international ecosystem, task push notifications",
        ],
      },
      {
        type: "quote",
        quote:
          "The right criterion is not \"who has the most modules\" but \"where guest data lives and who can see it\".",
      },
      fiancePlanningEn([
        "Compare on a real scenario: import 80 guests, set an €18,000 budget, build a [seating chart](/tools/seating-chart), and export the [timeline](/tools/timeline). Fiancé is free on these core bricks.",
      ]),
    ],
  }),

  postPair({
    slug: "top-5-applications-mariage-2026",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Top 5 des meilleures applications mariage en 2026",
    titleEn: "Top 5 best wedding apps in 2026",
    excerptFr:
      "Budget, RSVP, plan de table, vie privée : notre classement 2026 des apps de gestion mariage en France, avec critères concrets.",
    excerptEn:
      "Budget, RSVP, seating, privacy: our 2026 ranking of wedding management apps in France, with concrete criteria.",
    readingMinutes: 9,
    heroAltFr: "Top 5 applications mariage 2026",
    heroAltEn: "Top 5 wedding apps 2026",
    date: "2026-07-07",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Nous avons comparé les apps les plus citées en France en 2026 sur six critères : invités et RSVP, budget, plan de table, planning jour J, expérience mobile, et confidentialité des données. Prix relevés sur les sites officiels au printemps 2026.",
          "Transparence : cet article est rédigé par l'équipe Drakkar Software, éditeur de Fiancé. Fiancé figure en tête de ce classement gestion ; nous indiquons honnêtement les forces des autres.",
        ],
      },
      {
        type: "list",
        title: "1. Fiancé : gestion complète, privée, sans abonnement",
        items: [
          ...FIANCE_FREE_FEATURES_FR.slice(0, 4),
          "Zéro pub, zéro abonnement, données locales par défaut",
          "Premium unique à vie : sync multi-appareils, partage couple, page publique complète",
        ],
      },
      {
        type: "list",
        title: "2. MyWed : tout-en-un international",
        items: [
          "Tâches, budget, invités, prestataires, sync couple",
          "App native, notifications, multilingue",
          "Idéal si : vous voulez une app cloud classique avec beaucoup de modules",
        ],
      },
      {
        type: "list",
        title: "3. Mariages.net : annuaire + outils de base",
        items: [
          "77 000+ prestataires, checklist, budget, tables, site mariage",
          "Gratuit, modèle marketplace The Knot",
          "Idéal si : trouver des prestataires est votre priorité",
        ],
      },
      {
        type: "list",
        title: "4. Zankyou : site et liste de mariage",
        items: [
          "Site invités, cagnotte, annuaire prestataires",
          "Gestion projet limitée (pas de vrai plan de table avancé)",
          "Idéal si : la liste de cadeaux prime sur le plan de table",
        ],
      },
      {
        type: "list",
        title: "5. Planning.wedding : mobile native payante",
        items: [
          "Checklist, budget, plan de table (version Pro)",
          "Environ 29 €/mois pour les fonctions avancées",
          "Idéal si : vous préférez une app native et acceptez l'abonnement",
        ],
      },
      fiancePlanningFr([
        "Essayez Fiancé en 10 minutes : [budget](/tools/budget-calculator), [plan de table](/tools/seating-chart), [timeline](/tools/timeline). Puis installez l'app pour la sync couple. Comparaisons détaillées : [vs Mariages.net](/blog/fiance-vs-mariages-net), [vs Zankyou](/blog/fiance-vs-zankyou), [vs MyWed](/blog/fiance-vs-mywed).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "We compared the most cited apps in France in 2026 on six criteria: guests and RSVP, budget, seating, day-of timeline, mobile experience, and data privacy. Pricing from official sites in spring 2026.",
          "Transparency: this article is written by the Drakkar Software team, publisher of Fiancé. Fiancé leads this management ranking; we state other products' strengths honestly.",
        ],
      },
      {
        type: "list",
        title: "1. Fiancé: full private management, no subscription",
        items: [
          ...FIANCE_FREE_FEATURES_EN.slice(0, 4),
          "Zero ads, zero subscription, local data by default",
          "One-time premium: multi-device sync, partner sharing, full public page",
        ],
      },
      {
        type: "list",
        title: "2. MyWed: international all-in-one",
        items: [
          "Tasks, budget, guests, vendors, couple sync",
          "Native app, notifications, multilingual",
          "Best if: you want a classic cloud app with many modules",
        ],
      },
      {
        type: "list",
        title: "3. Mariages.net: directory + basic tools",
        items: [
          "77,000+ vendors, checklist, budget, tables, wedding site",
          "Free, The Knot marketplace model",
          "Best if: finding vendors is your top priority",
        ],
      },
      {
        type: "list",
        title: "4. Zankyou: site and gift registry",
        items: [
          "Guest site, cash fund, vendor directory",
          "Limited project management (no advanced seating)",
          "Best if: the gift list beats seating chart needs",
        ],
      },
      {
        type: "list",
        title: "5. Planning.wedding: paid native mobile",
        items: [
          "Checklist, budget, seating (Pro tier)",
          "Roughly €29/month for advanced features",
          "Best if: you prefer native app and accept subscription",
        ],
      },
      fiancePlanningEn([
        "Try Fiancé in 10 minutes: [budget](/tools/budget-calculator), [seating chart](/tools/seating-chart), [timeline](/tools/timeline). Then install the app for partner sync. Deep dives: [vs Mariages.net](/blog/fiance-vs-mariages-net), [vs Zankyou](/blog/fiance-vs-zankyou), [vs MyWed](/blog/fiance-vs-mywed).",
      ]),
    ],
  }),

  postPair({
    slug: "meilleures-applications-mariage-gratuit-france",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Meilleures applications mariage gratuites en France (2026)",
    titleEn: "Best free wedding apps in France (2026)",
    excerptFr:
      "Gratuit ne veut pas dire bridé : notre top des apps mariage sans abonnement obligatoire, avec ce qui est vraiment inclus.",
    excerptEn:
      "Free does not mean crippled: our top wedding apps with no mandatory subscription, and what is actually included.",
    readingMinutes: 8,
    heroAltFr: "Meilleures apps mariage gratuites France",
    heroAltEn: "Best free wedding apps France",
    date: "2026-07-08",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Beaucoup d'apps mariage affichent « gratuit » puis facturent le plan de table, l'export PDF ou les RSVP au-delà de 50 invités. Nous avons listé les options réellement utilisables sans carte bancaire pour un mariage classique (80 à 120 invités).",
        ],
      },
      {
        type: "list",
        title: "1. Fiancé",
        items: [
          ...FIANCE_FREE_FEATURES_FR,
          ...FIANCE_PREMIUM_FR,
        ],
      },
      {
        type: "list",
        title: "2. Mariages.net",
        items: [
          "Gratuit : checklist, budget estimatif, invités, tables, site mariage",
          "Contrepartie : emails prestataires et orientation marketplace",
        ],
      },
      {
        type: "list",
        title: "3. Zankyou",
        items: [
          "Gratuit : site mariage, RSVP basique, liste cadeaux (commission selon formule)",
          "Moins adapté au suivi budget détaillé",
        ],
      },
      {
        type: "list",
        title: "4. Google Sheets + Forms",
        items: [
          "Gratuit et flexible, mais sans plan de table visuel ni sync prestataires",
          "Temps de setup élevé, erreurs de version fréquentes",
        ],
      },
      {
        type: "list",
        title: "5. Joy / WithJoy (freemium)",
        items: [
          "Site et RSVP gratuits, interface moderne",
          "Interface surtout en anglais, moins adapté aux spécificités FR (repas, mairie)",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Astuce : combinez jamais plus de deux outils « sources de vérité ». Un annuaire (Mariages.net) + une app de gestion (Fiancé) suffit souvent.",
        ],
      },
      fiancePlanningFr([
        "Les [outils web Fiancé](/tools/budget-calculator) ne demandent pas de compte. Voir [petit budget](/blog/mariage-petit-budget-10-conseils) et [Excel vs app](/blog/excel-vs-application-mariage).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Many wedding apps say \"free\" then charge for seating, PDF export, or RSVPs past 50 guests. We listed options actually usable without a card for a typical wedding (80 to 120 guests).",
        ],
      },
      {
        type: "list",
        title: "1. Fiancé",
        items: [
          ...FIANCE_FREE_FEATURES_EN,
          ...FIANCE_PREMIUM_EN,
        ],
      },
      {
        type: "list",
        title: "2. Mariages.net",
        items: [
          "Free: checklist, estimated budget, guests, tables, wedding site",
          "Trade-off: vendor emails and marketplace orientation",
        ],
      },
      {
        type: "list",
        title: "3. Zankyou",
        items: [
          "Free: wedding site, basic RSVP, gift list (fee depends on plan)",
          "Less suited to detailed budget tracking",
        ],
      },
      {
        type: "list",
        title: "4. Google Sheets + Forms",
        items: [
          "Free and flexible, but no visual seating or vendor sync",
          "High setup time, frequent version mistakes",
        ],
      },
      {
        type: "list",
        title: "5. Joy / WithJoy (freemium)",
        items: [
          "Free site and RSVP, modern UI",
          "Mostly English UI, less tuned to French specifics (meal service, town hall)",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Tip: never run more than two \"sources of truth\" tools. A directory (Mariages.net) plus a management app (Fiancé) is often enough.",
        ],
      },
      fiancePlanningEn([
        "Fiancé [web tools](/tools/budget-calculator) need no account. See [small budget](/blog/mariage-petit-budget-10-conseils) and [Excel vs app](/blog/excel-vs-application-mariage).",
      ]),
    ],
  }),

  postPair({
    slug: "top-5-apps-mariage-vie-privee-offline",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Top 5 des apps mariage respectueuses de la vie privée",
    titleEn: "Top 5 privacy-friendly wedding apps",
    excerptFr:
      "RGPD, compte invité, hébergement des données : le classement 2026 pour les couples qui ne veulent pas exposer leur liste invités.",
    excerptEn:
      "GDPR, guest accounts, data hosting: the 2026 ranking for couples who do not want their guest list exposed.",
    readingMinutes: 7,
    heroAltFr: "Apps mariage confidentialité et offline",
    heroAltEn: "Privacy and offline wedding apps",
    date: "2026-07-10",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Votre liste invités contient adresses, emails, régimes alimentaires et parfois des tensions familiales. La plupart des apps mariage « gratuites » monétisent via la revente d'attention (prestataires) ou l'hébergement cloud obligatoire.",
          "Voici cinq options classées selon : données locales possibles, RSVP sans compte invité, absence de pub, et transparence sur la sync.",
        ],
      },
      {
        type: "list",
        title: "1. Fiancé",
        items: [
          "Vie privée : données locales, zéro pub, zéro tracking",
          ...FIANCE_FREE_FEATURES_FR.slice(0, 5),
          ...FIANCE_PREMIUM_FR,
        ],
      },
      {
        type: "list",
        title: "2. Tableur local (Excel / Numbers) + PDF faire-part",
        items: [
          "Contrôle total, mais pas de RSVP temps réel ni plan de table visuel",
          "Risque de partage accidentel de fichier",
        ],
      },
      {
        type: "list",
        title: "3. MyWed",
        items: [
          "Chiffrement transit, compte cloud requis pour la sync",
          "Données hébergées chez l'éditeur, politique SaaS classique",
        ],
      },
      {
        type: "list",
        title: "4. Mariages.net / Zankyou",
        items: [
          "Compte couple obligatoire, données sur serveurs marketplace",
          "Emails prestataires et profilage usage courant",
        ],
      },
      {
        type: "list",
        title: "5. Notion / Trello (bricolage)",
        items: [
          "Flexible, mais invités dans un workspace partagé = fuites possibles",
          "Pas conçu pour le RSVP grand public",
        ],
      },
      {
        type: "quote",
        quote:
          "Si vous ne payez pas le produit et qu'il n'est pas open source, demandez-vous ce qui est monétisé : souvent vos données ou votre attention.",
      },
      fiancePlanningFr([
        "Lisez notre article [app mariage privée et hors ligne](/blog/app-mariage-privee-hors-ligne). Testez Fiancé sans compte sur [fiance.drakkar.software](https://fiance.drakkar.software).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Your guest list holds addresses, emails, dietary needs, and sometimes family tension. Most \"free\" wedding apps monetize through vendor attention or mandatory cloud hosting.",
          "Here are five options ranked on: local data option, RSVP without guest account, no ads, and sync transparency.",
        ],
      },
      {
        type: "list",
        title: "1. Fiancé",
        items: [
          "Privacy: local data, zero ads, zero tracking",
          ...FIANCE_FREE_FEATURES_EN.slice(0, 5),
          ...FIANCE_PREMIUM_EN,
        ],
      },
      {
        type: "list",
        title: "2. Local spreadsheet (Excel / Numbers) + PDF invites",
        items: [
          "Full control, but no real-time RSVP or visual seating",
          "Risk of accidental file sharing",
        ],
      },
      {
        type: "list",
        title: "3. MyWed",
        items: [
          "Encryption in transit, cloud account required for sync",
          "Data hosted by publisher, classic SaaS policy",
        ],
      },
      {
        type: "list",
        title: "4. Mariages.net / Zankyou",
        items: [
          "Couple account required, data on marketplace servers",
          "Vendor emails and usage profiling common",
        ],
      },
      {
        type: "list",
        title: "5. Notion / Trello (DIY)",
        items: [
          "Flexible, but guests in a shared workspace = leak risk",
          "Not built for public RSVP",
        ],
      },
      {
        type: "quote",
        quote:
          "If you do not pay for the product and it is not open source, ask what is monetized: often your data or your attention.",
      },
      fiancePlanningEn([
        "Read our [private offline wedding app](/blog/app-mariage-privee-hors-ligne) article. Try Fiancé without an account at [fiance.drakkar.software](https://fiance.drakkar.software).",
      ]),
    ],
  }),
];

export const { fr: POSTS_69_74_FR, en: POSTS_69_74_EN } = pairsToArrays(pairs);
