import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "demande-en-mariage-idees-organiser",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Demande en mariage : idées et organisation d'un moment inoubliable",
    titleEn: "Marriage proposal: ideas and planning an unforgettable moment",
    excerptFr:
      "Restaurant, lieu insolite, voyage, chasse au trésor : des idées de demande en mariage concrètes, avec la logistique et le budget qui vont avec.",
    excerptEn:
      "Restaurant, scenic spot, trip, treasure hunt: concrete proposal ideas, with the logistics and budget that go with them.",
    readingMinutes: 6,
    heroAltFr: "Demande en mariage romantique en extérieur",
    heroAltEn: "Romantic outdoor marriage proposal",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Une bonne demande en mariage n'est pas forcément la plus spectaculaire, c'est celle qui ressemble au couple. Avant de chercher l'idée parfaite, demandez-vous ce que l'autre personne préfère réellement : l'intimité ou un moment partagé avec les proches.",
        ],
      },
      {
        type: "list",
        title: "Des idées selon le style du couple",
        items: [
          "Un dîner dans un restaurant qui compte pour vous deux, discret et sans mise en scène excessive",
          "Un lieu avec une vue marquante (point de vue, plage au lever du soleil, sommet après une randonnée)",
          "Une demande pendant un voyage, sur un lieu symbolique de votre histoire commune",
          "Une chasse au trésor avec des indices liés à des souvenirs précis du couple",
          "Une demande simple à la maison, un soir ordinaire transformé en moment marquant",
        ],
      },
      {
        type: "text",
        title: "Organiser la logistique sans tout gâcher",
        paragraphs: [
          "Le principal risque n'est pas le manque d'idée mais l'excès de complexité : trop de personnes impliquées, trop de contraintes d'horaire, trop de choses qui peuvent mal tourner. Gardez le plan aussi simple que possible pour l'exécuter sereinement.",
          "Si des proches sont impliqués (pour une surprise ensuite, un dîner qui suit), prévenez-les au dernier moment possible pour limiter le risque que le secret s'ébruite.",
        ],
      },
      {
        type: "list",
        title: "Faut-il un photographe pour immortaliser l'instant",
        items: [
          "Un photographe caché à distance capture une réaction spontanée, sans que la personne se doute de rien",
          "Un ami discret avec un bon appareil photo reste une option moins coûteuse pour un rendu correct",
          "Certains couples préfèrent ne rien photographier et garder le moment pour eux seuls, ce qui est tout aussi valable",
        ],
      },
      {
        type: "text",
        title: "Budget d'une demande en mariage",
        paragraphs: [
          "Une demande réussie ne dépend pas du budget engagé. Un dîner simple ou un moment à la maison ne coûte presque rien, tandis qu'un lieu insolite loué ou un photographe professionnel peut représenter plusieurs centaines d'euros. Fixez un montant à l'avance pour ne pas vous laisser emporter par l'envie de « faire mieux ».",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Gardez toujours un plan B en tête, surtout pour une demande en extérieur : météo, lieu fermé, imprévu de dernière minute. Une alternative simple évite que tout le projet tombe à l'eau.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Une fois la bague au doigt, direction les premières étapes concrètes avec notre guide [premiers pas pour organiser son mariage](/blog/premieres-etapes-organiser-mariage), et pour donner un ordre de grandeur au budget global, testez le [calculateur de budget](/tools/budget-calculator).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A good marriage proposal doesn't have to be the most spectacular one, it has to feel like the couple. Before chasing the perfect idea, think about what the other person actually prefers: intimacy or a moment shared with loved ones.",
        ],
      },
      {
        type: "list",
        title: "Ideas based on the couple's style",
        items: [
          "A dinner at a restaurant that matters to both of you, low-key and without excessive staging",
          "A spot with a striking view (a lookout point, a beach at sunrise, a summit after a hike)",
          "A proposal during a trip, at a place symbolic of your shared story",
          "A treasure hunt with clues tied to specific memories from the relationship",
          "A simple proposal at home, turning an ordinary evening into a memorable one",
        ],
      },
      {
        type: "text",
        title: "Organizing the logistics without ruining it",
        paragraphs: [
          "The main risk isn't a lack of ideas but too much complexity: too many people involved, too many timing constraints, too many things that can go wrong. Keep the plan as simple as possible so you can pull it off calmly.",
          "If loved ones are involved (for a surprise dinner afterward, for example), tell them at the last possible moment to limit the risk of the secret getting out.",
        ],
      },
      {
        type: "list",
        title: "Should you hire a photographer to capture the moment",
        items: [
          "A photographer hidden at a distance captures a spontaneous reaction, with no one suspecting a thing",
          "A discreet friend with a decent camera is a cheaper option for a correct result",
          "Some couples prefer to photograph nothing and keep the moment to themselves, which is just as valid",
        ],
      },
      {
        type: "text",
        title: "Budget for a proposal",
        paragraphs: [
          "A successful proposal doesn't depend on the money spent. A simple dinner or a moment at home costs almost nothing, while a rented unusual venue or a professional photographer can run several hundred euros. Set an amount ahead of time so you don't get carried away trying to \"do better\".",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always keep a backup plan in mind, especially for an outdoor proposal: weather, a closed venue, a last-minute hiccup. A simple alternative keeps the whole plan from falling apart.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Once the ring is on, head to the concrete first steps with our guide on [getting started planning your wedding](/blog/premieres-etapes-organiser-mariage), and to get a sense of your overall budget, try the [budget calculator](/tools/budget-calculator).",
        ],
      },
    ],
  }),

  postPair({
    slug: "bague-fiancailles-choisir-guide",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Bague de fiançailles : 4C, taille, budget, comment choisir",
    titleEn: "Engagement ring: the 4 C's, sizing, budget, how to choose",
    excerptFr:
      "Taille, couleur, pureté, carat : comprendre les 4C, trouver la bonne taille de bague discrètement, et fixer un budget réaliste.",
    excerptEn:
      "Cut, color, clarity, carat: understand the 4 C's, find the right ring size discreetly, and set a realistic budget.",
    readingMinutes: 7,
    heroAltFr: "Bague de fiançailles avec diamant",
    heroAltEn: "Engagement ring with diamond",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Choisir une bague de fiançailles peut vite devenir intimidant face au vocabulaire technique des bijoutiers. Quatre critères suffisent pourtant à comprendre l'essentiel d'un diamant, et à ne pas se faire surprendre sur le prix.",
        ],
      },
      {
        type: "list",
        title: "Les 4C, expliqués simplement",
        items: [
          "Cut (taille) : la qualité de la coupe, celle qui détermine le plus l'éclat visuel de la pierre, souvent le critère le plus important à privilégier",
          "Color (couleur) : l'absence de teinte, notée de D (incolore) à Z (jaune visible), l'œil non averti distingue peu au-delà de quelques lettres d'écart",
          "Clarity (pureté) : les inclusions internes, invisibles à l'œil nu jusqu'à un certain niveau, donc pas toujours utile de payer pour la pureté maximale",
          "Carat (poids) : le poids de la pierre, ce qui influence le prix de façon disproportionnée passé certains seuils (1 carat, 2 carats)",
        ],
      },
      {
        type: "text",
        title: "Trouver la taille de bague sans se faire remarquer",
        paragraphs: [
          "Emprunter discrètement une bague déjà portée au bon doigt, la faire mesurer chez un bijoutier ou avec un anneau de mesure, reste la méthode la plus fiable. Un proche complice peut aussi glisser la question en conversation.",
          "En cas de doute, viser légèrement plus grand qu'un ajustement parfait : un redimensionnement à la hausse est plus simple qu'à la baisse chez la plupart des bijoutiers.",
        ],
      },
      {
        type: "list",
        title: "Budget réaliste",
        items: [
          "Il n'existe aucune règle obligatoire du type « deux mois de salaire », c'est un argument marketing plus qu'une norme",
          "Une pierre de synthèse (diamant de laboratoire) offre les mêmes propriétés physiques à prix nettement inférieur",
          "Une pierre alternative (saphir, morganite) réduit fortement le budget tout en gardant un rendu élégant",
          "L'ancienneté d'un bijou vintage ou de seconde main peut aussi représenter une économie significative",
        ],
      },
      {
        type: "text",
        title: "Acheter en ligne ou chez un bijoutier",
        paragraphs: [
          "L'achat en ligne permet souvent de meilleurs prix et un choix de pierres certifiées plus large, avec des politiques de retour généralement claires. Le bijoutier physique offre l'avantage de voir et essayer la pierre avant achat, et un service après-vente de proximité.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Faites toujours assurer une bague de valeur, séparément de l'assurance habitation si le montant dépasse le plafond bijoux de votre contrat. Un certificat de gemmologie facilite grandement la démarche en cas de perte ou de vol.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "La bague est souvent la première ligne du budget mariage, même si elle est engagée avant le reste des préparatifs. Suivez-la dès le départ dans votre [calculateur de budget](/tools/budget-calculator) pour garder une vue d'ensemble cohérente sur toute la planification.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Choosing an engagement ring can feel intimidating given jewelers' technical vocabulary. Four criteria are enough to understand the essentials of a diamond, and to avoid surprises on price.",
        ],
      },
      {
        type: "list",
        title: "The 4 C's, explained simply",
        items: [
          "Cut: the quality of the cut, which most determines the stone's visual sparkle, often the criterion worth prioritizing most",
          "Color: the absence of tint, graded from D (colorless) to Z (visibly yellow), an untrained eye rarely tells apart more than a few grades",
          "Clarity: internal inclusions, invisible to the naked eye up to a certain level, so it's not always worth paying for maximum clarity",
          "Carat: the stone's weight, which affects price disproportionately past certain thresholds (1 carat, 2 carats)",
        ],
      },
      {
        type: "text",
        title: "Finding the ring size without being noticed",
        paragraphs: [
          "Discreetly borrowing a ring already worn on the right finger, having it measured at a jeweler or with a sizing ring, remains the most reliable method. A trusted friend can also slip the question into conversation.",
          "If in doubt, aim slightly larger than a perfect fit: most jewelers find it easier to resize a ring down than up.",
        ],
      },
      {
        type: "list",
        title: "Realistic budget",
        items: [
          "There's no mandatory rule like \"two months' salary\", that's a marketing line more than a standard",
          "A lab-grown diamond offers the same physical properties at a noticeably lower price",
          "An alternative stone (sapphire, morganite) cuts the budget significantly while still looking elegant",
          "A vintage or secondhand piece can also represent significant savings",
        ],
      },
      {
        type: "text",
        title: "Buying online or at a jeweler",
        paragraphs: [
          "Buying online often means better prices and a wider choice of certified stones, with generally clear return policies. A physical jeweler offers the advantage of seeing and trying the stone before buying, plus local after-sales service.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always insure a valuable ring, separately from home insurance if the amount exceeds your policy's jewelry cap. A gemological certificate makes the process much easier in case of loss or theft.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The ring is often the first line of the wedding budget, even though it's bought before the rest of the planning starts. Track it from day one in your [budget calculator](/tools/budget-calculator) to keep a consistent overview across the whole plan.",
        ],
      },
    ],
  }),

  postPair({
    slug: "fiancailles-organiser-fete",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Organiser ses fiançailles : faut-il une fête, quand, comment",
    titleEn: "Planning your engagement: do you need a party, when, and how",
    excerptFr:
      "Fête de fiançailles ou pas, quand la placer par rapport au mariage, qui inviter : les questions à trancher sans se mettre de pression inutile.",
    excerptEn:
      "Engagement party or not, when to hold it relative to the wedding, who to invite: the questions to settle without unnecessary pressure.",
    readingMinutes: 5,
    heroAltFr: "Fête de fiançailles entre proches",
    heroAltEn: "Engagement party with close friends",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La fête de fiançailles n'a rien d'obligatoire en France, contrairement à d'autres pays où elle est presque un passage attendu. Beaucoup de couples français passent directement de la demande à l'organisation du mariage, sans étape intermédiaire, et c'est tout aussi valable.",
        ],
      },
      {
        type: "list",
        title: "Les bonnes raisons de faire une fête de fiançailles",
        items: [
          "Réunir les deux familles une première fois avant le mariage, dans un cadre plus léger",
          "Marquer l'événement pour les proches qui ne seront pas forcément tous invités au mariage",
          "Se donner un moment de célébration sans la pression logistique d'un mariage complet",
        ],
      },
      {
        type: "text",
        title: "Quand la placer par rapport au mariage",
        paragraphs: [
          "L'usage veut qu'elle ait lieu plusieurs mois avant le mariage, jamais dans les dernières semaines qui précèdent, pour ne pas se superposer avec l'organisation finale. Si les fiançailles sont longues (un an ou plus), la fête intervient souvent dans les premiers mois après la demande.",
        ],
      },
      {
        type: "list",
        title: "Qui inviter",
        items: [
          "La liste peut être plus large ou plus restreinte que celle du mariage, sans obligation de cohérence entre les deux",
          "Certains couples y invitent des amis ou collègues qui ne feront pas partie de la liste resserrée du mariage",
          "D'autres préfèrent une fête intime, réservée aux témoins et à la famille proche",
        ],
      },
      {
        type: "text",
        title: "Garder ça simple",
        paragraphs: [
          "Un apéritif dînatoire chez soi ou dans un restaurant réservé pour l'occasion suffit largement. Il n'y a aucune raison de reproduire l'ampleur d'un mariage pour une fête de fiançailles, le seul objectif est de marquer l'étape.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Que vous fassiez une fête ou non, la vraie organisation démarre avec le mariage lui-même. Notre guide des [premières étapes pour organiser son mariage](/blog/premieres-etapes-organiser-mariage) vous aide à poser les bases une fois les fiançailles annoncées.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "An engagement party isn't customary in France, unlike some other countries where it's almost an expected step. Many French couples go straight from the proposal to planning the wedding, with no in-between step, and that's just as valid.",
        ],
      },
      {
        type: "list",
        title: "Good reasons to throw an engagement party",
        items: [
          "Bringing both families together for the first time before the wedding, in a lighter setting",
          "Marking the moment for loved ones who won't necessarily all be invited to the wedding",
          "Giving yourselves a moment to celebrate without the logistical pressure of a full wedding",
        ],
      },
      {
        type: "text",
        title: "When to hold it relative to the wedding",
        paragraphs: [
          "Convention places it several months before the wedding, never in the final weeks leading up to it, so it doesn't overlap with the final planning push. If the engagement is long (a year or more), the party often happens in the first months after the proposal.",
        ],
      },
      {
        type: "list",
        title: "Who to invite",
        items: [
          "The guest list can be broader or smaller than the wedding's, with no obligation for the two to match",
          "Some couples invite friends or coworkers who won't be on the tighter wedding list",
          "Others prefer an intimate gathering, limited to witnesses and close family",
        ],
      },
      {
        type: "text",
        title: "Keeping it simple",
        paragraphs: [
          "A cocktail dinner at home or a restaurant booked for the occasion is plenty. There's no reason to match the scale of a wedding for an engagement party, the only goal is to mark the step.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Whether or not you throw a party, the real planning starts with the wedding itself. Our guide on [getting started planning your wedding](/blog/premieres-etapes-organiser-mariage) helps you lay the groundwork once the engagement is announced.",
        ],
      },
    ],
  }),

  postPair({
    slug: "annoncer-mariage-proches-famille",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Annoncer son mariage aux proches : ordre, ton, faux pas",
    titleEn: "Announcing your engagement to loved ones: order, tone, missteps",
    excerptFr:
      "Qui prévenir en premier, en personne ou par message, comment éviter que certains se sentent oubliés : l'art d'annoncer son mariage sans faux pas.",
    excerptEn:
      "Who to tell first, in person or by message, how to avoid anyone feeling left out: the art of announcing your engagement without a misstep.",
    readingMinutes: 5,
    heroAltFr: "Annonce de mariage à la famille",
    heroAltEn: "Announcing the engagement to family",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "L'annonce des fiançailles laisse souvent une trace durable, surtout pour les personnes qui apprennent la nouvelle en dernier ou par une source détournée. Un peu d'ordre dans les annonces évite des tensions qui n'ont pas lieu d'être.",
        ],
      },
      {
        type: "list",
        title: "Qui prévenir en premier",
        items: [
          "Les parents des deux côtés, en général avant tout autre annonce, en personne ou par appel si la distance l'impose",
          "Les enfants, si le couple en a déjà, en fonction de leur âge et de leur compréhension de la situation",
          "Les témoins pressentis, souvent informés tôt puisqu'ils seront impliqués dans l'organisation",
          "La fratrie proche, avant le cercle élargi d'amis et de collègues",
        ],
      },
      {
        type: "text",
        title: "En personne, par appel, ou par message",
        paragraphs: [
          "Pour les proches les plus proches, privilégier l'annonce en personne ou par appel reste la marque de respect la plus sûre. Un message écrit peut convenir pour un cercle plus large, mais jamais pour les parents ou les témoins si un autre moyen est possible.",
        ],
      },
      {
        type: "list",
        title: "Éviter que certains se sentent oubliés",
        items: [
          "Prévoir un temps resserré entre les annonces individuelles importantes avant toute publication sur les réseaux sociaux",
          "Ne pas annoncer publiquement avant d'avoir prévenu les parents, un classique qui blesse souvent sans le vouloir",
          "Penser aux amis proches qui ne sont pas sur les réseaux sociaux ou qui les consultent peu",
          "Anticiper les situations familiales délicates (parents séparés, tensions) en réfléchissant à l'ordre le plus juste",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Si la famille est nombreuse ou dispersée, un message groupé envoyé au même moment à tout le cercle proche, juste après les annonces individuelles aux parents, limite le risque que l'info circule dans le désordre.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Une fois l'annonce faite, direction la liste d'invités et les premières décisions de planification avec notre guide [premiers pas pour organiser son mariage](/blog/premieres-etapes-organiser-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Announcing an engagement often leaves a lasting impression, especially for people who hear the news last or through the grapevine. A bit of order in how you announce it avoids tension that doesn't need to happen.",
        ],
      },
      {
        type: "list",
        title: "Who to tell first",
        items: [
          "Both sets of parents, generally before any other announcement, in person or by call if distance requires it",
          "Children, if the couple already has any, depending on their age and understanding of the situation",
          "Likely witnesses, often told early since they'll be involved in the planning",
          "Close siblings, before the wider circle of friends and coworkers",
        ],
      },
      {
        type: "text",
        title: "In person, by call, or by message",
        paragraphs: [
          "For the closest relationships, announcing in person or by call remains the surest sign of respect. A written message can work for a wider circle, but never for parents or witnesses if another way is possible.",
        ],
      },
      {
        type: "list",
        title: "Avoiding anyone feeling like an afterthought",
        items: [
          "Keep a tight window between the important individual announcements and any social media post",
          "Don't announce publicly before telling parents, a classic misstep that often hurts unintentionally",
          "Think of close friends who aren't on social media or rarely check it",
          "Anticipate tricky family situations (separated parents, tension) by thinking through the fairest order",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "If family is large or spread out, a group message sent at the same time to the whole close circle, right after the individual announcements to parents, limits the risk of the news spreading out of order.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Once the announcement is made, move on to the guest list and the first planning decisions with our guide on [getting started planning your wedding](/blog/premieres-etapes-organiser-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "pacs-ou-mariage-choisir",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "PACS ou mariage : différences juridiques et comment choisir",
    titleEn: "Civil union or marriage: legal differences and how to choose",
    excerptFr:
      "Fiscalité, succession, dissolution : les différences juridiques concrètes entre PACS et mariage, pour choisir en connaissance de cause.",
    excerptEn:
      "Taxation, inheritance, dissolution: the concrete legal differences between a French civil union and marriage, to choose with full understanding.",
    readingMinutes: 7,
    heroAltFr: "Comparaison PACS et mariage",
    heroAltEn: "Comparing civil union and marriage",
    disclaimer: true,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "PACS et mariage sont souvent comparés comme deux versions d'une même chose, alors que les différences juridiques sont réelles et parfois structurantes selon la situation du couple. Voici les grandes lignes pour comprendre ce qui change concrètement.",
        ],
      },
      {
        type: "list",
        title: "Formalités et lieu",
        items: [
          "Le PACS se conclut en mairie ou chez un notaire, avec une convention signée par les deux partenaires",
          "Le mariage nécessite une cérémonie civile en mairie, avec officier d'état civil, témoins et publication préalable des bans",
          "Le PACS est plus rapide à mettre en place, sans délai de publication équivalent aux bans du mariage",
        ],
      },
      {
        type: "list",
        title: "Régime patrimonial et fiscalité",
        items: [
          "Le mariage propose plusieurs régimes matrimoniaux possibles (communauté, séparation de biens), le PACS repose par défaut sur la séparation de patrimoines sauf option contraire dans la convention",
          "Les deux régimes permettent l'imposition commune, avec une déclaration de revenus commune dès l'année de conclusion",
          "Le mariage ouvre des droits automatiques plus larges en matière de pension de réversion, que le PACS ne prévoit pas",
        ],
      },
      {
        type: "list",
        title: "Succession",
        items: [
          "Le conjoint marié est héritier légal automatique en l'absence de testament, avec des droits protégés",
          "Le partenaire de PACS n'est pas héritier légal automatique, un testament est nécessaire pour lui transmettre un patrimoine",
          "Les droits de succession entre partenaires pacsés bénéficient toutefois d'une exonération comparable à celle des époux, à condition qu'un testament existe",
        ],
      },
      {
        type: "list",
        title: "Dissolution",
        items: [
          "Le PACS se dissout par simple déclaration conjointe ou unilatérale, une démarche rapide et peu formelle",
          "Le divorce suit une procédure judiciaire, plus longue, avec des conséquences patrimoniales et parfois une pension à négocier",
          "Cette différence de simplicité pèse souvent dans le choix de certains couples, notamment en début de vie commune",
        ],
      },
      {
        type: "text",
        title: "Comment trancher",
        paragraphs: [
          "Le PACS convient à des couples qui veulent un cadre juridique simple, sans les implications lourdes du mariage sur la succession ou le divorce. Le mariage reste préférable pour une protection patrimoniale maximale, une reconnaissance sociale et familiale plus large, ou un projet d'adoption conjointe qui reste plus simple dans ce cadre.",
          "Rien n'empêche de commencer par un PACS puis de se marier plus tard : les deux ne s'excluent pas dans le temps.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Si vous optez pour le mariage, notre guide sur les [régimes matrimoniaux](/blog/contrat-mariage-regimes-matrimoniaux) détaille les options de contrat de mariage à envisager avec un notaire.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A civil union (PACS) and marriage are often compared as two versions of the same thing, when the legal differences are real and sometimes significant depending on the couple's situation. Here are the broad strokes of what actually changes.",
        ],
      },
      {
        type: "list",
        title: "Formalities and location",
        items: [
          "A civil union is registered at the town hall or with a notary, with an agreement signed by both partners",
          "Marriage requires a civil ceremony at the town hall, with a registrar, witnesses, and prior publication of banns",
          "A civil union is faster to set up, with no waiting period equivalent to marriage banns",
        ],
      },
      {
        type: "list",
        title: "Property regime and taxation",
        items: [
          "Marriage offers several possible property regimes (community property, separate property), a civil union defaults to separate property unless the agreement states otherwise",
          "Both allow joint taxation, with a joint tax return starting the year the union is formed",
          "Marriage opens broader automatic rights to survivor's pension, which a civil union does not provide",
        ],
      },
      {
        type: "list",
        title: "Inheritance",
        items: [
          "A married spouse is an automatic legal heir in the absence of a will, with protected rights",
          "A civil union partner is not an automatic legal heir, a will is required to leave them any assets",
          "Inheritance between civil union partners does benefit from an exemption comparable to spouses', provided a will exists",
        ],
      },
      {
        type: "list",
        title: "Dissolution",
        items: [
          "A civil union is dissolved with a simple joint or one-sided declaration, a quick and mostly informal process",
          "Divorce follows a judicial procedure, longer, with property consequences and sometimes a support payment to negotiate",
          "This gap in simplicity often factors into some couples' choice, especially early in a relationship",
        ],
      },
      {
        type: "text",
        title: "How to decide",
        paragraphs: [
          "A civil union suits couples who want a simple legal framework, without marriage's heavier implications for inheritance or divorce. Marriage remains preferable for maximum asset protection, broader social and family recognition, or a joint adoption project, which stays simpler under this framework.",
          "Nothing stops a couple from starting with a civil union and marrying later: the two aren't mutually exclusive over time.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "If you choose marriage, our guide on [matrimonial property regimes](/blog/contrat-mariage-regimes-matrimoniaux) breaks down the marriage contract options to discuss with a notary.",
        ],
      },
    ],
  }),

  postPair({
    slug: "elopement-mariage-a-deux-organiser",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Elopement : se marier à deux, légal et budget en France",
    titleEn: "Elopement: getting married just the two of you, legal and budget in France",
    excerptFr:
      "Deux témoins minimum obligatoires en France, budget réaliste entre 3500 et 8000 euros, lieux populaires : ce qu'implique vraiment un elopement.",
    excerptEn:
      "Two witnesses minimum required by French law, a realistic budget between 3,500 and 8,000 euros, popular spots: what an elopement really involves.",
    readingMinutes: 6,
    heroAltFr: "Elopement mariage intime à deux",
    heroAltEn: "Intimate elopement wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "L'elopement, popularisé par les mariages américains filmés en pleine nature, séduit de plus en plus de couples français en quête de simplicité. Attention toutefois à une différence légale importante avant de se lancer.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "En France, un mariage totalement sans témoin n'existe pas légalement : le Code civil impose au moins un témoin et au maximum deux par époux, avec un minimum de deux témoins au total pour la cérémonie civile en mairie. Un elopement à la française reste donc un mariage à très petit comité, jamais un mariage seul à deux devant l'officier d'état civil.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'est réellement un elopement en France",
        items: [
          "Une cérémonie civile en mairie avec le minimum légal de témoins, suivie ou non d'une cérémonie symbolique ailleurs",
          "Un groupe de deux à dix personnes maximum, souvent uniquement les témoins ou les parents les plus proches",
          "Parfois une cérémonie symbolique seule, sans valeur légale, organisée dans un lieu marquant en dehors de toute mairie",
        ],
      },
      {
        type: "text",
        title: "Budget réaliste",
        paragraphs: [
          "Un elopement bien organisé en France coûte généralement entre 3500 et 8000 euros, contre plusieurs dizaines de milliers pour un mariage traditionnel. L'essentiel du budget part dans le lieu, le photographe (souvent le poste le plus important puisqu'il n'y a pas d'invités pour témoigner du moment), et un éventuel dîner ou séjour prolongé.",
        ],
      },
      {
        type: "list",
        title: "Lieux populaires en France",
        items: [
          "La Provence, pour la lumière et les champs de lavande en saison",
          "Les Alpes, pour un cadre montagnard et des vues spectaculaires",
          "La côte bretonne, pour un rendu plus brut et sauvage",
          "Un lieu urbain marquant, pour les couples qui préfèrent une ambiance citadine à la nature",
        ],
      },
      {
        type: "text",
        title: "Gérer la famille non invitée",
        paragraphs: [
          "Le point le plus délicat d'un elopement reste souvent l'annonce aux proches non conviés. Prévenir en amont plutôt qu'après coup, et proposer une fête ou un dîner de célébration élargi à une date ultérieure, aide à atténuer la déception de certains.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour comparer les différentes tailles de mariage possibles, voir notre guide [mariage intime vs grande réception](/blog/mariage-intime-vs-grande-reception). Un elopement partage beaucoup avec le [micro-mariage](/blog/micro-mariage-petit-comite) si vous hésitez entre les deux formats.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Elopement, popularized by American weddings filmed in scenic nature, is winning over more and more French couples looking for simplicity. Worth noting one important legal difference before diving in, though.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "In France, a wedding with zero witnesses does not legally exist: the Civil Code requires at least one witness and at most two per spouse, with a minimum of two witnesses total for the civil ceremony at the town hall. A French-style elopement is still a very small wedding, never a wedding with just the two of you alone in front of the registrar.",
        ],
      },
      {
        type: "list",
        title: "What an elopement actually is in France",
        items: [
          "A civil ceremony at the town hall with the legal minimum of witnesses, sometimes followed by a symbolic ceremony elsewhere",
          "A group of two to ten people at most, often just the witnesses or the closest parents",
          "Sometimes a symbolic-only ceremony, with no legal standing, held at a striking location outside any town hall",
        ],
      },
      {
        type: "text",
        title: "Realistic budget",
        paragraphs: [
          "A well-organized elopement in France generally costs between 3,500 and 8,000 euros, versus tens of thousands for a traditional wedding. Most of the budget goes to the venue, the photographer (often the biggest line item since there are no guests to witness the moment), and a possible dinner or extended stay.",
        ],
      },
      {
        type: "list",
        title: "Popular spots in France",
        items: [
          "Provence, for the light and lavender fields in season",
          "The Alps, for a mountain setting and spectacular views",
          "The Brittany coast, for a rawer, wilder look",
          "A striking urban spot, for couples who prefer a city feel over nature",
        ],
      },
      {
        type: "text",
        title: "Handling family who aren't invited",
        paragraphs: [
          "The trickiest part of an elopement is usually telling loved ones who weren't invited. Telling them ahead of time rather than after the fact, and offering a broader celebration party or dinner at a later date, helps soften the disappointment for some.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To compare the different wedding sizes available, see our guide on [intimate weddings vs. large receptions](/blog/mariage-intime-vs-grande-reception). An elopement shares a lot with a [micro-wedding](/blog/micro-mariage-petit-comite) if you're torn between the two formats.",
        ],
      },
    ],
  }),

  postPair({
    slug: "micro-mariage-petit-comite",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Micro-mariage (10 à 30 invités) : organiser un petit comité",
    titleEn: "Micro-wedding (10 to 30 guests): planning a small gathering",
    excerptFr:
      "Ni elopement ni grand mariage : le micro-mariage a ses propres règles pour la liste d'invités, le lieu et le budget. Comment bien le calibrer.",
    excerptEn:
      "Neither an elopement nor a big wedding: a micro-wedding has its own rules for the guest list, venue, and budget. How to calibrate it right.",
    readingMinutes: 6,
    heroAltFr: "Micro-mariage petit comité de proches",
    heroAltEn: "Micro-wedding with a small group of guests",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le micro-mariage se situe entre l'[elopement](/blog/elopement-mariage-a-deux-organiser), limité à quelques personnes, et le mariage traditionnel de plus de cent invités. Avec dix à trente personnes, il permet une vraie fête tout en gardant une taille maîtrisable.",
        ],
      },
      {
        type: "list",
        title: "Ce qui distingue le micro-mariage de l'elopement",
        items: [
          "Une vraie liste d'invités au-delà des seuls témoins, incluant famille proche et amis intimes",
          "Un format de réception complet possible (repas assis, discours, ouverture de bal), pas seulement une cérémonie",
          "Une organisation qui ressemble à un mariage classique, simplement à plus petite échelle",
        ],
      },
      {
        type: "text",
        title: "La discipline de la liste d'invités",
        paragraphs: [
          "Le principal défi d'un micro-mariage n'est pas le budget mais la liste : à trente invités maximum, chaque nom ajouté en exclut potentiellement un autre. Fixez le chiffre dès le départ et tenez-vous-y, plutôt que de le voir grimper progressivement.",
          "Une règle simple aide à trancher : uniquement les personnes qui seraient présentes si le mariage devait être annulé et refait en urgence le lendemain.",
        ],
      },
      {
        type: "list",
        title: "Des lieux adaptés à ce format",
        items: [
          "Une maison ou un jardin privé, suffisant pour trente personnes sans les contraintes d'une grande salle",
          "Un restaurant privatisable en semaine ou hors saison, souvent plus accessible qu'un lieu de réception classique",
          "Une petite propriété ou un gîte de charme, pour un week-end complet plutôt qu'une seule journée",
        ],
      },
      {
        type: "text",
        title: "Avantages budgétaires",
        paragraphs: [
          "Le coût par invité peut rester élevé si vous montez en gamme sur la qualité (traiteur haut de gamme, fleurs abondantes), mais le budget total baisse mécaniquement avec moins de couverts, de mange-debout ou de chaises à louer.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour construire votre liste sans dérive, voir notre guide sur le [mariage intime vs grande réception](/blog/mariage-intime-vs-grande-reception), et suivez le budget par poste avec le [calculateur de budget](/tools/budget-calculator) pour visualiser l'effet du nombre d'invités sur chaque ligne.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A micro-wedding sits between an [elopement](/blog/elopement-mariage-a-deux-organiser), limited to a handful of people, and a traditional wedding with over a hundred guests. With ten to thirty people, it allows for a real party while keeping the scale manageable.",
        ],
      },
      {
        type: "list",
        title: "What sets a micro-wedding apart from an elopement",
        items: [
          "A real guest list beyond just the witnesses, including close family and close friends",
          "A full reception format is possible (seated meal, speeches, first dance), not just a ceremony",
          "Planning that resembles a classic wedding, just on a smaller scale",
        ],
      },
      {
        type: "text",
        title: "Guest list discipline",
        paragraphs: [
          "The main challenge of a micro-wedding isn't the budget but the list: at thirty guests max, every name you add potentially bumps another. Set the number upfront and stick to it, rather than letting it creep up gradually.",
          "One simple rule helps decide: only people who would show up if the wedding had to be cancelled and rescheduled for the next day on short notice.",
        ],
      },
      {
        type: "list",
        title: "Venues suited to this format",
        items: [
          "A private house or garden, plenty for thirty people without the constraints of a large hall",
          "A restaurant that can be privatized on a weekday or off-season, often more accessible than a classic reception venue",
          "A small estate or charming rental, for a full weekend rather than a single day",
        ],
      },
      {
        type: "text",
        title: "Budget advantages",
        paragraphs: [
          "Cost per guest can stay high if you upgrade quality (high-end catering, abundant flowers), but the total budget mechanically drops with fewer place settings, cocktail tables, or chairs to rent.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To build your list without letting it drift, see our guide on [intimate weddings vs. large receptions](/blog/mariage-intime-vs-grande-reception), and track your budget by category with the [budget calculator](/tools/budget-calculator) to see how guest count affects each line.",
        ],
      },
    ],
  }),

  postPair({
    slug: "se-remarier-second-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Se remarier : organiser un second mariage sereinement",
    titleEn: "Getting remarried: planning a second wedding with peace of mind",
    excerptFr:
      "Attentes de la famille, format différent du premier mariage, familles recomposées : comment organiser un second mariage sans obligation de comparer.",
    excerptEn:
      "Family expectations, a different format from the first wedding, blended families: how to plan a second wedding without any obligation to compare.",
    readingMinutes: 6,
    heroAltFr: "Second mariage célébré sereinement",
    heroAltEn: "A calm, confident second wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Organiser un second mariage s'accompagne parfois d'une pression particulière : celle de justifier le format choisi face à des proches qui ont déjà assisté au premier. Cette pression n'a pourtant aucune obligation d'exister.",
        ],
      },
      {
        type: "list",
        title: "Aucune obligation de reproduire le premier mariage",
        items: [
          "Un second mariage peut être plus intime, plus simple, ou au contraire plus élaboré que le premier, sans justification à donner",
          "Le format doit correspondre à ce que le couple souhaite maintenant, pas à ce qui a été fait la première fois",
          "Certains couples choisissent volontairement un elopement ou un micro-mariage après un premier grand mariage, et inversement",
        ],
      },
      {
        type: "text",
        title: "Gérer les attentes de la famille",
        paragraphs: [
          "Des proches ayant assisté au premier mariage peuvent avoir des attentes implicites sur ce que « devrait » être le second. Une communication claire et anticipée sur le format choisi désamorce la plupart des malentendus avant qu'ils ne s'installent.",
        ],
      },
      {
        type: "list",
        title: "Considérations spécifiques aux familles recomposées",
        items: [
          "Impliquer les enfants du couple ou de précédentes unions dans la cérémonie, s'ils le souhaitent et selon leur âge",
          "Réfléchir au placement des ex-conjoints ou beaux-parents si des enfants communs sont invités",
          "Adapter la liste d'invités pour représenter équitablement les deux côtés de la famille recomposée",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Il n'existe pas de format « correct » pour un second mariage. Le seul repère utile est ce qui convient au couple aujourd'hui, indépendamment de ce qui s'est passé la première fois.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Que vous visiez un format intime ou une grande fête, notre guide [mariage intime vs grande réception](/blog/mariage-intime-vs-grande-reception) aide à cadrer le choix, et le [calculateur de budget](/tools/budget-calculator) s'adapte à n'importe quelle taille de mariage.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Planning a second wedding sometimes comes with a specific kind of pressure: justifying the chosen format to loved ones who already attended the first one. That pressure doesn't have to exist, though.",
        ],
      },
      {
        type: "list",
        title: "No obligation to repeat the first wedding",
        items: [
          "A second wedding can be more intimate, simpler, or on the contrary more elaborate than the first, with no justification owed",
          "The format should match what the couple wants now, not what was done the first time",
          "Some couples deliberately choose an elopement or a micro-wedding after a large first wedding, and vice versa",
        ],
      },
      {
        type: "text",
        title: "Handling family expectations",
        paragraphs: [
          "Loved ones who attended the first wedding may carry implicit expectations of what the second one \"should\" look like. Clear, early communication about the chosen format defuses most misunderstandings before they take hold.",
        ],
      },
      {
        type: "list",
        title: "Considerations specific to blended families",
        items: [
          "Involving the couple's children, or children from previous relationships, in the ceremony, if they want to and depending on their age",
          "Thinking through seating for exes or in-laws if shared children are invited",
          "Adjusting the guest list to fairly represent both sides of the blended family",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "There is no \"correct\" format for a second wedding. The only useful compass is what works for the couple today, regardless of what happened the first time.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Whether you're aiming for an intimate format or a big party, our guide on [intimate weddings vs. large receptions](/blog/mariage-intime-vs-grande-reception) helps frame the choice, and the [budget calculator](/tools/budget-calculator) adapts to any wedding size.",
        ],
      },
    ],
  }),

  postPair({
    slug: "renouvellement-voeux-organiser",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Renouvellement de vœux : pourquoi et comment l'organiser",
    titleEn: "Vow renewal: why and how to plan one",
    excerptFr:
      "Anniversaire de mariage, étape de vie, envie de recommencer : pourquoi renouveler ses vœux, sans démarche légale, et comment l'organiser à toute échelle.",
    excerptEn:
      "A wedding anniversary, a life milestone, wanting to start fresh: why couples renew their vows, with no legal step required, and how to plan one at any scale.",
    readingMinutes: 5,
    heroAltFr: "Cérémonie de renouvellement de vœux",
    heroAltEn: "Vow renewal ceremony",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le renouvellement de vœux n'a aucune valeur légale : le couple reste marié aux yeux de la loi depuis le premier « oui ». C'est une cérémonie purement symbolique, ce qui laisse une liberté totale sur la forme.",
        ],
      },
      {
        type: "list",
        title: "Les occasions les plus courantes",
        items: [
          "Un anniversaire de mariage marquant (dix, vingt, cinquante ans)",
          "La traversée d'une épreuve de couple, pour marquer symboliquement un nouveau départ",
          "Un mariage civil initial très simple, suivi plus tard d'une cérémonie plus élaborée",
          "L'envie, simplement, de célébrer à nouveau sans raison particulière",
        ],
      },
      {
        type: "text",
        title: "Aucune démarche légale nécessaire",
        paragraphs: [
          "Contrairement au mariage, aucune mairie, aucun officier d'état civil, aucun document administratif n'est requis. La cérémonie peut être célébrée par qui le couple souhaite : un proche, un célébrant laïque, ou simplement les mariés eux-mêmes face à leurs invités.",
        ],
      },
      {
        type: "list",
        title: "Choisir l'échelle de l'événement",
        items: [
          "Une cérémonie intime, juste le couple, en voyage ou dans un lieu qui compte pour eux",
          "Une petite réunion de famille proche, sans l'ampleur d'un mariage complet",
          "Une vraie fête avec tous les invités du mariage d'origine, pour marquer un anniversaire important",
        ],
      },
      {
        type: "text",
        title: "Écrire de nouveaux vœux",
        paragraphs: [
          "C'est souvent le cœur du renouvellement : des vœux qui reflètent le chemin parcouru depuis le mariage, pas une simple répétition des premiers. Prendre le temps d'écrire quelque chose de personnel change complètement la portée du moment.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Un renouvellement de vœux se planifie comme un petit mariage, avec un budget et un lieu à choisir. Notre guide sur le [micro-mariage](/blog/micro-mariage-petit-comite) donne de bonnes bases pour un format à échelle réduite.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A vow renewal has no legal standing: the couple has been legally married since the first \"I do\". It's a purely symbolic ceremony, which leaves total freedom over the format.",
        ],
      },
      {
        type: "list",
        title: "The most common occasions",
        items: [
          "A meaningful wedding anniversary (ten, twenty, fifty years)",
          "Getting through a rough patch as a couple, to symbolically mark a fresh start",
          "A very simple original civil wedding, followed later by a more elaborate ceremony",
          "Simply wanting to celebrate again, no particular reason needed",
        ],
      },
      {
        type: "text",
        title: "No legal step required",
        paragraphs: [
          "Unlike marriage, no town hall, no registrar, no paperwork is required. The ceremony can be officiated by whoever the couple wants: a loved one, a humanist celebrant, or simply the couple themselves in front of their guests.",
        ],
      },
      {
        type: "list",
        title: "Choosing the scale of the event",
        items: [
          "An intimate ceremony, just the couple, while traveling or at a place that matters to them",
          "A small gathering of close family, without the scale of a full wedding",
          "A real party with all the guests from the original wedding, to mark a significant anniversary",
        ],
      },
      {
        type: "text",
        title: "Writing new vows",
        paragraphs: [
          "This is often the heart of a renewal: vows that reflect the journey since the wedding, not a simple repeat of the first ones. Taking the time to write something personal completely changes the weight of the moment.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "A vow renewal is planned like a small wedding, with a budget and a venue to choose. Our guide on [micro-weddings](/blog/micro-mariage-petit-comite) gives good groundwork for a smaller-scale format.",
        ],
      },
    ],
  }),

  postPair({
    slug: "qui-paie-le-mariage-repartition",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Qui paie le mariage : traditions et répartition moderne",
    titleEn: "Who pays for the wedding: tradition and modern splits",
    excerptFr:
      "Répartition traditionnelle française, tendance actuelle où le couple paie lui-même, conversation à avoir tôt : comment aborder ce sujet sans malaise.",
    excerptEn:
      "The traditional French split, today's trend of couples paying themselves, the conversation to have early: how to approach this without discomfort.",
    readingMinutes: 6,
    heroAltFr: "Répartition du budget mariage entre familles",
    heroAltEn: "Splitting the wedding budget between families",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La question de qui paie le mariage reste un des sujets les plus délicats à aborder, souvent évité jusqu'à ce qu'il devienne urgent. Mieux vaut la traiter tôt, avant que des devis ne soient signés sur des hypothèses non vérifiées.",
        ],
      },
      {
        type: "text",
        title: "La tradition française",
        paragraphs: [
          "Historiquement, la famille de la mariée prenait en charge l'essentiel des frais (réception, robe), tandis que la famille du marié couvrait des postes plus ciblés (alliances, voyage de noces). Cette répartition reste présente dans certaines familles, mais elle a fortement reculé, en particulier chez les couples qui se marient plus tard, déjà installés dans la vie active.",
        ],
      },
      {
        type: "list",
        title: "La tendance actuelle",
        items: [
          "De plus en plus de couples financent eux-mêmes l'intégralité ou la majorité du mariage",
          "Une contribution des familles reste fréquente, mais sous forme de cadeau ponctuel plutôt que de prise en charge d'un poste entier",
          "Certains couples répartissent équitablement entre les deux familles, sans distinction traditionnelle entre les rôles",
          "D'autres préfèrent ne rien demander, pour garder une liberté totale sur les choix du mariage",
        ],
      },
      {
        type: "text",
        title: "Avoir la conversation tôt",
        paragraphs: [
          "Avant de fixer un budget définitif ou de contacter des prestataires, clarifiez qui contribue et à quelle hauteur. Une conversation directe, même inconfortable, évite des situations bien pires : un acompte versé sur la base d'une contribution qui ne se concrétise jamais.",
          "Si une famille propose une contribution, précisez si elle est conditionnée à des choix particuliers (lieu, nombre d'invités) ou si elle est offerte sans condition.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Il n'existe aucune règle universelle sur qui doit payer quoi. La seule vraie règle est la clarté : que chacun sache précisément ce qu'il apporte, et à partir de quand.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Une fois les contributions clarifiées, construisez un budget réaliste avec le [calculateur de budget](/tools/budget-calculator), et suivez qui paie quoi poste par poste pour garder une vue claire tout au long de l'organisation.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Who pays for the wedding remains one of the trickiest topics to bring up, often avoided until it becomes urgent. Better to address it early, before quotes get signed on unverified assumptions.",
        ],
      },
      {
        type: "text",
        title: "French tradition",
        paragraphs: [
          "Historically, the bride's family covered most of the costs (reception, dress), while the groom's family covered more targeted items (rings, honeymoon). This split still exists in some families, but it has faded significantly, especially among couples who marry later, already established in their careers.",
        ],
      },
      {
        type: "list",
        title: "The current trend",
        items: [
          "More and more couples fund all or most of the wedding themselves",
          "Family contributions remain common, but as a one-off gift rather than covering a whole line item",
          "Some couples split evenly between both families, without traditional role distinctions",
          "Others prefer to ask for nothing, to keep total freedom over the wedding's choices",
        ],
      },
      {
        type: "text",
        title: "Having the conversation early",
        paragraphs: [
          "Before locking in a final budget or contacting vendors, clarify who is contributing and how much. A direct conversation, even an uncomfortable one, avoids far worse situations: a deposit paid based on a contribution that never materializes.",
          "If a family offers a contribution, clarify whether it's conditional on specific choices (venue, guest count) or given with no strings attached.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "There is no universal rule for who should pay what. The only real rule is clarity: everyone knowing exactly what they're contributing, and from when.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Once contributions are clarified, build a realistic budget with the [budget calculator](/tools/budget-calculator), and track who pays for what line by line to keep a clear view throughout the planning.",
        ],
      },
    ],
  }),

  postPair({
    slug: "choisir-date-mariage-saison",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Choisir sa date de mariage : saison, jour, contraintes",
    titleEn: "Choosing your wedding date: season, day of the week, constraints",
    excerptFr:
      "Écart de prix semaine/week-end, arbitrages entre saisons, conflits à éviter : la date se choisit souvent après le lieu, pas avant.",
    excerptEn:
      "The weekday/weekend price gap, season tradeoffs, conflicts to avoid: the date is often chosen after the venue, not before.",
    readingMinutes: 6,
    heroAltFr: "Calendrier pour choisir la date du mariage",
    heroAltEn: "Calendar for choosing the wedding date",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Beaucoup de couples pensent choisir d'abord une date, puis chercher un lieu disponible ce jour-là. Dans la pratique, c'est souvent l'inverse : la disponibilité du lieu de réception dicte la date bien plus qu'elle ne la suit.",
        ],
      },
      {
        type: "list",
        title: "L'écart de prix entre semaine et week-end",
        items: [
          "Le samedi reste la date la plus demandée et donc la plus chère, souvent réservée un an ou plus à l'avance chez les lieux prisés",
          "Le vendredi ou le dimanche permettent des réductions significatives tout en restant compatibles avec la disponibilité des invités",
          "Un mariage en semaine réduit fortement les coûts, au prix d'une présence des invités plus difficile à garantir",
        ],
      },
      {
        type: "text",
        title: "Arbitrer entre les saisons",
        paragraphs: [
          "Le printemps et l'été restent les saisons les plus demandées, donc les plus chères et les plus contraintes en disponibilité. L'automne offre un compromis intéressant, entre météo encore correcte et tarifs plus doux. L'hiver reste la saison la plus économique, avec ses propres contraintes logistiques.",
        ],
      },
      {
        type: "list",
        title: "Conflits à éviter",
        items: [
          "Les vacances scolaires, qui limitent la disponibilité de certains invités avec enfants",
          "Les grands week-ends fériés, où les prix des lieux et hébergements grimpent pour tout le monde, pas seulement pour le mariage",
          "Les événements familiaux déjà connus (autre mariage, anniversaire important) qui pourraient créer un choix cornélien pour des invités communs",
        ],
      },
      {
        type: "text",
        title: "Pourquoi le lieu dicte souvent la date",
        paragraphs: [
          "Les lieux de réception recherchés affichent leur calendrier de disponibilité bien avant que vous ayez fixé une date précise. Il est souvent plus réaliste de partir des créneaux disponibles chez deux ou trois lieux favoris, puis de choisir parmi ces options, plutôt que de fixer une date rigide dès le départ.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour comparer les types de lieux et leur logique de réservation, voir notre guide [choisir son lieu de réception](/blog/choisir-lieu-reception-types). Une fois la date fixée, calez votre [rétroplanning](/blog/checklist-mariage-50-taches) autour d'elle.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Many couples assume they'll pick a date first, then find a venue available on that day. In practice it's often the reverse: venue availability drives the date far more than it follows it.",
        ],
      },
      {
        type: "list",
        title: "The weekday/weekend price gap",
        items: [
          "Saturday remains the most requested date and therefore the most expensive, often booked a year or more ahead at popular venues",
          "Friday or Sunday allow significant savings while staying compatible with most guests' availability",
          "A weekday wedding cuts costs sharply, at the price of harder-to-guarantee guest attendance",
        ],
      },
      {
        type: "text",
        title: "Weighing the seasons",
        paragraphs: [
          "Spring and summer remain the most requested seasons, so the most expensive and the most constrained on availability. Autumn offers a decent compromise, between still-reasonable weather and softer pricing. Winter stays the cheapest season, with its own logistical constraints.",
        ],
      },
      {
        type: "list",
        title: "Conflicts to avoid",
        items: [
          "School holidays, which limit availability for guests with kids",
          "Long public holiday weekends, when venue and lodging prices climb for everyone, not just for the wedding",
          "Already-known family events (another wedding, a major anniversary) that could put shared guests in an impossible spot",
        ],
      },
      {
        type: "text",
        title: "Why the venue often dictates the date",
        paragraphs: [
          "Sought-after reception venues publish their availability calendar well before you've settled on a precise date. It's often more realistic to start from the open slots at two or three favorite venues, then choose among those options, rather than fixing a rigid date from the start.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To compare venue types and how their booking logic works, see our guide on [choosing your reception venue](/blog/choisir-lieu-reception-types). Once the date is set, build your [countdown checklist](/blog/checklist-mariage-50-taches) around it.",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-printemps-organiser",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Se marier au printemps : avantages, fleurs, météo, tarifs",
    titleEn: "Getting married in spring: advantages, flowers, weather, pricing",
    excerptFr:
      "Mars à mai : météo douce, palette de fleurs de saison (pivoine, renoncule, muguet), tarifs plus doux qu'en été, mais pluie toujours possible.",
    excerptEn:
      "March to May: mild weather, an in-season flower palette (peony, ranunculus, lily of the valley), softer pricing than summer, but rain is always possible.",
    readingMinutes: 6,
    heroAltFr: "Mariage de printemps avec fleurs de saison",
    heroAltEn: "Spring wedding with seasonal flowers",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le printemps s'est imposé comme une saison de mariage très recherchée, entre renouveau visuel et météo qui reste globalement clémente. C'est aussi une saison qui demande un vrai plan B, la pluie restant imprévisible même en mai.",
        ],
      },
      {
        type: "list",
        title: "Avantages du printemps",
        items: [
          "Une lumière douce et changeante, particulièrement flatteuse en photo",
          "Des tarifs généralement plus bas qu'en plein été, surtout en mars et avril",
          "Une nature en pleine floraison qui réduit le besoin de décoration florale artificielle",
          "Une meilleure disponibilité des lieux de réception qu'en haute saison estivale",
        ],
      },
      {
        type: "list",
        title: "Palette de fleurs de saison",
        items: [
          "La pivoine, star du printemps, disponible surtout en mai et juin",
          "La renoncule, aux teintes délicates, parfaite pour un bouquet romantique",
          "Le muguet, symbole traditionnel du mois de mai en France",
          "La tulipe et la jonquille, économiques et disponibles en abondance en début de saison",
        ],
      },
      {
        type: "text",
        title: "Anticiper la météo",
        paragraphs: [
          "Le printemps reste une saison à averses, y compris en mai. Prévoir systématiquement un plan B couvert pour la cérémonie ou le cocktail, même si le lieu choisi est majoritairement extérieur, évite un stress inutile la semaine du mariage.",
        ],
      },
      {
        type: "text",
        title: "Écart de tarifs avec l'été",
        paragraphs: [
          "Mars et avril restent nettement plus économiques que juin à août sur la majorité des postes (lieu, traiteur, hébergement), tandis que mai se rapproche déjà des tarifs de la haute saison à mesure que la demande augmente.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour ne pas être pris au dépourvu par la météo, notre guide [mariage en plein air : le plan B météo](/blog/mariage-plein-air-plan-b-meteo) détaille les options concrètes. Pour le choix des fleurs, voir [fleurs de mariage de saison](/blog/fleurs-mariage-saison-locales).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Spring has become a highly sought-after wedding season, blending visual renewal with generally mild weather. It's also a season that calls for a real backup plan, since rain stays unpredictable even in May.",
        ],
      },
      {
        type: "list",
        title: "Advantages of spring",
        items: [
          "Soft, shifting light, especially flattering in photos",
          "Generally lower prices than peak summer, especially in March and April",
          "Nature in full bloom, cutting down on the need for artificial floral decor",
          "Better venue availability than the summer high season",
        ],
      },
      {
        type: "list",
        title: "In-season flower palette",
        items: [
          "The peony, spring's star, mostly available in May and June",
          "The ranunculus, in delicate shades, perfect for a romantic bouquet",
          "Lily of the valley, a traditional symbol of May in France",
          "Tulips and daffodils, affordable and widely available early in the season",
        ],
      },
      {
        type: "text",
        title: "Planning around the weather",
        paragraphs: [
          "Spring stays a season of showers, even in May. Systematically planning a covered backup for the ceremony or cocktail hour, even if the venue is mostly outdoors, avoids unnecessary stress the week of the wedding.",
        ],
      },
      {
        type: "text",
        title: "Price gap with summer",
        paragraphs: [
          "March and April remain noticeably cheaper than June through August across most line items (venue, catering, lodging), while May already starts approaching high-season pricing as demand rises.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To avoid being caught off guard by the weather, our guide on [outdoor weddings: the weather backup plan](/blog/mariage-plein-air-plan-b-meteo) covers the concrete options. For flower choices, see [seasonal wedding flowers](/blog/fleurs-mariage-saison-locales).",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-ete-canicule-chaleur",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Mariage en été : anticiper la canicule et les fortes chaleurs",
    titleEn: "Summer wedding: planning for heat waves and high temperatures",
    excerptFr:
      "Ombre, points d'eau, horaire de cérémonie, maquillage tenue longue, repli intérieur : comment protéger vos invités d'une chaleur excessive le jour J.",
    excerptEn:
      "Shade, water stations, ceremony timing, long-wear makeup, indoor backup: how to protect your guests from excessive heat on the day.",
    readingMinutes: 6,
    heroAltFr: "Mariage en été chaleur estivale",
    heroAltEn: "Summer wedding in the heat",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les épisodes de canicule sont devenus plus fréquents en France ces dernières années, y compris en juin. Un mariage d'été bien préparé anticipe la chaleur comme un risque concret, pas comme un simple détail météo.",
        ],
      },
      {
        type: "list",
        title: "Gérer la chaleur pour les invités",
        items: [
          "Prévoir des zones d'ombre suffisantes pour la cérémonie, tente ou arbres, pas uniquement pour le cocktail",
          "Mettre à disposition des points d'eau fraîche en libre-service, en plus du service habituel",
          "Distribuer des éventails ou des ombrelles en fonction du programme, utile en extérieur prolongé",
          "Prévoir une ventilation ou une climatisation d'appoint dans la salle de réception si elle n'en dispose pas déjà",
        ],
      },
      {
        type: "text",
        title: "Caler l'horaire de la cérémonie",
        paragraphs: [
          "Éviter le créneau entre 13h et 16h, le plus chaud de la journée, pour toute cérémonie ou photo en extérieur. Décaler la cérémonie en fin d'après-midi ou en tout début de soirée réduit sensiblement l'exposition de tous, mariés compris.",
        ],
      },
      {
        type: "list",
        title: "Adapter maquillage et tenue",
        items: [
          "Privilégier un maquillage longue tenue et résistant à la transpiration pour la mariée et les proches maquillés",
          "Choisir des tissus légers et respirants pour les tenues, en particulier sous une robe ou un costume qui se porte toute la journée",
          "Prévoir un produit matifiant à disposition pour les retouches en cours de journée",
        ],
      },
      {
        type: "text",
        title: "Prévoir un repli intérieur",
        paragraphs: [
          "Même pour un mariage pensé en extérieur, gardez une option intérieure climatisée accessible en cas de chaleur extrême annoncée dans les jours précédents. Ce repli protège en particulier les invités âgés ou les jeunes enfants, plus sensibles aux fortes températures.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Consultez les prévisions météo dans la semaine précédant le mariage et ajustez le programme si besoin (horaires, durée d'exposition au soleil). Un ajustement de dernière minute vaut mieux qu'un invité malaise pendant la cérémonie.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour un plan B complet en cas d'imprévu météo, voir notre guide [mariage en plein air : le plan B météo](/blog/mariage-plein-air-plan-b-meteo), et calez les horaires sensibles à la chaleur dans votre [timeline jour J](/tools/timeline).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Heat waves have become more frequent in France in recent years, even in June. A well-prepared summer wedding treats heat as a real risk, not just a weather footnote.",
        ],
      },
      {
        type: "list",
        title: "Managing heat for guests",
        items: [
          "Plan enough shaded areas for the ceremony, tent or trees, not just for the cocktail hour",
          "Provide self-serve cold water stations, on top of regular service",
          "Hand out fans or parasols depending on the schedule, useful for extended time outdoors",
          "Arrange extra fans or portable air conditioning for the reception hall if it doesn't already have any",
        ],
      },
      {
        type: "text",
        title: "Timing the ceremony",
        paragraphs: [
          "Avoid the 1pm to 4pm window, the hottest part of the day, for any outdoor ceremony or photos. Shifting the ceremony to late afternoon or early evening noticeably reduces sun exposure for everyone, couple included.",
        ],
      },
      {
        type: "list",
        title: "Adjusting makeup and attire",
        items: [
          "Favor long-wear, sweat-resistant makeup for the bride and anyone else getting made up",
          "Choose light, breathable fabrics for outfits, especially under a dress or suit worn all day",
          "Keep a mattifying product on hand for touch-ups during the day",
        ],
      },
      {
        type: "text",
        title: "Keeping an indoor backup",
        paragraphs: [
          "Even for a wedding designed for outdoors, keep an air-conditioned indoor option accessible in case extreme heat is forecast in the days before. This backup particularly protects older guests or young children, more sensitive to high temperatures.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Check the forecast the week before the wedding and adjust the schedule if needed (timing, sun exposure duration). A last-minute adjustment beats a guest feeling unwell during the ceremony.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For a full backup plan in case of bad weather, see our guide on [outdoor weddings: the weather backup plan](/blog/mariage-plein-air-plan-b-meteo), and slot heat-sensitive timings into your [day-of timeline](/tools/timeline).",
        ],
      },
    ],
  }),

  postPair({
    slug: "se-marier-en-semaine-economiser",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Se marier en semaine ou hors saison : économiser gros",
    titleEn: "Marrying on a weekday or off-season: saving big",
    excerptFr:
      "Le samedi coûte le plus cher, une date en semaine ou hors saison (mars-avril) peut faire économiser jusqu'à 1000 euros par poste. Le vrai compromis.",
    excerptEn:
      "Saturday is the most expensive day, a weekday or off-season date (March-April) can save up to 1,000 euros per line item. The real tradeoff.",
    readingMinutes: 6,
    heroAltFr: "Mariage en semaine économique",
    heroAltEn: "Budget-friendly weekday wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le samedi reste la journée la plus demandée par les couples, ce qui en fait mécaniquement la plus chère et la plus difficile à réserver. Sortir de ce créneau, même partiellement, ouvre des économies concrètes sur presque tous les postes du budget.",
        ],
      },
      {
        type: "list",
        title: "Ce que coûte réellement le samedi",
        items: [
          "Les lieux de réception facturent souvent un tarif premium sur le samedi, parfois 20 à 30 % de plus qu'en semaine",
          "Les prestataires les plus demandés (photographes, DJ) pratiquent également des tarifs plus élevés ce jour-là, la demande dépassant l'offre",
          "La disponibilité se réserve loin à l'avance, un an ou plus pour les lieux populaires",
        ],
      },
      {
        type: "list",
        title: "L'alternative du vendredi ou du dimanche",
        items: [
          "Une réduction sensible sur le lieu et certains prestataires, tout en restant compatible avec la présence de la plupart des invités",
          "Un vendredi permet souvent de prolonger la soirée sans contrainte de lendemain travaillé pour les invités",
          "Un dimanche convient bien à un mariage plus tôt dans la journée, suivi d'un brunch plutôt que d'une soirée dansante tardive",
        ],
      },
      {
        type: "text",
        title: "L'économie hors saison",
        paragraphs: [
          "Mars et avril, avant le pic de la demande estivale, permettent des économies allant jusqu'à plusieurs centaines d'euros par poste selon les prestataires. Certains lieux appliquent une grille tarifaire différenciée par mois, à demander explicitement lors de la prise de contact.",
        ],
      },
      {
        type: "text",
        title: "Le vrai compromis à peser",
        paragraphs: [
          "Une date en semaine ou hors saison réduit le budget, mais complique la présence des invités les plus éloignés ou les plus contraints professionnellement. Le calcul vaut le coup si la priorité du couple est le budget plutôt que le taux de présence maximal.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Demandez systématiquement le tarif semaine et le tarif hors saison à chaque prestataire, même quand ce n'est pas affiché : l'écart n'est pas toujours communiqué spontanément.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour d'autres leviers d'économie, voir notre guide [mariage à petit budget : 10 conseils](/blog/mariage-petit-budget-10-conseils), et comparez l'effet d'une date en semaine sur votre budget avec le [calculateur de budget](/tools/budget-calculator).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Saturday remains the most requested day among couples, which mechanically makes it the most expensive and the hardest to book. Stepping outside that slot, even partially, opens up real savings across nearly every budget line.",
        ],
      },
      {
        type: "list",
        title: "What Saturday really costs",
        items: [
          "Reception venues often charge a premium rate on Saturdays, sometimes 20 to 30% more than weekdays",
          "The most sought-after vendors (photographers, DJs) also charge higher rates that day, since demand outstrips supply",
          "Availability books up far in advance, a year or more for popular venues",
        ],
      },
      {
        type: "list",
        title: "The Friday or Sunday alternative",
        items: [
          "A noticeable discount on the venue and some vendors, while staying compatible with most guests' availability",
          "A Friday often lets the evening run longer without guests worrying about work the next day",
          "A Sunday suits an earlier-in-the-day wedding well, followed by a brunch rather than a late dance party",
        ],
      },
      {
        type: "text",
        title: "Off-season savings",
        paragraphs: [
          "March and April, before summer demand peaks, allow savings of up to several hundred euros per line item depending on the vendor. Some venues apply a month-by-month pricing grid, worth asking about explicitly when reaching out.",
        ],
      },
      {
        type: "text",
        title: "The real tradeoff to weigh",
        paragraphs: [
          "A weekday or off-season date lowers the budget, but makes it harder for guests coming from far away or with tight work schedules to attend. The tradeoff is worth it if the couple's priority is budget over maximum turnout.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always ask each vendor for their weekday rate and off-season rate, even when it isn't listed: the gap isn't always volunteered upfront.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For more ways to save, see our guide on [budget weddings: 10 tips](/blog/mariage-petit-budget-10-conseils), and compare the effect of a weekday date on your budget with the [budget calculator](/tools/budget-calculator).",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-chateau-guide",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Se marier dans un château : budget, avantages, questions à poser",
    titleEn: "Getting married in a château: budget, advantages, questions to ask",
    excerptFr:
      "Ce qui est généralement inclus ou non, clauses d'exclusivité, capacité, couvre-feu sonore : les bonnes questions avant de réserver un château.",
    excerptEn:
      "What's typically included or not, exclusivity clauses, capacity, noise curfew: the right questions to ask before booking a château.",
    readingMinutes: 7,
    heroAltFr: "Mariage célébré dans un château",
    heroAltEn: "Wedding celebrated at a château",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le mariage en château séduit par son cadre spectaculaire, mais reste l'un des formats les plus mal compris en termes de budget réel. Beaucoup de couples découvrent après signature que le tarif de location ne couvre qu'une fraction de ce qu'ils imaginaient.",
        ],
      },
      {
        type: "list",
        title: "Ce qui est généralement inclus",
        items: [
          "La location de l'espace (parc, salle de réception, parfois cour intérieure) pour la durée convenue",
          "Un nombre limité de chambres sur place, si le château en propose",
          "L'accès aux extérieurs pour les photos, souvent le point fort du lieu",
        ],
      },
      {
        type: "list",
        title: "Ce qui est généralement exclu",
        items: [
          "Le mobilier (tables, chaises), à louer séparément dans la plupart des cas",
          "Le traiteur, souvent imposé par une liste fermée de prestataires partenaires du château",
          "Le nettoyage et la remise en état après l'événement, parfois facturés en supplément",
          "La sonorisation et l'éclairage, rarement fournis en interne",
        ],
      },
      {
        type: "list",
        title: "Questions à poser avant de réserver",
        items: [
          "Le château impose-t-il une liste fermée de traiteurs ou de prestataires, et à quel point est-elle contraignante",
          "Quelle est la capacité d'accueil réelle, en intérieur comme en extérieur en cas de repli météo",
          "Existe-t-il un couvre-feu sonore, une heure limite de musique imposée par la mairie ou le voisinage",
          "L'hébergement sur place est-il inclus, réservable à part, ou totalement absent",
          "Y a-t-il une clause d'exclusivité qui empêche un autre événement le même week-end",
        ],
      },
      {
        type: "text",
        title: "Budget réaliste",
        paragraphs: [
          "Le tarif de location d'un château varie énormément selon la région et la notoriété du lieu, mais représente rarement plus d'un tiers du budget total une fois ajoutés le traiteur, le mobilier et la décoration. Demandez toujours une estimation du coût total « clé en main » avant de vous décider sur la seule base du tarif de location.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Visitez le château un jour de semaine hors saison pour évaluer objectivement le lieu, sans l'ambiance d'un événement déjà installé qui peut fausser la perception réelle de l'espace.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour comparer un château à d'autres types de lieux, voir notre guide [choisir son lieu de réception](/blog/choisir-lieu-reception-types), et négociez les devis liés au château avec nos conseils pour [négocier un devis mariage](/blog/negocier-devis-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A château wedding wins couples over with its dramatic setting, but it remains one of the most misunderstood formats when it comes to real budget. Many couples discover after signing that the rental fee covers only a fraction of what they imagined.",
        ],
      },
      {
        type: "list",
        title: "What's typically included",
        items: [
          "Rental of the space (grounds, reception hall, sometimes an inner courtyard) for the agreed duration",
          "A limited number of on-site rooms, if the château offers any",
          "Access to the grounds for photos, often the venue's strongest feature",
        ],
      },
      {
        type: "list",
        title: "What's typically excluded",
        items: [
          "Furniture (tables, chairs), rented separately in most cases",
          "Catering, often restricted to a closed list of the château's partner vendors",
          "Cleaning and restoring the space after the event, sometimes billed as an extra",
          "Sound and lighting equipment, rarely provided in-house",
        ],
      },
      {
        type: "list",
        title: "Questions to ask before booking",
        items: [
          "Does the château require a closed list of caterers or vendors, and how strict is it",
          "What's the real guest capacity, both indoors and outdoors in case of a weather backup",
          "Is there a noise curfew, a music cutoff time imposed by the town hall or neighbors",
          "Is on-site lodging included, bookable separately, or not available at all",
          "Is there an exclusivity clause preventing another event the same weekend",
        ],
      },
      {
        type: "text",
        title: "Realistic budget",
        paragraphs: [
          "A château's rental fee varies enormously by region and the venue's reputation, but rarely makes up more than a third of the total budget once catering, furniture, and decor are added. Always ask for a full \"turnkey\" cost estimate before deciding based on the rental fee alone.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Visit the château on an off-season weekday to judge the venue objectively, without the atmosphere of an already-set-up event skewing your real sense of the space.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To compare a château against other venue types, see our guide on [choosing your reception venue](/blog/choisir-lieu-reception-types), and negotiate château-related quotes with our tips on [negotiating a wedding quote](/blog/negocier-devis-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-grange-ferme-champetre",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Mariage en grange ou à la ferme : le champêtre bien fait",
    titleEn: "Barn or farm wedding: doing rustic right",
    excerptFr:
      "Style champêtre réussi vs cliché, chauffage et rafraîchissement d'une grange, sanitaires, parking, insectes : les vrais points à anticiper.",
    excerptEn:
      "Rustic style done well vs cliché, heating and cooling a barn, restrooms, parking, insects: the real points to plan for.",
    readingMinutes: 6,
    heroAltFr: "Mariage champêtre en grange",
    heroAltEn: "Rustic barn wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La grange et la ferme séduisent par leur cadre authentique et leur coût souvent inférieur à un lieu de réception traditionnel. Le style champêtre a toutefois basculé dans le cliché pour certains couples, à cause d'une décoration trop systématique (tonneaux, guirlandes lumineuses, pancartes en bois partout).",
        ],
      },
      {
        type: "list",
        title: "Éviter le côté cliché",
        items: [
          "Choisir un thème de décoration cohérent avec le style personnel du couple plutôt qu'un kit champêtre standard trouvé en ligne",
          "Laisser respirer l'architecture brute de la grange (bois, pierre) plutôt que de tout recouvrir de décoration",
          "Miser sur une palette de couleurs simple et des matières naturelles plutôt que sur l'accumulation d'objets décoratifs",
        ],
      },
      {
        type: "list",
        title: "Chauffage et rafraîchissement",
        items: [
          "Une grange non isolée devient très froide en soirée, même en été, prévoir un chauffage d'appoint dès le printemps ou l'automne",
          "En été, l'absence de climatisation rend l'espace étouffant en pleine chaleur, des ventilateurs industriels ou une ouverture large des portes s'imposent",
          "Vérifier l'installation électrique disponible sur place avant de prévoir du matériel de chauffage ou de ventilation supplémentaire",
        ],
      },
      {
        type: "list",
        title: "Sanitaires et logistique",
        items: [
          "Une grange isolée n'a souvent aucun sanitaire fixe, prévoir des toilettes mobiles de qualité en nombre suffisant",
          "Vérifier l'accès à l'eau courante pour le traiteur, un point parfois absent dans les bâtiments agricoles reconvertis",
          "Anticiper le parking pour un grand nombre de véhicules sur un terrain qui n'est pas toujours stabilisé",
        ],
      },
      {
        type: "text",
        title: "Les insectes, un point souvent oublié",
        paragraphs: [
          "Une grange ou une ferme en pleine campagne attire logiquement plus d'insectes qu'une salle fermée en ville. Prévoir un dispositif anti-moustiques pour la soirée, en particulier en été, et éviter les fleurs trop parfumées qui attirent guêpes et abeilles près des tables.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Visitez le lieu à l'heure prévue de votre événement, en soirée par exemple, pour évaluer la température réelle et la lumière disponible à ce moment précis, pas seulement en pleine journée lors de la visite.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour comparer ce format à d'autres types de lieux, voir notre guide [choisir son lieu de réception](/blog/choisir-lieu-reception-types), et prévoyez systématiquement un [plan B météo](/blog/mariage-plein-air-plan-b-meteo) pour tout événement en partie extérieur.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Barns and farms win couples over with their authentic feel and often lower cost than a traditional reception venue. Rustic style has tipped into cliché for some couples, though, from overly systematic decor (barrels, string lights, wooden signs everywhere).",
        ],
      },
      {
        type: "list",
        title: "Avoiding the cliché side",
        items: [
          "Choosing a decor theme consistent with the couple's personal style rather than a standard rustic kit found online",
          "Letting the barn's raw architecture (wood, stone) breathe rather than covering everything in decor",
          "Leaning on a simple color palette and natural materials rather than piling on decorative objects",
        ],
      },
      {
        type: "list",
        title: "Heating and cooling",
        items: [
          "An uninsulated barn gets very cold in the evening, even in summer, plan for supplemental heating from spring or autumn",
          "In summer, the lack of air conditioning makes the space stifling in peak heat, industrial fans or wide-open doors become necessary",
          "Check the on-site electrical setup before planning extra heating or ventilation equipment",
        ],
      },
      {
        type: "list",
        title: "Restrooms and logistics",
        items: [
          "An isolated barn often has no fixed restrooms, plan for enough quality portable toilets",
          "Check access to running water for the caterer, sometimes missing in converted farm buildings",
          "Plan parking for a large number of vehicles on ground that isn't always paved or stable",
        ],
      },
      {
        type: "text",
        title: "Insects, an often-forgotten point",
        paragraphs: [
          "A barn or farm out in the countryside naturally attracts more insects than an enclosed venue in town. Plan a mosquito-control setup for the evening, especially in summer, and avoid overly fragrant flowers that draw wasps and bees near the tables.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Visit the venue at the time your event will actually take place, in the evening for instance, to judge the real temperature and available light at that specific moment, not just during a daytime tour.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To compare this format against other venue types, see our guide on [choosing your reception venue](/blog/choisir-lieu-reception-types), and always plan a [weather backup plan](/blog/mariage-plein-air-plan-b-meteo) for any partly outdoor event.",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-a-la-maison-jardin",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Se marier à la maison ou au jardin : la vraie checklist",
    titleEn: "Getting married at home or in a garden: the real checklist",
    excerptFr:
      "Autorisations, bruit et voisinage, tente ou chapiteau, sanitaires, électricité, plan B météo : la logistique cachée derrière l'économie apparente.",
    excerptEn:
      "Permits, noise and neighbors, a tent or marquee, restrooms, power, weather backup: the hidden logistics behind the apparent savings.",
    readingMinutes: 7,
    heroAltFr: "Mariage organisé dans un jardin privé",
    heroAltEn: "Wedding held in a private garden",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Se marier à la maison ou dans un jardin privé attire pour l'économie apparente sur le lieu, souvent gratuit ou peu coûteux. Cette économie se déplace pourtant vers d'autres postes qu'on oublie facilement de chiffrer au départ.",
        ],
      },
      {
        type: "list",
        title: "Autorisations et réglementation",
        items: [
          "Vérifier auprès de la mairie si une autorisation est nécessaire pour un rassemblement au-delà d'un certain nombre de personnes",
          "Consulter le règlement de copropriété ou de lotissement s'il existe, certains interdisent les événements bruyants",
          "Se renseigner sur les horaires de bruit autorisés localement, souvent encadrés par un arrêté municipal",
        ],
      },
      {
        type: "list",
        title: "Bruit et voisinage",
        items: [
          "Prévenir les voisins directs en amont, une démarche simple qui évite bien des tensions le soir même",
          "Prévoir une coupure ou une baisse du son de la musique à une heure raisonnable, en particulier en zone résidentielle",
          "Anticiper que la musique amplifiée en extérieur porte plus loin qu'en intérieur, même à volume modéré",
        ],
      },
      {
        type: "list",
        title: "Tente ou chapiteau, presque toujours nécessaire",
        items: [
          "Un jardin privé n'offre quasiment jamais de repli intérieur suffisant pour tous les invités en cas de pluie",
          "La location d'un chapiteau représente souvent un des postes les plus chers de ce type de mariage, à intégrer dès le premier chiffrage",
          "Vérifier l'accès du terrain pour le camion de livraison et le montage du chapiteau, un point souvent négligé",
        ],
      },
      {
        type: "list",
        title: "Sanitaires et électricité",
        items: [
          "Une maison familiale n'a presque jamais assez de toilettes pour cent invités, des toilettes mobiles deviennent nécessaires",
          "Vérifier la puissance électrique disponible avant de brancher cuisine de traiteur, sonorisation et éclairage en simultané",
          "Prévoir un groupe électrogène de secours si l'installation existante semble limite",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Faites un chiffrage complet avant de vous engager sur ce format : chapiteau, sanitaires mobiles, électricité, personnel de nettoyage additionnel peuvent rapprocher le coût total de celui d'un lieu de réception classique.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour structurer un plan B météo solide, indispensable dans ce format, voir notre guide [mariage en plein air : le plan B météo](/blog/mariage-plein-air-plan-b-meteo), et suivez chaque poste caché dans le [calculateur de budget](/tools/budget-calculator).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Getting married at home or in a private garden appeals for the apparent savings on the venue, often free or low-cost. Those savings tend to shift toward other line items that are easy to forget to budget for upfront.",
        ],
      },
      {
        type: "list",
        title: "Permits and regulations",
        items: [
          "Check with the town hall whether a permit is required for a gathering beyond a certain headcount",
          "Check the co-ownership or subdivision bylaws if they exist, some ban noisy events",
          "Look into locally allowed noise hours, often governed by a municipal order",
        ],
      },
      {
        type: "list",
        title: "Noise and neighbors",
        items: [
          "Give direct neighbors a heads-up ahead of time, a simple step that avoids a lot of tension that evening",
          "Plan a cutoff or reduction of music volume at a reasonable hour, especially in a residential area",
          "Keep in mind that amplified outdoor music travels further than indoor sound, even at moderate volume",
        ],
      },
      {
        type: "list",
        title: "A tent or marquee, almost always needed",
        items: [
          "A private garden almost never offers enough indoor backup space for all guests in case of rain",
          "Renting a marquee is often one of the priciest line items in this type of wedding, worth including in the very first estimate",
          "Check ground access for the delivery truck and marquee setup, a point often overlooked",
        ],
      },
      {
        type: "list",
        title: "Restrooms and power",
        items: [
          "A family home almost never has enough toilets for a hundred guests, portable toilets become necessary",
          "Check the available electrical capacity before running the caterer's kitchen, sound, and lighting all at once",
          "Plan for a backup generator if the existing setup looks tight",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Do a full cost estimate before committing to this format: marquee, portable restrooms, power, and extra cleaning staff can bring the total cost close to that of a classic reception venue.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To build a solid weather backup plan, essential for this format, see our guide on [outdoor weddings: the weather backup plan](/blog/mariage-plein-air-plan-b-meteo), and track every hidden cost in the [budget calculator](/tools/budget-calculator).",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-vignoble-domaine-viticole",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Mariage au domaine viticole : cadre, saison, logistique",
    titleEn: "Vineyard wedding: setting, season, logistics",
    excerptFr:
      "Rangées de vignes en toile de fond, accord mets-vins pour la réception, exclusivité sur la carte des vins du domaine : ce qu'implique ce cadre.",
    excerptEn:
      "Rows of vines as a backdrop, wine pairing for the reception, exclusivity on the estate's own wine list: what this setting involves.",
    readingMinutes: 6,
    heroAltFr: "Mariage dans un domaine viticole",
    heroAltEn: "Wedding at a vineyard estate",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le domaine viticole offre un cadre visuel difficile à égaler : rangées de vignes, bâtiments en pierre, lumière de fin de journée sur les coteaux. C'est aussi un lieu avec sa propre saisonnalité, distincte de celle des autres types de mariage.",
        ],
      },
      {
        type: "list",
        title: "Ce qui rend ce cadre unique",
        items: [
          "Une toile de fond naturelle qui demande peu de décoration supplémentaire pour la cérémonie",
          "Des espaces variés sur un même domaine (chai, cour, extérieur) pour différencier cérémonie, cocktail et dîner",
          "Une ambiance chaleureuse et conviviale, cohérente avec l'univers du vin",
        ],
      },
      {
        type: "text",
        title: "Le conflit avec la saison des vendanges",
        paragraphs: [
          "Fin août à début octobre correspond généralement aux vendanges, une période où le domaine mobilise tout son personnel et son espace pour la récolte. Beaucoup de domaines n'acceptent pas d'événement sur ce créneau, ou appliquent des restrictions d'accès à certaines zones. Vérifier cette contrainte en priorité avant de fixer une date d'automne.",
        ],
      },
      {
        type: "list",
        title: "L'angle accord mets-vins",
        items: [
          "Proposer un accord mets-vins structuré pour le dîner, un vrai plus par rapport à un mariage classique",
          "Organiser une dégustation pour les invités en amont du cocktail, un moment convivial et original",
          "Offrir une bouteille du domaine en cadeau d'invité, un souvenir cohérent avec le lieu",
        ],
      },
      {
        type: "text",
        title: "L'exclusivité sur le vin du domaine",
        paragraphs: [
          "La plupart des domaines viticoles imposent leur propre production sur la carte des vins servie pendant l'événement, une clause à anticiper si le couple a des préférences différentes. Vérifiez si un vin extérieur peut être ajouté en complément, et à quelles conditions (droit de bouchon notamment).",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour comparer ce format à d'autres lieux atypiques, voir notre guide [choisir son lieu de réception](/blog/choisir-lieu-reception-types). Un mariage d'automne dans un domaine viticole s'accorde bien avec notre guide [mariage d'automne](/blog/mariage-automne-organiser).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A vineyard estate offers a visual setting that's hard to match: rows of vines, stone buildings, late-day light over the hillsides. It's also a venue with its own seasonality, distinct from other wedding types.",
        ],
      },
      {
        type: "list",
        title: "What makes this setting unique",
        items: [
          "A natural backdrop that needs little extra decor for the ceremony",
          "Varied spaces within one estate (wine cellar, courtyard, outdoors) to separate ceremony, cocktail hour, and dinner",
          "A warm, convivial atmosphere consistent with the world of wine",
        ],
      },
      {
        type: "text",
        title: "The conflict with harvest season",
        paragraphs: [
          "Late August through early October generally corresponds to grape harvest, a period when the estate devotes its staff and space to picking. Many estates won't accept an event during that window, or apply access restrictions to certain areas. Check this constraint first before locking in an autumn date.",
        ],
      },
      {
        type: "list",
        title: "The wine-pairing angle",
        items: [
          "Offering a structured wine pairing for the dinner, a real upgrade over a classic wedding",
          "Organizing a tasting for guests ahead of the cocktail hour, a convivial and original touch",
          "Giving a bottle from the estate as a guest favor, a souvenir consistent with the venue",
        ],
      },
      {
        type: "text",
        title: "Exclusivity on the estate's wine",
        paragraphs: [
          "Most vineyard estates require their own production on the wine list served during the event, a clause worth anticipating if the couple has different preferences. Check whether outside wine can be added, and under what conditions (a corkage fee, notably).",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To compare this format against other distinctive venues, see our guide on [choosing your reception venue](/blog/choisir-lieu-reception-types). An autumn wedding at a vineyard estate pairs well with our [autumn wedding](/blog/mariage-automne-organiser) guide.",
        ],
      },
    ],
  }),

  postPair({
    slug: "mariage-plage-bord-de-mer",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Mariage à la plage : autorisation, vent, sable et style",
    titleEn: "Beach wedding: permits, wind, sand, and style",
    excerptFr:
      "Autorisation de la mairie pour une plage publique, vent qui déjoue coiffure et décoration, horaire calé sur la marée : la réalité d'un mariage en bord de mer.",
    excerptEn:
      "Town hall permit for a public beach, wind that ruins hair and decor, timing tied to the tide: the reality of a seaside wedding.",
    readingMinutes: 6,
    heroAltFr: "Mariage célébré sur une plage",
    heroAltEn: "Wedding celebrated on a beach",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le mariage à la plage évoque une image d'insouciance, mais suppose une organisation plus technique qu'il n'y paraît, entre démarches administratives et contraintes naturelles propres au littoral.",
        ],
      },
      {
        type: "list",
        title: "Autorisation municipale",
        items: [
          "Une plage publique en France nécessite une autorisation d'occupation temporaire délivrée par la mairie ou le gestionnaire du domaine public maritime",
          "Cette autorisation encadre souvent les horaires, le nombre de personnes et l'installation de structures (tente, mobilier)",
          "La cérémonie civile elle-même reste obligatoirement en mairie, la plage ne peut accueillir qu'une cérémonie symbolique ou le cocktail",
        ],
      },
      {
        type: "list",
        title: "Vent et sable, les vraies contraintes",
        items: [
          "Le vent complique la coiffure, la robe et toute décoration légère (voile, guirlandes, nappage), prévoir des fixations solides",
          "Le sable abîme rapidement les chaussures fines et rend la marche compliquée pour certains invités, prévenir sur l'invitation",
          "Une décoration lestée ou fixée au sol reste indispensable, même par temps calme en apparence",
        ],
      },
      {
        type: "text",
        title: "Caler l'horaire sur la marée",
        paragraphs: [
          "Vérifier les horaires de marée du jour choisi bien avant l'événement : une marée haute peut réduire drastiquement l'espace de plage disponible, voire rendre certains emplacements inaccessibles. Les coefficients de marée se consultent facilement en ligne plusieurs mois à l'avance.",
        ],
      },
      {
        type: "list",
        title: "Choisir le bon style",
        items: [
          "Une tenue légère et sans traîne excessive facilite les déplacements sur le sable",
          "Des chaussures plates ou pieds nus pour la cérémonie, à réserver pour la partie plage uniquement",
          "Une décoration inspirée du littoral (bois flotté, lin, teintes naturelles) plutôt qu'un style trop chargé qui ne résiste pas au vent",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Prévoyez toujours un plan B à l'intérieur ou à l'abri à proximité immédiate : le vent ou la pluie peuvent transformer une plage idyllique en contrainte le jour même.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour anticiper les imprévus météo propres au littoral, voir notre guide [mariage en plein air : le plan B météo](/blog/mariage-plein-air-plan-b-meteo). Ce format se marie bien avec un mariage d'été, voir notre guide [mariage en été et fortes chaleurs](/blog/mariage-ete-canicule-chaleur).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A beach wedding conjures an image of carefree ease, but it involves more technical planning than it seems, between administrative steps and natural constraints specific to the coast.",
        ],
      },
      {
        type: "list",
        title: "Municipal permit",
        items: [
          "A public beach in France requires a temporary occupancy permit issued by the town hall or the maritime public domain manager",
          "This permit often governs timing, headcount, and the setup of structures (tent, furniture)",
          "The civil ceremony itself must still take place at the town hall, the beach can only host a symbolic ceremony or the cocktail hour",
        ],
      },
      {
        type: "list",
        title: "Wind and sand, the real constraints",
        items: [
          "Wind complicates hair, dress, and any light decor (veil, garlands, linens), plan for sturdy fastenings",
          "Sand quickly ruins delicate shoes and makes walking difficult for some guests, mention it on the invitation",
          "Weighted or ground-anchored decor remains essential, even on an apparently calm day",
        ],
      },
      {
        type: "text",
        title: "Timing around the tide",
        paragraphs: [
          "Check the tide schedule for the chosen day well ahead of the event: high tide can drastically shrink the available beach space, or even make certain spots inaccessible. Tide coefficients are easy to look up online several months in advance.",
        ],
      },
      {
        type: "list",
        title: "Choosing the right style",
        items: [
          "Light attire without an excessive train makes moving on sand easier",
          "Flat shoes or bare feet for the ceremony, kept for the beach portion only",
          "Coastal-inspired decor (driftwood, linen, natural tones) rather than a heavier style that won't hold up in the wind",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always plan a backup indoors or under cover close by: wind or rain can turn an idyllic beach into a liability on the day itself.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To plan for coastal weather surprises, see our guide on [outdoor weddings: the weather backup plan](/blog/mariage-plein-air-plan-b-meteo). This format pairs well with a summer wedding, see our guide on [summer weddings and heat waves](/blog/mariage-ete-canicule-chaleur).",
        ],
      },
    ],
  }),

  postPair({
    slug: "chapiteau-tente-location-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Chapiteau ou tente : louer un abri de réception",
    titleEn: "Marquee or tent: renting a reception shelter",
    excerptFr:
      "Quand un chapiteau devient nécessaire, dimensionner selon le nombre d'invités, options sol/éclairage/chauffage, délai de réservation à respecter.",
    excerptEn:
      "When a marquee becomes necessary, sizing it to guest count, flooring/lighting/heating add-ons, the lead time needed to book one.",
    readingMinutes: 6,
    heroAltFr: "Chapiteau de réception installé pour un mariage",
    heroAltEn: "Reception marquee set up for a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le chapiteau devient incontournable dès qu'un mariage se tient dans un lieu sans repli intérieur suffisant : jardin privé, domaine sans grande salle, terrain nu. C'est aussi un poste souvent sous-estimé au moment du premier chiffrage.",
        ],
      },
      {
        type: "list",
        title: "Quand un chapiteau est vraiment nécessaire",
        items: [
          "Un lieu extérieur sans salle intérieure capable d'accueillir tous les invités en cas de pluie",
          "Un jardin privé ou une propriété familiale, presque systématiquement",
          "Un domaine dont la salle existante est trop petite pour le nombre d'invités prévu",
        ],
      },
      {
        type: "text",
        title: "Dimensionner selon le nombre d'invités",
        paragraphs: [
          "Comptez généralement entre 1,5 et 2 m² par invité pour un repas assis avec piste de danse, en incluant l'espace pour le buffet, la scène ou le coin DJ. Un chapiteau trop juste complique le service et le passage, mieux vaut prévoir large plutôt que d'ajouter une extension en urgence.",
        ],
      },
      {
        type: "list",
        title: "Options à ne pas oublier",
        items: [
          "Un plancher ou sol technique, indispensable sur terrain irrégulier ou en cas de pluie les jours précédents",
          "L'éclairage intérieur, rarement inclus dans le tarif de base du chapiteau seul",
          "Le chauffage d'appoint pour un mariage de fin de saison, ou la ventilation pour un mariage d'été",
          "Les parois latérales transparentes ou opaques, selon l'exposition au vent et la météo attendue",
        ],
      },
      {
        type: "text",
        title: "Délai de réservation",
        paragraphs: [
          "Les loueurs de chapiteaux événementiels se réservent généralement plusieurs mois à l'avance en haute saison, parfois six mois ou plus pour les grandes tailles ou les modèles avec parois transparentes très demandés. Contactez plusieurs loueurs dès que le lieu et la date sont fixés.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Demandez toujours si le montage et le démontage sont inclus dans le devis, et vérifiez l'accès du terrain pour le camion de livraison : un accès difficile peut entraîner des frais supplémentaires non anticipés.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour un mariage à la maison ou au jardin, le chapiteau fait partie de la checklist complète détaillée dans notre guide [se marier à la maison ou au jardin](/blog/mariage-a-la-maison-jardin). Suivez ce poste dans votre [calculateur de budget](/tools/budget-calculator) dès le premier devis.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A marquee becomes essential as soon as a wedding is held at a venue with no adequate indoor backup: a private garden, an estate with no large hall, bare land. It's also a line item often underestimated in the first cost estimate.",
        ],
      },
      {
        type: "list",
        title: "When a marquee is really necessary",
        items: [
          "An outdoor venue with no indoor room able to host all guests in case of rain",
          "A private garden or family property, almost always",
          "An estate whose existing hall is too small for the planned guest count",
        ],
      },
      {
        type: "text",
        title: "Sizing it to guest count",
        paragraphs: [
          "Plan for roughly 1.5 to 2 square meters per guest for a seated meal with a dance floor, including space for the buffet, stage, or DJ booth. A marquee that's too tight complicates service and movement, better to size up than scramble for a last-minute extension.",
        ],
      },
      {
        type: "list",
        title: "Add-ons not to forget",
        items: [
          "A raised or technical floor, essential on uneven ground or if it's rained in the preceding days",
          "Interior lighting, rarely included in the marquee's base rate",
          "Supplemental heating for a late-season wedding, or ventilation for a summer one",
          "Clear or opaque side walls, depending on wind exposure and expected weather",
        ],
      },
      {
        type: "text",
        title: "Booking lead time",
        paragraphs: [
          "Event marquee rental companies generally need to be booked several months ahead in high season, sometimes six months or more for large sizes or highly sought-after clear-wall models. Contact several rental companies as soon as the venue and date are set.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always ask whether setup and teardown are included in the quote, and check ground access for the delivery truck: difficult access can trigger unplanned extra fees.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For a wedding at home or in a garden, the marquee is part of the full checklist covered in our guide on [getting married at home or in a garden](/blog/mariage-a-la-maison-jardin). Track this line item in your [budget calculator](/tools/budget-calculator) from the very first quote.",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_125_144_FR, en: POSTS_125_144_EN } = pairsToArrays(pairs);
