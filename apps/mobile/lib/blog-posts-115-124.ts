import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "contrat-prestataire-clauses-verifier",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Contrat prestataire : les clauses à vérifier avant de signer",
    titleEn: "Vendor contract: the clauses to check before signing",
    excerptFr:
      "Acompte, annulation, imprévus, délais : la checklist des clauses à lire avant de signer avec un prestataire de mariage.",
    excerptEn:
      "Deposit, cancellation, contingencies, delivery: the checklist of clauses to read before signing with a wedding vendor.",
    readingMinutes: 7,
    heroAltFr: "Checklist clauses contrat prestataire mariage",
    heroAltEn: "Wedding vendor contract clauses checklist",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La plupart des litiges avec un prestataire de mariage viennent d'une chose : ce qui n'était pas écrit dans le contrat. Un accord verbal en rendez-vous n'engage personne le jour J.",
          "Avant de signer, relisez le document ligne par ligne, même si le prestataire vous met la pression pour renvoyer vite. Un professionnel sérieux ne s'offusque pas d'une relecture attentive.",
        ],
      },
      {
        type: "list",
        title: "Les clauses de paiement à vérifier",
        items: [
          "Montant de l'acompte et date d'exigibilité",
          "Échéancier des versements suivants, avec dates précises",
          "Moyens de paiement acceptés (virement, chèque, espèces plafonnées)",
          "Pénalités en cas de retard de paiement de votre côté",
          "Ce qui est réellement inclus dans le prix affiché (déplacement, TVA, options)",
        ],
      },
      {
        type: "list",
        title: "Les clauses d'annulation",
        items: [
          "Délai de rétractation, s'il existe, et conditions précises",
          "Montant remboursé selon la date d'annulation avant le jour J",
          "Ce qui se passe si c'est le prestataire qui annule ou fait défaut",
          "Possibilité de reporter la date sans frais supplémentaires",
        ],
      },
      {
        type: "list",
        title: "Responsabilité, imprévus et sous-traitance",
        items: [
          "Assurance responsabilité civile professionnelle du prestataire",
          "Plan B en cas d'intempéries pour les prestations en extérieur",
          "Le prestataire peut-il se faire remplacer par un tiers, et devez-vous en être informés",
          "Qui est responsable en cas de dommage matériel sur le lieu de réception",
        ],
      },
      {
        type: "text",
        title: "Délais et livrables",
        paragraphs: [
          "Pour un photographe ou un vidéaste, la date de livraison des photos et du film doit figurer noir sur blanc, avec le nombre de photos retouchées ou la durée du montage.",
          "Pour un traiteur ou un DJ, vérifiez les horaires précis de la prestation, le temps de montage et démontage, et ce qui déclenche des heures supplémentaires facturées.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Signal d'alerte : un prestataire qui refuse de fournir un contrat écrit, qui vous pousse à signer dans la journée, ou dont le devis change après un acompte versé. Prenez le temps, même sous pression commerciale.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Avant de signer, comparez plusieurs devis avec nos conseils pour [négocier un devis](/blog/negocier-devis-mariage), et gardez une trace de chaque contrat et échéance de paiement dans le [tableau de bord prestataires](/blog/centraliser-devis-prestataires-mariage) de Fiancé.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Most disputes with a wedding vendor come down to one thing: what was never written into the contract. A verbal agreement made in a meeting binds no one on the day.",
          "Before signing, read the document line by line, even if the vendor pushes you to send it back quickly. A serious professional never minds a careful read.",
        ],
      },
      {
        type: "list",
        title: "Payment clauses to check",
        items: [
          "Deposit amount and due date",
          "Schedule of remaining payments, with precise dates",
          "Accepted payment methods (bank transfer, cheque, capped cash)",
          "Late payment penalties on your side",
          "What is actually included in the quoted price (travel, VAT, options)",
        ],
      },
      {
        type: "list",
        title: "Cancellation clauses",
        items: [
          "Cooling-off period, if any, and its conditions",
          "Refund amount based on cancellation date before the wedding",
          "What happens if the vendor cancels or fails to deliver",
          "Whether the date can be rescheduled without extra fees",
        ],
      },
      {
        type: "list",
        title: "Liability, contingencies, and subcontracting",
        items: [
          "The vendor's professional liability insurance",
          "A backup plan for bad weather on outdoor services",
          "Whether the vendor can be replaced by a third party, and whether you must be told",
          "Who is liable for property damage at the reception venue",
        ],
      },
      {
        type: "text",
        title: "Delivery and deadlines",
        paragraphs: [
          "For a photographer or videographer, the delivery date for photos and the film should be spelled out in writing, along with the number of edited photos or the edit's length.",
          "For a caterer or DJ, check the exact service hours, setup and teardown time, and what triggers billed overtime.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Red flag: a vendor who refuses a written contract, pushes you to sign the same day, or changes the quote after a deposit is paid. Take your time, even under sales pressure.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Before signing, compare several quotes with our tips on [negotiating a quote](/blog/negocier-devis-mariage), and keep every contract and payment deadline in Fiancé's [vendor dashboard](/blog/centraliser-devis-prestataires-mariage).",
        ],
      },
    ],
  }),

  postPair({
    slug: "ceremonie-civile-mairie-deroule",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Cérémonie civile en mairie : déroulé et préparation",
    titleEn: "Civil ceremony at the town hall: what to expect and how to prepare",
    excerptFr:
      "Ordre de la cérémonie, qui parle, musique, capacité d'accueil : ce qui se passe réellement pendant la cérémonie civile en mairie.",
    excerptEn:
      "Ceremony order, who speaks, music, guest capacity: what actually happens during a French civil ceremony at the town hall.",
    readingMinutes: 6,
    heroAltFr: "Cérémonie civile mariage en mairie",
    heroAltEn: "Civil wedding ceremony at the town hall",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "En France, la cérémonie civile en mairie est la seule obligatoire pour que le mariage soit reconnu légalement. Elle précède toujours une éventuelle cérémonie religieuse ou laïque, jamais l'inverse.",
          "Beaucoup de couples découvrent son déroulé seulement au dernier rendez-vous avec la mairie. Voici à quoi s'attendre pour arriver serein.",
        ],
      },
      {
        type: "list",
        title: "Déroulé type de la cérémonie",
        items: [
          "Appel des futurs époux et des témoins, vérification des identités",
          "Lecture par l'officier d'état civil de plusieurs articles du Code civil sur les droits et devoirs des époux",
          "Échange des consentements (« oui, je le veux »)",
          "Signature du registre par les mariés puis par les témoins",
          "Remise du livret de famille et lecture du certificat de mariage",
        ],
      },
      {
        type: "text",
        title: "Qui célèbre, et peut-on personnaliser",
        paragraphs: [
          "La cérémonie est célébrée par le maire ou un adjoint, parfois un conseiller municipal délégué. Vous ne choisissez pas qui officie, mais la plupart acceptent volontiers un mot personnel adressé aux mariés.",
          "La personnalisation reste limitée : pas de discours long, pas d'ajout d'éléments religieux. Certaines mairies acceptent une courte lecture par un témoin si elle est validée à l'avance.",
        ],
      },
      {
        type: "list",
        title: "Musique et entrée : ce qui est possible",
        items: [
          "Certaines mairies autorisent un morceau de musique diffusé à l'entrée ou à la sortie, d'autres non : demandez en amont",
          "L'entrée en musique se fait souvent au son d'un simple lecteur fourni par vos soins, la mairie n'a pas toujours de sonorisation",
          "Les photos et vidéos sont généralement autorisées, mais certaines mairies limitent les déplacements dans la salle pendant la cérémonie",
        ],
      },
      {
        type: "text",
        title: "Durée et capacité d'accueil",
        paragraphs: [
          "La cérémonie civile dure en général quinze à trente minutes. Prévoyez une marge dans votre planning jour J entre la mairie et la suite du programme, notamment pour les photos de sortie et les trajets.",
          "Certaines petites mairies ont une capacité d'accueil limitée en nombre d'invités dans la salle des mariages : renseignez-vous tôt si vous avez une liste large, cela peut obliger à faire un choix parmi les invités présents à ce moment précis.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Anticipez avec le service état civil : capacité de la salle, autorisation musique, stationnement à proximité pour les invités âgés, et horaire exact confirmé quelques semaines avant.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour les délais administratifs et le dossier à déposer avant la cérémonie, consultez notre guide [dossier de mariage et publication des bans](/blog/dossier-mairie-bans-mariage-delais). Calez ensuite l'horaire de la mairie dans votre [timeline jour J](/tools/timeline).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In France, the civil ceremony at the town hall is the only one legally required for a marriage to be recognized. It always comes before any religious or humanist ceremony, never after.",
          "Many couples only discover how it unfolds at their final meeting with the town hall. Here is what to expect so you arrive calm.",
        ],
      },
      {
        type: "list",
        title: "Typical ceremony order",
        items: [
          "Roll call of the couple and witnesses, identity checks",
          "The civil registrar reads several articles of the Civil Code on spouses' rights and duties",
          "Exchange of consent (\"yes, I do\")",
          "The couple signs the register, followed by the witnesses",
          "Handover of the family record book and reading of the marriage certificate",
        ],
      },
      {
        type: "text",
        title: "Who officiates, and can it be personalized",
        paragraphs: [
          "The ceremony is officiated by the mayor or a deputy mayor, sometimes a delegated council member. You do not choose who officiates, but most are happy to add a personal word for the couple.",
          "Personalization stays limited: no long speeches, no religious elements. Some town halls allow a short reading by a witness if approved in advance.",
        ],
      },
      {
        type: "list",
        title: "Music and entrance: what is possible",
        items: [
          "Some town halls allow a piece of music played at the entrance or exit, others do not: ask ahead of time",
          "Music entrance is usually played from your own device, town halls do not always have sound equipment",
          "Photos and video are generally allowed, but some town halls limit movement in the room during the ceremony",
        ],
      },
      {
        type: "text",
        title: "Duration and guest capacity",
        paragraphs: [
          "The civil ceremony usually lasts fifteen to thirty minutes. Build slack into your day-of schedule between the town hall and the rest of the program, especially for exit photos and travel.",
          "Some small town halls cap the number of guests allowed in the wedding hall: ask early if your guest list is large, since it may force you to choose who attends this specific moment.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Plan ahead with the civil registry office: room capacity, music approval, nearby parking for older guests, and the exact time confirmed a few weeks out.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For administrative deadlines and the file to submit before the ceremony, see our guide on [marriage paperwork and the publication of banns](/blog/dossier-mairie-bans-mariage-delais). Then slot the town hall slot into your [day-of timeline](/tools/timeline).",
        ],
      },
    ],
  }),

  postPair({
    slug: "nuit-de-noces-hebergement-maries",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Nuit de noces et hébergement des mariés : anticiper",
    titleEn: "Wedding night accommodation for the couple: plan ahead",
    excerptFr:
      "Entre l'organisation pour les invités, les mariés oublient souvent de réserver leur propre chambre. Comment et quand s'en occuper.",
    excerptEn:
      "While organizing lodging for guests, couples often forget to book their own room. How and when to take care of it.",
    readingMinutes: 5,
    heroAltFr: "Chambre nuit de noces mariage",
    heroAltEn: "Wedding night room for the couple",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Vous avez sans doute déjà pensé à l'hébergement de vos invités venus de loin. Il arrive souvent que les mariés, eux, oublient de réserver leur propre chambre pour le soir des noces, pris dans la logistique de tout le monde d'autre.",
        ],
      },
      {
        type: "list",
        title: "Où passer la nuit de noces",
        items: [
          "Une chambre sur le lieu de réception, si le domaine ou le château en propose une, pratique car pas de trajet après la soirée",
          "Un hôtel à proximité, pour retrouver un peu de calme loin de l'agitation de la salle",
          "Une chambre d'hôtes ou un lieu atypique, pour une vraie parenthèse si le budget le permet",
          "Repartir chez soi, une option simple mais qui coupe court à la soirée plus tôt que prévu",
        ],
      },
      {
        type: "text",
        title: "Réservez en même temps que le reste",
        paragraphs: [
          "Traitez cette réservation comme celle du lieu de réception : dès que la date est fixée. Les chambres sur le lieu du mariage ou juste à côté partent vite, surtout en haute saison.",
          "Si le mariage se tient dans un domaine avec hébergement, vérifiez si une suite ou une chambre spécifique est incluse dans le forfait, ou si elle se réserve et se paie à part.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'il faut vérifier",
        items: [
          "Heure de départ autorisée le lendemain, souvent plus tardive que la normale sur demande",
          "Petit-déjeuner en chambre ou service tardif, pratique après une soirée qui finit tard",
          "Accès à la chambre possible pendant la soirée si vous souhaitez vous changer",
          "Sac ou valise préparé à l'avance et déposé dans la chambre avant la cérémonie",
        ],
      },
      {
        type: "text",
        title: "Une ligne budget souvent oubliée",
        paragraphs: [
          "Cette nuit ne coûte en général pas plus qu'une chambre de qualité correcte, mais elle disparaît facilement d'un budget mariage qui ne l'a pas prévue dès le départ. Ajoutez-la comme un poste à part dans votre suivi budget.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Déléguez le transport des bagages à un témoin ou un proche : personne ne veut porter une valise en tenue de mariage entre la salle et la voiture à minuit.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour organiser le logement de vos invités en parallèle, voir notre guide [hébergement des invités](/blog/hebergement-invites-mariage). Gardez toutes les réservations, y compris la vôtre, dans le module hébergement de Fiancé.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "You have likely already thought about lodging for guests coming from afar. Couples themselves often forget to book their own room for the wedding night, caught up in everyone else's logistics.",
        ],
      },
      {
        type: "list",
        title: "Where to spend the wedding night",
        items: [
          "A room at the reception venue, if the estate or château offers one, convenient since there is no travel after the party",
          "A nearby hotel, for a bit of quiet away from the reception's bustle",
          "A bed and breakfast or a distinctive spot, for a real break if the budget allows",
          "Heading home, a simple option but one that cuts the evening shorter than planned",
        ],
      },
      {
        type: "text",
        title: "Book it alongside everything else",
        paragraphs: [
          "Treat this booking like the venue itself: as soon as the date is set. Rooms at or near the wedding venue fill up fast, especially in high season.",
          "If the wedding is held at an estate with lodging, check whether a suite or specific room is included in the package, or booked and paid separately.",
        ],
      },
      {
        type: "list",
        title: "What to check",
        items: [
          "Checkout time the next day, often later than usual on request",
          "Room service or a late breakfast, useful after a night that ends late",
          "Whether you can access the room during the party if you want to change",
          "A bag or suitcase packed ahead of time and dropped in the room before the ceremony",
        ],
      },
      {
        type: "text",
        title: "A budget line that's often forgotten",
        paragraphs: [
          "This night usually costs no more than a decent room, but it easily falls out of a wedding budget that did not plan for it from the start. Add it as its own line in your budget tracking.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Delegate carrying the luggage to a witness or family member: no one wants to haul a suitcase in wedding attire between the venue and the car at midnight.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To organize guest lodging in parallel, see our [guest accommodation](/blog/hebergement-invites-mariage) guide. Keep every booking, including your own, in Fiancé's lodging module.",
        ],
      },
    ],
  }),

  postPair({
    slug: "forme-peau-avant-mariage-preparer",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Préparer sa forme et sa peau avant le mariage",
    titleEn: "Getting your skin and wellbeing ready before the wedding",
    excerptFr:
      "Un calendrier réaliste et sans pression pour prendre soin de sa peau et de sa forme avant le jour J, sans changer de routine à la dernière minute.",
    excerptEn:
      "A realistic, no-pressure timeline for skin and wellbeing before the big day, without switching routines at the last minute.",
    readingMinutes: 6,
    heroAltFr: "Préparation peau et bien-être avant mariage",
    heroAltEn: "Skin and wellbeing prep before the wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Ce n'est pas un article sur un régime express ou une transformation de dernière minute. C'est un calendrier simple pour arriver reposé et à l'aise dans sa peau, sans céder à la pression du « il faut être parfait ».",
          "La règle de base : la peau réagit lentement. Un nouveau soin met plusieurs semaines à montrer un vrai résultat, et parfois plusieurs semaines à provoquer une réaction indésirable. D'où l'intérêt d'anticiper large.",
        ],
      },
      {
        type: "list",
        title: "Trois mois avant",
        items: [
          "Si vous voulez tester un nouveau soin ou une nouvelle routine, c'est le moment, jamais plus tard",
          "Un rendez-vous dermatologue ou esthéticienne pour un diagnostic peau si vous en ressentez le besoin",
          "Ajuster le sommeil devient plus payant sur la durée qu'un soin ponctuel : viser une routine de coucher stable",
        ],
      },
      {
        type: "list",
        title: "Un mois avant",
        items: [
          "Poursuivre la routine choisie sans en changer, même si les résultats semblent lents",
          "Éviter les soins agressifs (peeling fort, nouvelle épilation zone sensible) trop proches de la date",
          "Prévoir un essai coiffure et maquillage complet pour voir comment la peau réagit sous le rendu final",
        ],
      },
      {
        type: "list",
        title: "Les deux dernières semaines",
        items: [
          "Aucun nouveau produit, aucune nouvelle marque, même très recommandée par une amie",
          "Hydratation et sommeil priment sur tout soin ponctuel de dernière minute",
          "Un autobronzant ou une séance UV express se teste toujours plusieurs semaines avant, jamais la veille",
        ],
      },
      {
        type: "text",
        title: "Erreurs classiques à éviter",
        paragraphs: [
          "Changer de crème la veille du mariage parce qu'une amie en parle. Exfolier fort la peau juste avant pour la rendre « nette », ce qui provoque souvent l'effet inverse. Tester un maquillage waterproof le jour même sans essai préalable.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Ce calendrier n'a rien d'obligatoire ni de standard : gardez ce qui vous convient et laissez tomber le reste. Le seul vrai objectif est d'arriver reposé, pas transformé.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Intégrez ces échéances à votre [checklist de préparatifs](/blog/checklist-mariage-50-taches) pour ne pas les découvrir la semaine du mariage. Fiancé vous permet de caler des tâches personnelles à côté des tâches prestataires dans le même planning.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "This is not an article about a crash diet or a last-minute makeover. It's a simple timeline for arriving well rested and comfortable in your own skin, without giving in to the pressure of \"you have to be perfect\".",
          "The basic rule: skin reacts slowly. A new product takes several weeks to show a real result, and sometimes several weeks to trigger an unwanted reaction. That's why planning early pays off.",
        ],
      },
      {
        type: "list",
        title: "Three months before",
        items: [
          "If you want to try a new treatment or routine, now is the time, never later",
          "A dermatologist or esthetician appointment for a skin check, if you feel you need one",
          "Fixing your sleep pays off more over time than any one-off treatment: aim for a stable bedtime routine",
        ],
      },
      {
        type: "list",
        title: "One month before",
        items: [
          "Keep the routine you chose without changing it, even if results seem slow",
          "Avoid aggressive treatments (strong peels, new waxing in a sensitive area) too close to the date",
          "Book a full hair and makeup trial to see how your skin reacts under the final look",
        ],
      },
      {
        type: "list",
        title: "The last two weeks",
        items: [
          "No new product, no new brand, even one highly recommended by a friend",
          "Hydration and sleep matter more than any last-minute treatment",
          "A self-tanner or express UV session should always be tested weeks ahead, never the day before",
        ],
      },
      {
        type: "text",
        title: "Classic mistakes to avoid",
        paragraphs: [
          "Switching creams the night before the wedding because a friend mentioned one. Scrubbing skin hard right before to make it look \"clean\", which often backfires. Trying waterproof makeup for the first time on the day itself.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "This timeline is not mandatory or standard: keep what suits you and drop the rest. The only real goal is arriving rested, not transformed.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Add these deadlines to your [prep checklist](/blog/checklist-mariage-50-taches) so you don't discover them the week of the wedding. Fiancé lets you slot personal tasks next to vendor tasks in the same planning view.",
        ],
      },
    ],
  }),

  postPair({
    slug: "videaste-mariage-vaut-le-cout",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Vidéaste de mariage : est-ce que ça vaut le coût ?",
    titleEn: "Wedding videographer: is it worth the cost?",
    excerptFr:
      "Film court, cérémonie intégrale, drone : ce qu'apporte réellement un vidéaste, ce que les couples regrettent, et comment trancher selon votre budget.",
    excerptEn:
      "Short film, full ceremony, drone: what a videographer actually adds, what couples regret, and how to decide based on your budget.",
    readingMinutes: 7,
    heroAltFr: "Vidéaste de mariage en tournage",
    heroAltEn: "Wedding videographer filming",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Le vidéaste arrive souvent en fin de liste des prestataires, après le photographe, le traiteur et le DJ. Résultat : c'est aussi le premier poste sacrifié quand le budget se resserre. La question mérite pourtant d'être posée sérieusement plutôt que tranchée par défaut.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'un vidéaste apporte",
        items: [
          "Un film court (3 à 8 minutes), monté avec musique, qui capture l'ambiance générale de la journée",
          "L'enregistrement audio des voeux et des discours, souvent inaudibles ou mal captés sur les vidéos de smartphones des invités",
          "La cérémonie intégrale filmée, utile pour la revivre ou la partager avec des proches absents",
          "Des prises de vue en mouvement et parfois en drone, un rendu que la photo seule ne donne pas",
        ],
      },
      {
        type: "text",
        title: "Fourchette de budget",
        paragraphs: [
          "Le prix varie fortement selon le format : un film court avec une seule équipe coûte nettement moins qu'une couverture complète de la journée avec plusieurs caméras et un drone. Demandez toujours un devis détaillé par prestation plutôt qu'un forfait vague.",
        ],
      },
      {
        type: "list",
        title: "Ce que les couples regrettent souvent de ne pas avoir",
        items: [
          "Le son des voeux et des discours, cité presque systématiquement comme le regret numéro un",
          "Le premier regard et la première danse en mouvement, difficiles à revivre en photo seule",
          "Les petits moments entre les temps forts (rires, embrassades, ambiance de la salle)",
        ],
      },
      {
        type: "list",
        title: "Ce qu'on revisionne rarement",
        items: [
          "Les rushs bruts non montés, presque jamais regardés une fois le film final livré",
          "Les prises drone redondantes avec celles déjà faites par le photographe",
        ],
      },
      {
        type: "text",
        title: "Décider selon vos priorités",
        paragraphs: [
          "Si le budget photo est déjà serré, un format court avec voeux et discours en son capte l'essentiel sans exploser les coûts. Si le budget global le permet, la couverture complète reste le seul moyen de revivre la journée dans l'ordre, pas seulement en instantanés.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour équilibrer les deux postes, lisez notre guide pour [choisir son photographe de mariage](/blog/choisir-photographe-mariage) et comparez les devis des deux prestataires côte à côte dans Fiancé avant d'arbitrer.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The videographer usually lands at the bottom of the vendor list, after the photographer, caterer, and DJ. As a result, it's also the first line cut when the budget tightens. The question deserves a real look rather than a default no.",
        ],
      },
      {
        type: "list",
        title: "What a videographer actually adds",
        items: [
          "A short film (3 to 8 minutes), edited with music, capturing the day's overall feel",
          "Audio of the vows and speeches, often inaudible or poorly captured on guests' phone videos",
          "The full ceremony filmed, useful to relive or share with absent loved ones",
          "Moving shots and sometimes drone footage, a look photos alone can't give",
        ],
      },
      {
        type: "text",
        title: "Budget range",
        paragraphs: [
          "Price varies heavily by format: a short film with a single crew costs noticeably less than full-day coverage with multiple cameras and a drone. Always ask for a quote broken down by service rather than a vague package price.",
        ],
      },
      {
        type: "list",
        title: "What couples often regret not having",
        items: [
          "The sound of vows and speeches, cited almost universally as regret number one",
          "The first look and first dance in motion, hard to relive from photos alone",
          "The small moments between the big ones (laughs, hugs, the room's mood)",
        ],
      },
      {
        type: "list",
        title: "What rarely gets rewatched",
        items: [
          "Raw unedited footage, almost never watched once the final film is delivered",
          "Drone shots that duplicate what the photographer already captured",
        ],
      },
      {
        type: "text",
        title: "Decide based on your priorities",
        paragraphs: [
          "If the photo budget is already tight, a short format with vows and speeches in audio captures the essentials without blowing up costs. If the overall budget allows it, full coverage remains the only way to relive the day in order, not just as snapshots.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To balance the two line items, read our guide on [choosing your wedding photographer](/blog/choisir-photographe-mariage) and compare both vendors' quotes side by side in Fiancé before deciding.",
        ],
      },
    ],
  }),

  postPair({
    slug: "location-mobilier-vaisselle-mariage",
    categoryKey: "budget",
    categoryFr: "Budget",
    categoryEn: "Budget",
    titleFr: "Location mobilier et vaisselle : ce que le traiteur n'inclut pas",
    titleEn: "Furniture and tableware rental: what the caterer doesn't include",
    excerptFr:
      "Chaises spécifiques, mange-debout, verres à cocktail : les postes de location que les devis traiteur laissent souvent de côté.",
    excerptEn:
      "Specific chairs, cocktail tables, bar glassware: the rental items caterer quotes often leave out.",
    readingMinutes: 6,
    heroAltFr: "Location mobilier et vaisselle mariage",
    heroAltEn: "Wedding furniture and tableware rental",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Un devis traiteur mentionne rarement tout le mobilier dont vous aurez besoin. Beaucoup de couples découvrent l'écart seulement quelques semaines avant le mariage, quand il faut louer en urgence et payer plus cher.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'un traiteur inclut généralement",
        items: [
          "Assiettes et couverts standards pour le nombre de convives prévu",
          "Verres basiques pour le service à table (eau, vin)",
          "Tables rondes ou rectangulaires classiques, souvent nappées en blanc",
          "Chaises standard du prestataire, modèle unique le plus souvent",
        ],
      },
      {
        type: "list",
        title: "Ce qui manque souvent",
        items: [
          "Des chaises d'un style particulier (chiavari, bois, transparentes) si le mobilier standard ne correspond pas à la décoration",
          "Des mange-debout ou tables hautes pour le cocktail, rarement inclus dans un forfait repas assis",
          "Une vaisselle assortie à une thématique ou une couleur précise",
          "Des verres spécifiques pour un bar à cocktails ou une fontaine à champagne",
          "Un nappage de couleur, souvent facturé en supplément par rapport au blanc standard",
        ],
      },
      {
        type: "text",
        title: "Comment vérifier un devis traiteur",
        paragraphs: [
          "Demandez la liste exacte du matériel inclus, ligne par ligne, plutôt qu'une mention générale « vaisselle et mobilier fournis ». Précisez le nombre de mange-debout si vous prévoyez un cocktail long, et le style de chaise si la décoration compte pour vous.",
        ],
      },
      {
        type: "list",
        title: "Astuces pour maîtriser ce poste",
        items: [
          "Comparer un loueur événementiel indépendant au tarif du traiteur pour le même article : l'écart peut être significatif",
          "Mutualiser avec la salle de réception si elle propose déjà certains éléments en interne",
          "Louer uniquement ce qui change vraiment l'ambiance (chaises, nappage) et garder le standard sur le reste",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Vérifiez toujours qu'un article loué en plus n'est pas déjà facturé dans le forfait traiteur, sous peine de payer deux fois la même chose.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Comparez plusieurs devis traiteur ligne par ligne avec notre guide [comparer les devis traiteur](/blog/comparer-devis-traiteur-mariage), et suivez ce poste de location à part dans votre [budget](/tools/budget-calculator).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "A caterer's quote rarely mentions all the furniture you'll actually need. Many couples discover the gap only a few weeks before the wedding, when renting in a rush costs more.",
        ],
      },
      {
        type: "list",
        title: "What a caterer usually includes",
        items: [
          "Standard plates and cutlery for the planned guest count",
          "Basic glasses for table service (water, wine)",
          "Classic round or rectangular tables, often draped in white",
          "The caterer's standard chairs, usually a single model",
        ],
      },
      {
        type: "list",
        title: "What's often missing",
        items: [
          "Chairs in a specific style (chiavari, wood, clear acrylic) if the standard ones clash with the decor",
          "Cocktail or high tables, rarely included in a seated-meal package",
          "Tableware matched to a specific theme or color",
          "Specific glassware for a cocktail bar or a champagne fountain",
          "Colored linens, often billed as an extra over standard white",
        ],
      },
      {
        type: "text",
        title: "How to check a caterer's quote",
        paragraphs: [
          "Ask for the exact list of included items, line by line, rather than a general \"tableware and furniture provided\" note. Specify the number of high tables if you're planning a long cocktail hour, and the chair style if decor matters to you.",
        ],
      },
      {
        type: "list",
        title: "Tips to keep this line under control",
        items: [
          "Compare an independent event rental company against the caterer's price for the same item: the gap can be significant",
          "Share resources with the venue if it already provides some items in-house",
          "Only rent what genuinely changes the look (chairs, linens) and keep the standard on everything else",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Always check that an extra rented item isn't already billed within the caterer's package, or you'll pay for it twice.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Compare several caterer quotes line by line with our guide on [comparing caterer quotes](/blog/comparer-devis-traiteur-mariage), and track this rental line separately in your [budget](/tools/budget-calculator).",
        ],
      },
    ],
  }),

  postPair({
    slug: "plan-table-couples-familles-brouillees",
    categoryKey: "seating",
    categoryFr: "Plan de table",
    categoryEn: "Seating",
    titleFr: "Plan de table : gérer couples séparés et familles brouillées",
    titleEn: "Seating chart: handling separated couples and feuding families",
    excerptFr:
      "Ex, familles recomposées, branches en froid : les tactiques concrètes pour un plan de table qui évite les tensions sans exclure personne.",
    excerptEn:
      "Exes, blended families, feuding branches: concrete tactics for a seating chart that avoids tension without excluding anyone.",
    readingMinutes: 7,
    heroAltFr: "Plan de table familles brouillées mariage",
    heroAltEn: "Wedding seating chart with feuding families",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Certains plans de table se bloquent moins sur le nombre de tables que sur trois ou quatre invités qu'il ne faut surtout pas asseoir près l'un de l'autre. Ce n'est pas un problème de logistique, c'est un problème relationnel, et les deux se traitent différemment.",
        ],
      },
      {
        type: "list",
        title: "Couples séparés ou ex présents au mariage",
        items: [
          "Éloignez les tables sans les opposer visuellement : évitez qu'elles se fassent face en ligne directe",
          "Placez chacun avec son propre groupe d'amis ou de famille, pas isolé à une table neutre qui se remarque",
          "Si les deux ont un nouveau partenaire, gardez une distance physique réelle entre les deux tables, pas seulement une table d'écart",
        ],
      },
      {
        type: "list",
        title: "Branches familiales en froid",
        items: [
          "Ne cherchez pas à les réconcilier ce jour-là, ce n'est pas le rôle d'un mariage",
          "Utilisez une table tampon avec des invités neutres, appréciés des deux côtés, entre les deux branches",
          "Répartissez les branches de part et d'autre de la salle plutôt que sur des tables voisines",
        ],
      },
      {
        type: "text",
        title: "Communiquer sans faire de drame",
        paragraphs: [
          "Demandez discrètement à vos témoins ou vos parents les informations sensibles que vous ne connaissez pas forcément (qui ne se parle plus, qui vient accompagné d'une nouvelle personne). Notez-les en privé, jamais dans un document partagé accessible à tous.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Gardez en tête l'objectif réel : que chacun passe une bonne soirée, pas que le plan de table règle des comptes familiaux. Un placement discret vaut mieux qu'un placement qui envoie un message.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour les bases du placement, voir notre [guide complet du plan de table](/blog/plan-de-table-mariage-guide-complet) et les [5 règles de placement](/blog/plan-de-table-5-regles-placement). Le [plan de table Fiancé](/tools/seating-chart) vous permet de déplacer les invités par glisser-déposer autant de fois que nécessaire, sans tout refaire à la main.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Some seating charts stall not on the number of tables but on three or four guests who really cannot sit near each other. That's not a logistics problem, it's a relationship problem, and the two call for different tactics.",
        ],
      },
      {
        type: "list",
        title: "Separated couples or exes attending",
        items: [
          "Put distance between the tables without visually pitting them against each other: avoid a direct line of sight",
          "Seat each with their own group of friends or family, not isolated at a noticeably neutral table",
          "If both have a new partner, keep real physical distance between the two tables, not just one table apart",
        ],
      },
      {
        type: "list",
        title: "Feuding family branches",
        items: [
          "Don't try to reconcile them that day, that's not a wedding's job",
          "Use a buffer table with neutral guests liked by both sides, placed between the two branches",
          "Spread the branches across opposite sides of the room rather than at neighboring tables",
        ],
      },
      {
        type: "text",
        title: "Communicate without drama",
        paragraphs: [
          "Quietly ask your witnesses or parents for the sensitive details you might not know (who isn't speaking, who's bringing a new partner). Keep notes private, never in a document shared with everyone.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Keep the real goal in mind: everyone has a good evening, not that the seating chart settles family scores. A quiet placement beats one that sends a message.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For seating basics, see our [complete seating chart guide](/blog/plan-de-table-mariage-guide-complet) and the [5 seating rules](/blog/plan-de-table-5-regles-placement). The [Fiancé seating chart](/tools/seating-chart) lets you drag and drop guests as many times as needed, without redoing everything by hand.",
        ],
      },
    ],
  }),

  postPair({
    slug: "escort-cards-marque-places-plan-mural",
    categoryKey: "seating",
    categoryFr: "Plan de table",
    categoryEn: "Seating",
    titleFr: "Escort cards, marque-places, plan mural : s'y retrouver",
    titleEn: "Escort cards, place cards, seating charts: telling them apart",
    excerptFr:
      "Trois formats, trois usages différents : ce qui indique juste une table, ce qui indique une place précise, et ce qui affiche tout le plan.",
    excerptEn:
      "Three formats, three different jobs: what points to a table, what assigns an exact seat, and what displays the whole layout.",
    readingMinutes: 5,
    heroAltFr: "Escort cards et marque-places mariage",
    heroAltEn: "Wedding escort cards and place cards",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Ces trois termes reviennent souvent dans les devis et les inspirations Pinterest, et ils se mélangent facilement. Chacun a pourtant un rôle précis, et vous n'avez pas forcément besoin des trois.",
        ],
      },
      {
        type: "list",
        title: "Escort cards",
        items: [
          "Une petite carte au nom de l'invité, disposée sur une table à l'entrée de la salle",
          "Elle indique uniquement le numéro de table, pas une place précise à l'intérieur de celle-ci",
          "Utile quand le placement à table lui-même est libre, seule la table est assignée",
        ],
      },
      {
        type: "list",
        title: "Marque-places",
        items: [
          "Une carte posée directement sur chaque assiette, à la place exacte de l'invité",
          "Nécessaire dès que le repas propose un choix de menu, pour que le service sache qui a commandé quoi",
          "Permet aussi de gérer finement les affinités à l'intérieur même d'une table",
        ],
      },
      {
        type: "list",
        title: "Plan mural (ou plan d'affichage)",
        items: [
          "Un grand support visuel, affiché à l'entrée, qui montre l'ensemble des tables et qui y est assis",
          "Pratique pour les grandes réceptions où chercher son nom carte par carte prendrait du temps",
          "Peut remplacer les escort cards ou les compléter, selon la taille de la réception",
        ],
      },
      {
        type: "text",
        title: "Quel format choisir selon votre mariage",
        paragraphs: [
          "Pour une petite réception avec placement libre à table, des escort cards suffisent largement. Dès qu'il y a un choix de menu ou plus de cent invités, les marque-places deviennent presque indispensables. Le plan mural s'ajoute surtout à partir d'une réception nombreuse, en complément plutôt qu'en remplacement.",
        ],
      },
      {
        type: "text",
        title: "Le lien avec votre plan de table Fiancé",
        paragraphs: [
          "Le plan de table dans Fiancé reste l'outil interne qui centralise qui est assis où. L'export PDF généré ensuite sert de base pour imprimer vos escort cards, vos marque-places ou votre plan mural, sans ressaisir la liste ailleurs.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour transmettre la version finale à votre traiteur au bon format, voir [finaliser le plan de table avec le traiteur](/blog/finaliser-plan-de-table-traiteur). Construisez le vôtre avec le [plan de table Fiancé](/tools/seating-chart).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "These three terms show up constantly in quotes and Pinterest boards, and they blur together easily. Each has a specific job, though, and you don't necessarily need all three.",
        ],
      },
      {
        type: "list",
        title: "Escort cards",
        items: [
          "A small card with a guest's name, set on a table near the entrance",
          "It only points to a table number, not an exact seat within it",
          "Useful when seating within a table is open, only the table itself is assigned",
        ],
      },
      {
        type: "list",
        title: "Place cards",
        items: [
          "A card set directly on each place setting, at the guest's exact seat",
          "Needed as soon as the meal offers a menu choice, so service staff know who ordered what",
          "Also lets you fine-tune who sits next to whom within a single table",
        ],
      },
      {
        type: "list",
        title: "Wall or display chart",
        items: [
          "A large visual board, displayed at the entrance, showing every table and who sits where",
          "Handy for big receptions where hunting card by card would take too long",
          "Can replace escort cards or complement them, depending on the reception's size",
        ],
      },
      {
        type: "text",
        title: "Which format fits your wedding",
        paragraphs: [
          "For a small reception with open seating within tables, escort cards are plenty. Once there's a menu choice or more than a hundred guests, place cards become nearly essential. A wall chart mostly comes in for larger receptions, as a complement rather than a replacement.",
        ],
      },
      {
        type: "text",
        title: "How this connects to your Fiancé seating chart",
        paragraphs: [
          "The seating chart in Fiancé stays the internal tool that centralizes who sits where. The PDF export it generates becomes the base for printing your escort cards, place cards, or wall chart, without re-typing the list anywhere else.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To hand the final version to your caterer in the right format, see [finalizing the seating chart with your caterer](/blog/finaliser-plan-de-table-traiteur). Build yours with the [Fiancé seating chart](/tools/seating-chart).",
        ],
      },
    ],
  }),

  postPair({
    slug: "fiance-vs-the-knot-zola",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Fiancé vs The Knot / Zola : apps américaines face au marché français",
    titleEn: "Fiancé vs The Knot / Zola: US apps facing the French market",
    excerptFr:
      "The Knot et Zola dominent le marché américain de la planification mariage. Voici où elles brillent, et où le marché français a besoin d'autre chose.",
    excerptEn:
      "The Knot and Zola dominate the US wedding planning market. Here is where they shine, and where the French market needs something else.",
    readingMinutes: 7,
    heroAltFr: "Comparatif Fiancé, The Knot et Zola",
    heroAltEn: "Fiancé vs The Knot and Zola comparison",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "The Knot et Zola sont des plateformes de planification mariage nées aux Etats-Unis, où elles occupent une place centrale : liste de cadeaux, annuaire de prestataires, site de mariage, et outils de gestion associés. Beaucoup de couples français les découvrent en cherchant de l'inspiration en ligne.",
          "Fiancé est une app respectueuse de la vie privée : sans pub, sans abonnement. La version gratuite couvre déjà un mariage intimiste : jusqu'à 30 invités, 3 prestataires, 1 événement et 25 tâches personnalisées, avec sync chiffrée multi-appareils et partage avec votre partenaire. Un achat unique à vie débloque invités, prestataires, événements et tâches illimités, le partage avec famille et prestataires, le budget avancé et la page publique complète.",
          "Ce ne sont pas des concurrentes directes sur le marché français : leur écosystème de prestataires, leurs listes de cadeaux et leur logique administrative restent pensés pour les Etats-Unis.",
        ],
      },
      {
        type: "list",
        title: "Ce que The Knot et Zola font bien",
        items: [
          "Un annuaire de prestataires massif aux Etats-Unis, avec avis et comparateurs de prix détaillés",
          "Une liste de cadeaux universelle intégrée nativement, très ancrée dans les usages américains",
          "Un site de mariage personnalisable avec de nombreux modèles graphiques",
          "Des outils budget et checklist matures, éprouvés sur des millions de mariages",
          "Une application mobile complète et un écosystème publicitaire qui finance la gratuité",
        ],
      },
      {
        type: "list",
        title: "Fonctions Fiancé incluses gratuitement",
        items: [
          "Budget : dépenses, acomptes, échéances, export PDF/CSV",
          "Jusqu'à 30 invités et RSVP en ligne (page publique, sans compte invité)",
          "Plan de table drag-and-drop, sync RSVP, export PDF traiteur",
          "Jusqu'à 3 prestataires : devis, statuts prospect → réservé",
          "Planning : checklist complète illimitée, jusqu'à 25 tâches personnalisées, rétroplanning calé sur la date",
          "Timeline jour J minute par minute, mode lecture le grand jour",
          "Suivi invitations : save-the-date, faire-part, communications par invité",
          "Hébergement invités : hôtels, gîtes, qui loge où",
          "Sync chiffrée multi-appareils avec votre partenaire (iOS, Android, web)",
        ],
      },
      {
        type: "list",
        title: "Premium : achat unique à vie (pas d'abonnement)",
        items: [
          "Achat unique à vie, jamais d'abonnement mensuel",
          "Invités, prestataires, événements et tâches illimités",
          "Invitez plus que votre partenaire : famille, wedding planner, prestataires",
          "Budget avancé : catégories, contributeurs, comparateur de devis prestataires",
          "Page publique complète : liste de cadeaux pour vos invités",
        ],
      },
      {
        type: "text",
        title: "Tableau comparatif rapide",
        paragraphs: [
          "| Critère | Fiancé | The Knot / Zola |",
          "| Marché principal | France | Etats-Unis |",
          "| Annuaire prestataires | Non (vous ajoutez les vôtres) | Oui, cœur du produit |",
          "| Liste de cadeaux intégrée | Non (lien externe possible) | Oui, native |",
          "| Étapes administratives françaises (mairie, bans) | Prises en compte dans le guide et le planning | Absentes |",
          "| Publicités et mise en avant prestataires | Aucune | Modèle marketplace, part du financement |",
          "| Données | Locales, sync chiffrée (achat unique) | Compte cloud centralisé |",
          "| Abonnement | Non (achat unique optionnel) | Non (marketplace) |",
          "| Devise et tarifs prestataires | Euros, marché français | Dollars, marché américain |",
        ],
      },
      {
        type: "text",
        title: "Ce qui manque à ces apps sur le marché français",
        paragraphs: [
          "La cérémonie civile en mairie, les délais de bans, le livret de famille : ces étapes françaises n'existent pas dans le référentiel de ces apps, pensées pour un contexte administratif américain.",
          "Les prix affichés et les comparateurs de prestataires restent calés sur le marché américain, peu utiles pour un devis traiteur ou une salle en France, en euros et avec les usages français (vin d'honneur, plan de table par affinités, régimes alimentaires précis).",
          "Le modèle économique repose largement sur la mise en avant de prestataires partenaires et la publicité, ce qui pose la question de ce qui est monétisé sur vos données de couple.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Notre avis : The Knot et Zola restent de bonnes références si vous vous mariez aux Etats-Unis ou cherchez de l'inspiration internationale. Pour un mariage organisé en France, avec ses spécificités administratives et un besoin de confidentialité sur les données invités, Fiancé reste centré sur cet usage précis, sans publicité ni abonnement. Voir aussi notre [top 5 des applications mariage 2026](/blog/top-5-applications-mariage-2026).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The Knot and Zola are wedding planning platforms born in the US, where they hold a central place: gift registry, vendor directory, wedding website, and connected planning tools. Many French couples discover them while browsing for inspiration online.",
          "Fiancé is a privacy-respecting app: no ads, no subscription. The free tier already covers an intimate wedding: up to 30 guests, 3 vendors, 1 event, and 25 custom tasks, with encrypted multi-device sync and partner sharing included. A one-time lifetime purchase unlocks unlimited guests, vendors, events, and tasks, sharing with family and vendors, advanced budget tools, and the full public page.",
          "They are not direct competitors on the French market: their vendor ecosystem, gift registries, and administrative logic remain built around the US.",
        ],
      },
      {
        type: "list",
        title: "What The Knot and Zola do well",
        items: [
          "A massive vendor directory in the US, with reviews and detailed price comparisons",
          "A universal gift registry built in natively, deeply tied to US conventions",
          "A customizable wedding website with many design templates",
          "Mature budget and checklist tools, proven across millions of weddings",
          "A full mobile app and an advertising ecosystem that funds the free tier",
        ],
      },
      {
        type: "list",
        title: "Fiancé features included free",
        items: [
          "Budget: expenses, deposits, due dates, PDF/CSV export",
          "Up to 30 guests and online RSVP (public page, no guest account)",
          "Drag-and-drop seating chart, RSVP sync, caterer PDF export",
          "Up to 3 vendors: quotes, prospect to booked status",
          "Planning: full unlimited checklist, up to 25 custom tasks, timeline tied to wedding date",
          "Day-of timeline minute by minute, read mode on the big day",
          "Invitation tracking: save-the-date, invites, per-guest comms",
          "Guest lodging: hotels, rentals, who stays where",
          "Encrypted multi-device sync with your partner (iOS, Android, web)",
        ],
      },
      {
        type: "list",
        title: "Premium: one-time lifetime purchase (no subscription)",
        items: [
          "One-time lifetime purchase, never a monthly subscription",
          "Unlimited guests, vendors, events, and tasks",
          "Invite more than your partner: family, wedding planner, vendors",
          "Advanced budget: categories, contributors, vendor quote comparison",
          "Full public page: gift registry for your guests",
        ],
      },
      {
        type: "text",
        title: "Quick comparison table",
        paragraphs: [
          "| Criteria | Fiancé | The Knot / Zola |",
          "| Primary market | France | United States |",
          "| Vendor directory | No (you add your own) | Yes, core product |",
          "| Built-in gift registry | No (external link possible) | Yes, native |",
          "| French administrative steps (town hall, banns) | Covered in the guide and planning | Absent |",
          "| Ads and vendor promotion | None | Marketplace model, part of the funding |",
          "| Data | Local, encrypted sync (one-time purchase) | Centralized cloud account |",
          "| Subscription | No (optional lifetime purchase) | No (marketplace) |",
          "| Currency and vendor pricing | Euros, French market | Dollars, US market |",
        ],
      },
      {
        type: "text",
        title: "Where these apps fall short on the French market",
        paragraphs: [
          "The civil ceremony at the town hall, the publication of banns, the family record book: these French steps don't exist in these apps' framework, built for a US administrative context.",
          "Listed prices and vendor comparators stay calibrated for the US market, of little use for a French caterer or venue quote in euros and with French conventions (cocktail hour, affinity-based seating, precise dietary needs).",
          "The business model leans heavily on promoting partner vendors and advertising, which raises the question of what exactly gets monetized from your data as a couple.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Our take: The Knot and Zola remain solid references if you're marrying in the US or looking for international inspiration. For a wedding organized in France, with its administrative specifics and a need for privacy around guest data, Fiancé stays focused on that exact use case, with no ads and no subscription. See also our [top 5 wedding apps 2026](/blog/top-5-applications-mariage-2026).",
        ],
      },
    ],
  }),

  postPair({
    slug: "checklist-jour-j-mallette-secours",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Mallette de secours jour J : la checklist anti-imprévu",
    titleEn: "Wedding-day emergency kit: the just-in-case checklist",
    excerptFr:
      "Kit couture, pansements, chargeur : la mallette de secours qui règle la plupart des petits pépins du jour J en quelques secondes.",
    excerptEn:
      "Sewing kit, blister plasters, charger: the emergency kit that solves most wedding-day hiccups in seconds.",
    readingMinutes: 6,
    heroAltFr: "Mallette de secours jour J mariage",
    heroAltEn: "Wedding-day emergency kit",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Après des mois de préparatifs, le jour J se joue souvent sur des détails minuscules : un ourlet qui craque, une chaussure qui blesse, une tache sur la chemise du témoin. Rien de grave, à condition d'avoir la bonne mallette à portée de main.",
          "Voici la liste qui couvre l'immense majorité des petits imprévus, sans avoir besoin de courir jusqu'à la pharmacie en pleine cérémonie.",
        ],
      },
      {
        type: "list",
        title: "Couture et tissu",
        items: [
          "Kit de couture mini (fil blanc et fil noir, aiguilles) pour un ourlet ou un bouton qui lâche",
          "Épingles à nourrice, plusieurs tailles, pour un ajustement rapide de robe ou de costume",
          "Stylo retire-tache, indispensable contre une éclaboussure de vin ou de sauce",
          "Ruban adhésif double face, pour un décolleté ou un ourlet récalcitrant",
        ],
      },
      {
        type: "list",
        title: "Santé et confort",
        items: [
          "Antalgiques courants (maux de tête, douleurs)",
          "Pansements anti-ampoules, surtout si des chaussures neuves sont de sortie",
          "Mouchoirs et lingettes, pour les larmes d'émotion comme pour les petits accidents",
          "Collants ou chaussettes de rechange, surtout côté mariée",
          "Chewing-gum ou bonbons à la menthe pour tout le monde",
        ],
      },
      {
        type: "list",
        title: "Technique et logistique",
        items: [
          "Batterie externe et câble de chargement, le téléphone sert toute la journée pour la musique ou les photos",
          "Élastiques et épingles à cheveux, toujours utiles en cas de coiffure qui bouge",
          "Petite lampe torche pour les photos de nuit ou un coin sombre du lieu",
        ],
      },
      {
        type: "text",
        title: "Qui porte la mallette",
        paragraphs: [
          "Désignez une seule personne responsable, en général un témoin ou un proche organisé, plutôt que de laisser la mallette traîner dans un coin. Cette personne doit savoir où elle est à tout moment de la journée, y compris pendant les trajets entre la mairie, la cérémonie et la salle.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Testez le contenu quelques jours avant : un stylo retire-tache périmé ou une batterie externe déchargée ne serviront à rien le jour venu.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Cette mallette est le dernier filet de sécurité d'une journée déjà bien préparée. Pour la suite des imprévus possibles, voir notre guide [gérer les imprévus du jour J](/blog/imprevus-jour-j-mariage), et calez qui porte la mallette dans votre [timeline minute par minute](/blog/planning-jour-j-minute-par-minute). Vous avez fait le plus dur : le jour J, il ne reste qu'à en profiter.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "After months of planning, the wedding day often comes down to tiny details: a hem that gives way, a shoe that rubs, a stain on the best man's shirt. Nothing serious, as long as the right kit is within reach.",
          "Here is the list that covers the vast majority of small hiccups, without needing to run to a pharmacy mid-ceremony.",
        ],
      },
      {
        type: "list",
        title: "Sewing and fabric",
        items: [
          "A mini sewing kit (white and black thread, needles) for a hem or a button that gives way",
          "Safety pins, several sizes, for a quick dress or suit adjustment",
          "A stain-removal pen, essential against a splash of wine or sauce",
          "Double-sided fashion tape, for a stubborn neckline or hem",
        ],
      },
      {
        type: "list",
        title: "Health and comfort",
        items: [
          "Common painkillers (headaches, aches)",
          "Blister plasters, especially with new shoes out for the day",
          "Tissues and wipes, for happy tears as much as small accidents",
          "Spare tights or socks, especially for the bride",
          "Chewing gum or mints for everyone",
        ],
      },
      {
        type: "list",
        title: "Tech and logistics",
        items: [
          "A power bank and charging cable, the phone works all day for music or photos",
          "Hair ties and bobby pins, always useful when a hairstyle shifts",
          "A small flashlight for night photos or a dark corner of the venue",
        ],
      },
      {
        type: "text",
        title: "Who carries the kit",
        paragraphs: [
          "Assign a single person responsible for it, usually an organized witness or family member, rather than leaving it in a random corner. That person should know where it is at every point in the day, including during transfers between the town hall, the ceremony, and the venue.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Test the contents a few days ahead: an expired stain pen or a dead power bank will do no good on the day.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "This kit is the last safety net of a day you've already planned well. For more possible hiccups, see our guide on [handling wedding-day surprises](/blog/imprevus-jour-j-mariage), and slot who carries the kit into your [minute-by-minute timeline](/blog/planning-jour-j-minute-par-minute). You've done the hard part: on the day itself, all that's left is to enjoy it.",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_115_124_FR, en: POSTS_115_124_EN } = pairsToArrays(pairs);
