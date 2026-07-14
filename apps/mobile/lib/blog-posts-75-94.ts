import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "robe-de-mariee-guide-choisir",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Robe de mariée : silhouette, essayages, délais",
    titleEn: "Wedding dress: silhouette, fittings, timing",
    excerptFr:
      "Sirène, princesse, fourreau : comment choisir sa silhouette, quand commander, combien d'essayages prévoir et quel budget garder pour les retouches.",
    excerptEn:
      "Mermaid, ballgown, sheath: how to pick a silhouette, when to order, how many fittings to plan, and what budget to keep for alterations.",
    readingMinutes: 7,
    heroAltFr: "Robe de mariée sur un mannequin dans un atelier",
    heroAltEn: "Wedding dress on a mannequin in a workshop",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La robe est souvent le premier achat qui rend le mariage concret, et aussi celui qui génère le plus de pression : silhouette, tissu, couleur, budget, délais de commande. Prendre le sujet dans l'ordre évite les mauvaises surprises, en particulier sur les délais, qui sont la contrainte la moins visible et la plus difficile à rattraper.",
          "Avant de fixer un rendez-vous en boutique, il est utile de savoir combien de temps vous avez devant vous et quel type de robe correspond à ce délai, plutôt que de tomber amoureuse d'un modèle qui ne pourra pas être prêt à temps.",
        ],
      },
      {
        type: "list",
        title: "Les silhouettes principales",
        items: [
          "Sirène (mermaid) : ajustée jusqu'aux genoux puis évasée, met en valeur la taille, demande une bonne maîtrise des retouches",
          "Princesse : jupon ample, silhouette classique de conte, confortable pour danser toute la soirée",
          "Fourreau (sheath) : coupe droite et fluide, silhouette épurée, souvent privilégiée pour un mariage en petit comité",
          "Trapèze (A-line) : évasée dès la taille, flatte la plupart des morphologies, bon compromis élégance et confort",
          "Bohème : matières légères, dentelle, dos souvent dénudé, adaptée à une cérémonie en extérieur",
        ],
      },
      {
        type: "text",
        title: "Quand commander",
        paragraphs: [
          "Pour une robe sur mesure ou une commande en atelier, comptez 6 à 9 mois avant le jour J : la fabrication seule prend plusieurs mois, avant même les essayages de finition. Pour une robe en boutique déjà produite (prêt-à-porter mariée), 3 à 4 mois suffisent généralement, retouches comprises.",
          "Si votre mariage est dans moins de 4 mois, orientez-vous directement vers le prêt-à-porter ou la location plutôt que vers le sur-mesure, sous peine de courir après les délais jusqu'au bout.",
        ],
      },
      {
        type: "list",
        title: "Les essayages, en pratique",
        items: [
          "Premier essayage : choix du modèle et de la taille de base, souvent 1 à 2 tailles au-dessus pour laisser de la marge aux retouches",
          "Essayage intermédiaire : ajustements de coupe, ourlet provisoire, choix des accessoires portés en même temps",
          "Essayage final : 2 à 4 semaines avant le mariage, avec les vraies chaussures et la lingerie du jour J",
          "Prévoyez de porter la robe assise, en marchant et en levant les bras : c'est le meilleur test avant de valider",
        ],
      },
      {
        type: "text",
        title: "Budget à prévoir en plus de la robe",
        paragraphs: [
          "Le prix affiché en boutique ne couvre presque jamais les retouches, qui peuvent représenter 10 à 20 % du prix de la robe selon leur ampleur (ourlet, reprise à la taille, ajout de bretelles). Prévoyez aussi une housse de transport, un nettoyage après le mariage si vous souhaitez conserver la robe, et éventuellement une deuxième tenue plus légère pour la soirée dansante.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Essayez plusieurs silhouettes avant de trancher, même celles que vous pensiez exclure d'emblée : beaucoup de mariées choisissent finalement une coupe différente de celle qu'elles avaient en tête en arrivant.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Suivez le budget robe, retouches et accessoires dans une seule ligne de dépenses avec le [simulateur budget](/tools/budget-calculator), et calez les rendez-vous essayages dans votre [rétroplanning mariage mois par mois](/blog/retroplanning-mariage-mois-par-mois). Pour la suite de la tenue, voir [accessoires de la mariée](/blog/accessoires-mariee-voile-bijoux) et [coiffure et maquillage](/blog/coiffure-maquillage-mariage-essai).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The dress is often the first purchase that makes the wedding feel real, and also the one that generates the most pressure: silhouette, fabric, color, budget, order lead time. Taking the topic in order avoids bad surprises, especially around timing, which is the least visible constraint and the hardest to fix later.",
          "Before booking a boutique appointment, it helps to know how much time you have and which type of dress fits that window, rather than falling for a style that cannot be ready in time.",
        ],
      },
      {
        type: "list",
        title: "The main silhouettes",
        items: [
          "Mermaid: fitted through the knees then flared, highlights the waist, needs careful alterations",
          "Ballgown: full skirt, classic fairy-tale shape, comfortable for dancing all evening",
          "Sheath: straight and fluid cut, clean silhouette, often chosen for a small wedding",
          "A-line: flares from the waist, flatters most body shapes, a solid compromise of elegance and comfort",
          "Boho: light fabrics, lace, often a bare back, suited to an outdoor ceremony",
        ],
      },
      {
        type: "text",
        title: "When to order",
        paragraphs: [
          "For a custom or made-to-order dress, plan on 6 to 9 months before the wedding: production alone takes several months, before the finishing fittings even start. For a ready-made bridal boutique dress, 3 to 4 months is usually enough, alterations included.",
          "If your wedding is under 4 months away, go straight for ready-to-wear or rental instead of custom, or you will spend the whole runway chasing deadlines.",
        ],
      },
      {
        type: "list",
        title: "Fittings, in practice",
        items: [
          "First fitting: choosing the style and base size, often 1 to 2 sizes up to leave room for alterations",
          "Middle fitting: cut adjustments, temporary hem, choosing the accessories worn alongside it",
          "Final fitting: 2 to 4 weeks before the wedding, with the actual shoes and day-of underwear",
          "Plan to wear the dress while sitting, walking, and raising your arms: it is the best test before signing off",
        ],
      },
      {
        type: "text",
        title: "Budget beyond the dress itself",
        paragraphs: [
          "The price tag in the boutique almost never covers alterations, which can run 10 to 20 percent of the dress price depending on scope (hem, waist take-in, added straps). Also budget a garment bag, cleaning after the wedding if you want to keep the dress, and possibly a lighter second outfit for the dance floor.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Try several silhouettes before deciding, even the ones you thought you would rule out: many brides end up choosing a different cut than the one they had in mind walking in.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Track the dress, alterations, and accessories in one expense line with the [budget calculator](/tools/budget-calculator), and slot fitting appointments into your [month-by-month wedding timeline](/blog/retroplanning-mariage-mois-par-mois). For the rest of the look, see [bridal accessories](/blog/accessoires-mariee-voile-bijoux) and [hair and makeup](/blog/coiffure-maquillage-mariage-essai).",
        ],
      },
    ],
  }),

  postPair({
    slug: "costume-marie-guide",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Costume du marié : sur-mesure, location ou prêt-à-porter",
    titleEn: "Groom's suit: bespoke, rental, or off-the-rack",
    excerptFr:
      "Trois façons d'habiller le marié, avec les vrais écarts de prix et de délai, et comment accorder le costume au reste du cortège.",
    excerptEn:
      "Three ways to dress the groom, with real price and lead-time differences, and how to coordinate the suit with the rest of the wedding party.",
    readingMinutes: 6,
    heroAltFr: "Costume de marié suspendu avant l'essayage",
    heroAltEn: "Groom's suit hanging before a fitting",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le costume du marié reçoit en général beaucoup moins d'attention que la robe, alors que les mêmes contraintes s'appliquent : délai de fabrication, essayages, budget retouches. Trois options existent, avec des écarts de coût et de temps très différents selon celle que vous choisissez.",
        ],
      },
      {
        type: "list",
        title: "Sur mesure (tailleur)",
        items: [
          "Coupe entièrement ajustée à la morphologie, choix libre du tissu et des finitions",
          "Délai : 8 à 12 semaines minimum, souvent plus en haute saison (avril à septembre)",
          "Budget : à partir de 800 à 900 € pour un tailleur artisanal, sans plafond au-delà",
          "Le plus adapté si le costume doit durer au-delà du mariage (usage professionnel régulier)",
        ],
      },
      {
        type: "list",
        title: "Location",
        items: [
          "Choix rapide en boutique, essayage sur stock existant, ajustements limités",
          "Délai : quelques semaines suffisent, réservation conseillée 2 à 3 mois avant en haute saison",
          "Budget : 150 à 400 € selon la qualité du tissu et les accessoires inclus",
          "Bon compromis si le costume ne sera pas reporté ensuite",
        ],
      },
      {
        type: "list",
        title: "Prêt-à-porter avec retouches",
        items: [
          "Achat en boutique classique, puis retouches chez un tailleur retoucheur",
          "Délai : 3 à 6 semaines pour les retouches selon leur ampleur",
          "Budget : 300 à 700 € costume et retouches comprises",
          "Le costume reste utilisable après le mariage pour d'autres occasions",
        ],
      },
      {
        type: "text",
        title: "Accorder le look du cortège",
        paragraphs: [
          "Une fois le costume du marié choisi, il sert souvent de référence pour les témoins et le reste du cortège : même famille de couleur sans forcément le même tissu, boutonnières assorties à la palette du mariage, chaussures dans le même registre. Fixer cette référence tôt évite les achats de dernière minute chez les témoins.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Prévoyez un essayage final avec les vraies chaussures et, si besoin, la cravate ou le nœud papillon définitifs : la longueur du pantalon et la coupe de la veste se jugent différemment avec l'accessoire complet.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Notez la ligne costume dans le [simulateur budget](/tools/budget-calculator) à côté de celle de la robe, avec une échéance de retouche dans votre planning. Pour coordonner les couleurs de tout le cortège, voir [palette de couleurs de mariage](/blog/palette-couleurs-mariage) et [robe de mariée : silhouette, essayages, délais](/blog/robe-de-mariee-guide-choisir).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The groom's suit usually gets far less attention than the dress, even though the same constraints apply: production lead time, fittings, alteration budget. Three options exist, with very different cost and timing profiles depending on which one you pick.",
        ],
      },
      {
        type: "list",
        title: "Bespoke (tailor-made)",
        items: [
          "Fully fitted to your body shape, free choice of fabric and finishings",
          "Lead time: 8 to 12 weeks minimum, often longer in peak season (April to September)",
          "Budget: starting around €800 to €900 for an artisan tailor, with no real ceiling above that",
          "Best suited if the suit will keep being worn after the wedding for regular professional use",
        ],
      },
      {
        type: "list",
        title: "Rental",
        items: [
          "Fast in-store choice, fitting on existing stock, limited adjustments",
          "Lead time: a few weeks is enough, but book 2 to 3 months ahead in peak season",
          "Budget: €150 to €400 depending on fabric quality and included accessories",
          "A good compromise if the suit will not be worn again afterward",
        ],
      },
      {
        type: "list",
        title: "Off-the-rack with alterations",
        items: [
          "Bought at a regular store, then altered by a tailor",
          "Lead time: 3 to 6 weeks for alterations depending on scope",
          "Budget: €300 to €700, suit and alterations included",
          "The suit stays wearable after the wedding for other occasions",
        ],
      },
      {
        type: "text",
        title: "Coordinating the wedding party's look",
        paragraphs: [
          "Once the groom's suit is chosen, it often becomes the reference for the witnesses and the rest of the party: same color family without necessarily the same fabric, boutonnieres matched to the wedding palette, shoes in the same register. Locking this reference early avoids last-minute purchases from your witnesses.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Plan a final fitting with the actual shoes and, if relevant, the final tie or bow tie: trouser length and jacket cut read differently once the full accessory set is on.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Log the suit line in the [budget calculator](/tools/budget-calculator) next to the dress, with an alteration deadline in your planning. To coordinate colors across the whole wedding party, see [wedding color palette](/blog/palette-couleurs-mariage) and [wedding dress: silhouette, fittings, timing](/blog/robe-de-mariee-guide-choisir).",
        ],
      },
    ],
  }),

  postPair({
    slug: "coiffure-maquillage-mariage-essai",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Coiffure et maquillage : pourquoi l'essai change tout",
    titleEn: "Hair and makeup: why the trial run changes everything",
    excerptFr:
      "L'essai coiffure-maquillage évite les mauvaises surprises le jour J : quand le réserver, quoi tester, et comment juger le résultat sur photo.",
    excerptEn:
      "A hair and makeup trial prevents day-of surprises: when to book it, what to test, and how to judge the result in photos.",
    readingMinutes: 6,
    heroAltFr: "Essai coiffure de mariée en institut",
    heroAltEn: "Bridal hair trial at a salon",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Beaucoup de mariées réservent leur coiffeur ou maquilleur sans essai préalable, pour découvrir le résultat final le matin même du mariage. C'est le pari le plus risqué de toute la préparation : contrairement à une robe qu'on peut retoucher, une coiffure ou un maquillage raté le jour J ne se corrige pas en une heure.",
          "L'essai n'est pas un luxe optionnel, c'est la seule façon de vérifier que le résultat tient la journée, passe bien en photo, et correspond réellement à ce que vous aviez en tête.",
        ],
      },
      {
        type: "text",
        title: "Quand le réserver",
        paragraphs: [
          "L'idéal est de faire l'essai 6 à 8 semaines avant le mariage, une fois la robe et le voile choisis (la coiffure doit s'accorder avec l'encolure et les accessoires). Trop tôt, vous risquez de changer d'avis d'ici le jour J ; trop tard, il ne reste plus de marge pour ajuster ou changer de prestataire en cas de déception.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'il faut tester pendant l'essai",
        items: [
          "La tenue dans la durée : demandez de garder la coiffure plusieurs heures, pas seulement le temps du rendez-vous",
          "La résistance à la météo prévue (chaleur, humidité, pluie légère) si la cérémonie est en extérieur",
          "Le rendu photo avec flash et en lumière naturelle, pas seulement à l'œil nu",
          "La compatibilité avec les accessoires (voile, peigne, bijoux de tête) déjà choisis",
          "Le confort réel : une coiffure trop tirée ou un maquillage trop lourd se remarquent après plusieurs heures",
        ],
      },
      {
        type: "text",
        title: "Juger sur photo, pas seulement dans le miroir",
        paragraphs: [
          "Le maquillage de mariage doit souvent être plus marqué qu'au quotidien pour ne pas disparaître sous les flashs et l'éclairage de la salle. Prenez des photos avec votre téléphone pendant l'essai, dans plusieurs conditions de lumière, et montrez-les à votre photographe si possible : c'est lui qui capturera le résultat final.",
        ],
      },
      {
        type: "list",
        title: "Budget à prévoir",
        items: [
          "Essai coiffure ou maquillage : 50 à 120 € selon le prestataire, souvent déductible de la prestation jour J",
          "Prestation jour J (coiffure + maquillage mariée) : 150 à 400 € selon la région et le déplacement",
          "Retouche maquillage en cours de journée (kit ou repassage du prestataire) : à prévoir en option",
          "Déplacement du prestataire sur le lieu de la cérémonie : souvent facturé en supplément",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Si vous hésitez entre deux prestataires, faites un essai chez chacun plutôt que de choisir uniquement sur un book Instagram : le rendu en vrai, sur votre visage et vos cheveux, peut surprendre dans un sens comme dans l'autre.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Placez le rendez-vous d'essai dans votre [rétroplanning mariage mois par mois](/blog/retroplanning-mariage-mois-par-mois) et suivez l'acompte du prestataire dans le [simulateur budget](/tools/budget-calculator). Pour compléter le look, voir [accessoires de la mariée](/blog/accessoires-mariee-voile-bijoux) et [robe de mariée](/blog/robe-de-mariee-guide-choisir).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Many brides book their hairstylist or makeup artist without a trial, and discover the final result on the morning of the wedding. It is the riskiest bet in the whole preparation: unlike a dress that can be altered, a bad hair or makeup result on the day cannot be fixed in an hour.",
          "The trial is not an optional luxury. It is the only way to check the result holds up through the day, reads well in photos, and actually matches what you had in mind.",
        ],
      },
      {
        type: "text",
        title: "When to book it",
        paragraphs: [
          "Ideally the trial happens 6 to 8 weeks before the wedding, once the dress and veil are chosen (the hairstyle has to work with the neckline and accessories). Too early, and you risk changing your mind before the day; too late, and there is no room left to adjust or switch vendors if you are disappointed.",
        ],
      },
      {
        type: "list",
        title: "What to test during the trial",
        items: [
          "How it holds up over time: ask to keep the style for several hours, not just the length of the appointment",
          "Resistance to the expected weather (heat, humidity, light rain) if the ceremony is outdoors",
          "How it photographs with flash and in natural light, not just how it looks to the naked eye",
          "Compatibility with accessories (veil, comb, hair jewelry) already chosen",
          "Actual comfort: a style pulled too tight or makeup applied too heavily shows after several hours",
        ],
      },
      {
        type: "text",
        title: "Judge it in photos, not just the mirror",
        paragraphs: [
          "Wedding makeup often needs to be more defined than everyday makeup so it does not wash out under flash and venue lighting. Take phone photos during the trial, in several light conditions, and show them to your photographer if possible: they are the one who will capture the final result.",
        ],
      },
      {
        type: "list",
        title: "Budget to plan for",
        items: [
          "Hair or makeup trial: €50 to €120 depending on the vendor, often deducted from the day-of fee",
          "Day-of service (bridal hair plus makeup): €150 to €400 depending on region and travel",
          "Mid-day touch-up (kit or vendor return visit): plan as an optional add-on",
          "Vendor travel to the ceremony venue: usually billed separately",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "If you are torn between two vendors, do a trial with each rather than choosing from an Instagram portfolio alone: the real result, on your own face and hair, can surprise you in either direction.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Slot the trial appointment into your [month-by-month wedding timeline](/blog/retroplanning-mariage-mois-par-mois) and track the vendor deposit in the [budget calculator](/tools/budget-calculator). To round out the look, see [bridal accessories](/blog/accessoires-mariee-voile-bijoux) and [wedding dress](/blog/robe-de-mariee-guide-choisir).",
        ],
      },
    ],
  }),

  postPair({
    slug: "accessoires-mariee-voile-bijoux",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Accessoires de la mariée : voile, bijoux, chaussures",
    titleEn: "Bridal accessories: veil, jewelry, shoes",
    excerptFr:
      "Comment choisir des accessoires confortables toute la journée, cohérents avec la robe, et dans quel ordre les acheter.",
    excerptEn:
      "How to pick accessories that stay comfortable all day, coherent with the dress, and in what order to buy them.",
    readingMinutes: 6,
    heroAltFr: "Accessoires de mariée posés sur une table, voile et bijoux",
    heroAltEn: "Bridal accessories laid out on a table, veil and jewelry",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les accessoires sont souvent achetés dans la précipitation, après la robe, alors qu'ils conditionnent le confort de toute la journée : des chaussures inadaptées ou un voile trop lourd se remarquent bien plus vite qu'une coupe de robe imparfaite. Les traiter comme une catégorie à part, avec son propre budget et son propre calendrier, évite les achats de dernière minute.",
        ],
      },
      {
        type: "list",
        title: "Le voile",
        items: [
          "Longueur courte (coude) : pratique pour danser, adapté à une coiffure basse",
          "Longueur cathédrale : effet le plus spectaculaire en photo, demande de l'aide pour se déplacer",
          "Matière : le tulle souple tombe mieux en extérieur, l'organza structuré tient mieux en intérieur",
          "À essayer avec la coiffure définitive, pas seulement avec la robe : la fixation change le rendu",
        ],
      },
      {
        type: "list",
        title: "Les bijoux",
        items: [
          "Collier : dépend directement de l'encolure de la robe, à choisir après la robe, jamais avant",
          "Boucles d'oreilles : souvent la seule pièce visible sous le voile de face, un bon poste où investir",
          "Bracelet : à éviter s'il gêne l'échange des alliances ou la tenue du bouquet",
          "Cohérence de métal (or, argent, doré) entre bijoux, alliances et boucle de ceinture si la robe en a une",
        ],
      },
      {
        type: "text",
        title: "Les chaussures : le poste le plus sous-estimé",
        paragraphs: [
          "Une mariée reste debout et marche pendant 8 à 12 heures. Les chaussures neuves et jamais portées sont la cause la plus fréquente d'inconfort en fin de soirée. Prévoyez de les porter chez vous plusieurs fois avant le mariage pour les assouplir, et gardez une paire de rechange plate ou des chaussons pour la soirée dansante.",
        ],
      },
      {
        type: "text",
        title: "Dans quel ordre acheter",
        paragraphs: [
          "Robe d'abord, puis chaussures (la hauteur du talon influence l'ourlet final), puis voile et coiffure assortis, puis bijoux en dernier. Acheter dans le sens inverse oblige souvent à recommencer un poste entier une fois la robe reçue.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Gardez systématiquement le ticket ou la possibilité de retour sur les accessoires achetés en avance : une couleur ou une taille peut ne plus convenir une fois la robe essayée avec.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Regroupez robe, accessoires et retouches dans une seule catégorie du [simulateur budget](/tools/budget-calculator) pour garder une vue d'ensemble. Voir aussi [robe de mariée : silhouette, essayages, délais](/blog/robe-de-mariee-guide-choisir) et [choisir ses alliances](/blog/choisir-alliances-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Accessories are often bought in a rush after the dress, even though they shape how comfortable the whole day feels: ill-fitting shoes or a veil that is too heavy get noticed far faster than an imperfect dress cut. Treating them as their own category, with their own budget and timeline, avoids last-minute purchases.",
        ],
      },
      {
        type: "list",
        title: "The veil",
        items: [
          "Elbow length: practical for dancing, suits a low updo",
          "Cathedral length: the most dramatic effect in photos, needs help moving around",
          "Fabric: soft tulle drapes better outdoors, structured organza holds shape better indoors",
          "Try it with the final hairstyle, not just the dress: how it is pinned changes the effect",
        ],
      },
      {
        type: "list",
        title: "Jewelry",
        items: [
          "Necklace: depends directly on the dress neckline, choose it after the dress, never before",
          "Earrings: often the only visible piece under a front veil, a good line to invest in",
          "Bracelet: avoid one that gets in the way of exchanging rings or holding the bouquet",
          "Metal coherence (gold, silver, rose gold) across jewelry, rings, and belt buckle if the dress has one",
        ],
      },
      {
        type: "text",
        title: "Shoes: the most underrated line item",
        paragraphs: [
          "A bride stands and walks for 8 to 12 hours. Brand-new, never-worn shoes are the most common cause of late-evening discomfort. Plan to wear them at home several times before the wedding to break them in, and keep a flat backup pair or slippers for the dance floor.",
        ],
      },
      {
        type: "text",
        title: "What order to buy in",
        paragraphs: [
          "Dress first, then shoes (heel height affects the final hem), then a matching veil and hairstyle, then jewelry last. Buying in the reverse order often means redoing an entire line once the dress arrives.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always keep the receipt or a return option on accessories bought ahead of time: a color or size can stop working once you try it with the actual dress.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Group dress, accessories, and alterations into one category in the [budget calculator](/tools/budget-calculator) to keep the overview clear. See also [wedding dress: silhouette, fittings, timing](/blog/robe-de-mariee-guide-choisir) and [choosing your wedding rings](/blog/choisir-alliances-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "voyage-de-noces-organiser-budget",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Voyage de noces : quand réserver, comment budgéter",
    titleEn: "Honeymoon: when to book, how to budget",
    excerptFr:
      "Partir juste après le mariage ou décaler le voyage, cagnotte lune de miel plutôt que liste de cadeaux classique, et budget à isoler du reste.",
    excerptEn:
      "Leaving right after the wedding or delaying the trip, a honeymoon fund instead of a classic gift registry, and a budget kept separate from the rest.",
    readingMinutes: 6,
    heroAltFr: "Valise et billets d'avion préparés pour un voyage de noces",
    heroAltEn: "Suitcase and plane tickets ready for a honeymoon",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le voyage de noces est souvent planifié en dernier, une fois toute l'énergie déjà consacrée au mariage lui-même. C'est aussi pour cette raison qu'il finit parfois improvisé ou reporté sans date précise. Le traiter comme un projet à part, avec son propre budget et son propre calendrier de réservation, évite ce piège.",
        ],
      },
      {
        type: "text",
        title: "Partir tout de suite ou décaler",
        paragraphs: [
          "Partir dans les jours qui suivent le mariage a un avantage logistique (les congés sont déjà posés) mais laisse peu de temps pour souffler après l'organisation. Décaler le voyage de quelques semaines à quelques mois permet de profiter de tarifs hors saison et d'un vrai temps de repos, au prix d'une deuxième coordination de congés.",
        ],
      },
      {
        type: "list",
        title: "Délais de réservation à connaître",
        items: [
          "Vols longs courriers : les meilleurs tarifs se trouvent souvent 4 à 6 mois à l'avance",
          "Hôtels et resorts en haute saison : à réserver dès que la destination est fixée, certains complets 6 mois avant",
          "Visa ou formalités d'entrée selon la destination : à vérifier au moins 2 mois avant le départ",
          "Assurance voyage et annulation : à souscrire au moment de la réservation, pas juste avant de partir",
        ],
      },
      {
        type: "text",
        title: "La cagnotte lune de miel",
        paragraphs: [
          "De plus en plus de couples remplacent tout ou partie de la liste de cadeaux classique par une cagnotte dédiée au voyage de noces, en particulier quand ils vivent déjà ensemble et n'ont pas besoin d'équipement pour la maison. C'est une option à annoncer clairement sur la page de mariage ou le faire-part pour éviter toute ambiguïté auprès des invités.",
        ],
      },
      {
        type: "list",
        title: "Séparer le budget voyage du budget mariage",
        items: [
          "Ouvrez une ligne de budget distincte dès le départ, avec sa propre estimation",
          "Ne piochez pas dans la réserve imprévus du mariage pour financer le voyage",
          "Comptez vols, hébergement, activités, restauration et une marge de 10 à 15 % pour les imprévus sur place",
          "Si la cagnotte finance le voyage, attendez d'avoir une estimation réaliste des dons avant de réserver le haut de gamme",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Évitez de programmer un vol tôt le lendemain du mariage : entre la fatigue de la soirée et le rangement du lendemain, une nuit ou deux de battement avant le grand départ change beaucoup de choses.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Créez une ligne « voyage de noces » séparée dans le [simulateur budget](/tools/budget-calculator) pour ne pas la confondre avec le budget mariage, et suivez les dons cagnotte si vous en ouvrez une. Voir aussi [budget mariage 2026 : combien prévoir](/blog/budget-mariage-2026-combien-prevoir) et [liste de cadeaux de mariage](/blog/liste-cadeaux-mariage-guide).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The honeymoon is often planned last, once all the energy has already gone into the wedding itself. That is exactly why it sometimes ends up improvised or postponed with no firm date. Treating it as its own project, with its own budget and its own booking calendar, avoids that trap.",
        ],
      },
      {
        type: "text",
        title: "Leaving right away or delaying",
        paragraphs: [
          "Leaving in the days right after the wedding has a logistical upside (time off is already booked) but leaves little room to breathe after the planning stretch. Delaying the trip by a few weeks to a few months lets you catch off-season rates and get real rest, at the cost of coordinating time off a second time.",
        ],
      },
      {
        type: "list",
        title: "Booking lead times to know",
        items: [
          "Long-haul flights: the best fares often show up 4 to 6 months ahead",
          "Peak-season hotels and resorts: book as soon as the destination is fixed, some sell out 6 months out",
          "Visa or entry requirements depending on destination: check at least 2 months before departure",
          "Travel and cancellation insurance: buy it when you book, not right before leaving",
        ],
      },
      {
        type: "text",
        title: "The honeymoon fund",
        paragraphs: [
          "More and more couples replace all or part of the classic gift registry with a fund dedicated to the honeymoon, especially when they already live together and do not need home equipment. It is worth stating clearly on the wedding page or invitation to avoid any ambiguity for guests.",
        ],
      },
      {
        type: "list",
        title: "Keep the trip budget separate from the wedding budget",
        items: [
          "Open a separate budget line from the start, with its own estimate",
          "Do not dip into the wedding's contingency reserve to fund the trip",
          "Count flights, lodging, activities, meals, and a 10 to 15 percent buffer for on-site surprises",
          "If a fund is financing the trip, wait for a realistic estimate of contributions before booking anything high-end",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Avoid an early flight the morning right after the wedding: between evening fatigue and next-day cleanup, a night or two of buffer before departure changes a lot.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Create a separate \"honeymoon\" line in the [budget calculator](/tools/budget-calculator) so it does not blend into the wedding budget, and track fund contributions if you open one. See also [wedding budget 2026: how much to plan](/blog/budget-mariage-2026-combien-prevoir) and [wedding gift registry guide](/blog/liste-cadeaux-mariage-guide).",
        ],
      },
    ],
  }),

  postPair({
    slug: "evjf-organiser-guide",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "EVJF : organiser sans stresser la future mariée",
    titleEn: "Bachelorette party: planning without stressing out the bride",
    excerptFr:
      "Qui organise, comment répartir le budget entre invitées, quand le placer dans le calendrier, et surprise ou pas surprise.",
    excerptEn:
      "Who plans it, how to split the budget among guests, when to place it on the calendar, and surprise or no surprise.",
    readingMinutes: 6,
    heroAltFr: "Groupe d'amies célébrant un enterrement de vie de jeune fille",
    heroAltEn: "Group of friends celebrating a bachelorette party",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "L'EVJF est censé être un moment léger pour la future mariée, mais il devient parfois une source de tension entre les invitées qui l'organisent : budget déséquilibré, dates qui ne conviennent à personne, activité imposée sans consultation. Poser quelques règles simples au départ évite l'essentiel des frictions.",
        ],
      },
      {
        type: "text",
        title: "Qui organise, en général",
        paragraphs: [
          "L'organisation revient traditionnellement à la témoin principale ou à un petit groupe de proches, mais rien n'oblige à ce schéma. Ce qui compte est de désigner un point de contact unique pour les réservations et les paiements, afin d'éviter que chacune gère sa part séparément et que les comptes deviennent illisibles.",
        ],
      },
      {
        type: "list",
        title: "Répartir le budget entre invitées",
        items: [
          "Fixez un budget indicatif dès l'invitation, avant que les activités ne soient réservées",
          "Séparez toujours la part de la future mariée (souvent offerte) de celle des invitées",
          "Prévoyez une option à budget réduit pour les invitées qui ne peuvent pas suivre le montant total",
          "Utilisez une cagnotte commune pour les postes partagés (hébergement, repas) plutôt que des règlements dispersés",
        ],
      },
      {
        type: "text",
        title: "Quand le placer dans le calendrier",
        paragraphs: [
          "L'EVJF se déroule généralement 1 à 3 mois avant le mariage, jamais dans la dernière semaine : la future mariée a besoin d'énergie pour les derniers préparatifs et ne devrait pas partir en week-end la veille des essayages finaux ou des rendez-vous prestataires de dernière minute.",
        ],
      },
      {
        type: "text",
        title: "Surprise ou concertation",
        paragraphs: [
          "Une surprise totale peut mal tomber si la future mariée a des contraintes non partagées (santé, budget, disponibilité, activité qu'elle redoute). À l'inverse, tout décider avec elle enlève une partie du plaisir de la surprise. Un bon compromis consiste à la consulter sur le type d'ambiance souhaitée (calme, festive, sportive) et à garder le détail des activités secret.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Si le groupe est large ou dispersé géographiquement, un message de groupe dédié avec toutes les informations pratiques (dates, budget, lieu, ce qu'il faut apporter) évite les questions répétées et les malentendus.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "L'EVJF a son propre budget, distinct du budget mariage : suivez-le à part pour ne pas fausser vos totaux dans le [simulateur budget](/tools/budget-calculator). Voir aussi l'équivalent côté marié, [EVG : idées, budget et logistique](/blog/evg-organiser-guide).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A bachelorette party is meant to be a lighthearted moment for the bride, but it sometimes turns into a source of tension among the friends organizing it: an unbalanced budget, dates that work for no one, an activity imposed without consultation. Setting a few simple rules early avoids most of the friction.",
        ],
      },
      {
        type: "text",
        title: "Who usually organizes it",
        paragraphs: [
          "Organizing traditionally falls to the maid of honor or a small group of close friends, but nothing forces that pattern. What matters is naming a single point of contact for bookings and payments, so people are not each managing their own share separately and the numbers do not become unreadable.",
        ],
      },
      {
        type: "list",
        title: "Splitting the budget among guests",
        items: [
          "Set an indicative budget at the invitation stage, before activities get booked",
          "Always separate the bride's share (often covered for her) from the guests' share",
          "Offer a lower-budget option for guests who cannot follow the full amount",
          "Use a shared fund for common costs (lodging, meals) rather than scattered individual payments",
        ],
      },
      {
        type: "text",
        title: "When to place it on the calendar",
        paragraphs: [
          "A bachelorette party usually happens 1 to 3 months before the wedding, never in the final week: the bride needs energy for last-minute preparations and should not be heading off for a weekend right before final fittings or last vendor appointments.",
        ],
      },
      {
        type: "text",
        title: "Surprise or joint planning",
        paragraphs: [
          "A total surprise can backfire if the bride has unshared constraints (health, budget, availability, an activity she dreads). On the other hand, deciding everything with her removes part of the fun of the surprise. A good compromise is to ask her about the type of vibe she wants (relaxed, festive, active) and keep the activity details secret.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "If the group is large or spread out, a dedicated group message with all the practical details (dates, budget, location, what to bring) avoids repeated questions and misunderstandings.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "A bachelorette party has its own budget, separate from the wedding budget: track it apart so it does not skew your totals in the [budget calculator](/tools/budget-calculator). See also the groom's side equivalent, [bachelor party: ideas, budget, and logistics](/blog/evg-organiser-guide).",
        ],
      },
    ],
  }),

  postPair({
    slug: "evg-organiser-guide",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "EVG : idées, budget et logistique",
    titleEn: "Bachelor party: ideas, budget, and logistics",
    excerptFr:
      "Idées d'activités selon le budget et le groupe, comment fixer une enveloppe claire, et éviter les excès de dernière minute avant le mariage.",
    excerptEn:
      "Activity ideas by budget and group size, how to set a clear budget envelope, and avoiding last-minute excess before the wedding.",
    readingMinutes: 6,
    heroAltFr: "Groupe d'amis célébrant un enterrement de vie de garçon",
    heroAltEn: "Group of friends celebrating a bachelor party",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "L'EVG suit globalement la même logique que l'EVJF : un organisateur clairement identifié, un budget annoncé dès l'invitation, et une date placée loin de la ligne d'arrivée du mariage. Ce qui change surtout, ce sont les formats d'activités habituellement choisis et le risque d'excès qui revient plus souvent dans les récits.",
        ],
      },
      {
        type: "list",
        title: "Idées d'activités selon le budget",
        items: [
          "Petit budget (moins de 100 € par personne) : week-end camping, tournoi sportif, soirée jeux et repas préparé ensemble",
          "Budget intermédiaire (100 à 250 €) : activité sensation (karting, escape game, paintball) suivie d'une soirée",
          "Budget plus élevé (250 € et plus) : week-end à l'étranger, sport extrême encadré, location d'un lieu dédié",
          "Toujours prévoir une option repas ou activité alternative pour les invités à budget plus serré",
        ],
      },
      {
        type: "text",
        title: "Fixer une enveloppe claire",
        paragraphs: [
          "Annoncez un montant maximum dès le message d'invitation, avant que les activités ne soient réservées, et précisez ce qu'il couvre exactement (hébergement, activités, repas) et ce qui reste à la charge de chacun (transport, boissons annexes). Un budget flou est la première cause de désistements tardifs.",
        ],
      },
      {
        type: "text",
        title: "Le bon moment dans le calendrier",
        paragraphs: [
          "Comme pour l'EVJF, placez l'EVG 1 à 3 mois avant le mariage, jamais dans la semaine qui précède. Un lendemain de fête difficile ou une blessure sportive tombant juste avant le jour J n'est pas un scénario théorique : c'est l'une des raisons les plus fréquentes de report de dernière minute dans les récits de couples.",
        ],
      },
      {
        type: "list",
        title: "Éviter les excès qui débordent sur le mariage",
        items: [
          "Cadrez les activités à risque (sports extrêmes, consommation d'alcool) avec une marge de sécurité avant le jour J",
          "Évitez les paris ou gages qui pourraient créer une gêne pendant le mariage lui-même",
          "Prévenez le marié en amont si une surprise implique un déplacement ou une contrainte physique",
          "Gardez une trace écrite des réservations et paiements pour éviter les malentendus après coup",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Si le marié préfère un format simple (repas entre amis, sortie d'une soirée) plutôt qu'un grand week-end, ce choix est parfaitement valable : l'EVG n'a pas à suivre un modèle standard pour être réussi.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Suivez le budget EVG à part du budget mariage dans le [simulateur budget](/tools/budget-calculator), pour garder une vision claire des deux enveloppes. Voir aussi l'équivalent côté mariée, [EVJF : organiser sans stresser la future mariée](/blog/evjf-organiser-guide).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A bachelor party broadly follows the same logic as a bachelorette party: a clearly identified organizer, a budget stated at the invitation, and a date placed well away from the wedding finish line. What mainly changes is the typical activity format and a slightly higher recurring risk of overdoing it.",
        ],
      },
      {
        type: "list",
        title: "Activity ideas by budget",
        items: [
          "Low budget (under €100 per person): camping weekend, sports tournament, games night with a shared meal",
          "Mid budget (€100 to €250): a thrill activity (karting, escape room, paintball) followed by an evening out",
          "Higher budget (€250 and up): a weekend abroad, a guided extreme sport, renting a dedicated venue",
          "Always offer a meal or alternative activity option for guests on a tighter budget",
        ],
      },
      {
        type: "text",
        title: "Setting a clear budget envelope",
        paragraphs: [
          "State a maximum amount in the invitation message before activities are booked, and specify exactly what it covers (lodging, activities, meals) versus what stays each person's own cost (transport, extra drinks). A vague budget is the top cause of late drop-outs.",
        ],
      },
      {
        type: "text",
        title: "The right timing on the calendar",
        paragraphs: [
          "Like the bachelorette party, place it 1 to 3 months before the wedding, never in the final week. A rough morning after or a sports injury right before the big day is not a theoretical scenario: it is one of the most common reasons for a last-minute scramble in couples' accounts.",
        ],
      },
      {
        type: "list",
        title: "Avoiding excess that spills into the wedding",
        items: [
          "Give risky activities (extreme sports, drinking) a safety buffer before the wedding day",
          "Avoid dares or bets that could create awkwardness during the wedding itself",
          "Give the groom a heads-up ahead of time if a surprise involves travel or physical strain",
          "Keep a written record of bookings and payments to avoid misunderstandings afterward",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "If the groom prefers something simple (a dinner among friends, one night out) over a big weekend, that choice is perfectly valid: a bachelor party does not need to follow a standard template to be a success.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Track the bachelor party budget separately from the wedding budget in the [budget calculator](/tools/budget-calculator), so you keep a clear view of both envelopes. See also the bride's side equivalent, [bachelorette party: planning without stressing out the bride](/blog/evjf-organiser-guide).",
        ],
      },
    ],
  }),

  postPair({
    slug: "degustation-traiteur-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Dégustation traiteur : préparer et décider",
    titleEn: "Caterer tasting: how to prepare and decide",
    excerptFr:
      "Ce qu'il faut évaluer au-delà du goût, les questions à poser sur le service et les allergènes, et comment trancher à deux sans se disperser.",
    excerptEn:
      "What to evaluate beyond taste, the questions to ask about service and allergens, and how to decide as a couple without getting scattered.",
    readingMinutes: 6,
    heroAltFr: "Dégustation de plats de traiteur pour un mariage",
    heroAltEn: "Caterer tasting session for a wedding",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La dégustation traiteur est souvent vécue comme un moment purement gourmand, alors que c'est aussi la dernière occasion de vérifier des points qui pèseront lourd le jour J : rythme du service, gestion des allergies, présentation réelle des plats. Y aller avec une grille d'observation, même informelle, change la qualité de la décision.",
        ],
      },
      {
        type: "list",
        title: "Au-delà du goût, ce qu'il faut observer",
        items: [
          "La présentation des assiettes : ressemble-t-elle à ce qui sera servi à 100+ invités, ou est-ce une version soignée pour l'occasion ?",
          "Le rythme annoncé du service (temps entre chaque plat) pour estimer la durée réelle du repas",
          "La température de service, en particulier pour les plats chauds servis en nombre",
          "La flexibilité sur les portions et les menus enfants",
        ],
      },
      {
        type: "list",
        title: "Questions à poser sur les allergènes",
        items: [
          "Comment sont identifiés les plats sans gluten, sans lactose, végétariens ou végans dans le menu final ?",
          "Existe-t-il un risque de contamination croisée en cuisine pour les allergies sévères ?",
          "Le service en salle est-il informé des besoins spécifiques par table ou par invité ?",
          "Un menu de secours est-il prévu si un invité signale une allergie tardivement ?",
        ],
      },
      {
        type: "text",
        title: "Décider à deux sans se disperser",
        paragraphs: [
          "Notez vos impressions séparément pendant la dégustation avant d'en discuter, pour éviter que l'un influence l'autre plat par plat. Comparez ensuite sur trois critères simples : le goût, le rapport avec le budget annoncé, et la confiance ressentie envers l'équipe (réactivité, clarté des réponses).",
        ],
      },
      {
        type: "list",
        title: "Ce qu'il faut vérifier dans le devis final",
        items: [
          "Le nombre de plats et de bouchées inclus correspond bien à ce qui a été dégusté",
          "Les boissons (vin, champagne, softs) sont-elles incluses ou facturées à part",
          "Le service (personnel, nappage, vaisselle) est-il détaillé ou à négocier séparément",
          "Les conditions d'annulation ou de modification du nombre de couverts",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Si vous hésitez entre deux traiteurs, redemandez une dégustation ciblée uniquement sur les plats qui posent question plutôt que de refaire l'intégralité du menu : c'est plus rapide et souvent accepté sans frais supplémentaires.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Utilisez le [comparateur de devis traiteur](/blog/comparer-devis-traiteur-mariage) pour mettre les propositions côte à côte avant la dégustation, et suivez les acomptes dans le [simulateur budget](/tools/budget-calculator). Pour le dessert, voir [gâteau vs pièce montée : choisir et budgéter](/blog/gateau-piece-montee-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A caterer tasting is often treated as a purely enjoyable moment, when it is also the last chance to check things that matter a lot on the day: service pace, allergy handling, how dishes actually look when plated. Going in with an observation checklist, even an informal one, changes the quality of the decision.",
        ],
      },
      {
        type: "list",
        title: "What to observe beyond taste",
        items: [
          "Plating: does it match what will actually be served to 100+ guests, or is this a polished one-off version?",
          "The announced service pace (time between courses) to estimate the real length of the meal",
          "Serving temperature, especially for hot dishes served in volume",
          "Flexibility on portion sizes and kids' menus",
        ],
      },
      {
        type: "list",
        title: "Questions to ask about allergens",
        items: [
          "How are gluten-free, dairy-free, vegetarian, or vegan dishes flagged on the final menu?",
          "Is there a cross-contamination risk in the kitchen for severe allergies?",
          "Is the floor staff briefed on specific needs per table or per guest?",
          "Is a backup dish available if a guest reports an allergy late?",
        ],
      },
      {
        type: "text",
        title: "Deciding as a couple without scattering",
        paragraphs: [
          "Note your impressions separately during the tasting before discussing them, so one of you does not sway the other dish by dish. Then compare on three simple criteria: taste, fit with the stated budget, and how much confidence you feel in the team (responsiveness, clarity of answers).",
        ],
      },
      {
        type: "list",
        title: "What to check in the final quote",
        items: [
          "The number of courses and canapes included matches what was actually tasted",
          "Whether drinks (wine, champagne, soft drinks) are included or billed separately",
          "Whether service (staff, table linens, tableware) is itemized or negotiated separately",
          "Cancellation or headcount-change terms",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "If you are torn between two caterers, ask for a focused tasting on just the dishes in question rather than redoing the whole menu: it is faster and usually accepted at no extra cost.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Use the [caterer quote comparator](/blog/comparer-devis-traiteur-mariage) to line up proposals before the tasting, and track deposits in the [budget calculator](/tools/budget-calculator). For dessert, see [cake vs croquembouche: choosing and budgeting](/blog/gateau-piece-montee-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "gateau-piece-montee-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Gâteau vs pièce montée : choisir et budgéter",
    titleEn: "Cake vs croquembouche: choosing and budgeting",
    excerptFr:
      "Pièce montée à la française ou wedding cake à étages : quantités par invité, budget selon le format, et délai de commande.",
    excerptEn:
      "French-style croquembouche or a layered wedding cake: quantities per guest, budget by format, and order lead time.",
    readingMinutes: 5,
    heroAltFr: "Pièce montée traditionnelle de mariage français",
    heroAltEn: "Traditional French croquembouche wedding cake",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En France, le dessert de mariage se joue souvent entre deux traditions : la pièce montée en choux, symbole des mariages français, et le wedding cake à étages, popularisé par les mariages anglo-saxons et de plus en plus présent. Le choix dépend surtout du nombre d'invités, du style visuel recherché et du budget disponible.",
        ],
      },
      {
        type: "list",
        title: "Pièce montée en choux",
        items: [
          "Format traditionnel, souvent nappé de caramel ou de nougatine, personnalisable en hauteur et en décor",
          "Quantité : compter 3 à 5 choux par invité selon le reste du repas et les autres desserts prévus",
          "Budget : environ 4 à 8 € par personne selon le pâtissier et les parfums choisis",
          "Peut être découpée et servie facilement à un grand nombre d'invités",
        ],
      },
      {
        type: "list",
        title: "Wedding cake à étages",
        items: [
          "Effet visuel fort, souvent utilisé comme pièce de décoration en plus du dessert",
          "Quantité : une part standard par invité, mais attention aux étages purement décoratifs (non comestibles)",
          "Budget : généralement plus élevé, 6 à 12 € par personne selon la complexité du décor",
          "Demande une conservation et un transport plus délicats que la pièce montée",
        ],
      },
      {
        type: "text",
        title: "Combiner les deux formats",
        paragraphs: [
          "Certains couples optent pour un petit wedding cake à découper devant les invités pour la photo symbolique, complété par une pièce montée ou un buffet de desserts pour le service réel. Cette formule augmente légèrement le budget mais résout le compromis esthétique contre praticité.",
        ],
      },
      {
        type: "text",
        title: "Délai de commande",
        paragraphs: [
          "Comptez 3 à 4 mois pour réserver un pâtissier reconnu, davantage en haute saison (mai à septembre). Le nombre définitif d'invités doit généralement être confirmé 2 à 3 semaines avant le mariage, avec une marge possible pour les derniers ajustements.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Demandez toujours une dégustation avant de commander, même pour une pièce montée traditionnelle : le parfum de la crème pâtissière ou du caramel varie beaucoup d'un pâtissier à l'autre.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Ajoutez la ligne dessert au [simulateur budget](/tools/budget-calculator) en fonction du nombre d'invités confirmés, et coordonnez la commande avec la [dégustation traiteur](/blog/degustation-traiteur-mariage) si le pâtissier travaille avec le même prestataire.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In France, wedding dessert usually comes down to two traditions: the choux-pastry croquembouche, a symbol of French weddings, and the layered wedding cake popularized by Anglo-Saxon weddings and increasingly common. The choice mostly comes down to guest count, the visual style you want, and available budget.",
        ],
      },
      {
        type: "list",
        title: "Choux-pastry croquembouche",
        items: [
          "Traditional format, often coated in caramel or nougatine, customizable in height and decoration",
          "Quantity: plan 3 to 5 choux per guest depending on the rest of the meal and other planned desserts",
          "Budget: roughly €4 to €8 per person depending on the pastry chef and chosen flavors",
          "Easy to cut and serve to a large number of guests",
        ],
      },
      {
        type: "list",
        title: "Layered wedding cake",
        items: [
          "Strong visual effect, often used as a decor piece in addition to being dessert",
          "Quantity: one standard slice per guest, but watch for purely decorative (non-edible) tiers",
          "Budget: generally higher, €6 to €12 per person depending on decoration complexity",
          "Needs more careful storage and transport than a croquembouche",
        ],
      },
      {
        type: "text",
        title: "Combining both formats",
        paragraphs: [
          "Some couples choose a small wedding cake to cut in front of guests for the symbolic photo, backed up by a croquembouche or dessert buffet for actual serving. This adds a little to the budget but solves the trade-off between looks and practicality.",
        ],
      },
      {
        type: "text",
        title: "Order lead time",
        paragraphs: [
          "Plan on 3 to 4 months to book a well-regarded pastry chef, more in peak season (May to September). The final guest count usually needs to be confirmed 2 to 3 weeks before the wedding, with some room for last adjustments.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always ask for a tasting before ordering, even for a traditional croquembouche: the flavor of the pastry cream or caramel varies a lot from one pastry chef to another.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Add the dessert line to the [budget calculator](/tools/budget-calculator) based on confirmed guest count, and coordinate the order with your [caterer tasting](/blog/degustation-traiteur-mariage) if the pastry chef works with the same vendor.",
        ],
      },
    ],
  }),

  postPair({
    slug: "vin-honneur-cocktail-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Vin d'honneur et cocktail : durée, quantités, animations",
    titleEn: "Cocktail hour: duration, quantities, entertainment",
    excerptFr:
      "Combien de temps doit durer le vin d'honneur, quelles quantités de boissons et bouchées prévoir par invité, et comment occuper les invités pendant les photos.",
    excerptEn:
      "How long the cocktail hour should last, how much to plan in drinks and canapes per guest, and how to keep guests entertained during photos.",
    readingMinutes: 6,
    heroAltFr: "Vin d'honneur de mariage avec invités et bouchées",
    heroAltEn: "Wedding cocktail hour with guests and canapes",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le vin d'honneur est le moment charnière entre la cérémonie et le repas : c'est là que les invités se détendent, se mélangent, et que les mariés partent souvent faire les photos officielles. Mal calibré, il traîne en longueur ou se termine trop vite avant que le repas ne soit prêt.",
        ],
      },
      {
        type: "text",
        title: "Combien de temps prévoir",
        paragraphs: [
          "Une durée de 1h30 à 2h30 est généralement le bon repère : assez pour digérer la cérémonie, faire les photos de groupe et laisser les invités socialiser, sans les laisser trop longtemps sans repas. Au-delà de 3 heures, la fatigue et la faim commencent à se faire sentir, surtout pour les enfants et les personnes âgées.",
        ],
      },
      {
        type: "list",
        title: "Quantités de boissons par invité",
        items: [
          "Compter 3 à 4 verres par personne sur toute la durée du vin d'honneur",
          "Pour du champagne ou du vin mousseux : environ une demi-bouteille par invité",
          "Toujours prévoir une option sans alcool en quantité équivalente, pas juste symbolique",
          "Prévoir de l'eau en libre accès en plus des boissons servies",
        ],
      },
      {
        type: "list",
        title: "Quantités de bouchées par invité",
        items: [
          "6 à 10 pièces salées par personne si le vin d'honneur précède un repas complet",
          "Davantage (10 à 15 pièces) si le vin d'honneur remplace en partie un service de plats",
          "Varier les textures et les températures (chaud, froid, sucré-salé) plutôt que de multiplier les recettes similaires",
          "Signaler clairement les bouchées avec allergènes ou sans gluten sur des présentoirs distincts",
        ],
      },
      {
        type: "text",
        title: "Occuper les invités pendant les photos",
        paragraphs: [
          "Pendant que les mariés font les photos officielles, les invités ont besoin d'une occupation qui ne demande pas leur présence active : jeux en bois, coin photobooth, musique d'ambiance, ou simplement un espace assis confortable. Évitez de laisser un vin d'honneur totalement sans animation pendant plus de 30 minutes.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Prévenez le traiteur ou le lieu si des enfants sont présents en nombre : un espace ombragé ou couvert avec une animation dédiée pendant le vin d'honneur évite bien des allers-retours pour les parents.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Calez la durée du vin d'honneur dans votre [timeline jour J minute par minute](/blog/planning-jour-j-minute-par-minute) ou testez l'outil [timeline en ligne](/tools/timeline) pour visualiser l'enchaînement complet de la journée.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The cocktail hour is the hinge moment between the ceremony and the meal: it is when guests relax, mingle, and the couple often steps away for official photos. Poorly timed, it either drags on or ends too soon before the meal is ready.",
        ],
      },
      {
        type: "text",
        title: "How long to plan",
        paragraphs: [
          "A duration of 1.5 to 2.5 hours is generally the right benchmark: enough to unwind after the ceremony, take group photos, and let guests socialize, without leaving them without food for too long. Past 3 hours, fatigue and hunger start to show, especially for children and older guests.",
        ],
      },
      {
        type: "list",
        title: "Drink quantities per guest",
        items: [
          "Plan 3 to 4 glasses per person over the whole cocktail hour",
          "For champagne or sparkling wine: roughly half a bottle per guest",
          "Always offer a non-alcoholic option in an equal quantity, not just a token one",
          "Provide freely available water on top of served drinks",
        ],
      },
      {
        type: "list",
        title: "Canape quantities per guest",
        items: [
          "6 to 10 savory pieces per person if the cocktail hour precedes a full meal",
          "More (10 to 15 pieces) if the cocktail hour partly replaces a course of the meal",
          "Vary textures and temperatures (hot, cold, sweet and savory) rather than multiplying similar recipes",
          "Clearly flag allergen or gluten-free canapes on separate stands",
        ],
      },
      {
        type: "text",
        title: "Keeping guests entertained during photos",
        paragraphs: [
          "While the couple takes official photos, guests need something to do that does not require their active presence: lawn games, a photobooth corner, background music, or simply a comfortable seating area. Avoid leaving a cocktail hour completely unentertained for more than 30 minutes.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Give the caterer or venue a heads-up if many children will be present: a shaded or covered area with dedicated activities during the cocktail hour saves parents a lot of back-and-forth.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Set the cocktail hour's duration in your [minute-by-minute day-of timeline](/blog/planning-jour-j-minute-par-minute) or try the [online timeline tool](/tools/timeline) to visualize the full flow of the day.",
        ],
      },
    ],
  }),

  postPair({
    slug: "brunch-lendemain-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Brunch du lendemain : faut-il l'organiser ?",
    titleEn: "Next-day brunch: is it worth organizing?",
    excerptFr:
      "Une tradition de plus en plus courante en France : qui inviter, combien ça coûte, et dans quels cas ça ne vaut pas le coup.",
    excerptEn:
      "An increasingly common tradition in France: who to invite, what it costs, and when it is not worth it.",
    readingMinutes: 5,
    heroAltFr: "Brunch du lendemain de mariage en extérieur",
    heroAltEn: "Outdoor next-day wedding brunch",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le brunch du lendemain, longtemps réservé aux mariages destination ou aux traditions anglo-saxonnes, s'est largement démocratisé en France. Il n'est pas obligatoire, mais il répond à un vrai besoin : prolonger le moment avec les proches qui se sont déplacés de loin, sans la pression du grand jour.",
        ],
      },
      {
        type: "text",
        title: "Qui inviter",
        paragraphs: [
          "Le brunch réunit généralement un cercle plus restreint que le mariage : famille proche, témoins, et invités venus de loin pour qui la journée de mariage seule ne justifiait pas le déplacement. Inviter tous les convives du mariage sans distinction alourdit à la fois le budget et l'organisation, souvent sans réel bénéfice.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'il coûte en pratique",
        items: [
          "Formule simple (café, viennoiseries, quelques plats froids) : 10 à 20 € par personne",
          "Formule complète avec plats chauds et service : 20 à 40 € par personne",
          "Lieu : souvent le même que le mariage si disponible, ou un espace loué à part",
          "Personnel de service en plus si le lieu du mariage ne peut pas rester ouvert",
        ],
      },
      {
        type: "text",
        title: "Quand ça ne vaut pas le coup",
        paragraphs: [
          "Si la majorité des invités repart tôt le lendemain matin, ou si le lieu du mariage n'est pas disponible une seconde journée, le brunch perd une bonne partie de son intérêt. Un simple message pour proposer un café informel avant les départs peut suffire dans ce cas, sans mobiliser un budget dédié.",
        ],
      },
      {
        type: "list",
        title: "Organiser sans effort supplémentaire",
        items: [
          "Demandez au traiteur du mariage un devis brunch en même temps que le reste : souvent plus simple à négocier",
          "Prévoyez un format buffet plutôt que servi, plus flexible sur les horaires d'arrivée dispersés",
          "Communiquez l'heure et le lieu du brunch sur la page de mariage dès l'invitation, pas seulement le jour J",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Le brunch n'a pas besoin d'être formel : un buffet simple dans un jardin ou un café réservé pour l'occasion remplit très bien le rôle, sans reproduire l'ampleur du mariage.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Ajoutez le brunch comme poste distinct dans le [simulateur budget](/tools/budget-calculator) et pensez-y en même temps que l'[hébergement des invités](/blog/hebergement-invites-mariage) qui restent sur place. Voir aussi [vin d'honneur et cocktail](/blog/vin-honneur-cocktail-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The next-day brunch, once reserved for destination weddings or Anglo-Saxon traditions, has become widely popular in France. It is not mandatory, but it answers a real need: extending the time with people who traveled far, without the pressure of the big day itself.",
        ],
      },
      {
        type: "text",
        title: "Who to invite",
        paragraphs: [
          "Brunch usually gathers a smaller circle than the wedding: close family, witnesses, and guests who came from far away for whom the wedding day alone did not justify the trip. Inviting every wedding guest without distinction adds to both budget and logistics, often without real benefit.",
        ],
      },
      {
        type: "list",
        title: "What it actually costs",
        items: [
          "Simple format (coffee, pastries, a few cold dishes): €10 to €20 per person",
          "Full format with hot dishes and service: €20 to €40 per person",
          "Venue: often the same as the wedding if available, or a separate rented space",
          "Extra service staff if the wedding venue cannot stay open a second day",
        ],
      },
      {
        type: "text",
        title: "When it is not worth it",
        paragraphs: [
          "If most guests are leaving early the next morning, or the wedding venue is not available a second day, the brunch loses much of its appeal. A simple message offering an informal coffee before departures can be enough in that case, without committing a dedicated budget.",
        ],
      },
      {
        type: "list",
        title: "Organizing it without extra effort",
        items: [
          "Ask the wedding caterer for a brunch quote at the same time as everything else: usually easier to negotiate",
          "Plan a buffet rather than a served format, more flexible for scattered arrival times",
          "Share the brunch time and location on the wedding page from the invitation stage, not just on the day",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The brunch does not need to be formal: a simple buffet in a garden or a cafe booked for the occasion fills the role well, without mirroring the scale of the wedding.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Add the brunch as a separate line in the [budget calculator](/tools/budget-calculator) and plan it alongside [guest lodging](/blog/hebergement-invites-mariage) for anyone staying over. See also [cocktail hour: duration, quantities, entertainment](/blog/vin-honneur-cocktail-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "premiere-danse-mariage-preparer",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Première danse : choisir la musique et se préparer",
    titleEn: "First dance: choosing the music and getting ready",
    excerptFr:
      "Comment choisir une chanson qui vous ressemble, si prendre des cours vaut le coup, et à quel moment placer la première danse.",
    excerptEn:
      "How to choose a song that feels like you, whether lessons are worth it, and when to place the first dance.",
    readingMinutes: 5,
    heroAltFr: "Couple de mariés dansant leur première danse",
    heroAltEn: "Newlywed couple dancing their first dance",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La première danse cristallise souvent plus de stress que nécessaire : peur de mal danser, chanson qui ne convainc pas les deux partenaires, timing mal placé dans la soirée. En réalité, quelques décisions simples suffisent à en faire un moment fluide plutôt qu'une épreuve.",
        ],
      },
      {
        type: "text",
        title: "Choisir la chanson",
        paragraphs: [
          "La meilleure chanson n'est pas forcément la plus populaire dans les classements de mariage, mais celle qui a un sens réel pour vous deux : un souvenir précis, un morceau entendu à un moment marquant de la relation. Écoutez plusieurs versions (studio, live, reprise) avant de trancher, le tempo change parfois beaucoup le ressenti dansé.",
        ],
      },
      {
        type: "list",
        title: "Prendre des cours, ou pas",
        items: [
          "Quelques cours (3 à 5 séances) suffisent pour un enchaînement simple et fluide, sans viser la chorégraphie",
          "Utile surtout si l'un des deux se sent réellement mal à l'aise à l'idée de danser en public",
          "Pas nécessaire si vous préférez une danse simple, portée par l'émotion plutôt que par la technique",
          "Prévoyez le dernier cours 2 à 3 semaines avant le mariage, pas la veille, pour rester détendu",
        ],
      },
      {
        type: "text",
        title: "Où la placer dans la soirée",
        paragraphs: [
          "La première danse ouvre généralement le bal, juste après le repas ou après un court discours, pendant que la salle est encore pleine et attentive. La placer trop tard, une fois la soirée bien avancée, dilue son impact et peut se heurter à des invités déjà partis ou dispersés.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Prévenez le DJ ou le groupe du signal exact pour lancer la musique, et faites un essai sonore avant l'arrivée des invités : un volume mal réglé ou un fondu raté gâche plus l'instant qu'un pas de travers.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Placez la première danse dans votre [timeline jour J](/tools/timeline) juste après le repas, et coordonnez le signal avec votre DJ grâce à [choisir son DJ de mariage](/blog/choisir-dj-mariage). Pour la suite de la soirée, voir [construire sa playlist de mariage](/blog/playlist-mariage-construire).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The first dance often carries more stress than it needs to: fear of dancing badly, a song that does not fully convince both partners, timing placed awkwardly in the evening. In practice, a handful of simple decisions are enough to make it a smooth moment rather than an ordeal.",
        ],
      },
      {
        type: "text",
        title: "Choosing the song",
        paragraphs: [
          "The best song is not necessarily the most popular one on wedding playlists, but the one that actually means something to both of you: a specific memory, a track tied to a meaningful moment in the relationship. Listen to several versions (studio, live, cover) before deciding, tempo often changes how it feels to dance to a lot.",
        ],
      },
      {
        type: "list",
        title: "Taking lessons, or not",
        items: [
          "A handful of lessons (3 to 5 sessions) is enough for a simple, smooth routine, without aiming for full choreography",
          "Mostly useful if one of you genuinely feels uncomfortable dancing in public",
          "Not necessary if you prefer a simple dance carried by emotion rather than technique",
          "Schedule the last lesson 2 to 3 weeks before the wedding, not the day before, to stay relaxed",
        ],
      },
      {
        type: "text",
        title: "Where to place it in the evening",
        paragraphs: [
          "The first dance usually opens the dance floor, right after the meal or a short speech, while the room is still full and attentive. Placing it too late, once the evening has wound down, dilutes its impact and can run into guests who have already left or scattered.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Tell the DJ or band the exact cue to start the music, and do a sound check before guests arrive: a badly set volume or a botched fade ruins the moment more than a missed step ever would.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Place the first dance in your [day-of timeline](/tools/timeline) right after the meal, and coordinate the cue with your DJ using [choosing your wedding DJ](/blog/choisir-dj-mariage). For the rest of the evening, see [building your wedding playlist](/blog/playlist-mariage-construire).",
        ],
      },
    ],
  }),

  postPair({
    slug: "playlist-mariage-construire",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Playlist de mariage : construire le fil musical",
    titleEn: "Wedding playlist: building the musical thread",
    excerptFr:
      "Structurer la musique de la cérémonie au dance floor, travailler avec un DJ, et gérer les demandes de chansons des invités.",
    excerptEn:
      "Structuring the music from ceremony to dance floor, working with a DJ, and handling guest song requests.",
    readingMinutes: 6,
    heroAltFr: "DJ mixant lors d'une soirée de mariage",
    heroAltEn: "DJ mixing at a wedding reception",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La musique d'un mariage n'est pas une seule playlist, mais une succession d'ambiances différentes qui doivent s'enchaîner sans rupture : cérémonie, vin d'honneur, repas, ouverture du bal, soirée dansante. Penser la journée par séquences plutôt que comme une liste unique facilite énormément le travail avec le DJ ou le groupe.",
        ],
      },
      {
        type: "list",
        title: "Les séquences musicales de la journée",
        items: [
          "Cérémonie : entrée, échange des vœux, sortie, souvent en musique acoustique ou instrumentale",
          "Vin d'honneur : ambiance discrète en fond, volume permettant la conversation",
          "Repas : musique douce entre les plats, avec quelques temps forts (discours, arrivée du dessert)",
          "Ouverture du bal : première danse, puis montée progressive en énergie",
          "Soirée dansante : le cœur de la playlist, structuré par vagues d'intensité plutôt qu'en ligne droite",
        ],
      },
      {
        type: "text",
        title: "Travailler avec le DJ",
        paragraphs: [
          "Un bon DJ ne se contente pas de suivre une liste imposée : il lit la salle et ajuste l'ordre en temps réel. Donnez-lui plutôt une liste de titres incontournables, une liste de titres à éviter absolument, et une indication du style général souhaité (plutôt classiques, plutôt actuels, mélange des deux) que d'imposer un déroulé minute par minute.",
        ],
      },
      {
        type: "list",
        title: "Gérer les demandes des invités",
        items: [
          "Ouvrez un espace de suggestion (formulaire en ligne ou carte sur la table) avant le mariage plutôt que le soir même",
          "Précisez au DJ les titres formellement exclus (souvenirs sensibles, ex-partenaires, chansons de rupture)",
          "Acceptez que toutes les suggestions ne soient pas jouées : le DJ garde la responsabilité du rythme de la soirée",
          "Prévoyez un créneau libre en fin de soirée où les demandes spontanées ont plus de place",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Évitez de vouloir plaire à toutes les générations sur chaque titre : alterner des blocs pensés pour différents publics (musique des années 80-90, titres actuels, classiques de soirée) fonctionne mieux qu'un mix permanent de tout à la fois.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Calez les séquences musicales dans votre [timeline jour J](/tools/timeline) pour donner des repères clairs au DJ, en vous appuyant sur [choisir son DJ de mariage](/blog/choisir-dj-mariage). Voir aussi [première danse : choisir la musique](/blog/premiere-danse-mariage-preparer).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Wedding music is not a single playlist, but a sequence of different moods that need to flow without breaks: ceremony, cocktail hour, meal, dance opening, dance floor. Thinking of the day in sequences rather than one big list makes working with the DJ or band far easier.",
        ],
      },
      {
        type: "list",
        title: "The day's musical sequences",
        items: [
          "Ceremony: entrance, vow exchange, exit, often acoustic or instrumental music",
          "Cocktail hour: understated background mood, volume that still allows conversation",
          "Meal: soft music between courses, with a few peaks (speeches, dessert arrival)",
          "Dance opening: first dance, then a gradual rise in energy",
          "Dance floor: the heart of the playlist, structured in waves of intensity rather than a straight line",
        ],
      },
      {
        type: "text",
        title: "Working with the DJ",
        paragraphs: [
          "A good DJ does not just follow a fixed list, they read the room and adjust order in real time. Give them a must-play list, a strictly-avoid list, and a general style hint (more classics, more current hits, a mix of both) rather than dictating a minute-by-minute running order.",
        ],
      },
      {
        type: "list",
        title: "Handling guest requests",
        items: [
          "Open a suggestion channel (online form or a card on the table) before the wedding rather than the night of",
          "Tell the DJ which songs are strictly off the list (sensitive memories, exes, breakup songs)",
          "Accept that not every suggestion will be played: the DJ keeps responsibility for the evening's pace",
          "Leave a free slot late in the evening where spontaneous requests get more room",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Avoid trying to please every generation on every single track: alternating blocks aimed at different crowds (80s-90s music, current hits, party classics) works better than a constant blend of everything at once.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Set the musical sequences in your [day-of timeline](/tools/timeline) to give the DJ clear markers, building on [choosing your wedding DJ](/blog/choisir-dj-mariage). See also [first dance: choosing the music](/blog/premiere-danse-mariage-preparer).",
        ],
      },
    ],
  }),

  postPair({
    slug: "discours-maries-temoins-reussir",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Discours de mariage : réussir ceux des mariés et des témoins",
    titleEn: "Wedding speeches: getting the couple's and witnesses' right",
    excerptFr:
      "Structure, longueur, ton : comment construire un discours de mariage et briefer les témoins pour éviter les faux pas fréquents.",
    excerptEn:
      "Structure, length, tone: how to build a wedding speech and brief your witnesses to avoid common pitfalls.",
    readingMinutes: 6,
    heroAltFr: "Témoin prononçant un discours de mariage",
    heroAltEn: "Witness giving a wedding speech",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un bon discours de mariage tient rarement à l'éloquence naturelle de celui qui le prononce, mais à une structure claire et une longueur maîtrisée. La plupart des discours ratés partagent le même défaut : trop long, sans fil conducteur, ou construits sur des anecdotes que seule une partie de la salle comprend.",
        ],
      },
      {
        type: "list",
        title: "Une structure simple qui fonctionne",
        items: [
          "Une ouverture courte qui capte l'attention (une anecdote, une phrase marquante, jamais une blague forcée)",
          "Le cœur du discours : une ou deux anecdotes développées plutôt que dix évoquées rapidement",
          "Un message pour le couple, sincère et personnel, sans formule toute faite",
          "Une conclusion qui invite à porter un toast, claire et facile à suivre pour la salle",
        ],
      },
      {
        type: "text",
        title: "La bonne longueur",
        paragraphs: [
          "Comptez 3 à 5 minutes pour un discours de témoin, un peu plus (5 à 7 minutes) pour un discours de parent ou de marié. Au-delà de 7 à 8 minutes, l'attention de la salle décroche, même pour un discours réussi sur le fond.",
        ],
      },
      {
        type: "list",
        title: "Briefer les témoins",
        items: [
          "Fixez ensemble l'ordre de passage des discours avant le jour J, pas dans la précipitation",
          "Partagez les grandes lignes de votre histoire commune pour éviter les redites entre plusieurs discours",
          "Demandez de relire le discours à voix haute au moins une fois avant le mariage, pour vérifier le timing",
          "Rappelez la limite sur les sujets sensibles (ex-relations, blagues sur la famille, anecdotes trop intimes)",
        ],
      },
      {
        type: "text",
        title: "Éviter les faux pas fréquents",
        paragraphs: [
          "Les discours qui posent problème partagent souvent les mêmes causes : improvisation totale sans notes, alcool consommé juste avant de parler, ou volonté de faire rire à tout prix au détriment du fond. Un discours écrit et relu, même s'il paraît moins spontané, reste presque toujours mieux reçu qu'une improvisation risquée.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Gardez une copie papier du discours même si vous comptez le savoir par cœur : le trac fait parfois perdre le fil, et relire une ligne discrètement vaut mieux qu'un blanc prolongé devant toute la salle.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Placez l'ordre des discours dans votre [timeline jour J minute par minute](/blog/planning-jour-j-minute-par-minute) pour que chaque témoin sache exactement quand intervenir. Voir aussi [choisir ses témoins et leur rôle](/blog/choisir-temoins-role-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A good wedding speech rarely comes down to the natural eloquence of the person giving it, but to a clear structure and a controlled length. Most speeches that fall flat share the same flaw: too long, no clear thread, or built on anecdotes only part of the room understands.",
        ],
      },
      {
        type: "list",
        title: "A simple structure that works",
        items: [
          "A short opening that grabs attention (an anecdote, a striking line, never a forced joke)",
          "The core of the speech: one or two well-developed anecdotes rather than ten skimmed quickly",
          "A message to the couple, sincere and personal, without stock phrases",
          "A closing that invites a toast, clear and easy for the room to follow",
        ],
      },
      {
        type: "text",
        title: "The right length",
        paragraphs: [
          "Plan on 3 to 5 minutes for a witness speech, a bit more (5 to 7 minutes) for a parent's or a spouse's speech. Past 7 to 8 minutes, the room's attention drifts, even for a speech that is genuinely good on substance.",
        ],
      },
      {
        type: "list",
        title: "Briefing your witnesses",
        items: [
          "Agree on the speaking order together before the day, not in a rush",
          "Share the broad strokes of your shared story to avoid overlap between multiple speeches",
          "Ask them to read the speech out loud at least once before the wedding, to check timing",
          "Set a clear boundary on sensitive topics (past relationships, jokes about the family, overly private anecdotes)",
        ],
      },
      {
        type: "text",
        title: "Avoiding common pitfalls",
        paragraphs: [
          "Speeches that go wrong usually share the same causes: fully improvised with no notes, alcohol right before speaking, or trying to get laughs at any cost at the expense of substance. A written and rehearsed speech, even if it feels less spontaneous, is almost always received better than a risky improvisation.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Keep a paper copy of the speech even if you plan to know it by heart: nerves sometimes break the flow, and quietly glancing at a line beats a long, awkward silence in front of the whole room.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Set the speaking order in your [minute-by-minute day-of timeline](/blog/planning-jour-j-minute-par-minute) so each witness knows exactly when to step up. See also [choosing your witnesses and their role](/blog/choisir-temoins-role-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "ceremonie-religieuse-catholique-preparer",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Mariage religieux catholique : préparation et délais",
    titleEn: "Catholic religious wedding: preparation and timelines",
    excerptFr:
      "Parcours de préparation au mariage, documents à réunir, délais du diocèse, et comment cela s'articule avec le mariage civil.",
    excerptEn:
      "Marriage preparation course, documents to gather, diocese timelines, and how it fits alongside the civil ceremony.",
    readingMinutes: 7,
    heroAltFr: "Église préparée pour une cérémonie de mariage catholique",
    heroAltEn: "Church set up for a Catholic wedding ceremony",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En France, le mariage religieux catholique ne peut légalement avoir lieu qu'après le mariage civil à la mairie, jamais avant. Cette contrainte oblige à penser les deux cérémonies ensemble dès le départ, en particulier pour les délais de préparation qui diffèrent nettement entre mairie et paroisse.",
        ],
      },
      {
        type: "text",
        title: "Le parcours de préparation au mariage (CPM)",
        paragraphs: [
          "La plupart des diocèses demandent aux couples de suivre un parcours de préparation, souvent appelé CPM, qui peut prendre la forme de plusieurs soirées, d'un week-end complet, ou de rencontres individuelles avec un prêtre ou un couple accompagnateur. Ce parcours aborde la dimension du sacrement, la préparation à la vie de couple, et parfois des sujets pratiques (enfants, foi, engagement).",
        ],
      },
      {
        type: "list",
        title: "Documents généralement demandés",
        items: [
          "Extrait de baptême récent (moins de 3 à 6 mois selon les diocèses)",
          "Certificat de confirmation si elle a été reçue",
          "Attestation de suivi du parcours de préparation au mariage",
          "Copie du dossier de mariage civil ou preuve de la publication des bans à la mairie",
          "Dossier canonique complété avec le prêtre référent de la paroisse",
        ],
      },
      {
        type: "text",
        title: "Les délais à anticiper",
        paragraphs: [
          "Comptez généralement 9 à 12 mois entre la première prise de contact avec la paroisse et la date de la cérémonie, le temps de suivre le parcours de préparation, réunir les documents et réserver l'église, surtout dans les paroisses très demandées en haute saison. Certains diocèses imposent un délai minimum incompressible entre l'inscription et la cérémonie.",
        ],
      },
      {
        type: "text",
        title: "Articuler mariage civil et mariage religieux",
        paragraphs: [
          "L'ordre légal est fixe : mairie d'abord, église ensuite, le même jour ou à une date différente selon les préférences du couple. Beaucoup de couples organisent les deux le même jour pour simplifier la logistique des invités, avec un créneau resserré entre les deux cérémonies ; d'autres préfèrent les séparer de plusieurs semaines pour alléger chaque événement.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Prenez contact avec la paroisse le plus tôt possible dans votre réflexion, avant même de finaliser la date : la disponibilité du prêtre et de l'église peut contraindre le choix de la date bien plus que celle des autres prestataires.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Calez le mariage religieux dans votre planning avec le [dossier mairie et délai de publication des bans](/blog/dossier-mairie-bans-mariage-delais), et gardez les deux cérémonies visibles dans une seule timeline. Pour une cérémonie sans confession religieuse, voir [cérémonie laïque : choisir un officiant](/blog/ceremonie-laique-choisir-officiant).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In France, a Catholic religious wedding can legally only take place after the civil ceremony at the town hall, never before. That constraint means both ceremonies need to be planned together from the start, especially since preparation timelines differ significantly between the town hall and the parish.",
        ],
      },
      {
        type: "text",
        title: "The marriage preparation course (CPM)",
        paragraphs: [
          "Most dioceses ask couples to complete a preparation course, often called a CPM, which can take the form of several evening sessions, a full weekend, or one-on-one meetings with a priest or a mentoring couple. The course covers the sacrament itself, preparation for married life, and sometimes practical topics (children, faith, commitment).",
        ],
      },
      {
        type: "list",
        title: "Documents typically required",
        items: [
          "Recent baptism certificate (less than 3 to 6 months old depending on the diocese)",
          "Confirmation certificate if received",
          "Proof of completing the marriage preparation course",
          "Copy of the civil marriage file or proof that the town hall has published the banns",
          "Canonical file completed with the parish's referring priest",
        ],
      },
      {
        type: "text",
        title: "Timelines to plan for",
        paragraphs: [
          "Plan on roughly 9 to 12 months between first contacting the parish and the ceremony date, to complete the preparation course, gather documents, and book the church, especially in high-demand parishes during peak season. Some dioceses set a minimum, non-negotiable lead time between registration and the ceremony.",
        ],
      },
      {
        type: "text",
        title: "Fitting the civil and religious ceremonies together",
        paragraphs: [
          "The legal order is fixed: town hall first, church second, either the same day or a different date depending on the couple's preference. Many couples run both on the same day to simplify guest logistics, with a tight window between the two ceremonies; others prefer to space them out by several weeks to keep each event lighter.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Contact the parish as early as possible in your planning, even before finalizing the date: the priest's and church's availability can constrain your date choice far more than any other vendor's does.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Set the religious wedding into your planning alongside the [town hall file and banns publication delay](/blog/dossier-mairie-bans-mariage-delais), and keep both ceremonies visible in one timeline. For a ceremony without a religious framework, see [secular ceremony: choosing an officiant](/blog/ceremonie-laique-choisir-officiant).",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-destination-etranger-organiser",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Mariage à l'étranger : logistique, légal, invités",
    titleEn: "Destination wedding abroad: logistics, legal status, guests",
    excerptFr:
      "Reconnaissance du mariage à l'étranger en France, impact du voyage sur la présence des invités, et coordination des prestataires à distance.",
    excerptEn:
      "Legal recognition of a foreign marriage in France, the impact of travel on guest attendance, and coordinating vendors remotely.",
    readingMinutes: 7,
    heroAltFr: "Cérémonie de mariage sur une plage à l'étranger",
    heroAltEn: "Wedding ceremony on a beach abroad",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un mariage à l'étranger séduit pour son décor et son ambiance, mais il ajoute trois couches de complexité rarement présentes dans un mariage local : la reconnaissance légale du mariage en France, le coût et la disponibilité réduite des invités, et la coordination de prestataires que vous ne rencontrerez peut-être jamais en personne avant le jour J.",
        ],
      },
      {
        type: "text",
        title: "La reconnaissance légale en France",
        paragraphs: [
          "Un mariage célébré à l'étranger, civil ou religieux, peut être reconnu en France sous certaines conditions, généralement via une transcription à l'état civil français (au consulat ou à l'ambassade selon le pays). Sans cette démarche, le mariage peut ne pas produire tous ses effets légaux en France (nom d'usage, succession, régime matrimonial). Renseignez-vous sur la procédure exacte auprès du consulat de France du pays concerné avant de réserver quoi que ce soit.",
        ],
      },
      {
        type: "list",
        title: "L'impact du voyage sur la présence des invités",
        items: [
          "Attendez-vous à un taux de présence plus faible qu'un mariage local, souvent 40 à 70 % de la liste initiale",
          "Annoncez la destination très en amont (10 à 12 mois) pour laisser le temps de bloquer congés et budget",
          "Proposez une fourchette d'hébergement à plusieurs budgets, pas uniquement l'option la plus confortable",
          "Prévoyez, si le budget le permet, un événement local complémentaire pour les proches qui ne peuvent pas se déplacer",
        ],
      },
      {
        type: "text",
        title: "Coordonner les prestataires à distance",
        paragraphs: [
          "La plupart des couples ne rencontrent leurs prestataires étrangers qu'une seule fois en personne, souvent juste avant le mariage. Un wedding planner local ou une agence spécialisée destination facilite énormément cette coordination : négociation dans la langue locale, connaissance des règles administratives du pays, réseau de prestataires déjà testés.",
        ],
      },
      {
        type: "list",
        title: "Points à vérifier avant de réserver",
        items: [
          "Les documents d'entrée (visa, passeport valide au-delà de la date du mariage) pour vous et vos invités",
          "Les délais administratifs locaux propres au pays pour célébrer un mariage (résidence minimale, documents traduits et légalisés)",
          "L'assurance annulation, particulièrement importante sur ce type de mariage où les acomptes sont souvent non remboursables",
          "Le décalage horaire et la saison locale, qui peuvent limiter la fenêtre de dates disponibles",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Prévoyez une marge de 2 à 3 jours autour de la date du mariage pour absorber un imprévu de transport, sans mettre en péril la cérémonie elle-même.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Suivez le taux de réponse réel de vos invités avec le [RSVP en ligne](/blog/rsvp-en-ligne-sans-compte) pour ajuster le budget traiteur en fonction de la présence réelle, et pensez à l'[assurance annulation de mariage](/blog/assurance-annulation-mariage) dès la réservation des premiers acomptes.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A destination wedding is appealing for its setting and atmosphere, but it adds three layers of complexity rarely present in a local wedding: legal recognition of the marriage in France, reduced guest turnout and cost, and coordinating vendors you may never meet in person before the day.",
        ],
      },
      {
        type: "text",
        title: "Legal recognition in France",
        paragraphs: [
          "A marriage celebrated abroad, civil or religious, can be recognized in France under certain conditions, generally through a transcription into the French civil registry (via the consulate or embassy depending on the country). Without that step, the marriage may not produce all its legal effects in France (name usage, inheritance, matrimonial regime). Check the exact procedure with the French consulate for that country before booking anything.",
        ],
      },
      {
        type: "list",
        title: "How travel affects guest attendance",
        items: [
          "Expect a lower attendance rate than a local wedding, often 40 to 70 percent of the initial list",
          "Announce the destination well in advance (10 to 12 months) to give guests time to secure leave and budget",
          "Offer a range of lodging options across budgets, not just the most comfortable one",
          "If budget allows, plan a complementary local event for people who cannot travel",
        ],
      },
      {
        type: "text",
        title: "Coordinating vendors remotely",
        paragraphs: [
          "Most couples only meet their foreign vendors once in person, often right before the wedding. A local wedding planner or a specialized destination agency makes this coordination far easier: negotiating in the local language, knowing the country's administrative rules, and a network of already-vetted vendors.",
        ],
      },
      {
        type: "list",
        title: "Things to check before booking",
        items: [
          "Entry documents (visa, passport valid beyond the wedding date) for you and your guests",
          "Local administrative requirements for getting married in that country (minimum residency, translated and legalized documents)",
          "Cancellation insurance, particularly important for this type of wedding where deposits are often non-refundable",
          "Time difference and local season, which can narrow the window of available dates",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Build in a 2 to 3 day buffer around the wedding date to absorb a travel hiccup, without putting the ceremony itself at risk.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Track your guests' real response rate with [online RSVP](/blog/rsvp-en-ligne-sans-compte) to adjust the catering budget to actual attendance, and look into [wedding cancellation insurance](/blog/assurance-annulation-mariage) as soon as you book the first deposits.",
        ],
      },
    ],
  }),

  postPair({
    slug: "papeterie-mariage-faire-part-design",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Papeterie de mariage : une identité cohérente",
    titleEn: "Wedding stationery: building one coherent identity",
    excerptFr:
      "Faire-part, menus, plan de table, marque-places : comment garder une cohérence visuelle sur toute la papeterie et respecter les délais d'impression.",
    excerptEn:
      "Invitations, menus, seating chart, place cards: how to keep visual coherence across all your stationery and hit printing deadlines.",
    readingMinutes: 6,
    heroAltFr: "Ensemble de papeterie de mariage assortie",
    heroAltEn: "Matching set of wedding stationery",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La papeterie de mariage ne se limite pas au faire-part : menus, plan de table affiché, marque-places, panneaux de bienvenue, remerciements forment ensemble une identité visuelle que les invités croisent du début à la fin de la journée. Une papeterie éparpillée, avec une police ou une couleur différente à chaque support, se remarque plus qu'on ne le pense.",
        ],
      },
      {
        type: "list",
        title: "Les éléments à penser ensemble",
        items: [
          "Faire-part et save-the-date, souvent les premiers éléments produits et donc la base du reste",
          "Programme ou livret de cérémonie, si la cérémonie religieuse ou laïque en prévoit un",
          "Plan de table affiché et marque-places individuels",
          "Menus posés à table ou affichés au buffet",
          "Panneaux de signalétique (bienvenue, vestiaire, urne à cartes) et remerciements envoyés après le mariage",
        ],
      },
      {
        type: "text",
        title: "Construire une identité simple",
        paragraphs: [
          "Il n'est pas nécessaire de multiplier les choix graphiques : une palette de deux à trois couleurs, une police principale pour les titres et une police secondaire pour le texte suffisent à tenir toute la papeterie. Cette identité peut ensuite se décliner sur la page web du mariage pour une cohérence complète entre le support papier et le support numérique.",
        ],
      },
      {
        type: "list",
        title: "Délais d'impression à anticiper",
        items: [
          "Faire-part : à envoyer 3 à 4 mois avant le mariage, donc à concevoir et imprimer bien avant",
          "Menus et marque-places : finalisés seulement après confirmation du nombre d'invités et des choix de repas, souvent 2 à 3 semaines avant",
          "Panneaux et signalétique : peuvent être commandés plus tôt car ils dépendent moins du nombre final d'invités",
          "Remerciements : à prévoir en amont pour l'envoi dans les semaines suivant le mariage",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Gardez un fichier source modifiable (modèle graphique) pour tous les supports, même si vous faites appel à plusieurs prestataires : cela évite de repartir de zéro si un imprimeur change ou si un format doit être ajusté au dernier moment.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Fixez d'abord votre [palette de couleurs de mariage](/blog/palette-couleurs-mariage), puis exportez votre [plan de table en PDF](/tools/seating-chart) dans le même esprit visuel que vos marque-places. Pour le choix papier ou numérique du faire-part, voir [faire-part papier ou numérique](/blog/faire-part-papier-ou-numerique).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Wedding stationery is not just the invitation: menus, displayed seating chart, place cards, welcome signs, and thank-you cards together form a visual identity guests encounter from the start of the day to the end. Scattered stationery, with a different font or color on each piece, gets noticed more than people expect.",
        ],
      },
      {
        type: "list",
        title: "Elements to think through together",
        items: [
          "Invitation and save-the-date, often the first pieces produced and so the basis for the rest",
          "Ceremony program or booklet, if the religious or secular ceremony includes one",
          "Displayed seating chart and individual place cards",
          "Menus placed on tables or displayed at the buffet",
          "Signage (welcome, coat check, card box) and thank-you cards sent after the wedding",
        ],
      },
      {
        type: "text",
        title: "Building a simple identity",
        paragraphs: [
          "There is no need to multiply graphic choices: a palette of two to three colors, a main font for titles, and a secondary font for body text is enough to hold the whole stationery set together. That identity can then extend to the wedding website for full coherence between print and digital.",
        ],
      },
      {
        type: "list",
        title: "Printing lead times to plan for",
        items: [
          "Invitations: to be sent 3 to 4 months before the wedding, so designed and printed well before that",
          "Menus and place cards: only finalized once guest count and meal choices are confirmed, often 2 to 3 weeks out",
          "Signage: can be ordered earlier since it depends less on final guest count",
          "Thank-you cards: plan them ahead of time for sending in the weeks after the wedding",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Keep an editable source file (the graphic template) for every piece, even if several vendors are involved: it avoids starting over if a printer changes or a format needs a last-minute adjustment.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Settle on your [wedding color palette](/blog/palette-couleurs-mariage) first, then export your [seating chart to PDF](/tools/seating-chart) in the same visual spirit as your place cards. For paper versus digital invitations, see [paper or digital invitations](/blog/faire-part-papier-ou-numerique).",
        ],
      },
    ],
  }),

  postPair({
    slug: "faire-part-papier-ou-numerique",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Faire-part papier ou numérique : coûts, écologie, taux de réponse",
    titleEn: "Paper or digital invitations: cost, environment, response rates",
    excerptFr:
      "Comparatif honnête entre faire-part papier et invitation numérique, avec les vrais écarts de coût, d'impact écologique et de taux de réponse.",
    excerptEn:
      "An honest comparison of paper versus digital invitations, with real differences in cost, environmental impact, and response rates.",
    readingMinutes: 6,
    heroAltFr: "Faire-part de mariage papier et numérique côte à côte",
    heroAltEn: "Paper and digital wedding invitations side by side",
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le débat papier contre numérique revient à chaque mariage, souvent tranché par habitude plutôt que par comparaison réelle. Les deux options ont des forces différentes selon le profil des invités (âge, éloignement géographique) et le budget disponible.",
        ],
      },
      {
        type: "list",
        title: "Faire-part papier",
        items: [
          "Coût : 2 à 6 € par exemplaire selon le papier et l'impression, plus l'affranchissement",
          "Perçu comme plus solennel, garde une valeur d'objet et de souvenir",
          "Délai de fabrication et d'envoi plus long, à prévoir 3 à 4 mois avant le mariage",
          "Plus adapté aux invités moins à l'aise avec le numérique (générations plus âgées)",
        ],
      },
      {
        type: "list",
        title: "Invitation numérique",
        items: [
          "Coût : quasi nul en envoi direct, ou abonnement modeste pour un outil dédié avec RSVP intégré",
          "Envoi instantané, relance facile pour les invités qui n'ont pas répondu",
          "Moins adapté si une partie des invités n'a pas d'accès régulier à internet ou au smartphone",
          "Permet de centraliser RSVP, plan d'accès et informations pratiques au même endroit",
        ],
      },
      {
        type: "text",
        title: "L'angle écologique",
        paragraphs: [
          "Le numérique a un impact environnemental direct plus faible (pas de papier, pas de transport postal), mais l'écart réel dépend aussi du nombre d'invités et du type de papier choisi (recyclé, local, imprimé en petite série). Pour les couples sensibles au sujet sans vouloir renoncer totalement au papier, un format hybride reste une option raisonnable.",
        ],
      },
      {
        type: "text",
        title: "Le taux de réponse, la vraie différence",
        paragraphs: [
          "C'est souvent là que se joue le vrai écart : un RSVP numérique avec relance automatique obtient généralement un taux de réponse plus élevé et plus rapide qu'un carton-réponse papier à retourner par courrier, qui se perd facilement ou traîne sur un coin de table. Pour les mariages avec beaucoup d'invités éloignés géographiquement, cet écart devient significatif pour le budget traiteur final.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Le format hybride le plus courant : un faire-part papier pour l'annonce officielle, avec un lien ou un QR code vers le RSVP en ligne plutôt qu'un carton-réponse à retourner par courrier.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le [RSVP en ligne sans compte](/blog/rsvp-en-ligne-sans-compte) fonctionne aussi bien en complément d'un faire-part papier qu'en solution 100 % numérique. Voir aussi [save-the-date, faire-part et calendrier](/blog/save-the-date-faire-part-calendrier) et [papeterie de mariage : une identité cohérente](/blog/papeterie-mariage-faire-part-design).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The paper versus digital debate comes up at every wedding, usually settled by habit rather than a real comparison. Both options have different strengths depending on the guest profile (age, geographic distance) and available budget.",
        ],
      },
      {
        type: "list",
        title: "Paper invitations",
        items: [
          "Cost: €2 to €6 per piece depending on paper and printing, plus postage",
          "Perceived as more formal, keeps value as a keepsake object",
          "Longer production and mailing lead time, plan 3 to 4 months before the wedding",
          "Better suited to guests less comfortable with digital tools (older generations)",
        ],
      },
      {
        type: "list",
        title: "Digital invitations",
        items: [
          "Cost: nearly free to send directly, or a modest subscription for a dedicated tool with built-in RSVP",
          "Instant delivery, easy to follow up with guests who have not responded",
          "Less suited if some guests do not have regular internet or smartphone access",
          "Centralizes RSVP, directions, and practical information in one place",
        ],
      },
      {
        type: "text",
        title: "The environmental angle",
        paragraphs: [
          "Digital has a lower direct environmental footprint (no paper, no postal transport), but the real gap also depends on guest count and the type of paper chosen (recycled, local, small-batch print run). For couples who care about the topic without wanting to give up paper entirely, a hybrid format is a reasonable option.",
        ],
      },
      {
        type: "text",
        title: "Response rate, the real difference",
        paragraphs: [
          "This is often where the real gap shows up: a digital RSVP with automatic reminders generally gets a higher and faster response rate than a paper reply card mailed back, which is easy to lose or leave on a table for weeks. For weddings with many guests spread far apart, that gap becomes significant for the final catering budget.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The most common hybrid format: a paper invitation for the official announcement, with a link or QR code pointing to the online RSVP instead of a reply card to mail back.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The [account-free online RSVP](/blog/rsvp-en-ligne-sans-compte) works just as well alongside a paper invitation as it does as a fully digital solution. See also [save-the-date, invitations, and calendar](/blog/save-the-date-faire-part-calendrier) and [wedding stationery: one coherent identity](/blog/papeterie-mariage-faire-part-design).",
        ],
      },
    ],
  }),

  postPair({
    slug: "changement-nom-apres-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Changement de nom après le mariage : démarches et délais",
    titleEn: "Changing your name after the wedding: steps and timelines",
    excerptFr:
      "Nom d'usage ou nom de famille, quelles administrations prévenir et dans quel ordre : carte d'identité, passeport, banque, employeur.",
    excerptEn:
      "Legal name versus name of use, which administrations to notify and in what order: ID card, passport, bank, employer.",
    readingMinutes: 6,
    heroAltFr: "Documents administratifs pour un changement de nom",
    heroAltEn: "Administrative documents for a name change",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En France, le mariage ne change pas automatiquement le nom de famille sur l'état civil : chacun garde légalement son nom de naissance. Ce que le mariage permet, c'est d'utiliser le nom de son conjoint comme « nom d'usage » dans la vie courante, sur simple présentation du livret de famille ou de l'acte de mariage, sans démarche judiciaire.",
        ],
      },
      {
        type: "list",
        title: "Nom d'usage vs nom de famille",
        items: [
          "Nom de famille : celui inscrit à l'état civil, transmis aux enfants, ne change pas automatiquement avec le mariage",
          "Nom d'usage : le nom du conjoint (ou les deux noms accolés) utilisé au quotidien, sans modification de l'état civil",
          "Le nom d'usage peut être repris à tout moment après le mariage, il n'y a pas de délai limite",
          "Le nom d'usage peut aussi être abandonné à tout moment, y compris après un divorce",
        ],
      },
      {
        type: "text",
        title: "Par où commencer",
        paragraphs: [
          "La première étape consiste à obtenir plusieurs exemplaires de l'acte de mariage auprès de la mairie où le mariage a été célébré, ainsi que le livret de famille mis à jour. Ces documents servent de justificatif pour toutes les démarches suivantes, souvent demandés en original ou en copie certifiée.",
        ],
      },
      {
        type: "list",
        title: "Les administrations à prévenir, dans un ordre logique",
        items: [
          "Carte nationale d'identité et passeport : à mettre à jour en priorité, ce sont les pièces d'identité de référence pour tout le reste",
          "Sécurité sociale : mise à jour de la carte vitale et du compte Ameli",
          "Banque : coordonnées bancaires, cartes, chéquier au nouveau nom d'usage",
          "Employeur : service RH pour la fiche de paie et les documents professionnels",
          "Impôts : mise à jour de l'espace personnel et des avis d'imposition à venir",
          "Autres organismes : caisse d'allocations familiales, mutuelle, assurances, abonnements divers",
        ],
      },
      {
        type: "text",
        title: "Les délais à prévoir",
        paragraphs: [
          "Le renouvellement de la carte d'identité et du passeport prend généralement plusieurs semaines selon la période et la mairie, un délai à anticiper si un déplacement à l'étranger est prévu peu après le mariage (voyage de noces compris). Les autres démarches administratives (banque, sécurité sociale) sont en général plus rapides une fois les papiers d'identité mis à jour.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Ajoutez les démarches de changement de nom comme tâches dans votre [checklist mariage](/blog/checklist-mariage-50-taches) pour ne rien oublier dans les semaines suivant le mariage, aux côtés des [remerciements après le mariage](/blog/remerciements-apres-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In France, marriage does not automatically change your legal family name on the civil registry: each spouse legally keeps their birth name. What marriage allows is using your spouse's name as a \"nom d'usage\" (name of use) in everyday life, simply by presenting the family record book or the marriage certificate, with no court procedure needed.",
        ],
      },
      {
        type: "list",
        title: "Name of use versus legal family name",
        items: [
          "Legal family name: the one recorded on the civil registry, passed on to children, does not change automatically with marriage",
          "Name of use: the spouse's name (or both names combined) used day to day, with no change to the civil registry",
          "The name of use can be adopted at any point after the wedding, there is no deadline",
          "The name of use can also be dropped at any time, including after a divorce",
        ],
      },
      {
        type: "text",
        title: "Where to start",
        paragraphs: [
          "The first step is getting several copies of the marriage certificate from the town hall where the wedding was held, plus the updated family record book. These documents serve as proof for every step that follows, often requested as originals or certified copies.",
        ],
      },
      {
        type: "list",
        title: "Administrations to notify, in a logical order",
        items: [
          "National ID card and passport: update these first, they are the reference identity documents for everything else",
          "Health insurance (Sécurité sociale): updating your carte vitale and Ameli account",
          "Bank: bank details, cards, checkbook under the new name of use",
          "Employer: HR department for payslips and professional documents",
          "Tax authority: updating your online account and upcoming tax notices",
          "Other bodies: family allowance fund, supplemental health insurance, insurers, various subscriptions",
        ],
      },
      {
        type: "text",
        title: "Timelines to expect",
        paragraphs: [
          "Renewing the ID card and passport generally takes several weeks depending on the time of year and the town hall, a delay worth planning for if travel abroad is planned soon after the wedding (honeymoon included). Other administrative steps (bank, health insurance) are usually faster once identity documents are updated.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Add name-change steps as tasks in your [50-task wedding checklist](/blog/checklist-mariage-50-taches) so nothing gets forgotten in the weeks after the wedding, alongside [thank-you notes after the wedding](/blog/remerciements-apres-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "contrat-mariage-regimes-matrimoniaux",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Contrat de mariage : quel régime matrimonial choisir ?",
    titleEn: "Marriage contract: which matrimonial regime to choose?",
    excerptFr:
      "Communauté réduite aux acquêts par défaut, séparation de biens, participation aux acquêts : panorama général et quand consulter un notaire.",
    excerptEn:
      "Default community of acquests, separation of property, participation in acquests: a general overview and when to consult a notary.",
    readingMinutes: 7,
    heroAltFr: "Signature d'un contrat de mariage chez le notaire",
    heroAltEn: "Signing a marriage contract at a notary's office",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le régime matrimonial détermine comment les biens sont possédés et partagés pendant le mariage, et surtout comment ils sont répartis en cas de divorce ou de décès. Sans contrat de mariage signé chez le notaire, un régime s'applique automatiquement en France : la communauté réduite aux acquêts. Beaucoup de couples découvrent ce fonctionnement seulement au moment d'une séparation, alors qu'il se décide en réalité avant le mariage.",
        ],
      },
      {
        type: "list",
        title: "Communauté réduite aux acquêts (régime par défaut)",
        items: [
          "S'applique automatiquement si aucun contrat n'est signé",
          "Les biens acquis avant le mariage restent propres à chacun",
          "Les biens acquis pendant le mariage (salaires, achats communs) appartiennent aux deux",
          "Les biens reçus par héritage ou donation restent propres, même pendant le mariage",
        ],
      },
      {
        type: "list",
        title: "Séparation de biens",
        items: [
          "Chaque époux reste propriétaire de ce qu'il acquiert, avant et pendant le mariage",
          "Utile en particulier si l'un des conjoints exerce une activité indépendante ou entrepreneuriale à risque",
          "Nécessite un contrat de mariage signé devant notaire avant la cérémonie",
          "Peut compliquer le partage de biens réellement communs (résidence principale achetée à deux, par exemple)",
        ],
      },
      {
        type: "list",
        title: "Participation aux acquêts",
        items: [
          "Fonctionne comme une séparation de biens pendant le mariage",
          "En cas de dissolution, l'enrichissement de chacun pendant l'union est comparé et partiellement compensé",
          "Régime hybride, moins courant, souvent choisi pour combiner indépendance pendant le mariage et équité en cas de séparation",
          "Demande également un contrat signé devant notaire",
        ],
      },
      {
        type: "text",
        title: "Quand consulter un notaire",
        paragraphs: [
          "Un rendez-vous notaire est recommandé dès que la situation patrimoniale sort du cas le plus simple : différence de patrimoine importante entre les conjoints, activité indépendante, enfants d'une union précédente, bien immobilier déjà détenu avant le mariage. Le contrat de mariage doit être signé avant la cérémonie ; comptez plusieurs semaines de délai pour le rendez-vous et la rédaction de l'acte.",
        ],
      },
      {
        type: "text",
        title: "Ce que le contrat ne couvre pas",
        paragraphs: [
          "Le régime matrimonial encadre la propriété des biens, mais ne remplace pas un testament pour organiser la succession, ni un pacte civil de solidarité pour un couple qui ne souhaite pas se marier. Ce sont des outils juridiques distincts, à ne pas confondre lors de la préparation du mariage.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Ce sujet mérite d'être traité tôt dans votre [rétroplanning mariage mois par mois](/blog/retroplanning-mariage-mois-par-mois), avant que les autres démarches administratives ne s'accumulent. Voir aussi [changement de nom après le mariage](/blog/changement-nom-apres-mariage) pour la suite des démarches une fois marié.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The matrimonial regime determines how property is owned and shared during the marriage, and above all how it is divided in case of divorce or death. Without a marriage contract signed at a notary, one regime applies automatically in France: community of acquests. Many couples only discover how it works at the point of a separation, when it is actually decided before the wedding.",
        ],
      },
      {
        type: "list",
        title: "Community of acquests (the default regime)",
        items: [
          "Applies automatically if no contract is signed",
          "Property acquired before the marriage stays each spouse's own",
          "Property acquired during the marriage (salaries, joint purchases) belongs to both",
          "Property received through inheritance or gift stays personal, even during the marriage",
        ],
      },
      {
        type: "list",
        title: "Separation of property",
        items: [
          "Each spouse remains the owner of what they acquire, before and during the marriage",
          "Particularly useful if one spouse runs an independent or higher-risk business activity",
          "Requires a marriage contract signed at a notary before the ceremony",
          "Can complicate splitting property that is genuinely shared (a primary residence bought together, for example)",
        ],
      },
      {
        type: "list",
        title: "Participation in acquests",
        items: [
          "Works like separation of property during the marriage",
          "Upon dissolution, each spouse's gain during the union is compared and partly balanced out",
          "A hybrid regime, less common, often chosen to combine independence during the marriage with fairness upon separation",
          "Also requires a contract signed at a notary",
        ],
      },
      {
        type: "text",
        title: "When to consult a notary",
        paragraphs: [
          "A notary appointment is recommended as soon as the financial picture moves past the simplest case: a significant wealth gap between spouses, independent business activity, children from a previous relationship, real estate already owned before the marriage. The marriage contract must be signed before the ceremony; plan several weeks for the appointment and drafting the document.",
        ],
      },
      {
        type: "text",
        title: "What the contract does not cover",
        paragraphs: [
          "The matrimonial regime governs property ownership, but it does not replace a will for organizing inheritance, nor a civil partnership agreement for a couple who does not want to marry. These are separate legal tools, worth not confusing while preparing the wedding.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "This topic deserves to be handled early in your [month-by-month wedding timeline](/blog/retroplanning-mariage-mois-par-mois), before other administrative steps start piling up. See also [changing your name after the wedding](/blog/changement-nom-apres-mariage) for the steps that follow once you are married.",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_75_94_FR, en: POSTS_75_94_EN } = pairsToArrays(pairs);
