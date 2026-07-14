import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "wedding-planner-faut-il-engager",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Wedding planner : faut-il en engager un, à quel prix",
    titleEn: "Wedding planner: is it worth hiring one, and at what price",
    excerptFr:
      "Coordination jour J, organisation partielle ou complète : les prix pratiqués en France et comment savoir si vous en avez vraiment besoin.",
    excerptEn:
      "Day-of coordination, partial or full planning: real French pricing, and how to know if you actually need one.",
    readingMinutes: 7,
    heroAltFr: "Wedding planner organisant un mariage",
    heroAltEn: "Wedding planner organizing a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le wedding planner a longtemps eu une image de luxe réservée aux gros budgets. En réalité, la profession propose plusieurs formules, et certaines coûtent bien moins qu'un poste traiteur ou photographe.",
          "La question n'est pas « est-ce que j'en ai les moyens » mais « est-ce que ce type d'aide correspond à ma situation ». Un couple débordé par le travail n'a pas les mêmes besoins qu'un couple qui a du temps et aime organiser.",
        ],
      },
      {
        type: "list",
        title: "Les trois formules et leurs prix en France",
        items: [
          "Coordination jour J : environ 1500 à 2800 euros, le planner prend le relais dans les dernières semaines et gère la journée elle-même",
          "Organisation partielle : environ 2000 à 3500 euros, pour un accompagnement sur certains postes seulement (recherche de prestataires, négociation, suivi budget)",
          "Organisation complète : environ 3500 à 5000 euros, ou un pourcentage du budget total (souvent entre 8 et 15 %), le planner gère tout de A à Z",
          "Ces fourchettes varient fortement selon la région et la taille du mariage, un mariage parisien ou dans le sud coûte généralement plus cher qu'en zone rurale",
        ],
      },
      {
        type: "text",
        title: "Ce qu'un wedding planner apporte réellement",
        paragraphs: [
          "Au-delà de l'organisation, le planner apporte un réseau de prestataires déjà testés, un œil pour repérer les incohérences dans un devis, et surtout une personne qui gère les imprévus le jour J pendant que vous profitez de votre mariage.",
          "Sa valeur se mesure aussi en stress évité : ne pas avoir à répondre à un fournisseur en pleine cérémonie, ne pas être celui ou celle qu'on vient chercher si la sono tombe en panne.",
        ],
      },
      {
        type: "list",
        title: "Quand l'engager vaut vraiment le coup",
        items: [
          "Vous travaillez beaucoup et manquez de temps pour comparer des devis et suivre les échéances",
          "Le mariage se déroule loin de chez vous, dans une région que vous connaissez mal",
          "Le nombre d'invités ou de prestataires dépasse ce que vous vous sentez de coordonner seul",
          "Vous voulez surtout ne penser à rien le jour J, y compris la logistique de dernière minute",
        ],
      },
      {
        type: "list",
        title: "Quand vous pouvez vous en passer",
        items: [
          "Vous avez du temps devant vous et aimez ce type d'organisation",
          "Votre mariage reste de taille modeste, avec peu de prestataires à coordonner",
          "Vous vous appuyez sur une app ou un tableau de suivi qui centralise devis, échéances et tâches",
          "Un témoin ou un proche organisé peut prendre en charge la coordination du jour J",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Avant de signer, demandez au wedding planner deux ou trois références de mariages de taille comparable au vôtre organisés récemment. Un bon planner ne se vexe jamais de cette demande.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Si un wedding planner complet dépasse votre budget, la [coordination jour J seule](/blog/coordinateur-jour-j-utilite) est souvent le bon compromis. Et pour négocier vos devis prestataires vous-même, voir notre guide [négocier un devis](/blog/negocier-devis-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The wedding planner has long carried a luxury image reserved for big budgets. In reality, the profession offers several formulas, and some cost far less than a caterer or photographer line item.",
          "The question isn't \"can I afford it\" but \"does this kind of help fit my situation\". A couple swamped by work doesn't have the same needs as a couple with time on their hands who enjoys organizing.",
        ],
      },
      {
        type: "list",
        title: "The three formulas and their French pricing",
        items: [
          "Day-of coordination: roughly 1,500 to 2,800 euros, the planner takes over in the final weeks and runs the day itself",
          "Partial planning: roughly 2,000 to 3,500 euros, support on select items only (vendor sourcing, negotiation, budget tracking)",
          "Full planning: roughly 3,500 to 5,000 euros, or a percentage of the total budget (often between 8 and 15%), the planner handles everything from A to Z",
          "These ranges vary widely by region and wedding size, a wedding in Paris or the south generally costs more than in a rural area",
        ],
      },
      {
        type: "text",
        title: "What a wedding planner actually brings",
        paragraphs: [
          "Beyond organization, a planner brings a network of already-vetted vendors, an eye for spotting inconsistencies in a quote, and above all someone who handles the day's surprises while you enjoy your wedding.",
          "Their value is also measured in stress avoided: not having to answer a vendor mid-ceremony, not being the one people come find if the sound system fails.",
        ],
      },
      {
        type: "list",
        title: "When hiring one is really worth it",
        items: [
          "You work a lot and lack time to compare quotes and track deadlines",
          "The wedding takes place far from home, in a region you don't know well",
          "The guest count or number of vendors exceeds what you feel able to coordinate alone",
          "You mainly want to think about nothing on the day, including last-minute logistics",
        ],
      },
      {
        type: "list",
        title: "When you can skip it",
        items: [
          "You have time ahead of you and enjoy this kind of organizing",
          "Your wedding stays modest in size, with few vendors to coordinate",
          "You rely on an app or tracking board that centralizes quotes, deadlines, and tasks",
          "An organized witness or family member can take on day-of coordination",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Before signing, ask the wedding planner for two or three references from recently organized weddings of comparable size to yours. A good planner never minds this request.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "If full wedding planning is over budget, [day-of coordination alone](/blog/coordinateur-jour-j-utilite) is often the right compromise. And to negotiate vendor quotes yourself, see our guide on [negotiating a quote](/blog/negocier-devis-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "coordinateur-jour-j-utilite",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Coordinateur jour J : l'option maligne à petit budget",
    titleEn: "Day-of coordinator: the smart option on a smaller budget",
    excerptFr:
      "Moins cher qu'un wedding planner complet, le coordinateur jour J prend en charge la logistique du jour même pour que vous n'ayez rien à gérer.",
    excerptEn:
      "Cheaper than a full wedding planner, a day-of coordinator handles the day's logistics so you have nothing to manage.",
    readingMinutes: 6,
    heroAltFr: "Coordinateur jour J de mariage",
    heroAltEn: "Wedding day-of coordinator",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Entre tout organiser soi-même et engager un wedding planner complet, il existe une option intermédiaire trop souvent ignorée : le coordinateur jour J. Son rôle commence là où le vôtre s'arrête, quelques semaines avant le mariage.",
        ],
      },
      {
        type: "list",
        title: "Ce que gère un coordinateur jour J",
        items: [
          "La timeline détaillée de la journée, minute par minute, partagée avec tous les prestataires",
          "L'accueil et l'installation des prestataires (traiteur, DJ, fleuriste) sur le lieu de réception",
          "Les petits imprévus (retard, oubli, problème technique) sans vous en informer sauf urgence réelle",
          "Le lien entre la salle, les prestataires et les témoins pendant toute la journée",
        ],
      },
      {
        type: "text",
        title: "Ce qu'il ne fait pas",
        paragraphs: [
          "Contrairement à l'organisation complète, le coordinateur jour J n'a généralement pas recherché vos prestataires ni négocié vos devis. Il prend le relais sur un mariage déjà construit, ce qui explique son tarif plus accessible.",
        ],
      },
      {
        type: "list",
        title: "Pourquoi c'est une option maligne",
        items: [
          "Le tarif reste nettement inférieur à une organisation complète, souvent la moitié voire le tiers du prix",
          "Vous gardez la main sur les choix de prestataires et l'ambiance générale, seule la logistique du jour est déléguée",
          "Vos témoins ne sont plus mobilisés toute la journée pour gérer les livraisons ou les horaires",
          "Vous et vos proches profitez réellement de la journée au lieu de répondre aux questions logistiques",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Briefez votre coordinateur au moins un mois avant, avec la liste complète des prestataires, leurs horaires d'arrivée, et les personnes à contacter en cas de pépin. Plus le brief est précis, plus la journée roule sans accroc.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour comparer cette option à une organisation plus complète, voir notre article [wedding planner : faut-il en engager un](/blog/wedding-planner-faut-il-engager). Préparez la timeline que vous remettrez à votre coordinateur directement dans votre [timeline jour J](/tools/timeline).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Between organizing everything yourself and hiring a full wedding planner, there's a middle option too often overlooked: the day-of coordinator. Their role begins where yours stops, a few weeks before the wedding.",
        ],
      },
      {
        type: "list",
        title: "What a day-of coordinator handles",
        items: [
          "The detailed minute-by-minute timeline of the day, shared with every vendor",
          "Welcoming and setting up vendors (caterer, DJ, florist) at the reception venue",
          "Small hiccups (delays, oversights, technical issues) without informing you unless it's a real emergency",
          "The link between the venue, the vendors, and the witnesses throughout the day",
        ],
      },
      {
        type: "text",
        title: "What they don't do",
        paragraphs: [
          "Unlike full planning, a day-of coordinator generally hasn't sourced your vendors or negotiated your quotes. They take over on a wedding that's already built, which explains their more accessible rate.",
        ],
      },
      {
        type: "list",
        title: "Why it's a smart option",
        items: [
          "The rate stays noticeably lower than full planning, often half or even a third of the price",
          "You keep control over vendor choices and the overall mood, only the day's logistics get delegated",
          "Your witnesses are no longer tied up all day handling deliveries or schedules",
          "You and your loved ones actually enjoy the day instead of answering logistics questions",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Brief your coordinator at least a month ahead, with the full vendor list, their arrival times, and who to contact if something goes wrong. The more precise the brief, the smoother the day runs.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To compare this option to full planning, see our article on [wedding planners: is it worth hiring one](/blog/wedding-planner-faut-il-engager). Prepare the timeline you'll hand to your coordinator directly in your [day-of timeline](/tools/timeline).",
        ],
      },
    ],
  }),
  postPair({
    slug: "repas-mariage-buffet-assis-cocktail",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Repas de mariage : buffet, assis ou cocktail dînatoire",
    titleEn: "Wedding meal: buffet, seated dinner, or cocktail-style reception",
    excerptFr:
      "Coût, formalisme, expérience invités : les avantages et limites de chaque format de repas selon le nombre d'invités et le lieu.",
    excerptEn:
      "Cost, formality, guest experience: the pros and cons of each meal format depending on guest count and venue.",
    readingMinutes: 7,
    heroAltFr: "Repas de mariage buffet ou assis",
    heroAltEn: "Wedding meal buffet or seated",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le format du repas conditionne une bonne partie du budget traiteur, du personnel nécessaire et de l'ambiance de la soirée. Avant de choisir par habitude ou par défaut, mieux vaut comparer les trois formats les plus courants.",
        ],
      },
      {
        type: "list",
        title: "Le repas assis",
        items: [
          "Format le plus formel, avec service à table et menu structuré en plusieurs temps",
          "Nécessite le plus de personnel de service, ce qui pèse sur le budget traiteur",
          "S'accorde bien avec un plan de table classique et un mariage de plus de 80 invités",
          "Rythme la soirée avec des temps calmes (discours, entre les plats) plus faciles à caler",
        ],
      },
      {
        type: "list",
        title: "Le buffet",
        items: [
          "Coût généralement inférieur au repas assis, avec moins de personnel de service",
          "Laisse plus de liberté de circulation aux invités, ambiance plus décontractée",
          "Demande une organisation précise pour éviter la file d'attente et les temps morts",
          "Moins adapté si le lieu ne permet pas une bonne circulation ou si le nombre d'invités est élevé",
        ],
      },
      {
        type: "list",
        title: "Le cocktail dînatoire",
        items: [
          "Format le plus informel, sans repas assis, avec une succession de pièces à picorer toute la soirée",
          "Coût souvent maîtrisé, mais attention aux quantités : il faut prévoir large pour que ça remplace vraiment un repas",
          "Ambiance festive et mobile, apprécié pour un mariage en extérieur ou en journée",
          "Moins adapté aux invités âgés ou aux familles avec enfants qui ont besoin de s'asseoir",
        ],
      },
      {
        type: "text",
        title: "Quel format pour quel mariage",
        paragraphs: [
          "Un repas assis reste le format le plus sûr pour un mariage traditionnel avec de nombreux invités âgés. Un buffet convient à un mariage convivial de taille moyenne, où l'ambiance prime sur le formalisme. Le cocktail dînatoire fonctionne surtout pour une réception courte, en journée, ou un second temps de soirée après un repas plus léger.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Quel que soit le format choisi, demandez toujours au traiteur le nombre de personnes de service prévu sur place. Un buffet mal dimensionné en personnel crée plus d'attente qu'un repas assis classique.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour comparer les devis traiteur selon le format choisi, voir notre guide [comparer les devis traiteur](/blog/comparer-devis-traiteur-mariage). Et pour l'apéritif qui précède, notre article sur le [vin d'honneur](/blog/vin-honneur-cocktail-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The meal format shapes a large part of the caterer budget, the staff needed, and the evening's mood. Before defaulting to habit, it's worth comparing the three most common formats.",
        ],
      },
      {
        type: "list",
        title: "The seated dinner",
        items: [
          "The most formal format, with table service and a menu structured into several courses",
          "Needs the most service staff, which weighs on the caterer budget",
          "Pairs well with a classic seating chart and a wedding of over 80 guests",
          "Paces the evening with calmer moments (speeches, between courses) that are easier to schedule",
        ],
      },
      {
        type: "list",
        title: "The buffet",
        items: [
          "Generally cheaper than a seated dinner, with less service staff",
          "Gives guests more freedom to move around, a more relaxed mood",
          "Needs precise organization to avoid a long line and dead time",
          "Less suited if the venue doesn't allow good flow or the guest count is high",
        ],
      },
      {
        type: "list",
        title: "The cocktail-style reception",
        items: [
          "The most informal format, no seated meal, a steady stream of bites to graze on all evening",
          "Cost is often kept in check, but watch the quantities: you need to plan generously for it to really replace a meal",
          "A festive, mobile mood, well suited to an outdoor or daytime wedding",
          "Less suited to older guests or families with children who need to sit down",
        ],
      },
      {
        type: "text",
        title: "Which format fits which wedding",
        paragraphs: [
          "A seated dinner remains the safest format for a traditional wedding with many older guests. A buffet suits a mid-sized, convivial wedding where mood matters more than formality. A cocktail-style reception works best for a short, daytime reception, or a second evening act after a lighter meal.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Whatever format you choose, always ask the caterer how many service staff will be on site. An understaffed buffet creates more waiting than a classic seated dinner.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To compare caterer quotes based on the format you choose, see our guide on [comparing caterer quotes](/blog/comparer-devis-traiteur-mariage). And for the cocktail hour beforehand, our article on the [vin d'honneur](/blog/vin-honneur-cocktail-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "food-truck-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Food truck au mariage : quand ça marche, quand ça coince",
    titleEn: "Food truck at a wedding: when it works, when it doesn't",
    excerptFr:
      "Bon plan pour un mariage décontracté en extérieur, à condition de gérer la logistique et le nombre d'invités.",
    excerptEn:
      "A great fit for a casual outdoor wedding, as long as you handle the logistics and guest count.",
    readingMinutes: 6,
    heroAltFr: "Food truck lors d'un mariage",
    heroAltEn: "Food truck at a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le food truck a le vent en poupe pour les mariages décontractés, notamment en extérieur ou pour une deuxième partie de soirée. Mais ce format a des limites concrètes qu'il vaut mieux connaître avant de s'engager.",
        ],
      },
      {
        type: "list",
        title: "Où le food truck fonctionne bien",
        items: [
          "Un mariage en extérieur, jardin, domaine ou lieu champêtre avec assez d'espace pour le stationner",
          "Une réception décontractée où l'ambiance compte plus que le formalisme d'un repas assis",
          "Un second service en soirée, après un repas plus léger, pour caler un petit creux vers minuit",
          "Un mariage avec un budget traiteur serré, le format reste souvent moins cher qu'un repas assis complet",
        ],
      },
      {
        type: "list",
        title: "Les points de logistique à vérifier",
        items: [
          "Accès électrique suffisant sur place, beaucoup de food trucks ont besoin d'un branchement dédié",
          "Espace de stationnement et de manœuvre, certains lieux de réception ont un accès restreint pour un véhicule de cette taille",
          "Temps de service par personne : un mariage de 150 invités peut créer une file d'attente longue avec un seul truck",
          "Autorisation du lieu de réception, certains domaines imposent leur propre traiteur en exclusivité",
        ],
      },
      {
        type: "text",
        title: "Quand ce n'est pas le bon choix",
        paragraphs: [
          "Pour une réception assise et formelle de grande taille, un ou deux food trucks ne suffisent généralement pas à servir tout le monde dans un temps raisonnable. Le format perd aussi de son charme si les invités doivent faire la queue longtemps en tenue de soirée.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Demandez toujours au food truck son temps de service moyen par plat et prévoyez plusieurs trucks au-delà de 100 invités plutôt qu'un seul débordé toute la soirée.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour comparer ce format à un buffet ou un repas assis plus classique, voir notre article [buffet, assis ou cocktail dînatoire](/blog/repas-mariage-buffet-assis-cocktail). Pour maîtriser ce poste budget, notre guide [mariage petit budget](/blog/mariage-petit-budget-10-conseils).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The food truck is having a moment for casual weddings, especially outdoors or for a second act late in the evening. But this format has real limits worth knowing before you commit.",
        ],
      },
      {
        type: "list",
        title: "Where the food truck works well",
        items: [
          "An outdoor wedding, garden, estate, or countryside venue with enough space to park it",
          "A casual reception where mood matters more than the formality of a seated meal",
          "A second evening service, after a lighter meal, to fill a small gap around midnight",
          "A wedding with a tight caterer budget, the format is often cheaper than a full seated meal",
        ],
      },
      {
        type: "list",
        title: "Logistics points to check",
        items: [
          "Enough power on site, many food trucks need a dedicated hookup",
          "Parking and maneuvering space, some venues have limited access for a vehicle this size",
          "Service time per person: a wedding of 150 guests can create a long line with a single truck",
          "Venue authorization, some estates require their own caterer exclusively",
        ],
      },
      {
        type: "text",
        title: "When it's not the right choice",
        paragraphs: [
          "For a large, formal seated reception, one or two food trucks generally can't serve everyone in a reasonable time. The format also loses its charm if guests have to queue for a long time in evening wear.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always ask the food truck its average service time per dish, and plan for several trucks past 100 guests rather than one overwhelmed for the whole evening.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To compare this format to a more classic buffet or seated dinner, see our article on [buffet, seated dinner, or cocktail-style](/blog/repas-mariage-buffet-assis-cocktail). To keep this budget line under control, our guide on [wedding on a small budget](/blog/mariage-petit-budget-10-conseils).",
        ],
      },
    ],
  }),
  postPair({
    slug: "traiteur-vegetarien-vegan-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Menu végétarien ou vegan : contenter tout le monde",
    titleEn: "Vegetarian or vegan menu: keeping everyone happy",
    excerptFr:
      "La demande de menus végétariens et vegan augmente : comment interroger son traiteur et éviter l'assiette triste isolée.",
    excerptEn:
      "Demand for vegetarian and vegan menus is rising: how to question your caterer and avoid the sad, isolated plate.",
    readingMinutes: 6,
    heroAltFr: "Menu végétarien mariage",
    heroAltEn: "Vegetarian wedding menu",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La part d'invités végétariens ou vegan à un mariage a nettement augmenté ces dernières années. Beaucoup de traiteurs traditionnels n'ont pourtant pas encore adapté leur carte, ce qui peut créer un mauvais moment pour quelques invités le jour J.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'il faut demander à un traiteur",
        items: [
          "Propose-t-il un menu végétarien ou vegan complet, ou seulement une adaptation du menu principal",
          "Ce menu suit-il le même niveau de soin que le menu carné (présentation, nombre de plats, créativité)",
          "Peut-il indiquer un nombre approximatif de couverts végétariens qu'il gère habituellement sans surcoût",
          "Comment les allergènes croisés sont-ils évités en cuisine (ustensiles séparés, zone dédiée)",
        ],
      },
      {
        type: "text",
        title: "Le problème de l'assiette triste",
        paragraphs: [
          "Le piège classique : une salade composée basique pendant que les autres invités ont un menu à trois services soignés. Un bon traiteur pense le menu végétarien comme un menu à part entière, pas comme une case à cocher en dernière minute.",
        ],
      },
      {
        type: "list",
        title: "Bien collecter les besoins en amont",
        items: [
          "Intégrez une question précise sur le régime alimentaire dans votre formulaire de RSVP, pas juste une case « allergies »",
          "Distinguez végétarien, vegan et intolérances, ce ne sont pas les mêmes contraintes en cuisine",
          "Transmettez le décompte final au traiteur au moins deux semaines avant, jamais la veille",
          "Prévoyez une petite marge de couverts supplémentaires, certains invités changent d'avis ou oublient de répondre",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Faites goûter le menu végétarien lors de la dégustation traiteur au même titre que le menu principal, pas comme une option annexe survolée en fin de rendez-vous.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour centraliser précisément les régimes alimentaires de vos invités, voir notre guide [gérer plus d'un enfant et les régimes alimentaires](/blog/gerer-plus-un-enfants-regimes-alimentaires). Et pour préparer la dégustation elle-même, notre article [dégustation traiteur](/blog/degustation-traiteur-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The share of vegetarian or vegan guests at a wedding has clearly grown in recent years. Many traditional caterers still haven't adapted their menu, which can leave a few guests with a rough time on the day.",
        ],
      },
      {
        type: "list",
        title: "What to ask a caterer",
        items: [
          "Do they offer a full vegetarian or vegan menu, or just an adaptation of the main menu",
          "Does that menu get the same level of care as the meat menu (presentation, number of courses, creativity)",
          "Can they give an approximate number of vegetarian covers they usually handle at no extra cost",
          "How are cross-contaminated allergens avoided in the kitchen (separate utensils, dedicated area)",
        ],
      },
      {
        type: "text",
        title: "The sad-plate problem",
        paragraphs: [
          "The classic trap: a basic mixed salad while other guests get a carefully crafted three-course menu. A good caterer treats the vegetarian menu as a menu in its own right, not a last-minute box to tick.",
        ],
      },
      {
        type: "list",
        title: "Collecting needs properly upfront",
        items: [
          "Add a precise dietary question to your RSVP form, not just an \"allergies\" checkbox",
          "Distinguish vegetarian, vegan, and intolerances, they're not the same constraint in the kitchen",
          "Send the final count to the caterer at least two weeks ahead, never the day before",
          "Plan a small margin of extra covers, some guests change their mind or forget to reply",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Have the vegetarian menu tasted at the caterer tasting on equal footing with the main menu, not as a side option skimmed at the end of the appointment.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To centralize your guests' dietary needs precisely, see our guide on [managing more than one child and dietary needs](/blog/gerer-plus-un-enfants-regimes-alimentaires). And to prepare the tasting itself, our article on the [caterer tasting](/blog/degustation-traiteur-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "menu-enfants-mariage",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Menu et repas des enfants : simple et sans gâchis",
    titleEn: "Children's menu and meals: simple and no waste",
    excerptFr:
      "Menu allégé, horaires décalés, comptage précis : comment gérer les repas des enfants sans surcoût ni gaspillage.",
    excerptEn:
      "A lighter menu, earlier timing, accurate counts: how to handle kids' meals without overspending or wasting food.",
    readingMinutes: 5,
    heroAltFr: "Menu enfant mariage",
    heroAltEn: "Children's wedding menu",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un menu enfant coûte presque toujours moins cher qu'un menu adulte, mais encore faut-il le prévoir précisément. Trop de couples découvrent le sujet seulement quand le traiteur pose la question, une semaine avant le mariage.",
        ],
      },
      {
        type: "list",
        title: "Pourquoi un menu enfant simplifié",
        items: [
          "Les enfants finissent rarement un menu à trois services identique à celui des adultes",
          "Un menu plus simple (type pâtes, nuggets, légumes) réduit le gaspillage en cuisine",
          "Le coût par couvert enfant est généralement inférieur de 30 à 50 % au tarif adulte",
          "Un menu plus court permet aussi de servir les enfants plus vite, avant qu'ils ne s'agitent",
        ],
      },
      {
        type: "list",
        title: "Décaler les horaires, une astuce simple",
        items: [
          "Servir les enfants quinze à vingt minutes avant les adultes évite l'attente qui les rend impatients",
          "Cela libère aussi le personnel de service pour se concentrer ensuite sur le repas principal",
          "Prévoyez une activité courte pendant ce temps (coloriage, jeu) pour occuper les enfants entre les deux services",
        ],
      },
      {
        type: "text",
        title: "Compter précisément, pas approximativement",
        paragraphs: [
          "Le nombre d'enfants présents doit apparaître clairement dans votre RSVP, avec leur âge si possible : un traiteur adapte rarement le même menu à un enfant de trois ans et à un adolescent de quatorze ans. Un décompte flou se traduit soit par du gaspillage, soit par un manque de couverts le jour J.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Vérifiez avec le traiteur l'âge à partir duquel un enfant passe au tarif adulte, ce seuil varie d'un prestataire à l'autre et peut surprendre sur la facture finale.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour centraliser l'âge et les besoins de chaque enfant invité, voir notre guide [gérer plus d'un enfant et les régimes alimentaires](/blog/gerer-plus-un-enfants-regimes-alimentaires). Si vous prévoyez aussi un menu végétarien à part, notre article [menu végétarien ou vegan](/blog/traiteur-vegetarien-vegan-mariage) complète ce sujet.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A children's menu almost always costs less than an adult one, but it still needs precise planning. Too many couples only discover this when the caterer asks, a week before the wedding.",
        ],
      },
      {
        type: "list",
        title: "Why a simplified children's menu",
        items: [
          "Children rarely finish a three-course menu identical to the adults'",
          "A simpler menu (pasta, nuggets, vegetables) reduces kitchen waste",
          "The cost per child cover is generally 30 to 50% below the adult rate",
          "A shorter menu also lets kids be served faster, before they get restless",
        ],
      },
      {
        type: "list",
        title: "Shifting the timing, a simple trick",
        items: [
          "Serving children fifteen to twenty minutes before the adults avoids the wait that makes them impatient",
          "It also frees up service staff to then focus on the main meal",
          "Plan a short activity during that gap (coloring, a game) to keep kids busy between the two services",
        ],
      },
      {
        type: "text",
        title: "Count precisely, not roughly",
        paragraphs: [
          "The number of children attending should appear clearly on your RSVP, with their age if possible: a caterer rarely serves the same menu to a three-year-old and a fourteen-year-old. A vague count leads either to waste or to too few covers on the day.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Check with the caterer the age at which a child moves to the adult rate, this threshold varies by vendor and can be a surprise on the final bill.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To centralize each invited child's age and needs, see our guide on [managing more than one child and dietary needs](/blog/gerer-plus-un-enfants-regimes-alimentaires). If you're also planning a separate vegetarian menu, our article on [vegetarian or vegan menus](/blog/traiteur-vegetarien-vegan-mariage) rounds this out.",
        ],
      },
    ],
  }),
  postPair({
    slug: "boissons-mariage-champagne-quantites",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Boissons : quelles quantités, quel champagne, quel budget",
    titleEn: "Drinks: how much to buy, which champagne, what budget",
    excerptFr:
      "Repères de quantités par invité, budget dédié aux boissons, et comment choisir entre open bar et consommation limitée.",
    excerptEn:
      "Guest-count rules of thumb, a dedicated drinks budget, and how to choose between open bar and limited consumption.",
    readingMinutes: 6,
    heroAltFr: "Boissons et champagne pour un mariage",
    heroAltEn: "Wedding drinks and champagne",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les boissons forment souvent un poste flou dans le budget mariage, noyé dans le forfait traiteur ou oublié jusqu'au dernier moment. Un minimum de calcul évite à la fois le gaspillage et la pénurie en fin de soirée.",
        ],
      },
      {
        type: "list",
        title: "Quantités repères par invité",
        items: [
          "Vin d'honneur : comptez environ une demi-bouteille de champagne ou vin par personne pour deux heures",
          "Repas : environ une demi-bouteille de vin par convive, à répartir entre rouge et blanc selon le menu",
          "Toast et discours : une coupe de champagne par personne suffit généralement, prévoir un peu de marge",
          "Soirée : comptez environ deux à trois consommations supplémentaires par invité au bar",
        ],
      },
      {
        type: "text",
        title: "Budgéter les boissons comme un poste à part",
        paragraphs: [
          "Isolez ce poste dans votre suivi budget plutôt que de le laisser fondu dans le forfait traiteur. Cela permet de comparer plus facilement acheter en direct auprès d'un caviste (souvent moins cher, avec reprise des bouteilles non ouvertes) et faire fournir par le traiteur.",
        ],
      },
      {
        type: "list",
        title: "Open bar ou consommation limitée",
        items: [
          "Un open bar simplifie la logistique mais peut faire grimper la facture sans plafond clair",
          "Une formule à consommation limitée (nombre de coupons ou horaire défini) garde le budget maîtrisé",
          "Un forfait par personne avec plafond horaire reste un bon compromis entre les deux",
          "Précisez toujours par écrit ce qui est inclus (alcools, softs, eau) pour éviter les surprises en fin de soirée",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Demandez systématiquement au caviste ou au traiteur la possibilité de reprendre les bouteilles non entamées. Cette clause seule peut faire économiser plusieurs centaines d'euros sur un mariage de taille moyenne.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour trancher entre les deux formules, notre guide [open bar ou consommation](/blog/open-bar-ou-consommation-mariage) détaille les avantages de chaque option. Pour le vin d'honneur en particulier, voir [vin d'honneur et cocktail](/blog/vin-honneur-cocktail-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Drinks are often a fuzzy line in the wedding budget, buried in the caterer package or forgotten until the last moment. A bit of math avoids both waste and running out late in the evening.",
        ],
      },
      {
        type: "list",
        title: "Guideline quantities per guest",
        items: [
          "Cocktail hour: count roughly half a bottle of champagne or wine per person for two hours",
          "Meal: roughly half a bottle of wine per guest, split between red and white depending on the menu",
          "Toast and speeches: one glass of champagne per person is usually enough, plan a small margin",
          "Evening: count roughly two to three extra drinks per guest at the bar",
        ],
      },
      {
        type: "text",
        title: "Budget drinks as their own line",
        paragraphs: [
          "Isolate this line in your budget tracking rather than letting it blend into the caterer package. That makes it easier to compare buying directly from a wine merchant (often cheaper, with unopened bottles taken back) against having the caterer supply everything.",
        ],
      },
      {
        type: "list",
        title: "Open bar or limited consumption",
        items: [
          "An open bar simplifies logistics but can push the bill up with no clear cap",
          "A limited-consumption formula (a set number of tokens or a fixed time window) keeps the budget in check",
          "A per-person package with a time cap remains a good middle ground between the two",
          "Always specify in writing what's included (spirits, soft drinks, water) to avoid surprises late in the evening",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always ask the wine merchant or caterer whether unopened bottles can be taken back. That clause alone can save several hundred euros on a mid-sized wedding.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To decide between the two formulas, our guide on [open bar or consumption](/blog/open-bar-ou-consommation-mariage) details the pros of each option. For the cocktail hour specifically, see [vin d'honneur and cocktail hour](/blog/vin-honneur-cocktail-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "bar-a-cocktails-mariage",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Bar à cocktails et boissons signature au mariage",
    titleEn: "Cocktail bar and signature drinks at your wedding",
    excerptFr:
      "Cocktail signature aux couleurs du couple, staffing d'un bar, et comparaison de budget avec un open bar classique.",
    excerptEn:
      "A signature cocktail named for the couple, staffing a bar, and how the budget compares to a classic open bar.",
    readingMinutes: 5,
    heroAltFr: "Bar à cocktails de mariage",
    heroAltEn: "Wedding cocktail bar",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un bar à cocktails apporte un vrai moment de spectacle à la soirée, entre le geste du barman et la couleur des verres. C'est aussi un poste qui se budgète différemment d'un open bar classique.",
        ],
      },
      {
        type: "list",
        title: "Le cocktail signature, une idée simple et marquante",
        items: [
          "Un cocktail créé spécialement pour le couple, souvent baptisé d'un jeu de mots sur les deux prénoms",
          "Peut s'inspirer d'un souvenir commun (lieu de rencontre, voyage, boisson préférée d'un des deux mariés)",
          "Se décline aussi en version sans alcool pour les invités qui ne boivent pas",
          "Un signe distinctif simple (couleur, décor du verre) suffit à le rendre mémorable sans complexifier la carte",
        ],
      },
      {
        type: "list",
        title: "Staffer un bar correctement",
        items: [
          "Comptez un barman pour environ 50 à 70 invités afin d'éviter une file d'attente trop longue",
          "Vérifiez que le prestataire apporte son propre matériel (shaker, verres, glace) ou si c'est à votre charge",
          "Un bar mobile ou une caravane à cocktails ajoute un effet visuel, mais demande plus d'espace et d'accès électrique",
          "Prévoyez une carte courte (trois à quatre cocktails maximum) pour garder un service rapide",
        ],
      },
      {
        type: "text",
        title: "Comparer au budget d'un open bar classique",
        paragraphs: [
          "Un bar à cocktails avec barman dédié coûte généralement plus cher qu'un open bar simple avec alcools en libre-service, du fait du personnel et de la technicité. L'écart se justifie surtout si l'animation elle-même fait partie de l'expérience recherchée pour la soirée.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Faites toujours goûter le cocktail signature avant le mariage, y compris sa version sans alcool. Un dosage mal calibré passe difficilement inaperçu sur cent verres servis.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour calculer vos quantités globales de boissons avant d'ajouter ce poste, voir notre guide [boissons, champagne et quantités](/blog/boissons-mariage-champagne-quantites). Et pour choisir la formule de service la mieux adaptée, notre article [open bar ou consommation](/blog/open-bar-ou-consommation-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A cocktail bar brings a real bit of spectacle to the evening, between the bartender's flair and the color of the glasses. It's also a line that gets budgeted differently from a classic open bar.",
        ],
      },
      {
        type: "list",
        title: "The signature cocktail, a simple, memorable idea",
        items: [
          "A cocktail created specifically for the couple, often named with a pun on both first names",
          "Can draw on a shared memory (where you met, a trip, one partner's favorite drink)",
          "Also comes in a non-alcoholic version for guests who don't drink",
          "One simple distinguishing touch (color, glass decoration) is enough to make it memorable without complicating the menu",
        ],
      },
      {
        type: "list",
        title: "Staffing a bar properly",
        items: [
          "Count one bartender for roughly 50 to 70 guests to avoid too long a line",
          "Check whether the vendor brings their own equipment (shaker, glasses, ice) or if that's on you",
          "A mobile bar or cocktail caravan adds visual appeal but needs more space and power access",
          "Plan a short menu (three to four cocktails max) to keep service fast",
        ],
      },
      {
        type: "text",
        title: "Comparing it to a classic open bar budget",
        paragraphs: [
          "A cocktail bar with a dedicated bartender generally costs more than a simple self-serve open bar, due to staffing and skill involved. The gap is mostly justified if the entertainment itself is part of the experience you want for the evening.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always have the signature cocktail tasted before the wedding, including its non-alcoholic version. A poorly balanced recipe is hard to hide across a hundred glasses served.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To work out your overall drink quantities before adding this line, see our guide on [drinks, champagne, and quantities](/blog/boissons-mariage-champagne-quantites). And to choose the best-suited service formula, our article on [open bar or consumption](/blog/open-bar-ou-consommation-mariage).",
        ],
      },
    ],
  }),
  postPair({
    slug: "dessert-bar-alternatives-piece-montee",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Dessert bar et alternatives à la pièce montée",
    titleEn: "Dessert bars and alternatives to the traditional croquembouche",
    excerptFr:
      "Table de mini-desserts, candy bar, options qui changent de la pièce montée traditionnelle : ce qui plaît et ce que ça coûte.",
    excerptEn:
      "Mini-dessert tables, candy bars, options beyond the traditional croquembouche: what guests love and what it costs.",
    readingMinutes: 6,
    heroAltFr: "Dessert bar de mariage",
    heroAltEn: "Wedding dessert bar",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La pièce montée reste une valeur sûre, mais de plus en plus de couples la complètent ou la remplacent par un dessert bar. L'idée : plusieurs petites gourmandises plutôt qu'un seul gros gâteau à découper.",
        ],
      },
      {
        type: "list",
        title: "Formats de dessert bar courants",
        items: [
          "Table de mini-desserts (tartelettes, verrines, macarons) à picorer librement pendant la soirée",
          "Candy bar avec bonbons et confiseries, souvent aux couleurs du mariage, apprécié des plus jeunes invités",
          "Bar à churros ou crêpes préparés en direct, effet convivial et odeur qui attire naturellement les invités",
          "Mini-gâteaux individuels qui reprennent visuellement la pièce montée en version portionnée",
        ],
      },
      {
        type: "text",
        title: "Ce que ça change par rapport à la pièce montée seule",
        paragraphs: [
          "Un dessert bar offre plus de variété, ce qui plaît à un groupe d'invités aux goûts différents. Il demande en revanche plus d'espace de présentation et souvent un peu plus de personnel pour le réassort pendant la soirée.",
        ],
      },
      {
        type: "list",
        title: "Comparer le budget",
        items: [
          "Une pièce montée classique reste souvent l'option la moins chère au nombre de couverts",
          "Un dessert bar varié coûte généralement plus cher, la variété se paie en travail de préparation",
          "Une solution intermédiaire : garder une pièce montée en dessert du repas, et ajouter un mini dessert bar uniquement pour la soirée",
          "Le format préparé en direct (churros, crêpes) ajoute un coût logistique mais réduit le gaspillage, tout est fait à la demande",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Le dessert bar attire une file d'attente naturelle en début de soirée, prévoyez de le positionner à un endroit qui n'entrave pas la piste de danse.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour les options plus classiques de gâteau, voir notre guide [pièce montée et gâteau de mariage](/blog/gateau-piece-montee-mariage). Suivez ce poste dessert dans votre [budget](/tools/budget-calculator) pour comparer les devis facilement.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The croquembouche remains a safe bet, but more and more couples complement or replace it with a dessert bar. The idea: several small treats rather than one big cake to cut.",
        ],
      },
      {
        type: "list",
        title: "Common dessert bar formats",
        items: [
          "A table of mini desserts (tartlets, verrines, macarons) to graze on freely through the evening",
          "A candy bar with sweets and confectionery, often in the wedding colors, a hit with younger guests",
          "A churro or crepe bar made live, a convivial touch and a smell that naturally draws guests in",
          "Individual mini cakes that visually echo the croquembouche in a portioned version",
        ],
      },
      {
        type: "text",
        title: "What changes compared to the croquembouche alone",
        paragraphs: [
          "A dessert bar offers more variety, which suits a group of guests with different tastes. It does need more display space and usually a bit more staff to restock through the evening.",
        ],
      },
      {
        type: "list",
        title: "Comparing the budget",
        items: [
          "A classic croquembouche often remains the cheapest option per cover",
          "A varied dessert bar generally costs more, the variety is paid for in prep work",
          "A middle ground: keep a croquembouche as the meal's dessert, and add a small dessert bar for the evening only",
          "A live-made format (churros, crepes) adds a logistics cost but cuts waste, since everything is made to order",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The dessert bar naturally draws a line early in the evening, plan to place it somewhere that doesn't block the dance floor.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For more classic cake options, see our guide on [wedding cake and croquembouche](/blog/gateau-piece-montee-mariage). Track this dessert line in your [budget](/tools/budget-calculator) to compare quotes easily.",
        ],
      },
    ],
  }),

  postPair({
    slug: "groupe-live-ou-dj-mariage",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Groupe live ou DJ : quel choix pour la soirée",
    titleEn: "Live band or DJ: which is right for your reception",
    excerptFr:
      "Ambiance, coût, logistique : les vrais critères pour choisir entre un groupe live et un DJ, et l'option hybride qui combine les deux.",
    excerptEn:
      "Atmosphere, cost, logistics: the real criteria for choosing between a live band and a DJ, plus the hybrid option combining both.",
    readingMinutes: 7,
    heroAltFr: "Groupe live ou DJ pour un mariage",
    heroAltEn: "Live band or DJ for a wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le choix entre groupe live et DJ revient presque toujours dans les premières discussions sur l'animation musicale. Les deux ont leurs forces, et la bonne réponse dépend surtout du lieu et de l'ambiance recherchée.",
        ],
      },
      {
        type: "list",
        title: "Les atouts d'un groupe live",
        items: [
          "Une énergie et une présence scénique qu'un DJ seul ne reproduit pas",
          "Un vrai spectacle pendant le cocktail ou le début de soirée, avant que la piste ne s'ouvre",
          "Une capacité d'adaptation en direct à l'ambiance de la salle, un bon groupe sent quand relancer",
          "Un répertoire souvent plus limité en nombre de titres qu'un DJ, à vérifier avant de signer",
        ],
      },
      {
        type: "list",
        title: "Les atouts d'un DJ",
        items: [
          "Un répertoire quasiment illimité, capable de suivre les demandes des invités en temps réel",
          "Un coût généralement inférieur à un groupe live, surtout pour une soirée complète",
          "Moins d'espace et de matériel nécessaires sur place, logistique plus simple pour la salle",
          "Une continuité musicale sans pause entre les morceaux, utile pour ne jamais vider la piste",
        ],
      },
      {
        type: "text",
        title: "Les contraintes logistiques à anticiper",
        paragraphs: [
          "Un groupe live nécessite plus d'espace scénique et souvent une alimentation électrique dédiée, à vérifier avec le lieu de réception avant de signer. Certains lieux limitent aussi le volume sonore ou l'horaire de fin, ce qui pèse différemment sur un groupe et sur un DJ.",
        ],
      },
      {
        type: "list",
        title: "L'option hybride",
        items: [
          "Un DJ pour l'essentiel de la soirée, avec un musicien (violoniste, saxophoniste) pour des moments clés comme l'entrée des mariés ou la première danse",
          "Un groupe live pour le début de soirée ou le cocktail, suivi d'un DJ pour la suite de la nuit",
          "Cette formule combine l'effet scénique du live et la flexibilité du DJ, à un coût intermédiaire",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour choisir et comparer plusieurs DJ, voir notre guide [choisir son DJ de mariage](/blog/choisir-dj-mariage). Et pour préparer la liste des titres incontournables, notre article [construire sa playlist de mariage](/blog/playlist-mariage-construire).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The choice between a live band and a DJ almost always comes up in the first conversations about music. Both have their strengths, and the right answer mostly depends on the venue and the mood you're after.",
        ],
      },
      {
        type: "list",
        title: "The strengths of a live band",
        items: [
          "An energy and stage presence a DJ alone can't replicate",
          "A real show during the cocktail hour or the start of the evening, before the dance floor opens",
          "The ability to adapt live to the room's mood, a good band senses when to bring the energy back up",
          "A repertoire often more limited in number of songs than a DJ's, worth checking before signing",
        ],
      },
      {
        type: "list",
        title: "The strengths of a DJ",
        items: [
          "A nearly unlimited repertoire, able to follow guest requests in real time",
          "Generally lower cost than a live band, especially for a full evening",
          "Less space and equipment needed on site, simpler logistics for the venue",
          "Seamless musical continuity with no gap between songs, useful for never emptying the dance floor",
        ],
      },
      {
        type: "text",
        title: "Logistics constraints to anticipate",
        paragraphs: [
          "A live band needs more stage space and often a dedicated power supply, worth checking with the venue before signing. Some venues also cap sound volume or the end time, which affects a band and a DJ differently.",
        ],
      },
      {
        type: "list",
        title: "The hybrid option",
        items: [
          "A DJ for most of the evening, with a musician (violinist, saxophonist) for key moments like the couple's entrance or the first dance",
          "A live band for the start of the evening or the cocktail hour, followed by a DJ for the rest of the night",
          "This formula combines the live show's impact with the DJ's flexibility, at a mid-range cost",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To choose and compare several DJs, see our guide on [choosing your wedding DJ](/blog/choisir-dj-mariage). And to prepare your must-play song list, our article on [building your wedding playlist](/blog/playlist-mariage-construire).",
        ],
      },
    ],
  }),
  postPair({
    slug: "ouverture-de-bal-choregraphie",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Ouverture de bal : préparer sa chorégraphie sans stress",
    titleEn: "First dance: preparing your choreography without the stress",
    excerptFr:
      "Simple ou chorégraphiée, combien de temps de préparation prévoir réellement, et comment choisir la musique sans pression de perfection.",
    excerptEn:
      "Simple or choreographed, how much practice time you actually need, and how to pick the music without chasing perfection.",
    readingMinutes: 6,
    heroAltFr: "Ouverture de bal mariage",
    heroAltEn: "Wedding first dance",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "L'ouverture de bal fait partie des moments les plus filmés et les plus redoutés de la soirée. Entre le couple qui rêve d'une chorégraphie mémorable et celui qui préférerait l'éviter complètement, il existe toutes les options intermédiaires.",
        ],
      },
      {
        type: "list",
        title: "Simple ou chorégraphiée : les deux options valables",
        items: [
          "Une danse simple, sans figures particulières, qui suit juste le rythme de la musique et le naturel du couple",
          "Une chorégraphie apprise avec quelques pas marquants, sans viser un niveau de compétition",
          "Un enchaînement plus élaboré avec changement de rythme, pour les couples qui aiment vraiment danser",
          "Aucune de ces options n'est plus « valable » qu'une autre, le seul critère est votre propre niveau de confort",
        ],
      },
      {
        type: "text",
        title: "Combien de temps prévoir réellement",
        paragraphs: [
          "Une chorégraphie simple avec quelques pas coordonnés se travaille en général sur trois à quatre séances d'une heure, réparties sur trois à quatre semaines. Inutile de viser plus tôt : plus l'entraînement s'étale dans le temps, plus les pas s'oublient entre deux séances.",
        ],
      },
      {
        type: "list",
        title: "Choisir la musique",
        items: [
          "Une chanson qui a du sens pour vous deux compte plus qu'un tempo parfaitement dansable",
          "Vérifiez la durée du morceau, une version raccourcie à deux minutes trente évite l'essoufflement sur la piste",
          "Un medley de deux titres permet de changer d'ambiance en cours de danse sans repartir de zéro",
          "Testez le morceau sur la vraie sonorisation si possible, un rendu différent peut changer le rythme ressenti",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ne visez pas la perfection technique, visez le moment partagé. Les invités retiennent rarement les erreurs de pas, ils retiennent l'émotion du couple qui danse.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour aller plus loin sur la préparation de ce moment, voir notre guide complet [préparer sa première danse](/blog/premiere-danse-mariage-preparer). Et pour la suite de la soirée musicale, notre article [construire sa playlist](/blog/playlist-mariage-construire).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The first dance is one of the most filmed, most dreaded moments of the evening. Between the couple dreaming of a memorable choreography and the one who'd rather skip it entirely, every option in between is fair game.",
        ],
      },
      {
        type: "list",
        title: "Simple or choreographed: both are valid",
        items: [
          "A simple dance, no particular figures, just following the music's rhythm and the couple's natural feel",
          "A learned choreography with a few standout steps, with no aim of competition-level polish",
          "A more elaborate routine with a tempo change, for couples who genuinely love to dance",
          "None of these options is more \"valid\" than another, the only criterion is your own comfort level",
        ],
      },
      {
        type: "text",
        title: "How much time to actually plan",
        paragraphs: [
          "A simple choreography with a few coordinated steps is usually worked out over three to four one-hour sessions, spread across three to four weeks. No need to start earlier: the longer training stretches out, the more the steps get forgotten between sessions.",
        ],
      },
      {
        type: "list",
        title: "Choosing the music",
        items: [
          "A song that means something to the two of you matters more than a perfectly danceable tempo",
          "Check the track's length, a shortened two-and-a-half-minute version avoids running out of steam on the floor",
          "A mashup of two songs lets you shift the mood mid-dance without starting from scratch",
          "Test the track on the real sound system if possible, a different playback can change how the tempo feels",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Don't aim for technical perfection, aim for the shared moment. Guests rarely remember missed steps, they remember the emotion of the couple dancing.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For more on preparing this moment, see our complete guide on [preparing your first dance](/blog/premiere-danse-mariage-preparer). And for the rest of the evening's music, our article on [building your wedding playlist](/blog/playlist-mariage-construire).",
        ],
      },
    ],
  }),

  postPair({
    slug: "animations-soiree-mariage-idees",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Animations de soirée : idées qui font lever la piste",
    titleEn: "Evening entertainment: ideas that actually fill the dance floor",
    excerptFr:
      "Performance surprise, jeux, photobooth : des idées concrètes d'animation, et comment les répartir sans surcharger la soirée.",
    excerptEn:
      "Surprise performances, games, photobooths: concrete entertainment ideas, and how to pace them without overloading the evening.",
    readingMinutes: 6,
    heroAltFr: "Animations de soirée de mariage",
    heroAltEn: "Wedding evening entertainment",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Une bonne animation de soirée ne se résume pas à enchaîner les activités. L'objectif est de créer des pics d'énergie à des moments choisis, sans jamais couper l'élan de la piste de danse.",
        ],
      },
      {
        type: "list",
        title: "Idées d'animations qui fonctionnent",
        items: [
          "Une performance surprise préparée par les témoins ou la famille (chorégraphie, sketch, chanson)",
          "Un jeu de connaissance du couple, façon quiz, pour faire participer toute la salle sans effort physique",
          "Un lâcher de confettis ou de lumières coordonné avec un moment musical fort",
          "Un feu d'artifice ou des fontaines d'étincelles en fin de soirée, si le lieu et le budget le permettent",
          "Un photobooth avec accessoires, en accès libre toute la soirée plutôt qu'à un horaire imposé",
        ],
      },
      {
        type: "text",
        title: "Ne pas surcharger la soirée",
        paragraphs: [
          "Trois à quatre animations bien placées valent mieux que dix activités qui se marchent dessus. Trop d'animations fragmentent la soirée et empêchent la piste de danse de vraiment s'installer sur la durée.",
        ],
      },
      {
        type: "list",
        title: "Bien répartir dans le temps",
        items: [
          "Placez les animations les plus calmes (jeux, discours) avant le repas ou entre les plats",
          "Réservez les animations les plus festives (surprise, feu d'artifice) après le repas, quand l'énergie remonte",
          "Laissez de longues plages sans animation prévue pour que la piste de danse tourne sans interruption",
          "Prévenez le DJ ou le groupe de chaque timing pour qu'il coupe la musique au bon moment",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Confiez la coordination des animations à une seule personne (témoin ou coordinateur jour J) qui connaît l'ordre exact de la soirée. Une surprise mal timée casse plus d'ambiance qu'elle n'en crée.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour les idées autour du photobooth et du livre d'or, voir notre guide [photobooth, livre d'or et animations](/blog/photobooth-livre-or-animations). Et pour un choix musical adapté à ces moments, notre article [groupe live ou DJ](/blog/groupe-live-ou-dj-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Good evening entertainment isn't just about stacking up activities. The goal is to create energy peaks at chosen moments, without ever breaking the dance floor's momentum.",
        ],
      },
      {
        type: "list",
        title: "Entertainment ideas that work",
        items: [
          "A surprise performance prepared by the witnesses or family (choreography, sketch, song)",
          "A quiz-style game about the couple, to get the whole room involved with no physical effort",
          "A confetti or light drop timed to a big musical moment",
          "Fireworks or spark fountains at the end of the evening, if the venue and budget allow",
          "A photobooth with props, open all evening rather than at a fixed time",
        ],
      },
      {
        type: "text",
        title: "Don't overload the evening",
        paragraphs: [
          "Three to four well-placed activities beat ten that trip over each other. Too much entertainment fragments the evening and keeps the dance floor from ever really settling in over time.",
        ],
      },
      {
        type: "list",
        title: "Spacing it out well",
        items: [
          "Place calmer activities (games, speeches) before the meal or between courses",
          "Save the more festive ones (surprise, fireworks) for after the meal, when energy picks back up",
          "Leave long stretches with nothing planned so the dance floor can run without interruption",
          "Tell the DJ or band each timing so they cut the music at the right moment",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Hand entertainment coordination to a single person (a witness or day-of coordinator) who knows the evening's exact order. A badly timed surprise kills more mood than it creates.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For ideas around the photobooth and guestbook, see our guide on [photobooth, guestbook, and entertainment](/blog/photobooth-livre-or-animations). And for music suited to these moments, our article on [live band or DJ](/blog/groupe-live-ou-dj-mariage).",
        ],
      },
    ],
  }),
  postPair({
    slug: "livre-or-alternatives-idees",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Livre d'or original : 10 alternatives mémorables",
    titleEn: "A unique guestbook: 10 memorable alternatives",
    excerptFr:
      "Polaroid, bouteille à messages, puzzle géant : dix idées concrètes pour remplacer le livre d'or traditionnel.",
    excerptEn:
      "Polaroids, a message-in-a-bottle jar, a giant puzzle: ten concrete ideas to replace the traditional guestbook.",
    readingMinutes: 5,
    heroAltFr: "Alternatives au livre d'or de mariage",
    heroAltEn: "Wedding guestbook alternatives",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le livre d'or classique finit souvent dans un tiroir, peu relu après le mariage. Ces dix alternatives gardent la même idée (un souvenir écrit ou visuel des invités) sous une forme plus originale et plus facile à exposer ensuite.",
        ],
      },
      {
        type: "list",
        title: "Dix alternatives concrètes",
        items: [
          "Livre polaroid : chaque invité colle sa photo prise sur place et écrit un mot à côté",
          "Bouteille à messages : les invités glissent un petit mot plié dans une grande bouteille en verre",
          "Puzzle géant : chaque pièce est signée par un invité, le puzzle assemblé devient un cadre à accrocher",
          "Arbre à empreintes : les invités trempent un doigt dans la peinture pour former les feuilles d'un arbre dessiné",
          "Disque vinyle à dédicacer, à exposer ensuite comme objet de décoration",
          "Cartes postales à remplir et déposer dans une boîte, envoyées au couple un an plus tard par la famille",
          "Jeu de cartes à jouer où chaque carte porte un mot d'un invité, réutilisable pour de vraies parties de cartes ensuite",
          "Globe terrestre à signer, chaque invité laisse un mot près de sa ville d'origine",
          "Boîte à souvenirs avec petits papiers glissés dans des enveloppes numérotées, à ouvrir un an après le mariage",
          "Photobooth avec tirage papier collé directement dans un album à côté d'un mot manuscrit",
        ],
      },
      {
        type: "text",
        title: "Comment choisir la bonne option",
        paragraphs: [
          "Le meilleur choix dépend surtout de ce que vous voulez faire de l'objet ensuite. Un puzzle ou un vinyle se prête à l'accrochage mural, une boîte à souvenirs se prête à un rituel d'anniversaire de mariage, un livre polaroid reste le plus simple à consulter régulièrement.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Placez toujours un exemple rempli à côté du dispositif choisi. Beaucoup d'invités n'osent pas se lancer les premiers s'ils ne voient pas ce qu'on attend d'eux.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour d'autres idées d'animation autour du livre d'or, voir notre guide [photobooth, livre d'or et animations](/blog/photobooth-livre-or-animations). Et pour des idées d'animations complémentaires en soirée, notre article [animations de soirée](/blog/animations-soiree-mariage-idees).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The classic guestbook often ends up in a drawer, rarely reread after the wedding. These ten alternatives keep the same idea (a written or visual keepsake from guests) in a more original form that's easier to display afterward.",
        ],
      },
      {
        type: "list",
        title: "Ten concrete alternatives",
        items: [
          "Polaroid book: each guest sticks in their photo taken on site and writes a note next to it",
          "Message bottle: guests slip a small folded note into a large glass bottle",
          "Giant puzzle: each piece is signed by a guest, the assembled puzzle becomes a piece to hang",
          "Fingerprint tree: guests dip a finger in paint to form the leaves of a drawn tree",
          "A vinyl record to sign, later displayed as a decor piece",
          "Postcards to fill out and drop in a box, mailed to the couple a year later by family",
          "A deck of playing cards where each card carries a guest's note, reusable for real card games afterward",
          "A globe to sign, each guest leaves a note near their hometown",
          "A memory box with small notes slipped into numbered envelopes, to open a year after the wedding",
          "A photobooth with a printed strip glued directly into an album next to a handwritten note",
        ],
      },
      {
        type: "text",
        title: "How to choose the right option",
        paragraphs: [
          "The best choice mostly depends on what you want to do with the object afterward. A puzzle or vinyl record lends itself to hanging on a wall, a memory box lends itself to an anniversary ritual, a polaroid book stays the simplest to flip through regularly.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always place a filled-in example next to the chosen setup. Many guests won't be the first to try it if they can't see what's expected of them.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For more guestbook-related entertainment ideas, see our guide on [photobooth, guestbook, and entertainment](/blog/photobooth-livre-or-animations). And for complementary evening entertainment ideas, our article on [evening entertainment](/blog/animations-soiree-mariage-idees).",
        ],
      },
    ],
  }),

  postPair({
    slug: "seance-engagement-photos-couple",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Séance engagement : pourquoi faire des photos avant le mariage",
    titleEn: "Engagement shoot: why take photos before the wedding",
    excerptFr:
      "Save-the-date, prise de contact avec le photographe, souvenir en plus : ce qu'apporte une séance engagement, et quand la caler.",
    excerptEn:
      "Save-the-date photos, getting comfortable with your photographer, an extra keepsake: what an engagement shoot brings, and when to book it.",
    readingMinutes: 6,
    heroAltFr: "Séance photo engagement avant mariage",
    heroAltEn: "Engagement photo shoot before the wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La séance engagement reste moins systématique en France qu'aux Etats-Unis, mais de plus en plus de couples s'y mettent, souvent sans en connaître tous les avantages au départ.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'apporte une séance engagement",
        items: [
          "Des photos pour le save-the-date ou le faire-part, plus personnelles qu'une image générique",
          "Un premier contact avec le photographe en conditions réelles, avant le stress du jour J",
          "L'occasion de se familiariser avec la pose devant l'objectif, souvent le point le plus intimidant du mariage pour les couples peu à l'aise en photo",
          "Un souvenir à part entière, dans un lieu qui compte pour vous, en dehors du cadre du mariage",
        ],
      },
      {
        type: "text",
        title: "Quand la caler dans le planning",
        paragraphs: [
          "L'idéal reste quatre à six mois avant le mariage, assez tôt pour utiliser les photos sur le save-the-date, mais assez proche pour que le style vestimentaire et la coiffure restent cohérents avec ce que vous prévoyez le jour J.",
        ],
      },
      {
        type: "list",
        title: "Le lien avec le forfait photographe",
        items: [
          "Certains photographes incluent la séance engagement dans leur forfait mariage, d'autres la facturent en supplément",
          "Vérifiez toujours si elle est comprise avant de la considérer comme acquise dans votre budget",
          "Une séance engagement facturée à part coûte généralement moins cher qu'une prestation jour J complète",
          "C'est aussi l'occasion de tester le style du photographe en conditions réelles avant de signer un contrat plus engageant",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Choisissez un lieu qui a un sens pour vous deux (premier rendez-vous, lieu de vacances, quartier où vous habitez) plutôt qu'un décor générique trouvé sur Pinterest. Les photos gagnent en authenticité.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour bien choisir votre photographe en amont, voir notre guide [choisir son photographe de mariage](/blog/choisir-photographe-mariage). Et pour définir le style photo qui vous correspond, notre article [styles de photo de mariage](/blog/styles-photographie-mariage-choisir).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The engagement shoot is less of a given in France than in the US, but more and more couples are doing it, often without knowing all its upsides going in.",
        ],
      },
      {
        type: "list",
        title: "What an engagement shoot brings",
        items: [
          "Photos for the save-the-date or invitation, more personal than a generic image",
          "A first contact with the photographer under real conditions, before the day's stress",
          "A chance to get used to posing for the camera, often the most intimidating part of the wedding for couples not at ease in photos",
          "A keepsake in its own right, at a place that matters to you, outside the wedding itself",
        ],
      },
      {
        type: "text",
        title: "When to schedule it",
        paragraphs: [
          "Four to six months before the wedding is ideal, early enough to use the photos on the save-the-date, but close enough that your look and hairstyle still match what you're planning for the day.",
        ],
      },
      {
        type: "list",
        title: "How it connects to the photographer package",
        items: [
          "Some photographers include the engagement shoot in their wedding package, others bill it separately",
          "Always check whether it's included before counting it as a given in your budget",
          "A separately billed engagement shoot usually costs less than full day-of coverage",
          "It's also a chance to test the photographer's style under real conditions before signing a bigger contract",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Choose a location that means something to the two of you (where you first met, a vacation spot, your neighborhood) rather than a generic backdrop found on Pinterest. The photos gain in authenticity.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To choose the right photographer beforehand, see our guide on [choosing your wedding photographer](/blog/choisir-photographe-mariage). And to define the photo style that fits you, our article on [wedding photography styles](/blog/styles-photographie-mariage-choisir).",
        ],
      },
    ],
  }),
  postPair({
    slug: "styles-photographie-mariage-choisir",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Styles de photo de mariage : reportage, posé, argentique",
    titleEn: "Wedding photography styles: documentary, posed, film",
    excerptFr:
      "Trois grandes approches du photographe de mariage, comment les repérer dans un portfolio, et les questions à poser avant de signer.",
    excerptEn:
      "Three major approaches to wedding photography, how to spot them in a portfolio, and the questions to ask before you sign.",
    readingMinutes: 6,
    heroAltFr: "Styles de photographie de mariage",
    heroAltEn: "Wedding photography styles",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Tous les photographes de mariage ne travaillent pas de la même façon. Avant de comparer les prix, comparer les styles évite de découvrir le jour de la livraison des photos que le rendu ne correspond pas à ce que vous imaginiez.",
        ],
      },
      {
        type: "list",
        title: "Le style reportage",
        items: [
          "Le photographe capture les moments tels qu'ils se produisent, sans les diriger",
          "Rendu naturel et spontané, souvent en noir et blanc pour une partie des clichés",
          "Demande un photographe discret, capable de se fondre dans la journée sans se faire remarquer",
          "Moins adapté si vous voulez absolument des photos de groupe posées et complètes",
        ],
      },
      {
        type: "list",
        title: "Le style posé et dirigé",
        items: [
          "Le photographe organise les prises de vue, guide les postures et les regards",
          "Rendu plus maîtrisé, souvent recherché pour les photos de couple ou les portraits de famille",
          "Nécessite plus de temps dédié dans le planning du jour J pour ne pas presser les mariés",
          "Peut sembler moins spontané si tout le mariage est traité de cette façon",
        ],
      },
      {
        type: "list",
        title: "Le style argentique",
        items: [
          "Photos prises avec un vrai film pellicule, développé ensuite en laboratoire",
          "Rendu particulier en grain, couleurs et lumière, difficile à reproduire numériquement",
          "Nombre de clichés limité par le nombre de pellicules, moins de photos au total qu'en numérique",
          "Délai de livraison souvent plus long, le temps du développement en laboratoire",
        ],
      },
      {
        type: "text",
        title: "Comment repérer le style dans un portfolio",
        paragraphs: [
          "Regardez si les photos de groupe sont clairement posées ou capturées sur le vif, si le photographe montre beaucoup de détails (décoration, alliances, chaussures) ou surtout des visages, et si les couleurs sont naturelles ou fortement retouchées. Un bon photographe montre un style cohérent sur l'ensemble de son book, pas seulement sur ses meilleures photos isolées.",
        ],
      },
      {
        type: "list",
        title: "Questions à poser avant de signer",
        items: [
          "Quel pourcentage du reportage sera posé plutôt que capturé sur le vif",
          "Combien de photos retouchées seront livrées au total",
          "Le style montré en portfolio est-il celui appliqué à tous les mariages, ou adapté à la demande",
          "Propose-t-il un mélange de styles (numérique et argentique) dans un même forfait",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour la méthode complète de sélection, voir notre guide [choisir son photographe de mariage](/blog/choisir-photographe-mariage). Une fois le style choisi, pensez à la [séance engagement](/blog/seance-engagement-photos-couple) pour le tester en conditions réelles avant le jour J.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Not every wedding photographer works the same way. Comparing styles before comparing prices avoids discovering on delivery day that the result doesn't match what you imagined.",
        ],
      },
      {
        type: "list",
        title: "The documentary style",
        items: [
          "The photographer captures moments as they happen, without directing them",
          "A natural, spontaneous look, often in black and white for part of the shots",
          "Requires a discreet photographer, able to blend into the day without standing out",
          "Less suited if you absolutely want complete, posed group photos",
        ],
      },
      {
        type: "list",
        title: "The posed and directed style",
        items: [
          "The photographer stages the shots, guiding poses and gazes",
          "A more controlled look, often sought for couple photos or family portraits",
          "Needs more dedicated time in the day's schedule so the couple isn't rushed",
          "Can feel less spontaneous if the whole wedding is shot this way",
        ],
      },
      {
        type: "list",
        title: "The film style",
        items: [
          "Photos taken on real film, then developed in a lab",
          "A distinctive look in grain, color, and light, hard to replicate digitally",
          "The number of shots is limited by the number of rolls, fewer photos overall than digital",
          "Delivery time is usually longer, given the lab development",
        ],
      },
      {
        type: "text",
        title: "How to spot the style in a portfolio",
        paragraphs: [
          "Look at whether group photos are clearly posed or captured candidly, whether the photographer shows a lot of detail shots (decor, rings, shoes) or mostly faces, and whether the colors are natural or heavily edited. A good photographer shows a consistent style across the whole book, not just their best isolated photos.",
        ],
      },
      {
        type: "list",
        title: "Questions to ask before signing",
        items: [
          "What percentage of the coverage will be posed rather than candid",
          "How many edited photos will be delivered in total",
          "Is the style shown in the portfolio applied to every wedding, or adapted on request",
          "Do they offer a mix of styles (digital and film) within the same package",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For the full selection method, see our guide on [choosing your wedding photographer](/blog/choisir-photographe-mariage). Once you've picked a style, consider an [engagement shoot](/blog/seance-engagement-photos-couple) to test it under real conditions before the day.",
        ],
      },
    ],
  }),

  postPair({
    slug: "album-photo-mariage-choisir",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Album photo de mariage : formats, tirages, quand commander",
    titleEn: "Wedding photo album: formats, prints, and when to order",
    excerptFr:
      "Choisir un format d'album, estimer le nombre de tirages nécessaires, et caler le bon moment pour commander après la livraison des photos.",
    excerptEn:
      "Choosing an album format, estimating how many prints you actually need, and timing the order after your photos are delivered.",
    readingMinutes: 6,
    heroAltFr: "Album photo de mariage",
    heroAltEn: "Wedding photo album",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Une fois les photos livrées, beaucoup de couples les laissent dormir sur un disque dur sans jamais en imprimer une seule. L'album photo reste pourtant l'objet le plus consulté des années après le mariage, bien plus qu'un fichier numérique oublié.",
        ],
      },
      {
        type: "list",
        title: "Les formats d'album courants",
        items: [
          "Album traditionnel avec pochettes, format économique mais moins qualitatif dans le rendu final",
          "Album à plat (livre photo relié), pages qui s'ouvrent totalement sans pli central, rendu plus premium",
          "Album en toile ou cuir, personnalisable, souvent proposé directement par le photographe en option",
          "Mini albums ou livrets à offrir aux proches, format réduit et budget plus accessible pour plusieurs exemplaires",
        ],
      },
      {
        type: "text",
        title: "Combien de tirages prévoir",
        paragraphs: [
          "Il n'existe pas de règle stricte, mais un album principal de 30 à 60 photos couvre en général les grands temps forts sans se transformer en catalogue exhaustif. Comptez à part un ou deux petits albums pour les parents, souvent demandés spontanément après le mariage.",
        ],
      },
      {
        type: "list",
        title: "Quand commander l'album",
        items: [
          "Attendez la livraison complète des photos retouchées avant de valider une sélection définitive",
          "Prenez le temps de trier à tête reposée, l'émotion du jour J fausse souvent le choix des premières semaines",
          "Certains photographes incluent l'album dans leur forfait, d'autres le facturent à part une fois la sélection faite",
          "Un délai de fabrication de plusieurs semaines est courant, à anticiper si vous visez un cadeau d'anniversaire de mariage",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ne repoussez pas trop cette commande. Beaucoup de couples finissent par ne jamais imprimer d'album, faute d'avoir fixé un délai clair après la livraison des photos.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour bien choisir le photographe qui livrera ces photos, voir notre guide [choisir son photographe de mariage](/blog/choisir-photographe-mariage). Et pour définir le rendu recherché avant de commander, notre article [styles de photo de mariage](/blog/styles-photographie-mariage-choisir).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Once the photos are delivered, many couples let them sit on a hard drive without ever printing a single one. The photo album remains the most-viewed object years after the wedding, far more than a forgotten digital file.",
        ],
      },
      {
        type: "list",
        title: "Common album formats",
        items: [
          "Traditional album with sleeves, an economical format but lower quality in the final look",
          "Flat-lay album (bound photo book), pages that open fully with no center crease, a more premium finish",
          "Canvas or leather album, customizable, often offered directly by the photographer as an option",
          "Mini albums or booklets to give loved ones, a smaller format with a friendlier budget for multiple copies",
        ],
      },
      {
        type: "text",
        title: "How many prints to plan for",
        paragraphs: [
          "There's no strict rule, but a main album of 30 to 60 photos usually covers the big highlights without turning into an exhaustive catalog. Count separately one or two small albums for parents, often spontaneously requested after the wedding.",
        ],
      },
      {
        type: "list",
        title: "When to order the album",
        items: [
          "Wait for the full delivery of edited photos before finalizing a selection",
          "Take the time to sort with a clear head, the wedding day's emotion often skews the choice in the first weeks",
          "Some photographers include the album in their package, others bill it separately once the selection is made",
          "A production time of several weeks is common, worth planning for if you're aiming for an anniversary gift",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Don't push this order back too far. Many couples end up never printing an album, for lack of a clear deadline set after the photos are delivered.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To choose the photographer who will deliver these photos, see our guide on [choosing your wedding photographer](/blog/choisir-photographe-mariage). And to define the look you want before ordering, our article on [wedding photography styles](/blog/styles-photographie-mariage-choisir).",
        ],
      },
    ],
  }),
  postPair({
    slug: "seance-day-after-trash-dress",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Séance day-after : prolonger le mariage en images",
    titleEn: "Day-after shoot: extending your wedding in photos",
    excerptFr:
      "Photos plus détendues, sans la pression du jour J, avec la robe qu'on n'a plus peur d'abîmer : ce qu'est une séance day-after.",
    excerptEn:
      "Relaxed photos, no wedding-day time pressure, and a dress you no longer worry about ruining: what a day-after shoot is.",
    readingMinutes: 5,
    heroAltFr: "Séance photo day-after mariage",
    heroAltEn: "Wedding day-after photo shoot",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La séance day-after, parfois appelée trash the dress, se déroule un ou plusieurs jours après le mariage, en dehors de la contrainte du planning jour J. L'idée n'est pas forcément d'abîmer la robe, mais de photographier le couple sans la pression du timing serré.",
        ],
      },
      {
        type: "list",
        title: "Pourquoi faire une séance day-after",
        items: [
          "Le jour du mariage laisse rarement le temps de vraies photos de couple posées et détendues",
          "Sans invités ni horaire à respecter, le photographe peut explorer des lieux et des lumières différentes",
          "L'expression des mariés change sans le stress de la journée, souvent plus naturelle et plus relâchée",
          "C'est l'occasion d'utiliser un lieu qui n'était pas accessible ou pratique le jour du mariage lui-même",
        ],
      },
      {
        type: "list",
        title: "Logistique à prévoir",
        items: [
          "Choisir un lieu avec une lumière intéressante en fin de journée, souvent le moment privilégié des photographes",
          "Prévoir le nettoyage de la robe après la séance si elle touche l'eau, l'herbe ou le sable",
          "Caler la séance dans les jours qui suivent le mariage, pas des semaines après, pour garder la coiffure et le teint proches du jour J si besoin",
          "Vérifier avec le pressing en amont le délai et le coût d'un nettoyage après une séance en extérieur",
        ],
      },
      {
        type: "text",
        title: "Faut-il vraiment abîmer la robe",
        paragraphs: [
          "Le nom trash the dress fait peur à tort : la plupart des séances day-after n'abîment pas la robe de façon irréversible. Beaucoup de couples restent simplement sur un tissu qui prend un peu de terre ou d'eau, largement rattrapable au pressing.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Si vous comptez transmettre ou revendre votre robe après le mariage, prévenez le photographe pour rester sur des prises de vue qui préservent le tissu.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour choisir le photographe qui réalisera cette séance en plus du jour J, voir notre guide [choisir son photographe de mariage](/blog/choisir-photographe-mariage). Et pour prolonger le souvenir en album, notre article [choisir son album photo](/blog/album-photo-mariage-choisir).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The day-after shoot, sometimes called trash the dress, takes place one or more days after the wedding, outside the constraints of the day-of schedule. The idea isn't necessarily to ruin the dress, but to photograph the couple without the pressure of a tight timeline.",
        ],
      },
      {
        type: "list",
        title: "Why do a day-after shoot",
        items: [
          "The wedding day itself rarely leaves time for real, relaxed, posed couple photos",
          "With no guests or schedule to keep, the photographer can explore different locations and light",
          "The couple's expressions shift without the day's stress, often more natural and relaxed",
          "It's a chance to use a location that wasn't accessible or practical on the wedding day itself",
        ],
      },
      {
        type: "list",
        title: "Logistics to plan",
        items: [
          "Choose a location with interesting late-day light, often photographers' favorite time",
          "Plan to clean the dress after the shoot if it touches water, grass, or sand",
          "Schedule the shoot within a few days of the wedding, not weeks later, to keep hair and skin tone close to the wedding day if needed",
          "Check with the dry cleaner ahead of time on the turnaround and cost for cleaning after an outdoor shoot",
        ],
      },
      {
        type: "text",
        title: "Do you really have to ruin the dress",
        paragraphs: [
          "The name trash the dress is misleading: most day-after shoots don't damage the dress irreversibly. Many couples simply end up with fabric that picks up a bit of dirt or water, easily fixed at the dry cleaner.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "If you plan to pass down or resell your dress after the wedding, tell the photographer so they can stick to shots that preserve the fabric.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To choose the photographer who will shoot this session on top of the wedding day, see our guide on [choosing your wedding photographer](/blog/choisir-photographe-mariage). And to extend the keepsake into an album, our article on [choosing your photo album](/blog/album-photo-mariage-choisir).",
        ],
      },
    ],
  }),

  postPair({
    slug: "drone-mariage-photo-video",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Drone au mariage : réglementation, rendu, faut-il en faire",
    titleEn: "Drone footage at your wedding: regulations, results, is it worth it",
    excerptFr:
      "Ce que dit la réglementation française sur le survol de personnes, ce qu'apporte vraiment une prise de vue aérienne, et quand s'en passer.",
    excerptEn:
      "What French regulations say about flying over people, what aerial shots actually add, and when it's fine to skip it.",
    readingMinutes: 6,
    heroAltFr: "Drone photo et vidéo de mariage",
    heroAltEn: "Wedding drone photo and video",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le drone est souvent proposé en option par les photographes et vidéastes, avec la promesse d'un rendu spectaculaire. Avant de l'ajouter au forfait, mieux vaut connaître ce qu'il apporte réellement et ce que la loi encadre en France.",
        ],
      },
      {
        type: "list",
        title: "Ce que dit la réglementation en France",
        items: [
          "Le survol de personnes rassemblées est strictement encadré, voire interdit selon la catégorie de drone et la zone",
          "Le télépilote doit être déclaré et formé, avec un numéro d'enregistrement pour l'appareil au-delà d'un certain poids",
          "Certains lieux (proximité d'aéroport, zones militaires, parcs naturels) interdisent purement et simplement le vol de drone",
          "Demandez toujours au prestataire son numéro d'exploitant et son assurance spécifique avant de signer",
        ],
      },
      {
        type: "text",
        title: "Ce qu'un drone apporte vraiment",
        paragraphs: [
          "Une vue d'ensemble du lieu de réception, un plan large sur l'arrivée des invités ou un survol du domaine, sont des images qu'aucune autre prise de vue ne peut reproduire. C'est aussi un bon moyen de montrer un lieu atypique (château, domaine viticole, bord de mer) dans son ensemble.",
        ],
      },
      {
        type: "list",
        title: "Quand c'est vraiment utile",
        items: [
          "Un lieu de réception avec un cadre extérieur remarquable (château, vignoble, bord de mer)",
          "Un mariage avec beaucoup d'invités, pour un plan large impossible à obtenir au sol",
          "Une cérémonie en extérieur où un plan aérien du début ou de la fin apporte une vraie valeur ajoutée",
        ],
      },
      {
        type: "list",
        title: "Quand c'est dispensable",
        items: [
          "Un lieu de réception en intérieur ou en ville dense, où le survol n'apporte pas grand-chose visuellement",
          "Un budget déjà serré sur le poste photo-vidéo, le drone reste souvent une option coûteuse pour quelques secondes de film",
          "Une réglementation locale trop restrictive qui limite le vol à une portion de la journée seulement",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour équilibrer ce poste avec le reste du budget photo-vidéo, voir notre guide [choisir son photographe de mariage](/blog/choisir-photographe-mariage), et notre article sur les [styles de photo de mariage](/blog/styles-photographie-mariage-choisir) pour situer le drone parmi les autres options de rendu.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Drone footage is often offered as an add-on by photographers and videographers, promising a spectacular result. Before adding it to the package, it's worth knowing what it actually brings and what the law in France requires.",
        ],
      },
      {
        type: "list",
        title: "What French regulations say",
        items: [
          "Flying over gathered crowds is strictly regulated, and sometimes outright banned depending on drone category and zone",
          "The remote pilot must be registered and trained, with a registration number for the aircraft above a certain weight",
          "Some locations (near an airport, military zones, nature parks) ban drone flight altogether",
          "Always ask the vendor for their operator number and specific insurance before signing",
        ],
      },
      {
        type: "text",
        title: "What a drone actually adds",
        paragraphs: [
          "An overview of the reception venue, a wide shot of guests arriving, or a flyover of the estate are images no other shot can reproduce. It's also a good way to show off a distinctive venue (château, vineyard, seaside) as a whole.",
        ],
      },
      {
        type: "list",
        title: "When it's genuinely useful",
        items: [
          "A reception venue with a striking outdoor setting (château, vineyard, seaside)",
          "A wedding with many guests, for a wide shot impossible to get from the ground",
          "An outdoor ceremony where an aerial shot at the start or end adds real value",
        ],
      },
      {
        type: "list",
        title: "When it's skippable",
        items: [
          "An indoor or dense-city reception venue, where a flyover doesn't add much visually",
          "A photo-video budget already tight, drone footage is often a pricey option for a few seconds of film",
          "Overly restrictive local rules that limit flight to only part of the day",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To balance this line against the rest of your photo-video budget, see our guide on [choosing your wedding photographer](/blog/choisir-photographe-mariage), and our article on [wedding photography styles](/blog/styles-photographie-mariage-choisir) to place drone footage among the other look options.",
        ],
      },
    ],
  }),
  postPair({
    slug: "bouquet-mariee-choisir-forme-fleurs",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Bouquet de mariée : forme, fleurs, accord avec la robe",
    titleEn: "Bridal bouquet: shape, flowers, matching your dress",
    excerptFr:
      "Rond, cascade, champêtre : comment choisir la forme du bouquet selon la silhouette de la robe et les fleurs de saison.",
    excerptEn:
      "Round, cascade, loose and wild: how to choose a bouquet shape to match your dress silhouette and seasonal flowers.",
    readingMinutes: 6,
    heroAltFr: "Bouquet de mariée",
    heroAltEn: "Bridal bouquet",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le bouquet reste l'un des rares éléments de tenue que la mariée porte pendant toute la journée. Sa forme mérite donc autant d'attention que la robe elle-même, plutôt que d'être choisie en dernière minute chez le fleuriste.",
        ],
      },
      {
        type: "list",
        title: "Les grandes formes de bouquet",
        items: [
          "Le bouquet rond, compact et structuré, classique et intemporel, adapté à la plupart des silhouettes",
          "Le bouquet cascade, avec des fleurs qui retombent vers le bas, plus formel et spectaculaire",
          "Le bouquet champêtre ou déstructuré, aux tiges apparentes et à l'allure naturelle, tendance ces dernières années",
          "Le bouquet mono-fleur, composé d'une seule variété en grande quantité, pour un rendu graphique et épuré",
        ],
      },
      {
        type: "text",
        title: "Accorder le bouquet à la silhouette de la robe",
        paragraphs: [
          "Une robe sirène ou fourreau, déjà très structurée, s'accorde souvent mieux avec un bouquet plus fluide (cascade ou champêtre) pour ne pas surcharger la silhouette. À l'inverse, une robe ample ou à volume (princesse, bohème) supporte bien un bouquet rond et compact, qui ne se perd pas dans le tissu.",
        ],
      },
      {
        type: "list",
        title: "Choisir selon la saison",
        items: [
          "Pivoines et roses anciennes au printemps et en début d'été, incontournables pour un rendu romantique",
          "Dahlias et tournesols en fin d'été, pour une palette plus chaude et champêtre",
          "Roses, eucalyptus et feuillages persistants en automne et en hiver, quand le choix de fleurs fraîches se réduit",
          "Les fleurs hors saison restent possibles mais coûtent nettement plus cher, souvent importées",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Demandez toujours au fleuriste un essai du bouquet avant le jour J, avec la robe si possible. Une forme qui semble parfaite en photo peut déséquilibrer la silhouette une fois en main.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour bien choisir votre fleuriste en amont, voir notre guide [choisir son fleuriste de mariage](/blog/choisir-fleuriste-mariage). Et pour composer l'ensemble floral selon la saison, notre article [fleurs de mariage et saisons locales](/blog/fleurs-mariage-saison-locales).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The bouquet is one of the few pieces of the bride's look worn throughout the whole day. Its shape deserves as much attention as the dress itself, rather than being picked at the last minute at the florist's.",
        ],
      },
      {
        type: "list",
        title: "The main bouquet shapes",
        items: [
          "The round bouquet, compact and structured, classic and timeless, suited to most silhouettes",
          "The cascade bouquet, with flowers trailing downward, more formal and dramatic",
          "The loose, wild-garden bouquet, with visible stems and a natural look, trendy in recent years",
          "The single-flower bouquet, made of one variety in large quantity, for a graphic, pared-back look",
        ],
      },
      {
        type: "text",
        title: "Matching the bouquet to the dress silhouette",
        paragraphs: [
          "A mermaid or sheath dress, already very structured, often pairs better with a looser bouquet (cascade or wild-garden) so as not to overload the silhouette. Conversely, a full-volume dress (ball gown, bohemian) carries a round, compact bouquet well, one that won't get lost in the fabric.",
        ],
      },
      {
        type: "list",
        title: "Choosing by season",
        items: [
          "Peonies and old-fashioned roses in spring and early summer, a must for a romantic look",
          "Dahlias and sunflowers in late summer, for a warmer, wild-garden palette",
          "Roses, eucalyptus, and evergreen foliage in fall and winter, when the choice of fresh flowers narrows",
          "Out-of-season flowers remain possible but cost noticeably more, usually imported",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always ask the florist for a bouquet trial before the wedding, with the dress if possible. A shape that looks perfect in a photo can unbalance the silhouette once held in hand.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To choose the right florist beforehand, see our guide on [choosing your wedding florist](/blog/choisir-fleuriste-mariage). And to build the full floral set around the season, our article on [wedding flowers and local seasons](/blog/fleurs-mariage-saison-locales).",
        ],
      },
    ],
  }),

  postPair({
    slug: "boutonniere-marie-corsages-famille",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Boutonnière du marié et corsages : le détail qui compte",
    titleEn: "The groom's boutonnière and corsages: the detail that counts",
    excerptFr:
      "Accorder la boutonnière au bouquet, choix de fleurs traditionnelles, et corsages pour les parents et grands-parents.",
    excerptEn:
      "Matching the boutonnière to the bouquet, traditional flower choices, and corsages for parents and grandparents.",
    readingMinutes: 5,
    heroAltFr: "Boutonnière et corsages de mariage",
    heroAltEn: "Wedding boutonnière and corsages",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Face au bouquet de la mariée, la boutonnière du marié reste souvent traitée comme un détail secondaire, ajoutée au dernier moment chez le fleuriste. Elle mérite pourtant la même attention, surtout sur les photos de couple où les deux se retrouvent souvent côte à côte.",
        ],
      },
      {
        type: "list",
        title: "Accorder la boutonnière au bouquet",
        items: [
          "Reprendre une ou deux fleurs présentes dans le bouquet de la mariée, en plus petite quantité",
          "Garder la même palette de couleurs sans nécessairement les mêmes fleurs, pour un accord plus discret",
          "Une boutonnière trop chargée détonne souvent avec un costume sobre, mieux vaut rester simple",
          "Prévoir une fixation solide (épingle, aimant) qui tienne toute la journée sans s'affaisser sur les photos",
        ],
      },
      {
        type: "list",
        title: "Fleurs traditionnellement utilisées",
        items: [
          "La rose, choix le plus classique, en fleur unique ou associée à un feuillage discret",
          "L'eucalyptus ou le romarin, pour une touche de verdure et de parfum sans surcharger visuellement",
          "Le muguet en mai, un choix traditionnel français chargé de symbolique de bonheur",
          "Une fleur de saison qui reprend une teinte du costume ou du nœud papillon",
        ],
      },
      {
        type: "text",
        title: "Les corsages pour la famille",
        paragraphs: [
          "Un corsage, plus petit qu'un bouquet, se porte au poignet ou s'épingle sur un vêtement. Il permet d'inclure visuellement les parents et grands-parents dans l'univers floral du mariage sans leur imposer de porter un bouquet complet. C'est un geste apprécié, souvent peu coûteux comparé au reste du poste fleuriste.",
        ],
      },
      {
        type: "list",
        title: "Qui porte quoi, en général",
        items: [
          "Boutonnière : le marié, les témoins, parfois les pères des mariés",
          "Corsage au poignet : les mères et grands-mères, plus pratique qu'une fleur à épingler sur une tenue déjà ajustée",
          "Petite fleur simple : les enfants d'honneur, en version réduite pour rester adaptée à leur taille",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Communiquez la liste précise des personnes à fleurir au fleuriste au moins un mois avant, en incluant les tailles de poignet pour les corsages. Un oubli de dernière minute se voit sur toutes les photos de groupe.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour composer l'ensemble en cohérence avec le bouquet principal, voir notre guide [bouquet de mariée : forme et fleurs](/blog/bouquet-mariee-choisir-forme-fleurs). Et pour la sélection du fleuriste qui réalisera tout l'ensemble floral, notre article [choisir son fleuriste de mariage](/blog/choisir-fleuriste-mariage).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Next to the bride's bouquet, the groom's boutonnière is often treated as an afterthought, added at the last minute at the florist's. It deserves the same attention, especially in couple photos where the two are often shown side by side.",
        ],
      },
      {
        type: "list",
        title: "Matching the boutonnière to the bouquet",
        items: [
          "Echo one or two flowers from the bride's bouquet, in a smaller amount",
          "Keep the same color palette without necessarily the same flowers, for a subtler match",
          "An overly busy boutonnière often clashes with a plain suit, better to keep it simple",
          "Plan a sturdy fastening (pin, magnet) that holds all day without drooping in photos",
        ],
      },
      {
        type: "list",
        title: "Traditionally used flowers",
        items: [
          "The rose, the most classic choice, alone or paired with discreet foliage",
          "Eucalyptus or rosemary, for a touch of greenery and scent without overloading the look",
          "Lily of the valley in May, a traditional French choice loaded with symbolism for happiness",
          "A seasonal flower that echoes a shade from the suit or bow tie",
        ],
      },
      {
        type: "text",
        title: "Corsages for the family",
        paragraphs: [
          "A corsage, smaller than a bouquet, is worn on the wrist or pinned to clothing. It visually includes parents and grandparents in the wedding's floral world without asking them to carry a full bouquet. It's an appreciated gesture, usually inexpensive compared to the rest of the florist budget.",
        ],
      },
      {
        type: "list",
        title: "Who wears what, generally",
        items: [
          "Boutonnière: the groom, the groomsmen, sometimes the fathers of the couple",
          "Wrist corsage: mothers and grandmothers, more practical than a flower pinned onto an already fitted outfit",
          "A small simple flower: the flower girls, in a smaller version sized for them",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Give the florist the precise list of who needs flowers at least a month ahead, including wrist sizes for corsages. A last-minute oversight shows up in every group photo.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To build the full set to match the main bouquet, see our guide on [bridal bouquet: shape and flowers](/blog/bouquet-mariee-choisir-forme-fleurs). And to select the florist who will handle the whole floral set, our article on [choosing your wedding florist](/blog/choisir-fleuriste-mariage).",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_145_164_FR, en: POSTS_145_164_EN } = pairsToArrays(pairs);
