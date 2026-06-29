import { postPair, pairsToArrays } from "./blog-posts-shared";
import type { BlogSection } from "./blog-types";

const fianceHelpFr = (paragraphs: string[]): BlogSection => ({
  type: "text",
  title: "Comment Fiancé peut vous aider",
  paragraphs,
});

const fianceHelpEn = (paragraphs: string[]): BlogSection => ({
  type: "text",
  title: "How Fiancé can help",
  paragraphs,
});

const pairs = [
  postPair({
    slug: "finaliser-plan-de-table-traiteur",
    categoryKey: "seating",
    categoryFr: "Plan de table",
    categoryEn: "Seating",
    titleFr: "Finaliser le plan de table et l'envoyer au traiteur",
    titleEn: "Finalize your seating chart and send it to the caterer",
    excerptFr:
      "Cinq à dix jours avant le jour J : verrouillez les tables, exportez un PDF clair, et transmettez les infos utiles au traiteur.",
    excerptEn:
      "Five to ten days before the big day: lock tables, export a clear PDF, and pass the right details to your caterer.",
    readingMinutes: 6,
    heroAltFr: "Plan de table mariage à finaliser pour le traiteur",
    heroAltEn: "Wedding seating chart ready to send to the caterer",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le plan de table n'est pas une décoration de dernière minute. C'est un document opérationnel : le traiteur en déduit les couverts, les régimes alimentaires par table, parfois la disposition des serveurs.",
          "Chez Fiancé, nous voyons souvent des couples qui peaufinent les placements jusqu'à J-3, puis oublient d'envoyer la version finale. Résultat : couverts en trop, invités mal placés près du buffet, stress inutile le matin même.",
        ],
      },
      {
        type: "list",
        title: "Pourquoi viser J-5 à J-10",
        items: [
          "Les RSVP tardifs ont eu le temps d'arriver (ou d'être refusés)",
          "Le traiteur peut ajuster les quantités sans urgence",
          "Vous gardez une marge pour un changement de dernière minute (annulation, enfant malade)",
          "Les témoins et le lieu reçoivent la même version que le traiteur",
        ],
      },
      {
        type: "list",
        title: "Ce que le PDF doit contenir",
        items: [
          "Nom de chaque table et liste des invités assignés",
          "Régimes et allergies visibles (végétarien, sans gluten, halal, etc.)",
          "Nombre total de couverts et répartition par table",
          "Notes pour le traiteur : table enfants, table VIP, accès PMR",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Astuce : envoyez le PDF par email avec le sujet « Plan de table définitif - [date] - [nom des mariés] ». Joignez un contact joignable le jour J (témoin ou coordinateur).",
        ],
      },
      fianceHelpFr([
        "Le [plan de table Fiancé](/tools/seating-chart) se synchronise avec votre liste d'invités et les RSVP. Export PDF en un clic, avec les régimes alimentaires par personne. Vous pouvez aussi partager la version finale depuis l'onglet Invités.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A seating chart is not last-minute decor. It is an operations document: the caterer reads headcount, dietary needs per table, sometimes server placement.",
          "At Fiancé we often see couples tweak placements until three days out, then forget to send the final version. Extra place settings, guests stuck near the buffet, stress on the morning of: all avoidable.",
        ],
      },
      {
        type: "list",
        title: "Why aim for 5 to 10 days out",
        items: [
          "Late RSVPs have had time to arrive (or be declined)",
          "The caterer can adjust quantities without rushing",
          "You keep slack for a last-minute change (cancellation, sick child)",
          "Witnesses and the venue get the same version as the caterer",
        ],
      },
      {
        type: "list",
        title: "What the PDF should include",
        items: [
          "Each table name and assigned guest list",
          "Visible diets and allergies (vegetarian, gluten-free, halal, etc.)",
          "Total covers and count per table",
          "Notes for the caterer: kids' table, VIP table, wheelchair access",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Tip: email the PDF with the subject line \"Final seating chart - [date] - [couple names]\". Include a day-of contact (witness or coordinator).",
        ],
      },
      fianceHelpEn([
        "The Fiancé [seating chart](/tools/seating-chart) syncs with your guest list and RSVPs. One-click PDF export with dietary flags per guest. You can also share the final version from the Guests tab.",
      ]),
    ],
  }),

  postPair({
    slug: "ordre-reservation-prestataires-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Dans quel ordre réserver ses prestataires de mariage ?",
    titleEn: "In what order should you book wedding vendors?",
    excerptFr:
      "Lieu 12-24 mois, photo 9-15 mois, traiteur 6-12 mois, DJ 6-9 mois : un ordre concret pour ne pas perdre vos créneaux.",
    excerptEn:
      "Venue 12-24 months, photo 9-15 months, caterer 6-12 months, DJ 6-9 months: a concrete order so you do not miss peak-season slots.",
    readingMinutes: 6,
    heroAltFr: "Ordre de réservation des prestataires mariage",
    heroAltEn: "Wedding vendor booking order",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Tous les prestataires ne se réservent pas au même rythme. En été, un château peut être complet 18 mois avant, alors qu'un fleuriste local accepte encore des demandes à 4 mois.",
          "L'ordre ci-dessous part de ce que nous observons en France, surtout pour 80 à 150 invités en haute saison. Adaptez si votre date est hors juin-septembre ou si vous faites un format plus petit.",
        ],
      },
      {
        type: "list",
        title: "Ordre de réservation recommandé",
        items: [
          "1. Lieu de réception : 12 à 24 mois avant (bloque date, capacité, horaires)",
          "2. Photographe (et vidéaste si besoin) : 9 à 15 mois",
          "3. Traiteur ou formule restauration du lieu : 6 à 12 mois",
          "4. DJ, groupe ou animation : 6 à 9 mois",
          "5. Fleuriste, décor, beauté : 4 à 9 mois selon la demande locale",
          "6. Transport, gâteau, officiant laïque : 3 à 6 mois",
        ],
      },
      {
        type: "text",
        title: "Pourquoi le lieu passe en premier",
        paragraphs: [
          "Sans salle confirmée, vous ne savez pas combien de personnes accueillir, quels horaires imposer au traiteur, ni si la pluie vous force en intérieur.",
          "Beaucoup de lieux imposent une liste de traiteurs partenaires. Réserver le traiteur avant le lieu, c'est parfois jeter un devis sur une salle incompatible.",
        ],
      },
      {
        type: "quote",
        quote:
          "Un créneau perdu sur le lieu ou le photographe se rattrape rarement. Le reste se compresse.",
      },
      fianceHelpFr([
        "L'onglet Prestataires de Fiancé suit chaque contact avec statut (prospect, devis reçu, réservé). La checklist pré-remplie rappelle les jalons « 12 mois avant », « 9 mois avant », etc., calés sur votre date de mariage. Validez d'abord le plafond dans le [simulateur budget](/tools/budget-calculator).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Not every vendor books on the same timeline. In summer a chateau may be full 18 months ahead, while a local florist still takes requests at 4 months.",
          "The order below reflects what we see in France, especially for 80 to 150 guests in peak season. Adjust for off-season dates or smaller formats.",
        ],
      },
      {
        type: "list",
        title: "Recommended booking order",
        items: [
          "1. Reception venue: 12 to 24 months out (locks date, capacity, hours)",
          "2. Photographer (and videographer if needed): 9 to 15 months",
          "3. Caterer or venue catering package: 6 to 12 months",
          "4. DJ, band, or entertainment: 6 to 9 months",
          "5. Florist, decor, beauty: 4 to 9 months depending on local demand",
          "6. Transport, cake, secular officiant: 3 to 6 months",
        ],
      },
      {
        type: "text",
        title: "Why the venue comes first",
        paragraphs: [
          "Without a confirmed venue you do not know headcount limits, caterer hours, or whether rain pushes you indoors.",
          "Many venues require partner caterers. Booking a caterer before the venue sometimes means a quote for an incompatible room.",
        ],
      },
      {
        type: "quote",
        quote:
          "A missed slot on the venue or photographer rarely gets fixed. Everything else gets compressed.",
      },
      fianceHelpEn([
        "Fiancé's Vendors tab tracks each contact with status (prospect, quote received, booked). The pre-filled checklist reminds you of \"12 months out\", \"9 months out\" milestones aligned to your wedding date. Validate your cap first in the [budget calculator](/tools/budget-calculator).",
      ]),
    ],
  }),

  postPair({
    slug: "negocier-devis-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Négocier un devis mariage sans brûler les ponts",
    titleEn: "Negotiate a wedding quote without burning bridges",
    excerptFr:
      "Demander un ajustement, c'est normal. Voici comment le faire proprement, avec des devis écrits et des lignes comparables.",
    excerptEn:
      "Asking for an adjustment is normal. Here is how to do it cleanly, with written quotes and comparable line items.",
    readingMinutes: 6,
    heroAltFr: "Négociation de devis prestataires mariage",
    heroAltEn: "Negotiating wedding vendor quotes",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un devis mariage n'est pas un marché de souk. C'est une conversation entre deux pros : vous organisez un événement unique, le prestataire protège ses marges et son planning.",
          "Nous avons conçu Fiancé pour comparer des chiffres, pas pour envoyer des messages agressifs. La négociation gagnante laisse les deux parties prêtes à travailler ensemble le jour J.",
        ],
      },
      {
        type: "list",
        title: "Règles de base",
        items: [
          "Exigez un devis écrit (email ou PDF), jamais un prix au téléphone seul",
          "Comparez les mêmes postes : heures de présence, nombre de photos livrées, boissons incluses",
          "Posez une question précise : « Que pouvez-vous retirer ou simplifier pour rester sous X € ? »",
          "Ne mentez pas sur un concurrent fictif : les prestataires locaux se parlent",
          "Acceptez parfois « non » : un refus clair vaut mieux qu'un prestataire amer",
        ],
      },
      {
        type: "list",
        title: "Leviers de négociation réalistes",
        items: [
          "Date hors samedi ou hors saison",
          "Format plus court (cocktail vs dîner assis)",
          "Moins de options (bar à vin simple vs open bar premium)",
          "Paiement comptant ou acompte rapide en échange d'un geste",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Astuce : notez chaque contre-proposition dans Fiancé ou votre CRM prestataires. Six mois plus tard, vous ne vous souviendrez plus de la version « sans photobooth ».",
        ],
      },
      fianceHelpFr([
        "Comparez les devis traiteur côte à côte dans Fiancé, avec le nombre d'invités confirmés. Liez chaque dépense au budget pour voir l'impact d'une ligne retirée ou ajoutée. Posez d'abord le plafond dans le [simulateur budget](/tools/budget-calculator).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A wedding quote is not a flea market. It is a conversation between two professionals: you are running a one-off event, the vendor is protecting margin and calendar.",
          "We built Fiancé to compare numbers, not to send aggressive messages. A good negotiation leaves both sides ready to work together on the day.",
        ],
      },
      {
        type: "list",
        title: "Ground rules",
        items: [
          "Insist on a written quote (email or PDF), never a phone price alone",
          "Compare the same line items: hours on site, photos delivered, drinks included",
          "Ask a specific question: \"What can you remove or simplify to stay under X?\"",
          "Do not invent a fake competitor: local vendors talk to each other",
          "Accept \"no\" sometimes: a clear refusal beats a resentful vendor",
        ],
      },
      {
        type: "list",
        title: "Realistic negotiation levers",
        items: [
          "Off-Saturday or off-season date",
          "Shorter format (cocktail vs seated dinner)",
          "Fewer options (simple wine bar vs premium open bar)",
          "Fast deposit or cash payment in exchange for a small discount",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Tip: log every counter-offer in Fiancé or your vendor CRM. Six months later you will not remember the \"no photobooth\" version.",
        ],
      },
      fianceHelpEn([
        "Compare caterer quotes side by side in Fiancé, tied to confirmed guest count. Link each expense to the budget to see the impact of removing or adding a line item. Set the cap first in the [budget calculator](/tools/budget-calculator).",
      ]),
    ],
  }),

  postPair({
    slug: "cinq-prestataires-a-booker-priorite",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Les 5 prestataires à réserver en priorité",
    titleEn: "The 5 vendors to book first",
    excerptFr:
      "Lieu, traiteur, photographe, DJ, fleuriste : si le budget ou le temps manque, voici l'ordre qui protège le plus votre journée.",
    excerptEn:
      "Venue, caterer, photographer, DJ, florist: if budget or time is tight, this order protects your day the most.",
    readingMinutes: 5,
    heroAltFr: "Cinq prestataires mariage prioritaires",
    heroAltEn: "Five priority wedding vendors",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Tout ne peut pas être « priorité numéro un ». En pratique, cinq prestataires structurent 80 % de l'expérience invités : où vous êtes, ce qu'ils mangent, ce qu'ils gardent en photo, l'ambiance sonore, ce qu'ils voient en arrivant.",
        ],
      },
      {
        type: "list",
        title: "Les cinq incontournables",
        items: [
          "1. Lieu de réception : capacité, date, plan B pluie",
          "2. Traiteur : repas, service, timing du dîner",
          "3. Photographe : souvenirs irremplaçables",
          "4. DJ ou groupe : rythme de la soirée, micro pour les discours",
          "5. Fleuriste : décoration visible dès l'entrée (bouquet, centre de table, arche)",
        ],
      },
      {
        type: "text",
        title: "Ce qui peut attendre un peu",
        paragraphs: [
          "Vidéaste, photobooth, transport luxe, wedding cake sur mesure : utiles, mais substituables ou compressibles si le budget serre.",
          "Si vous devez couper, coupez d'abord ce que les invités ne remarqueront pas le jour J, pas la salle ni la musique du premier dans.",
        ],
      },
      fianceHelpFr([
        "Créez cinq fiches prestataires dans Fiancé avec statut et dates de relance. Le tableau de bord affiche combien sont encore en « prospect » vs « réservé ». Si le budget serre, repassez par le [simulateur budget](/tools/budget-calculator) avant de signer.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Not everything can be \"priority one\". In practice, five vendors shape 80% of the guest experience: where you are, what they eat, what they keep in photos, the sound track, what they see when they walk in.",
        ],
      },
      {
        type: "list",
        title: "The five essentials",
        items: [
          "1. Reception venue: capacity, date, rain plan B",
          "2. Caterer: meal, service, dinner timing",
          "3. Photographer: irreplaceable memories",
          "4. DJ or band: party pace, mic for speeches",
          "5. Florist: visible decor at the door (bouquet, centerpieces, arch)",
        ],
      },
      {
        type: "text",
        title: "What can wait a bit",
        paragraphs: [
          "Videographer, photobooth, luxury transport, custom wedding cake: nice, but replaceable or shrinkable on a tight budget.",
          "If you must cut, cut what guests will not notice on the day before you cut the room or first-dance music.",
        ],
      },
      fianceHelpEn([
        "Create five vendor records in Fiancé with status and follow-up dates. The dashboard shows how many are still \"prospect\" vs \"booked\". If budget is tight, rerun the [budget calculator](/tools/budget-calculator) before signing.",
      ]),
    ],
  }),

  postPair({
    slug: "centraliser-devis-prestataires-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Centraliser les devis prestataires au même endroit",
    titleEn: "Centralize vendor quotes in one place",
    excerptFr:
      "Emails, PDF, notes vocales : sans CRM mariage, vous perdez des versions et des échéances d'acompte.",
    excerptEn:
      "Emails, PDFs, voice notes: without a wedding CRM you lose versions and deposit deadlines.",
    readingMinutes: 6,
    heroAltFr: "Centraliser les devis prestataires mariage",
    heroAltEn: "Centralize wedding vendor quotes",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "À J-8 mois, vous avez peut-être douze fils de discussion ouverts : traiteur A, photographe B, DJ recommandé par un ami. Chaque devis vit dans un email différent.",
          "Quand nous avons interviewé des couples sur Fiancé, le motif numéro un de dépassement budget n'était pas le luxe : c'était « j'avais oublié cette option à 400 € dans le devis v2 ».",
        ],
      },
      {
        type: "list",
        title: "Ce qu'un bon dossier prestataire contient",
        items: [
          "Contact (nom, email, téléphone, site)",
          "Devis reçu avec date et montant TTC",
          "Statut : prospect, devis en cours, réservé, refusé",
          "Prochaine action : relance, signature, acompte",
          "Notes : ce qui est inclus, exclusions, conditions météo",
        ],
      },
      {
        type: "list",
        title: "Erreurs fréquentes",
        items: [
          "Comparer le devis traiteur « par personne » avec le photographe « forfait journée » sans total",
          "Oublier les frais de déplacement ou heures supplémentaires",
          "Ne pas lier l'acompte au calendrier budget",
        ],
      },
      fianceHelpFr([
        "Fiancé remplace le tableur prestataires : fiches par type (traiteur, photo, DJ…), statuts, montants et lien direct avec le [module budget](/feature/budget). Commencez par le [simulateur budget](/tools/budget-calculator) en ligne si vous n'avez pas encore l'app.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "At 8 months out you may have a dozen open threads: caterer A, photographer B, a friend's DJ pick. Each quote lives in a different email.",
          "When we interviewed Fiancé couples, the top budget overrun was not luxury: it was \"I forgot that 400 € option in quote v2\".",
        ],
      },
      {
        type: "list",
        title: "What a good vendor file should hold",
        items: [
          "Contact (name, email, phone, website)",
          "Quote received with date and total incl. tax",
          "Status: prospect, quote pending, booked, declined",
          "Next action: follow up, sign, deposit",
          "Notes: inclusions, exclusions, weather clauses",
        ],
      },
      {
        type: "list",
        title: "Common mistakes",
        items: [
          "Comparing caterer \"per guest\" with photographer \"day rate\" without a total",
          "Forgetting travel fees or overtime hours",
          "Not tying deposits to the budget calendar",
        ],
      },
      fianceHelpEn([
        "Fiancé replaces the vendor spreadsheet: records by type (caterer, photo, DJ…), statuses, amounts, and a direct link to the [budget module](/feature/budget). Start with the online [budget calculator](/tools/budget-calculator) if you do not have the app yet.",
      ]),
    ],
  }),

  postPair({
    slug: "tableau-bord-prestataires-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Tableau de bord prestataires : du prospect au réservé",
    titleEn: "Vendor dashboard: from prospect to booked",
    excerptFr:
      "Visualisez où en est chaque prestataire, ce qui bloque encore, et ce qui est signé. Un pipeline simple vaut mieux qu'un tableau de 40 lignes.",
    excerptEn:
      "See where each vendor stands, what is still blocking, and what is signed. A simple pipeline beats a 40-row spreadsheet.",
    readingMinutes: 6,
    heroAltFr: "Tableau de bord prestataires mariage",
    heroAltEn: "Wedding vendor pipeline dashboard",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un tableau de bord prestataires, ce n'est pas de la compta. C'est une vue pipeline : qui est contacté, qui a répondu, qui est réservé, qui est écarté.",
          "Sans cette vue, les couples repoussent les relances « parce qu'on verra le mois prochain », puis perdent un créneau photo en juin.",
        ],
      },
      {
        type: "list",
        title: "Quatre statuts suffisent",
        items: [
          "Prospect : identifié, pas encore contacté ou en attente de dispo",
          "Devis reçu : chiffrage à comparer ou négocier",
          "Réservé : contrat signé, acompte versé si besoin",
          "Écarté : refusé ou indisponible (gardez la note pour mémoire)",
        ],
      },
      {
        type: "list",
        title: "Indicateurs utiles",
        items: [
          "Pourcentage de prestataires « réservés » sur la liste cible",
          "Montant total engagé vs budget prestataires",
          "Prochaine échéance d'acompte ou solde",
          "Prestataires sans réponse depuis plus de 14 jours",
        ],
      },
      {
        type: "quote",
        quote:
          "Ce que vous ne voyez pas sur un tableau de bord, vous le payez en stress à trois semaines du jour J.",
      },
      fianceHelpFr([
        "L'écran Prestataires de Fiancé filtre par type et par statut. La barre de progression montre combien de prestataires clés sont réservés. Idéal en réunion hebdo à deux pour décider qui relancer, avec le [simulateur budget](/tools/budget-calculator) ouvert à côté.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A vendor dashboard is not accounting. It is a pipeline view: who was contacted, who replied, who is booked, who is out.",
          "Without it, couples delay follow-ups \"until next month\", then lose a June photo slot.",
        ],
      },
      {
        type: "list",
        title: "Four statuses are enough",
        items: [
          "Prospect: identified, not contacted yet or waiting on availability",
          "Quote received: pricing to compare or negotiate",
          "Booked: contract signed, deposit paid if required",
          "Declined: rejected or unavailable (keep the note for reference)",
        ],
      },
      {
        type: "list",
        title: "Useful indicators",
        items: [
          "Share of \"booked\" vendors on your target list",
          "Total committed vs vendor budget",
          "Next deposit or balance due date",
          "Vendors with no reply for 14+ days",
        ],
      },
      {
        type: "quote",
        quote:
          "What you do not see on a dashboard, you pay for in stress three weeks before the day.",
      },
      fianceHelpEn([
        "Fiancé's Vendors screen filters by type and status. The progress bar shows how many key vendors are booked. Good for a weekly planning check-in as a couple, with the [budget calculator](/tools/budget-calculator) open alongside.",
      ]),
    ],
  }),

  postPair({
    slug: "planning-jour-j-minute-par-minute",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Planning jour J minute par minute",
    titleEn: "Day-of wedding timeline minute by minute",
    excerptFr:
      "De la préparation à la dernière danse : un déroulé horaire partagé avec témoins, DJ et photographe. Export PDF recommandé.",
    excerptEn:
      "From getting ready to last dance: an hourly run sheet shared with witnesses, DJ, and photographer. PDF export recommended.",
    readingMinutes: 7,
    heroAltFr: "Planning jour J mariage minute par minute",
    heroAltEn: "Wedding day minute-by-minute timeline",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le jour J, personne ne veut lire un Google Doc de 12 pages. Il faut une timeline courte : heure, lieu, qui est concerné, contact utile.",
          "Nous recommandons de la finaliser à J-7 et de l'envoyer aux témoins, au DJ, au photographe et au lieu. Notre [outil timeline](/tools/timeline) génère une base exportable en PDF.",
        ],
      },
      {
        type: "list",
        title: "Tranches horaires types (cérémonie 15h30)",
        items: [
          "8h00-10h30 : préparatifs mariés (coiffure, maquillage, tenues)",
          "10h30-11h30 : photos couple et familles si lumière matinale",
          "11h30-14h00 : marge, déplacement, déjeuner léger",
          "14h00-15h00 : arrivée invités, accueil",
          "15h30 : cérémonie (45 min à 1h selon format)",
          "16h30-18h00 : vin d'honneur / cocktail",
          "19h00 : entrée en salle, dîner",
          "21h30 : ouverture de bal, soirée dansante",
          "00h30 : fin théorique (prévoir rallonge DJ si besoin)",
        ],
      },
      {
        type: "list",
        title: "Chaque ligne doit dire",
        items: [
          "Heure de début (et fin si critique : cérémonie, discours)",
          "Lieu ou zone (salon de préparation, jardin, salle)",
          "Personnes impliquées (photographe, témoin A, DJ)",
          "Buffer de 15 min entre deux gros blocs quand c'est possible",
        ],
      },
      fianceHelpFr([
        "Construisez le programme dans Fiancé ou via l'[outil timeline](/tools/timeline) en ligne. Export PDF pour les prestataires. Le mode jour J (voir article dédié) affiche la timeline sur votre téléphone, même hors ligne.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "On the day, nobody wants a 12-page Google Doc. You need a short timeline: time, place, who is involved, useful contact.",
          "We recommend locking it at 7 days out and sending it to witnesses, DJ, photographer, and venue. Our [timeline tool](/tools/timeline) builds an exportable PDF base.",
        ],
      },
      {
        type: "list",
        title: "Typical time blocks (3:30 p.m. ceremony)",
        items: [
          "8:00-10:30 a.m.: getting ready (hair, makeup, outfits)",
          "10:30-11:30 a.m.: couple and family photos if morning light works",
          "11:30 a.m.-2:00 p.m.: slack, travel, light lunch",
          "2:00-3:00 p.m.: guest arrival, welcome",
          "3:30 p.m.: ceremony (45 min to 1 hr depending on format)",
          "4:30-6:00 p.m.: cocktail hour",
          "7:00 p.m.: room entry, dinner",
          "9:30 p.m.: first dance, party",
          "12:30 a.m.: nominal end (plan DJ extension if needed)",
        ],
      },
      {
        type: "list",
        title: "Each line should state",
        items: [
          "Start time (and end if critical: ceremony, speeches)",
          "Location or zone (prep room, garden, hall)",
          "People involved (photographer, witness A, DJ)",
          "15-minute buffer between big blocks when possible",
        ],
      },
      fianceHelpEn([
        "Build the schedule in Fiancé or with the online [timeline tool](/tools/timeline). PDF export for vendors. Wedding Day mode (see dedicated article) shows the timeline on your phone, even offline.",
      ]),
    ],
  }),

  postPair({
    slug: "repartir-roles-jour-j-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Répartir les rôles le jour J",
    titleEn: "Split day-of roles between witnesses and helpers",
    excerptFr:
      "Vous ne pouvez pas accueillir, régler le nœud papillon et répondre au traiteur en même temps. Qui fait quoi, et avec quel brief ?",
    excerptEn:
      "You cannot greet guests, fix a bow tie, and talk to the caterer at once. Who does what, and with what brief?",
    readingMinutes: 6,
    heroAltFr: "Répartition des rôles jour J mariage",
    heroAltEn: "Wedding day role assignments",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les mariés doivent être des invités VIP, pas des chefs de projet le jour J. La répartition des rôles se prépare à J-14, pas le matin dans le miroir.",
          "Deux témoins bien briefés valent mieux qu'un wedding planner externe non prévenu de vos cousins difficiles.",
        ],
      },
      {
        type: "list",
        title: "Rôles classiques",
        items: [
          "Témoin A : contact principal prestataires (DJ, traiteur, lieu)",
          "Témoin B : accueil invités, questions logistiques (parking, cadeaux)",
          "Coordinateur timing : annonce les transitions (entrée salle, discours)",
          "Personne « kit urgence » : épingles, mouchoirs, chargeurs, médicaments basiques",
          "Point de contact enfants / personnes âgées si besoin",
        ],
      },
      {
        type: "list",
        title: "Brief à transmettre par écrit",
        items: [
          "Numéros utiles (traiteur, DJ, photographe, taxi)",
          "Horaires clés copiés depuis la timeline",
          "Décisions déjà prises : pas de négociation menu le jour J",
          "Qui annonce si un imprévu (retard cérémonie, pluie)",
        ],
      },
      fianceHelpFr([
        "Partagez la timeline Fiancé et le plan de table avec vos témoins via export PDF. Le [planning jour J](/tools/timeline) sert de feuille de route commune.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Couples should be VIP guests, not project managers on the day. Role splits get decided at 14 days out, not in the mirror that morning.",
          "Two well-briefed witnesses beat an external planner who never met your difficult cousins.",
        ],
      },
      {
        type: "list",
        title: "Classic roles",
        items: [
          "Witness A: main vendor contact (DJ, caterer, venue)",
          "Witness B: guest greeting, logistics questions (parking, gifts)",
          "Timing coordinator: calls transitions (room entry, speeches)",
          "Emergency kit person: pins, tissues, chargers, basic meds",
          "Kids / elderly point person if needed",
        ],
      },
      {
        type: "list",
        title: "Brief to share in writing",
        items: [
          "Key phone numbers (caterer, DJ, photographer, taxi)",
          "Critical times copied from the timeline",
          "Decisions already made: no menu negotiation on the day",
          "Who announces surprises (late ceremony, rain)",
        ],
      },
      fianceHelpEn([
        "Share the Fiancé timeline and seating chart with witnesses via PDF export. The [day-of timeline](/tools/timeline) is the shared run sheet.",
      ]),
    ],
  }),

  postPair({
    slug: "mode-jour-j-suivre-deroule",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Mode jour J : suivre le déroulé dans Fiancé",
    titleEn: "Wedding Day mode: follow the run sheet in Fiancé",
    excerptFr:
      "Le jour J, Fiancé bascule en mode lecture simple : timeline, contacts prestataires, plan de table. Sans publicité, sans sync obligatoire.",
    excerptEn:
      "On the day, Fiancé switches to a simple read-only view: timeline, vendor contacts, seating chart. No ads, no mandatory sync.",
    readingMinutes: 6,
    heroAltFr: "Mode jour J Fiancé wedding app",
    heroAltEn: "Fiancé Wedding Day mode",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Nous avons ajouté le mode jour J parce que les couples ouvraient l'app le matin du mariage… et se perdaient dans l'onglet budget ou la liste cadeaux.",
          "Ce mode affiche ce qui compte à l'instant T : prochaine étape horaire, numéros utiles, plan de table, météo locale si disponible. Pas d'édition lourde : vous regardez, vous respirez.",
        ],
      },
      {
        type: "list",
        title: "Ce que le mode jour J montre",
        items: [
          "Timeline avec l'étape en cours mise en avant",
          "Contacts prestataires réservés (un tap pour appeler)",
          "Plan de table en lecture seule",
          "Checklist « jour J » cochée par les témoins si besoin",
        ],
      },
      {
        type: "list",
        title: "Comment l'activer",
        items: [
          "Préparez timeline et prestataires avant J-7",
          "Le mode se propose automatiquement la veille ou le jour J",
          "Fonctionne hors ligne : pas besoin de réseau en campagne",
          "Sync partenaire optionnelle : les deux téléphones voient la même timeline",
        ],
      },
      fianceHelpFr([
        "Activez le mode jour J depuis l'accueil Fiancé. Complétez d'abord votre [timeline](/tools/timeline) et vos prestataires « réservés » pour un écran utile dès le matin.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "We added Wedding Day mode because couples opened the app on the morning of the wedding… and got lost in the budget tab or gift list.",
          "This mode shows what matters right now: next timed step, key numbers, seating chart, local weather when available. No heavy editing: you look, you breathe.",
        ],
      },
      {
        type: "list",
        title: "What Wedding Day mode shows",
        items: [
          "Timeline with the current step highlighted",
          "Booked vendor contacts (one tap to call)",
          "Read-only seating chart",
          "Day-of checklist witnesses can tick if needed",
        ],
      },
      {
        type: "list",
        title: "How to turn it on",
        items: [
          "Prepare timeline and vendors before 7 days out",
          "Mode prompts automatically the day before or on the day",
          "Works offline: no signal needed at a rural venue",
          "Optional partner sync: both phones see the same timeline",
        ],
      },
      fianceHelpEn([
        "Turn on Wedding Day mode from the Fiancé home screen. Fill in your [timeline](/tools/timeline) and \"booked\" vendors first so the screen is useful from the morning.",
      ]),
    ],
  }),

  postPair({
    slug: "programme-mariage-partager-invites",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Programme du mariage à partager avec les invités",
    titleEn: "Share your wedding schedule with guests",
    excerptFr:
      "Cérémonie, cocktail, dîner : quels moments rendre publics sur votre page mariage, et lesquels garder privés ?",
    excerptEn:
      "Ceremony, cocktail, dinner: which moments to publish on your wedding page, and which to keep private?",
    readingMinutes: 6,
    heroAltFr: "Programme mariage partagé aux invités",
    heroAltEn: "Wedding schedule shared with guests",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les invités posent les mêmes questions : « À quelle heure arrive-t-on ? », « Y a-t-il un vin d'honneur ? », « Dress code ? ». Un programme public sur votre page mariage réduit les messages le samedi à 8h.",
          "Ne publiez pas la [timeline minute par minute](/tools/timeline) réservée aux prestataires. Distillez trois à cinq moments lisibles pour vos proches.",
        ],
      },
      {
        type: "list",
        title: "Moments à rendre publics",
        items: [
          "Heure et adresse de la cérémonie (civil, laïque ou religieuse)",
          "Accueil / cocktail si distinct de la cérémonie",
          "Heure d'entrée en salle ou début du repas",
          "Dress code et consignes pratiques (parking, enfants bienvenus ou non)",
          "Lien hébergement si invités de loin",
        ],
      },
      {
        type: "list",
        title: "À garder privé",
        items: [
          "Horaires de préparation couple",
          "Contacts prestataires et consignes témoins",
          "Plan B pluie détaillé (sauf si le lieu demande de prévenir les invités)",
        ],
      },
      fianceHelpFr([
        "La page mariage Fiancé permet de publier programme, lieu, FAQ et RSVP. Vous choisissez ce qui est visible sans exposer vos notes internes ni la [timeline prestataires](/tools/timeline).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Guests ask the same questions: \"What time do we arrive?\", \"Is there a cocktail hour?\", \"Dress code?\" A public schedule on your wedding page cuts down 8 a.m. texts on Saturday.",
          "Do not publish the minute-by-minute [day-of timeline](/tools/timeline) meant for vendors. Distill three to five readable moments for friends and family.",
        ],
      },
      {
        type: "list",
        title: "Moments to make public",
        items: [
          "Ceremony time and address (civil, secular, or religious)",
          "Welcome / cocktail if separate from ceremony",
          "Room entry or dinner start time",
          "Dress code and practical notes (parking, kids welcome or not)",
          "Lodging link for out-of-town guests",
        ],
      },
      {
        type: "list",
        title: "Keep private",
        items: [
          "Couple getting-ready times",
          "Vendor contacts and witness instructions",
          "Detailed rain plan B (unless the venue asks you to warn guests)",
        ],
      },
      fianceHelpEn([
        "The Fiancé wedding page lets you publish schedule, venue, FAQ, and RSVP. You choose what is visible without exposing internal notes or the vendor [day-of timeline](/tools/timeline).",
      ]),
    ],
  }),

  postPair({
    slug: "imprevus-jour-j-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Les 10 imprévus classiques le jour J",
    titleEn: "Top 10 day-of wedding surprises and how to prep",
    excerptFr:
      "Retard, pluie, bouton arraché, invité sans RSVP : dix scénarios fréquents et la réponse simple à préparer à l'avance.",
    excerptEn:
      "Delays, rain, missing button, guest without RSVP: ten common scenarios and a simple response to prep ahead.",
    readingMinutes: 7,
    heroAltFr: "Imprévus jour J mariage",
    heroAltEn: "Day-of wedding surprises",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Aucun mariage n'est parfait. L'objectif n'est pas zéro imprévu : c'est que chaque imprévu ait un propriétaire et une réponse prévue, pour que vous restiez ensemble et pas au téléphone.",
        ],
      },
      {
        type: "list",
        title: "Dix imprévus fréquents",
        items: [
          "1. Retard cérémonie (15-30 min) : témoin annonce, DJ retarde playlist",
          "2. Pluie sur cérémonie extérieure : plan B salle ou parapluies stockés",
          "3. Invité sans RSVP qui se présente : deux couverts de secours confirmés avec traiteur",
          "4. Problème tenue (bouton, déchirure) : kit couture chez témoin",
          "5. Photographe bloqué dans les bouchons : buffer 20 min dans timeline",
          "6. Discours trop long : signal convenu avec DJ pour enchaîner",
          "7. Enfant en crise pendant cérémonie : place réservée près sortie",
          "8. Panne micro : DJ a un second micro ou megaphone de secours",
          "9. Malaise invité : numéro secours affiché, témoin désigné",
          "10. Coupure courant : lieu a générateur ou bougies plan B (sécurité d'abord)",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Astuce : choisissez un témoin « porte-voix imprévus ». Vous ne décidez pas de tout le jour J. Ce rôle filtre les urgences réelles du bruit.",
        ],
      },
      fianceHelpFr([
        "Notez vos plans B dans les notes Fiancé (timeline, prestataires). Exportez les contacts en PDF pour les témoins. Le mode jour J et l'[outil timeline](/tools/timeline) gardent le déroulé à portée de main, [hors ligne](/blog/app-mariage-privee-hors-ligne) si besoin.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "No wedding is perfect. The goal is not zero surprises: it is that each surprise has an owner and a planned response, so you stay together instead of on the phone.",
        ],
      },
      {
        type: "list",
        title: "Ten common surprises",
        items: [
          "1. Late ceremony (15-30 min): witness announces, DJ delays playlist",
          "2. Rain on outdoor ceremony: indoor plan B or stored umbrellas",
          "3. Guest shows up without RSVP: two spare covers confirmed with caterer",
          "4. Outfit issue (button, tear): sewing kit with witness",
          "5. Photographer stuck in traffic: 20-minute buffer in timeline",
          "6. Speech runs long: agreed signal with DJ to move on",
          "7. Child meltdown during ceremony: seat reserved near exit",
          "8. Mic failure: DJ has backup mic or megaphone",
          "9. Guest feels unwell: emergency number posted, witness assigned",
          "10. Power outage: venue generator or candle plan B (safety first)",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Tip: pick one witness as \"surprise filter\". You do not decide everything on the day. That role separates real urgency from noise.",
        ],
      },
      fianceHelpEn([
        "Log plan B notes in Fiancé (timeline, vendors). Export contacts as PDF for witnesses. Wedding Day mode and the [timeline tool](/tools/timeline) keep the run sheet handy, [offline](/blog/app-mariage-privee-hors-ligne) if needed.",
      ]),
    ],
  }),

  postPair({
    slug: "creer-page-web-mariage",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Créer votre page web de mariage",
    titleEn: "Create your wedding website",
    excerptFr:
      "Une page publique claire vaut dix allers-retours SMS. Voici quoi y mettre et comment la paramétrer dans Fiancé.",
    excerptEn:
      "One clear public page beats ten SMS threads. What to include and how to set it up in Fiancé.",
    readingMinutes: 6,
    heroAltFr: "Créer une page web mariage Fiancé",
    heroAltEn: "Create a Fiancé wedding website",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La page web de mariage n'a pas besoin d'être un site de 20 pages. Une URL unique avec date, lieux, programme, RSVP et FAQ couvre 90 % des besoins invités.",
          "Chez Drakkar Software, nous l'avons intégrée à Fiancé pour éviter un outil de plus avec mot de passe oublié trois semaines avant le jour J.",
        ],
      },
      {
        type: "list",
        title: "Blocs essentiels",
        items: [
          "Prénoms, date, message de bienvenue court",
          "Lieux avec liens cartes (cérémonie, réception)",
          "Programme simplifié (voir article programme invités)",
          "RSVP en ligne synchronisé avec votre liste",
          "FAQ : dress code, cadeaux, hébergement, enfants",
          "Photo de couverture (pas besoin de shooting pro)",
        ],
      },
      {
        type: "list",
        title: "Paramètres à vérifier",
        items: [
          "URL personnalisée ou lien court facile à dicter",
          "Visibilité : public vs lien privé non indexé",
          "Langue si invités internationaux",
          "Date limite RSVP affichée",
        ],
      },
      fianceHelpFr([
        "Activez la page mariage dans Paramètres > Page publique. Le contenu tire date, lieux et RSVP depuis votre mariage Fiancé. Mise à jour instantanée quand vous modifiez un horaire.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A wedding website does not need twenty pages. One URL with date, venues, schedule, RSVP, and FAQ covers 90% of guest needs.",
          "At Drakkar Software we built it into Fiancé to avoid another tool with a password forgotten three weeks before the day.",
        ],
      },
      {
        type: "list",
        title: "Essential blocks",
        items: [
          "First names, date, short welcome message",
          "Venues with map links (ceremony, reception)",
          "Simplified schedule (see guest schedule article)",
          "Online RSVP synced with your list",
          "FAQ: dress code, gifts, lodging, children",
          "Cover photo (no pro shoot required)",
        ],
      },
      {
        type: "list",
        title: "Settings to check",
        items: [
          "Custom URL or short link easy to say aloud",
          "Visibility: public vs private unlisted link",
          "Language if you have international guests",
          "Displayed RSVP deadline",
        ],
      },
      fianceHelpEn([
        "Enable the wedding page under Settings > Public page. Content pulls date, venues, and RSVP from your Fiancé wedding. Updates instantly when you change a time.",
      ]),
    ],
  }),

  postPair({
    slug: "faq-mariage-invites-15-questions",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "FAQ mariage : 15 questions que vos invités posent",
    titleEn: "Wedding FAQ: 15 questions guests actually ask",
    excerptFr:
      "Dress code, +1, cadeaux, parking, allergies : répondez une fois sur la page mariage au lieu de cent messages privés.",
    excerptEn:
      "Dress code, plus-ones, gifts, parking, allergies: answer once on the wedding page instead of a hundred DMs.",
    readingMinutes: 6,
    heroAltFr: "FAQ mariage pour invités",
    heroAltEn: "Wedding FAQ for guests",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Une FAQ mariage bien rédigée vous rend dix heures de messages. Copiez-collez les questions réelles que vos proches ont déjà posées, pas un template générique trouvé sur Pinterest.",
        ],
      },
      {
        type: "list",
        title: "15 questions types à couvrir",
        items: [
          "1. À quelle heure dois-je arriver ?",
          "2. Où se parker / y a-t-il un navette ?",
          "3. Dress code précis (exemples bienvenus)",
          "4. Les enfants sont-ils invités ?",
          "5. Puis-je venir avec un +1 ?",
          "6. Comment répondre au RSVP et avant quelle date ?",
          "7. Y a-t-il un hébergement recommandé ?",
          "8. Liste de cadeaux ou préférence (cagnotte, urne) ?",
          "9. Puis-je prendre des photos pendant la cérémonie ?",
          "10. Y a-t-il un vin d'honneur / cocktail ?",
          "11. Menu végétarien ou allergies : comment signaler ?",
          "12. Accès PMR au lieu ?",
          "13. Contact le jour J si je suis perdu ?",
          "14. Peut-on envoyer les félicitations par carte après ?",
          "15. Y a-t-il un brunch le lendemain ?",
        ],
      },
      fianceHelpFr([
        "Ajoutez une section FAQ sur votre page mariage Fiancé. Mettez à jour quand une question revient trois fois : c'est le signal qu'elle mérite une réponse publique.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A solid wedding FAQ saves ten hours of messages. Copy the real questions friends already asked, not a generic template from Pinterest.",
        ],
      },
      {
        type: "list",
        title: "15 typical questions to cover",
        items: [
          "1. What time should I arrive?",
          "2. Where do I park / is there a shuttle?",
          "3. Exact dress code (examples welcome)",
          "4. Are children invited?",
          "5. Can I bring a plus-one?",
          "6. How do I RSVP and by when?",
          "7. Is there recommended lodging?",
          "8. Registry or preference (fund, cash envelope)?",
          "9. Can I take photos during the ceremony?",
          "10. Is there a cocktail hour?",
          "11. Vegetarian menu or allergies: how to flag?",
          "12. Wheelchair access at the venue?",
          "13. Day-of contact if I am lost?",
          "14. Can we send cards after the wedding?",
          "15. Is there a next-day brunch?",
        ],
      },
      fianceHelpEn([
        "Add an FAQ section on your Fiancé wedding page. Update when a question comes up three times: that means it deserves a public answer.",
      ]),
    ],
  }),

  postPair({
    slug: "liste-cadeaux-mariage-guide",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Liste de cadeaux mariage : guide pratique",
    titleEn: "Wedding gift registry: practical guide",
    excerptFr:
      "Cagnotte, liste en ligne ou urne le jour J : comment organiser les cadeaux sans malaise, avec réservation par invité.",
    excerptEn:
      "Fund, online list, or envelope on the day: how to organize gifts without awkwardness, with guest claiming.",
    readingMinutes: 6,
    heroAltFr: "Liste de cadeaux mariage",
    heroAltEn: "Wedding gift registry guide",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En France, la liste de cadeaux reste sensible. L'objectif n'est pas d'imposer, c'est d'offrir une option claire aux invités qui demandent « qu'est-ce qui vous ferait plaisir ? ».",
          "Fiancé propose une liste où chaque invité peut réserver un cadeau ou une contribution, pour éviter trois mixeurs identiques.",
        ],
      },
      {
        type: "list",
        title: "Trois formats courants",
        items: [
          "Liste d'objets avec réservation (vaisselle, voyage, équipement maison)",
          "Cagnotte voyage de noces ou projet commun",
          "Urne le jour J (à mentionner discrètement en FAQ, pas en gros titre)",
        ],
      },
      {
        type: "list",
        title: "Bonnes pratiques",
        items: [
          "Proposer des gammes de prix (30 € à 300 €)",
          "Laisser une option « participation libre »",
          "Ne pas afficher le montant déjà collecté publiquement",
          "Remercier sous deux mois avec note personnelle",
        ],
      },
      fianceHelpFr([
        "Créez votre liste cadeaux dans Fiancé : ajoutez des idées, lien externe ou montant cagnotte. Les invités réservent depuis la page mariage sans voir qui a pris quoi côté montants privés.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In France gift lists stay delicate. The goal is not to impose, it is to give a clear option to guests who ask \"what would you like?\".",
          "Fiancé offers a list where each guest can claim a gift or contribution, so you do not get three identical blenders.",
        ],
      },
      {
        type: "list",
        title: "Three common formats",
        items: [
          "Item list with claiming (tableware, trip, home gear)",
          "Honeymoon or joint project fund",
          "Envelope on the day (mention quietly in FAQ, not as a headline)",
        ],
      },
      {
        type: "list",
        title: "Good practices",
        items: [
          "Offer price ranges (30 to 300 EUR)",
          "Include a \"free contribution\" option",
          "Do not display collected amount publicly",
          "Thank within two months with a personal note",
        ],
      },
      fianceHelpEn([
        "Build your gift list in Fiancé: add ideas, external links, or fund amounts. Guests claim from the wedding page without public amount details.",
      ]),
    ],
  }),

  postPair({
    slug: "partage-photos-mariage-qr-code",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Partage de photos mariage par QR code",
    titleEn: "Wedding photo sharing with a QR code",
    excerptFr:
      "Un album commun sans compte invité : scan QR, upload, c'est tout. Pas de Facebook, pas de numéro de téléphone échangé.",
    excerptEn:
      "A shared album with no guest account: scan QR, upload, done. No Facebook, no phone numbers traded.",
    readingMinutes: 6,
    heroAltFr: "Partage photos mariage QR code Fiancé",
    heroAltEn: "Wedding photo sharing QR code Fiancé",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les invités prennent des centaines de photos que le photographe ne verra jamais. Le problème classique : créer un groupe WhatsApp où personne n'a le numéro de tout le monde, ou demander un compte Instagram.",
          "Nous avons choisi le QR code : affiché à l'entrée ou sur les tables, il ouvre un album privé. L'invité dépose sa photo sans installer Fiancé ni créer de compte.",
        ],
      },
      {
        type: "list",
        title: "Comment l'organiser",
        items: [
          "Imprimez le QR en A5 ou A4 à l'accueil et près du photobooth",
          "Ajoutez une phrase : « Partagez vos photos ici, sans appli »",
          "Désignez un témoin qui vérifie que le lien fonctionne le matin",
          "Combinez avec le photographe pro : deux sources complémentaires",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Astuce : affichez le QR aussi sur la page mariage en ligne pour les invités qui oublient le jour J.",
        ],
      },
      fianceHelpFr([
        "Activez le [partage photos Fiancé](/feature/photos) : album privé, QR généré automatiquement, hébergement sur votre sync si configuré. Zéro compte invité, zéro publicité.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Guests shoot hundreds of photos your pro will never see. The usual problem: a WhatsApp group where nobody has everyone's number, or asking for an Instagram account.",
          "We picked a QR code: displayed at the entrance or on tables, it opens a private album. Guests upload without installing Fiancé or creating an account.",
        ],
      },
      {
        type: "list",
        title: "How to organize it",
        items: [
          "Print the QR at A5 or A4 at welcome and near the photobooth",
          "Add one line: \"Share your photos here, no app required\"",
          "Assign a witness to check the link works that morning",
          "Combine with the pro photographer: two complementary sources",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Tip: also show the QR on the online wedding page for guests who forget on the day.",
        ],
      },
      fianceHelpEn([
        "Enable Fiancé [photo sharing](/feature/photos): private album, auto-generated QR, hosting on your sync if configured. Zero guest accounts, zero ads.",
      ]),
    ],
  }),

  postPair({
    slug: "hebergement-invites-mariage",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Hébergement invités mariage : module et bonnes pratiques",
    titleEn: "Guest lodging for your wedding: module and tips",
    excerptFr:
      "Hôtels, gîtes, chambres d'hôtes : centralisez les options, les tarifs négociés et qui loge où.",
    excerptEn:
      "Hotels, rentals, B&Bs: centralize options, negotiated rates, and who stays where.",
    readingMinutes: 6,
    heroAltFr: "Hébergement invités mariage",
    heroAltEn: "Wedding guest accommodations",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Dès que la moitié de votre liste vient de loin, l'hébergement devient un sujet à part entière. Sans liste claire, chaque invité vous écrit « vous connaissez un hôtel pas cher ? ».",
          "Un module hébergement dans votre app mariage évite le tableur partagé que personne ne met à jour.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'il faut lister par hébergement",
        items: [
          "Nom, adresse, lien réservation",
          "Distance au lieu (km ou minutes voiture)",
          "Tarif indicatif ou code promo négocié",
          "Capacité restante si bloc de chambres réservé",
          "Contact pour questions (réception hôtel ou propriétaire gîte)",
        ],
      },
      {
        type: "list",
        title: "Bonnes pratiques",
        items: [
          "Proposer trois gammes : budget, standard, confort",
          "Publier sur la page mariage et FAQ",
          "Relancer J-6 semaines : « Pensez à réserver »",
          "Noter qui loge où pour le brunch du lendemain",
        ],
      },
      fianceHelpFr([
        "Le module Hébergements Fiancé lie options et invités. Affichez les fiches sur la page publique. Assignez un hébergement par invité pour le plan de navette si besoin.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Once half your list travels from afar, lodging becomes its own workstream. Without a clear list, every guest asks \"know a cheap hotel?\".",
          "A lodging module in your wedding app beats a shared spreadsheet nobody updates.",
        ],
      },
      {
        type: "list",
        title: "What to list per property",
        items: [
          "Name, address, booking link",
          "Distance to venue (km or drive minutes)",
          "Indicative rate or negotiated promo code",
          "Remaining capacity if you blocked rooms",
          "Contact for questions (hotel desk or rental owner)",
        ],
      },
      {
        type: "list",
        title: "Good practices",
        items: [
          "Offer three tiers: budget, standard, comfort",
          "Publish on wedding page and FAQ",
          "Remind at 6 weeks out: \"Book your room\"",
          "Track who stays where for next-day brunch",
        ],
      },
      fianceHelpEn([
        "Fiancé Accommodations links properties and guests. Show cards on the public page. Assign lodging per guest for shuttle planning if needed.",
      ]),
    ],
  }),

  postPair({
    slug: "mood-board-mariage-organiser",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Inspiration",
    titleFr: "Mood board mariage : organiser vos idées dans Fiancé",
    titleEn: "Wedding mood board: organize ideas in Fiancé",
    excerptFr:
      "Collections par thème, photos, couleurs : gardez l'inspiration sans noyer le budget ni le planning.",
    excerptEn:
      "Collections by theme, photos, colors: keep inspiration without drowning budget or timeline.",
    readingMinutes: 6,
    heroAltFr: "Mood board mariage Fiancé",
    heroAltEn: "Fiancé wedding mood board",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le mood board mariage sert à aligner vous deux et les prestataires visuels (fleuriste, décorateur, photographe). Ce n'est pas un concours Pinterest : c'est une shortlist de références partagées.",
          "Sans collections, vous retombez sur 200 captures d'écran dans la galerie du téléphone, dont la moitié ne correspond plus au lieu réservé.",
        ],
      },
      {
        type: "list",
        title: "Collections utiles",
        items: [
          "Couleurs et textures (lin, bois, cire)",
          "Centres de table et arche cérémonie",
          "Tenues et accessoires",
          "Papeterie (faire-part, menu, plan de table)",
          "Ambiance soirée (lumières, piste)",
        ],
      },
      {
        type: "list",
        title: "Rituels qui marchent",
        items: [
          "Revue mensuelle à deux : garder / écarter",
          "Une idée favorite par collection pour le prestataire",
          "Lier une idée à un devis fleuriste pour chiffrer",
          "Ne pas ajouter après signature d'un decor « clé en main »",
        ],
      },
      fianceHelpFr([
        "L'onglet Idées de Fiancé organise photos et notes en collections. Marquez une idée en favori, associez-la à un prestataire. Tout reste local sur votre téléphone.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A wedding mood board aligns the two of you and visual vendors (florist, decorator, photographer). It is not a Pinterest contest: it is a shared reference shortlist.",
          "Without collections you end up with 200 screenshots in your camera roll, half of which no longer match your booked venue.",
        ],
      },
      {
        type: "list",
        title: "Useful collections",
        items: [
          "Colors and textures (linen, wood, wax)",
          "Centerpieces and ceremony arch",
          "Outfits and accessories",
          "Stationery (invites, menus, seating cards)",
          "Evening vibe (lighting, dance floor)",
        ],
      },
      {
        type: "list",
        title: "Rituals that work",
        items: [
          "Monthly review together: keep / drop",
          "One favorite per collection for the vendor",
          "Link an idea to a florist quote for pricing",
          "Stop adding after signing a turnkey decor package",
        ],
      },
      fianceHelpEn([
        "Fiancé Ideas tab organizes photos and notes into collections. Star a favorite, link to a vendor. Everything stays local on your phone.",
      ]),
    ],
  }),

  postPair({
    slug: "definir-theme-mariage-5-etapes",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Inspiration",
    titleFr: "Définir le thème de votre mariage en 5 étapes",
    titleEn: "Define your wedding theme in 5 steps",
    excerptFr:
      "Couleurs, style, mood board : cinq étapes pour passer de « j'aime tout » à une direction claire pour vos prestataires.",
    excerptEn:
      "Colors, style, mood board: five steps from \"I like everything\" to a clear direction for vendors.",
    readingMinutes: 6,
    heroAltFr: "Définir thème mariage en 5 étapes",
    heroAltEn: "Define wedding theme in five steps",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "« Thème bohème chic » ne suffit pas au fleuriste. Il lui faut trois couleurs, deux textures, une interdiction (pas de roses rouges ?), et une photo de référence.",
          "Ces cinq étapes transforment vos goûts flous en brief utilisable.",
        ],
      },
      {
        type: "list",
        title: "Les 5 étapes",
        items: [
          "1. Choisir trois couleurs max (principale, accent, neutre)",
          "2. Nommer un style en une phrase (ex. « garden party automnale »)",
          "3. Remplir un mood board de 8 à 12 images cohérentes",
          "4. Lister ce que vous refusez (évite les dérives)",
          "5. Valider avec le lieu : votre decor rentre-t-il dans l'espace ?",
        ],
      },
      {
        type: "quote",
        quote:
          "Un thème clair fait gagner des heures de messages avec chaque prestataire visuel.",
      },
      fianceHelpFr([
        "Utilisez les collections Idées Fiancé pour les étapes 3 et 4. Exportez ou montrez l'écran au fleuriste sur place. Liez le thème au [plan de table](/tools/seating-chart) (papeterie, marque-places).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "\"Boho chic theme\" is not enough for your florist. They need three colors, two textures, one ban (no red roses?), and a reference photo.",
          "These five steps turn vague taste into a usable brief.",
        ],
      },
      {
        type: "list",
        title: "The 5 steps",
        items: [
          "1. Pick three colors max (main, accent, neutral)",
          "2. Name the style in one sentence (e.g. \"autumn garden party\")",
          "3. Fill a mood board with 8 to 12 consistent images",
          "4. List what you refuse (prevents drift)",
          "5. Validate with the venue: does your decor fit the space?",
        ],
      },
      {
        type: "quote",
        quote:
          "A clear theme saves hours of back-and-forth with every visual vendor.",
      },
      fianceHelpEn([
        "Use Fiancé Ideas collections for steps 3 and 4. Show the screen to your florist on site. Tie the theme to the [seating chart](/tools/seating-chart) (stationery, place cards).",
      ]),
    ],
  }),

  postPair({
    slug: "organiser-mariage-a-deux-sync",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Organiser son mariage à deux : sync partenaire",
    titleEn: "Plan your wedding as a couple: partner sync",
    excerptFr:
      "Deux téléphones, une source de vérité : sync optionnelle, chiffrée, sans imposer un compte cloud public.",
    excerptEn:
      "Two phones, one source of truth: optional encrypted sync, no forced public cloud account.",
    readingMinutes: 6,
    heroAltFr: "Organiser mariage à deux sync Fiancé",
    heroAltEn: "Plan wedding as a couple Fiancé sync",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Organiser à deux, c'est souvent « qui a la dernière version du tableur ? ». Messages croisés, doublons de tâches, RSVP mis à jour par l'un et pas l'autre.",
          "Fiancé part du principe que chaque partenaire a son téléphone. La sync est optionnelle : vous pouvez aussi vous passer le device le dimanche soir si vous préférez.",
        ],
      },
      {
        type: "list",
        title: "Répartition type (à adapter)",
        items: [
          "Partenaire A : prestataires, budget, timeline",
          "Partenaire B : invités, RSVP, communications",
          "Décisions communes : plan de table, menu, thème",
          "Point hebdo 30 min : checklist + prochaines échéances",
        ],
      },
      {
        type: "list",
        title: "Sync Fiancé : ce qu'elle fait",
        items: [
          "Copie chiffrée AES-256-GCM via Starfish (sync.drakkar.software)",
          "Pas de lecture plaintext côté serveur",
          "Activation explicite : rien ne part sans votre accord",
          "Fonctionne aussi sans sync (données locales uniquement)",
        ],
      },
      fianceHelpFr([
        "Invitez votre partenaire depuis Paramètres > Sync. Chaque modification invité ou prestataire se propage. Alignez-vous d'abord sur le [simulateur budget](/tools/budget-calculator), le [plan de table](/tools/seating-chart) et la [timeline jour J](/tools/timeline) en ligne si vous démarrez sans l'app.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Planning as a couple often means \"who has the latest spreadsheet?\" Crossed messages, duplicate tasks, RSVPs updated by one partner only.",
          "Fiancé assumes each partner has a phone. Sync is optional: you can also pass one device on Sunday night if you prefer.",
        ],
      },
      {
        type: "list",
        title: "Typical split (adapt yours)",
        items: [
          "Partner A: vendors, budget, timeline",
          "Partner B: guests, RSVPs, communications",
          "Shared decisions: seating, menu, theme",
          "Weekly 30-minute check-in: checklist + next deadlines",
        ],
      },
      {
        type: "list",
        title: "Fiancé sync: what it does",
        items: [
          "AES-256-GCM encrypted copy via Starfish (sync.drakkar.software)",
          "No plaintext reads on the server",
          "Explicit opt-in: nothing leaves without your consent",
          "Works without sync too (local data only)",
        ],
      },
      fianceHelpEn([
        "Invite your partner from Settings > Sync. Each guest or vendor edit propagates. Align first on the online [budget calculator](/tools/budget-calculator), [seating chart](/tools/seating-chart), and [day-of timeline](/tools/timeline) if you are starting without the app.",
      ]),
    ],
  }),

  postPair({
    slug: "app-mariage-privee-hors-ligne",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "App mariage privée et hors ligne : pourquoi Fiancé",
    titleEn: "Private offline wedding app: why Fiancé",
    excerptFr:
      "Pas de pub, pas de revente de données, pas de compte obligatoire pour les invités. Données locales, sync chiffrée optionnelle.",
    excerptEn:
      "No ads, no data resale, no mandatory guest accounts. Local data, optional encrypted sync.",
    readingMinutes: 7,
    heroAltFr: "App mariage privée hors ligne Fiancé",
    heroAltEn: "Private offline wedding app Fiancé",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Nous avons créé Fiancé parce que les apps mariage « gratuites » monétisent souvent votre liste d'invités, vos emails et vos photos. Votre mariage n'est pas une audience publicitaire.",
          "Fiancé est offline-first : budget, invités, prestataires et plan de table vivent sur votre appareil. Le réseau sert à la sync optionnelle ou à publier la page invités, pas à espionner votre usage.",
        ],
      },
      {
        type: "list",
        title: "Ce qui nous différencie des apps cloud classiques",
        items: [
          "Zéro publicité dans l'app",
          "Pas de compte obligatoire pour planifier (invités inclus pour RSVP et photos QR)",
          "Données hébergées localement par défaut",
          "Sync chiffrée client-side si vous organisez à deux",
          "Export PDF (plan de table, timeline, budget) sans vendor lock-in",
        ],
      },
      {
        type: "list",
        title: "Quand le hors ligne compte",
        items: [
          "Domaine ou salle sans réseau fiable",
          "Jour J : timeline et contacts accessibles sans 4G",
          "Couples sensibles à la vie privée (liste VIP, adresses, budgets)",
          "Organisation sur tablette en avion ou train sans Wi-Fi",
        ],
      },
      {
        type: "quote",
        quote:
          "Vos invités ne devraient pas créer un compte pour répondre à une invitation. Point.",
      },
      fianceHelpFr([
        "Téléchargez Fiancé sur iOS, Android ou web. Testez le [simulateur budget](/tools/budget-calculator), le [plan de table](/tools/seating-chart) et la [timeline jour J](/tools/timeline) sans installer. Activez la sync seulement si vous en avez besoin. Lisez notre page [partage photos](/feature/photos) pour l'album QR invités.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "We built Fiancé because \"free\" wedding apps often monetize your guest list, emails, and photos. Your wedding is not an ad audience.",
          "Fiancé is offline-first: budget, guests, vendors, and seating live on your device. Network is for optional sync or publishing the guest page, not tracking your behavior.",
        ],
      },
      {
        type: "list",
        title: "How we differ from typical cloud apps",
        items: [
          "Zero ads in the app",
          "No mandatory account to plan (guests included for RSVP and photo QR)",
          "Data stored locally by default",
          "Client-side encrypted sync if you plan as a couple",
          "PDF export (seating, timeline, budget) without vendor lock-in",
        ],
      },
      {
        type: "list",
        title: "When offline matters",
        items: [
          "Venue or estate with unreliable signal",
          "Day-of: timeline and contacts without 4G",
          "Privacy-conscious couples (VIP list, addresses, budgets)",
          "Planning on a tablet on a plane or train without Wi-Fi",
        ],
      },
      {
        type: "quote",
        quote:
          "Your guests should not create an account to answer an invitation. Full stop.",
      },
      fianceHelpEn([
        "Get Fiancé on iOS, Android, or web. Try the [budget calculator](/tools/budget-calculator), [seating chart](/tools/seating-chart), and [day-of timeline](/tools/timeline) without installing. Turn on sync only if you need it. See our [photo sharing](/feature/photos) page for the guest QR album.",
      ]),
    ],
  }),
];

export const { fr: POSTS_31_50_FR, en: POSTS_31_50_EN } = pairsToArrays(pairs);
