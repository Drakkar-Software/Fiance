import { postPair, pairsToArrays } from "./blog-posts-shared";
import type { BlogSection } from "./blog-types";

const POST_DATE = "2026-07-01";

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

const fianceBudgetFr = (paragraphs: string[]): BlogSection => ({
  type: "text",
  title: "Comment Fiancé peut vous aider",
  paragraphs,
});

const fianceBudgetEn = (paragraphs: string[]): BlogSection => ({
  type: "text",
  title: "How Fiancé can help",
  paragraphs,
});

const fianceGuestsFr = (paragraphs: string[]): BlogSection => ({
  type: "text",
  title: "Comment Fiancé peut vous aider",
  paragraphs,
});

const fianceGuestsEn = (paragraphs: string[]): BlogSection => ({
  type: "text",
  title: "How Fiancé can help",
  paragraphs,
});

const fianceSeatingFr = (paragraphs: string[]): BlogSection => ({
  type: "text",
  title: "Comment Fiancé peut vous aider",
  paragraphs,
});

const fianceSeatingEn = (paragraphs: string[]): BlogSection => ({
  type: "text",
  title: "How Fiancé can help",
  paragraphs,
});

const fianceVendorsFr = (paragraphs: string[]): BlogSection => ({
  type: "text",
  title: "Comment Fiancé peut vous aider",
  paragraphs,
});

const fianceVendorsEn = (paragraphs: string[]): BlogSection => ({
  type: "text",
  title: "How Fiancé can help",
  paragraphs,
});

const fianceIdeasFr = (paragraphs: string[]): BlogSection => ({
  type: "text",
  title: "Comment Fiancé peut vous aider",
  paragraphs,
});

const fianceIdeasEn = (paragraphs: string[]): BlogSection => ({
  type: "text",
  title: "How Fiancé can help",
  paragraphs,
});

const pairs = [
  // ─── Planning (3) ────────────────────────────────────────────────────────

  postPair({
    date: POST_DATE,
    slug: "dossier-mairie-bans-mariage-delais",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Dossier mairie, bans et délais : le guide administratif",
    titleEn: "Town hall file, banns, and deadlines: the admin guide",
    excerptFr:
      "Pièces à fournir, délai de 10 jours pour les bans, publication des actes : ce que la mairie attend avant de fixer la date civile.",
    excerptEn:
      "Documents required, 10-day banns period, record publication: what the town hall expects before your civil ceremony date.",
    readingMinutes: 7,
    heroAltFr: "Dossier administratif mariage à la mairie",
    heroAltEn: "Wedding administrative file at the town hall",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le mariage civil est l'étape légale. Sans dossier complet à la mairie, pas de date officielle, pas de contrat de mariage valide le jour J. En France, chaque commune applique les mêmes règles nationales, mais les horaires d'accueil et les créneaux de cérémonie varient.",
          "Chez Drakkar Software, nous voyons souvent des couples qui réservent le lieu de réception avant d'avoir vérifié la disponibilité de la salle des mariages. Inversez l'ordre : mairie d'abord, ou au moins une pré-réservation, puis le reste.",
        ],
      },
      {
        type: "list",
        title: "Pièces habituellement demandées",
        items: [
          "Acte de naissance de moins de 3 mois (ou extrait avec filiation)",
          "Justificatif de domicile ou attestation de résidence si vous ne vivez pas dans la commune",
          "Pièce d'identité et coordonnées des témoins (souvent 1 ou 2 par futur époux)",
          "Informations sur les futurs époux : profession, parents, nationalité",
          "Contrat de mariage le cas échéant (notaire avant le jour J)",
        ],
      },
      {
        type: "text",
        title: "Les bans : à quoi ça sert",
        paragraphs: [
          "Les bans sont affichés à la mairie pendant au moins 10 jours avant le mariage. Ils signalent publiquement votre intention de vous marier et laissent un délai pour d'éventuelles oppositions légales.",
          "Ce délai est incompressible. Si vous visez un samedi en juin, ne comptez pas déposer le dossier la veille. Prévoyez un rendez-vous 2 à 3 mois avant la date souhaitée, plus tôt en haute saison.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Mariage dans une autre commune que celle de résidence ? Vous pouvez demander une dispense ou une attestation selon les cas. Renseignez-vous tôt auprès des deux mairies.",
        ],
      },
      fiancePlanningFr([
        "La checklist Fiancé inclut les jalons administratifs (dossier mairie, bans, contrat de mariage) calés sur votre date. Le [rétroplanning](/blog/retroplanning-mariage-mois-par-mois) et l'outil [timeline jour J](/tools/timeline) gardent le civil et la réception alignés.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The civil ceremony is the legal step. Without a complete town hall file, no official date, no valid marriage contract on the big day. In France national rules apply everywhere, but office hours and ceremony slots vary by commune.",
          "At Drakkar Software we often see couples book the reception venue before checking town hall availability. Flip the order: town hall first, or at least a hold, then everything else.",
        ],
      },
      {
        type: "list",
        title: "Documents usually required",
        items: [
          "Birth certificate less than 3 months old (or extract with parentage)",
          "Proof of address or residence certificate if you do not live in the commune",
          "ID and witness details (often 1 or 2 per partner)",
          "Information on both partners: occupation, parents, nationality",
          "Prenuptial agreement if applicable (notary before the wedding day)",
        ],
      },
      {
        type: "text",
        title: "What banns are for",
        paragraphs: [
          "Banns are posted at the town hall for at least 10 days before the wedding. They publicly announce your intent to marry and allow time for any legal objections.",
          "This waiting period cannot be skipped. For a June Saturday, do not file the day before. Book an appointment 2 to 3 months ahead of your target date, earlier in peak season.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Marrying in a commune other than where you live? You may need a waiver or certificate depending on the case. Ask both town halls early.",
        ],
      },
      fiancePlanningEn([
        "Fiancé's checklist includes admin milestones (town hall file, banns, marriage contract) aligned to your date. The [month-by-month timeline](/blog/retroplanning-mariage-mois-par-mois) and [day-of timeline tool](/tools/timeline) keep civil and reception in sync.",
      ]),
    ],
  }),

  postPair({
    date: POST_DATE,
    slug: "ceremonie-laique-choisir-officiant",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Cérémonie laïque : choisir et préparer un officiant",
    titleEn: "Secular ceremony: choosing and preparing an officiant",
    excerptFr:
      "Un ami, un professionnel, un rituel sur mesure : comment structurer une cérémonie symbolique après le civil, sans improvisation totale.",
    excerptEn:
      "A friend, a professional, a custom ritual: how to structure a symbolic ceremony after the civil service without winging it entirely.",
    readingMinutes: 6,
    heroAltFr: "Cérémonie laïque de mariage en extérieur",
    heroAltEn: "Outdoor secular wedding ceremony",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En France, seul le mariage civil à la mairie (ou devant un maire délégué) a valeur légale. La cérémonie laïque, religieuse ou symbolique qui suit est libre : vous choisissez le lieu, les textes, qui parle, et dans quel ordre.",
          "Sans cadre, ça peut durer 20 minutes ou 1 h 30, avec des silences gênants ou des discours trop longs. Un officiant, même bénévole, structure le fil.",
        ],
      },
      {
        type: "list",
        title: "Trois profils d'officiant",
        items: [
          "Un proche (témoin, ami) : émouvant, gratuit, mais prévoir 2 à 3 répétitions et un script écrit",
          "Officiant professionnel : expérience, gestion du timing, tarif 300 à 800 € selon la région",
          "Format hybride : pro pour l'introduction et la conclusion, interventions courtes des proches",
        ],
      },
      {
        type: "list",
        title: "Structure type (45 à 60 minutes)",
        items: [
          "Entrée des mariés et accueil (5 min)",
          "Mots de l'officiant sur votre histoire (10 min)",
          "Lectures ou témoignages de 2 à 3 proches (15 min)",
          "Rituel symbolique : échange de vœux, sable, bougies, arbre (10 min)",
          "Annonce des mariés et sortie (5 min)",
        ],
      },
      {
        type: "quote",
        quote:
          "Une cérémonie laïque réussie, c'est surtout une cérémonie répétée une fois, avec un chronomètre.",
      },
      fiancePlanningFr([
        "L'onglet Planning Fiancé suit le déroulé cérémonie + vin d'honneur + dîner. Exportez la [timeline jour J](/tools/timeline) pour l'officiant, le DJ et le photographe. Voir aussi [programme à partager aux invités](/blog/programme-mariage-partager-invites).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In France only the civil ceremony at the town hall (or before a delegated mayor) is legally binding. The secular, religious, or symbolic ceremony that follows is flexible: you pick the venue, texts, speakers, and order.",
          "Without structure it can run 20 minutes or 90, with awkward silences or endless speeches. An officiant, even a volunteer one, holds the thread.",
        ],
      },
      {
        type: "list",
        title: "Three officiant profiles",
        items: [
          "A close friend (witness, friend): moving, free, but plan 2 to 3 rehearsals and a written script",
          "Professional officiant: experience, timing, roughly €300 to €800 depending on region",
          "Hybrid: pro for intro and close, short contributions from loved ones",
        ],
      },
      {
        type: "list",
        title: "Typical structure (45 to 60 minutes)",
        items: [
          "Processional and welcome (5 min)",
          "Officiant on your story (10 min)",
          "Readings or toasts from 2 to 3 guests (15 min)",
          "Symbolic ritual: vows, sand, candles, tree (10 min)",
          "Presentation of the couple and exit (5 min)",
        ],
      },
      {
        type: "quote",
        quote:
          "A great secular ceremony is mostly one that was rehearsed once, with a timer.",
      },
      fiancePlanningEn([
        "Fiancé's Planning tab tracks ceremony, cocktail, and dinner flow. Export the [day-of timeline](/tools/timeline) for your officiant, DJ, and photographer. See also [sharing the program with guests](/blog/programme-mariage-partager-invites).",
      ]),
    ],
  }),

  postPair({
    date: POST_DATE,
    slug: "choisir-temoins-role-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Choisir ses témoins et définir leur rôle",
    titleEn: "Choosing witnesses and defining their roles",
    excerptFr:
      "Témoin civil, témoin d'honneur, coordinateur jour J : qui fait quoi, combien en choisir, et comment les briefer sans tout déléguer.",
    excerptEn:
      "Civil witness, honor attendant, day-of coordinator: who does what, how many to pick, and how to brief them without delegating everything.",
    readingMinutes: 6,
    heroAltFr: "Témoins de mariage le jour J",
    heroAltEn: "Wedding witnesses on the big day",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les témoins ne sont pas qu'une case à cocher sur le dossier mairie. Ce sont souvent les personnes qui règlent le nœud papillon à 8 h, accueillent les retardataires et portent les alliances.",
          "En France, la loi exige au minimum un témoin par époux pour le mariage civil (souvent deux par personne en pratique). Au-delà du civil, vous pouvez nommer des témoins d'honneur pour la cérémonie laïque sans limite légale.",
        ],
      },
      {
        type: "list",
        title: "Rôles à clarifier par écrit",
        items: [
          "Témoin civil : présent à la mairie, identité transmise au dossier",
          "Porteur d'alliances : une personne de confiance, pas forcément le témoin civil",
          "Coordinateur jour J : un contact unique pour le traiteur et le DJ (souvent un témoin ou un proche organisé)",
          "Maître ou maîtresse de cérémonie laïque : peut être le même que le coordinateur ou non",
          "Accueil invités : 1 à 2 personnes à l'entrée du lieu avec le plan de table",
        ],
      },
      {
        type: "text",
        title: "Combien de témoins",
        paragraphs: [
          "Deux par futur époux (quatre au total) est le standard français. Plus crée des délais de décision et des frustrations (« pourquoi lui et pas moi ? »).",
          "Choisissez des personnes disponibles le jour J, capables de parler en public si besoin, et qui se connaissent assez pour coordonner sans vous solliciter toutes les dix minutes.",
        ],
      },
      fiancePlanningFr([
        "Notez les contacts témoins dans Fiancé (Planning + Invités). Partagez la [timeline](/tools/timeline) et le [plan de table](/tools/seating-chart) une semaine avant. Voir [répartir les rôles jour J](/blog/repartir-roles-jour-j-mariage).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Witnesses are not just a box on the town hall form. They often fix bow ties at 8 a.m., greet late guests, and carry the rings.",
          "In France the law requires at least one witness per spouse for the civil ceremony (two per person is common). Beyond that you can name honor attendants for the secular ceremony with no legal cap.",
        ],
      },
      {
        type: "list",
        title: "Roles to clarify in writing",
        items: [
          "Civil witness: present at the town hall, ID on file",
          "Ring bearer: someone you trust, not necessarily the civil witness",
          "Day-of coordinator: single contact for caterer and DJ (often a witness or organized friend)",
          "Secular ceremony host: may or may not be the coordinator",
          "Guest greeters: 1 to 2 people at the venue entrance with the seating chart",
        ],
      },
      {
        type: "text",
        title: "How many witnesses",
        paragraphs: [
          "Two per partner (four total) is the French norm. More creates decision drag and hurt feelings (\"why them and not me?\").",
          "Pick people available on the day, comfortable speaking in public if needed, and who know each other enough to coordinate without paging you every ten minutes.",
        ],
      },
      fiancePlanningEn([
        "Store witness contacts in Fiancé (Planning + Guests). Share the [timeline](/tools/timeline) and [seating chart](/tools/seating-chart) one week out. See [splitting day-of roles](/blog/repartir-roles-jour-j-mariage).",
      ]),
    ],
  }),

  // ─── Budget (3) ──────────────────────────────────────────────────────────

  postPair({
    date: POST_DATE,
    slug: "assurance-annulation-mariage",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Assurance annulation mariage : faut-il souscrire ?",
    titleEn: "Wedding cancellation insurance: is it worth it?",
    excerptFr:
      "Report pour maladie, intempéries, faillite prestataire : ce que couvre une assurance mariage, ce qu'elle exclut, et comment la budgétiser.",
    excerptEn:
      "Illness postponement, weather, vendor bankruptcy: what wedding insurance covers, what it excludes, and how to budget for it.",
    readingMinutes: 6,
    heroAltFr: "Assurance et budget mariage",
    heroAltEn: "Wedding insurance and budget",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Une assurance annulation ou multirisque mariage protège surtout vos acomptes déjà versés si l'événement est reporté ou annulé pour un motif couvert (maladie grave, décès, parfois intempéries extrêmes).",
          "Ce n'est pas obligatoire en France. Utile si vous avez signé des contrats avec des acomptes élevés 12 à 18 mois avant, ou si un report coûterait plus cher que la prime.",
        ],
      },
      {
        type: "list",
        title: "Ce qui est souvent couvert",
        items: [
          "Maladie ou accident empêchant les mariés ou un parent proche",
          "Décès d'un proche défini au contrat",
          "Faillite d'un prestataire essentiel (selon conditions)",
          "Dommages matériels le jour J (option responsabilité civile)",
        ],
      },
      {
        type: "list",
        title: "Ce qui est souvent exclu",
        items: [
          "Changement d'avis sans motif médical ou légal",
          "Covid ou épidémie (selon contrats, lire les clauses)",
          "Pluie « normale » si la réception est en extérieur sans plan B contractuel",
          "Retard de préparation beauté ou stress pré-mariage",
        ],
      },
      {
        type: "text",
        title: "Ordre de grandeur",
        paragraphs: [
          "Comptez 1 à 3 % du budget total pour une formule annulation, parfois plus avec responsabilité civile et dommages. Sur 20 000 €, cela fait 200 à 600 €.",
          "Souscrivez après avoir une date et des devis signés, et lisez le délai de carence (souvent 48 h à 15 jours après souscription).",
        ],
      },
      fianceBudgetFr([
        "Ajoutez une ligne « assurance » dans le budget Fiancé dès le premier acompte traiteur. Le [simulateur budget](/tools/budget-calculator) aide à voir l'impact sur le plafond global.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Cancellation or wedding package insurance mainly protects deposits already paid if the event is postponed or canceled for a covered reason (serious illness, death, sometimes extreme weather).",
          "It is not mandatory in France. Worth considering if you signed high-deposit contracts 12 to 18 months out, or if postponing would cost more than the premium.",
        ],
      },
      {
        type: "list",
        title: "Often covered",
        items: [
          "Illness or accident preventing the couple or a close relative from attending",
          "Death of a relative defined in the policy",
          "Bankruptcy of an essential vendor (per policy terms)",
          "Property damage on the day (optional liability cover)",
        ],
      },
      {
        type: "list",
        title: "Often excluded",
        items: [
          "Change of heart without medical or legal grounds",
          "Covid or epidemics (check clauses)",
          "\"Normal\" rain for outdoor receptions without a contracted plan B",
          "Beauty running late or pre-wedding stress",
        ],
      },
      {
        type: "text",
        title: "Ballpark cost",
        paragraphs: [
          "Budget 1 to 3% of total spend for cancellation cover, sometimes more with liability. On €20,000 that is €200 to €600.",
          "Buy after you have a date and signed quotes, and read the waiting period (often 48 hours to 15 days after purchase).",
        ],
      },
      fianceBudgetEn([
        "Add an \"insurance\" line in Fiancé's budget as soon as you pay the first caterer deposit. The [budget calculator](/tools/budget-calculator) shows the impact on your overall cap.",
      ]),
    ],
  }),

  postPair({
    date: POST_DATE,
    slug: "pourboires-enveloppes-mariage-jour-j",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Pourboires et enveloppes le jour J : qui, combien, comment",
    titleEn: "Tips and envelopes on the wedding day: who, how much, how",
    excerptFr:
      "DJ, serveurs, chauffeur, coiffeur : les usages en France, des fourchettes réalistes, et comment préparer les enveloppes sans stress.",
    excerptEn:
      "DJ, servers, driver, stylist: customs in France, realistic ranges, and how to prep envelopes without last-minute stress.",
    readingMinutes: 5,
    heroAltFr: "Enveloppes pourboires mariage",
    heroAltEn: "Wedding tip envelopes",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En France, le pourboire n'est pas obligatoire comme aux États-Unis, mais il reste apprécié pour l'équipe de service le jour J. Beaucoup de couples préparent des enveloppes nominatives remises par un témoin, pas par les mariés en plein dîner.",
          "Anticipez ce poste dans le budget : 200 à 600 € selon la taille de la réception et le nombre de prestataires présents sur place.",
        ],
      },
      {
        type: "list",
        title: "Fourchettes usuelles (à adapter)",
        items: [
          "DJ / groupe : 50 à 150 € selon la durée et la qualité perçue",
          "Chef de salle / maître d'hôtel traiteur : 30 à 80 €",
          "Équipe service (à partager) : 5 à 15 € par serveur, via le chef de salle",
          "Chauffeur / VTC : 10 à 20 % de la course ou forfait 20 à 50 €",
          "Coiffure / maquillage à domicile : 10 à 20 € si service au top",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Astuce : préparez les enveloppes la veille, avec un mot manuscrit. Un témoin remet tout en fin de soirée. Les photographe et fleuriste sont en général payés au contrat, pas au pourboire.",
        ],
      },
      fianceBudgetFr([
        "Créez une catégorie « pourboires » dans Fiancé pour ne pas grignoter le budget cocktails. Validez le total dans le [simulateur budget](/tools/budget-calculator).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In France tipping is not mandatory like in the US, but it is still appreciated for the service team on the day. Many couples prepare labeled envelopes handed over by a witness, not by the couple mid-dinner.",
          "Budget for it: €200 to €600 depending on reception size and how many vendors are on site.",
        ],
      },
      {
        type: "list",
        title: "Usual ranges (adjust as needed)",
        items: [
          "DJ / band: €50 to €150 depending on length and perceived quality",
          "Head waiter / caterer captain: €30 to €80",
          "Service staff (pooled): €5 to €15 per server, via the captain",
          "Driver / car service: 10 to 20% of the fare or €20 to €50 flat",
          "Hair / makeup at home: €10 to €20 if service was excellent",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Tip: prep envelopes the day before with a handwritten note. A witness hands everything over at the end of the night. Photographer and florist are usually paid by contract, not tip.",
        ],
      },
      fianceBudgetEn([
        "Create a \"tips\" category in Fiancé so you do not eat into the drinks budget. Validate the total in the [budget calculator](/tools/budget-calculator).",
      ]),
    ],
  }),

  postPair({
    date: POST_DATE,
    slug: "budget-mariage-par-region-france",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Budget mariage par région : Île-de-France vs province",
    titleEn: "Wedding budget by region: Paris area vs rest of France",
    excerptFr:
      "Lieu, traiteur, photo : pourquoi un mariage en Île-de-France coûte souvent 20 à 40 % de plus, et comment ajuster votre plafond.",
    excerptEn:
      "Venue, catering, photo: why weddings in the Paris region often cost 20 to 40% more, and how to adjust your cap.",
    readingMinutes: 6,
    heroAltFr: "Budget mariage selon la région en France",
    heroAltEn: "Wedding budget by region in France",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La moyenne nationale autour de 19 000 € (Mariages.net, 2026) masque des écarts régionaux forts. Île-de-France, Côte d'Azur et certains départements tendus tirent les postes lieu et traiteur vers le haut.",
          "Un devis « province » à 150 € par invité peut passer à 200 € ou plus en proche banlieue parisienne pour un format équivalent.",
        ],
      },
      {
        type: "list",
        title: "Postes les plus sensibles à la région",
        items: [
          "Lieu de réception : loyer de salle, château, rooftop",
          "Traiteur : main-d'œuvre et logistique",
          "Photographe / vidéaste : déplacement moindre en local, tarifs parisiens plus élevés",
          "Fleuriste et décor : fleurs hors saison + transport",
          "Hébergement invités si la majorité vient de loin",
        ],
      },
      {
        type: "list",
        title: "Leviers si vous visez la région parisienne",
        items: [
          "Mariage en semaine ou hors juin-septembre",
          "Déjeuner vs dîner (moins de boissons, durée plus courte)",
          "Moins d'invités : le coût marginal par tête est plus visible en IDF",
          "Lieu en grande couronne avec transport groupé en navette",
        ],
      },
      fianceBudgetFr([
        "Le [simulateur budget](/tools/budget-calculator) et les modèles Fiancé partent d'une répartition par poste : ajustez le traiteur et le lieu selon votre département. Voir aussi [coût par invité](/blog/budget-mariage-cout-par-invite).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The national average around €19,000 (Mariages.net, 2026) hides sharp regional gaps. Paris region, French Riviera, and other tight markets push venue and catering up.",
          "A \"provincial\" quote at €150 per guest can jump to €200 or more in greater Paris for a similar format.",
        ],
      },
      {
        type: "list",
        title: "Line items most region-sensitive",
        items: [
          "Reception venue: hall rental, chateau, rooftop",
          "Catering: labor and logistics",
          "Photographer / videographer: local travel vs Paris rates",
          "Florist and decor: out-of-season flowers plus transport",
          "Guest lodging if most travel from far away",
        ],
      },
      {
        type: "list",
        title: "Levers if you target the Paris area",
        items: [
          "Weekday or off-season (outside June-September)",
          "Lunch vs dinner (less alcohol, shorter run)",
          "Smaller guest list: marginal cost per head shows up faster in IDF",
          "Venue in outer suburbs with a group shuttle",
        ],
      },
      fianceBudgetEn([
        "The [budget calculator](/tools/budget-calculator) and Fiancé templates start from a per-category split: adjust catering and venue for your department. See also [cost per guest](/blog/budget-mariage-cout-par-invite).",
      ]),
    ],
  }),

  // ─── Guests (3) ──────────────────────────────────────────────────────────

  postPair({
    date: POST_DATE,
    slug: "faire-part-parents-divorces",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Faire-part et parents divorcés : formules et protocole",
    titleEn: "Invitations when parents are divorced: wording and protocol",
    excerptFr:
      "Qui apparaît sur le faire-part, dans quel ordre, et comment éviter les tensions quand les familles ne se parlent plus.",
    excerptEn:
      "Who appears on the invitation, in what order, and how to avoid tension when families no longer speak.",
    readingMinutes: 6,
    heroAltFr: "Faire-part mariage et familles recomposées",
    heroAltEn: "Wedding invitation and blended families",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le faire-part annonce qui invite officiellement. Quand les parents sont divorcés ou remariés, la ligne d'en-tête devient politique : un mauvais ordre des noms peut blesser plus qu'un oubli d'invité.",
          "Règle simple : les mariés décident. Ce sont leurs noms en premier, puis les parents qui contribuent ou qui sont proches, sans obligation d'équité parfaite si la relation est tendue.",
        ],
      },
      {
        type: "list",
        title: "Formules courantes",
        items: [
          "Parents ensemble encore : « M. et Mme X ont la joie de vous annoncer le mariage de leurs enfants… »",
          "Parents séparés : deux lignes distinctes, ou « [Prénom] et [Prénom], avec leurs familles… »",
          "Famille recomposée : citer les parents biologiques, optionnellement le conjoint actuel si la relation est sereine",
          "Mariés seuls : « [Prénom] et [Prénom] ont le plaisir de vous inviter… » sans mention parentale",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Prévenez chaque parent du texte avant impression. Une conversation de 15 minutes évite un drame le jour de la distribution.",
        ],
      },
      fianceGuestsFr([
        "Suivez qui a reçu le faire-part dans l'onglet Invités Fiancé. Liez au [calendrier save-the-date / RSVP](/blog/save-the-date-faire-part-calendrier) pour ne pas envoyer deux versions contradictoires.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The invitation states who officially hosts. When parents are divorced or remarried, the header line gets political: wrong name order can hurt more than a missed guest.",
          "Simple rule: the couple decides. Your names first, then parents who contribute or are close, without forced symmetry if the relationship is strained.",
        ],
      },
      {
        type: "list",
        title: "Common wording",
        items: [
          "Still-together parents: \"Mr. and Mrs. X are delighted to announce the marriage of their children…\"",
          "Separated parents: two distinct lines, or \"[Name] and [Name], together with their families…\"",
          "Blended family: name biological parents, optionally current spouse if relations are calm",
          "Couple-only: \"[Name] and [Name] invite you to celebrate…\" with no parental line",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Share the wording with each parent before printing. A 15-minute conversation beats drama on mailing day.",
        ],
      },
      fianceGuestsEn([
        "Track who received the invitation in Fiancé's Guests tab. Tie it to the [save-the-date / RSVP calendar](/blog/save-the-date-faire-part-calendrier) so you do not send two conflicting versions.",
      ]),
    ],
  }),

  postPair({
    date: POST_DATE,
    slug: "remerciements-apres-mariage",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Remerciements après le mariage : timing et formules",
    titleEn: "Thank-yous after the wedding: timing and templates",
    excerptFr:
      "Cartes, messages, cadeaux des invités : à envoyer dans les 3 mois, avec des modèles courts qui sonnent sincères, pas génériques.",
    excerptEn:
      "Cards, messages, guest gifts: send within 3 months, with short templates that sound sincere, not generic.",
    readingMinutes: 5,
    heroAltFr: "Cartes de remerciements mariage",
    heroAltEn: "Wedding thank-you cards",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les remerciements ferment la boucle invités. Ils confirment que vous avez reçu le cadeau, que leur présence comptait, et qu'ils ne sont pas oubliés une fois le voyage de noces lancé.",
          "Délai recommandé : 4 à 12 semaines après le retour de voyage. Au-delà de 3 mois, un message vaut mieux que silence, même tardif.",
        ],
      },
      {
        type: "list",
        title: "Qui remercier en priorité",
        items: [
          "Invités ayant offert un cadeau (personnalisé si possible)",
          "Témoins et proches ayant investi du temps (discours, DIY, logistique)",
          "Prestataires hors contrat qui ont fait un extra (officiant bénévole, hébergeur)",
          "Parents et beaux-parents, même sans cadeau matériel",
        ],
      },
      {
        type: "list",
        title: "Structure d'un message court",
        items: [
          "Merci pour [présence / cadeau / discours]",
          "Détail personnel (un souvenir du jour J)",
          "Phrase de clôture chaleureuse, signature des deux prénoms",
        ],
      },
      fianceGuestsFr([
        "Exportez la liste invités depuis Fiancé et cochez « remerciement envoyé » au fil des cartes. Croisez avec la [liste cadeaux](/blog/liste-cadeaux-mariage-guide) si vous en aviez une.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Thank-yous close the guest loop. They confirm you received the gift, that their presence mattered, and that they are not forgotten once the honeymoon starts.",
          "Recommended window: 4 to 12 weeks after you return. Past 3 months, a late note still beats silence.",
        ],
      },
      {
        type: "list",
        title: "Who to thank first",
        items: [
          "Guests who gave a gift (personalize when possible)",
          "Witnesses and close helpers (speeches, DIY, logistics)",
          "Non-contract vendors who went extra (volunteer officiant, host)",
          "Parents and in-laws, even without a material gift",
        ],
      },
      {
        type: "list",
        title: "Short message structure",
        items: [
          "Thanks for [attendance / gift / speech]",
          "Personal detail (one memory from the day)",
          "Warm closing line, both first names",
        ],
      },
      fianceGuestsEn([
        "Export your guest list from Fiancé and mark \"thank-you sent\" as cards go out. Cross-check with your [gift list](/blog/liste-cadeaux-mariage-guide) if you had one.",
      ]),
    ],
  }),

  postPair({
    date: POST_DATE,
    slug: "protocole-invitations-qui-inviter",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Protocole invitations : qui inviter sans exploser la liste",
    titleEn: "Invitation protocol: who to invite without blowing the list",
    excerptFr:
      "Collègues, cousins éloignés, +1 : règles de courtoisie françaises et méthode must / should / nice pour trancher à deux.",
    excerptEn:
      "Coworkers, distant cousins, plus-ones: French etiquette rules and a must / should / nice method to decide as a couple.",
    readingMinutes: 6,
    heroAltFr: "Protocole et liste d'invités mariage",
    heroAltEn: "Wedding guest list protocol",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "« Qui on invite ? » est la question qui fait le plus déraper budget et plan de table. Sans protocole écrit, chaque parent ajoute des noms et vous vous retrouvez à 180 personnes pour un budget pensé à 100.",
          "Fixez d'abord un plafond invités lié au budget (voir [coût par invité](/blog/budget-mariage-cout-par-invite)), puis classez les noms.",
        ],
      },
      {
        type: "list",
        title: "Méthode must / should / nice",
        items: [
          "Must : vous ne vous marieriez pas sans eux (famille proche, amis intimes)",
          "Should : vous aimeriez les avoir, mais vous pouvez expliquer un format réduit",
          "Nice : vous les voyez une fois par an, invitation par courtoisie",
          "Règle : invitez les couples mariés ou en couple stable ensemble, pas un seul époux",
        ],
      },
      {
        type: "list",
        title: "Cas fréquents",
        items: [
          "Collègues : seulement l'équipe proche, ou personne si mariage très intime",
          "Enfants : décision globale (tous invités ou adultes seulement), annoncée sur le faire-part",
          "+1 : réservé aux invités sans partenaire connu de vous, pas automatique pour tous",
        ],
      },
      fianceGuestsFr([
        "La liste Fiancé gère must / should / nice via tags et compte automatiquement les +1. Appuyez-vous sur [liste sans conflits](/blog/liste-invites-mariage-sans-conflits) et le [simulateur budget](/tools/budget-calculator).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "\"Who do we invite?\" is the question that blows up budget and seating fastest. Without a written protocol, each parent adds names and you end at 180 guests for a 100-guest budget.",
          "Set a guest cap tied to budget first (see [cost per guest](/blog/budget-mariage-cout-par-invite)), then sort names.",
        ],
      },
      {
        type: "list",
        title: "Must / should / nice method",
        items: [
          "Must: you would not marry without them (close family, intimate friends)",
          "Should: you want them there, but can explain a smaller format",
          "Nice: you see them once a year, invite out of courtesy",
          "Rule: invite established couples together, not one spouse alone",
        ],
      },
      {
        type: "list",
        title: "Common cases",
        items: [
          "Coworkers: only close team, or none for a very intimate wedding",
          "Children: global decision (all invited or adults only), stated on the invitation",
          "+1: for guests without a partner you know, not automatic for everyone",
        ],
      },
      fianceGuestsEn([
        "Fiancé's guest list supports must / should / nice via tags and counts plus-ones automatically. Use [list without conflict](/blog/liste-invites-mariage-sans-conflits) and the [budget calculator](/tools/budget-calculator).",
      ]),
    ],
  }),

  // ─── Seating (3) ─────────────────────────────────────────────────────────

  postPair({
    date: POST_DATE,
    slug: "table-honneur-formats-mariage",
    categoryKey: "seating",
    categoryFr: "Plan de table",
    categoryEn: "Seating",
    titleFr: "Table d'honneur : sweetheart, classique ou entre amis ?",
    titleEn: "Head table: sweetheart, classic, or friends mix?",
    excerptFr:
      "Seuls face à la salle, entourés des parents, ou à une table longue avec les témoins : les trois formats et leurs pièges.",
    excerptEn:
      "Alone facing the room, flanked by parents, or at a long table with witnesses: three formats and their pitfalls.",
    readingMinutes: 5,
    heroAltFr: "Table d'honneur mariage",
    heroAltEn: "Wedding head table",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La table d'honneur envoie un signal visuel : qui compte le plus, et comment vous voulez vivre le dîner. Il n'y a pas de mauvais choix, seulement des choix incompatibles avec une famille très protocolaire ou un mariage ultra convivial.",
        ],
      },
      {
        type: "list",
        title: "Trois formats",
        items: [
          "Sweetheart (2 places face à la salle) : intime, vous voyez tout le monde, parents à d'autres tables",
          "Classique (mariés au centre, parents de chaque côté) : rassurant pour les familles, moins de conversation entre vous deux",
          "Table longue d'honneur (mariés + témoins + fratrie proche) : ambiance « dîner entre amis », moins hiérarchique",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Vérifiez avec le traiteur la place pour un « sweet heart » : certains plans de salle ne laissent que deux chaises en bout de table rectangulaire.",
        ],
      },
      fianceSeatingFr([
        "Testez les trois dispositions dans le [plan de table Fiancé](/tools/seating-chart) avant de figer le PDF traiteur. Voir [tables rondes ou rectangulaires](/blog/tables-rondes-ou-rectangulaires-mariage).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The head table sends a visual signal: who matters most, and how you want to experience dinner. No wrong choice, only choices that clash with a formal family or an ultra-casual wedding.",
        ],
      },
      {
        type: "list",
        title: "Three formats",
        items: [
          "Sweetheart (2 seats facing the room): intimate, you see everyone, parents at other tables",
          "Classic (couple center, parents on each side): reassures families, less couple conversation",
          "Long honor table (couple + witnesses + close siblings): dinner-with-friends vibe, less hierarchy",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Check with the caterer that a sweetheart setup works: some floor plans only allow two chairs at the end of a rectangular table.",
        ],
      },
      fianceSeatingEn([
        "Try all three layouts in the Fiancé [seating chart](/tools/seating-chart) before locking the caterer PDF. See [round vs rectangular tables](/blog/tables-rondes-ou-rectangulaires-mariage).",
      ]),
    ],
  }),

  postPair({
    date: POST_DATE,
    slug: "plan-de-table-enfants-mariage",
    categoryKey: "seating",
    categoryFr: "Plan de table",
    categoryEn: "Seating",
    titleFr: "Plan de table enfants : table dédiée ou avec les parents ?",
    titleEn: "Kids at the seating chart: kids' table or with parents?",
    excerptFr:
      "À partir de quel âge, comment placer les enfants pour que les parents profitent du dîner sans chaos en salle.",
    excerptEn:
      "From what age, how to seat children so parents enjoy dinner without chaos in the room.",
    readingMinutes: 5,
    heroAltFr: "Table enfants au mariage",
    heroAltEn: "Kids table at a wedding",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les enfants changent le plan de table, le menu et le bruit ambiant. Une table enfants regroupée peut libérer les parents, à condition d'avoir une animation ou un adulte référent.",
        ],
      },
      {
        type: "list",
        title: "Table enfants : quand ça marche",
        items: [
          "Âge conseillé : 6 à 14 ans, groupes de 6 à 12 enfants max",
          "Un adulte référent (baby-sitter, témoin, cousin) à la table ou à côté",
          "Menu enfant commandé au traiteur, activités sur la table (coloriages, jeux calmes)",
          "Parents d'enfants très jeunes (0-5 ans) : gardez les enfants avec eux ou prévoyez garde hors salle",
        ],
      },
      {
        type: "list",
        title: "Placement avec les parents",
        items: [
          "Bébés et tout-petits : toujours avec les parents, sortie anticipée possible",
          "Même famille : regrouper cousins pour que les parents se relaient",
          "Éviter : enfant seul à une table d'adultes sans voisin connu",
        ],
      },
      fianceSeatingFr([
        "Marquez « enfant » et âge dans la liste invités Fiancé : le [plan de table](/tools/seating-chart) affiche les régimes et menus. Croisez avec [+1 et enfants](/blog/gerer-plus-un-enfants-regimes-alimentaires).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Children change seating, menus, and noise level. A dedicated kids' table can free parents, if you have entertainment or a designated adult.",
        ],
      },
      {
        type: "list",
        title: "Kids' table: when it works",
        items: [
          "Suggested age: 6 to 14, groups of 6 to 12 kids max",
          "One designated adult (sitter, witness, cousin) at or next to the table",
          "Kids' menu ordered from caterer, quiet table activities (coloring, games)",
          "Parents of very young kids (0-5): keep kids with them or plan off-room childcare",
        ],
      },
      {
        type: "list",
        title: "Seating with parents",
        items: [
          "Babies and toddlers: always with parents, early exit OK",
          "Same family: group cousins so parents can tag-team",
          "Avoid: lone child at an adult table with no familiar neighbor",
        ],
      },
      fianceSeatingEn([
        "Mark \"child\" and age in Fiancé's guest list: the [seating chart](/tools/seating-chart) shows diets and menus. Cross-check [plus-ones and kids](/blog/gerer-plus-un-enfants-regimes-alimentaires).",
      ]),
    ],
  }),

  postPair({
    date: POST_DATE,
    slug: "placement-libre-ou-assigne-mariage",
    categoryKey: "seating",
    categoryFr: "Plan de table",
    categoryEn: "Seating",
    titleFr: "Placement libre ou assigné : que choisir pour votre mariage ?",
    titleEn: "Open seating vs assigned: what to choose for your wedding?",
    excerptFr:
      "Libre convivial ou assigné sans conflit : avantages, risques, et le compromis « zones » qui fonctionne souvent le mieux.",
    excerptEn:
      "Casual open seating vs conflict-free assigned: pros, risks, and the \"zones\" compromise that often works best.",
    readingMinutes: 5,
    heroAltFr: "Placement libre ou assigné au mariage",
    heroAltEn: "Open vs assigned seating at a wedding",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le placement libre (« installez-vous où vous voulez ») simplifie votre préparation mais déplace le stress sur les invités timides et les familles qui ne se connaissent pas.",
          "Le placement assigné demande du travail, mais protège les introvertis, évite qu'un oncle se retrouve seul, et aide le traiteur à servir par table.",
        ],
      },
      {
        type: "list",
        title: "Placement libre : pour qui",
        items: [
          "Mariage < 50 invités, tout le monde se connaît",
          "Format cocktail debout sans service à table",
          "Vous acceptez que des groupes se regroupent naturellement (parfois en silos)",
        ],
      },
      {
        type: "list",
        title: "Placement assigné : quasi obligatoire si",
        items: [
          "Plus de 80 invités ou familles qui ne se parlent pas",
          "Service à table et menus par régime",
          "Parents divorcés à séparer diplomatiquement",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Compromis « zones » : tables numérotées mais choix libre dans la zone (famille, amis fac, amis mariée). Moins de micro-gestion, moins de chaos qu'un libre total.",
        ],
      },
      fianceSeatingFr([
        "Même assigné, le [plan de table Fiancé](/tools/seating-chart) reste modifiable jusqu'à J-5. Lisez le [guide complet](/blog/plan-de-table-mariage-guide-complet) et les [5 règles de placement](/blog/plan-de-table-5-regles-placement).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Open seating (\"sit wherever you like\") simplifies prep but shifts stress onto shy guests and families who do not know each other.",
          "Assigned seating takes work but protects introverts, keeps an uncle from sitting alone, and helps the caterer serve by table.",
        ],
      },
      {
        type: "list",
        title: "Open seating: good for",
        items: [
          "Weddings under 50 guests where everyone knows everyone",
          "Standing cocktail format with no seated dinner",
          "You accept natural cliques (sometimes siloed)",
        ],
      },
      {
        type: "list",
        title: "Assigned seating: almost required if",
        items: [
          "More than 80 guests or families that do not talk",
          "Seated dinner with dietary menus",
          "Divorced parents to seat diplomatically",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "\"Zones\" compromise: numbered tables but free choice within a zone (family, groom's friends, bride's friends). Less micro-management, less chaos than fully open.",
        ],
      },
      fianceSeatingEn([
        "Even assigned, the Fiancé [seating chart](/tools/seating-chart) stays editable until 5 days out. Read the [full guide](/blog/plan-de-table-mariage-guide-complet) and [5 placement rules](/blog/plan-de-table-5-regles-placement).",
      ]),
    ],
  }),

  // ─── Vendors (3) ─────────────────────────────────────────────────────────

  postPair({
    date: POST_DATE,
    slug: "choisir-photographe-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Choisir son photographe de mariage : critères et contrat",
    titleEn: "Choosing your wedding photographer: criteria and contract",
    excerptFr:
      "Style, droits d'image, nombre de photos, second shooter : les questions à poser avant de signer un acompte à 30 %.",
    excerptEn:
      "Style, image rights, photo count, second shooter: questions to ask before signing a 30% deposit.",
    readingMinutes: 7,
    heroAltFr: "Photographe de mariage en action",
    heroAltEn: "Wedding photographer in action",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le photographe est l'un des premiers prestataires à réserver (9 à 15 mois avant en haute saison). Les photos sont ce qui reste quand la déco est démontée et le gâteau mangé.",
          "Ne choisissez pas sur le prix seul : comparez style, livrables, délais de retouche et conditions d'annulation.",
        ],
      },
      {
        type: "list",
        title: "Critères de sélection",
        items: [
          "Portfolio complet (pas seulement les 10 plus belles photos Instagram)",
          "Cohérence lumière naturelle vs flash si votre lieu est sombre",
          "Présence d'un second shooter pour couvrir préparatifs simultanés",
          "Nombre de photos livrées et délai (6 à 12 semaines courant)",
          "Droits : usage privé, partage réseaux, interdiction de revente par le photographe",
        ],
      },
      {
        type: "list",
        title: "Clauses contrat à vérifier",
        items: [
          "Heures incluses et tarif heure supplémentaire",
          "Acompte et politique report (maladie, intempéries)",
          "Propriété des fichiers RAW (souvent non inclus)",
          "Clause de substitution si le photographe est indisponible",
        ],
      },
      fianceVendorsFr([
        "Centralisez devis et statut dans l'onglet Prestataires Fiancé. Réservez tôt selon [l'ordre de réservation](/blog/ordre-reservation-prestataires-mariage). Budget photo : 8 à 12 % dans le [simulateur](/tools/budget-calculator).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The photographer is among the first vendors to book (9 to 15 months out in peak season). Photos are what remains after decor is gone and cake is eaten.",
          "Do not choose on price alone: compare style, deliverables, editing turnaround, and cancellation terms.",
        ],
      },
      {
        type: "list",
        title: "Selection criteria",
        items: [
          "Full portfolio (not just the top 10 Instagram shots)",
          "Natural light vs flash consistency if your venue is dark",
          "Second shooter for simultaneous prep coverage",
          "Photo count delivered and timeline (6 to 12 weeks common)",
          "Rights: private use, social sharing, no resale by photographer",
        ],
      },
      {
        type: "list",
        title: "Contract clauses to check",
        items: [
          "Hours included and overtime rate",
          "Deposit and postponement policy (illness, weather)",
          "RAW file ownership (often excluded)",
          "Substitution clause if photographer is unavailable",
        ],
      },
      fianceVendorsEn([
        "Centralize quotes and status in Fiancé's Vendors tab. Book early per [vendor booking order](/blog/ordre-reservation-prestataires-mariage). Photo budget: 8 to 12% in the [calculator](/tools/budget-calculator).",
      ]),
    ],
  }),

  postPair({
    date: POST_DATE,
    slug: "choisir-dj-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Choisir son DJ de mariage : ambiance, matériel et playlist",
    titleEn: "Choosing your wedding DJ: vibe, gear, and playlist",
    excerptFr:
      "DJ généraliste vs spécialisé mariage, sono incluse, micro pour les discours : ce qui fait une soirée fluide jusqu'à 2 h du matin.",
    excerptEn:
      "Generalist vs wedding DJ, sound included, mic for speeches: what keeps the party smooth until 2 a.m.",
    readingMinutes: 6,
    heroAltFr: "DJ et piste de danse mariage",
    heroAltEn: "Wedding DJ and dance floor",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le DJ pilote l'énergie de la soirée : entrée des mariés, coupe-cake, ouverture de bal, puis transition vers la piste. Un mauvais son ou un micro qui grésille gâche les discours des témoins.",
        ],
      },
      {
        type: "list",
        title: "Questions avant réservation",
        items: [
          "Matériel inclus (enceintes, micros, lumières) et besoin d'alimentation sur place",
          "Expérience mariages : gère-t-il les temps forts sans vous couper la parole ?",
          "Playlist : formulaire à remplir, must-play et do-not-play",
          "Prolongation possible et tarif heure supplémentaire",
          "Assurance RC pro et backup matériel",
        ],
      },
      {
        type: "list",
        title: "DJ vs groupe live",
        items: [
          "DJ : répertoire illimité, coût souvent inférieur, ambiance prévisible",
          "Groupe : live émotionnel, répertoire limité, coût et espace scène plus élevés",
          "Hybride : groupe cocktail + DJ soirée (budget à prévoir)",
        ],
      },
      fianceVendorsFr([
        "Notez les créneaux DJ dans la [timeline jour J](/tools/timeline) et partagez-la une semaine avant. Comparez les devis dans Prestataires Fiancé. Voir [négocier un devis](/blog/negocier-devis-mariage).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The DJ drives evening energy: grand entrance, cake cut, first dance, then floor-filling. Bad sound or a crackling mic ruins witness speeches.",
        ],
      },
      {
        type: "list",
        title: "Questions before booking",
        items: [
          "Gear included (speakers, mics, lights) and power needs on site",
          "Wedding experience: do they handle key moments without talking over you?",
          "Playlist: intake form, must-play and do-not-play lists",
          "Extension possible and overtime rate",
          "Liability insurance and gear backup",
        ],
      },
      {
        type: "list",
        title: "DJ vs live band",
        items: [
          "DJ: unlimited repertoire, often lower cost, predictable vibe",
          "Band: emotional live feel, limited repertoire, higher cost and stage space",
          "Hybrid: band for cocktail + DJ for party (budget accordingly)",
        ],
      },
      fianceVendorsEn([
        "Log DJ slots in the [day-of timeline](/tools/timeline) and share it one week out. Compare quotes in Fiancé Vendors. See [negotiating quotes](/blog/negocier-devis-mariage).",
      ]),
    ],
  }),

  postPair({
    date: POST_DATE,
    slug: "choisir-fleuriste-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Choisir son fleuriste de mariage : saison, budget et brief",
    titleEn: "Choosing your wedding florist: season, budget, and brief",
    excerptFr:
      "Bouquet, arche, centres de table : comment briefer un fleuriste, choisir des fleurs de saison, et éviter la déco hors budget.",
    excerptEn:
      "Bouquet, arch, centerpieces: how to brief a florist, pick seasonal flowers, and avoid over-budget decor.",
    readingMinutes: 6,
    heroAltFr: "Fleuriste et décoration florale mariage",
    heroAltEn: "Florist and wedding floral decor",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La déco florale peut représenter 8 à 12 % du budget, plus si vous visez une arche complète et des centres de table luxueux. Le fleuriste transforme votre mood board en volumes réels, avec contraintes de saison et de transport.",
        ],
      },
      {
        type: "list",
        title: "Ce que doit contenir votre brief",
        items: [
          "Palette couleurs et 3 à 5 photos de référence (pas 50)",
          "Liste des éléments : bouquet mariée, boutonnières, arche, centres de table, pétales",
          "Nombre de tables et taille des centres (évite les compositions trop hautes qui bloquent la vue)",
          "Lieu et horaires : installation la veille ou le matin ?",
          "Budget cible ferme : le fleuriste propose des alternatives de saison",
        ],
      },
      {
        type: "list",
        title: "Fleurs de saison en France (exemples)",
        items: [
          "Printemps : tulipes, renoncules, pivoines (fin mai-juin)",
          "Été : lavande, dahlias, roses de jardin",
          "Automne : chrysanthèmes, eucalyptus séché, couleurs terre",
          "Hiver : amaryllis, anémones, verdure et branches",
        ],
      },
      fianceVendorsFr([
        "Liez votre [mood board](/blog/mood-board-mariage-organiser) au brief fleuriste. Suivez le devis dans Prestataires Fiancé et le poste déco dans le [budget](/tools/budget-calculator).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Floral decor can run 8 to 12% of budget, more for a full arch and lush centerpieces. The florist turns your mood board into real volumes, with season and transport constraints.",
        ],
      },
      {
        type: "list",
        title: "What your brief should include",
        items: [
          "Color palette and 3 to 5 reference photos (not 50)",
          "Item list: bride bouquet, boutonnieres, arch, centerpieces, petals",
          "Table count and centerpiece size (avoid blocks-the-view heights)",
          "Venue and timing: install day before or morning of?",
          "Firm target budget: florist suggests seasonal swaps",
        ],
      },
      {
        type: "list",
        title: "Seasonal flowers in France (examples)",
        items: [
          "Spring: tulips, ranunculus, peonies (late May-June)",
          "Summer: lavender, dahlias, garden roses",
          "Autumn: chrysanthemums, dried eucalyptus, earth tones",
          "Winter: amaryllis, anemones, greenery and branches",
        ],
      },
      fianceVendorsEn([
        "Link your [mood board](/blog/mood-board-mariage-organiser) to the florist brief. Track the quote in Fiancé Vendors and the decor line in [budget](/tools/budget-calculator).",
      ]),
    ],
  }),

  // ─── Ideas (3) ───────────────────────────────────────────────────────────

  postPair({
    date: POST_DATE,
    slug: "tendances-mariage-2026",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Tendances mariage 2026 : ce qui revient (et ce qui fatigue)",
    titleEn: "2026 wedding trends: what is back (and what is tired)",
    excerptFr:
      "Mariages plus petits, retour du vintage, couleurs chaudes, tech discrète : panorama des tendances vues sur le terrain, pas sur Pinterest seul.",
    excerptEn:
      "Smaller weddings, vintage return, warm colors, discreet tech: trends we see in the field, not just on Pinterest.",
    readingMinutes: 6,
    heroAltFr: "Tendances mariage 2026",
    heroAltEn: "2026 wedding trends",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les tendances mariage 2026 en France penchent vers l'authenticité et le confort invité, pas vers le spectaculaire pour Instagram. Les couples réduisent parfois la liste pour investir sur l'expérience (traiteur, photo, lieu atypique).",
        ],
      },
      {
        type: "list",
        title: "Ce qui monte en 2026",
        items: [
          "Formats 60 à 100 invités, ou micro-mariages < 40",
          "Palettes terracotta, olive, crème (moins de bleu pastel uniforme)",
          "Retour du vintage : vaisselle dépareillée, mobilier chiné, polaroids",
          "Cérémonies laïques personnalisées avec rituels courts",
          "RSVP et infos pratiques 100 % digitaux, sans compte invité",
        ],
      },
      {
        type: "list",
        title: "Ce qui fatigue",
        items: [
          "Arches florales identiques sur chaque feed",
          "Hashtags imposés et mur de photos branded",
          "Buffets sans gestion des allergies",
          "Planning jour J trop serré sans marge (retard = effet domino)",
        ],
      },
      fianceIdeasFr([
        "Collectez ce qui vous plaît dans le mood board Fiancé sans tout copier. Ancrez les tendances dans votre [thème en 5 étapes](/blog/definir-theme-mariage-5-etapes) et votre [budget réel](/tools/budget-calculator).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "2026 wedding trends in France lean toward authenticity and guest comfort, not Instagram spectacle. Couples sometimes trim the list to invest in experience (catering, photo, unusual venue).",
        ],
      },
      {
        type: "list",
        title: "Rising in 2026",
        items: [
          "60 to 100 guest formats, or micro weddings under 40",
          "Terracotta, olive, cream palettes (less uniform pastel blue)",
          "Vintage return: mismatched tableware, flea-market furniture, polaroids",
          "Personalized secular ceremonies with short rituals",
          "Digital RSVP and practical info with no guest account",
        ],
      },
      {
        type: "list",
        title: "Losing steam",
        items: [
          "Identical floral arches on every feed",
          "Forced hashtags and branded photo walls",
          "Buffets with no allergy management",
          "Over-tight day-of schedules (one delay = domino effect)",
        ],
      },
      fianceIdeasEn([
        "Collect what you like in Fiancé's mood board without copying everything. Ground trends in your [theme in 5 steps](/blog/definir-theme-mariage-5-etapes) and real [budget](/tools/budget-calculator).",
      ]),
    ],
  }),

  postPair({
    date: POST_DATE,
    slug: "palette-couleurs-mariage",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Palette de couleurs mariage : 3 couleurs max et cohérence",
    titleEn: "Wedding color palette: 3 colors max and consistency",
    excerptFr:
      "Primaire, accent, neutre : comment choisir une palette lisible pour faire-part, fleurs, nappes et tenues sans effet arc-en-ciel.",
    excerptEn:
      "Primary, accent, neutral: how to pick a readable palette for invites, flowers, linens, and outfits without rainbow chaos.",
    readingMinutes: 5,
    heroAltFr: "Palette de couleurs mariage",
    heroAltEn: "Wedding color palette",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Une palette trop large dilue la déco et complique les briefs prestataires. Trois couleurs actives plus un neutre (blanc cassé, crème, beige) suffisent pour 90 % des mariages.",
        ],
      },
      {
        type: "list",
        title: "Méthode en 4 étapes",
        items: [
          "1. Couleur primaire : celle que vous portez ou qui domine la salle (ex. terracotta)",
          "2. Couleur accent : contraste léger (ex. olive ou moutarde)",
          "3. Neutre : papier, nappe, fond photo (ex. crème)",
          "4. Testez en lumière naturelle du lieu, pas seulement sur écran",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Donnez les codes hex ou Pantone au fleuriste et au imprimeur. « Rose poudré » seul veut dire dix choses différentes.",
        ],
      },
      fianceIdeasFr([
        "Enregistrez les codes couleur dans votre [mood board Fiancé](/blog/mood-board-mariage-organiser) et liez-les au [thème](/blog/definir-theme-mariage-5-etapes) pour que chaque prestataire reçoive la même référence.",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A palette that is too wide dilutes decor and complicates vendor briefs. Three active colors plus a neutral (off-white, cream, beige) is enough for 90% of weddings.",
        ],
      },
      {
        type: "list",
        title: "4-step method",
        items: [
          "1. Primary: what you wear or what dominates the room (e.g. terracotta)",
          "2. Accent: light contrast (e.g. olive or mustard)",
          "3. Neutral: paper, linens, photo background (e.g. cream)",
          "4. Test in the venue's natural light, not only on screen",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Give hex or Pantone codes to florist and printer. \"Blush pink\" alone means ten different things.",
        ],
      },
      fianceIdeasEn([
        "Save color codes in your Fiancé [mood board](/blog/mood-board-mariage-organiser) and link them to your [theme](/blog/definir-theme-mariage-5-etapes) so every vendor gets the same reference.",
      ]),
    ],
  }),

  postPair({
    date: POST_DATE,
    slug: "choisir-alliances-mariage",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Choisir ses alliances : métal, style et délais",
    titleEn: "Choosing wedding rings: metal, style, and lead times",
    excerptFr:
      "Or jaune, platine, gravure intérieure : comment choisir des alliances confortables au quotidien, 4 à 8 semaines avant le jour J.",
    excerptEn:
      "Yellow gold, platinum, inner engraving: how to pick rings comfortable for daily wear, 4 to 8 weeks before the big day.",
    readingMinutes: 5,
    heroAltFr: "Alliances de mariage",
    heroAltEn: "Wedding rings",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les alliances restent après la robe et le costume. Elles doivent passer le test du quotidien : bureau, sport, allergies métal, travail manuel.",
          "Commandez tôt : gravure et taille sur mesure ajoutent 2 à 6 semaines. Prévoyez une visite de contrôle 10 jours avant le mariage.",
        ],
      },
      {
        type: "list",
        title: "Métaux courants",
        items: [
          "Or jaune 18 carats : classique, résiste bien, entretien simple",
          "Or blanc ou gris : moderne, parfois plaqué rhodium à refaire tous les ans",
          "Platine : dense, hypoallergénique, plus cher",
          "Titane ou acier : budget léger, peu de gravure fine possible",
        ],
      },
      {
        type: "list",
        title: "Confort et style",
        items: [
          "Profil bombe ou plat : essayez 30 minutes en boutique, pas 30 secondes",
          "Largeur 2 à 4 mm pour confort quotidien",
          "Gravure intérieure (date, initiales) sans impacter l'extérieur",
          "Assurance ou coffre : même budget que bijou, pensez à la couverture",
        ],
      },
      fianceIdeasFr([
        "Ajoutez une tâche « alliances » dans la checklist Fiancé 2 mois avant. Liez au [rétroplanning](/blog/retroplanning-mariage-mois-par-mois) et au poste accessoires dans le [budget](/tools/budget-calculator).",
      ]),
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Rings stay after dress and suit. They must pass the daily-life test: office, sport, metal allergies, manual work.",
          "Order early: engraving and custom sizing add 2 to 6 weeks. Plan a fitting check 10 days before the wedding.",
        ],
      },
      {
        type: "list",
        title: "Common metals",
        items: [
          "18k yellow gold: classic, durable, easy care",
          "White or grey gold: modern, sometimes rhodium replating yearly",
          "Platinum: dense, hypoallergenic, pricier",
          "Titanium or steel: lighter budget, limited fine engraving",
        ],
      },
      {
        type: "list",
        title: "Comfort and style",
        items: [
          "Domed vs flat profile: wear 30 minutes in store, not 30 seconds",
          "2 to 4 mm width for daily comfort",
          "Inner engraving (date, initials) without affecting the outside",
          "Insurance or safe: same as any jewelry, plan coverage",
        ],
      },
      fianceIdeasEn([
        "Add a \"rings\" task in Fiancé's checklist 2 months out. Link to the [month-by-month plan](/blog/retroplanning-mariage-mois-par-mois) and accessories line in [budget](/tools/budget-calculator).",
      ]),
    ],
  }),
];

export const { fr: POSTS_51_68_FR, en: POSTS_51_68_EN } = pairsToArrays(pairs);
