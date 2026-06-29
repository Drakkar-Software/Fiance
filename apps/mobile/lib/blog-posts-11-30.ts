import { postPair, pairsToArrays } from "./blog-posts-shared";
import type { BlogSection } from "./blog-types";

const FIANCE_BUDGET_FR: BlogSection = {
  type: "text",
  title: "Comment Fiancé peut vous aider",
  paragraphs: [
    "Fiancé suit dépenses, acomptes et échéances dans un seul budget. Les modèles intimiste, classique et prestige posent une répartition de départ que vous ajustez au fil des devis. Testez le [simulateur budget](/tools/budget-calculator) sans compte, puis importez la logique dans l'app.",
  ],
};

const FIANCE_BUDGET_EN: BlogSection = {
  type: "text",
  title: "How Fiancé can help",
  paragraphs: [
    "Fiancé tracks expenses, deposits, and due dates in one budget. Intimate, classic, and prestige templates give you a starting split you refine as quotes arrive. Try the [budget calculator](/tools/budget-calculator) without an account, then carry the logic into the app.",
  ],
};

const FIANCE_GUESTS_FR: BlogSection = {
  type: "text",
  title: "Comment Fiancé peut vous aider",
  paragraphs: [
    "La liste invités Fiancé gère RSVP, +1, enfants et régimes alimentaires. La page publique permet de répondre sans créer de compte. Relancez depuis l'app et suivez qui a reçu save-the-date, faire-part ou menu.",
  ],
};

const FIANCE_GUESTS_EN: BlogSection = {
  type: "text",
  title: "How Fiancé can help",
  paragraphs: [
    "Fiancé's guest list handles RSVP, plus-ones, children, and dietary needs. The public page lets guests reply without creating an account. Nudge from the app and track who received save-the-dates, invitations, or menu choices.",
  ],
};

const FIANCE_SEATING_FR: BlogSection = {
  type: "text",
  title: "Comment Fiancé peut vous aider",
  paragraphs: [
    "Le plan de table Fiancé se synchronise avec les RSVP confirmés. Tables rondes, rectangulaires ou disposition serpentin : assignez les invités par glisser-déposer et exportez un PDF pour le traiteur. Commencez sur l'outil en ligne [plan de table](/tools/seating-chart) si vous n'avez pas encore l'app.",
  ],
};

const FIANCE_SEATING_EN: BlogSection = {
  type: "text",
  title: "How Fiancé can help",
  paragraphs: [
    "Fiancé's seating chart syncs with confirmed RSVPs. Round, rectangular, or serpentine layouts: drag guests into place and export a PDF for your caterer. Start on the online [seating chart tool](/tools/seating-chart) if you do not have the app yet.",
  ],
};

const pairs = [
  postPair({
    slug: "budget-mariage-2026-combien-prevoir",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Budget mariage 2026 : combien prévoir en France ?",
    titleEn: "2026 wedding budget: how much to plan in France?",
    excerptFr:
      "19 293 € en moyenne selon Mariages.net (1 304 couples). 215 € par invité, 90 convives : voici comment lire ces chiffres pour votre projet.",
    excerptEn:
      "€19,293 on average per Mariages.net (1,304 couples). €215 per guest, 90 guests: how to read these numbers for your wedding.",
    readingMinutes: 6,
    heroAltFr: "Budget mariage 2026 en France",
    heroAltEn: "2026 wedding budget in France",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Avant de visiter des salles, vous avez besoin d'un ordre de grandeur. Le rapport Mariages.net 2026, basé sur 1 304 couples interrogés, fixe la moyenne française à 19 293 € pour l'ensemble du mariage.",
          "Ce chiffre inclut lieu, traiteur, photo, tenues et une part de déco. Il ne dit pas ce que vous devez dépenser : il montre où se situe la médiane du marché en 2026.",
        ],
      },
      {
        type: "list",
        title: "Ce que disent les chiffres clés",
        items: [
          "215 € par invité en moyenne (repas, boissons, part fixe du lieu)",
          "90 invités en moyenne sur les réponses du baromètre",
          "51 % des couples ont dépassé le budget initial",
          "L'écart régional reste fort : province vs Île-de-France, saison été vs hiver",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "La moyenne n'est pas votre cible. Un mariage à 60 personnes en novembre coûtera moins qu'une réception estivale à 120. Partez de votre nombre d'invités, puis multipliez par une fourchette réaliste (voir [coût par invité](/blog/budget-mariage-cout-par-invite)).",
        ],
      },
      {
        type: "text",
        title: "Comment utiliser ce repère",
        paragraphs: [
          "1. Posez un plafond, pas une fourchette vague.",
          "2. Comparez votre coût par invité au benchmark 215 € : au-dessus, creusez traiteur et boissons.",
          "3. Gardez 5 à 10 % de marge : la moitié des couples dépassent leur budget.",
          "Notre [simulateur budget](/tools/budget-calculator) reprend ces ratios pour générer une première répartition par poste.",
        ],
      },
      FIANCE_BUDGET_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Before touring venues, you need a ballpark. Mariages.net's 2026 report, based on 1,304 surveyed couples, puts the French average at €19,293 for the full wedding.",
          "That figure covers venue, catering, photo, attire, and part of decor. It does not tell you what you should spend: it shows where the market median sits in 2026.",
        ],
      },
      {
        type: "list",
        title: "Key numbers from the report",
        items: [
          "€215 per guest on average (meal, drinks, share of fixed venue costs)",
          "90 guests on average in the survey",
          "51% of couples exceeded their initial budget",
          "Regional spread stays wide: provinces vs Paris area, summer vs winter",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The average is not your target. A 60-guest wedding in November costs less than a 120-guest summer reception. Start from guest count, then multiply by a realistic range (see [cost per guest](/blog/budget-mariage-cout-par-invite)).",
        ],
      },
      {
        type: "text",
        title: "How to use this benchmark",
        paragraphs: [
          "1. Set a ceiling, not a vague range.",
          "2. Compare your cost per guest to the €215 benchmark: if you are above, dig into catering and drinks.",
          "3. Keep 5 to 10% contingency: half of couples overshoot.",
          "Our [budget calculator](/tools/budget-calculator) applies these ratios to build a first split by category.",
        ],
      },
      FIANCE_BUDGET_EN,
    ],
  }),

  postPair({
    slug: "budget-mariage-cout-par-invite",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Budget mariage : calculer le coût par invité",
    titleEn: "Wedding budget: calculate cost per guest",
    excerptFr:
      "Le vrai budget = nombre d'invités × 150 à 250 €. Une formule simple avant de signer le traiteur ou la salle.",
    excerptEn:
      "Real budget = guest count × €150–250. A simple formula before you sign the caterer or venue.",
    readingMinutes: 5,
    heroAltFr: "Calculer le coût par invité mariage",
    heroAltEn: "Calculate wedding cost per guest",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Quand nous avons conçu le simulateur Fiancé, nous avons constaté que la plupart des couples raisonnent en « budget total » alors que le marché facture surtout à la tête. Le calcul le plus fiable reste : nombre d'invités × coût par convive.",
        ],
      },
      {
        type: "list",
        title: "Fourchettes 2026 en France",
        items: [
          "150 à 180 € : déjeuner, province, prestations sélectionnées",
          "180 à 220 € : dîner classique, open bar modéré",
          "220 à 250 € et plus : soirée longue, bar ouvert, lieu premium",
          "Ajoutez 15 à 25 € par enfant si le traiteur facture une formule enfant",
        ],
      },
      {
        type: "quote",
        quote:
          "Chaque invité en plus, ce n'est pas une ligne Excel. C'est une table, des boissons et parfois une nuit d'hôtel.",
      },
      {
        type: "text",
        title: "Exemple concret",
        paragraphs: [
          "80 invités × 200 € = 16 000 € de poste « convives » avant robe, photo et musique. Si votre plafond global est 18 000 €, il ne reste que 2 000 € pour tout le reste : c'est trop serré.",
          "Inversez le calcul : budget 20 000 €, 25 % réservés hors repas → 15 000 € pour les invités → 15 000 ÷ 80 = 187 € max par tête.",
        ],
      },
      FIANCE_BUDGET_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "When we built Fiancé's calculator, we kept seeing couples think in « total budget » while vendors price mostly per head. The most reliable math stays: guest count × cost per guest.",
        ],
      },
      {
        type: "list",
        title: "2026 ranges in France",
        items: [
          "€150–180: lunch, regional venue, curated vendors",
          "€180–220: classic dinner, moderate open bar",
          "€220–250+: long evening, open bar, premium venue",
          "Add €15–25 per child if the caterer charges a kids' menu",
        ],
      },
      {
        type: "quote",
        quote:
          "Every extra guest is not a spreadsheet row. It is a table setting, drinks, and sometimes a hotel night.",
      },
      {
        type: "text",
        title: "Worked example",
        paragraphs: [
          "80 guests × €200 = €16,000 for the « guests » line before dress, photo, and music. If your total cap is €18,000, only €2,000 remains for everything else: too tight.",
          "Flip it: €20,000 budget, 25% held for non-meal costs → €15,000 for guests → €15,000 ÷ 80 = €187 max per head.",
        ],
      },
      FIANCE_BUDGET_EN,
    ],
  }),

  postPair({
    slug: "repartition-budget-mariage-par-poste",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Répartition du budget mariage par poste",
    titleEn: "Wedding budget split by category",
    excerptFr:
      "Lieu 15-25 %, traiteur 30-40 %, photo 8-12 % : des repères concrets et trois modèles Fiancé (intimiste, classique, prestige).",
    excerptEn:
      "Venue 15–25%, catering 30–40%, photo 8–12%: concrete benchmarks and three Fiancé templates (intimate, classic, prestige).",
    readingMinutes: 6,
    heroAltFr: "Répartition budget mariage par poste",
    heroAltEn: "Wedding budget allocation by category",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Sans répartition par poste, vous découvrez le trou budget au moment de payer le traiteur. Voici les pourcentages que nous utilisons comme base dans Fiancé, calés sur des centaines de projets réels.",
        ],
      },
      {
        type: "list",
        title: "Répartition type (mariage classique)",
        items: [
          "Lieu de réception : 15 à 25 %",
          "Traiteur et boissons : 30 à 40 %",
          "Photo et vidéo : 8 à 12 %",
          "Musique (DJ ou groupe) : 5 à 8 %",
          "Tenues (robe, costume, beauté) : 8 à 12 %",
          "Fleurs et déco : 8 à 10 %",
          "Papeterie et alliances : 3 à 5 %",
          "Imprévus : 5 à 10 %",
        ],
      },
      {
        type: "text",
        title: "Trois modèles dans Fiancé",
        paragraphs: [
          "Mariage intimiste (≤ 50 invités) : le traiteur pèse moins en % mais le coût par tête monte. Photo et lieu prennent une part plus visible.",
          "Mariage classique (60-100 invités) : la répartition ci-dessus s'applique tel quel.",
          "Mariage prestige (100+ invités, bar ouvert, lieu château) : traiteur et lieu montent, déco peut passer sous 8 % en valeur absolue mais reste élevée.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Astuce : notez chaque devis dans la catégorie Fiancé correspondante. L'app recalcule le % réel vs prévu et signale les postes qui dérivent.",
        ],
      },
      FIANCE_BUDGET_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Without a per-category split, you discover the budget gap when the caterer's invoice arrives. Here are the percentages we use as defaults in Fiancé, tuned from hundreds of real projects.",
        ],
      },
      {
        type: "list",
        title: "Typical split (classic wedding)",
        items: [
          "Reception venue: 15–25%",
          "Catering and drinks: 30–40%",
          "Photo and video: 8–12%",
          "Music (DJ or band): 5–8%",
          "Attire (dress, suit, beauty): 8–12%",
          "Flowers and decor: 8–10%",
          "Stationery and rings: 3–5%",
          "Contingency: 5–10%",
        ],
      },
      {
        type: "text",
        title: "Three templates in Fiancé",
        paragraphs: [
          "Intimate wedding (≤ 50 guests): catering weighs less in % but cost per head rises. Photo and venue take a larger share.",
          "Classic wedding (60–100 guests): the split above applies as-is.",
          "Prestige wedding (100+ guests, open bar, château): catering and venue rise; decor may drop below 8% in share but stays high in euros.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Tip: log every quote in the matching Fiancé category. The app recomputes actual vs planned % and flags drifting lines.",
        ],
      },
      FIANCE_BUDGET_EN,
    ],
  }),

  postPair({
    slug: "acomptes-soldes-mariage-echeances",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Acomptes et soldes mariage : suivre les échéances",
    titleEn: "Wedding deposits and balances: track due dates",
    excerptFr:
      "30 % à la signature, solde J-30 ou J-7 : comment ne pas rater un paiement traiteur ou photographe.",
    excerptEn:
      "30% on signing, balance at D-30 or D-7: how not to miss a caterer or photographer payment.",
    readingMinutes: 5,
    heroAltFr: "Échéances acomptes mariage",
    heroAltEn: "Wedding deposit due dates",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un contrat mariage, c'est rarement un seul paiement. Entre l'acompte à la réservation et le solde la veille du jour J, les dates s'étalent sur 12 à 18 mois. Sans tableau de suivi, un virement oublié coûte cher (pénalités, stress).",
        ],
      },
      {
        type: "list",
        title: "Échéances courantes par prestataire",
        items: [
          "Lieu : 30 à 50 % à la réservation, solde 1 à 4 semaines avant",
          "Traiteur : acompte 20 à 40 %, solde après décompte final invités (souvent J-15 à J-7)",
          "Photographe : 30 % à la signature, 70 % le jour J ou sous 7 jours",
          "DJ / groupe : 50 % à la réservation fréquent en haute saison",
          "Fleuriste : acompte modéré, solde livraison",
        ],
      },
      {
        type: "quote",
        quote:
          "Le budget mariage n'est pas une somme. C'est un calendrier de virements.",
      },
      {
        type: "text",
        title: "Bonnes pratiques",
        paragraphs: [
          "Centralisez contrat PDF, montant, date et mode de paiement au même endroit.",
          "Alignez les soldes traiteur sur votre date limite RSVP : vous payez le bon effectif.",
          "Prévoyez une ligne « pourboires jour J » (150 à 400 € selon prestations) dès le départ.",
        ],
      },
      FIANCE_BUDGET_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A wedding contract is rarely one payment. From the booking deposit to the balance due the day before, dates spread over 12 to 18 months. Without a tracker, a missed transfer hurts (penalties, stress).",
        ],
      },
      {
        type: "list",
        title: "Typical due dates by vendor",
        items: [
          "Venue: 30–50% on booking, balance 1–4 weeks before",
          "Caterer: 20–40% deposit, balance after final headcount (often D-15 to D-7)",
          "Photographer: 30% on signing, 70% on the day or within 7 days",
          "DJ / band: 50% on booking common in peak season",
          "Florist: moderate deposit, balance on delivery",
        ],
      },
      {
        type: "quote",
        quote:
          "A wedding budget is not a lump sum. It is a calendar of bank transfers.",
      },
      {
        type: "text",
        title: "Practices that work",
        paragraphs: [
          "Keep contract PDF, amount, date, and payment method in one place.",
          "Align caterer balances with your RSVP deadline: you pay for the right headcount.",
          "Budget a « day-of tips » line (€150–400 depending on vendors) from the start.",
        ],
      },
      FIANCE_BUDGET_EN,
    ],
  }),

  postPair({
    slug: "postes-budget-mariage-depassements",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Postes budget mariage : où les couples dépassent",
    titleEn: "Wedding budget: where couples overspend",
    excerptFr:
      "Effectif invités, boissons, déco, prestataires de dernière minute : les quatre postes qui font exploser le budget.",
    excerptEn:
      "Guest count, drinks, decor, last-minute vendors: the four lines that blow the budget.",
    readingMinutes: 6,
    heroAltFr: "Dépassements budget mariage",
    heroAltEn: "Wedding budget overruns",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le rapport Mariages.net cite 51 % de couples au-dessus du budget initial. Ce n'est pas le lieu qui surprend le plus en général : ce sont les postes qu'on sous-estime parce qu'ils arrivent tard ou par unité.",
        ],
      },
      {
        type: "list",
        title: "Top 4 des dépassements",
        items: [
          "1. Nombre d'invités : chaque +1 non prévu = 150 à 250 €",
          "2. Boissons : open bar ou consommation mal chiffrée (+15 à 30 % vs devis initial)",
          "3. Déco : centres de table, location mobilier, éclairage ajouté en fin de préparation",
          "4. Prestataires tardifs : photobooth, bus navette, officiant laïque réservés à 3 mois du jour J",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Fixez une liste invités verrouillée avant le devis traiteur final. Voir [open bar ou consommation](/blog/open-bar-ou-consommation-mariage) pour chiffrer les boissons.",
        ],
      },
      {
        type: "text",
        title: "Comment se protéger",
        paragraphs: [
          "Marge 8 % minimum sur le budget global.",
          "Plafond invités écrit et partagé avec les familles (voir [liste sans conflits](/blog/liste-invites-mariage-sans-conflits)).",
          "Tout ajout après J-90 passe par un arbitrage : d'où vient l'euro ?",
        ],
      },
      FIANCE_BUDGET_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Mariages.net reports 51% of couples above their initial budget. The venue is not always the surprise: it is lines you underestimate because they arrive late or scale per unit.",
        ],
      },
      {
        type: "list",
        title: "Top four overruns",
        items: [
          "1. Guest count: every unplanned +1 = €150–250",
          "2. Drinks: open bar or consumption poorly estimated (+15–30% vs initial quote)",
          "3. Decor: centerpieces, furniture rental, lighting added late",
          "4. Late vendors: photobooth, shuttle bus, celebrant booked 3 months out",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Lock the guest list before the final caterer quote. See [open bar vs consumption](/blog/open-bar-ou-consommation-mariage) to price drinks.",
        ],
      },
      {
        type: "text",
        title: "How to protect yourself",
        paragraphs: [
          "Minimum 8% contingency on total budget.",
          "Written guest cap shared with families (see [conflict-free guest list](/blog/liste-invites-mariage-sans-conflits)).",
          "Any add-on after D-90 goes through trade-off: where does the euro come from?",
        ],
      },
      FIANCE_BUDGET_EN,
    ],
  }),

  postPair({
    slug: "mariage-petit-budget-10-conseils",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Mariage petit budget : 10 conseils sous 10 000 €",
    titleEn: "Small-budget wedding: 10 tips under €10,000",
    excerptFr:
      "Moins d'invités, hors saison, déjeuner vs dîner : dix leviers concrets pour tenir un plafond serré sans sacrifier l'essentiel.",
    excerptEn:
      "Fewer guests, off-season, lunch vs dinner: ten concrete levers to hit a tight cap without losing what matters.",
    readingMinutes: 7,
    heroAltFr: "Organiser un mariage petit budget",
    heroAltEn: "Plan a small-budget wedding",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un mariage sous 10 000 € en France, c'est faisable avec 40 à 60 invités et des choix assumés. Ce n'est pas la même fête qu'une réception à 20 000 € : il faut couper des postes entiers, pas grigner partout.",
        ],
      },
      {
        type: "list",
        title: "10 leviers qui marchent",
        items: [
          "1. Invités : viser 40-60 personnes max (voir [mariage intime](/blog/mariage-intime-vs-grande-reception))",
          "2. Saison : novembre à mars, ou vendredi hors vacances",
          "3. Format déjeuner vs dîner (–30 à 40 % sur le traiteur)",
          "4. Un seul lieu cérémonie + repas",
          "5. DJ playlist vs groupe live",
          "6. Déco DIY ciblée (guirlandes, lin, pas de structures sur mesure)",
          "7. Photo seule, pas de vidéaste double",
          "8. Faire-part numérique pour une partie des invités",
          "9. Robe seconde main ou location",
          "10. Bar à consommation plutôt qu'open bar illimité",
        ],
      },
      {
        type: "quote",
        quote:
          "Petit budget, ce n'est pas moins de soin. C'est moins de convives et moins de prestataires en parallèle.",
      },
      {
        type: "text",
        title: "Où ne pas économiser",
        paragraphs: [
          "Photo : c'est ce qui reste quand la fête est finie.",
          "Traiteur : un repas froid ou un food truck sérieux vaut mieux qu'un buffet cheap mal fichu.",
          "Assurance ou clause météo si extérieur.",
        ],
      },
      FIANCE_BUDGET_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A wedding under €10,000 in France is doable with 40 to 60 guests and deliberate choices. It is not the same party as a €20,000 reception: you cut whole categories, not shave everywhere.",
        ],
      },
      {
        type: "list",
        title: "Ten levers that work",
        items: [
          "1. Guests: aim for 40–60 max (see [intimate wedding](/blog/mariage-intime-vs-grande-reception))",
          "2. Season: November to March, or a Friday outside holidays",
          "3. Lunch vs dinner format (–30–40% on catering)",
          "4. One venue for ceremony + meal",
          "5. DJ playlist vs live band",
          "6. Targeted DIY decor (garlands, linen, no custom structures)",
          "7. Photo only, no second videographer",
          "8. Digital invitations for part of the list",
          "9. Second-hand dress or rental",
          "10. Consumption bar vs unlimited open bar",
        ],
      },
      {
        type: "quote",
        quote:
          "Small budget is not less care. It is fewer guests and fewer vendors in parallel.",
      },
      {
        type: "text",
        title: "Where not to cut",
        paragraphs: [
          "Photo: it is what remains after the party.",
          "Catering: a solid cold meal or food truck beats a poorly run cheap buffet.",
          "Insurance or weather clause if outdoors.",
        ],
      },
      FIANCE_BUDGET_EN,
    ],
  }),

  postPair({
    slug: "open-bar-ou-consommation-mariage",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Open bar ou consommation au mariage : comment choisir",
    titleEn: "Open bar or consumption tab at your wedding",
    excerptFr:
      "Open bar, consommation avec plafond, ou bouteilles à l'unité : calculez le coût réel avant de signer le traiteur.",
    excerptEn:
      "Open bar, capped tab, or per-bottle: calculate real cost before you sign with the caterer.",
    readingMinutes: 6,
    heroAltFr: "Open bar ou consommation mariage",
    heroAltEn: "Open bar or consumption wedding",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les boissons représentent souvent 10 à 20 % du poste traiteur. Le traiteur vous proposera open bar, forfait consommation ou bouteilles comptées : trois logiques de prix très différentes.",
        ],
      },
      {
        type: "list",
        title: "Les trois modèles",
        items: [
          "Open bar : forfait par invité (souvent +25 à 45 €/tête), consommation illimitée sur créneau défini",
          "Consommation avec plafond : vous fixez un montant global (ex. 2 000 €), facturation réelle en fin de soirée",
          "Bouteilles à l'unité : vin et champagne commandés au cas par cas, softs en libre service",
        ],
      },
      {
        type: "text",
        title: "Calcul rapide",
        paragraphs: [
          "Estimez 4 à 6 verres alcoolisés par adulte sur une soirée de 6 h.",
          "Open bar : 80 invités × 35 € = 2 800 € forfait.",
          "Consommation : 80 × 5 verres × 6 € = 2 400 € si modéré ; montez à 3 500 € si fêtards.",
          "Seuil de bascule : open bar devient intéressant si vous attendez plus de 5 verres moyens par personne.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Demandez toujours ce qui est inclus : cocktails signature, champagne à l'apéritif, eau et softs, heure de fin du bar.",
        ],
      },
      FIANCE_BUDGET_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Drinks often represent 10 to 20% of the catering line. Your caterer will offer open bar, consumption tab, or counted bottles: three very different pricing models.",
        ],
      },
      {
        type: "list",
        title: "Three models",
        items: [
          "Open bar: per-guest flat fee (often +€25–45/head), unlimited on a set window",
          "Capped consumption: you set a global amount (e.g. €2,000), billed on actual use",
          "Per bottle: wine and champagne ordered case by case, soft drinks self-serve",
        ],
      },
      {
        type: "text",
        title: "Quick math",
        paragraphs: [
          "Estimate 4 to 6 alcoholic drinks per adult over a 6-hour evening.",
          "Open bar: 80 guests × €35 = €2,800 flat.",
          "Consumption: 80 × 5 drinks × €6 = €2,400 if moderate; up to €3,500 if heavy.",
          "Tipping point: open bar wins if you expect more than 5 average drinks per person.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always ask what is included: signature cocktails, champagne at apéritif, water and soft drinks, bar closing time.",
        ],
      },
      FIANCE_BUDGET_EN,
    ],
  }),

  postPair({
    slug: "comparer-devis-traiteur-mariage",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Comparer les devis traiteur mariage",
    titleEn: "Compare wedding caterer quotes",
    excerptFr:
      "Prix au kilo, service inclus, vaisselle, personnel : le comparateur traiteur Fiancé pour lire deux devis ligne à ligne.",
    excerptEn:
      "Price per kilo, service included, tableware, staff: Fiancé's caterer comparator to read two quotes line by line.",
    readingMinutes: 6,
    heroAltFr: "Comparer devis traiteur mariage",
    heroAltEn: "Compare wedding caterer quotes",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Deux devis traiteur à 85 € et 72 € la tête ne se comparent pas au premier coup d'œil. L'un inclut vaisselle et serveurs, l'autre facture le vin à part. Nous avons ajouté un comparateur dans Fiancé parce que nous le faisions nous-mêmes sur des tableurs, et que ça prenait une soirée entière.",
        ],
      },
      {
        type: "list",
        title: "Lignes à aligner avant de comparer",
        items: [
          "Prix par convive adulte, enfant, staff",
          "Nombre minimum et maximum couverts",
          "Boissons : incluses, consommation, ou open bar séparé",
          "Vaisselle, nappes, verrerie : location ou incluse",
          "Personnel service (1 serveur pour X convives)",
          "Gâteau ou dessert : inclus ou prestataire externe",
          "Heures supplémentaires soirée",
        ],
      },
      {
        type: "text",
        title: "Utiliser le comparateur Fiancé",
        paragraphs: [
          "Ajoutez au moins deux traiteurs dans l'onglet Prestataires, saisissez leurs grilles (formules, options, prix unitaires). Fiancé calcule un score sur 100 et un total projeté pour votre effectif.",
          "Exportez le tableau pour en discuter à deux sans ressaisir les chiffres.",
        ],
      },
      {
        type: "quote",
        quote:
          "Le moins cher sur le PDF n'est pas le moins cher le jour J si le vin est en supplément.",
      },
      FIANCE_BUDGET_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Two caterer quotes at €85 and €72 per head do not compare at first glance. One includes tableware and servers; the other bills wine separately. We added a comparator in Fiancé because we used to do this in spreadsheets, and it ate a full evening.",
        ],
      },
      {
        type: "list",
        title: "Lines to align before comparing",
        items: [
          "Price per adult, child, staff meal",
          "Minimum and maximum covers",
          "Drinks: included, consumption, or separate open bar",
          "Tableware, linens, glassware: rental or included",
          "Service staff (1 server per X guests)",
          "Cake or dessert: included or external vendor",
          "Extra evening hours",
        ],
      },
      {
        type: "text",
        title: "Using Fiancé's comparator",
        paragraphs: [
          "Add at least two caterers under Vendors, enter their grids (menus, options, unit prices). Fiancé computes a score out of 100 and a projected total for your headcount.",
          "Export the table to discuss as a couple without retyping numbers.",
        ],
      },
      {
        type: "quote",
        quote:
          "Cheapest on the PDF is not cheapest on the day if wine is extra.",
      },
      FIANCE_BUDGET_EN,
    ],
  }),

  postPair({
    slug: "liste-invites-mariage-sans-conflits",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Liste d'invités mariage : négocier sans conflit",
    titleEn: "Wedding guest list: negotiate without conflict",
    excerptFr:
      "Tiers must / would / if-space, règles familiales et plafond invités : un cadre pour trancher avec les deux familles.",
    excerptEn:
      "Must / would / if-space tiers, family rules, and guest cap: a frame to decide with both families.",
    readingMinutes: 6,
    heroAltFr: "Liste invités mariage sans conflit",
    heroAltEn: "Conflict-free wedding guest list",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La liste d'invités est le premier vrai stress post-demande. Chaque famille a ses attentes, le lieu a une capacité, le budget a un plafond. Sans méthode, vous ajoutez des noms jusqu'à ce qu'un devis traiteur vous force à reculer.",
        ],
      },
      {
        type: "list",
        title: "Trois tiers, pas une liste plate",
        items: [
          "Must : parents proches, fratrie, témoins, parrain/marraine",
          "Would : amis proches, oncles/tantes que vous voyez vraiment",
          "If-space : collègues, cousins éloignés, +1 discutables",
        ],
      },
      {
        type: "text",
        title: "Règles qui désamorcent",
        paragraphs: [
          "Chaque partenaire gère sa fratrie et ses invités « must ». Les ajouts de l'autre côté passent par accord mutuel.",
          "Plafond écrit avant d'ouvrir le débat familial (ex. 85 invités max).",
          "Pas de +1 systématique : seulement couples mariés ou fiancés, ou au cas par cas.",
          "Enfants : décision globale (tous / famille proche seulement / aucun), pas invité par invité.",
        ],
      },
      {
        type: "quote",
        quote:
          "Une liste sans tiers, c'est une liste qui grossit jusqu'à ce que le budget dise non à votre place.",
      },
      FIANCE_GUESTS_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The guest list is the first real stress after the proposal. Each family has expectations, the venue has capacity, the budget has a cap. Without a method, you keep adding names until a caterer quote forces you to cut.",
        ],
      },
      {
        type: "list",
        title: "Three tiers, not a flat list",
        items: [
          "Must: close parents, siblings, witnesses, godparents",
          "Would: close friends, aunts/uncles you actually see",
          "If-space: coworkers, distant cousins, debatable plus-ones",
        ],
      },
      {
        type: "text",
        title: "Rules that defuse tension",
        paragraphs: [
          "Each partner owns their side's siblings and « must » guests. Adds on the other side need mutual agreement.",
          "Written cap before the family debate (e.g. 85 guests max).",
          "No automatic +1: only married or engaged couples, or case by case.",
          "Kids: global rule (all / close family only / none), not guest by guest.",
        ],
      },
      {
        type: "quote",
        quote:
          "A list without tiers grows until the budget says no for you.",
      },
      FIANCE_GUESTS_EN,
    ],
  }),

  postPair({
    slug: "rsvp-mariage-quand-relancer",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "RSVP mariage : quand et comment relancer",
    titleEn: "Wedding RSVP: when and how to follow up",
    excerptFr:
      "Date limite 3-4 semaines avant le jour J, relance 3-5 jours après : le timing qui fonctionne quand 10-20 % répondent en retard.",
    excerptEn:
      "Deadline 3–4 weeks before the day, nudge 3–5 days after: timing that works when 10–20% reply late.",
    readingMinutes: 5,
    heroAltFr: "Relancer RSVP mariage",
    heroAltEn: "Follow up wedding RSVP",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Sans date limite claire, les RSVP traînent et bloquent traiteur, plan de table et hébergements. En pratique, comptez 10 à 20 % de répondants tardifs même avec un beau faire-part.",
        ],
      },
      {
        type: "list",
        title: "Calendrier RSVP recommandé",
        items: [
          "Date limite : 3 à 4 semaines avant le jour J",
          "Première relance : 3 à 5 jours après la date limite (SMS ou message personnel)",
          "Deuxième relance : 10 jours avant le jour J pour les bloqués traiteur",
          "Clôture ferme : J-7 sauf cas exceptionnel",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Astuce : une page RSVP en ligne avec lien unique par foyer réduit les oublis. Voir [RSVP sans compte](/blog/rsvp-en-ligne-sans-compte).",
        ],
      },
      {
        type: "text",
        title: "Ton de la relance",
        paragraphs: [
          "Court, factuel, sans culpabiliser : « Bonjour, nous consolidons les chiffres traiteur cette semaine. Pouvez-vous confirmer votre présence ? »",
          "Désignez un seul contact par foyer pour éviter deux réponses contradictoires.",
        ],
      },
      FIANCE_GUESTS_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Without a clear deadline, RSVPs drag and block caterer, seating, and lodging. In practice, expect 10 to 20% late responders even with a polished invitation.",
        ],
      },
      {
        type: "list",
        title: "Recommended RSVP timeline",
        items: [
          "Deadline: 3 to 4 weeks before the wedding day",
          "First nudge: 3 to 5 days after the deadline (text or personal message)",
          "Second nudge: 10 days before for caterer lock-in",
          "Hard close: D-7 except edge cases",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Tip: an online RSVP page with one link per household cuts forgetfulness. See [RSVP without an account](/blog/rsvp-en-ligne-sans-compte).",
        ],
      },
      {
        type: "text",
        title: "Tone of the follow-up",
        paragraphs: [
          "Short, factual, no guilt: « Hi, we are locking caterer numbers this week. Can you confirm your attendance? »",
          "One contact per household to avoid conflicting replies.",
        ],
      },
      FIANCE_GUESTS_EN,
    ],
  }),

  postPair({
    slug: "gerer-plus-un-enfants-regimes-alimentaires",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Gérer +1, enfants et régimes alimentaires",
    titleEn: "Manage plus-ones, children, and dietary needs",
    excerptFr:
      "Une seule liste pour compter les assiettes, les menus enfant et les allergies : comment ne rien oublier au traiteur.",
    excerptEn:
      "One list to count plates, kids' menus, and allergies: how not to miss anything for the caterer.",
    readingMinutes: 5,
    heroAltFr: "Plus-one enfants régimes mariage",
    heroAltEn: "Plus-ones children dietary wedding",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le traiteur veut un nombre, pas une histoire. Pourtant chaque invité peut traîner un +1, deux enfants et un régime sans gluten. Si ces données vivent dans trois fils WhatsApp, vous perdez une assiette le jour J.",
        ],
      },
      {
        type: "list",
        title: "Champs à collecter au RSVP",
        items: [
          "Nom complet de chaque personne du foyer",
          "+1 autorisé ou non (décision en amont)",
          "Enfants : âge ou menu enfant / adulte",
          "Régimes : végétarien, vegan, halal, kosher, sans gluten, allergies",
          "Note libre pour le traiteur (ex. arachide)",
        ],
      },
      {
        type: "text",
        title: "Synthèse traiteur",
        paragraphs: [
          "Exportez un tableau : adultes / enfants / régimes spéciaux.",
          "Vérifiez les +1 non déclarés qui se présentent quand même (prévoir 2-3 couverts marge).",
          "Relisez à J-14 : les régimes changent parfois après la première réponse.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Fiancé lie chaque régime à la fiche invité. Le compteur repas se met à jour quand un RSVP arrive.",
        ],
      },
      FIANCE_GUESTS_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The caterer wants a number, not a story. Yet each guest may bring a plus-one, two kids, and a gluten-free diet. If that data lives in three WhatsApp threads, you lose a plate on the day.",
        ],
      },
      {
        type: "list",
        title: "Fields to collect at RSVP",
        items: [
          "Full name of everyone in the household",
          "Plus-one allowed or not (decide upfront)",
          "Children: age or kids' vs adult menu",
          "Diets: vegetarian, vegan, halal, kosher, gluten-free, allergies",
          "Free note for caterer (e.g. peanut)",
        ],
      },
      {
        type: "text",
        title: "Caterer summary",
        paragraphs: [
          "Export a table: adults / children / special diets.",
          "Watch undeclared plus-ones who show up anyway (buffer 2–3 covers).",
          "Review at D-14: diets sometimes change after the first reply.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Fiancé ties each diet to the guest record. Meal counts update when an RSVP lands.",
        ],
      },
      FIANCE_GUESTS_EN,
    ],
  }),

  postPair({
    slug: "mariage-intime-vs-grande-reception",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Mariage intime vs grande réception : 30 ou 150 invités ?",
    titleEn: "Intimate wedding vs large reception: 30 or 150 guests?",
    excerptFr:
      "30 invités vs 150 : impact budget, lieu, ambiance et charge mentale. Choisir un format, pas subir la liste familiale.",
    excerptEn:
      "30 vs 150 guests: budget, venue, vibe, and mental load. Choose a format, do not inherit the family list.",
    readingMinutes: 6,
    heroAltFr: "Mariage intime ou grande réception",
    heroAltEn: "Intimate wedding or large reception",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Passer de 30 à 150 invités, ce n'est pas « un peu plus cher ». C'est un autre lieu, un autre traiteur, parfois un autre week-end. Les chiffres du secteur tournent autour de 90 invités en moyenne ; vous choisissez où vous vous situez.",
        ],
      },
      {
        type: "list",
        title: "30 invités (intime)",
        items: [
          "Budget total souvent 8 000 à 15 000 €",
          "Lieu : restaurant privatisé, maison familiale, salle petite",
          "Ambiance : dîner long, conversations transverses",
          "Organisation : plan de table en une soirée",
        ],
      },
      {
        type: "list",
        title: "150 invités (grande réception)",
        items: [
          "Budget 25 000 à 40 000 € fréquent en 2026",
          "Lieu : salle dédiée, château, domaine",
          "Ambiance : soirée dansante, tables de 8-10",
          "Organisation : RSVP, plan de table et logistique sur 6+ mois",
        ],
      },
      {
        type: "quote",
        quote:
          "Le bon nombre d'invités, c'est celui où vous connaissez visuellement chaque personne dans la salle, ou celui où vous acceptez de ne pas tous les saluer individuellement.",
      },
      FIANCE_GUESTS_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Going from 30 to 150 guests is not « a bit more expensive ». It is another venue, another caterer, sometimes another weekend. Industry numbers center around 90 guests on average; you choose where you land.",
        ],
      },
      {
        type: "list",
        title: "30 guests (intimate)",
        items: [
          "Total budget often €8,000–15,000",
          "Venue: private dining room, family home, small hall",
          "Vibe: long dinner, cross-table conversation",
          "Planning: seating chart in one evening",
        ],
      },
      {
        type: "list",
        title: "150 guests (large reception)",
        items: [
          "Budget €25,000–40,000 common in 2026",
          "Venue: dedicated hall, château, estate",
          "Vibe: dance floor, tables of 8–10",
          "Planning: RSVP, seating, logistics over 6+ months",
        ],
      },
      {
        type: "quote",
        quote:
          "The right guest count is where you can picture every face in the room, or where you accept not greeting everyone individually.",
      },
      FIANCE_GUESTS_EN,
    ],
  }),

  postPair({
    slug: "save-the-date-faire-part-calendrier",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Save-the-date, faire-part et RSVP : le calendrier",
    titleEn: "Save-the-date, invitations, and RSVP: the timeline",
    excerptFr:
      "Save-the-date 6-8 mois avant, faire-part 2-3 mois, RSVP 3-4 semaines avant : le calendrier communication invités.",
    excerptEn:
      "Save-the-date 6–8 months out, invitations 2–3 months, RSVP 3–4 weeks before: guest communication timeline.",
    readingMinutes: 5,
    heroAltFr: "Calendrier save-the-date faire-part mariage",
    heroAltEn: "Save-the-date invitation wedding timeline",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Envoyer le faire-part trop tôt ou le save-the-date trop tard crée le même problème : vos invités ne bloquent pas la date. Voici le calendrier que nous recommandons dans Fiancé pour un mariage préparé sur 12 à 14 mois.",
        ],
      },
      {
        type: "list",
        title: "Jalons communication",
        items: [
          "Save-the-date : 6 à 8 mois avant (8-10 mois si destination ou gros déplacements)",
          "Faire-part officiel : 2 à 3 mois avant",
          "RSVP date limite : 3 à 4 semaines avant le jour J",
          "Relances : voir [quand relancer](/blog/rsvp-mariage-quand-relancer)",
          "Infos logistique (hébergement, navette) : avec le faire-part ou 6 semaines avant",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Mariage en 6 mois ? Sautez le save-the-date, envoyez le faire-part immédiatement avec RSVP en ligne.",
        ],
      },
      {
        type: "text",
        title: "Canaux",
        paragraphs: [
          "Courrier pour les proches et les familles qui aiment le papier.",
          "Email ou lien Fiancé pour les amis à l'étranger.",
          "Un seul lien RSVP par foyer, pas par personne.",
        ],
      },
      FIANCE_GUESTS_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Sending the invitation too early or the save-the-date too late creates the same problem: guests do not block the date. Here is the timeline we recommend in Fiancé for a 12 to 14 month prep.",
        ],
      },
      {
        type: "list",
        title: "Communication milestones",
        items: [
          "Save-the-date: 6 to 8 months before (8–10 if destination or long travel)",
          "Official invitation: 2 to 3 months before",
          "RSVP deadline: 3 to 4 weeks before the wedding day",
          "Follow-ups: see [when to nudge](/blog/rsvp-mariage-quand-relancer)",
          "Logistics (lodging, shuttle): with invitation or 6 weeks before",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Six-month wedding? Skip save-the-date, send the invitation immediately with online RSVP.",
        ],
      },
      {
        type: "text",
        title: "Channels",
        paragraphs: [
          "Mail for close family who value paper.",
          "Email or Fiancé link for friends abroad.",
          "One RSVP link per household, not per person.",
        ],
      },
      FIANCE_GUESTS_EN,
    ],
  }),

  postPair({
    slug: "suivre-communications-invites-mariage",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Suivre les communications avec les invités",
    titleEn: "Track guest communications",
    excerptFr:
      "Qui a reçu le save-the-date, le faire-part, le menu ? Un suivi simple pour ne pas relancer deux fois la même personne.",
    excerptEn:
      "Who got the save-the-date, invitation, menu? Simple tracking so you do not nudge the same person twice.",
    readingMinutes: 5,
    heroAltFr: "Suivi communications invités mariage",
    heroAltEn: "Track wedding guest communications",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "À J-30, vous devez savoir qui n'a pas répondu, qui n'a pas reçu le faire-part, et qui attend encore le lien menu. Sans statut par invité, vous renvoyez un save-the-date à quelqu'un déjà confirmé.",
        ],
      },
      {
        type: "list",
        title: "Statuts utiles par foyer",
        items: [
          "Save-the-date envoyé (date)",
          "Faire-part envoyé (date)",
          "RSVP : en attente / oui / non",
          "Menu choisi",
          "Relance effectuée (date)",
          "Notes (ex. hébergement proposé)",
        ],
      },
      {
        type: "text",
        title: "Workflow hebdo (à partir de J-90)",
        paragraphs: [
          "Lundi : export des « en attente » depuis Fiancé.",
          "Mercredi : relances personnalisées (max 2 lignes).",
          "Vendredi : mise à jour traiteur si effectif a bougé.",
          "Alignez ce rythme sur le [calendrier faire-part](/blog/save-the-date-faire-part-calendrier).",
        ],
      },
      {
        type: "quote",
        quote:
          "Relancer sans trace, c'est relancer deux fois les mêmes et oublier ceux qui comptent.",
      },
      FIANCE_GUESTS_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "At D-30 you need to know who has not replied, who never got the invitation, and who still waits for the menu link. Without per-guest status, you resend a save-the-date to someone already confirmed.",
        ],
      },
      {
        type: "list",
        title: "Useful statuses per household",
        items: [
          "Save-the-date sent (date)",
          "Invitation sent (date)",
          "RSVP: pending / yes / no",
          "Menu selected",
          "Follow-up sent (date)",
          "Notes (e.g. lodging offered)",
        ],
      },
      {
        type: "text",
        title: "Weekly workflow (from D-90)",
        paragraphs: [
          "Monday: export « pending » from Fiancé.",
          "Wednesday: personal nudges (2 lines max).",
          "Friday: caterer update if headcount moved.",
          "Align this rhythm with the [invitation timeline](/blog/save-the-date-faire-part-calendrier).",
        ],
      },
      {
        type: "quote",
        quote:
          "Follow up without a log means nudging the same people twice and forgetting the ones who matter.",
      },
      FIANCE_GUESTS_EN,
    ],
  }),

  postPair({
    slug: "rsvp-en-ligne-sans-compte",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "RSVP en ligne sans compte invité",
    titleEn: "Online RSVP without a guest account",
    excerptFr:
      "Vos invités n'ont pas envie de créer un compte. La page publique Fiancé : lien, réponse, sync avec votre liste.",
    excerptEn:
      "Your guests do not want an account. Fiancé's public page: link, reply, sync with your list.",
    readingMinutes: 5,
    heroAltFr: "RSVP en ligne sans compte mariage",
    heroAltEn: "Online wedding RSVP no account",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Demander à un oncle de télécharger une app pour dire « oui » à un repas, ça tue le taux de réponse. Nous avons conçu la page publique Fiancé pour que l'invité clique, réponde, et reparte en 60 secondes.",
        ],
      },
      {
        type: "list",
        title: "Ce que voit l'invité",
        items: [
          "Date, lieu, nom du couple",
          "Formulaire : présence, +1, enfants, régimes",
          "Pas de mot de passe, pas d'installation",
          "Confirmation à l'écran (email optionnel selon votre réglage)",
        ],
      },
      {
        type: "text",
        title: "Ce que vous gardez côté organisateurs",
        paragraphs: [
          "Réponses synchronisées dans la liste invités de l'app.",
          "Lien unique par foyer ou code court à recopier sur le faire-part.",
          "Vous pouvez fermer le formulaire à la date limite RSVP.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Combinez avec le [calendrier RSVP](/blog/rsvp-mariage-quand-relancer) pour verrouiller le traiteur à temps.",
        ],
      },
      FIANCE_GUESTS_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Asking an uncle to download an app to say « yes » to dinner kills response rates. We built Fiancé's public page so a guest clicks, replies, and leaves in 60 seconds.",
        ],
      },
      {
        type: "list",
        title: "What the guest sees",
        items: [
          "Date, venue, couple names",
          "Form: attendance, plus-one, children, diets",
          "No password, no install",
          "On-screen confirmation (optional email depending on settings)",
        ],
      },
      {
        type: "text",
        title: "What you keep as organizers",
        paragraphs: [
          "Replies sync into the app guest list.",
          "Unique link per household or short code on the invitation.",
          "You can close the form at the RSVP deadline.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Pair with the [RSVP timeline](/blog/rsvp-mariage-quand-relancer) to lock the caterer on time.",
        ],
      },
      FIANCE_GUESTS_EN,
    ],
  }),

  postPair({
    slug: "taux-reponse-rsvp-mariage",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Taux de réponse RSVP mariage : à quoi s'attendre",
    titleEn: "Wedding RSVP response rate: what to expect",
    excerptFr:
      "Environ 20 % de déclins, visez 80 % de oui confirmés pour le traiteur. Comment modéliser les absentés.",
    excerptEn:
      "Roughly 20% declines, plan on 80% yes for the caterer. How to model no-shows.",
    readingMinutes: 5,
    heroAltFr: "Taux réponse RSVP mariage",
    heroAltEn: "Wedding RSVP response rate",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le traiteur demande un nombre ferme. Vous n'avez que des RSVP partiels et une date limite dans trois semaines. La règle empirique : environ 20 % de déclins sur une liste mixte France / étranger, parfois plus en août (vacances).",
        ],
      },
      {
        type: "list",
        title: "Modèle simple",
        items: [
          "100 invités envoyés → attendez ~80 présents, ~20 absents",
          "RSVP reçus à 70 % : extrapolez, ne comptez pas les silencieux comme « oui »",
          "Marge traiteur : +2 à 3 couverts pour erreurs de dernière minute",
          "No-shows jour J : 1-3 % sur liste confirmée (prévoir sans sur-commander massivement)",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ne confirmez jamais 100 % des « oui » au traiteur si votre date limite RSVP n'est pas passée. Voir [relances](/blog/rsvp-mariage-quand-relancer).",
        ],
      },
      {
        type: "text",
        title: "Ajuster par profil",
        paragraphs: [
          "Liste très locale : déclins plutôt 10-15 %.",
          "Beaucoup d'invités overseas ou été : montez à 25 %.",
          "Re-comptez à J-14 quand les silencieux ont été relancés.",
        ],
      },
      FIANCE_GUESTS_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The caterer wants a firm number. You only have partial RSVPs and a deadline three weeks out. Rule of thumb: about 20% declines on a mixed local / abroad list, sometimes higher in August (holidays).",
        ],
      },
      {
        type: "list",
        title: "Simple model",
        items: [
          "100 invited → expect ~80 attending, ~20 out",
          "70% RSVP return: extrapolate, do not treat silence as « yes »",
          "Caterer buffer: +2–3 covers for last-minute fixes",
          "Day-of no-shows: 1–3% on confirmed list (plan without massive over-order)",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Never confirm 100% of « yes » to the caterer if your RSVP deadline has not passed. See [follow-ups](/blog/rsvp-mariage-quand-relancer).",
        ],
      },
      {
        type: "text",
        title: "Adjust by profile",
        paragraphs: [
          "Mostly local list: declines closer to 10–15%.",
          "Many overseas guests or summer date: plan for 25%.",
          "Recount at D-14 after nudging the silent ones.",
        ],
      },
      FIANCE_GUESTS_EN,
    ],
  }),

  postPair({
    slug: "plan-de-table-mariage-guide-complet",
    categoryKey: "seating",
    categoryFr: "Plan de table",
    categoryEn: "Seating",
    titleFr: "Plan de table mariage : guide complet",
    titleEn: "Wedding seating chart: complete guide",
    excerptFr:
      "Commencez à 80-90 % de RSVP (~J-30), tables de 8-10, export PDF traiteur : le workflow plan de table de A à Z.",
    excerptEn:
      "Start at 80–90% RSVP (~D-30), tables of 8–10, PDF for caterer: seating workflow A to Z.",
    readingMinutes: 7,
    heroAltFr: "Guide plan de table mariage",
    heroAltEn: "Wedding seating chart complete guide",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le plan de table bloque quand les RSVP traînent. Notre recommandation : démarrer à 80-90 % de réponses, soit environ 4 semaines avant le jour J, puis ajuster les dernières tables quand les retardataires confirment.",
        ],
      },
      {
        type: "list",
        title: "Étapes",
        items: [
          "1. Exporter la liste « confirmés » depuis Fiancé",
          "2. Choisir format tables (rondes 8-10, rectangulaires, serpentin)",
          "3. Poser table d'honneur et tables « familles »",
          "4. Placer groupes d'amis, mélanger les tables (voir [5 règles](/blog/plan-de-table-5-regles-placement))",
          "5. Vérifier couples, enfants avec parents, régimes par table",
          "6. Export PDF + plan imprimé pour le jour J",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Testez la disposition sur l'outil [plan de table](/tools/seating-chart) avant de verrouiller dans l'app.",
        ],
      },
      {
        type: "text",
        title: "Erreurs fréquentes",
        paragraphs: [
          "Commencer à 50 % RSVP : vous refaites tout deux fois.",
          "Oublier la table traiteur / DJ / photographe.",
          "Ne pas laisser 1-2 places flexibles par table pour les ajustements J-7.",
        ],
      },
      FIANCE_SEATING_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Seating stalls when RSVPs lag. Our recommendation: start at 80–90% of replies, about 4 weeks before the wedding day, then tweak the last tables when stragglers confirm.",
        ],
      },
      {
        type: "list",
        title: "Steps",
        items: [
          "1. Export « confirmed » list from Fiancé",
          "2. Pick table format (round 8–10, rectangular, serpentine)",
          "3. Place head table and « family » tables",
          "4. Seat friend groups, mix tables (see [5 rules](/blog/plan-de-table-5-regles-placement))",
          "5. Check couples, kids with parents, diets per table",
          "6. PDF export + printed plan for the day",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Try layouts on the [seating chart tool](/tools/seating-chart) before locking in the app.",
        ],
      },
      {
        type: "text",
        title: "Common mistakes",
        paragraphs: [
          "Starting at 50% RSVP: you rebuild everything twice.",
          "Forgetting caterer / DJ / photographer table.",
          "Not leaving 1–2 flex seats per table for D-7 tweaks.",
        ],
      },
      FIANCE_SEATING_EN,
    ],
  }),

  postPair({
    slug: "plan-de-table-5-regles-placement",
    categoryKey: "seating",
    categoryFr: "Plan de table",
    categoryEn: "Seating",
    titleFr: "Plan de table : 5 règles de placement",
    titleEn: "Seating chart: 5 placement rules",
    excerptFr:
      "Ne jamais séparer les couples, mélanger les groupes, placer les « connecteurs » sociables : les règles qui évitent les tables silencieuses.",
    excerptEn:
      "Never split couples, mix groups, seat social connectors: rules that avoid silent tables.",
    readingMinutes: 5,
    heroAltFr: "Règles placement plan de table",
    heroAltEn: "Seating chart placement rules",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un plan de table réussi se joue sur l'ambiance par table, pas seulement sur la généalogie. Cinq règles simples, apprises après trop de retours « on ne connaissait personne à notre table ».",
        ],
      },
      {
        type: "list",
        title: "Les 5 règles",
        items: [
          "1. Ne jamais séparer un couple (ni fratrie enfant si jeunes)",
          "2. Mélanger : max 50 % d'un même groupe d'amis sur une table",
          "3. Placer 1 « connecteur » sociable par table difficile",
          "4. Éviter d'accumuler les ex ou tensions connues",
          "5. Table d'enfants seulement si 6+ enfants du même âge et garde prévue",
        ],
      },
      {
        type: "quote",
        quote:
          "La table d'honneur rassure les parents. Les autres tables doivent fonctionner sans vous.",
      },
      {
        type: "text",
        title: "Ordre de placement",
        paragraphs: [
          "D'abord contraintes dures (couples, familles, mobilité).",
          "Ensuite groupes d'amis.",
          "Enfin invités isolés : accolez-les à un connecteur, pas à une table déjà pleine de inconnus.",
          "Fiancé surligne les invités sans table assignée pour finir proprement.",
        ],
      },
      FIANCE_SEATING_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A good seating chart is about table energy, not genealogy alone. Five simple rules, learned after too many « we knew nobody at our table » comments.",
        ],
      },
      {
        type: "list",
        title: "Five rules",
        items: [
          "1. Never split a couple (or young siblings)",
          "2. Mix: max 50% of one friend group per table",
          "3. Seat one social connector at each tricky table",
          "4. Avoid stacking exes or known tension",
          "5. Kids' table only with 6+ same-age kids and planned supervision",
        ],
      },
      {
        type: "quote",
        quote:
          "The head table reassures parents. Other tables must work without you.",
      },
      {
        type: "text",
        title: "Placement order",
        paragraphs: [
          "Hard constraints first (couples, families, mobility).",
          "Then friend groups.",
          "Finally solo guests: pair with a connector, not a table full of strangers.",
          "Fiancé highlights unassigned guests so you finish clean.",
        ],
      },
      FIANCE_SEATING_EN,
    ],
  }),

  postPair({
    slug: "tables-rondes-ou-rectangulaires-mariage",
    categoryKey: "seating",
    categoryFr: "Plan de table",
    categoryEn: "Seating",
    titleFr: "Tables rondes ou rectangulaires au mariage",
    titleEn: "Round or rectangular tables at your wedding",
    excerptFr:
      "Rondes : convivialité, 8-10 places. Rectangulaires : gain de place, style banquet. Avantages, inconvénients, et impact plan de table.",
    excerptEn:
      "Round: convivial, 8–10 seats. Rectangular: space-efficient, banquet style. Pros, cons, and seating impact.",
    readingMinutes: 6,
    heroAltFr: "Tables rondes ou rectangulaires mariage",
    heroAltEn: "Round or rectangular wedding tables",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le lieu impose souvent le format. Quand vous avez le choix, rondes vs rectangulaires change le nombre de tables, la circulation serveurs, et la façon dont les groupes se parlent.",
        ],
      },
      {
        type: "list",
        title: "Tables rondes",
        items: [
          "8 à 10 convives idéal, 12 possible mais conversations fragmentées",
          "Chaque invité voit tout le monde à la table",
          "Prend plus de surface au sol",
          "Plan de table : un groupe = une table",
        ],
      },
      {
        type: "list",
        title: "Tables rectangulaires",
        items: [
          "Banquet : 2 longues tables face à face pour mariage intime",
          "Plus de places au m² en salle étroite",
          "Extrémités parfois isolées : placez-y des connecteurs",
          "Plan de table : decoupez un groupe sur 2 tables adjacentes si besoin",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Fiancé supporte les deux formats dans le [plan de table](/tools/seating-chart). Testez le nombre de tables avant de commander la location.",
        ],
      },
      FIANCE_SEATING_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The venue often dictates format. When you choose, round vs rectangular changes table count, server paths, and how groups talk to each other.",
        ],
      },
      {
        type: "list",
        title: "Round tables",
        items: [
          "8–10 guests ideal, 12 possible but conversations split",
          "Everyone at the table sees each other",
          "Uses more floor space",
          "Seating: one group = one table",
        ],
      },
      {
        type: "list",
        title: "Rectangular tables",
        items: [
          "Banquet: 2 long tables face to face for intimate weddings",
          "More seats per m² in narrow rooms",
          "Ends can feel isolated: seat connectors there",
          "Seating: split one group across 2 adjacent tables if needed",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Fiancé supports both in the [seating chart](/tools/seating-chart). Test table count before ordering rentals.",
        ],
      },
      FIANCE_SEATING_EN,
    ],
  }),

  postPair({
    slug: "plan-de-table-serpentin-mariage",
    categoryKey: "seating",
    categoryFr: "Plan de table",
    categoryEn: "Seating",
    titleFr: "Plan de table serpentin au mariage",
    titleEn: "Serpentine seating at your wedding",
    excerptFr:
      "Disposition serpentin : une longue table en U ou vague. Quand l'utiliser, combien de convives, et pièges à éviter.",
    excerptEn:
      "Serpentine layout: one long U or wave table. When to use it, how many guests, pitfalls to avoid.",
    readingMinutes: 5,
    heroAltFr: "Plan de table serpentin mariage",
    heroAltEn: "Serpentine wedding seating",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le serpentin (ou table unique sinueuse) revient dans les mariages champêtres et les repas assis décontractés. Tout le monde est « à la même table », visuellement, sans tenir une ligne rectiligne de 40 mètres.",
        ],
      },
      {
        type: "list",
        title: "Quand choisir le serpentin",
        items: [
          "30 à 80 convives assis (au-delà, circulation difficile)",
          "Repas servi à l'assiette ou family style, pas buffet lointain",
          "Lieu long (grange, tente) plutôt que salle carrée",
          "Ambiance familiale : vous voulez un seul « bloc » visuel",
        ],
      },
      {
        type: "text",
        title: "Pièges",
        paragraphs: [
          "Centres de table hauts qui bloquent la vue en courbe.",
          "Invités en fer à cheval externe : ils ne voient que les dos.",
          "Service : le traiteur doit valider le sens de rotation des assiettes.",
        ],
      },
      {
        type: "quote",
        quote:
          "Serpentin, ce n'est pas une table de plus. C'est une seule table qui plie.",
      },
      FIANCE_SEATING_FR,
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Serpentine (one winding table) shows up in rustic weddings and relaxed seated meals. Everyone is « at the same table » visually without a straight 40-meter line.",
        ],
      },
      {
        type: "list",
        title: "When to pick serpentine",
        items: [
          "30 to 80 seated guests (beyond that, flow gets hard)",
          "Plated or family-style service, not a distant buffet",
          "Long venue (barn, tent) rather than a square room",
          "Family vibe: you want one visual « block »",
        ],
      },
      {
        type: "text",
        title: "Pitfalls",
        paragraphs: [
          "Tall centerpieces blocking sightlines on curves.",
          "Guests on the outer horseshoe: they only see backs.",
          "Service: caterer must sign off on plate rotation direction.",
        ],
      },
      {
        type: "quote",
        quote:
          "Serpentine is not an extra table. It is one table that bends.",
      },
      FIANCE_SEATING_EN,
    ],
  }),
];

export const { fr: POSTS_11_30_FR, en: POSTS_11_30_EN } = pairsToArrays(pairs);
