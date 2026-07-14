import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "choisir-lieu-reception-types",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Château, domaine, grange ou restaurant : choisir son type de lieu",
    titleEn: "Château, estate, barn, or restaurant: choosing your venue type",
    excerptFr:
      "Château, domaine viticole, grange rénovée, restaurant, salle des fêtes : chaque type de lieu impose son budget, son ambiance et sa logistique. Ce qu'il faut vérifier avant de signer.",
    excerptEn:
      "Château, vineyard estate, renovated barn, restaurant, town hall: each venue type sets its own budget, mood, and logistics. What to check before you sign.",
    readingMinutes: 8,
    heroAltFr: "Différents types de lieux de réception de mariage",
    heroAltEn: "Different types of wedding reception venues",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le lieu de réception conditionne tout le reste : le budget disponible pour les autres postes, le style de la déco, et une bonne partie de la logistique jour J. Avant de visiter, il vaut mieux savoir quel type de lieu correspond à votre mariage plutôt que de tomber sous le charme d'un endroit qui ne colle pas à votre budget ou à votre nombre d'invités.",
        ],
      },
      {
        type: "list",
        title: "Château et domaine : le cadre, à un prix qui suit",
        items: [
          "Ambiance prestige immédiate, parc souvent inclus pour les photos",
          "Location de salle seule fréquente entre 4 000 et 12 000 € selon la région et la saison",
          "Traiteur imposé ou liste fermée dans beaucoup de châteaux, ce qui limite les négociations",
          "Hébergement sur place parfois disponible, pratique pour les invités qui viennent de loin",
          "Capacité et confort variables : certains parcs superbes n'ont qu'une petite salle de repli en cas de pluie",
        ],
      },
      {
        type: "list",
        title: "Domaine viticole : nature, terroir et flexibilité moyenne",
        items: [
          "Cadre naturel fort (vignes, chai, cour) sans le tarif château",
          "Souvent plus souple sur le choix du traiteur qu'un château classique",
          "Chai ou grange sur place utilisable en cas de mauvais temps",
          "Accès parfois compliqué pour des invités âgés (graviers, dénivelé)",
          "Dégustation ou animation autour du vin possible en cocktail",
        ],
      },
      {
        type: "list",
        title: "Grange rénovée : le compromis nature / budget",
        items: [
          "Style champêtre recherché, souvent moins cher qu'un château comparable",
          "Cuisine et équipements très variables d'un lieu à l'autre : demandez le détail",
          "Isolation thermique parfois faible, à surveiller pour un mariage d'hiver",
          "Location seule fréquente entre 2 000 et 6 000 €, traiteur libre dans la majorité des cas",
          "Vérifiez l'accès poids lourd pour la livraison du traiteur et de la sono",
        ],
      },
      {
        type: "list",
        title: "Restaurant et salle des fêtes : logistique simplifiée",
        items: [
          "Traiteur et personnel déjà en place, moins d'interlocuteurs à coordonner",
          "Formule souvent au forfait par invité, budget plus lisible dès le début",
          "Décor et ambiance déjà marqués, moins de personnalisation possible",
          "Salle des fêtes municipale : tarif très accessible, mais location de vaisselle, tables et sono à votre charge",
          "Capacité et horaires parfois contraints (fin de soirée fixée par la mairie)",
        ],
      },
      {
        type: "text",
        title: "Ce que le lieu impose sur le reste du budget",
        paragraphs: [
          "Un château avec traiteur imposé retire une marge de négociation que vous auriez ailleurs. Une grange sans cuisine équipée oblige le traiteur à prévoir un camion cuisine, ce qui se répercute sur son devis. Un restaurant au forfait par invité facilite la budgétisation mais laisse moins de place à un menu sur mesure.",
          "Avant de vous attacher à un lieu, demandez la liste complète de ce qui est inclus : tables, chaises, vaisselle, nappage, sono, éclairage, ménage. Deux lieux au même tarif de location peuvent avoir un écart de plusieurs milliers d'euros une fois tout le reste ajouté.",
        ],
      },
      {
        type: "list",
        title: "À vérifier absolument en visite",
        items: [
          "Capacité réelle assise ET debout (cocktail), pas seulement la capacité maximale annoncée",
          "Solution de repli en cas de pluie si une partie est en extérieur",
          "Horaire de fin de soirée imposé et règles de bruit (voisinage, arrêté municipal)",
          "Accès et stationnement pour les invités, le traiteur et les prestataires",
          "Ce qui est inclus dans le tarif de location vs facturé en supplément",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Une fois le type de lieu choisi, l'app centralise les devis, les statuts (prospect, en attente, réservé) et les échéances d'acompte pour chaque prestataire, du lieu au traiteur. Voir aussi [les cinq prestataires à réserver en priorité](/blog/cinq-prestataires-a-booker-priorite) et [comment négocier un devis](/blog/negocier-devis-mariage).",
          "Pour situer ce que la location de salle représente dans votre budget global, le [simulateur budget](/tools/budget-calculator) répartit automatiquement les postes selon votre enveloppe totale.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The reception venue shapes everything else: how much budget is left for other categories, the decor style, and a good chunk of day-of logistics. Before touring venues, it helps to know which type fits your wedding rather than falling for a place that does not match your budget or guest count.",
        ],
      },
      {
        type: "list",
        title: "Château and estate: the setting, at a matching price",
        items: [
          "Instant prestige atmosphere, grounds often included for photos",
          "Room rental alone often runs 4,000 to 12,000 euros depending on region and season",
          "Many châteaux impose their own caterer or a closed shortlist, which limits negotiation",
          "On-site lodging sometimes available, handy for guests traveling far",
          "Capacity and comfort vary a lot: some gorgeous grounds only have a small indoor backup room",
        ],
      },
      {
        type: "list",
        title: "Vineyard estate: nature, terroir, and moderate flexibility",
        items: [
          "Strong natural setting (vines, cellar, courtyard) without château pricing",
          "Often more flexible on caterer choice than a classic château",
          "On-site cellar or barn usable as weather backup",
          "Access can be tricky for older guests (gravel paths, slopes)",
          "Wine tasting or activity possible during the cocktail hour",
        ],
      },
      {
        type: "list",
        title: "Renovated barn: the nature and budget compromise",
        items: [
          "Popular rustic look, often cheaper than a comparable château",
          "Kitchen and equipment vary widely by venue: ask for the exact list",
          "Insulation can be weak, worth checking for a winter wedding",
          "Room rental alone often runs 2,000 to 6,000 euros, caterer usually open choice",
          "Check truck access for the caterer's delivery and the sound system",
        ],
      },
      {
        type: "list",
        title: "Restaurant and town hall room: simpler logistics",
        items: [
          "Caterer and staff already in place, fewer vendors to coordinate",
          "Often priced per guest, giving a clearer budget from the start",
          "Decor and atmosphere already set, less room for personalization",
          "Municipal hall: very affordable rate, but tableware, tables, and sound rental are on you",
          "Capacity and hours sometimes fixed (evening end time set by the town)",
        ],
      },
      {
        type: "text",
        title: "What the venue dictates for the rest of the budget",
        paragraphs: [
          "A château with an imposed caterer removes a negotiation lever you would have elsewhere. A barn without an equipped kitchen forces the caterer to bring a mobile kitchen, which shows up in their quote. A restaurant priced per guest simplifies budgeting but leaves less room for a custom menu.",
          "Before committing to a venue, ask for the full list of what is included: tables, chairs, tableware, linens, sound, lighting, cleaning. Two venues at the same rental price can differ by several thousand euros once everything else is added.",
        ],
      },
      {
        type: "list",
        title: "Must-check items during a site visit",
        items: [
          "Real seated AND standing (cocktail) capacity, not just the advertised maximum",
          "Weather backup plan if part of the event is outdoors",
          "Imposed end-of-evening time and noise rules (neighbors, local ordinance)",
          "Access and parking for guests, the caterer, and other vendors",
          "What is included in the rental rate versus billed as an extra",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Once you have settled on a venue type, the app centralizes quotes, statuses (prospect, pending, booked), and deposit deadlines for every vendor, from the venue to the caterer. See also [the five vendors to book first](/blog/cinq-prestataires-a-booker-priorite) and [how to negotiate a quote](/blog/negocier-devis-mariage).",
          "To see where the venue rental sits in your overall budget, the [budget calculator](/tools/budget-calculator) automatically splits categories based on your total envelope.",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-plein-air-plan-b-meteo",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Mariage en plein air : prévoir un vrai plan B météo",
    titleEn: "Outdoor wedding: planning a real weather backup",
    excerptFr:
      "Une cérémonie ou une réception en extérieur se joue à la météo. Voici comment construire un plan B qui fonctionne vraiment, pas juste une case cochée sur le contrat du lieu.",
    excerptEn:
      "An outdoor ceremony or reception rides on the weather. Here is how to build a backup plan that actually works, not just a box ticked on the venue contract.",
    readingMinutes: 6,
    heroAltFr: "Mariage en plein air avec tente en cas de pluie",
    heroAltEn: "Outdoor wedding with a rain tent backup",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "« On verra bien pour la météo » est la phrase qui coûte le plus cher un jour de pluie. Un mariage en plein air, cérémonie laïque dans un jardin, cocktail sous les arbres, dîner en terrasse, demande un plan B concret, pas une vague intention de « se replier à l'intérieur si besoin ».",
        ],
      },
      {
        type: "list",
        title: "Ce qu'un vrai plan B doit couvrir",
        items: [
          "Un espace couvert avec une capacité réelle pour TOUS les invités assis, pas juste une partie",
          "Une tente ou un chapiteau réservé et confirmé, pas « on peut en trouver une en dernière minute »",
          "Un sol praticable en cas de pluie (bâche, plancher) si le repli se fait sur de l'herbe",
          "Un chauffage d'appoint si le repli est une tente non isolée, surtout en mai ou en septembre",
          "Un plan pour les photos si le parc devient impraticable",
        ],
      },
      {
        type: "text",
        title: "Le vrai coût d'un plan B improvisé",
        paragraphs: [
          "Louer une tente en urgence 48 heures avant le mariage coûte souvent le double d'une réservation anticipée, quand un loueur a encore du stock disponible. Beaucoup n'en ont plus en pleine saison. Le plan B se budgète et se réserve en même temps que le plan A, pas après.",
          "Si votre lieu dispose d'une salle intérieure en repli, vérifiez sa capacité réelle en configuration dîner assis, pas seulement en configuration debout pour un cocktail. Une salle qui « peut accueillir 150 personnes debout » peut n'en asseoir que 80.",
        ],
      },
      {
        type: "list",
        title: "Calendrier de décision réaliste",
        items: [
          "J-15 : vérifier que la solution de repli (tente, salle) est bien réservée et payée",
          "J-3 : première consultation météo sérieuse, informer le traiteur d'une possible bascule",
          "J-1 : décision quasi définitive avec les prestataires clés (traiteur, DJ, fleuriste)",
          "Jour J matin : décision finale avant l'installation, communiquée à toute l'équipe",
        ],
      },
      {
        type: "text",
        title: "Briefer les prestataires en amont",
        paragraphs: [
          "Le traiteur, le fleuriste et le DJ doivent connaître le plan B avant le jour J, pas le découvrir sur place. Une installation extérieure et une installation intérieure ne demandent pas le même matériel ni le même temps de montage. Demandez à chacun combien de temps il lui faut pour basculer d'un plan à l'autre, et calez la décision finale en fonction de ce délai.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un mariage en plein air réussi n'est pas celui où il a fait beau. C'est celui où la pluie, si elle arrive, ne change rien à l'ambiance parce que tout était déjà prévu.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "La [timeline jour J](/tools/timeline) vous aide à caler les horaires de bascule plan A / plan B avec chaque prestataire, minute par minute. Voir aussi [gérer les imprévus le jour J](/blog/imprevus-jour-j-mariage) et le [planning jour J minute par minute](/blog/planning-jour-j-minute-par-minute).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "\"We will see about the weather\" is the sentence that costs the most on a rainy day. An outdoor wedding, a garden ceremony, cocktails under the trees, dinner on a terrace, needs a concrete backup plan, not a vague intention to \"move inside if needed.\"",
        ],
      },
      {
        type: "list",
        title: "What a real backup plan must cover",
        items: [
          "Covered space with real seated capacity for ALL guests, not just part of them",
          "A tent or marquee booked and confirmed, not \"we can find one last minute\"",
          "Walkable ground in case of rain (tarp, flooring) if the fallback is on grass",
          "Extra heating if the fallback is an uninsulated tent, especially in May or September",
          "A plan for photos if the grounds become unusable",
        ],
      },
      {
        type: "text",
        title: "The real cost of an improvised backup plan",
        paragraphs: [
          "Renting a tent 48 hours before the wedding often costs double an early booking, and only if a rental company still has stock during peak season. Many do not. The backup plan needs to be budgeted and booked alongside the main plan, not after it.",
          "If your venue has an indoor fallback room, check its real capacity for a seated dinner, not just its standing cocktail capacity. A room that \"holds 150 people standing\" might only seat 80.",
        ],
      },
      {
        type: "list",
        title: "A realistic decision timeline",
        items: [
          "15 days before: confirm the fallback (tent, room) is booked and paid for",
          "3 days before: first serious weather check, notify the caterer of a possible switch",
          "1 day before: near-final decision with key vendors (caterer, DJ, florist)",
          "Morning of: final call before setup, communicated to the whole team",
        ],
      },
      {
        type: "text",
        title: "Briefing vendors ahead of time",
        paragraphs: [
          "The caterer, florist, and DJ need to know the backup plan before the day, not discover it on site. An outdoor setup and an indoor setup do not need the same equipment or setup time. Ask each vendor how long they need to switch plans, and time the final decision around that window.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A successful outdoor wedding is not one where it happened to be sunny. It is one where rain, if it comes, changes nothing about the mood because everything was already planned.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The [day-of timeline](/tools/timeline) helps you time the plan A / plan B switch with each vendor, minute by minute. See also [handling day-of surprises](/blog/imprevus-jour-j-mariage) and [the minute-by-minute day-of schedule](/blog/planning-jour-j-minute-par-minute).",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-hiver-organiser",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Se marier en hiver : avantages, déco, logistique",
    titleEn: "Getting married in winter: advantages, decor, logistics",
    excerptFr:
      "Prix plus bas, prestataires plus disponibles, ambiance cocon : se marier entre décembre et février a de vrais atouts, à condition d'anticiper la lumière, le chauffage et les trajets des invités.",
    excerptEn:
      "Lower prices, more available vendors, a cozy mood: getting married between December and February has real upsides, as long as you plan for daylight, heating, and guest travel.",
    readingMinutes: 7,
    heroAltFr: "Mariage d'hiver avec décoration chaleureuse",
    heroAltEn: "Winter wedding with warm decor",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "L'hiver reste la saison la moins demandée pour se marier en France, ce qui joue directement en votre faveur sur les tarifs et les disponibilités. Mais un mariage en décembre, janvier ou février se prépare différemment d'un mariage de juin : la lumière du jour, le chauffage et les trajets des invités deviennent des sujets à part entière.",
        ],
      },
      {
        type: "list",
        title: "Les vrais avantages de l'hiver",
        items: [
          "Tarifs de lieu et de traiteur souvent inférieurs de 15 à 30% à la haute saison",
          "Prestataires plus disponibles, y compris les plus demandés (photographe, DJ)",
          "Beaucoup moins de mariages le même week-end dans votre région, moins de conflits d'agenda invités",
          "Ambiance intimiste et chaleureuse facile à créer : bougies, cheminée, tons profonds",
          "Lieux d'exception (châteaux, domaines) parfois accessibles à un budget serré",
        ],
      },
      {
        type: "list",
        title: "Ce qui demande une vraie anticipation",
        items: [
          "Jour très court : la nuit tombe parfois avant 17h30 en décembre, à intégrer dans l'horaire des photos",
          "Chauffage de la salle et des espaces extérieurs (vestiaire, fumoir, terrasse) à vérifier en amont",
          "Routes et trajets invités : neige ou verglas possibles selon la région, prévoir une marge horaire",
          "Tenue des mariés et des invités adaptée au froid, notamment pour les photos en extérieur",
          "Vestiaire dédié obligatoire : manteaux, écharpes, une centaine de vêtements à gérer sans perte",
        ],
      },
      {
        type: "text",
        title: "Caler le planning autour de la lumière",
        paragraphs: [
          "La photo de couple en extérieur, si vous y tenez, doit être calée avant la nuit tombante, ce qui pousse souvent la cérémonie plus tôt dans l'après-midi qu'en été. Beaucoup de couples choisissent une cérémonie en fin de matinée suivie d'un déjeuner-cocktail, plutôt qu'une cérémonie en fin d'après-midi qui laisserait trop peu de lumière pour les photos.",
        ],
      },
      {
        type: "list",
        title: "Idées de déco et ambiance hiver",
        items: [
          "Bougies en nombre, guirlandes lumineuses chaudes, cheminée si le lieu en a une",
          "Palette profonde : bordeaux, vert sapin, doré, terracotta",
          "Fleurs de saison (amaryllis, anémones, eucalyptus) plutôt que des variétés importées et coûteuses",
          "Boissons chaudes en accueil (vin chaud, chocolat) très appréciées des invités qui arrivent du froid",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Voir aussi notre article sur [se marier en automne](/blog/mariage-automne-organiser) si vous hésitez entre les deux saisons creuses. La [timeline jour J](/tools/timeline) permet de bien caler les horaires selon la lumière disponible, un point souvent oublié en hiver.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Winter remains the least requested season for weddings in France, which works directly in your favor on pricing and availability. But a December, January, or February wedding needs different planning than a June one: daylight, heating, and guest travel become real topics on their own.",
        ],
      },
      {
        type: "list",
        title: "The real advantages of winter",
        items: [
          "Venue and catering rates often 15 to 30% lower than peak season",
          "Vendors are more available, including the most sought after (photographer, DJ)",
          "Far fewer weddings the same weekend in your area, fewer guest calendar conflicts",
          "Intimate, warm atmosphere is easy to create: candles, fireplace, deep tones",
          "Exceptional venues (châteaux, estates) sometimes within a tighter budget",
        ],
      },
      {
        type: "list",
        title: "What needs real advance planning",
        items: [
          "Very short daylight: it can get dark before 5:30 pm in December, factor that into the photo schedule",
          "Heating for the venue and outdoor spaces (coat check, smoking area, terrace) to check in advance",
          "Roads and guest travel: snow or ice possible depending on region, build in extra time",
          "Attire for the couple and guests suited to the cold, especially for outdoor photos",
          "A dedicated coat check is a must: coats, scarves, a hundred items to manage without losses",
        ],
      },
      {
        type: "text",
        title: "Building the schedule around daylight",
        paragraphs: [
          "If you want an outdoor couple's photo, it needs to happen before dark, which often pushes the ceremony earlier in the afternoon than in summer. Many couples choose a late-morning ceremony followed by a lunch cocktail, rather than a late-afternoon ceremony that would leave too little light for photos.",
        ],
      },
      {
        type: "list",
        title: "Winter decor and mood ideas",
        items: [
          "Plenty of candles, warm string lights, a fireplace if the venue has one",
          "Deep palette: burgundy, pine green, gold, terracotta",
          "Seasonal flowers (amaryllis, anemones, eucalyptus) rather than costly imported varieties",
          "Warm drinks at welcome (mulled wine, hot chocolate) that guests arriving from the cold love",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "See also our piece on [getting married in autumn](/blog/mariage-automne-organiser) if you are torn between the two off-peak seasons. The [day-of timeline](/tools/timeline) helps time your schedule around available daylight, a detail often missed in winter.",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-automne-organiser",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Se marier en automne : couleurs, saison, budget",
    titleEn: "Getting married in autumn: colors, season, budget",
    excerptFr:
      "Palette chaude, lumière dorée, tarifs de basse saison : l'automne a tout pour plaire aux couples qui veulent une belle ambiance sans le budget de l'été.",
    excerptEn:
      "Warm palette, golden light, off-peak pricing: autumn has a lot going for couples who want a beautiful mood without a summer budget.",
    readingMinutes: 7,
    heroAltFr: "Mariage d'automne avec feuillages et lumière dorée",
    heroAltEn: "Autumn wedding with foliage and golden light",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Septembre et octobre sont devenus des mois de plus en plus demandés pour se marier, sans atteindre les tarifs de juin ou juillet. La lumière rasante de fin d'après-midi, les couleurs des feuillages et une météo souvent encore clémente en font une saison de compromis intéressante.",
        ],
      },
      {
        type: "list",
        title: "Une palette qui s'accorde naturellement",
        items: [
          "Terracotta, bordeaux, moutarde, vert olive : des teintes qui s'accordent avec le décor naturel de saison",
          "Fleurs de saison : dahlias, chrysanthèmes, roses tardives, feuillages cuivrés",
          "Bougies et éclairage chaud, particulièrement mis en valeur par les soirées qui raccourcissent",
          "Fruits et éléments de saison (courges, raisin, figues) sur les tables ou dans la déco",
        ],
      },
      {
        type: "text",
        title: "L'avantage tarifaire de la moyenne saison",
        paragraphs: [
          "Septembre et surtout octobre restent moins demandés que juin à août, avec des tarifs de lieu et traiteur généralement inférieurs de 10 à 20%. Les prestataires les plus recherchés (photographes, DJ) ont aussi plus de disponibilités qu'en plein été, ce qui laisse plus de choix même en réservant tardivement.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'il faut anticiper malgré tout",
        items: [
          "Météo plus incertaine qu'en été : un plan B pour l'extérieur reste indispensable",
          "Journées qui raccourcissent vite en octobre, à intégrer dans l'horaire des photos",
          "Températures en baisse en soirée : prévoir un chauffage d'appoint en extérieur",
          "Fleurs de saison disponibles, mais certaines variétés d'été disparaissent des catalogues",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour construire votre palette, notre guide sur les [palettes de couleurs de mariage](/blog/palette-couleurs-mariage) détaille des associations qui fonctionnent bien avec les tons automnaux. Si vous hésitez entre automne et hiver, comparez avec [se marier en hiver](/blog/mariage-hiver-organiser).",
          "Le [simulateur budget](/tools/budget-calculator) vous aide à voir concrètement ce que l'avantage tarifaire de la basse saison peut libérer sur d'autres postes.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "September and October have become increasingly popular months for weddings, without reaching June or July pricing. Low late-afternoon light, foliage colors, and often still mild weather make it an interesting compromise season.",
        ],
      },
      {
        type: "list",
        title: "A palette that fits naturally",
        items: [
          "Terracotta, burgundy, mustard, olive green: tones that match the season's natural backdrop",
          "Seasonal flowers: dahlias, chrysanthemums, late-season roses, coppery foliage",
          "Candles and warm lighting, especially flattering as evenings get shorter",
          "Seasonal fruit and elements (squash, grapes, figs) on tables or in the decor",
        ],
      },
      {
        type: "text",
        title: "The shoulder-season pricing advantage",
        paragraphs: [
          "September, and especially October, stay less in demand than June through August, with venue and catering rates typically 10 to 20% lower. The most sought-after vendors (photographers, DJs) also have more availability than in peak summer, leaving more choice even for a later booking.",
        ],
      },
      {
        type: "list",
        title: "What to plan for anyway",
        items: [
          "Weather more unpredictable than summer: an outdoor backup plan is still essential",
          "Days shorten fast in October, factor that into the photo schedule",
          "Evening temperatures drop: plan extra heating for outdoor spaces",
          "Seasonal flowers are available, but some summer varieties disappear from catalogs",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To build your palette, our [wedding color palette guide](/blog/palette-couleurs-mariage) covers combinations that work well with autumn tones. If you are torn between autumn and winter, compare with [getting married in winter](/blog/mariage-hiver-organiser).",
          "The [budget calculator](/tools/budget-calculator) helps you see concretely what the off-peak pricing advantage can free up for other categories.",
        ],
      },
    ],
  }),

  postPair({
    slug: "invites-ages-pmr-accessibilite",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Invités âgés et PMR : rendre le mariage accessible",
    titleEn: "Older and mobility-impaired guests: making your wedding accessible",
    excerptFr:
      "Grands-parents, invités en fauteuil, mobilité réduite : quelques ajustements concrets sur le lieu, le placement et le transport évitent une journée compliquée pour eux, et pour vous.",
    excerptEn:
      "Grandparents, wheelchair users, reduced mobility: a few concrete adjustments to the venue, seating, and transport spare them, and you, a difficult day.",
    readingMinutes: 6,
    heroAltFr: "Mariage accessible pour invités à mobilité réduite",
    heroAltEn: "Accessible wedding for mobility-impaired guests",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un mariage rassemble souvent plusieurs générations, des grands-parents de 85 ans aux nouveau-nés. Prévoir l'accessibilité n'est pas réservé aux invités officiellement en situation de handicap : elle bénéficie à tous les invités qui ont du mal à rester debout longtemps, à monter des marches ou à se déplacer sur un sol irrégulier.",
        ],
      },
      {
        type: "list",
        title: "Le lieu : ce qu'il faut vérifier en visite",
        items: [
          "Accès sans marches ou avec rampe entre le parking, la cérémonie et la salle",
          "Sol praticable en fauteuil ou avec une canne (gravier épais et pelouse posent problème)",
          "Toilettes accessibles à proximité de la salle, pas à l'autre bout du parc",
          "Distance de marche entre les différents espaces (cérémonie, cocktail, dîner)",
          "Places assises disponibles pendant le cocktail, pas uniquement debout pendant deux heures",
        ],
      },
      {
        type: "list",
        title: "Placement : penser proximité, pas seulement affinités",
        items: [
          "Tables des invités âgés proches des toilettes et de la sortie",
          "Éviter les tables loin de la piste de danse et de la sono, le bruit fatigue vite",
          "Prévoir une table accessible en fauteuil (espace suffisant, pas de nappe qui traîne au sol)",
          "Grouper les invités qui peuvent s'entraider plutôt que de les isoler par obligation de rang",
        ],
      },
      {
        type: "text",
        title: "Le transport, souvent le point le plus négligé",
        paragraphs: [
          "Un lieu de réception isolé, accessible seulement en voiture, peut exclure de fait des invités âgés qui ne conduisent plus le soir ou qui n'ont personne pour les accompagner. Une navette, même simple, avec un point de rendez-vous central en ville, change la donne pour ces invités.",
        ],
      },
      {
        type: "list",
        title: "Communiquer les besoins via le RSVP",
        items: [
          "Ajouter une question simple sur les besoins d'accessibilité ou de mobilité dans le formulaire RSVP",
          "Demander si un accompagnement est nécessaire entre le parking et la salle",
          "Prévoir une case libre pour tout besoin spécifique non couvert par les questions standards",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le formulaire RSVP de Fiancé permet d'ajouter des questions personnalisées, y compris sur l'accessibilité, sans que l'invité ait besoin de créer un compte. Voir aussi [gérer sa liste d'invités sans conflits](/blog/liste-invites-mariage-sans-conflits) et [le transport et la navette invités](/blog/transport-navette-invites-mariage). Le [plan de table](/tools/seating-chart) facilite le placement en fonction de ces contraintes.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A wedding often brings several generations together, from 85-year-old grandparents to newborns. Planning for accessibility is not just for guests officially registered as disabled: it benefits every guest who struggles standing for long stretches, climbing steps, or moving over uneven ground.",
        ],
      },
      {
        type: "list",
        title: "The venue: what to check on a visit",
        items: [
          "Step-free or ramped access between parking, the ceremony, and the reception hall",
          "Walkable ground for a wheelchair or a cane (thick gravel and lawn are problematic)",
          "Accessible restrooms near the hall, not on the far side of the grounds",
          "Walking distance between different spaces (ceremony, cocktail, dinner)",
          "Seating available during the cocktail hour, not just standing for two hours",
        ],
      },
      {
        type: "list",
        title: "Seating: think proximity, not just affinity",
        items: [
          "Seat older guests near restrooms and the exit",
          "Avoid tables far from the dance floor and sound system, noise gets tiring fast",
          "Plan a wheelchair-accessible table (enough space, no tablecloth dragging on the floor)",
          "Group guests who can help each other rather than isolating them by rank",
        ],
      },
      {
        type: "text",
        title: "Transport, often the most overlooked point",
        paragraphs: [
          "A remote venue only reachable by car can effectively exclude older guests who no longer drive at night or have no one to bring them. A shuttle, even a simple one, with a central pickup point in town, changes the picture for those guests.",
        ],
      },
      {
        type: "list",
        title: "Communicating needs through RSVP",
        items: [
          "Add a simple accessibility or mobility question to the RSVP form",
          "Ask whether help is needed between parking and the hall",
          "Leave an open field for any specific need the standard questions do not cover",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Fiancé's RSVP form lets you add custom questions, including on accessibility, without the guest needing an account. See also [managing your guest list without conflicts](/blog/liste-invites-mariage-sans-conflits) and [guest transport and shuttles](/blog/transport-navette-invites-mariage). The [seating chart](/tools/seating-chart) makes it easy to place guests with these constraints in mind.",
        ],
      },
    ],
  }),

  postPair({
    slug: "animaux-mariage-chien-ceremonie",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Animaux au mariage : intégrer son chien sans imprévu",
    titleEn: "Pets at your wedding: including your dog without surprises",
    excerptFr:
      "Faire porter les alliances par son chien ou simplement l'avoir sur les photos : ça se prépare. Le point sur les règles du lieu, le référent du jour et le plan B.",
    excerptEn:
      "Having your dog carry the rings or just be in the photos takes planning. Venue rules, a day-of handler, and a backup plan.",
    readingMinutes: 5,
    heroAltFr: "Chien participant à une cérémonie de mariage",
    heroAltEn: "Dog taking part in a wedding ceremony",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "De plus en plus de couples veulent inclure leur chien dans le mariage, ne serait-ce que pour les photos ou pour l'entrée de cérémonie. C'est tout à fait faisable, à condition de traiter ça comme un point logistique à part entière, pas comme un détail qui se réglera de lui-même sur place.",
        ],
      },
      {
        type: "list",
        title: "Vérifier les règles du lieu en amont",
        items: [
          "Certains lieux (châteaux, restaurants) interdisent les animaux, même pour une heure",
          "D'autres l'autorisent uniquement en extérieur, pas dans la salle de réception",
          "Demandez explicitement, ne partez pas du principe que « ça devrait passer »",
          "Vérifiez aussi les règles du traiteur si le chien doit être proche des tables",
        ],
      },
      {
        type: "list",
        title: "Un référent dédié, pas les mariés",
        items: [
          "Désignez une personne (ami, famille, prestataire spécialisé) responsable du chien pour la journée",
          "Cette personne gère les pauses, l'eau, les besoins et le stress de l'animal",
          "Elle amène le chien au bon moment (entrée de cérémonie, photos) puis le récupère ensuite",
          "Certains prestataires « chien d'honneur » existent dans les grandes villes pour ce rôle précis",
        ],
      },
      {
        type: "text",
        title: "Le moment le plus simple : les photos, pas toute la soirée",
        paragraphs: [
          "La plupart des couples limitent la présence du chien à la cérémonie et à une séance photo, puis le font ramener chez un proche avant le repas et la soirée. Une cérémonie prend rarement plus de 30 minutes, un temps que la plupart des chiens gèrent bien avec un peu de préparation. Une soirée entière avec de la musique forte et beaucoup de monde est plus stressante pour l'animal.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Prévoyez toujours un plan B : si le chien est stressé, malade ou simplement pas coopératif le jour J, la personne référente doit pouvoir décider de le retirer sans vous déranger.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Ajoutez le passage du chien comme une étape à part entière dans votre [timeline jour J](/tools/timeline), avec la personne référente identifiée. Voir aussi [gérer les imprévus le jour J](/blog/imprevus-jour-j-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "More and more couples want to include their dog in the wedding, even if just for photos or walking down the aisle. It is entirely doable, as long as you treat it as its own logistics item, not a detail that will sort itself out on the day.",
        ],
      },
      {
        type: "list",
        title: "Check the venue's rules in advance",
        items: [
          "Some venues (châteaux, restaurants) do not allow animals, even for an hour",
          "Others allow them outdoors only, not inside the reception hall",
          "Ask explicitly, do not assume it will be fine",
          "Also check the caterer's rules if the dog will be near the tables",
        ],
      },
      {
        type: "list",
        title: "A dedicated handler, not the couple",
        items: [
          "Name one person (friend, family, or specialized vendor) responsible for the dog all day",
          "That person handles breaks, water, needs, and the animal's stress level",
          "They bring the dog in at the right moment (ceremony entrance, photos) and take it away after",
          "Dedicated \"dog of honor\" handler services exist in big cities for exactly this role",
        ],
      },
      {
        type: "text",
        title: "The easiest window: photos, not the whole evening",
        paragraphs: [
          "Most couples limit the dog's presence to the ceremony and a photo session, then have it picked up by a family member before the dinner and party. A ceremony rarely runs longer than 30 minutes, a stretch most dogs handle fine with a bit of prep. A full evening with loud music and a crowd is more stressful for the animal.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always have a backup plan: if the dog is stressed, unwell, or simply uncooperative on the day, the handler should be able to remove it without disturbing you.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Add the dog's appearance as its own step in your [day-of timeline](/tools/timeline), with the handler identified. See also [handling day-of surprises](/blog/imprevus-jour-j-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-eco-responsable-conseils",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Mariage éco-responsable : gestes concrets",
    titleEn: "Eco-friendly wedding: concrete steps",
    excerptFr:
      "Pas besoin de tout révolutionner : quelques choix concrets (fleurs et repas de saison, moins de jetable, invitations numériques, seconde main) réduisent vraiment l'impact, sans complexifier l'organisation.",
    excerptEn:
      "No need to overhaul everything: a few concrete choices (seasonal flowers and food, less single-use, digital invites, secondhand) genuinely cut the impact without complicating your planning.",
    readingMinutes: 6,
    heroAltFr: "Mariage éco-responsable avec fleurs locales",
    heroAltEn: "Eco-friendly wedding with local flowers",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "L'éco-responsabilité d'un mariage n'est pas une case à cocher ni un thème de déco. C'est une série de choix concrets, faits poste par poste, que vous pouvez adopter en partie sans transformer l'organisation en projet militant. Voici les leviers qui ont le plus d'effet pour le moins d'effort.",
        ],
      },
      {
        type: "list",
        title: "Traiteur et fleurs : le local et le saisonnier",
        items: [
          "Un menu construit autour de produits de saison coûte souvent moins cher et voyage moins",
          "Des fleurs locales et de saison plutôt qu'importées réduisent transport et emballage",
          "Demandez au traiteur d'où viennent les produits phares du menu, pas juste le prix",
          "Un traiteur qui récupère les surplus (dons, personnel) limite le gaspillage alimentaire",
        ],
      },
      {
        type: "list",
        title: "Réduire le jetable sans perdre en style",
        items: [
          "Vaisselle et verrerie louées plutôt qu'achetées puis jetées",
          "Décoration réutilisable (bougies, contenants en verre) plutôt que ballons et confettis",
          "Marque-places et menus imprimés en quantité juste, pas en réserve « au cas où »",
          "Fleurs de cérémonie réutilisées ensuite pour décorer les tables du dîner",
        ],
      },
      {
        type: "list",
        title: "Invitations et communication numériques",
        items: [
          "Save-the-date et faire-part numériques pour une partie des invités, réservez le papier aux proches",
          "RSVP en ligne plutôt que carton-réponse à retourner par courrier",
          "Site ou page de mariage centralisant infos pratiques, évitant les rappels papier multiples",
        ],
      },
      {
        type: "text",
        title: "Tenue et alliances : la seconde main a de la valeur",
        paragraphs: [
          "Une robe ou un costume de seconde main, loué ou acheté d'occasion, coûte souvent moins cher qu'un neuf et évite une pièce portée une seule fois. Des alliances en or recyclé ou de seconde main existent chez plusieurs joailliers, à un tarif comparable au neuf.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Choisissez deux ou trois leviers qui vous parlent vraiment plutôt que de tout appliquer à moitié. Un menu de saison bien fait a plus d'impact qu'une liste de dix bonnes intentions non tenues.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour le choix des fleurs, notre article sur les [fleurs de saison et locales](/blog/fleurs-mariage-saison-locales) détaille le calendrier et les économies possibles. Le [comparateur de devis traiteur](/blog/comparer-devis-traiteur-mariage) vous aide à poser les bonnes questions sur l'origine des produits.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Making a wedding eco-friendly is not a box to check or a decor theme. It is a series of concrete choices, made category by category, that you can adopt partially without turning your planning into an activist project. Here are the levers with the most effect for the least effort.",
        ],
      },
      {
        type: "list",
        title: "Catering and flowers: go local and seasonal",
        items: [
          "A menu built around seasonal produce often costs less and travels less",
          "Local, seasonal flowers instead of imported ones cut transport and packaging",
          "Ask the caterer where the menu's key ingredients come from, not just the price",
          "A caterer who redistributes surplus food (donations, staff meals) limits waste",
        ],
      },
      {
        type: "list",
        title: "Cutting single-use without losing style",
        items: [
          "Rented tableware and glassware instead of buying then discarding",
          "Reusable decor (candles, glass containers) instead of balloons and confetti",
          "Place cards and menus printed to the exact count, not a \"just in case\" stack",
          "Ceremony flowers reused afterward to decorate the dinner tables",
        ],
      },
      {
        type: "list",
        title: "Digital invitations and communication",
        items: [
          "Digital save-the-dates and invites for part of your list, save paper for close family",
          "Online RSVP instead of a reply card mailed back",
          "A wedding site or page centralizing practical info, avoiding repeated paper reminders",
        ],
      },
      {
        type: "text",
        title: "Attire and rings: secondhand has real value",
        paragraphs: [
          "A secondhand or rented dress or suit often costs less than new and avoids a piece worn once. Rings in recycled or secondhand gold exist through several jewelers, at a price comparable to new.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Pick two or three levers that genuinely resonate rather than applying all of them half-heartedly. A well-executed seasonal menu has more impact than a list of ten good intentions not followed through.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For flower choices, our [seasonal and local flowers](/blog/fleurs-mariage-saison-locales) article covers the calendar and possible savings. The [caterer quote comparator](/blog/comparer-devis-traiteur-mariage) helps you ask the right questions about ingredient sourcing.",
        ],
      },
    ],
  }),

  postPair({
    slug: "fleurs-mariage-saison-locales",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Fleurs de saison et locales : économiser sans sacrifier le style",
    titleEn: "Seasonal and local flowers: saving without sacrificing style",
    excerptFr:
      "Une pivoine en décembre coûte cher et voyage de loin. Le calendrier des fleurs de saison en France, et comment briefer un fleuriste pour un résultat aussi beau, moins cher.",
    excerptEn:
      "A peony in December is expensive and travels far. The French seasonal flower calendar, and how to brief a florist for a look that is just as beautiful, for less.",
    readingMinutes: 7,
    heroAltFr: "Fleurs de mariage de saison et locales",
    heroAltEn: "Seasonal, local wedding flowers",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le poste fleurs peut varier du simple au triple selon que vous demandez des variétés hors saison importées par avion, ou des fleurs locales cultivées à la bonne période. Le résultat visuel peut être tout aussi réussi, à condition de composer avec ce que la saison propose plutôt que contre elle.",
        ],
      },
      {
        type: "text",
        title: "Calendrier des fleurs par saison en France",
        paragraphs: [
          "Printemps (mars à mai) : pivoines, renoncules, tulipes, muguet, lilas. Une palette pastel et fraîche, très demandée, donc à réserver tôt.",
          "Été (juin à août) : roses, dahlias, delphiniums, cosmos, tournesols. La plus large offre de l'année, avec le plus de choix de couleurs.",
          "Automne (septembre à novembre) : dahlias tardifs, chrysanthèmes, amarante, feuillages cuivrés. Des teintes chaudes qui s'accordent naturellement à la saison.",
          "Hiver (décembre à février) : amaryllis, anémones, hellébores, eucalyptus, branches et baies. Moins de variétés, mais des compositions structurées très élégantes.",
        ],
      },
      {
        type: "list",
        title: "L'écart de coût entre saisonnier et importé",
        items: [
          "Les pivoines hors saison (novembre à mars) peuvent coûter deux à trois fois plus cher qu'en pleine saison",
          "Une rose importée toute l'année reste souvent le repère de prix le plus stable",
          "Les fleurs séchées ou stabilisées permettent d'anticiper l'achat sans contrainte saisonnière",
          "Le feuillage (eucalyptus, olivier) coûte généralement moins cher que les fleurs et remplit vite un bouquet ou un centre de table",
        ],
      },
      {
        type: "list",
        title: "Comment briefer votre fleuriste",
        items: [
          "Donnez une palette de couleurs plutôt qu'une liste stricte de variétés précises",
          "Demandez explicitement une proposition « fleurs de saison » avant de fixer un budget",
          "Précisez ce qui doit être livré (bouquet, boutonnières, centres de table) et à quelle heure",
          "Demandez si les fleurs de cérémonie peuvent être réutilisées pour le dîner",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un fleuriste expérimenté peut composer un rendu proche de vos photos d'inspiration avec des variétés de saison. N'hésitez pas à montrer l'inspiration et à demander une alternative locale.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Voir aussi [comment choisir son fleuriste](/blog/choisir-fleuriste-mariage) et [mariage éco-responsable](/blog/mariage-eco-responsable-conseils) pour aller plus loin. Notre article sur [négocier un devis](/blog/negocier-devis-mariage) s'applique aussi bien au fleuriste qu'au traiteur.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The flower budget can swing from modest to triple depending on whether you ask for flown-in out-of-season varieties or local flowers grown at the right time. The visual result can be just as good, as long as you work with the season rather than against it.",
        ],
      },
      {
        type: "text",
        title: "Seasonal flower calendar in France",
        paragraphs: [
          "Spring (March to May): peonies, ranunculus, tulips, lily of the valley, lilac. A fresh pastel palette, high demand, so book early.",
          "Summer (June to August): roses, dahlias, delphiniums, cosmos, sunflowers. The widest availability of the year, with the most color choice.",
          "Autumn (September to November): late-season dahlias, chrysanthemums, amaranth, coppery foliage. Warm tones that naturally match the season.",
          "Winter (December to February): amaryllis, anemones, hellebores, eucalyptus, branches and berries. Fewer varieties, but very elegant structured arrangements.",
        ],
      },
      {
        type: "list",
        title: "The cost gap between seasonal and imported",
        items: [
          "Out-of-season peonies (November to March) can cost two to three times more than in season",
          "A rose imported year-round is often the most stable price benchmark",
          "Dried or preserved flowers let you buy ahead without seasonal constraints",
          "Foliage (eucalyptus, olive) usually costs less than flowers and quickly fills a bouquet or centerpiece",
        ],
      },
      {
        type: "list",
        title: "How to brief your florist",
        items: [
          "Give a color palette rather than a strict list of specific varieties",
          "Explicitly ask for a \"seasonal flower\" proposal before setting a budget",
          "Specify what needs delivering (bouquet, boutonnieres, centerpieces) and at what time",
          "Ask whether ceremony flowers can be reused for the dinner",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "An experienced florist can create a look close to your inspiration photos using seasonal varieties. Show your inspiration and ask for a local alternative.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "See also [how to choose your florist](/blog/choisir-fleuriste-mariage) and [eco-friendly wedding](/blog/mariage-eco-responsable-conseils) for more. Our article on [negotiating a quote](/blog/negocier-devis-mariage) applies just as well to a florist as to a caterer.",
        ],
      },
    ],
  }),

  postPair({
    slug: "familles-recomposees-mariage",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Familles recomposées : placer et impliquer chacun",
    titleEn: "Blended families: seating and involving everyone",
    excerptFr:
      "Beaux-parents, demi-frères et soeurs, ex-conjoints présents : au-delà du plan de table, la question est de savoir qui a un rôle dans la journée, et comment le rendre clair sans blesser personne.",
    excerptEn:
      "Step-parents, half-siblings, an ex-spouse in attendance: beyond seating, the real question is who has a role in the day, and how to make it clear without hurting anyone.",
    readingMinutes: 7,
    heroAltFr: "Famille recomposée réunie pour un mariage",
    heroAltEn: "Blended family gathered for a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Une famille recomposée ajoute une couche de décisions qu'une famille classique n'a pas à gérer : qui s'assoit avec qui, qui prend la parole, qui figure sur les photos de famille. Ce n'est pas seulement une question de plan de table, c'est une question de rôle reconnu dans la journée.",
        ],
      },
      {
        type: "list",
        title: "Le placement : au-delà de la table des parents",
        items: [
          "Beaux-parents et parents biologiques rarement à la même table, sauf relation vraiment apaisée",
          "Demi-frères et soeurs placés selon leur proximité réelle avec vous, pas uniquement par lien de sang",
          "Une table « famille élargie » neutre peut désamorcer des choix de placement délicats",
          "Évitez de placer un nouveau conjoint juste en face d'un ex, même si la relation est cordiale",
        ],
      },
      {
        type: "text",
        title: "Les discours : qui parle, et de qui",
        paragraphs: [
          "Si plusieurs figures parentales veulent prendre la parole (père et beau-père, par exemple), décidez à l'avance de l'ordre et du temps de parole plutôt que de laisser la soirée trancher. Un discours mal cadré peut raviver une tension que tout le monde préférerait laisser de côté ce jour-là.",
        ],
      },
      {
        type: "list",
        title: "Impliquer sans forcer",
        items: [
          "Demandez à chacun s'il souhaite un rôle (lecture, accompagnement à l'autel, discours) plutôt que de l'imposer",
          "Un beau-parent qui vous a élevé peut avoir une place symbolique forte sans « remplacer » le parent biologique",
          "Les demi-frères et soeurs peuvent être associés à des tâches concrètes (accueil, photos) s'ils sont plus jeunes",
          "Restez flexible : certains préfèrent un rôle discret, d'autres apprécient d'être mis en avant",
        ],
      },
      {
        type: "text",
        title: "Sur les photos de famille",
        paragraphs: [
          "Prévenez le photographe en amont de la configuration familiale, avec une liste claire des combinaisons souhaitées (et de celles à éviter). C'est plus simple de le faire par écrit avant le jour J que d'improviser des regroupements sur place, sous le regard de tout le monde.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Si la situation touche aussi les faire-part, voir [faire-part et parents divorcés](/blog/faire-part-parents-divorces) pour la formulation. Le [plan de table](/tools/seating-chart) permet d'ajuster les placements facilement si une configuration ne fonctionne pas à l'essai, et [nos cinq règles de placement](/blog/plan-de-table-5-regles-placement) couvrent d'autres cas sensibles.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A blended family adds a layer of decisions a traditional family does not have to make: who sits with whom, who speaks, who appears in family photos. It is not just a seating question, it is a question of a recognized role in the day.",
        ],
      },
      {
        type: "list",
        title: "Seating: beyond the parents' table",
        items: [
          "Step-parents and biological parents rarely at the same table, unless the relationship is genuinely settled",
          "Half-siblings seated by their real closeness to you, not just by blood relation",
          "A neutral \"extended family\" table can defuse tricky seating choices",
          "Avoid seating a new partner directly across from an ex, even in a cordial relationship",
        ],
      },
      {
        type: "text",
        title: "Speeches: who speaks, and about whom",
        paragraphs: [
          "If several parental figures want to speak (father and stepfather, for instance), decide the order and time allotted in advance rather than let the evening sort it out. A poorly framed speech can reopen tension everyone would rather leave aside that day.",
        ],
      },
      {
        type: "list",
        title: "Involving without forcing",
        items: [
          "Ask each person whether they want a role (reading, walking you down the aisle, speech) rather than assigning it",
          "A step-parent who raised you can hold a strong symbolic place without \"replacing\" the biological parent",
          "Younger half-siblings can be given concrete tasks (welcoming guests, photos)",
          "Stay flexible: some prefer a low-key role, others appreciate being highlighted",
        ],
      },
      {
        type: "text",
        title: "On family photos",
        paragraphs: [
          "Brief the photographer ahead of time on the family setup, with a clear list of desired groupings (and combinations to avoid). It is easier to write it down before the day than to improvise groupings on site, in front of everyone.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "If the situation also affects invitations, see [invitations and divorced parents](/blog/faire-part-parents-divorces) for wording. The [seating chart](/tools/seating-chart) makes it easy to adjust placements if a configuration does not work on a trial run, and [our five seating rules](/blog/plan-de-table-5-regles-placement) cover other sensitive cases.",
        ],
      },
    ],
  }),

  postPair({
    slug: "transport-navette-invites-mariage",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Transport et navette invités : organiser les trajets",
    titleEn: "Guest transport and shuttles: organizing the trip",
    excerptFr:
      "Lieu isolé, parking limité, invités qui boivent : la navette n'est pas un détail de confort, c'est souvent ce qui évite un embouteillage à l'arrivée et des voitures mal garées toute la nuit.",
    excerptEn:
      "A remote venue, limited parking, guests who drink: a shuttle is not a nice-to-have, it is often what prevents a traffic jam on arrival and cars parked badly all night.",
    readingMinutes: 6,
    heroAltFr: "Navette de transport pour invités de mariage",
    heroAltEn: "Shuttle bus for wedding guests",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Dès que le lieu de réception est à plus de 20-30 minutes d'un centre-ville ou d'hébergements groupés, le transport des invités devient un sujet à traiter comme n'importe quel autre poste, avec un budget et un planning propres.",
        ],
      },
      {
        type: "list",
        title: "Quand une navette devient nécessaire",
        items: [
          "Lieu isolé, difficile d'accès sans voiture ou sans GPS fiable",
          "Parking limité qui ne peut pas absorber le nombre de véhicules invités",
          "Open bar ou consommation d'alcool prévue, avec un enjeu de sécurité au retour",
          "Beaucoup d'invités hébergés au même endroit (hôtel, gîte de groupe)",
        ],
      },
      {
        type: "text",
        title: "Caler les horaires de rotation",
        paragraphs: [
          "Une navette aller simple avant la cérémonie ne suffit généralement pas. Prévoyez au moins deux rotations : une à l'arrivée, avant la cérémonie ou le cocktail, et une ou plusieurs en fin de soirée, à des horaires fixes annoncés à l'avance (par exemple minuit et 2h). Les invités qui partent plus tôt doivent aussi avoir une option, pas uniquement ceux qui restent jusqu'au bout.",
        ],
      },
      {
        type: "list",
        title: "Communiquer clairement les points de rendez-vous",
        items: [
          "Indiquer un point de rendez-vous précis (adresse, repère visuel), pas juste « en ville »",
          "Préciser les horaires de chaque rotation sur le faire-part ou la page de mariage",
          "Prévoir un contact sur place (témoin, prestataire) en cas de retard ou de question",
          "Rappeler l'info la semaine du mariage, pas seulement des mois avant",
        ],
      },
      {
        type: "text",
        title: "Le parking, même avec une navette",
        paragraphs: [
          "Même en organisant une navette, une partie des invités viendra en voiture. Vérifiez la capacité réelle du parking du lieu, et prévoyez un fléchage ou une personne à l'entrée si l'accès n'est pas évident. Un parking saturé à l'heure de la cérémonie retarde tout le monde.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Ajoutez chaque rotation de navette comme une étape dans la [timeline jour J](/tools/timeline), avec l'horaire et le point de rendez-vous. Voir aussi [l'hébergement des invités](/blog/hebergement-invites-mariage), souvent lié au choix de la navette.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "As soon as the reception venue is more than 20 to 30 minutes from a town center or a cluster of lodging, guest transport becomes a topic to treat like any other category, with its own budget and schedule.",
        ],
      },
      {
        type: "list",
        title: "When a shuttle becomes necessary",
        items: [
          "Remote venue, hard to reach without a car or reliable GPS",
          "Limited parking that cannot absorb the number of guest vehicles",
          "Open bar or alcohol service planned, with a safety concern for the trip back",
          "Many guests staying at the same place (hotel, group rental)",
        ],
      },
      {
        type: "text",
        title: "Timing the rotations",
        paragraphs: [
          "A single one-way shuttle before the ceremony is usually not enough. Plan at least two rotations: one on arrival, before the ceremony or cocktail, and one or more late in the evening, at fixed times announced ahead (midnight and 2 am, for example). Guests leaving earlier also need an option, not just those staying until the end.",
        ],
      },
      {
        type: "list",
        title: "Communicating pickup points clearly",
        items: [
          "Give a precise pickup point (address, visual landmark), not just \"in town\"",
          "Note each rotation's timing on the invitation or wedding page",
          "Have an on-site contact (bridal party, vendor) for delays or questions",
          "Remind guests the week of the wedding, not just months ahead",
        ],
      },
      {
        type: "text",
        title: "Parking, even with a shuttle",
        paragraphs: [
          "Even with a shuttle organized, some guests will still drive. Check the venue's real parking capacity, and plan signage or someone at the entrance if access is not obvious. A parking lot at capacity during the ceremony delays everyone.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Add each shuttle rotation as a step in the [day-of timeline](/tools/timeline), with the time and pickup point. See also [guest lodging](/blog/hebergement-invites-mariage), often tied to your shuttle choice.",
        ],
      },
    ],
  }),

  postPair({
    slug: "welcome-bag-cadeaux-invites",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Welcome bags et cadeaux invités : idées et budget",
    titleEn: "Welcome bags and guest gifts: ideas and budget",
    excerptFr:
      "Les welcome bags font plaisir surtout aux invités qui logent sur place plusieurs nuits. Voici ce qui est vraiment utile, ce qui finit à la poubelle, et combien prévoir par sac.",
    excerptEn:
      "Welcome bags matter most to guests staying multiple nights. Here is what actually gets used, what ends up in the trash, and how much to budget per bag.",
    readingMinutes: 6,
    heroAltFr: "Welcome bag pour invités de mariage",
    heroAltEn: "Wedding welcome bag for guests",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le welcome bag est devenu presque un réflexe dans les mariages avec beaucoup d'invités venus de loin, mais il est facile d'y mettre trop de choses inutiles. L'objectif n'est pas d'impressionner, c'est de rendre le séjour de l'invité un peu plus simple.",
        ],
      },
      {
        type: "list",
        title: "Ce qui a vraiment de la valeur",
        items: [
          "Une bouteille d'eau et une petite collation, surtout après un long trajet",
          "Le programme du week-end avec les horaires et adresses (cérémonie, brunch du lendemain)",
          "Une carte ou un plan de la région si le lieu est peu connu",
          "Un produit local (spécialité, petit vin) qui a du sens avec la destination",
          "De quoi soulager un petit imprévu : pansements, mouchoirs, boules Quies pour la soirée",
        ],
      },
      {
        type: "list",
        title: "Ce qui finit généralement à la poubelle",
        items: [
          "Objets à votre effigie (mug, tote bag personnalisé) sans usage concret pour l'invité",
          "Confiseries en grande quantité, rarement toutes consommées",
          "Gadgets promotionnels sans lien avec le mariage ou la région",
        ],
      },
      {
        type: "text",
        title: "Un budget réaliste",
        paragraphs: [
          "Comptez généralement entre 8 et 20 € par sac selon le contenu, pour les seuls invités logés sur place plusieurs nuits. Inutile d'en prévoir pour tous les invités si une partie ne fait qu'un aller-retour dans la journée : ciblez ceux qui séjournent réellement.",
        ],
      },
      {
        type: "list",
        title: "Qui en a vraiment besoin",
        items: [
          "Invités venus de loin, logés à l'hôtel ou en gîte pour le week-end",
          "Invités arrivant la veille pour un week-end mariage sur deux jours",
          "Facultatif pour les invités locaux qui rentrent chez eux le soir même",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Croisez la liste des invités hébergés sur place avec votre suivi dans [l'hébergement des invités](/blog/hebergement-invites-mariage) pour cibler qui reçoit un welcome bag. Le [simulateur budget](/tools/budget-calculator) permet d'ajouter ce poste sans le laisser gonfler le budget global.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The welcome bag has become almost a reflex for weddings with many out-of-town guests, but it is easy to overload it with things nobody needs. The goal is not to impress, it is to make the guest's stay a little easier.",
        ],
      },
      {
        type: "list",
        title: "What actually has value",
        items: [
          "A water bottle and a small snack, especially after a long drive",
          "The weekend schedule with times and addresses (ceremony, next-day brunch)",
          "A map or guide to the area if the location is unfamiliar",
          "A local product (specialty food, small bottle of wine) that fits the destination",
          "Something for small mishaps: bandages, tissues, earplugs for the party",
        ],
      },
      {
        type: "list",
        title: "What usually ends up in the trash",
        items: [
          "Items branded with your names (mug, custom tote) with no real use for the guest",
          "Candy in large quantities, rarely finished",
          "Promotional gadgets unrelated to the wedding or the area",
        ],
      },
      {
        type: "text",
        title: "A realistic budget",
        paragraphs: [
          "Plan roughly 8 to 20 euros per bag depending on contents, for guests actually staying overnight. No need to prepare one for every guest if some are just visiting for the day: target those genuinely staying over.",
        ],
      },
      {
        type: "list",
        title: "Who really needs one",
        items: [
          "Guests traveling far, staying at a hotel or rental for the weekend",
          "Guests arriving the day before for a two-day wedding weekend",
          "Optional for local guests heading home the same evening",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Cross-check your list of overnight guests with your tracking in [guest lodging](/blog/hebergement-invites-mariage) to target who gets a welcome bag. The [budget calculator](/tools/budget-calculator) lets you add this line item without letting it inflate the overall budget.",
        ],
      },
    ],
  }),

  postPair({
    slug: "deco-centres-table-mariage",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Centres de table : louer, acheter ou faire soi-même",
    titleEn: "Centerpieces: rent, buy, or make your own",
    excerptFr:
      "Le poste centres de table peut aller du simple bocal de fleurs des champs à des compositions florales élaborées. Comparatif location, achat et DIY, et comment les coordonner avec le plan de table.",
    excerptEn:
      "Centerpieces can range from a simple mason jar of wildflowers to elaborate floral arrangements. Rental versus purchase versus DIY, and how to coordinate them with your seating chart.",
    readingMinutes: 6,
    heroAltFr: "Centres de table de mariage variés",
    heroAltEn: "Various wedding centerpieces",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les centres de table sont un des postes où l'écart de prix entre les options est le plus large, et où le choix dépend surtout du temps que vous êtes prêts à y consacrer plutôt que du budget seul.",
        ],
      },
      {
        type: "list",
        title: "La location : le plus simple, pas toujours le moins cher",
        items: [
          "Vases, bougeoirs, chandeliers loués chez un prestataire événementiel ou le fleuriste",
          "Installation et récupération souvent incluses, aucune logistique de votre côté",
          "Choix limité au catalogue du loueur, personnalisation réduite",
          "Intéressant surtout pour des pièces coûteuses (grands chandeliers, structures) peu rentables à l'achat",
        ],
      },
      {
        type: "list",
        title: "L'achat : rentable si vous revendez ou réutilisez",
        items: [
          "Vases et contenants simples achetés en marché ou en ligne, souvent revendables après",
          "Investissement qui reste chez vous, utilisable pour d'autres occasions",
          "Nécessite du stockage et du transport le jour J",
          "Rentable surtout au-delà d'une quinzaine de tables, où la location coûte cher au global",
        ],
      },
      {
        type: "list",
        title: "Le DIY : du temps contre un budget réduit",
        items: [
          "Compositions simples (bocaux, fleurs séchées, bougies) réalisables sans compétence particulière",
          "Coût matière généralement bien inférieur à un centre de table fleuriste",
          "Temps de montage à ne pas sous-estimer : comptez le multiplier par le nombre de tables",
          "Prévoir un test sur une ou deux tables avant de valider pour l'ensemble",
        ],
      },
      {
        type: "text",
        title: "Coordonner avec le plan de table",
        paragraphs: [
          "La taille et la hauteur du centre de table dépendent directement de la taille de vos tables et du nombre de convives par table. Un centre trop haut ou trop large gêne la conversation et prend la place des assiettes. Réglez la disposition des tables avant de valider les dimensions des centres de table, pas l'inverse.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le [plan de table](/tools/seating-chart) vous montre la disposition finale des tables, un bon point de départ pour dimensionner vos centres de table. Voir aussi [le DIY mariage sans se surcharger](/blog/diy-mariage-quoi-faire-soi-meme) et [le guide complet du plan de table](/blog/plan-de-table-mariage-guide-complet).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Centerpieces are one of the categories with the widest price gap between options, and the choice mostly depends on how much time you are willing to put in rather than budget alone.",
        ],
      },
      {
        type: "list",
        title: "Renting: the simplest, not always the cheapest",
        items: [
          "Vases, candle holders, candelabras rented from an event company or the florist",
          "Setup and pickup often included, no logistics on your end",
          "Choice limited to the rental company's catalog, less personalization",
          "Worthwhile mostly for expensive pieces (large candelabras, structures) not worth buying",
        ],
      },
      {
        type: "list",
        title: "Buying: worthwhile if you resell or reuse",
        items: [
          "Simple vases and containers bought at a market or online, often resellable afterward",
          "The investment stays with you, usable for other occasions",
          "Requires storage and transport on the day",
          "Pays off mostly beyond about fifteen tables, where renting adds up",
        ],
      },
      {
        type: "list",
        title: "DIY: time for a smaller budget",
        items: [
          "Simple arrangements (jars, dried flowers, candles) doable without special skill",
          "Material cost usually well below a florist-made centerpiece",
          "Do not underestimate assembly time: multiply it by your number of tables",
          "Test on one or two tables before committing to the full set",
        ],
      },
      {
        type: "text",
        title: "Coordinating with your seating chart",
        paragraphs: [
          "Centerpiece size and height depend directly on your table size and number of guests per table. A piece too tall or too wide gets in the way of conversation and eats into plate space. Finalize your table layout before locking in centerpiece dimensions, not the other way around.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The [seating chart](/tools/seating-chart) shows your final table layout, a good starting point for sizing centerpieces. See also [DIY wedding without overloading yourself](/blog/diy-mariage-quoi-faire-soi-meme) and [the full seating chart guide](/blog/plan-de-table-mariage-guide-complet).",
        ],
      },
    ],
  }),

  postPair({
    slug: "diy-mariage-quoi-faire-soi-meme",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "DIY mariage : quoi faire soi-même sans se surcharger",
    titleEn: "DIY wedding: what to make yourself without overloading",
    excerptFr:
      "Certains projets DIY font vraiment gagner du budget sans y passer des week-ends entiers. D'autres coûtent plus de temps et de stress qu'ils ne rapportent. Voici comment trier.",
    excerptEn:
      "Some DIY projects genuinely save budget without eating entire weekends. Others cost more time and stress than they are worth. Here is how to sort them out.",
    readingMinutes: 7,
    heroAltFr: "Projets DIY pour préparer son mariage",
    heroAltEn: "DIY projects for wedding preparation",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le DIY mariage a deux visages : celui qui fait vraiment gagner du budget avec un temps raisonnable, et celui qui finit en série de soirées stressantes deux semaines avant le mariage, pour un résultat finalement pas si différent d'une option achetée.",
        ],
      },
      {
        type: "list",
        title: "Ce qui vaut généralement le coup",
        items: [
          "Signalétique et pancartes (plan de table affiché, panneaux directionnels) : peu de matériel, résultat rapide",
          "Marque-places et numéros de table imprimés ou calligraphiés",
          "Petits favors simples (sachets de graines, mini bocaux) en grande quantité mais répétitifs, donc rapides une fois la méthode trouvée",
          "Décoration réutilisable (guirlandes, pompons en papier) préparée bien en avance",
        ],
      },
      {
        type: "list",
        title: "Ce qu'il vaut mieux confier à un prestataire",
        items: [
          "Le gâteau : la technique et le matériel professionnels sont difficiles à égaler en amateur",
          "Les fleurs fraîches en grande quantité : la conservation est délicate sans expérience",
          "Le son et l'éclairage : le matériel amateur donne rarement un rendu professionnel",
          "Tout ce qui doit être prêt à une heure précise le jour J sans marge d'erreur (menu, tenue)",
        ],
      },
      {
        type: "text",
        title: "Le vrai coût caché du DIY : le temps",
        paragraphs: [
          "Un projet qui semble prendre « une soirée » en tutoriel vidéo prend souvent le double une fois multiplié par 80 ou 100 exemplaires. Avant de vous lancer, testez sur un petit lot (dix pièces) et chronométrez réellement, puis multipliez par le nombre total dont vous avez besoin.",
        ],
      },
      {
        type: "list",
        title: "Caler le DIY dans le rétroplanning",
        items: [
          "Commencer les projets DIY 3 à 4 mois avant le mariage, pas dans les dernières semaines",
          "Prévoir une marge pour un projet qui ne fonctionne pas comme prévu et qu'il faut refaire",
          "Réserver la dernière semaine pour l'assemblage final, pas la fabrication depuis zéro",
          "Demander de l'aide (témoins, famille) sur les tâches répétitives plutôt que tout faire seul",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Ajoutez vos projets DIY comme tâches dans votre [rétroplanning mois par mois](/blog/retroplanning-mariage-mois-par-mois), avec une échéance réaliste. Voir aussi [les centres de table](/blog/deco-centres-table-mariage) et [la checklist des 50 tâches](/blog/checklist-mariage-50-taches).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Wedding DIY has two faces: the kind that genuinely saves budget for a reasonable amount of time, and the kind that turns into a string of stressful evenings two weeks before the wedding, for a result not that different from something you could have bought.",
        ],
      },
      {
        type: "list",
        title: "What is usually worth it",
        items: [
          "Signage (seating chart display, directional signs): little material, quick result",
          "Place cards and table numbers, printed or hand-lettered",
          "Small simple favors (seed packets, mini jars) in bulk but repetitive, so fast once you find your method",
          "Reusable decor (garlands, paper pom-poms) prepared well ahead",
        ],
      },
      {
        type: "list",
        title: "What is better left to a vendor",
        items: [
          "The cake: professional technique and equipment are hard to match as an amateur",
          "Fresh flowers in bulk: preservation is tricky without experience",
          "Sound and lighting: amateur gear rarely gives a professional result",
          "Anything that must be ready at an exact time on the day with no room for error (food, attire)",
        ],
      },
      {
        type: "text",
        title: "The real hidden cost of DIY: time",
        paragraphs: [
          "A project that looks like \"one evening\" in a video tutorial often takes double that once multiplied by 80 or 100 units. Before committing, test a small batch (ten pieces) and actually time it, then multiply by the full quantity you need.",
        ],
      },
      {
        type: "list",
        title: "Fitting DIY into your timeline",
        items: [
          "Start DIY projects 3 to 4 months before the wedding, not in the final weeks",
          "Build in margin for a project that does not work out and needs redoing",
          "Reserve the last week for final assembly, not building from scratch",
          "Ask for help (bridal party, family) on repetitive tasks rather than doing it all alone",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Add your DIY projects as tasks in your [month-by-month timeline](/blog/retroplanning-mariage-mois-par-mois), with a realistic deadline. See also [centerpieces](/blog/deco-centres-table-mariage) and [the 50-task checklist](/blog/checklist-mariage-50-taches).",
        ],
      },
    ],
  }),

  postPair({
    slug: "enfants-au-mariage-animation",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Enfants au mariage : animation et coin dédié",
    titleEn: "Kids at the wedding: activities and a dedicated corner",
    excerptFr:
      "Un coin enfants bien pensé fait la différence entre des parents qui profitent de la soirée et des parents qui passent la nuit à gérer un enfant fatigué. Idées concrètes et budget.",
    excerptEn:
      "A well-planned kids' corner is the difference between parents who enjoy the evening and parents who spend the night managing a tired child. Concrete ideas and budget.",
    readingMinutes: 6,
    heroAltFr: "Coin animation enfants lors d'un mariage",
    heroAltEn: "Kids' activity corner at a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Si votre liste d'invités compte plusieurs familles avec enfants, ce que vous prévoyez pour eux détermine en grande partie si leurs parents restent jusqu'à la fin de la soirée ou partent après le dîner. Ce n'est pas un poste énorme, mais il demande une vraie réflexion en amont.",
        ],
      },
      {
        type: "list",
        title: "Le coin activités : simple et efficace",
        items: [
          "Table basse avec coloriages, pâte à modeler, petits jeux calmes pendant le cocktail et le dîner",
          "Une zone un peu à l'écart du bruit pour les plus petits qui fatiguent vite",
          "Kits d'activités individuels distribués à l'arrivée, utiles pendant la cérémonie aussi",
          "Prévoir des activités adaptées à plusieurs tranches d'âge si l'écart est large",
        ],
      },
      {
        type: "text",
        title: "Faire garder plutôt qu'occuper",
        paragraphs: [
          "Au-delà d'un certain nombre d'enfants (une dizaine), une garde d'enfants professionnelle pour la soirée change vraiment la donne. Certains lieux ont un partenariat avec des structures locales, sinon comptez généralement entre 15 et 25 € de l'heure par intervenant, à répartir selon le nombre d'enfants par garde.",
        ],
      },
      {
        type: "list",
        title: "La table des enfants, une vraie question de placement",
        items: [
          "Table dédiée avec un menu adapté, souvent appréciée des enfants eux-mêmes",
          "Proche d'une table parents pour une surveillance facile, pas isolée à l'autre bout de la salle",
          "Décoration ludique (nappe à colorier, petits jeux sur table) pour occuper pendant le repas",
          "Prévoir un adulte référent (jeune adulte de la famille, baby-sitter) pour la table le temps du dîner",
        ],
      },
      {
        type: "text",
        title: "Communiquer clairement aux parents",
        paragraphs: [
          "Précisez si le mariage est enfants bienvenus, enfants proches uniquement, ou sans enfants, et faites-le savoir tôt, pas au moment du RSVP. Si une garderie est organisée, indiquez les horaires et modalités pour que les parents puissent s'organiser en amont.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le formulaire RSVP permet de préciser les enfants par foyer et leurs besoins spécifiques, utile pour dimensionner le coin activités. Voir aussi [gérer plus d'un enfant et les régimes alimentaires](/blog/gerer-plus-un-enfants-regimes-alimentaires).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "If your guest list includes several families with kids, what you plan for them largely determines whether their parents stay until the end of the night or leave after dinner. It is not a huge line item, but it needs real thought ahead of time.",
        ],
      },
      {
        type: "list",
        title: "The activity corner: simple and effective",
        items: [
          "A low table with coloring books, play dough, quiet games during the cocktail and dinner",
          "An area a bit away from the noise for younger kids who tire quickly",
          "Individual activity kits handed out on arrival, useful during the ceremony too",
          "Plan activities suited to several age ranges if the spread is wide",
        ],
      },
      {
        type: "text",
        title: "Hiring childcare rather than just occupying them",
        paragraphs: [
          "Past a certain number of kids (around ten), professional childcare for the evening genuinely changes things. Some venues partner with local providers; otherwise budget roughly 15 to 25 euros an hour per sitter, split by how many kids each one watches.",
        ],
      },
      {
        type: "list",
        title: "The kids' table: a real seating question",
        items: [
          "A dedicated table with a suited menu, often popular with the kids themselves",
          "Near a parents' table for easy supervision, not isolated at the far end of the room",
          "Playful decor (coloring tablecloth, small table games) to occupy them during the meal",
          "Assign a supervising adult (a young family member, a sitter) for the table during dinner",
        ],
      },
      {
        type: "text",
        title: "Communicating clearly to parents",
        paragraphs: [
          "State whether the wedding is kids-welcome, close family kids only, or adults-only, and say so early, not at RSVP time. If childcare is organized, list the hours and process so parents can plan ahead.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The RSVP form lets you record kids per household and their specific needs, useful for sizing the activity corner. See also [managing more than one child and dietary needs](/blog/gerer-plus-un-enfants-regimes-alimentaires).",
        ],
      },
    ],
  }),

  postPair({
    slug: "photobooth-livre-or-animations",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Photobooth, livre d'or et animations invités",
    titleEn: "Photobooth, guestbook, and guest activities",
    excerptFr:
      "Photobooth, livre d'or vidéo, jeux de piste : certaines animations tournent toute la soirée, d'autres restent vides dans un coin. Ce qui fonctionne vraiment selon nos retours.",
    excerptEn:
      "Photobooth, video guestbook, scavenger hunts: some activities run all night, others sit empty in a corner. What actually works based on real feedback.",
    readingMinutes: 6,
    heroAltFr: "Photobooth et animations pour invités de mariage",
    heroAltEn: "Photobooth and activities for wedding guests",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Beaucoup de mariages ajoutent une ou deux animations pour occuper les invités entre le dîner et la piste de danse. Certaines sont utilisées toute la soirée, d'autres restent installées sans grand intérêt. Voici ce qui fait la différence.",
        ],
      },
      {
        type: "list",
        title: "Le photobooth : presque toujours un succès",
        items: [
          "Fonctionne particulièrement bien avec des accessoires simples (chapeaux, pancartes) plutôt qu'un décor trop chargé",
          "Un fond neutre et bien éclairé donne de meilleures photos qu'un décor à thème surchargé",
          "Prévoyez une impression immédiate si possible : les invités gardent plus volontiers une photo physique",
          "Placez-le sur le passage entre le dîner et la piste, pas dans une pièce à part que peu de monde visite",
        ],
      },
      {
        type: "list",
        title: "Le livre d'or : la version qui fonctionne le mieux",
        items: [
          "Le livre d'or classique (cahier, stylo) reste sous-utilisé si personne ne rappelle son existence",
          "La version vidéo (petite cabine ou simplement un téléphone sur pied) capte plus de messages spontanés",
          "Des cartes individuelles à glisser dans une boîte fonctionnent bien si distribuées à table pendant le dîner",
          "Prévoyez un rappel du maître de cérémonie ou du DJ à un moment de la soirée",
        ],
      },
      {
        type: "list",
        title: "Animations qui tournent bien",
        items: [
          "Espace musical simple (juke-box, playlist collaborative) où les invités choisissent les morceaux",
          "Bar à cocktails ou à boissons participatif avec quelques options simples",
          "Quiz sur le couple projeté ou affiché, apprécié pendant le cocktail",
        ],
      },
      {
        type: "list",
        title: "Animations qui finissent souvent délaissées",
        items: [
          "Jeux de piste complexes qui demandent trop d'explication pour être suivis spontanément",
          "Plusieurs animations simultanées qui dispersent les invités au lieu de les rassembler",
          "Tout ce qui nécessite un mode d'emploi écrit long, rarement lu",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Calez le passage au photobooth ou l'annonce du livre d'or dans votre [timeline jour J](/tools/timeline), pour que le DJ ou le maître de cérémonie le mentionne au bon moment. Voir aussi [le planning jour J minute par minute](/blog/planning-jour-j-minute-par-minute).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Many weddings add one or two activities to occupy guests between dinner and the dance floor. Some get used all night, others sit there with little interest. Here is what makes the difference.",
        ],
      },
      {
        type: "list",
        title: "The photobooth: almost always a hit",
        items: [
          "Works especially well with simple props (hats, signs) rather than an overly busy setup",
          "A neutral, well-lit backdrop gives better photos than a cluttered themed set",
          "Offer instant printing if possible: guests are more likely to keep a physical photo",
          "Place it on the path between dinner and the dance floor, not in a separate room few people visit",
        ],
      },
      {
        type: "list",
        title: "The guestbook: the version that works best",
        items: [
          "A classic guestbook (notebook, pen) stays underused if no one reminds guests it exists",
          "A video version (a small booth or just a phone on a stand) captures more spontaneous messages",
          "Individual cards dropped in a box work well if handed out at the table during dinner",
          "Have the emcee or DJ remind guests at some point during the evening",
        ],
      },
      {
        type: "list",
        title: "Activities that go well",
        items: [
          "A simple music corner (jukebox, collaborative playlist) where guests pick songs",
          "A participatory cocktail or drinks bar with a few simple options",
          "A quiz about the couple, projected or displayed, popular during the cocktail hour",
        ],
      },
      {
        type: "list",
        title: "Activities that often sit unused",
        items: [
          "Complex scavenger hunts that need too much explanation to be picked up spontaneously",
          "Several simultaneous activities that scatter guests instead of bringing them together",
          "Anything requiring a long written set of instructions, rarely read",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Time the photobooth opening or the guestbook announcement in your [day-of timeline](/tools/timeline), so the DJ or emcee mentions it at the right moment. See also [the minute-by-minute day-of schedule](/blog/planning-jour-j-minute-par-minute).",
        ],
      },
    ],
  }),

  postPair({
    slug: "traditions-mariage-francais",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Traditions de mariage françaises : lesquelles garder ?",
    titleEn: "French wedding traditions: which ones to keep?",
    excerptFr:
      "Vin d'honneur, pièce montée, lancer du bouquet : certaines traditions restent incontournables, d'autres sont de plus en plus souvent laissées de côté. Un tour d'horizon sans obligation.",
    excerptEn:
      "Vin d'honneur, croquembouche, bouquet toss: some traditions remain a given, others are increasingly skipped. A tour with no obligation attached.",
    readingMinutes: 6,
    heroAltFr: "Traditions de mariage françaises",
    heroAltEn: "French wedding traditions",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les traditions de mariage françaises ne sont pas une liste obligatoire, ce sont des options que chaque génération de couples réinterprète. Certaines restent très présentes, d'autres se raréfient sans que ça choque plus personne. Voici où en sont les principales aujourd'hui.",
        ],
      },
      {
        type: "list",
        title: "Toujours largement présentes",
        items: [
          "Le vin d'honneur entre la cérémonie et le dîner, quasiment systématique",
          "La pièce montée ou un gâteau à étages, souvent adapté en version plus moderne",
          "Le discours des témoins, un incontournable de la soirée",
          "La première danse des mariés",
        ],
      },
      {
        type: "list",
        title: "De plus en plus souvent adaptées ou skippées",
        items: [
          "Le lancer du bouquet, encore fréquent mais de plus en plus optionnel selon les invités présents",
          "La jarretière, une tradition en net recul, jugée datée par beaucoup de couples",
          "Le trou normand entre les plats, réservé aux repas très longs ou certaines régions",
          "Le voile complet, souvent remplacé par une version courte ou absent",
        ],
      },
      {
        type: "text",
        title: "Des variantes régionales toujours vivantes",
        paragraphs: [
          "Certaines régions gardent des traditions plus marquées : la coupe du ruban à la sortie de mairie dans certaines campagnes, le grand saut ou la course en Bretagne, des chants traditionnels lors du dîner dans le Sud-Ouest. Ces traditions locales restent souvent plus suivies que les traditions nationales génériques, parce qu'elles ont un ancrage familial concret.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Il n'y a pas de bonne ou mauvaise réponse ici : le seul critère qui compte est si la tradition a du sens pour vous, pas si elle « se fait » habituellement.",
        ],
      },
      {
        type: "text",
        title: "Comment choisir ce qui vous ressemble",
        paragraphs: [
          "Demandez-vous, pour chaque tradition, si vous la gardez par envie ou par obligation ressentie vis-à-vis de la famille. Une tradition gardée à contrecœur se voit souvent le jour J, alors qu'une tradition adaptée à votre façon (une pièce montée version bar à desserts, par exemple) garde le sens sans le format imposé.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Les moments traditionnels que vous décidez de garder se placent facilement dans votre [timeline jour J](/tools/timeline), avec les bons horaires pour ne pas décaler le reste de la soirée.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "French wedding traditions are not a mandatory checklist, they are options every generation of couples reinterprets. Some remain very common, others fade out without anyone really minding. Here is where the main ones stand today.",
        ],
      },
      {
        type: "list",
        title: "Still widely present",
        items: [
          "The vin d'honneur (welcome cocktail) between the ceremony and dinner, nearly universal",
          "The croquembouche or a tiered cake, often given a more modern spin",
          "The bridal party's speeches, a fixture of the evening",
          "The couple's first dance",
        ],
      },
      {
        type: "list",
        title: "Increasingly adapted or skipped",
        items: [
          "The bouquet toss, still common but increasingly optional depending on who is attending",
          "The garter toss, in clear decline, seen as dated by many couples",
          "The mid-meal digestif break (trou normand), reserved for very long meals or certain regions",
          "The full-length veil, often replaced by a shorter version or skipped entirely",
        ],
      },
      {
        type: "text",
        title: "Regional variants still alive",
        paragraphs: [
          "Some regions keep stronger traditions: cutting a ribbon on leaving the town hall in some rural areas, the running or jumping game in Brittany, traditional songs during dinner in the Southwest. These local traditions are often followed more closely than generic national ones, because they carry a concrete family root.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "There is no right or wrong answer here: the only criterion that matters is whether the tradition means something to you, not whether it is \"usually done.\"",
        ],
      },
      {
        type: "text",
        title: "How to choose what fits you",
        paragraphs: [
          "For each tradition, ask yourself whether you are keeping it out of genuine desire or a felt obligation to family. A tradition kept reluctantly often shows on the day, while a tradition adapted to your own style (a croquembouche reworked as a dessert bar, for instance) keeps the meaning without the imposed format.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The traditional moments you decide to keep fit easily into your [day-of timeline](/tools/timeline), timed so they do not push the rest of the evening off schedule.",
        ],
      },
    ],
  }),

  postPair({
    slug: "horaires-ceremonie-mariage-caler",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Caler les horaires : cérémonie, photos, repas sans temps mort",
    titleEn: "Timing your day: ceremony, photos, and meal with no dead time",
    excerptFr:
      "Le temps mort entre la cérémonie et le dîner est la principale plainte des invités de mariage. Comment enchaîner cérémonie, cocktail et repas sans que personne attende sans raison.",
    excerptEn:
      "Dead time between the ceremony and dinner is the top complaint from wedding guests. How to sequence ceremony, cocktail, and meal so no one waits around for no reason.",
    readingMinutes: 7,
    heroAltFr: "Horaires enchaînés d'un mariage",
    heroAltEn: "Sequenced wedding day schedule",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le reproche le plus fréquent des invités après un mariage n'est presque jamais le lieu ou la déco : c'est l'attente. Une heure de battement mal expliquée entre la cérémonie et le dîner, pendant que les mariés font leurs photos, transforme vite une belle journée en journée qui traîne.",
        ],
      },
      {
        type: "list",
        title: "La séquence qui fonctionne le mieux",
        items: [
          "Cérémonie (30 à 45 minutes), suivie immédiatement d'un temps de félicitations court",
          "Cocktail avec animation (musique, buffet) pendant que les mariés font une partie des photos de groupe",
          "Photos de couple en solo calées juste avant ou juste après le cocktail, pas pendant tout le cocktail",
          "Entrée en salle et début du dîner enchaînés sans battement supplémentaire",
        ],
      },
      {
        type: "text",
        title: "Le vrai piège : sous-estimer le temps photo",
        paragraphs: [
          "Les photos de groupe (famille élargie, amis, témoins) prennent presque toujours plus de temps que prévu, surtout avec beaucoup d'invités à coordonner. Demandez à votre photographe une estimation réaliste par groupe de photo, pas une estimation globale optimiste, et intégrez une marge de 15 à 20 minutes.",
        ],
      },
      {
        type: "list",
        title: "Occuper le cocktail pour que l'attente ne se ressente pas",
        items: [
          "Musique en continu dès l'arrivée des invités, jamais de silence prolongé",
          "Un buffet ou des mets passés suffisamment fournis pour tenir 45 minutes à 1h30",
          "Une animation légère (jeu, quiz, photobooth) sans obligation d'y participer",
          "Des sièges disponibles pour les invités qui ne peuvent pas rester debout longtemps",
        ],
      },
      {
        type: "text",
        title: "Coordonner photographe et traiteur",
        paragraphs: [
          "Le traiteur a besoin de connaître l'heure exacte d'entrée en salle pour caler le service, et le photographe a besoin de savoir combien de temps il dispose réellement pour les photos de couple. Partagez la même timeline aux deux, avec des horaires précis plutôt que des plages approximatives, pour éviter que l'un attende l'autre.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "La [timeline jour J](/tools/timeline) permet de construire cette séquence minute par minute et de la partager avec vos prestataires en un seul document. Voir aussi [le planning jour J minute par minute](/blog/planning-jour-j-minute-par-minute) pour un exemple complet.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The most common complaint after a wedding is almost never the venue or the decor: it is the waiting. An hour of unexplained gap between the ceremony and dinner, while the couple takes photos, quickly turns a great day into one that drags.",
        ],
      },
      {
        type: "list",
        title: "The sequence that works best",
        items: [
          "Ceremony (30 to 45 minutes), immediately followed by a short congratulations window",
          "Cocktail hour with entertainment (music, food) while the couple handles part of the group photos",
          "Solo couple photos timed just before or just after the cocktail, not spread through the whole cocktail",
          "Entering the hall and starting dinner right after, with no extra gap",
        ],
      },
      {
        type: "text",
        title: "The real trap: underestimating photo time",
        paragraphs: [
          "Group photos (extended family, friends, wedding party) almost always take longer than expected, especially with many people to coordinate. Ask your photographer for a realistic estimate per group photo, not an optimistic overall one, and build in a 15 to 20 minute margin.",
        ],
      },
      {
        type: "list",
        title: "Filling the cocktail hour so waiting is not felt",
        items: [
          "Continuous music from the moment guests arrive, never prolonged silence",
          "A buffet or passed food substantial enough to cover 45 minutes to 1.5 hours",
          "A light activity (game, quiz, photobooth) with no obligation to join in",
          "Seating available for guests who cannot stand for long",
        ],
      },
      {
        type: "text",
        title: "Coordinating the photographer and the caterer",
        paragraphs: [
          "The caterer needs the exact time guests will enter the hall to time service, and the photographer needs to know exactly how much time they have for couple photos. Share the same timeline with both, with precise times rather than rough windows, so neither ends up waiting on the other.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The [day-of timeline](/tools/timeline) lets you build this sequence minute by minute and share it with your vendors in a single document. See also [the minute-by-minute day-of schedule](/blog/planning-jour-j-minute-par-minute) for a full example.",
        ],
      },
    ],
  }),

  postPair({
    slug: "financer-mariage-epargne-aides",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Financer son mariage : épargne et participations",
    titleEn: "Funding your wedding: savings and contributions",
    excerptFr:
      "Épargne du couple, participation des familles, crédit à éviter : comment financer un mariage sans démarrer la vie commune avec une dette qui pèse sur les premiers mois.",
    excerptEn:
      "Couple's savings, family contributions, credit to avoid: how to fund a wedding without starting your life together weighed down by debt in the first months.",
    readingMinutes: 7,
    heroAltFr: "Épargner pour financer son mariage",
    heroAltEn: "Saving up to fund a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La question du financement se pose rarement en ces termes au début : on fixe un budget cible, puis on découvre en cours de route qu'il faut trouver l'argent quelque part. Mieux vaut poser le sujet du financement dès le début, en même temps que le budget lui-même.",
        ],
      },
      {
        type: "list",
        title: "Les sources de financement les plus courantes",
        items: [
          "Épargne personnelle du couple, mise de côté sur la durée de la préparation",
          "Participation des familles (parents, grands-parents), souvent variable et à clarifier tôt",
          "Cagnotte ou liste de mariage en argent, complément fréquent mais rarement suffisant seul",
          "Vente de biens ou d'un bien immobilier pour les projets de grande ampleur, plus rare",
        ],
      },
      {
        type: "text",
        title: "Un plan d'épargne réaliste plutôt qu'un objectif vague",
        paragraphs: [
          "Diviser le budget cible par le nombre de mois restants avant le mariage donne un montant mensuel concret à mettre de côté. Un compte d'épargne dédié, séparé du compte courant, aide à ne pas piocher dedans pour d'autres dépenses. Si le montant mensuel nécessaire semble irréaliste, c'est souvent le signal qu'il faut revoir le budget cible à la baisse, plutôt que de compter sur un financement de dernière minute.",
        ],
      },
      {
        type: "list",
        title: "Clarifier tôt les participations familiales",
        items: [
          "Demander un montant, pas une intention vague, dès que possible dans la préparation",
          "Préciser si la participation est fléchée sur un poste précis (traiteur, robe) ou libre",
          "Éviter de construire un budget qui dépend d'une contribution non confirmée",
          "Documenter les montants pour éviter les malentendus une fois les devis engagés",
        ],
      },
      {
        type: "text",
        title: "Pourquoi éviter le crédit à la consommation",
        paragraphs: [
          "Un crédit contracté pour financer le mariage se rembourse généralement plusieurs mois, parfois plusieurs années après, avec des intérêts qui augmentent le coût réel de la fête. Commencer une vie commune avec cette charge mensuelle pèse souvent plus longtemps que le souvenir du mariage lui-même. Si l'écart entre le budget cible et l'épargne disponible est important, il est presque toujours préférable de réduire certains postes plutôt que d'emprunter.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le [simulateur budget](/tools/budget-calculator) vous aide à fixer un budget cible réaliste dès le départ. Voir aussi [combien prévoir pour son mariage en 2026](/blog/budget-mariage-2026-combien-prevoir) et [la répartition du budget par poste](/blog/repartition-budget-mariage-par-poste).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The funding question rarely comes up in these terms at the start: you set a target budget, then discover along the way that the money has to come from somewhere. It is better to address funding from day one, alongside the budget itself.",
        ],
      },
      {
        type: "list",
        title: "The most common funding sources",
        items: [
          "The couple's personal savings, set aside over the planning period",
          "Family contributions (parents, grandparents), often variable and worth clarifying early",
          "A cash gift fund or monetary registry, a frequent add-on but rarely enough on its own",
          "Selling assets or property for larger-scale projects, less common",
        ],
      },
      {
        type: "text",
        title: "A realistic savings plan rather than a vague goal",
        paragraphs: [
          "Dividing your target budget by the number of months left before the wedding gives a concrete monthly amount to set aside. A dedicated savings account, separate from your checking account, helps avoid dipping into it for other expenses. If the required monthly amount looks unrealistic, that is often the signal to revise the target budget down, rather than counting on last-minute funding.",
        ],
      },
      {
        type: "list",
        title: "Clarifying family contributions early",
        items: [
          "Ask for an amount, not a vague intention, as early as possible in the planning",
          "Clarify whether the contribution is earmarked for a specific item (catering, dress) or open",
          "Avoid building a budget that depends on an unconfirmed contribution",
          "Document amounts to avoid misunderstandings once quotes are locked in",
        ],
      },
      {
        type: "text",
        title: "Why avoid consumer credit",
        paragraphs: [
          "A loan taken out to fund the wedding is usually repaid over several months, sometimes years, with interest that raises the real cost of the day. Starting a life together with that monthly burden often lasts longer than the memory of the wedding itself. If the gap between your target budget and available savings is significant, it is nearly always better to trim certain categories than to borrow.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The [budget calculator](/tools/budget-calculator) helps you set a realistic target budget from the start. See also [how much to budget for a wedding in 2026](/blog/budget-mariage-2026-combien-prevoir) and [how to split a wedding budget by category](/blog/repartition-budget-mariage-par-poste).",
        ],
      },
    ],
  }),

  postPair({
    slug: "budget-mariage-15000-euros-repartition",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Mariage à 15 000 € : répartition réaliste poste par poste",
    titleEn: "A 15,000 euro wedding: a realistic category-by-category breakdown",
    excerptFr:
      "Un exemple concret de répartition pour un mariage à 15 000 € et 60 à 70 invités : ce que chaque poste représente en pratique, et où se trouvent les compromis.",
    excerptEn:
      "A concrete allocation example for a 15,000 euro wedding with 60 to 70 guests: what each category looks like in practice, and where the trade-offs sit.",
    readingMinutes: 8,
    heroAltFr: "Répartition budget mariage 15000 euros",
    heroAltEn: "15,000 euro wedding budget breakdown",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "15 000 € reste un budget confortable pour un mariage de taille moyenne en France, à condition de faire des choix cohérents sur le nombre d'invités et le type de lieu. Voici une répartition illustrative, pas une règle universelle, pour 60 à 70 invités.",
        ],
      },
      {
        type: "text",
        title: "Répartition indicative",
        paragraphs: [
          "| Poste | Montant | Part du budget |",
          "| Lieu de réception | 3 000 € | 20% |",
          "| Traiteur (repas + boissons) | 5 500 € | 37% |",
          "| Photographe | 1 800 € | 12% |",
          "| Tenues des mariés | 1 500 € | 10% |",
          "| Fleurs et décoration | 1 000 € | 7% |",
          "| DJ ou animation musicale | 1 000 € | 7% |",
          "| Faire-part et papeterie | 300 € | 2% |",
          "| Divers et imprévus | 900 € | 5% |",
        ],
      },
      {
        type: "text",
        title: "Ce que ce budget implique concrètement",
        paragraphs: [
          "À ce niveau, le traiteur reste le poste le plus lourd, ce qui pousse souvent vers une formule au forfait par invité plutôt qu'un menu entièrement sur mesure. Un lieu de type grange rénovée ou salle des fêtes municipale, plutôt qu'un château, permet de garder cette proportion sans sacrifier le reste.",
          "Le photographe à 1 800 € correspond généralement à une prestation demi-journée ou journée complète sans deuxième photographe, ce qui est largement suffisant pour un mariage de cette taille.",
        ],
      },
      {
        type: "list",
        title: "Les compromis les plus fréquents à ce budget",
        items: [
          "Fleurs de saison et locales plutôt que des variétés importées coûteuses",
          "DJ plutôt que groupe live, moins cher pour un résultat souvent équivalent en soirée",
          "Faire-part numériques pour une partie de la liste, papier réservé aux proches",
          "Décoration en partie DIY ou réutilisation des fleurs de cérémonie pour le dîner",
        ],
      },
      {
        type: "text",
        title: "Comment ce budget évolue avec plus d'invités",
        paragraphs: [
          "Le poste traiteur augmente presque linéairement avec le nombre d'invités : chaque convive supplémentaire coûte généralement entre 60 et 90 € tout compris (repas, boissons, service). Passer de 65 à 100 invités avec le même budget global oblige presque toujours à revoir le menu ou le lieu à la baisse.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Cette répartition est un point de départ, pas un modèle figé. Le [simulateur budget](/tools/budget-calculator) l'ajuste automatiquement selon votre nombre d'invités réel. Voir aussi [la répartition du budget par poste](/blog/repartition-budget-mariage-par-poste) et, pour un budget plus large, [mariage à 30 000 € : où passe l'argent](/blog/budget-mariage-30000-euros-repartition).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "15,000 euros remains a comfortable budget for a mid-sized wedding in France, provided your guest count and venue type stay consistent with it. Here is an illustrative breakdown, not a universal rule, for 60 to 70 guests.",
        ],
      },
      {
        type: "text",
        title: "Sample breakdown",
        paragraphs: [
          "| Category | Amount | Share of budget |",
          "| Venue | 3,000 € | 20% |",
          "| Catering (food + drinks) | 5,500 € | 37% |",
          "| Photographer | 1,800 € | 12% |",
          "| Couple's attire | 1,500 € | 10% |",
          "| Flowers and decor | 1,000 € | 7% |",
          "| DJ or music | 1,000 € | 7% |",
          "| Invitations and stationery | 300 € | 2% |",
          "| Misc and contingency | 900 € | 5% |",
        ],
      },
      {
        type: "text",
        title: "What this budget means in practice",
        paragraphs: [
          "At this level, catering remains the heaviest line, which often pushes toward a per-guest package rather than a fully custom menu. A venue like a renovated barn or a municipal hall, rather than a château, keeps this proportion without sacrificing the rest.",
          "A photographer at 1,800 euros usually covers a half-day or full-day service without a second shooter, which is more than enough for a wedding this size.",
        ],
      },
      {
        type: "list",
        title: "The most common trade-offs at this budget",
        items: [
          "Seasonal, local flowers rather than costly imported varieties",
          "A DJ rather than a live band, cheaper for an often equivalent evening result",
          "Digital invitations for part of the list, paper reserved for close family",
          "Partly DIY decor or reusing ceremony flowers for dinner",
        ],
      },
      {
        type: "text",
        title: "How this budget scales with more guests",
        paragraphs: [
          "The catering line grows almost linearly with guest count: each extra guest typically costs 60 to 90 euros all in (food, drinks, service). Going from 65 to 100 guests on the same overall budget almost always forces a downgrade to the menu or the venue.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "This breakdown is a starting point, not a fixed model. The [budget calculator](/tools/budget-calculator) adjusts it automatically to your actual guest count. See also [splitting a wedding budget by category](/blog/repartition-budget-mariage-par-poste) and, for a larger budget, [a 30,000 euro wedding: where the money goes](/blog/budget-mariage-30000-euros-repartition).",
        ],
      },
    ],
  }),

  postPair({
    slug: "budget-mariage-30000-euros-repartition",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Mariage à 30 000 € : où passe l'argent",
    titleEn: "A 30,000 euro wedding: where the money goes",
    excerptFr:
      "Un exemple concret de répartition pour un mariage à 30 000 € et 100 à 120 invités : ce que le budget supplémentaire achète vraiment par rapport à un mariage plus modeste.",
    excerptEn:
      "A concrete allocation example for a 30,000 euro wedding with 100 to 120 guests: what the extra budget actually buys compared to a more modest wedding.",
    readingMinutes: 8,
    heroAltFr: "Répartition budget mariage 30000 euros",
    heroAltEn: "30,000 euro wedding budget breakdown",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "À 30 000 €, le budget ne se contente pas de doubler chaque poste : il permet surtout de monter en gamme sur le lieu et d'ajouter des prestataires qu'un budget plus serré laisse souvent de côté. Voici une répartition illustrative pour 100 à 120 invités.",
        ],
      },
      {
        type: "text",
        title: "Répartition indicative",
        paragraphs: [
          "| Poste | Montant | Part du budget |",
          "| Lieu de réception | 7 000 € | 23% |",
          "| Traiteur (repas + boissons) | 11 000 € | 37% |",
          "| Photographe | 2 800 € | 9% |",
          "| Vidéaste | 1 800 € | 6% |",
          "| Tenues des mariés | 2 500 € | 8% |",
          "| Fleurs et décoration | 2 000 € | 7% |",
          "| DJ ou groupe live | 1 500 € | 5% |",
          "| Faire-part et papeterie | 500 € | 2% |",
          "| Divers et imprévus | 900 € | 3% |",
        ],
      },
      {
        type: "text",
        title: "Ce que le budget supplémentaire achète vraiment",
        paragraphs: [
          "La différence la plus visible n'est pas le traiteur, qui reste proportionnellement similaire, mais le lieu : un budget de 7 000 € ouvre l'accès à des domaines et châteaux qui restent hors de portée à 3 000 €. Le vidéaste, souvent absent des budgets plus serrés, devient accessible sans déséquilibrer l'ensemble.",
          "Un groupe live plutôt qu'un DJ devient également envisageable à ce niveau, un poste qui reste généralement le double d'un DJ seul mais qui change nettement l'ambiance de la soirée pour certains couples.",
        ],
      },
      {
        type: "list",
        title: "Ce qui reste un choix, pas une évidence",
        items: [
          "Un deuxième photographe pour couvrir plusieurs angles simultanément",
          "Un traiteur qui propose un menu entièrement sur mesure plutôt qu'une formule fixe",
          "Une déco florale plus dense (arche de cérémonie, suspensions) plutôt que des centres de table simples",
          "Un open bar complet plutôt qu'une formule vin et softs uniquement",
        ],
      },
      {
        type: "text",
        title: "Le nombre d'invités reste le facteur qui pèse le plus",
        paragraphs: [
          "À 100-120 invités, le poste traiteur reste le plus lourd en valeur absolue, même s'il représente une part comparable du budget total à un mariage à 15 000 €. Réduire le nombre d'invités à budget global constant libère généralement plus de marge que n'importe quelle négociation sur les autres postes.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Comparez avec [mariage à 15 000 € : répartition réaliste](/blog/budget-mariage-15000-euros-repartition) pour voir comment la structure évolue avec le budget. Le [simulateur budget](/tools/budget-calculator) et [la répartition du budget par poste](/blog/repartition-budget-mariage-par-poste) vous aident à adapter cette base à votre propre projet.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "At 30,000 euros, the budget does not just double every line item: it mostly lets you upgrade the venue tier and add vendors a tighter budget often leaves out. Here is an illustrative breakdown for 100 to 120 guests.",
        ],
      },
      {
        type: "text",
        title: "Sample breakdown",
        paragraphs: [
          "| Category | Amount | Share of budget |",
          "| Venue | 7,000 € | 23% |",
          "| Catering (food + drinks) | 11,000 € | 37% |",
          "| Photographer | 2,800 € | 9% |",
          "| Videographer | 1,800 € | 6% |",
          "| Couple's attire | 2,500 € | 8% |",
          "| Flowers and decor | 2,000 € | 7% |",
          "| DJ or live band | 1,500 € | 5% |",
          "| Invitations and stationery | 500 € | 2% |",
          "| Misc and contingency | 900 € | 3% |",
        ],
      },
      {
        type: "text",
        title: "What the extra budget actually buys",
        paragraphs: [
          "The most visible difference is not catering, which stays proportionally similar, but the venue: a 7,000 euro budget opens the door to estates and châteaux that stay out of reach at 3,000 euros. A videographer, often missing from tighter budgets, becomes affordable without throwing off the balance.",
          "A live band rather than a DJ also becomes realistic at this level, a line item that usually costs double a DJ alone but noticeably changes the evening's mood for some couples.",
        ],
      },
      {
        type: "list",
        title: "What stays a choice, not a given",
        items: [
          "A second photographer to cover several angles at once",
          "A caterer offering a fully custom menu rather than a fixed package",
          "Denser floral decor (ceremony arch, hanging installations) rather than simple centerpieces",
          "A full open bar rather than a wine-and-soft-drinks-only package",
        ],
      },
      {
        type: "text",
        title: "Guest count remains the heaviest factor",
        paragraphs: [
          "At 100 to 120 guests, catering stays the heaviest line in absolute terms, even though it represents a comparable share of the total budget to a 15,000 euro wedding. Cutting guest count while keeping the overall budget fixed usually frees up more room than any negotiation on other categories.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Compare with [a 15,000 euro wedding: a realistic breakdown](/blog/budget-mariage-15000-euros-repartition) to see how the structure shifts with budget. The [budget calculator](/tools/budget-calculator) and [splitting a wedding budget by category](/blog/repartition-budget-mariage-par-poste) help you adapt this base to your own project.",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_95_114_FR, en: POSTS_95_114_EN } = pairsToArrays(pairs);
