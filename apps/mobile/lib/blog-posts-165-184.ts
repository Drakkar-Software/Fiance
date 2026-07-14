import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "fleurs-sechees-stabilisees-mariage",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Fleurs séchées et stabilisées : déco durable et stylée",
    titleEn: "Dried and preserved flowers: durable, stylish decor",
    excerptFr:
      "Pas de risque de flétrissement, commande à l'avance, rendu bohème assumé : pourquoi de plus en plus de couples choisissent les fleurs séchées et stabilisées pour leur décoration.",
    excerptEn:
      "No wilting risk, order months ahead, an assumed boho look: why more couples are choosing dried and preserved flowers for their decor.",
    readingMinutes: 6,
    heroAltFr: "Bouquet de fleurs séchées pour décoration de mariage",
    heroAltEn: "Dried flower bouquet for wedding decor",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les fleurs séchées et stabilisées ne sont plus reléguées aux boutiques vintage. Elles s'installent durablement dans les mariages, portées par une recherche de décoration plus durable et moins soumise aux aléas de dernière minute.",
          "Contrairement à un bouquet frais, une composition séchée se prépare des mois à l'avance, sans risque de flétrissement le jour J ni de dépendance à la saison des fleurs.",
        ],
      },
      {
        type: "list",
        title: "Pourquoi elles séduisent de plus en plus de couples",
        items: [
          "Aucune contrainte de saison : pampas, lagurus, gypsophile séchée se trouvent toute l'année",
          "Composition livrée ou préparée bien avant le mariage, zéro stress de dernière minute sur la fraîcheur",
          "Tient toute la soirée sans arrosage ni risque de flétrissement sous la chaleur d'une salle",
          "Peut être conservée en souvenir des années après le mariage, contrairement à un bouquet frais",
        ],
      },
      {
        type: "list",
        title: "Fleurs séchées ou stabilisées : la différence",
        items: [
          "La fleur séchée est une fleur naturelle dont l'eau a été retirée, texture cassante, teintes patinées (beige, rouille, blush)",
          "La fleur stabilisée (ou préservée) a été traitée par un procédé à base de glycérine qui remplace la sève : elle garde souplesse et couleur vive pendant un à trois ans",
          "Le stabilisé coûte plus cher à l'achat mais dure sensiblement plus longtemps et se rapproche davantage du rendu d'une fleur fraîche",
        ],
      },
      {
        type: "text",
        title: "Bien styliser une déco séchée",
        paragraphs: [
          "Mélanger quelques fleurs fraîches de saison à une base séchée évite un rendu trop uniforme et apporte de la fraîcheur visuelle au centre de table.",
          "Les blés, plumes de pampa, lagurus et fleurs de lin se marient bien avec une déco champêtre ou bohème. Pour un rendu plus habillé, associez-les à des vases en céramique aux lignes simples plutôt qu'à des contenants trop rustiques.",
        ],
      },
      {
        type: "text",
        title: "Comparer le budget avec le frais",
        paragraphs: [
          "Une composition séchée coûte en général 20 à 30% de moins qu'un équivalent en fleurs fraîches, principalement parce qu'elle évite les frais de transport en chaîne du froid et la marge liée à la fragilité. Une grande pièce stabilisée haut de gamme peut toutefois rattraper ce prix, le procédé de stabilisation étant lui-même coûteux.",
          "Autre avantage budgétaire indirect : la déco séchée se garde et se réutilise, en cadre, en couronne ou en bouquet suspendu, ce qui prolonge sa valeur bien après le mariage.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Commandez 4 à 6 mois à l'avance auprès d'un fleuriste ou d'un atelier spécialisé dans le séché : la qualité varie énormément d'un fournisseur à l'autre. Demandez toujours à voir ou toucher un échantillon avant de valider une grande quantité.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour choisir le bon prestataire selon votre budget et votre style, voir notre guide [choisir son fleuriste de mariage](/blog/choisir-fleuriste-mariage). Si vous préférez rester sur des fleurs fraîches, notre article sur les [fleurs de saison et locales](/blog/fleurs-mariage-saison-locales) vous aide à faire le tri.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Dried and preserved flowers are no longer confined to vintage shops. They are becoming a lasting fixture at weddings, driven by a search for more durable decor that isn't at the mercy of last-minute mishaps.",
          "Unlike a fresh bouquet, a dried arrangement is prepared months in advance, with no risk of wilting on the day and no dependence on flower season.",
        ],
      },
      {
        type: "list",
        title: "Why more couples are choosing them",
        items: [
          "No seasonal constraints: pampas grass, bunny tail grass, and dried baby's breath are available year-round",
          "Arrangement delivered or prepared well ahead of the wedding, zero last-minute stress over freshness",
          "Holds up all evening with no watering and no risk of wilting in a warm venue",
          "Can be kept as a keepsake for years after the wedding, unlike a fresh bouquet",
        ],
      },
      {
        type: "list",
        title: "Dried or preserved: the difference",
        items: [
          "A dried flower is a natural flower with the water removed, brittle texture, faded tones (beige, rust, blush)",
          "A preserved (or stabilized) flower has been treated with a glycerin-based process that replaces its sap: it keeps flexibility and vivid color for one to three years",
          "Preserved flowers cost more upfront but last noticeably longer and come closer to the look of a fresh flower",
        ],
      },
      {
        type: "text",
        title: "Styling a dried arrangement well",
        paragraphs: [
          "Mixing in a few fresh seasonal flowers with a dried base avoids too flat a look and adds visual freshness to a centerpiece.",
          "Wheat, pampas plumes, bunny tail grass, and flax flowers work well with a rustic or boho style. For a dressier look, pair them with simple ceramic vases rather than overly rustic containers.",
        ],
      },
      {
        type: "text",
        title: "Comparing the cost to fresh flowers",
        paragraphs: [
          "A dried arrangement usually costs 20 to 30% less than an equivalent fresh one, mainly because it avoids cold-chain delivery fees and the markup tied to fragility. A large high-end preserved piece can still catch up to that price, since the stabilizing process itself is costly.",
          "Another indirect budget upside: dried decor keeps and gets reused, as a frame, a wreath, or a hanging bouquet, extending its value well past the wedding.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Order 4 to 6 months ahead from a florist or a workshop specializing in dried flowers: quality varies enormously between suppliers. Always ask to see or touch a sample before committing to a large quantity.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To choose the right vendor for your budget and style, see our guide on [choosing your wedding florist](/blog/choisir-fleuriste-mariage). If you'd rather stick with fresh flowers, our article on [seasonal, local flowers](/blog/fleurs-mariage-saison-locales) can help you sort through options.",
        ],
      },
    ],
  }),

  postPair({
    slug: "decoration-ceremonie-arche-allee",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Décor de cérémonie : arche, allée, backdrop",
    titleEn: "Ceremony decor: arch, aisle, and backdrop",
    excerptFr:
      "Arche fleurie, allée pétales ou tapis, backdrop photo : les trois éléments qui structurent le décor d'une cérémonie, en location ou en DIY.",
    excerptEn:
      "Floral arch, petal-strewn aisle, photo backdrop: the three elements that shape ceremony decor, whether rented or DIY.",
    readingMinutes: 6,
    heroAltFr: "Arche florale pour cérémonie de mariage",
    heroAltEn: "Floral arch for a wedding ceremony",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le décor d'une cérémonie, religieuse ou laïque, repose en général sur trois éléments qui concentrent l'attention vers les mariés. Bien les penser compte plus que de multiplier les pièces autour.",
        ],
      },
      {
        type: "list",
        title: "Les trois éléments clés du décor de cérémonie",
        items: [
          "L'arche (ou arbre à huppé), point focal derrière les mariés, en bois, métal ou bambou selon le style recherché",
          "L'allée, marquée par un tapis, des pétales, ou simplement des rangées de chaises bien alignées",
          "Le backdrop ou fond de scène, souvent utilisé pour la photo officielle et repris ensuite pour le photobooth",
        ],
      },
      {
        type: "list",
        title: "Louer ou fabriquer soi-même",
        items: [
          "Une arche en bois brut se loue couramment autour de 80 à 150€ pour la journée chez un loueur événementiel, hors habillage floral",
          "Le DIY (arche en bambou, tissu, fleurs séchées) réduit le coût mais demande du temps de montage la veille ou le matin même",
          "Prévoir systématiquement qui monte et démonte l'arche, et à quelle heure, dans le planning jour J d'un prestataire ou d'un proche",
        ],
      },
      {
        type: "text",
        title: "Adapter le décor au lieu",
        paragraphs: [
          "En extérieur, une arche légère en bois ou en métal résiste mieux au vent qu'une structure en tissu drapé, qui peut se transformer en voile au premier coup de vent. En intérieur, le backdrop prend souvent le relais de l'arche pour habiller un mur nu derrière les mariés.",
          "Vérifiez toujours les contraintes du lieu avant de commander : certains domaines interdisent de planter une structure dans le sol ou imposent leurs propres décors de cérémonie.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Gardez la même arche ou le même backdrop pour la photo de groupe après la cérémonie : cela évite de multiplier les décors à transporter et facilite la logistique du photographe.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour harmoniser ce décor avec le reste de la déco florale, voir notre article sur les [fleurs séchées et stabilisées](/blog/fleurs-sechees-stabilisees-mariage) et notre guide pour [choisir son fleuriste de mariage](/blog/choisir-fleuriste-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A ceremony's decor, whether religious or secular, usually rests on three elements that shape attention toward the couple. Getting them right matters more than piling on extra pieces.",
        ],
      },
      {
        type: "list",
        title: "The three key ceremony decor elements",
        items: [
          "The arch (or arbor), a focal point behind the couple, in wood, metal, or bamboo depending on the style",
          "The aisle, marked by a runner, petals, or simply well-aligned rows of chairs",
          "The backdrop, often used for the official photo and reused later for a photo booth",
        ],
      },
      {
        type: "list",
        title: "Renting or building it yourself",
        items: [
          "A raw wood arch typically rents for around 80 to 150 euros for the day from an event rental company, before floral dressing",
          "DIY (bamboo, fabric, dried flowers) cuts the cost but takes setup time the day before or the morning of",
          "Always slot who sets up and takes down the arch, and when, into the day-of schedule of a vendor or a family member",
        ],
      },
      {
        type: "text",
        title: "Matching the decor to the venue",
        paragraphs: [
          "Outdoors, a light wood or metal arch holds up better in wind than a draped fabric structure, which can turn into a sail at the first gust. Indoors, the backdrop often takes over the arch's job of dressing a bare wall behind the couple.",
          "Always check the venue's constraints before ordering: some estates forbid anchoring a structure into the ground or require their own ceremony decor.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Keep the same arch or backdrop for the group photo after the ceremony: it avoids multiplying the pieces to transport and makes the photographer's logistics easier.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To match this decor with the rest of your florals, see our article on [dried and preserved flowers](/blog/fleurs-sechees-stabilisees-mariage) and our guide to [choosing your wedding florist](/blog/choisir-fleuriste-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "decoration-salle-reception-planifier",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Décorer la salle de réception : plan et budget déco",
    titleEn: "Decorating the reception venue: a plan and a budget",
    excerptFr:
      "Éclairage, nappage, centres de table, signalétique : comment penser la déco de la salle comme un tout plutôt que poste par poste.",
    excerptEn:
      "Lighting, linens, centerpieces, signage: how to plan reception decor as a whole rather than item by item.",
    readingMinutes: 7,
    heroAltFr: "Salle de réception de mariage décorée",
    heroAltEn: "Decorated wedding reception venue",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Beaucoup de couples achètent leur décoration poste par poste, une guirlande ici, des bougies là, sans plan d'ensemble. Le résultat final manque alors de cohérence une fois toutes les pièces réunies dans la salle.",
        ],
      },
      {
        type: "list",
        title: "Les postes qui composent la déco d'une salle",
        items: [
          "Éclairage : guirlandes, bougies, projecteurs d'ambiance, souvent le poste le plus transformateur pour un budget limité",
          "Nappage et linge de table, couleur et matière (lin, coton, satin)",
          "Centres de table : fleurs, bougies, éléments décoratifs, hauteur à adapter pour ne pas gêner la conversation",
          "Signalétique : plan de table, pancartes de bar, menu affiché, panneaux directionnels",
        ],
      },
      {
        type: "text",
        title: "Combien représente la déco dans le budget global",
        paragraphs: [
          "La décoration représente en général 8 à 12% du budget total d'un mariage en France, hors fleurs qui sont parfois comptées à part. Ce chiffre grimpe vite si chaque élément est acheté séparément sans vision d'ensemble.",
          "Fixer une enveloppe dédiée dès le départ, puis répartir entre location, achat et DIY, évite les petits achats impulsifs qui s'additionnent sans qu'on s'en rende compte.",
        ],
      },
      {
        type: "list",
        title: "S'appuyer sur le style déjà présent dans le lieu",
        items: [
          "Un lieu déjà chargé en caractère (poutres apparentes, pierre, jardin fleuri) a besoin de moins de décoration ajoutée qu'une salle des fêtes neutre",
          "Demander en amont les éléments déjà fournis par la salle (mobilier, éclairage fixe, nappage de base) pour ne pas payer en double",
          "Prendre des photos du lieu vide avant de choisir la déco, pour visualiser ce qui manque réellement plutôt que d'imaginer",
        ],
      },
      {
        type: "text",
        title: "Construire un plan déco plutôt qu'une liste",
        paragraphs: [
          "Avant d'acheter, esquissez une image d'ensemble : quelle couleur dominante, quel style (champêtre, minimaliste, romantique), quelle ambiance lumineuse en soirée. Chaque achat se juge ensuite par rapport à ce plan, ce qui évite les décorations qui jurent entre elles une fois toutes réunies dans la salle.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ne négligez pas l'éclairage du soir : une salle magnifique en plein jour peut paraître froide et vide une fois la nuit tombée si l'éclairage d'ambiance n'a pas été prévu.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour le mobilier et la vaisselle que le traiteur n'inclut pas toujours, voir notre guide [location mobilier et vaisselle](/blog/location-mobilier-vaisselle-mariage), et suivez votre enveloppe déco dans le [budget Fiancé](/tools/budget-calculator).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Couples often buy decor piece by piece, a garland here, candles there, without an overall plan, and end up with a look that doesn't hang together once everything is in the room.",
        ],
      },
      {
        type: "list",
        title: "The line items that make up a venue's decor",
        items: [
          "Lighting: string lights, candles, ambient projectors, often the most transformative line item for a limited budget",
          "Linens: table cloths, color and fabric (linen, cotton, satin)",
          "Centerpieces: flowers, candles, decorative objects, height adjusted so they don't block conversation",
          "Signage: seating chart, bar signs, displayed menu, directional signs",
        ],
      },
      {
        type: "text",
        title: "How much decor takes up in the overall budget",
        paragraphs: [
          "Decor generally makes up 8 to 12% of a wedding's total budget in France, excluding flowers which are sometimes tracked separately. That figure climbs fast when every item is bought separately with no overall vision.",
          "Setting a dedicated envelope from the start, then splitting it between rental, purchase, and DIY, avoids small impulse buys that add up without anyone noticing.",
        ],
      },
      {
        type: "list",
        title: "Building on the venue's existing style",
        items: [
          "A venue already full of character (exposed beams, stone, a flowering garden) needs less added decor than a neutral function hall",
          "Ask ahead what the venue already provides (furniture, fixed lighting, basic linens) to avoid paying for it twice",
          "Take photos of the empty venue before choosing decor, to see what's actually missing rather than imagining it",
        ],
      },
      {
        type: "text",
        title: "Build a decor plan, not just a list",
        paragraphs: [
          "Before buying, sketch an overall picture: a dominant color, a style (rustic, minimalist, romantic), an evening lighting mood. Judge every purchase against that plan, which avoids decor pieces that clash once they're all together in the room.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Don't neglect evening lighting: a stunning venue in daylight can look cold and empty once night falls if ambient lighting wasn't planned.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For furniture and tableware a caterer doesn't always include, see our guide [furniture and tableware rental](/blog/location-mobilier-vaisselle-mariage), and track your decor envelope in the [Fiancé budget tool](/tools/budget-calculator).",
        ],
      },
    ],
  }),

  postPair({
    slug: "noms-numeros-tables-mariage",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Noms et numéros de table : idées déco cohérentes",
    titleEn: "Table names and numbers: ideas that stay consistent",
    excerptFr:
      "Numéros classiques, prénoms de lieux voyagés, titres de chansons : comment nommer ses tables sans perdre en lisibilité pour les invités.",
    excerptEn:
      "Classic numbers, travel destinations, song titles: how to name your tables without losing clarity for guests.",
    readingMinutes: 5,
    heroAltFr: "Marque-table numéroté pour mariage",
    heroAltEn: "Numbered table marker for a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Nommer ses tables plutôt que les numéroter séduit de plus en plus de couples, mais le risque existe de perdre des invités plus âgés ou étrangers si le thème devient trop créatif. Tout est question d'équilibre entre personnalité et lisibilité.",
        ],
      },
      {
        type: "list",
        title: "Idées de thèmes pour nommer les tables",
        items: [
          "Des lieux voyagés ensemble (villes, pays visités en couple)",
          "Des titres de chansons ou d'albums qui comptent pour vous",
          "Des prénoms de grands-parents ou d'un lieu familial marquant",
          "Simplement des numéros, sobre et sans ambiguïté possible",
        ],
      },
      {
        type: "text",
        title: "Garder la cohérence avec le thème global",
        paragraphs: [
          "Le nom de table gagne à reprendre un fil déjà présent ailleurs dans la papeterie ou la déco (mêmes couleurs, même typographie), plutôt que d'être un élément isolé pensé à part.",
          "Si le mariage a un fil rouge clair (voyage, musique, nature), les noms de table en deviennent une extension naturelle plutôt qu'un gadget ajouté.",
        ],
      },
      {
        type: "list",
        title: "Rester lisible pour tous les invités",
        items: [
          "Toujours indiquer le numéro en petit à côté du nom créatif, sur l'escort card comme sur le marque-table, pour ne perdre personne",
          "Éviter les références trop personnelles ou obscures que seule une partie des invités comprendra",
          "Prévoir une police de caractère assez grande et lisible, y compris pour des invités plus âgés",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un plan mural affiché à l'entrée avec correspondance nom/numéro résout la plupart des hésitations, surtout si le mariage compte plus de cent invités.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour construire l'ensemble du placement, voir notre [guide complet du plan de table](/blog/plan-de-table-mariage-guide-complet) et organisez le vôtre avec le [plan de table Fiancé](/tools/seating-chart).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Naming tables is popular, but the risk is confusing older or foreign guests if the theme gets too clever. It's a balance between personality and practicality.",
        ],
      },
      {
        type: "list",
        title: "Ideas for naming your tables",
        items: [
          "Places you've traveled together (cities, countries visited as a couple)",
          "Song or album titles that matter to you",
          "Names of grandparents or a meaningful family place",
          "Simply numbers, plain and unambiguous",
        ],
      },
      {
        type: "text",
        title: "Keeping it consistent with the overall theme",
        paragraphs: [
          "A table name works best when it picks up a thread already present elsewhere in the stationery or decor (the same colors, the same typeface), rather than standing as an isolated idea on its own.",
          "If the wedding has a clear thread (travel, music, nature), table names become a natural extension of it rather than an added gimmick.",
        ],
      },
      {
        type: "list",
        title: "Staying readable for every guest",
        items: [
          "Always show the number in small print next to the creative name, on both the escort card and the place marker, so no one gets lost",
          "Avoid references too personal or obscure for only part of the guests to understand",
          "Use a large enough, readable font, including for older guests",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A wall chart at the entrance matching names to numbers solves most hesitation, especially for a wedding of more than a hundred guests.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To build the full seating plan, see our [complete seating chart guide](/blog/plan-de-table-mariage-guide-complet) and build yours with the [Fiancé seating chart](/tools/seating-chart).",
        ],
      },
    ],
  }),

  postPair({
    slug: "location-decoration-mariage",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Louer sa décoration de mariage : ce qui vaut le coup",
    titleEn: "Renting wedding decor: what's actually worth it",
    excerptFr:
      "Arche, vaisselle, mange-debout : ce qui se loue avec un vrai gain financier, et ce qu'il vaut mieux acheter ou fabriquer soi-même.",
    excerptEn:
      "Arch, tableware, cocktail tables: what's genuinely worth renting, and what's better bought or DIY'd.",
    readingMinutes: 6,
    heroAltFr: "Mobilier de mariage en location",
    heroAltEn: "Rented wedding furniture",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La question louer ou acheter se tranche souvent par habitude plutôt que par calcul. Une règle simple aide à trancher : les gros volumes à usage unique se louent, le reste s'achète ou se fabrique.",
        ],
      },
      {
        type: "list",
        title: "Ce qui vaut presque toujours le coup en location",
        items: [
          "Les gros volumes utilisés une seule fois : arche, mange-debout, mobilier lounge",
          "La vaisselle et la verrerie assorties à une thématique précise, coûteuses à l'achat pour un usage unique",
          "Les structures type tente, éclairage professionnel, sonorisation : matériel technique hors de portée d'un achat ponctuel",
        ],
      },
      {
        type: "list",
        title: "Ce qu'il vaut mieux acheter ou fabriquer",
        items: [
          "Les petits éléments réutilisables ou personnalisables (bougies, contenants, pancartes)",
          "Tout ce qui se garde en souvenir après le mariage (cadre, guirlande lumineuse pour la maison)",
          "Les éléments simples à fabriquer soi-même sans compétence particulière (étiquettes, marque-places)",
        ],
      },
      {
        type: "text",
        title: "Éviter de payer deux fois le même article",
        paragraphs: [
          "Vérifiez toujours ce que votre traiteur ou votre lieu de réception inclut déjà avant de louer en parallèle. Une chaise ou une nappe louée en plus d'un forfait qui les propose déjà revient à payer le même article deux fois.",
          "Demandez un devis ligne par ligne à chaque prestataire concerné (traiteur, lieu, loueur événementiel indépendant) pour repérer les doublons avant de signer.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Comparer le prix d'un loueur événementiel indépendant à celui du traiteur pour un article identique révèle souvent un écart significatif : le traiteur applique parfois une marge sur le mobilier qu'il sous-loue lui-même.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour le détail de ce qu'un traiteur inclut ou non, voir notre guide [location mobilier et vaisselle](/blog/location-mobilier-vaisselle-mariage), et suivez chaque poste de location dans votre [budget](/tools/budget-calculator).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The rent-or-buy question is often decided out of habit rather than actual math. A useful rule of thumb: large, single-use items get rented, everything else gets bought or made.",
        ],
      },
      {
        type: "list",
        title: "What's almost always worth renting",
        items: [
          "Large items used only once: an arch, cocktail tables, lounge furniture",
          "Tableware and glassware matched to a specific theme, expensive to buy for one-time use",
          "Technical setups like tents, professional lighting, and sound equipment, out of reach for a one-off purchase",
        ],
      },
      {
        type: "list",
        title: "What's better bought or made",
        items: [
          "Small reusable or personalizable items (candles, containers, signs)",
          "Anything kept as a keepsake after the wedding (a frame, string lights for your home)",
          "Simple items you can make yourself without special skill (tags, place cards)",
        ],
      },
      {
        type: "text",
        title: "Avoiding paying twice for the same item",
        paragraphs: [
          "Always check what your caterer or venue already includes before renting the same thing separately. A chair or a tablecloth rented on top of a package that already provides them means paying for the same item twice.",
          "Ask each vendor involved (caterer, venue, independent event rental company) for a line-by-line quote to catch overlaps before signing.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Comparing an independent event rental company's price to your caterer's for the same item often reveals a real gap: caterers sometimes mark up furniture they sub-rent themselves.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For the details of what a caterer includes or not, see our guide [furniture and tableware rental](/blog/location-mobilier-vaisselle-mariage), and track each rental line in your [budget](/tools/budget-calculator).",
        ],
      },
    ],
  }),

  postPair({
    slug: "robe-mariee-morphologie-silhouette",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Robe de mariée selon sa morphologie : le bon modèle",
    titleEn: "Wedding dress by body shape: finding the right cut",
    excerptFr:
      "Sirène, trapèze, princesse, fourreau : comment choisir une silhouette de robe qui vous va vraiment, plutôt qu'une tendance vue en ligne.",
    excerptEn:
      "Mermaid, A-line, ballgown, sheath: how to choose a dress silhouette that actually suits you, not just a trend seen online.",
    readingMinutes: 6,
    heroAltFr: "Essayage de robe de mariée en boutique",
    heroAltEn: "Trying on a wedding dress in a bridal boutique",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Beaucoup de futures mariées arrivent en boutique avec un modèle précis en tête, vu sur Pinterest, sans avoir essayé d'autres silhouettes. Un conseil honnête en cabine compte souvent plus qu'une tendance repérée en ligne.",
        ],
      },
      {
        type: "list",
        title: "Les grandes silhouettes et à qui elles conviennent",
        items: [
          "Sirène / fourreau : marque la taille et les hanches, flatte une silhouette avec une taille bien définie, demande de l'aisance pour s'asseoir et danser",
          "Princesse / trapèze : jupe ample dès la taille, camoufle facilement le ventre et les hanches, très confortable pour danser toute la soirée",
          "Fourreau droit : silhouette allongée, va bien aux morphologies élancées, moins indulgente sur les zones à camoufler",
          "Empire : taille remontée sous la poitrine, flatte particulièrement les silhouettes en poire ou une grossesse récente",
        ],
      },
      {
        type: "text",
        title: "Écouter la vendeuse plutôt que la photo Pinterest",
        paragraphs: [
          "Une robe qui semble parfaite sur une autre morphologie peut tomber complètement différemment sur la vôtre. Une bonne vendeuse en boutique repère en quelques essayages ce qui vous met réellement en valeur, souvent un modèle auquel vous n'auriez pas pensé seule.",
          "Restez ouverte aux suggestions lors du premier essayage, même si elles s'éloignent de votre idée de départ. La silhouette qui flatte vraiment votre corps compte plus que celle qui suit la tendance du moment.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'il faut vérifier en essayage, au-delà du style",
        items: [
          "Le confort assis, notamment pour le dîner et la cérémonie",
          "L'amplitude de mouvement pour danser sans craindre de craquer une couture",
          "Le poids de la robe si elle comporte beaucoup de matière ou de traîne",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ne vous fiez pas uniquement au miroir de la boutique : demandez à marcher, vous asseoir et lever les bras dans la robe avant de la choisir.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour explorer les alternatives d'occasion ou en location si le budget robe est serré, voir notre article [robe d'occasion ou en location](/blog/robe-mariee-seconde-main-louer).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Many brides-to-be arrive at the boutique fixed on one dress from a Pinterest board, without trying anything else. Honest fitting-room advice matters more than a trend spotted online.",
        ],
      },
      {
        type: "list",
        title: "The main silhouettes and who they suit",
        items: [
          "Mermaid / sheath: highlights the waist and hips, flatters a well-defined waist, needs ease of movement to sit and dance",
          "Ballgown / A-line: a full skirt from the waist down, easily conceals the stomach and hips, very comfortable for dancing all night",
          "Straight sheath: an elongated silhouette, suits a slender frame well, less forgiving on areas you'd rather minimize",
          "Empire: a raised waistline under the bust, particularly flattering for a pear shape or a recent pregnancy",
        ],
      },
      {
        type: "text",
        title: "Listen to the salesperson more than the Pinterest photo",
        paragraphs: [
          "A dress that looks perfect on a different body shape can fall completely differently on yours. A good boutique salesperson can spot within a few fittings what genuinely flatters you, often a style you hadn't considered on your own.",
          "Stay open to suggestions during the first fitting, even if they stray from your original idea. The silhouette that truly flatters your body matters more than the one following the current trend.",
        ],
      },
      {
        type: "list",
        title: "What to check in a fitting, beyond style",
        items: [
          "Comfort while seated, especially for dinner and the ceremony",
          "Range of motion for dancing without fear of a seam tearing",
          "The dress's weight if it has a lot of fabric or a train",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Don't rely only on the boutique mirror: ask to walk, sit down, and raise your arms in the dress before choosing it.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To explore second-hand or rental alternatives if your dress budget is tight, see our article [second-hand or rented dress](/blog/robe-mariee-seconde-main-louer).",
        ],
      },
    ],
  }),

  postPair({
    slug: "robe-mariee-seconde-main-louer",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Robe d'occasion ou en location : bien s'habiller pour moins",
    titleEn: "Second-hand or rented dress: dressing well for less",
    excerptFr:
      "Plateformes de revente, boutiques de location, friperies spécialisées : combien on économise réellement, et ce qu'il faut vérifier avant d'acheter.",
    excerptEn:
      "Resale platforms, rental boutiques, specialist consignment shops: how much you really save, and what to check before buying.",
    readingMinutes: 6,
    heroAltFr: "Robe de mariée d'occasion sur cintre",
    heroAltEn: "Second-hand wedding dress on a hanger",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La robe reste souvent l'une des trois dépenses individuelles les plus élevées d'un mariage. Le marché de la seconde main et de la location progresse en France, sans complexe, avec une qualité souvent excellente puisque la plupart des robes n'ont été portées qu'une seule fois.",
        ],
      },
      {
        type: "list",
        title: "Où trouver une robe d'occasion ou en location",
        items: [
          "Plateformes de revente spécialisées entre particuliers, souvent des robes portées une seule fois",
          "Boutiques dédiées à la seconde main mariage, avec essayage possible sur place",
          "Services de location, pratiques pour une robe portée sur une courte période et rendue ensuite",
          "Friperies haut de gamme, parfois avec des pièces de créateurs à prix largement réduit",
        ],
      },
      {
        type: "text",
        title: "Combien on économise réellement",
        paragraphs: [
          "Une robe de créateur d'occasion se négocie en général à 40 à 60% de son prix neuf, parfois plus si elle a déjà été portée et nettoyée. La location, elle, coûte souvent entre 15 et 30% du prix d'achat neuf pour un usage unique, un calcul qui a du sens si vous ne comptez pas garder la robe.",
          "Sur un budget mariage serré, ce poste économisé peut facilement financer un autre prestataire important, comme le photographe ou le traiteur.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'il faut vérifier avant de valider",
        items: [
          "L'état réel du tissu, notamment le bas de robe et les coutures sous les bras",
          "Les frais et délais de pressing ou de retouche nécessaires avant le mariage",
          "La politique de retour ou d'échange, surtout pour un achat en ligne sans essayage",
          "Le budget retouche à prévoir en plus du prix d'achat, souvent sous-estimé",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Prévoyez toujours une marge de plusieurs semaines pour les retouches sur une robe d'occasion : elle a rarement été taillée exactement pour votre morphologie.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour bien choisir la silhouette avant de chercher une occasion, voir notre guide [robe selon sa morphologie](/blog/robe-mariee-morphologie-silhouette). D'autres pistes d'économie dans notre article [mariage à petit budget](/blog/mariage-petit-budget-10-conseils).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The dress is often one of the top three individual expenses. The second-hand and rental market is growing in France, with no stigma attached, and quality can be excellent since most dresses were worn only once.",
        ],
      },
      {
        type: "list",
        title: "Where to find a second-hand or rented dress",
        items: [
          "Resale platforms specialized in peer-to-peer sales, often dresses worn a single time",
          "Boutiques dedicated to second-hand wedding dresses, with in-person fittings",
          "Rental services, convenient for a dress worn for a short window and returned afterward",
          "High-end consignment shops, sometimes with designer pieces at a steep discount",
        ],
      },
      {
        type: "text",
        title: "How much you really save",
        paragraphs: [
          "A second-hand designer dress typically sells for 40 to 60% of its retail price, sometimes more if it's already been worn and cleaned. Rental usually costs 15 to 30% of the retail price for one-time use, a calculation that makes sense if you don't plan to keep the dress.",
          "On a tight wedding budget, the money saved here can easily cover another major vendor, like the photographer or the caterer.",
        ],
      },
      {
        type: "list",
        title: "What to check before committing",
        items: [
          "The fabric's actual condition, especially the hem and the underarm seams",
          "The cost and timeline for dry cleaning or alterations needed before the wedding",
          "The return or exchange policy, especially for an online purchase with no fitting",
          "The alteration budget to plan on top of the purchase price, often underestimated",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always build in several weeks for alterations on a second-hand dress: it was rarely tailored exactly to your body.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To settle on the right silhouette before shopping second-hand, see our guide [dress by body shape](/blog/robe-mariee-morphologie-silhouette). For more savings ideas, see our article [wedding on a small budget](/blog/mariage-petit-budget-10-conseils).",
        ],
      },
    ],
  }),

  postPair({
    slug: "chaussures-mariee-confort",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Chaussures de mariée : rester belle et tenir la journée",
    titleEn: "Bridal shoes: looking good and lasting the whole day",
    excerptFr:
      "Talon, plateforme, semelle : comment choisir des chaussures qui tiennent la distance d'une journée debout et d'une soirée à danser.",
    excerptEn:
      "Heel, platform, sole: how to choose shoes that survive a full day standing and a night of dancing.",
    readingMinutes: 5,
    heroAltFr: "Chaussures de mariée posées sur le sol",
    heroAltEn: "Bridal shoes resting on the floor",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les chaussures sont souvent choisies en dernier, uniquement sur le look, puis regrettées dès la fin de journée. La journée implique pourtant de nombreuses heures debout et en mouvement (trajets entre mairie, cérémonie et salle, photos).",
        ],
      },
      {
        type: "list",
        title: "Ce qui compte plus que le style au premier regard",
        items: [
          "La hauteur du talon réellement supportable sur plusieurs heures, pas seulement lors d'un essayage de dix minutes",
          "Un talon large ou une plateforme, plus stable qu'un talon fin sur un sol extérieur (herbe, gravier)",
          "Une semelle qui n'accroche pas trop sur le parquet, pour ne pas glisser ni trop freiner en dansant",
        ],
      },
      {
        type: "text",
        title: "Roder les chaussures avant le jour J",
        paragraphs: [
          "Portez les chaussures chez vous plusieurs fois avant le mariage, y compris pour marcher un peu à l'extérieur si la cérémonie a lieu dehors. Une chaussure jamais portée est presque garantie de faire mal après quelques heures.",
          "Si le mariage se déroule en extérieur sur herbe ou gravier, pensez à des embouts protège-talons ou à une paire secondaire plus stable pour cette partie de la journée.",
        ],
      },
      {
        type: "list",
        title: "La paire de secours, une astuce qui change la soirée",
        items: [
          "Prévoir une seconde paire, plate ou basket discrète, pour la soirée dansante",
          "La glisser dans le sac d'un témoin plutôt que de la porter soi-même toute la journée",
          "Choisir une couleur neutre qui reste discrète sous une robe longue",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour choisir la robe en amont des chaussures, notre guide [robe selon sa morphologie](/blog/robe-mariee-morphologie-silhouette) vous aide à définir la longueur et donc la hauteur de talon adaptée.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Shoes are often chosen last, purely on looks, then regretted by evening. The day involves many hours standing and walking (transfers between the town hall, ceremony, and venue, plus photos).",
        ],
      },
      {
        type: "list",
        title: "What matters more than the look at first glance",
        items: [
          "The heel height you can actually tolerate over several hours, not just during a ten-minute fitting",
          "A wide heel or a platform, more stable than a thin heel on outdoor ground (grass, gravel)",
          "A sole that doesn't grip the dance floor too much, so you neither slip nor get held back while dancing",
        ],
      },
      {
        type: "text",
        title: "Breaking in the shoes before the day",
        paragraphs: [
          "Wear the shoes at home several times before the wedding, including a short walk outdoors if the ceremony takes place outside. A shoe never worn before is nearly guaranteed to hurt after a few hours.",
          "If the wedding takes place outdoors on grass or gravel, consider heel protectors or a second, more stable pair for that part of the day.",
        ],
      },
      {
        type: "list",
        title: "The backup pair, a trick that saves the evening",
        items: [
          "Pack a second pair, flat or a discreet sneaker, for the dance floor",
          "Slip them into a witness's bag rather than carrying them yourself all day",
          "Choose a neutral color that stays discreet under a long dress",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To choose the dress before the shoes, our guide [dress by body shape](/blog/robe-mariee-morphologie-silhouette) helps you settle on the length, and therefore the right heel height.",
        ],
      },
    ],
  }),

  postPair({
    slug: "tenue-invite-mariage-dress-code",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Tenue d'invité : décoder le dress code sans faux pas",
    titleEn: "Guest attire: decoding the dress code without a misstep",
    excerptFr:
      "Tenue de soirée, cocktail chic, champêtre chic : ce que ces mentions signifient vraiment, et les couleurs à éviter en tant qu'invité.",
    excerptEn:
      "Black tie, cocktail chic, rustic chic: what these terms actually mean, and the colors to avoid as a guest.",
    readingMinutes: 6,
    heroAltFr: "Invités habillés pour un mariage",
    heroAltEn: "Guests dressed for a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Une mention de dress code sur un faire-part reste souvent vague, et un peu anxiogène pour l'invité. Voici ce que signifient réellement les formulations les plus courantes en France.",
        ],
      },
      {
        type: "list",
        title: "Décoder les mentions les plus courantes",
        items: [
          "Tenue de soirée : costume sombre ou robe longue ou courte élégante, la version la plus formelle demandée sur un faire-part français",
          "Cocktail chic : robe midi ou costume sans cravate obligatoire, un cran en dessous de la tenue de soirée",
          "Champêtre chic : tenue élégante mais légère (matières fluides, moins de talons fins), pensée pour un mariage en extérieur, souvent l'été",
          "Décontracté chic : la mention la plus souple, costume sans veste ou robe simple, reste correcte sans être stricte",
        ],
      },
      {
        type: "list",
        title: "Ce qu'il vaut mieux éviter en tant qu'invité",
        items: [
          "Le blanc ou les teintes très proches du blanc, une règle qui reste largement respectée en France malgré les débats en ligne",
          "Une tenue trop proche de celle des demoiselles d'honneur si vous savez qu'elles portent une couleur précise",
          "Le total look noir pour une cérémonie très festive en journée d'été, souvent perçu comme trop sombre malgré l'absence d'interdit formel",
          "Une tenue trop décontractée par rapport à ce que le dress code demande, par méconnaissance ou par flemme",
        ],
      },
      {
        type: "text",
        title: "Quand vous n'êtes vraiment pas sûr",
        paragraphs: [
          "Demandez directement aux mariés ou à un témoin plutôt que de deviner : la plupart des couples préfèrent une question simple à un invité mal à l'aise ou en décalage le jour J.",
          "Le lieu et l'heure donnent aussi des indices utiles : une cérémonie en extérieur l'après-midi tolère généralement plus de légèreté qu'une réception en salle le soir.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Si vous faites partie du cortège, voir aussi notre guide sur [les tenues des témoins et demoiselles d'honneur](/blog/tenue-temoins-demoiselles-honneur) pour harmoniser votre look avec le reste du groupe.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A dress code note on the invitation is often vague and a bit anxiety-inducing. Here's what the common French terms actually mean.",
        ],
      },
      {
        type: "list",
        title: "Decoding the most common terms",
        items: [
          "Tenue de soirée (formal/black tie): a dark suit or an elegant long or short dress, the most formal option seen on a French invitation",
          "Cocktail chic: a midi dress or a suit with no tie required, one notch below tenue de soirée",
          "Champêtre chic (rustic chic): elegant but light attire (flowing fabrics, fewer thin heels), designed for an outdoor wedding, often in summer",
          "Décontracté chic (smart casual): the most relaxed option, a suit with no jacket or a simple dress, correct without being strict",
        ],
      },
      {
        type: "list",
        title: "What's better avoided as a guest",
        items: [
          "White or shades very close to white, a rule still widely respected in France despite online debates",
          "An outfit too close to what you know the bridesmaids are wearing, if you know their specific color",
          "An all-black look for a very festive daytime summer ceremony, often read as too somber despite no formal ban",
          "An outfit too casual for what the dress code asks, out of not knowing or not bothering to check",
        ],
      },
      {
        type: "text",
        title: "When you're genuinely unsure",
        paragraphs: [
          "Ask the couple or a witness directly rather than guess: most couples would rather field a simple question than see a guest uncomfortable or out of place on the day.",
          "The venue and the time of day also offer useful clues: an outdoor afternoon ceremony generally tolerates more lightness than an evening indoor reception.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "If you're part of the wedding party, also see our guide on [witness and bridesmaid outfits](/blog/tenue-temoins-demoiselles-honneur) to coordinate your look with the rest of the group.",
        ],
      },
    ],
  }),

  postPair({
    slug: "tenue-temoins-demoiselles-honneur",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Tenues des témoins et demoiselles d'honneur : harmoniser",
    titleEn: "Witness and bridesmaid outfits: coordinating without forcing",
    excerptFr:
      "Couleur commune, coupe libre, budget à leur charge : comment harmoniser les tenues du cortège sans imposer une robe identique.",
    excerptEn:
      "A shared color, free-form cuts, a budget they cover themselves: how to coordinate the wedding party's outfits without forcing identical dresses.",
    readingMinutes: 6,
    heroAltFr: "Témoins et demoiselles d'honneur en tenues assorties",
    heroAltEn: "Witnesses and bridesmaids in coordinated outfits",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Harmoniser les tenues sans imposer une robe identique reste un vrai sujet : beaucoup de mariées hésitent à trop demander à des proches qui financent eux-mêmes leur tenue.",
        ],
      },
      {
        type: "list",
        title: "Des façons d'harmoniser sans robe identique",
        items: [
          "Fixer une seule couleur ou une palette de deux à trois teintes, en laissant chacune choisir la coupe qui lui va",
          "Imposer uniquement la matière (satin, mousseline) et laisser le modèle libre",
          "Se limiter à un accessoire commun (bouquet, châle, chaussures) sur des tenues par ailleurs différentes",
        ],
      },
      {
        type: "text",
        title: "Le budget reste souvent à la charge des témoins",
        paragraphs: [
          "En France, il est d'usage que chaque témoin ou demoiselle d'honneur finance sa propre tenue, sauf mention contraire explicite des mariés. Garder cet usage en tête aide à choisir une contrainte (couleur, matière) suffisamment large pour rester abordable, plutôt qu'un modèle unique coûteux imposé à tout le monde.",
          "Si le budget de certains proches est limité, proposer une fourchette de prix ou une enseigne accessible en complément de la couleur demandée évite un malaise silencieux.",
        ],
      },
      {
        type: "list",
        title: "Communiquer la consigne clairement et tôt",
        items: [
          "Envoyer la couleur ou la palette plusieurs mois avant le mariage, jamais dans les dernières semaines",
          "Prévoir une marge de tolérance sur la nuance exacte, tout le monde ne trouvera pas la même teinte de vert ou de bleu",
          "Partager une photo d'inspiration plutôt qu'une seule référence stricte, pour laisser un peu de liberté",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour aller plus loin sur le rôle du cortège, voir notre guide [choisir ses témoins](/blog/choisir-temoins-role-mariage), et pour la tenue des autres invités, notre article [décoder le dress code](/blog/tenue-invite-mariage-dress-code).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Coordinating without forcing identical dresses: many brides worry about asking too much of friends who pay for their own outfit.",
        ],
      },
      {
        type: "list",
        title: "Ways to coordinate without an identical dress",
        items: [
          "Set a single color or a palette of two or three shades, letting each person choose the cut that suits them",
          "Only specify the fabric (satin, chiffon) and leave the style open",
          "Limit the shared element to one accessory (bouquet, wrap, shoes) on otherwise different outfits",
        ],
      },
      {
        type: "text",
        title: "The budget usually falls on the wedding party",
        paragraphs: [
          "In France, it's customary for each witness or bridesmaid to cover their own outfit, unless the couple explicitly says otherwise. Keeping that in mind helps you pick a constraint (color, fabric) loose enough to stay affordable, rather than a single expensive style imposed on everyone.",
          "If some friends have a tighter budget, suggesting a price range or an accessible retailer alongside the requested color avoids quiet discomfort.",
        ],
      },
      {
        type: "list",
        title: "Communicating the guideline clearly and early",
        items: [
          "Send the color or palette several months ahead of the wedding, never in the final weeks",
          "Allow some leeway on the exact shade, not everyone will find the same tone of green or blue",
          "Share an inspiration photo rather than a single strict reference, to leave a bit of freedom",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For more on the wedding party's role, see our guide [choosing your witnesses](/blog/choisir-temoins-role-mariage), and for other guests' attire, our article [decoding the dress code](/blog/tenue-invite-mariage-dress-code).",
        ],
      },
    ],
  }),

  postPair({
    slug: "demoiselles-honneur-role-choisir",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Demoiselles et garçons d'honneur : rôle et comment choisir",
    titleEn: "Bridesmaids and groomsmen: their role, and how to choose",
    excerptFr:
      "Soutien logistique, quelques tâches précises, parfois un mot lors du discours : ce qu'implique vraiment le rôle, et comment limiter la liste sans vexer personne.",
    excerptEn:
      "Logistical support, a few concrete tasks, sometimes a few words at the reception: what the role really involves, and how to narrow the list without hurting feelings.",
    readingMinutes: 6,
    heroAltFr: "Demoiselles d'honneur autour de la mariée",
    heroAltEn: "Bridesmaids gathered around the bride",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le rôle de demoiselle ou garçon d'honneur est moins codifié en France qu'aux Etats-Unis, et se confond souvent avec celui de témoin officiel. Voici ce qu'il recouvre réellement.",
        ],
      },
      {
        type: "list",
        title: "Ce que le rôle implique concrètement",
        items: [
          "Un soutien moral et logistique pendant les préparatifs, notamment lors des essayages ou de l'enterrement de vie de jeune fille ou de garçon",
          "Une aide ponctuelle le jour J : accueil des invités, gestion de petits imprévus, coup de main sur la déco",
          "Parfois un mot lors du discours, en complément ou à la place des témoins officiels selon l'organisation choisie",
          "Aucune obligation légale ni administrative, contrairement au rôle des témoins qui eux signent le registre",
        ],
      },
      {
        type: "text",
        title: "Combien en choisir",
        paragraphs: [
          "Il n'existe pas de nombre idéal : certains mariages français n'ont pas de demoiselles d'honneur du tout, d'autres en comptent quatre ou cinq. Le bon repère reste la taille du cercle proche, pas une tradition à copier telle quelle.",
          "Plus le nombre grandit, plus la coordination logistique se complique (tenues, horaires, rôle de chacune) : gardez un groupe suffisamment restreint pour rester gérable sans y passer trop de temps.",
        ],
      },
      {
        type: "list",
        title: "Réduire la liste sans blesser personne",
        items: [
          "Distinguer clairement rôle officiel (témoin, demoiselle d'honneur) et présence amicale au mariage : une amie proche non choisie reste une invitée d'honneur à part entière",
          "Expliquer le choix en privé plutôt que de laisser deviner, surtout si plusieurs amies proches espéraient être sollicitées",
          "Proposer un rôle alternatif (lecture, discours, aide à l'organisation) à une personne proche non retenue dans le cortège officiel",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour la version officielle et légale du rôle, voir notre guide [choisir ses témoins](/blog/choisir-temoins-role-mariage). Pour les remercier ensuite, notre article [cadeaux et remerciements aux témoins](/blog/cadeaux-temoins-remercier).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The role is less codified in France than in the US, and often blurred with the official witness role. Here's what it actually covers.",
        ],
      },
      {
        type: "list",
        title: "What the role actually involves",
        items: [
          "Moral and logistical support during planning, especially for fittings or the bachelorette or bachelor party",
          "Ad hoc help on the day: greeting guests, handling small hiccups, a hand with decor",
          "Sometimes a few words during the speeches, alongside or instead of the official witnesses depending on how the day is organized",
          "No legal or administrative obligation, unlike witnesses who sign the register",
        ],
      },
      {
        type: "text",
        title: "How many to choose",
        paragraphs: [
          "There's no ideal number: some French weddings have no bridesmaids at all, others have four or five. The right guide is the size of your inner circle, not a tradition to copy as-is.",
          "The larger the group, the more the logistics multiply (outfits, timing, everyone's role): keep the group small enough to stay manageable without eating up too much time.",
        ],
      },
      {
        type: "list",
        title: "Narrowing the list without hurting feelings",
        items: [
          "Separate clearly between an official role (witness, bridesmaid) and simply being a close friend at the wedding: a close friend not chosen is still a guest of honor in her own right",
          "Explain the choice privately rather than letting people guess, especially if several close friends hoped to be asked",
          "Offer an alternative role (a reading, a speech, help with planning) to someone close who wasn't picked for the official party",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For the official, legal version of the role, see our guide [choosing your witnesses](/blog/choisir-temoins-role-mariage). To thank them afterward, see our article [gifts and thank-yous for witnesses](/blog/cadeaux-temoins-remercier).",
        ],
      },
    ],
  }),

  postPair({
    slug: "cortege-enfants-honneur-organiser",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Cortège d'enfants d'honneur : âges, rôle, tenue",
    titleEn: "Flower girls and ring bearers: ages, role, and outfit",
    excerptFr:
      "Porte-alliances, jetée de pétales, âge idéal : comment organiser un cortège d'enfants sans stress, avec un plan B si un enfant craque.",
    excerptEn:
      "Ring bearer, flower petals, the right age: how to organize a children's procession without stress, with a backup plan if a child gets overwhelmed.",
    readingMinutes: 5,
    heroAltFr: "Enfants d'honneur pendant un mariage",
    heroAltEn: "Flower girl and ring bearer at a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un cortège d'enfants d'honneur attendrit toujours l'assemblée, mais demande des attentes réalistes sur l'âge et l'imprévisibilité propre aux jeunes enfants.",
        ],
      },
      {
        type: "list",
        title: "Les rôles classiques et l'âge adapté",
        items: [
          "Porte-alliances : idéalement 5 à 8 ans, assez grand pour comprendre la consigne, encore assez jeune pour l'aspect attendrissant",
          "Jeteuse de pétales : souvent une petite fille de 3 à 6 ans, rôle simple qui tolère bien l'imprévisibilité d'un jeune enfant",
          "Porteur du livret ou de la pancarte d'entrée : convient à un enfant un peu plus âgé, 7 à 10 ans, capable de tenir un rythme de marche",
        ],
      },
      {
        type: "text",
        title: "Répéter, sans en faire trop",
        paragraphs: [
          "Une répétition courte, quelques jours avant ou le matin même, suffit largement. Inutile de multiplier les entraînements : un enfant se souvient rarement d'une consigne complexe donnée trop en avance, et l'excès de répétition peut au contraire créer de l'appréhension.",
          "Gardez la consigne simple : un seul geste à faire, un seul objet à porter, plutôt qu'une chorégraphie précise à respecter.",
        ],
      },
      {
        type: "list",
        title: "Prévoir un plan B",
        items: [
          "Désigner un parent ou un proche prêt à intervenir discrètement si l'enfant hésite ou se met à pleurer",
          "Ne jamais rendre le moment obligatoire aux yeux de l'enfant : un enfant qui refuse d'avancer au dernier moment reste normal et sans gravité",
          "Prévoir une tenue confortable plutôt qu'un habit trop formel qui gênerait les mouvements ou gratterait",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour la suite du déroulé d'entrée, voir notre guide [cortège et entrée des mariés](/blog/cortege-entree-maries-organiser).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A children's procession is charming, but it takes realistic expectations about age and unpredictability.",
        ],
      },
      {
        type: "list",
        title: "Classic roles and the right age",
        items: [
          "Ring bearer: ideally 5 to 8 years old, old enough to understand the instruction, still young enough for the sweet factor",
          "Flower girl: often a girl aged 3 to 6, a simple role that tolerates a young child's unpredictability well",
          "Booklet or entrance sign bearer: suits a slightly older child, 7 to 10, able to keep pace while walking",
        ],
      },
      {
        type: "text",
        title: "Rehearsing, without overdoing it",
        paragraphs: [
          "A short rehearsal, a few days before or the morning of, is plenty. There's no need for repeated practice: a young child rarely remembers a complex instruction given too far ahead, and too much rehearsal can actually build up apprehension.",
          "Keep the instruction simple: one gesture, one object to carry, rather than a precise routine to follow.",
        ],
      },
      {
        type: "list",
        title: "Have a backup plan",
        items: [
          "Designate a parent or a family member ready to step in quietly if the child hesitates or starts crying",
          "Never make the moment feel mandatory to the child, a child who refuses to walk at the last second is normal and nothing to worry about",
          "Choose comfortable clothing rather than something too formal that restricts movement or itches",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For what follows in the entrance order, see our guide [wedding procession and entrance](/blog/cortege-entree-maries-organiser).",
        ],
      },
    ],
  }),

  postPair({
    slug: "cadeaux-temoins-remercier",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Remercier ses témoins : idées de cadeaux et attentions",
    titleEn: "Thanking your witnesses: gift ideas and small gestures",
    excerptFr:
      "Avant ou après le mariage, cadeau personnalisé ou moment partagé : comment remercier sincèrement ceux qui vous ont accompagnés.",
    excerptEn:
      "Before or after the wedding, a personalized gift or a shared moment: how to sincerely thank the people who stood by you.",
    readingMinutes: 5,
    heroAltFr: "Cadeau de remerciement pour témoins de mariage",
    heroAltEn: "Thank-you gift for wedding witnesses",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Vos témoins et votre cortège investissent du temps, et souvent de l'argent, dans votre mariage. Un geste de remerciement compte, sans avoir besoin d'être coûteux.",
        ],
      },
      {
        type: "list",
        title: "Idées de cadeaux appréciées",
        items: [
          "Un objet personnalisé lié à un souvenir commun plutôt qu'un cadeau générique acheté à la dernière minute",
          "Une expérience partagée après le mariage (repas, sortie), pour prolonger le moment au-delà du jour J",
          "Une attention pratique liée au jour même (kit de préparation, tenue offerte ou partiellement remboursée)",
          "Une lettre manuscrite, souvent citée comme le geste qui touche le plus, indépendamment de sa valeur monétaire",
        ],
      },
      {
        type: "text",
        title: "Avant ou après le mariage : les deux fonctionnent",
        paragraphs: [
          "Un petit cadeau remis le matin même, pendant les préparatifs, crée un moment à part avant le tourbillon de la journée. Un cadeau ou un mot envoyé dans les semaines suivantes permet à l'inverse de remercier avec plus de recul, une fois le mariage passé.",
          "Rien n'oblige à choisir l'un ou l'autre : certains couples offrent un petit geste le jour J et un remerciement plus complet ensuite.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Le prix du cadeau compte beaucoup moins que l'attention portée : un mot sincère et personnalisé marque souvent plus qu'un objet cher mais impersonnel.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour bien choisir qui porte ce rôle en amont, voir notre guide [choisir ses témoins](/blog/choisir-temoins-role-mariage). Pour les remerciements adressés à l'ensemble des invités après le mariage, voir notre article [remerciements après le mariage](/blog/remerciements-apres-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Witnesses and the wedding party invest time, and often money. A gesture of thanks matters, and it doesn't need to be expensive.",
        ],
      },
      {
        type: "list",
        title: "Gift ideas that land well",
        items: [
          "A personalized object tied to a shared memory rather than a generic last-minute gift",
          "A shared experience after the wedding (a meal, an outing), to extend the moment beyond the day itself",
          "A practical gesture tied to the day itself (a prep kit, an outfit gifted or partly reimbursed)",
          "A handwritten letter, often cited as the gesture that means the most, regardless of its price",
        ],
      },
      {
        type: "text",
        title: "Before or after the wedding: both work",
        paragraphs: [
          "A small gift given the morning of, during getting-ready, creates a moment apart before the whirlwind of the day. A gift or a note sent in the following weeks, on the other hand, lets you thank them with more perspective, once the wedding has passed.",
          "Nothing forces you to choose one or the other: some couples offer a small gesture on the day and a fuller thank-you afterward.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The price of the gift matters far less than the thought behind it: a sincere, personal note often leaves a bigger mark than an expensive but impersonal object.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To choose who takes on this role in the first place, see our guide [choosing your witnesses](/blog/choisir-temoins-role-mariage). For thanking all your guests after the wedding, see our article [thank-yous after the wedding](/blog/remerciements-apres-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "cortege-entree-maries-organiser",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Cortège et entrée des mariés : ordre et mise en scène",
    titleEn: "Wedding procession and entrance: order and staging",
    excerptFr:
      "Le marié en premier, la mariée au bras de son père, une entrée à deux : plusieurs options existent, aucune n'est obligatoire.",
    excerptEn:
      "Groom first, bride on her father's arm, walking in together: several options exist, none of them mandatory.",
    readingMinutes: 6,
    heroAltFr: "Entrée des mariés en cérémonie",
    heroAltEn: "Wedding couple entrance at the ceremony",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "L'entrée des mariés est souvent perçue comme une tradition figée, alors qu'en dehors de certains rites religieux précis, aucune règle légale ou religieuse ne l'impose. Le couple choisit ce qui lui ressemble.",
        ],
      },
      {
        type: "list",
        title: "Les options d'entrée les plus courantes",
        items: [
          "La mariée entre seule ou au bras de son père (ou d'une figure proche), suivie ou précédée du cortège",
          "Le marié entre en premier avec sa propre famille, une option de plus en plus choisie pour symétriser le moment",
          "Les mariés entrent ensemble, côte à côte, une mise en scène qui gagne du terrain notamment pour une cérémonie laïque",
          "Une entrée en deux temps : cortège d'abord (témoins, enfants d'honneur), couple en dernier pour créer un temps fort",
        ],
      },
      {
        type: "text",
        title: "Ce qui influence le choix",
        paragraphs: [
          "Le type de cérémonie joue un rôle : une cérémonie religieuse suit souvent un ordre plus codifié, tandis qu'une cérémonie laïque laisse une liberté quasi totale. La configuration familiale compte aussi, par exemple quand un parent est absent ou que la relation avec lui est compliquée.",
          "Il n'existe aucune règle qui impose une option plutôt qu'une autre : le bon choix est celui qui correspond à votre histoire et à ce que vous voulez transmettre à ce moment précis.",
        ],
      },
      {
        type: "list",
        title: "Penser la mise en scène, pas seulement l'ordre",
        items: [
          "La musique choisie pour l'entrée, souvent différente de celle de la sortie",
          "Le rythme de marche, ni trop rapide pour ne rien louper, ni trop lent pour ne pas créer de flottement",
          "La position du photographe et du vidéaste, briefés à l'avance sur l'ordre exact prévu",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Une fois l'entrée réglée, pensez aux mots qui suivront : notre guide pour [écrire ses vœux personnels](/blog/voeux-personnels-mariage-ecrire) vous aide à préparer la suite de la cérémonie.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The entrance is often assumed to be a fixed tradition, but outside specific religious rites there's no legal or religious obligation. The couple chooses what fits them.",
        ],
      },
      {
        type: "list",
        title: "The most common entrance options",
        items: [
          "The bride enters alone or on her father's arm (or another close figure), followed or preceded by the wedding party",
          "The groom enters first with his own family, an option increasingly chosen to make the moment symmetrical",
          "The couple enters together, side by side, a staging choice gaining ground especially for a secular ceremony",
          "A two-part entrance: the wedding party first (witnesses, flower girl and ring bearer), the couple last to create a high point",
        ],
      },
      {
        type: "text",
        title: "What shapes the choice",
        paragraphs: [
          "The type of ceremony plays a role: a religious ceremony often follows a more codified order, while a secular ceremony leaves almost total freedom. Family circumstances matter too, for instance when a parent is absent or the relationship with them is complicated.",
          "There's no rule that favors one option over another: the right choice is the one that matches your own story and what you want that moment to say.",
        ],
      },
      {
        type: "list",
        title: "Planning the staging, not just the order",
        items: [
          "The music chosen for the entrance, often different from the one used for the exit",
          "The walking pace, not so fast that people miss it, not so slow that it creates an awkward lull",
          "The photographer's and videographer's positions, briefed ahead on the exact order planned",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Once the entrance is settled, think about the words that follow: our guide to [writing your personal vows](/blog/voeux-personnels-mariage-ecrire) helps you prepare the rest of the ceremony.",
        ],
      },
    ],
  }),

  postPair({
    slug: "voeux-personnels-mariage-ecrire",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Écrire ses vœux personnels : méthode et exemples",
    titleEn: "Writing your personal vows: a method and examples",
    excerptFr:
      "Comment on s'est rencontrés, ce que j'aime chez toi, ce que je promets : une structure simple pour écrire des vœux sincères sans se noyer dans la page blanche.",
    excerptEn:
      "How we met, what I love about you, what I promise: a simple structure for writing sincere vows without staring at a blank page.",
    readingMinutes: 6,
    heroAltFr: "Couple échangeant ses vœux personnels",
    heroAltEn: "Couple exchanging personal vows",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les vœux personnels se généralisent dans les cérémonies laïques françaises, et la page blanche fait souvent peur. Voici une structure simple pour démarrer.",
        ],
      },
      {
        type: "list",
        title: "Une structure simple en trois temps",
        items: [
          "Comment nous nous sommes rencontrés ou un souvenir marquant du début de la relation, raconté avec vos propres mots",
          "Ce que vous aimez chez l'autre, avec un ou deux exemples concrets plutôt que des qualificatifs généraux",
          "Ce que vous promettez pour la suite, une ou deux promesses sincères plutôt qu'une longue liste",
        ],
      },
      {
        type: "text",
        title: "Garder une longueur proche entre les deux",
        paragraphs: [
          "Rien n'est plus gênant qu'un vœu de trente secondes suivi d'un autre de cinq minutes. Sans viser une égalité parfaite, échangez un brouillon quelques semaines avant pour vérifier que les deux textes restent dans un format comparable.",
          "Une durée de une à deux minutes par personne suffit largement : la sincérité compte plus que la longueur, et un texte trop long perd souvent en émotion ce qu'il gagne en détails.",
        ],
      },
      {
        type: "list",
        title: "Conseils pratiques d'écriture",
        items: [
          "Écrire d'abord au brouillon sans se censurer, corriger le ton ensuite",
          "Éviter les private jokes incompréhensibles pour les invités présents",
          "Préparer une version imprimée en plus d'une mémorisation, l'émotion du moment peut faire perdre le fil",
          "Relire à voix haute plusieurs fois avant le jour J, un texte écrit ne sonne pas toujours pareil à l'oral",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Prévoyez un mouchoir et un verre d'eau à portée de main pendant l'échange des vœux : l'émotion coupe souvent la voix, même chez les personnes les plus à l'aise à l'oral.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour la suite de la cérémonie et les discours des proches, voir notre guide [réussir les discours des mariés et témoins](/blog/discours-maries-temoins-reussir). Pour organiser une cérémonie laïque complète, notre article sur [choisir son officiant](/blog/ceremonie-laique-choisir-officiant).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Personal vows are increasingly common in French secular ceremonies, and the blank page can be intimidating. Here's a simple structure to work from.",
        ],
      },
      {
        type: "list",
        title: "A simple three-part structure",
        items: [
          "How you met, or a memorable moment from early in the relationship, told in your own words",
          "What you love about the other person, with one or two concrete examples rather than general adjectives",
          "What you promise going forward, one or two sincere promises rather than a long list",
        ],
      },
      {
        type: "text",
        title: "Keeping a similar length between the two",
        paragraphs: [
          "Nothing is more awkward than a thirty-second vow followed by a five-minute one. Without aiming for a perfect match, trade drafts a few weeks ahead to check both texts land in a comparable format.",
          "One to two minutes each is plenty: sincerity matters more than length, and an overly long text often loses in emotion what it gains in detail.",
        ],
      },
      {
        type: "list",
        title: "Practical writing tips",
        items: [
          "Write a first draft without self-censoring, fix the tone afterward",
          "Avoid inside jokes the guests present won't understand",
          "Prepare a printed version in addition to memorizing it, the emotion of the moment can make you lose your place",
          "Read it out loud several times before the day, a written text doesn't always sound the same spoken",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Keep a tissue and a glass of water within reach during the vow exchange: emotion often catches the voice, even for people usually comfortable speaking in public.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For the rest of the ceremony and speeches from loved ones, see our guide [nailing the couple's and witnesses' speeches](/blog/discours-maries-temoins-reussir). To plan a full secular ceremony, see our article on [choosing your officiant](/blog/ceremonie-laique-choisir-officiant).",
        ],
      },
    ],
  }),

  postPair({
    slug: "rituels-ceremonie-laique-idees",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Rituels de cérémonie laïque : sable, rubans, arbre et autres",
    titleEn: "Secular ceremony rituals: sand, ribbons, a tree, and more",
    excerptFr:
      "Cérémonie du sable, du ruban, plantation d'arbre, bougie d'union : un tour d'horizon des rituels les plus utilisés, pour en choisir un ou deux, pas dix.",
    excerptEn:
      "Sand ceremony, handfasting, tree planting, unity candle: a rundown of the most common rituals, to help you pick one or two, not ten.",
    readingMinutes: 7,
    heroAltFr: "Rituel du sable pendant une cérémonie laïque",
    heroAltEn: "Sand ceremony ritual during a secular wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les cérémonies laïques en France construisent souvent leur propre déroulé plutôt que de suivre un rite religieux établi, ce qui peut vite devenir écrasant devant le nombre d'idées de rituels disponibles en ligne.",
        ],
      },
      {
        type: "list",
        title: "Rituels courants et leur symbolique",
        items: [
          "Cérémonie du sable : chacun verse un sable de couleur différente dans un même contenant, symbole de deux vies qui se mêlent sans jamais pouvoir être séparées",
          "Rituel du ruban (ou des mains liées) : les mains des mariés sont liées par un ruban ou une corde, symbole d'engagement, hérité des traditions de handfasting",
          "Plantation d'un arbre : les mariés plantent ou arrosent un jeune arbre ensemble, symbole d'un projet commun qui grandit avec le temps",
          "Bougie d'union : chacun allume une bougie à partir de la flamme de ses parents, puis les deux allument ensemble une troisième bougie commune",
          "Boîte à souvenirs (time capsule) : lettres et objets scellés dans une boîte, à ouvrir ensemble à une date future choisie",
        ],
      },
      {
        type: "text",
        title: "En choisir un ou deux, pas tous",
        paragraphs: [
          "Multiplier les rituels allonge la cérémonie sans forcément renforcer l'émotion, l'effet inverse se produit même souvent : les invités décrochent quand un rituel en remplace un autre sans temps mort.",
          "Choisissez le ou les rituels qui résonnent vraiment avec votre histoire, plutôt que ceux qui semblent les plus photogéniques sur les réseaux. Un seul rituel bien amené marque davantage que trois rituels enchaînés machinalement.",
        ],
      },
      {
        type: "list",
        title: "Points pratiques à anticiper",
        items: [
          "Le matériel nécessaire (sable, contenants, ruban, plant) et qui s'occupe de l'apporter le jour J",
          "La météo si le rituel a lieu en extérieur, notamment pour une bougie ou un plant fragile",
          "Le rôle de l'officiant ou d'un proche pour expliquer brièvement le sens du rituel aux invités qui ne le connaissent pas",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour construire l'ensemble de votre cérémonie, voir notre guide [choisir son officiant de cérémonie laïque](/blog/ceremonie-laique-choisir-officiant). Complétez avec nos conseils pour [écrire ses vœux personnels](/blog/voeux-personnels-mariage-ecrire).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Secular ceremonies in France often build their own structure rather than follow a set religious rite, which can feel overwhelming given the sheer number of ritual ideas online.",
        ],
      },
      {
        type: "list",
        title: "Common rituals and their meaning",
        items: [
          "Sand ceremony: each person pours a different colored sand into the same container, symbolizing two lives blending in a way that can never be separated again",
          "Ribbon (or handfasting) ritual: the couple's hands are tied together with a ribbon or cord, a symbol of commitment inherited from handfasting traditions",
          "Tree planting: the couple plants or waters a young tree together, symbolizing a shared project that grows over time",
          "Unity candle: each person lights a candle from their parents' flame, then both light a third shared candle together",
          "Time capsule: letters and objects sealed in a box, to be opened together on a chosen future date",
        ],
      },
      {
        type: "text",
        title: "Choose one or two, not all of them",
        paragraphs: [
          "Piling on rituals lengthens the ceremony without necessarily deepening the emotion, and often the opposite happens: guests tune out when one ritual replaces another with no breathing room in between.",
          "Choose the ritual or rituals that genuinely resonate with your story, rather than the ones that look best on social media. One ritual done well leaves a bigger mark than three run through mechanically.",
        ],
      },
      {
        type: "list",
        title: "Practical points to plan ahead",
        items: [
          "The materials needed (sand, containers, ribbon, a plant) and who's responsible for bringing them on the day",
          "The weather if the ritual takes place outdoors, especially for a candle or a fragile plant",
          "The officiant's or a family member's role in briefly explaining the ritual's meaning to guests unfamiliar with it",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To build your whole ceremony, see our guide [choosing your secular ceremony officiant](/blog/ceremonie-laique-choisir-officiant). Pair it with our tips on [writing your personal vows](/blog/voeux-personnels-mariage-ecrire).",
        ],
      },
    ],
  }),

  postPair({
    slug: "livret-ceremonie-programme-imprimer",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Livret de cérémonie : guider et occuper les invités",
    titleEn: "Ceremony booklet: guiding and engaging your guests",
    excerptFr:
      "Déroulé, noms du cortège, paroles d'un chant : à quoi sert vraiment un livret de cérémonie, et comment l'assortir au reste de la papeterie.",
    excerptEn:
      "Order of events, wedding party names, song lyrics: what a ceremony booklet actually does, and how to match it to the rest of your stationery.",
    readingMinutes: 5,
    heroAltFr: "Livret de cérémonie de mariage posé sur une chaise",
    heroAltEn: "Wedding ceremony booklet resting on a chair",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un livret imprimé n'a rien d'obligatoire, mais il rend service aux invités peu familiers du format : cérémonie laïque, familles recomposées, invités venus de l'étranger.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'un livret de cérémonie peut contenir",
        items: [
          "Le déroulé complet de la cérémonie, dans l'ordre, pour que les invités suivent sans être perdus",
          "Les noms et rôles du cortège (témoins, demoiselles et garçons d'honneur, officiant)",
          "Les paroles d'un chant ou d'un texte lu à voix haute, pratique si les invités sont invités à chanter ou répondre",
          "Un mot d'introduction des mariés, quelques lignes qui expliquent le choix d'une cérémonie laïque ou un rituel particulier",
        ],
      },
      {
        type: "text",
        title: "Utile surtout pour une cérémonie non codifiée",
        paragraphs: [
          "Une cérémonie religieuse suit un déroulé connu de la plupart des invités pratiquants, le livret y a alors un rôle plus secondaire. Une cérémonie laïque, en revanche, invente souvent son propre déroulé : le livret devient un vrai repère pour des invités qui ne savent pas à quoi s'attendre.",
          "Il aide aussi les invités venus de loin ou peu familiers des usages français à suivre la cérémonie sans se sentir perdus.",
        ],
      },
      {
        type: "list",
        title: "Rester cohérent avec la papeterie",
        items: [
          "Reprendre les mêmes couleurs et la même typographie que le faire-part et le plan de table",
          "Garder un format simple, un livret trop chargé se lit mal en pleine cérémonie",
          "Prévoir un nombre suffisant d'exemplaires, un par couple ou par famille suffit généralement, pas un par invité",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour l'ensemble de votre papeterie, voir notre guide [papeterie mariage et faire-part](/blog/papeterie-mariage-faire-part-design). Pour construire le contenu du livret, inspirez-vous de nos idées de [rituels de cérémonie laïque](/blog/rituels-ceremonie-laique-idees).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A printed booklet isn't mandatory, but it's useful for guests unfamiliar with the format, a secular ceremony, blended families, or guests from abroad.",
        ],
      },
      {
        type: "list",
        title: "What a ceremony booklet can include",
        items: [
          "The full order of the ceremony, so guests can follow along without getting lost",
          "The names and roles of the wedding party (witnesses, bridesmaids and groomsmen, officiant)",
          "The lyrics of a song or a text read aloud, useful if guests are asked to sing or respond",
          "A short note from the couple explaining a secular ceremony's format or a particular ritual",
        ],
      },
      {
        type: "text",
        title: "Most useful for a ceremony with no set structure",
        paragraphs: [
          "A religious ceremony follows an order familiar to most practicing guests, so the booklet plays a smaller role there. A secular ceremony, on the other hand, often invents its own structure: the booklet becomes a real anchor for guests who don't know what to expect.",
          "It also helps guests who've traveled far or aren't familiar with French customs follow along without feeling lost.",
        ],
      },
      {
        type: "list",
        title: "Staying consistent with the rest of your stationery",
        items: [
          "Reuse the same colors and typeface as your invitation and seating chart",
          "Keep the format simple, an overly busy booklet is hard to read mid-ceremony",
          "Print enough copies, one per couple or family is usually enough, not one per guest",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For the rest of your stationery, see our guide [wedding stationery and invitation design](/blog/papeterie-mariage-faire-part-design). For booklet content ideas, draw from our list of [secular ceremony rituals](/blog/rituels-ceremonie-laique-idees).",
        ],
      },
    ],
  }),

  postPair({
    slug: "cagnotte-liste-urne-mariage-choisir",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Cagnotte, liste ou urne : quel dispositif de cadeaux",
    titleEn: "Cash fund, registry, or envelope box: which gift setup to choose",
    excerptFr:
      "Trois façons de recevoir des cadeaux de mariage, chacune avec ses codes : comment choisir sans donner l'impression de réclamer de l'argent.",
    excerptEn:
      "Three ways to receive wedding gifts, each with its own etiquette: how to choose without seeming to ask for money outright.",
    readingMinutes: 6,
    heroAltFr: "Urne à enveloppes pour cadeaux de mariage",
    heroAltEn: "Envelope box for wedding gifts",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La question des cadeaux se pose tôt dans les préparatifs. Trois dispositifs courants existent en France, et aucun n'est meilleur qu'un autre dans l'absolu.",
        ],
      },
      {
        type: "list",
        title: "Les trois dispositifs les plus courants",
        items: [
          "La cagnotte en ligne, adaptée quand les mariés ont un projet concret à financer (voyage de noces, achat immobilier, aménagement)",
          "La liste de mariage traditionnelle, chez une enseigne ou en ligne, pour des couples qui s'installent et ont des besoins matériels précis",
          "L'urne le jour du mariage, format le plus souple, qui laisse chaque invité libre du montant et de la forme (enveloppe, chèque)",
        ],
      },
      {
        type: "text",
        title: "La cagnotte fonctionne mieux avec un projet précis",
        paragraphs: [
          "Une cagnotte formulée simplement en « aidez-nous à financer notre mariage » reste vague et peut mal passer auprès de certains invités. Une cagnotte présentée autour d'un projet concret et raconté (le voyage de noces au Japon, la lune de miel en van) est mieux reçue, car elle donne du sens au don plutôt qu'une demande d'argent brute.",
          "Préciser un montant indicatif suggéré, sans jamais le rendre obligatoire, aide aussi les invités hésitants sur la somme à donner.",
        ],
      },
      {
        type: "list",
        title: "Communiquer le choix sans maladresse",
        items: [
          "Mentionner le dispositif sur le site de mariage ou la page publique plutôt que sur le faire-part lui-même, jugé plus discret",
          "Une phrase simple suffit : « Votre présence est le plus beau des cadeaux, si vous souhaitez néanmoins participer... »",
          "Laisser toujours une option cadeau matériel en complément pour les proches qui préfèrent offrir un objet",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour les repères de montant à donner en tant qu'invité, voir notre article [combien donner à un mariage](/blog/combien-donner-mariage-invite). Pour construire une liste de cadeaux traditionnelle, notre [guide complet](/blog/liste-cadeaux-mariage-guide).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The gift question comes up early. Three common French formats exist, and there's no single right answer.",
        ],
      },
      {
        type: "list",
        title: "The three most common setups",
        items: [
          "An online cash fund, suited to couples with a specific project to fund (honeymoon, a home purchase, renovations)",
          "A traditional gift registry, at a store or online, for a couple settling in who has specific material needs",
          "An envelope box on the wedding day, the most flexible format, leaving each guest free to choose the amount and form (envelope, cheque)",
        ],
      },
      {
        type: "text",
        title: "A cash fund works better with a specific project",
        paragraphs: [
          "A cash fund phrased simply as 'help us fund our wedding' stays vague and can land poorly with some guests. A cash fund framed around a specific, well-told project (the honeymoon trip to Japan, a van-life honeymoon) is better received, since it gives the gift meaning rather than reading as a blunt ask for money.",
          "Suggesting an indicative amount, without ever making it mandatory, also helps guests who are unsure what to give.",
        ],
      },
      {
        type: "list",
        title: "Communicating the choice tactfully",
        items: [
          "Mention the setup on the wedding website or public page rather than on the invitation itself, seen as more discreet",
          "A simple line is enough: 'Your presence is the best gift of all, but if you'd still like to contribute...'",
          "Always keep a physical gift option alongside it for loved ones who prefer giving an object",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For benchmarks on how much to give as a guest, see our article [how much to give at a wedding](/blog/combien-donner-mariage-invite). To build a traditional gift registry, see our [complete guide](/blog/liste-cadeaux-mariage-guide).",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-donner-mariage-invite",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Combien donner à un mariage : repères par lien et région",
    titleEn: "How much to give at a wedding: benchmarks by relationship and region",
    excerptFr:
      "80 à 150€ en moyenne, plus pour un témoin, moins pour un cocktail seul : des repères concrets pour ne plus hésiter devant l'enveloppe.",
    excerptEn:
      "80 to 150 euros on average, more for a witness, less for a cocktail-only invite: concrete benchmarks so you stop agonizing over the envelope.",
    readingMinutes: 6,
    heroAltFr: "Enveloppe cadeau pour un mariage",
    heroAltEn: "Gift envelope for a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Question récurrente sans règle officielle, mais des usages réels existent bel et bien en France, selon le lien avec les mariés, la région, et le type d'invitation.",
        ],
      },
      {
        type: "list",
        title: "Repères moyens selon le lien avec les mariés",
        items: [
          "Invité classique (collègue, ami éloigné, cousin) : environ 80 à 150€",
          "Ami proche ou famille proche : environ 100 à 200€",
          "Témoin ou membre du cortège : souvent 150 à 300€ ou plus, en plus du budget déjà engagé pour la tenue et les préparatifs",
          "Invité au cocktail uniquement, sans repas assis : environ 20 à 60€, un montant nettement plus bas et tout à fait normal",
        ],
      },
      {
        type: "text",
        title: "Des écarts régionaux réels",
        paragraphs: [
          "Les montants observés en Île-de-France et dans les grandes villes tendent à être plus élevés que dans certaines régions rurales, où les usages restent parfois plus modestes. Ces écarts reflètent surtout le coût de la vie local, pas une règle stricte à suivre.",
          "Le montant du cadeau n'a pas non plus à couvrir le coût du repas facturé par tête aux mariés, une idée reçue répandue mais qui ne correspond à aucune règle d'usage réelle en France.",
        ],
      },
      {
        type: "list",
        title: "Ajuster selon votre propre situation",
        items: [
          "Un couple qui donne ensemble donne généralement un montant commun plutôt que deux dons séparés",
          "Un cadeau offert en plus d'un temps ou d'un service rendu (photographie, aide logistique) peut légitimement être réduit",
          "Une situation financière contrainte justifie pleinement un don plus modeste, la présence compte toujours plus que le montant",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ces chiffres restent des repères, pas des règles gravées dans le marbre. Un cadeau donné avec sincérité, quel que soit le montant, n'a jamais été mal reçu par des mariés bienveillants.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour comprendre les différents dispositifs de cadeaux (cagnotte, liste, urne) côté organisateurs, voir notre guide [cagnotte, liste ou urne](/blog/cagnotte-liste-urne-mariage-choisir).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A recurring question with no official rule, but real patterns exist in France depending on your relationship to the couple, the region, and the type of invite.",
        ],
      },
      {
        type: "list",
        title: "Average benchmarks by relationship to the couple",
        items: [
          "A typical guest (colleague, distant friend, cousin): around 80 to 150 euros",
          "A close friend or close family: around 100 to 200 euros",
          "A witness or a member of the wedding party: often 150 to 300 euros or more, on top of the budget already spent on their outfit and prep",
          "A guest invited to the cocktail hour only, with no seated meal: around 20 to 60 euros, a noticeably lower amount and entirely normal",
        ],
      },
      {
        type: "text",
        title: "Real regional differences",
        paragraphs: [
          "Amounts observed in Île-de-France and major cities tend to run higher than in some rural regions, where customs stay more modest. These gaps mostly reflect local cost of living, not a strict rule to follow.",
          "The gift amount also doesn't have to cover the per-head cost of the meal charged to the couple, a common misconception that doesn't match any real custom in France.",
        ],
      },
      {
        type: "list",
        title: "Adjusting for your own situation",
        items: [
          "A couple giving together usually gives one shared amount rather than two separate gifts",
          "A gift given alongside time or a service already provided (photography, logistical help) can reasonably be scaled down",
          "A tight financial situation fully justifies a more modest gift, presence always matters more than the amount",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "These figures stay benchmarks, not rules set in stone. A gift given sincerely, whatever the amount, has never been poorly received by a kind couple.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To understand the different gift setups (cash fund, registry, envelope box) from the organizing side, see our guide [cash fund, registry, or envelope box](/blog/cagnotte-liste-urne-mariage-choisir).",
        ],
      },
    ],
  }),

  postPair({
    slug: "dragees-cadeaux-invites-mariage",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Dragées et cadeaux d'invités : tradition et alternatives",
    titleEn: "Sugared almonds and wedding favors: tradition and alternatives",
    excerptFr:
      "Cinq dragées, un sachet en tulle, une signification précise : la tradition française, et comment la remplacer sans donner l'impression de faire l'impasse.",
    excerptEn:
      "Five almonds, a tulle pouch, a precise meaning: the French tradition, and how to swap it out without feeling like you skipped a step.",
    readingMinutes: 6,
    heroAltFr: "Dragées de mariage dans un sachet en tulle",
    heroAltEn: "Wedding sugared almonds in a tulle pouch",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les dragées sont une tradition profondément ancrée dans les mariages français, souvent offertes sans que personne sache vraiment pourquoi cinq précisément, ni ce qu'elles symbolisent.",
        ],
      },
      {
        type: "list",
        title: "La tradition et sa signification",
        items: [
          "Cinq dragées par invité, chacune représentant un vœu : santé, bonheur, prospérité, fertilité, longévité",
          "L'amande enrobée de sucre dur symbolise la douceur de la vie de couple, protégée par la dureté qu'elle doit traverser",
          "Servies dans un sachet en tulle ou en organza, souvent assorti à la couleur du mariage",
          "Coutume ancienne, toujours largement présente dans les mariages français malgré la multiplication des alternatives",
        ],
      },
      {
        type: "text",
        title: "Pourquoi certains couples cherchent une alternative",
        paragraphs: [
          "Les dragées ne plaisent pas à tous les palais, et une partie repart souvent non consommée ou jetée après le mariage. Certains couples préfèrent aussi un cadeau qui reflète davantage leur histoire ou leurs origines plutôt qu'une tradition suivie par habitude.",
          "Le coût, généralement modeste par invité, n'est en général pas la raison principale du changement, c'est davantage une question de sens ou de goût personnel.",
        ],
      },
      {
        type: "list",
        title: "Alternatives qui gardent l'esprit du geste",
        items: [
          "Un produit local ou artisanal (miel, confiture, biscuits) lié à la région du mariage",
          "Un petit contenant réellement utile après coup (bougie, savon, mini-plante), plutôt qu'un objet jetable",
          "Une attention comestible mais différente des dragées classiques, chocolat fin ou calisson selon la région",
          "Un don symbolique à une association, mentionné sur une petite carte à la place d'un objet physique",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Évitez le cadeau perçu comme cheap ou impersonnel simplement pour cocher la case : un geste modeste mais choisi avec soin vaut mieux qu'un objet générique acheté en dernière minute en grande quantité.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour les autres façons de remercier vos invités après le mariage, voir notre article [remerciements après le mariage](/blog/remerciements-apres-mariage). Si vous hésitez sur le montant à donner en tant qu'invité, notre guide [combien donner à un mariage](/blog/combien-donner-mariage-invite) donne des repères concrets.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Dragées are a deeply rooted French wedding custom, often given without anyone quite knowing why exactly five, or what they symbolize.",
        ],
      },
      {
        type: "list",
        title: "The tradition and its meaning",
        items: [
          "Five sugared almonds per guest, each representing a wish: health, happiness, prosperity, fertility, longevity",
          "The almond coated in hard sugar symbolizes the sweetness of married life, protected by the hardness it must withstand",
          "Served in a tulle or organza pouch, often matched to the wedding's color",
          "An old custom, still widely present at French weddings despite a growing number of alternatives",
        ],
      },
      {
        type: "text",
        title: "Why some couples look for an alternative",
        paragraphs: [
          "Dragées don't suit every palate, and a good share often go home uneaten or get thrown out after the wedding. Some couples also prefer a favor that better reflects their own story or background rather than a tradition followed out of habit.",
          "Cost, generally modest per guest, isn't usually the main reason for switching, it's more a matter of meaning or personal taste.",
        ],
      },
      {
        type: "list",
        title: "Alternatives that keep the spirit of the gesture",
        items: [
          "A local or artisanal product (honey, jam, cookies) tied to the wedding's region",
          "A small container that's genuinely useful afterward (a candle, soap, a mini plant), rather than a disposable object",
          "An edible favor different from classic dragées, fine chocolate or calisson depending on the region",
          "A symbolic donation to a charity, noted on a small card in place of a physical object",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Avoid a favor that reads as cheap or impersonal just to check a box: a modest gesture chosen with care beats a generic object bought in bulk at the last minute.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For other ways to thank your guests after the wedding, see our article [thank-yous after the wedding](/blog/remerciements-apres-mariage). If you're unsure how much to give as a guest, our guide [how much to give at a wedding](/blog/combien-donner-mariage-invite) offers concrete benchmarks.",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_165_184_FR, en: POSTS_165_184_EN } = pairsToArrays(pairs);
