import type { BlogPost, BlogSection } from "./blog-types";

const BASE_URL = "https://fiance.drakkar.software";
const HERO = `${BASE_URL}/assets/og-image.png`;

const DISCLAIMER_FR: BlogSection = {
  type: "text",
  title: "Avertissement",
  paragraphs: [
    "Veuillez noter que le contenu de cet article est destiné à des fins d'information générale uniquement et ne constitue pas un conseil professionnel. Les informations contenues ici sont fournies à titre informatif. Rien dans ce document ne doit être interprété comme un conseil juridique, financier ou fiscal. Le contenu de cet article reflète les opinions de l'auteur et/ou de l'équipe Drakkar Software. Aucun des auteurs n'est conseiller agréé dans un domaine réglementé, sauf mention explicite. L'utilisation de tout produit ou méthode décrit ici peut comporter des risques. L'auteur et/ou Drakkar Software ne garantissent aucun résultat particulier. Les résultats passés ne préjugent pas des résultats futurs.",
  ],
};

const DISCLAIMER_EN: BlogSection = {
  type: "text",
  title: "Disclaimer",
  paragraphs: [
    "Please be advised that the contents of this article are intended for general information purposes only and not professional advice. The information contained herein is for informational purposes only. Nothing herein shall be construed as legal, financial, or tax advice. The content of this article reflects the opinions of the author and/or the Drakkar Software team. None of the authors are licensed advisors in regulated fields unless explicitly stated. Using any product or method discussed here may involve risk. The author and/or Drakkar Software does not guarantee any particular outcome. Past results do not indicate future results.",
  ],
};

export const POSTS_3_10_FR: BlogPost[] = [
  {
    slug: "retroplanning-mariage-mois-par-mois",
    categoryKey: "planning",
    category: "Préparatifs",
    title: "Rétroplanning mariage : le calendrier mois par mois",
    excerpt:
      "De 12 mois à J-7 : quoi faire à chaque étape pour ne rien oublier. Un calendrier concret, pas une liste vague.",
    date: "2026-06-29",
    readingMinutes: 7,
    heroImage: HERO,
    heroImageAlt: "Rétroplanning mariage mois par mois",
    sections: [
      {
        type: "text",
        paragraphs: [
          "Un rétroplanning mariage, c'est votre date de jour J lue à l'envers : chaque mois a 4 à 8 actions claires. Sans ce calendrier, on finit par tout faire en même temps trois mois avant.",
          "Ce guide part du scénario le plus courant en France : environ 12 mois de préparation. Si vous avez plus ou moins de temps, voyez aussi [combien de temps prévoir](/blog/combien-temps-organiser-mariage).",
        ],
      },
      {
        type: "list",
        title: "12 à 10 mois avant",
        items: [
          "Fixer la date et le budget plafond",
          "Esquisser la liste d'invités (ordre de grandeur)",
          "Visiter et réserver le lieu de réception",
          "Démarrer la recherche photographe et traiteur",
        ],
      },
      {
        type: "list",
        title: "9 à 7 mois avant",
        items: [
          "Confirmer photographe, traiteur, musique",
          "Choisir témoins et définir qui fait quoi",
          "Lancer les démarches mairie ou parcours religieux",
          "Repérer tenues (robe, costume) et planifier essayages",
        ],
      },
      {
        type: "list",
        title: "6 à 4 mois avant",
        items: [
          "Envoyer save-the-date puis faire-part",
          "Finaliser fleuriste, beauté, transport si besoin",
          "Commander alliances et accessoires",
          "Valider le menu avec le traiteur",
        ],
      },
      {
        type: "list",
        title: "3 à 2 mois avant",
        items: [
          "Relancer les RSVP (cible : réponses 6 semaines avant le jour J)",
          "Construire le [plan de table](/tools/seating-chart)",
          "Organiser hébergement des invités de loin",
          "Rédiger le programme du jour J",
        ],
      },
      {
        type: "list",
        title: "1 mois à J-7",
        items: [
          "Confirmer effectifs au traiteur et au lieu",
          "Derniers essayages et retouches",
          "Préparer paiements restants et pourboires",
          "Brief témoins, officiant, DJ sur le déroulé",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Astuce : une tâche notée avec une échéance vaut mieux que dix idées en tête. C'est pour ça que nous avons calé la checklist Fiancé sur des libellés du type « 9 mois avant » plutôt que des dates fixes.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Fiancé génère un rétroplanning à partir de votre date de mariage. Les tâches en retard remontent sur l'accueil. Vous pouvez aussi exporter le [planning jour J](/tools/timeline) en PDF.",
        ],
      },
      DISCLAIMER_FR,
    ],
  },
  {
    slug: "organiser-mariage-10-etapes",
    categoryKey: "planning",
    category: "Préparatifs",
    title: "Organiser son mariage en 10 étapes (dans le bon ordre)",
    excerpt:
      "Ce n'est pas une checklist à cocher au hasard. Dix étapes avec des dépendances : budget avant lieu, lieu avant faire-part, RSVP avant plan de table.",
    date: "2026-06-29",
    readingMinutes: 6,
    heroImage: HERO,
    heroImageAlt: "Organiser son mariage en 10 étapes",
    sections: [
      {
        type: "text",
        paragraphs: [
          "La plupart des guides listent dix puces dans un ordre arbitraire. En pratique, certaines étapes bloquent les suivantes. Voici l'ordre que nous recommandons après avoir accompagné des dizaines de couples sur Fiancé.",
        ],
      },
      {
        type: "list",
        title: "Les 10 étapes dans l'ordre",
        items: [
          "1. Fixer le budget global (plafond, pas une fourchette vague)",
          "2. Choisir une date ou une fenêtre de 2 à 3 mois",
          "3. Estimer la liste d'invités (fourchette haute et basse)",
          "4. Réserver le lieu de réception",
          "5. Engager traiteur et photographe",
          "6. Confirmer musique, fleurs, officiant si besoin",
          "7. Envoyer faire-part et collecter les RSVP",
          "8. Finaliser menu, plan de table et hébergements",
          "9. Valider tenues, alliances, programme du jour J",
          "10. Coordination finale avec témoins et prestataires (J-2 à J-7)",
        ],
      },
      {
        type: "quote",
        quote:
          "Une étape en retard n'est pas un détail : elle décale toutes celles qui en dépendent.",
      },
      {
        type: "text",
        title: "Où les couples se trompent le plus",
        paragraphs: [
          "Comparer des photographes avant d'avoir un budget. Envoyer des faire-part avant d'avoir une date ferme. Construire un plan de table avant les RSVP.",
          "Si vous hésitez entre deux étapes, demandez-vous : « Est-ce que j'ai besoin de la réponse pour passer à la suivante ? »",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Fiancé centralise budget, invités, prestataires et tâches. La checklist pré-remplie suit un ordre logique que vous pouvez adapter. Commencez par [les premières étapes](/blog/premieres-etapes-organiser-mariage) si vous venez de vous fiancer.",
        ],
      },
    ],
  },
  {
    slug: "mariage-6-mois-checklist",
    categoryKey: "planning",
    category: "Préparatifs",
    title: "Mariage en 6 mois : checklist accélérée",
    excerpt:
      "Date dans six mois ? C'est serré mais faisable. Voici quoi prioriser, quoi simplifier, et ce qui ne se négocie pas.",
    date: "2026-06-29",
    readingMinutes: 5,
    heroImage: HERO,
    heroImageAlt: "Organiser un mariage en 6 mois",
    sections: [
      {
        type: "text",
        paragraphs: [
          "Six mois, c'est en dessous de la moyenne nationale (environ 14 mois selon les baromètres du secteur). Vous devrez arbitrer : moins de prestataires au choix, parfois un format plus intimiste, et zéro procrastination sur l'administratif.",
        ],
      },
      {
        type: "list",
        title: "Semaine 1 à 2 : verrouiller le cadre",
        items: [
          "Budget ferme et liste d'invités réaliste",
          "Réserver un lieu disponible (accepter un créneau vendredi ou hors saison si besoin)",
          "Bloquer photographe et traiteur le même jour",
        ],
      },
      {
        type: "list",
        title: "Mois 2 à 3 : invités et admin",
        items: [
          "Faire-part simple, envoi immédiat (pas de save-the-date)",
          "Mairie ou parcours religieux : lancer sans attendre",
          "Tenues : prêt-à-porter ou location, pas de sur-mesure long",
        ],
      },
      {
        type: "list",
        title: "Mois 4 à 6 : exécution",
        items: [
          "RSVP relancés toutes les deux semaines",
          "Plan de table dès 80 % de réponses",
          "Programme jour J validé à J-14",
        ],
      },
      {
        type: "text",
        title: "Ce qu'on peut simplifier",
        paragraphs: [
          "Décoration florale légère, un seul lieu pour cérémonie et repas, playlist plutôt que groupe live, faire-part numérique pour une partie des invités.",
          "Ce qu'on ne peut pas raccourcir : publication des bans, délais CPM pour un mariage religieux, délais de couture sur-mesure.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "La vue « tâches en retard » de Fiancé devient votre filtre quotidien. Assignez chaque action à l'un des deux partenaires pour éviter les doublons.",
        ],
      },
      DISCLAIMER_FR,
    ],
  },
  {
    slug: "mariage-18-24-mois-premieres-actions",
    categoryKey: "planning",
    category: "Préparatifs",
    title: "Mariage en 18 à 24 mois : par où commencer ?",
    excerpt:
      "Vous avez le luxe du temps. Voici ce qu'il vaut la peine de réserver tôt, et ce qu'il vaut mieux garder flexible.",
    date: "2026-06-29",
    readingMinutes: 5,
    heroImage: HERO,
    heroImageAlt: "Préparer un mariage sur 18 à 24 mois",
    sections: [
      {
        type: "text",
        paragraphs: [
          "Préparer un mariage sur 18 à 24 mois, c'est surtout utile en haute saison (mai à septembre) ou pour les lieux très demandés. Le risque inverse : figer trop de détails trop tôt, alors que votre liste d'invités ou vos goûts vont encore bouger.",
        ],
      },
      {
        type: "list",
        title: "À faire dans les 3 premiers mois",
        items: [
          "Poser budget, date cible et fourchette d'invités",
          "Réserver le lieu (souvent le goulot d'étranglement)",
          "Contacter le photographe que vous visez",
          "Ouvrir un espace de notes partagé (app ou carnet)",
        ],
      },
      {
        type: "list",
        title: "À repousser après 12 mois avant le jour J",
        items: [
          "Choix déco finie et plan de table",
          "Commande faire-part (sauf date ultra demandée)",
          "Menu détaillé et plan de table",
          "Location de voiture ou bus si volume incertain",
        ],
      },
      {
        type: "quote",
        quote:
          "Avoir 24 mois ne veut pas dire remplir 24 mois de stress. Bloquez l'essentiel, puis respirez.",
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Utilisez Fiancé pour noter les devis au fil de l'eau sans tout verrouiller. Le mood board intégré permet de garder des idées sans engager de budget.",
        ],
      },
    ],
  },
  {
    slug: "sept-decisions-mariage",
    categoryKey: "planning",
    category: "Préparatifs",
    title: "Les 7 décisions qui conditionnent tout le reste",
    excerpt:
      "Budget, date, invités, lieu, format, financement, priorités : sept choix structurants. Tout le reste en découle.",
    date: "2026-06-29",
    readingMinutes: 5,
    heroImage: HERO,
    heroImageAlt: "Décisions clés pour organiser un mariage",
    sections: [
      {
        type: "text",
        paragraphs: [
          "Avant de comparer des prestataires, sept décisions fixent le cadre. Tant qu'elles ne sont pas prises (même approximativement), chaque devis sera difficile à interpréter.",
        ],
      },
      {
        type: "list",
        title: "Les 7 décisions",
        items: [
          "1. Budget total et qui paie quoi",
          "2. Date ou saison visée",
          "3. Nombre d'invités (fourchette)",
          "4. Lieu (ville, région, type de salle)",
          "5. Format (civil seul, religieux, laïque, multi-jours)",
          "6. Deux priorités non négociables (ex. photo + lieu)",
          "7. Répartition du travail entre les deux partenaires",
        ],
      },
      {
        type: "text",
        title: "Pourquoi l'ordre compte",
        paragraphs: [
          "Le budget filtre le lieu. Le lieu filtre le traiteur. Les invités filtrent le budget traiteur. Les priorités vous aident à couper ailleurs sans regret.",
          "Nous avons vu des couples dépenser 30 % du budget en fleurs alors que la photo était leur priorité déclarée. Écrire les deux priorités noir sur blanc évite ce décalage.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Le module budget de Fiancé lie dépenses et catégories. Le [simulateur en ligne](/tools/budget-calculator) aide à poser le plafond avant même de créer votre mariage.",
        ],
      },
    ],
  },
  {
    slug: "checklist-mariage-50-taches",
    categoryKey: "planning",
    category: "Préparatifs",
    title: "Checklist mariage : 50 tâches à ne pas oublier",
    excerpt:
      "Une liste complète par thème : admin, lieu, invités, tenues, jour J. À adapter, pas à suivre aveuglément.",
    date: "2026-06-29",
    readingMinutes: 8,
    heroImage: HERO,
    heroImageAlt: "Checklist complète mariage",
    sections: [
      {
        type: "text",
        paragraphs: [
          "Cette checklist regroupe ce que nous mettons par défaut dans Fiancé, réparti en douze catégories. Certaines lignes ne s'appliqueront pas à votre mariage : c'est normal.",
        ],
      },
      {
        type: "list",
        title: "Cadre et admin (8 tâches)",
        items: [
          "Fixer budget et contributeurs",
          "Choisir date et réserver lieu",
          "Dossier mairie / publication des bans",
          "Parcours religieux ou cérémonie laïque si besoin",
          "Assurance ou responsabilité civile du lieu",
          "Contrat de mariage chez le notaire si applicable",
          "Lune de miel : passeports et réservations",
          "Créer un dossier prestataires (contacts, devis)",
        ],
      },
      {
        type: "list",
        title: "Invités et communication (10 tâches)",
        items: [
          "Liste d'invités v1 puis v2",
          "Save-the-date",
          "Faire-part",
          "RSVP en ligne ou par courrier",
          "Relances RSVP",
          "Registre cadeaux ou liste",
          "Infos transport et hébergement",
          "Plan de table",
          "Marque-places ou menu imprimé",
          "Remerciements post-mariage",
        ],
      },
      {
        type: "list",
        title: "Prestataires et budget (12 tâches)",
        items: [
          "Traiteur réservé et menu validé",
          "Photographe et vidéaste",
          "DJ ou groupe",
          "Fleuriste",
          "Gâteau ou dessert",
          "Location mobilier ou vaisselle",
          "Coiffure et maquillage",
          "Transport mariés ou navette invités",
          "Acomptes et échéancier de paiement",
          "Pourboires prévus",
          "Comparatif devis traiteur",
          "Marge imprévus (5 à 10 % du budget)",
        ],
      },
      {
        type: "list",
        title: "Tenues et jour J (10 tâches)",
        items: [
          "Robe / costume commandés",
          "Essayages et retouches",
          "Alliances",
          "Tenues témoins coordonnées",
          "Programme jour J minute par minute",
          "Répétition cérémonie si besoin",
          "Kit d'urgence (épingles, pansements, chargeurs)",
          "Repas staff et timing traiteur",
          "Plan B météo",
          "Distribution rôles témoins",
        ],
      },
      {
        type: "list",
        title: "Déco et détails (10 tâches)",
        items: [
          "Thème ou palette couleurs",
          "Centres de table",
          "Livret de cérémonie",
          "Photobooth ou guestbook",
          "Éclairage salle",
          "Signalétique (plan, toilettes, bar)",
          "Musique cérémonie",
          "Discours et toasts",
          "Animation enfants si besoin",
          "Cadeaux invités",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Importez cette logique en un clic : Fiancé génère une checklist pré-remplie calée sur votre date, avec rappels et assignation par partenaire.",
        ],
      },
    ],
  },
  {
    slug: "repartir-taches-mariage-deux",
    categoryKey: "planning",
    category: "Préparatifs",
    title: "Comment répartir les tâches entre les deux futurs mariés",
    excerpt:
      "Sans répartition claire, tout retombe sur une personne. Voici un modèle simple par domaines, pas par égalité ligne à ligne.",
    date: "2026-06-29",
    readingMinutes: 5,
    heroImage: HERO,
    heroImageAlt: "Répartir les tâches mariage entre partenaires",
    sections: [
      {
        type: "text",
        paragraphs: [
          "Organiser un mariage à deux ne veut pas dire couper chaque tâche en deux. Il vaut mieux attribuer des domaines entiers à chaque partenaire, selon vos forces et votre disponibilité.",
        ],
      },
      {
        type: "list",
        title: "Modèle par domaines",
        items: [
          "Personne A : budget, paiements, contrats prestataires",
          "Personne B : invités, RSVP, communications",
          "En commun : choix du lieu (décision conjointe, recherche partagée)",
          "Alternance : rendez-vous traiteur et essayages",
          "Témoins : relais pour le jour J, pas pour toute l'organisation",
        ],
      },
      {
        type: "text",
        title: "Règles qui évitent les conflits",
        paragraphs: [
          "1. Une seule source de vérité (une app, pas trois tableurs).",
          "2. Point hebdo de 20 minutes : bloquages seulement, pas relecture de tout.",
          "3. Décisions esthétiques : chacun a un veto sur un domaine (déco, musique, photo).",
          "4. Familles : chaque partenaire gère sa propre fratrie pour la liste d'invités.",
        ],
      },
      {
        type: "quote",
        quote:
          "Ce qui fatigue, ce n'est pas le volume de tâches. C'est l'incertitude sur qui s'en occupe.",
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Chaque tâche Fiancé accepte un champ « assigné à ». La sync optionnelle entre partenaires garde la même liste à jour sur deux téléphones, avec des données sécurisées.",
        ],
      },
    ],
  },
  {
    slug: "excel-vs-application-mariage",
    categoryKey: "planning",
    category: "Outils",
    title: "Excel vs application mariage : quel outil choisir en 2026 ?",
    excerpt:
      "Tableur ou app dédiée ? Les deux fonctionnent au début. Voici où Excel atteint ses limites, et quand une app vaut le switch.",
    date: "2026-06-29",
    readingMinutes: 6,
    heroImage: HERO,
    heroImageAlt: "Excel ou application pour organiser son mariage",
    sections: [
      {
        type: "text",
        paragraphs: [
          "Beaucoup de couples démarrent sur Excel ou Google Sheets : budget onglet 1, invités onglet 2, prestataires onglet 3. Ça tient jusqu'au moment où les RSVP arrivent, les acomptes se multiplient, et le plan de table doit être refait pour la troisième fois.",
        ],
      },
      {
        type: "text",
        title: "Quand Excel suffit",
        paragraphs: [
          "Mariage intimiste (moins de 40 invités), budget simple, une seule personne pilote, pas de sync entre partenaires.",
          "Excel reste excellent pour une simulation budget ponctuelle. D'ailleurs notre [simulateur budget](/tools/budget-calculator) reprend cette logique sans installer quoi que ce soit.",
        ],
      },
      {
        type: "text",
        title: "Où Excel coince",
        paragraphs: [
          "1. Pas de lien natif entre invités, tables et RSVP.",
          "2. Sync en temps réel entre deux personnes : version fragile.",
          "3. Rappels d'échéances et tâches en retard : à faire à la main.",
          "4. Mobile : lire un tableur sur téléphone en rendez-vous traiteur, c'est pénible.",
          "5. Données personnelles (emails, adresses) : vous gérez vous-même les copies et partages.",
        ],
      },
      {
        type: "text",
        title: "Ce qu'une app mariage apporte",
        paragraphs: [
          "Liste d'invités, budget, prestataires et checklist dans le même outil. Plan de table synchronisé. Export PDF pour le traiteur. Mode hors ligne pour consulter sans réseau.",
          "Contrepartie : courbe d'apprentissage légère, et certaines apps poussent des comptes cloud ou de la pub. Fiancé part du principe inverse : données sur l'appareil, pas de pub, sync optionnelle.",
        ],
      },
      {
        type: "list",
        title: "Tableau comparatif rapide",
        items: [
          "Budget par catégorie : Excel oui, app oui",
          "RSVP invités : Excel manuel, app avec lien",
          "Plan de table visuel : Excel difficile, app oui",
          "Travail à deux en temps réel : Excel fragile, app oui",
          "Rappels échéances : Excel non, app oui",
          "Hors ligne mobile : Excel variable, Fiancé oui",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Fiancé est gratuit pour l'essentiel, sans publicité. Vous pouvez commencer sur le [simulateur budget](/tools/budget-calculator), puis importer la logique dans l'app quand la liste d'invités dépasse une page Excel.",
        ],
      },
    ],
  },
];

export const POSTS_3_10_EN: BlogPost[] = [
  {
    slug: "retroplanning-mariage-mois-par-mois",
    categoryKey: "planning",
    category: "Planning",
    title: "Wedding timeline: month-by-month calendar",
    excerpt:
      "From 12 months out to 1 week before: what to do at each stage. A concrete calendar, not a vague list.",
    date: "2026-06-29",
    readingMinutes: 7,
    heroImage: HERO,
    heroImageAlt: "Wedding month-by-month timeline",
    sections: [
      {
        type: "text",
        paragraphs: [
          "A wedding timeline reads your big day backwards: each month has 4 to 8 clear actions. Without it, everything piles up three months before.",
          "This guide assumes about 12 months of prep, the most common case in France. For shorter or longer lead times, see [how long to plan](/blog/combien-temps-organiser-mariage).",
        ],
      },
      {
        type: "list",
        title: "12 to 10 months out",
        items: [
          "Set date and budget ceiling",
          "Sketch guest count (rough range)",
          "Tour and book the reception venue",
          "Start photographer and caterer search",
        ],
      },
      {
        type: "list",
        title: "9 to 7 months out",
        items: [
          "Confirm photographer, caterer, music",
          "Choose witnesses and split responsibilities",
          "Start town hall or religious prep",
          "Shortlist attire and book fittings",
        ],
      },
      {
        type: "list",
        title: "6 to 4 months out",
        items: [
          "Send save-the-dates then invitations",
          "Finalize florist, beauty, transport if needed",
          "Order rings and accessories",
          "Validate menu with caterer",
        ],
      },
      {
        type: "list",
        title: "3 to 2 months out",
        items: [
          "Follow up RSVPs (aim for answers 6 weeks before the day)",
          "Build the [seating chart](/tools/seating-chart)",
          "Arrange lodging for out-of-town guests",
          "Draft the day-of schedule",
        ],
      },
      {
        type: "list",
        title: "1 month to 1 week out",
        items: [
          "Confirm headcount with caterer and venue",
          "Final fittings and alterations",
          "Prepare final payments and tips",
          "Brief witnesses, officiant, DJ on the run sheet",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Tip: one task with a deadline beats ten ideas in your head. That is why Fiancé labels checklist items as \"9 months before\" instead of fixed calendar dates.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Fiancé builds a timeline from your wedding date. Overdue tasks surface on the home screen. You can also export the [day-of timeline](/tools/timeline) as PDF.",
        ],
      },
      DISCLAIMER_EN,
    ],
  },
  {
    slug: "organiser-mariage-10-etapes",
    categoryKey: "planning",
    category: "Planning",
    title: "Plan your wedding in 10 steps (in the right order)",
    excerpt:
          "Not a random checklist. Ten steps with dependencies: budget before venue, venue before invitations, RSVPs before seating chart.",
    date: "2026-06-29",
    readingMinutes: 6,
    heroImage: HERO,
    heroImageAlt: "Plan a wedding in 10 steps",
    sections: [
      {
        type: "text",
        paragraphs: [
          "Most guides list ten bullets in arbitrary order. In practice, some steps block the next ones. Here is the sequence we recommend after watching many couples on Fiancé.",
        ],
      },
      {
        type: "list",
        title: "The 10 steps in order",
        items: [
          "1. Set total budget (a ceiling, not a vague range)",
          "2. Pick a date or 2 to 3 month window",
          "3. Estimate guest list (high and low bounds)",
          "4. Book the reception venue",
          "5. Hire caterer and photographer",
          "6. Confirm music, flowers, officiant if needed",
          "7. Send invitations and collect RSVPs",
          "8. Finalize menu, seating chart, and lodging",
          "9. Lock attire, rings, day-of schedule",
          "10. Final coordination with witnesses and vendors (2 to 7 days out)",
        ],
      },
      {
        type: "quote",
        quote:
          "One late step is not a detail: it shifts everything that depends on it.",
      },
      {
        type: "text",
        title: "Where couples slip most often",
        paragraphs: [
          "Comparing photographers before having a budget. Sending invitations before the date is firm. Building a seating chart before RSVPs.",
          "If you hesitate between two steps, ask: \"Do I need the answer before moving on?\"",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Fiancé centralizes budget, guests, vendors, and tasks. The pre-filled checklist follows a logical order you can adjust. Start with [first steps](/blog/premieres-etapes-organiser-mariage) if you just got engaged.",
        ],
      },
    ],
  },
  {
    slug: "mariage-6-mois-checklist",
    categoryKey: "planning",
    category: "Planning",
    title: "Wedding in 6 months: accelerated checklist",
    excerpt:
      "Date in six months? Tight but doable. What to prioritize, what to simplify, and what cannot be shortened.",
    date: "2026-06-29",
    readingMinutes: 5,
    heroImage: HERO,
    heroImageAlt: "Plan a wedding in 6 months",
    sections: [
      {
        type: "text",
        paragraphs: [
          "Six months is below the national average (around 14 months in industry surveys). You will trade choice for speed: fewer vendor slots, sometimes a smaller format, and zero delay on admin steps.",
        ],
      },
      {
        type: "list",
        title: "Weeks 1 to 2: lock the frame",
        items: [
          "Firm budget and realistic guest list",
          "Book any available venue (Friday or off-season if needed)",
          "Block photographer and caterer the same week",
        ],
      },
      {
        type: "list",
        title: "Months 2 to 3: guests and admin",
        items: [
          "Simple invitations, send immediately (skip save-the-dates)",
          "Town hall or religious prep: start now",
          "Attire: off-the-rack or rental, no long bespoke lead time",
        ],
      },
      {
        type: "list",
        title: "Months 4 to 6: execution",
        items: [
          "RSVP follow-ups every two weeks",
          "Seating chart once 80% of answers are in",
          "Day-of schedule locked by 2 weeks out",
        ],
      },
      {
        type: "text",
        title: "What you can simplify",
        paragraphs: [
          "Light florals, one venue for ceremony and reception, playlist instead of live band, digital invites for part of the list.",
          "What you cannot shorten: banns publication, CPM timeline for religious weddings, bespoke tailoring lead times.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Fiancé's overdue task view becomes your daily filter. Assign each action to either partner to avoid duplicate work.",
        ],
      },
      DISCLAIMER_EN,
    ],
  },
  {
    slug: "mariage-18-24-mois-premieres-actions",
    categoryKey: "planning",
    category: "Planning",
    title: "18 to 24 month wedding: where to start",
    excerpt:
      "You have time. Here is what to book early, and what to keep flexible.",
    date: "2026-06-29",
    readingMinutes: 5,
    heroImage: HERO,
    heroImageAlt: "Plan a wedding over 18 to 24 months",
    sections: [
      {
        type: "text",
        paragraphs: [
          "18 to 24 months of prep helps most in peak season (May to September) or for high-demand venues. The opposite risk: locking too many details too early while your guest list and tastes still shift.",
        ],
      },
      {
        type: "list",
        title: "First 3 months",
        items: [
          "Set budget, target date, and guest range",
          "Book the venue (often the bottleneck)",
          "Reach out to your top photographer choice",
          "Open a shared note space (app or notebook)",
        ],
      },
      {
        type: "list",
        title: "Wait until 12 months out",
        items: [
          "Final decor and seating chart",
          "Invitation order (unless date is extremely competitive)",
          "Detailed menu and table plan",
          "Car or bus rental if headcount is still uncertain",
        ],
      },
      {
        type: "quote",
        quote:
          "Having 24 months does not mean filling 24 months with stress. Lock essentials, then breathe.",
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Use Fiancé to track quotes over time without committing everything. The built-in mood board keeps ideas without spending budget.",
        ],
      },
    ],
  },
  {
    slug: "sept-decisions-mariage",
    categoryKey: "planning",
    category: "Planning",
    title: "7 decisions that drive everything else",
    excerpt:
      "Budget, date, guests, venue, format, funding, priorities: seven structural choices. Everything else follows.",
    date: "2026-06-29",
    readingMinutes: 5,
    heroImage: HERO,
    heroImageAlt: "Key wedding planning decisions",
    sections: [
      {
        type: "text",
        paragraphs: [
          "Before comparing vendors, seven decisions set the frame. Until they are made (even roughly), every quote is hard to read.",
        ],
      },
      {
        type: "list",
        title: "The 7 decisions",
        items: [
          "1. Total budget and who pays what",
          "2. Target date or season",
          "3. Guest count (range)",
          "4. Venue (city, region, room type)",
          "5. Format (civil only, religious, secular, multi-day)",
          "6. Two non-negotiable priorities (e.g. photo + venue)",
          "7. How you split work between partners",
        ],
      },
      {
        type: "text",
        title: "Why order matters",
        paragraphs: [
          "Budget filters venue. Venue filters caterer. Guests filter catering cost. Priorities help you cut elsewhere without regret.",
          "We have seen couples spend 30% of budget on flowers while photo was their stated priority. Writing two priorities down prevents that drift.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Fiancé's budget module ties expenses to categories. The [online calculator](/tools/budget-calculator) helps set a ceiling before you even create your wedding.",
        ],
      },
    ],
  },
  {
    slug: "checklist-mariage-50-taches",
    categoryKey: "planning",
    category: "Planning",
    title: "Wedding checklist: 50 tasks not to forget",
    excerpt:
      "A full list by theme: admin, venue, guests, attire, day-of. Adapt it, do not follow it blindly.",
    date: "2026-06-29",
    readingMinutes: 8,
    heroImage: HERO,
    heroImageAlt: "Complete wedding checklist",
    sections: [
      {
        type: "text",
        paragraphs: [
          "This checklist mirrors Fiancé's default template across twelve categories. Some lines will not apply to your wedding. That is normal.",
        ],
      },
      {
        type: "list",
        title: "Frame and admin (8 tasks)",
        items: [
          "Set budget and contributors",
          "Pick date and book venue",
          "Town hall file / banns publication",
          "Religious or secular ceremony prep if needed",
          "Venue insurance or liability",
          "Prenup at notary if applicable",
          "Honeymoon: passports and bookings",
          "Vendor folder (contacts, quotes)",
        ],
      },
      {
        type: "list",
        title: "Guests and communication (10 tasks)",
        items: [
          "Guest list v1 then v2",
          "Save-the-dates",
          "Invitations",
          "RSVP online or by mail",
          "RSVP follow-ups",
          "Gift registry or list",
          "Transport and lodging info",
          "Seating chart",
          "Place cards or printed menus",
          "Thank-you notes after the wedding",
        ],
      },
      {
        type: "list",
        title: "Vendors and budget (12 tasks)",
        items: [
          "Caterer booked and menu validated",
          "Photographer and videographer",
          "DJ or band",
          "Florist",
          "Cake or dessert",
          "Furniture or tableware rental",
          "Hair and makeup",
          "Transport for couple or guest shuttle",
          "Deposits and payment schedule",
          "Tips planned",
          "Caterer quote comparison",
          "Contingency buffer (5 to 10% of budget)",
        ],
      },
      {
        type: "list",
        title: "Attire and day-of (10 tasks)",
        items: [
          "Dress / suit ordered",
          "Fittings and alterations",
          "Rings",
          "Coordinated witness outfits",
          "Minute-by-minute day-of schedule",
          "Ceremony rehearsal if needed",
          "Emergency kit (pins, bandages, chargers)",
          "Staff meal and caterer timing",
          "Weather plan B",
          "Witness role assignments",
        ],
      },
      {
        type: "list",
        title: "Decor and details (10 tasks)",
        items: [
          "Theme or color palette",
          "Centerpieces",
          "Ceremony booklet",
          "Photobooth or guestbook",
          "Room lighting",
          "Signage (layout, restrooms, bar)",
          "Ceremony music",
          "Speeches and toasts",
          "Kids entertainment if needed",
          "Guest favors",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Import this logic in one click: Fiancé generates a pre-filled checklist aligned to your date, with reminders and partner assignment.",
        ],
      },
    ],
  },
  {
    slug: "repartir-taches-mariage-deux",
    categoryKey: "planning",
    category: "Planning",
    title: "How to split wedding tasks between partners",
    excerpt:
          "Without a clear split, one person carries everything. A simple model by domain, not line-by-line equality.",
    date: "2026-06-29",
    readingMinutes: 5,
    heroImage: HERO,
    heroImageAlt: "Split wedding tasks between partners",
    sections: [
      {
        type: "text",
        paragraphs: [
          "Planning a wedding together does not mean cutting every task in half. Assign whole domains to each partner based on strengths and availability.",
        ],
      },
      {
        type: "list",
        title: "Domain model",
        items: [
          "Partner A: budget, payments, vendor contracts",
          "Partner B: guests, RSVPs, communications",
          "Together: venue choice (joint decision, shared research)",
          "Alternate: caterer meetings and fittings",
          "Witnesses: day-of relay, not full planning load",
        ],
      },
      {
        type: "text",
        title: "Rules that prevent conflict",
        paragraphs: [
          "1. One source of truth (one app, not three spreadsheets).",
          "2. Weekly 20-minute sync: blockers only, not full re-read.",
          "3. Aesthetic decisions: each partner has veto power on one domain (decor, music, photo).",
          "4. Families: each partner manages their own side of the guest list.",
        ],
      },
      {
        type: "quote",
        quote:
          "What drains you is not task volume. It is not knowing who owns what.",
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Each Fiancé task accepts an assignee field. Optional sync between partners keeps one list on two phones, with secure data.",
        ],
      },
    ],
  },
  {
    slug: "excel-vs-application-mariage",
    categoryKey: "planning",
    category: "Tools",
    title: "Excel vs wedding app: which tool to pick in 2026?",
    excerpt:
      "Spreadsheet or dedicated app? Both work at first. Where Excel hits limits, and when an app is worth the switch.",
    date: "2026-06-29",
    readingMinutes: 6,
    heroImage: HERO,
    heroImageAlt: "Excel or wedding app comparison",
    sections: [
      {
        type: "text",
        paragraphs: [
          "Many couples start on Excel or Google Sheets: budget tab 1, guests tab 2, vendors tab 3. It holds until RSVPs roll in, deposits multiply, and the seating chart needs a third rebuild.",
        ],
      },
      {
        type: "text",
        title: "When Excel is enough",
        paragraphs: [
          "Intimate wedding (under 40 guests), simple budget, one person drives planning, no partner sync needed.",
          "Excel stays great for a one-off budget simulation. Our [budget calculator](/tools/budget-calculator) uses the same logic without installing anything.",
        ],
      },
      {
        type: "text",
        title: "Where Excel struggles",
        paragraphs: [
          "1. No native link between guests, tables, and RSVPs.",
          "2. Real-time sync between two people: fragile versioning.",
          "3. Deadline reminders and overdue tasks: manual.",
          "4. Mobile: reading a spreadsheet on your phone at a caterer tasting is painful.",
          "5. Personal data (emails, addresses): you manage copies and sharing yourself.",
        ],
      },
      {
        type: "text",
        title: "What a wedding app adds",
        paragraphs: [
          "Guest list, budget, vendors, and checklist in one tool. Synced seating chart. PDF export for the caterer. Offline mode when venue has no signal.",
          "Tradeoff: slight learning curve, and some apps push cloud accounts or ads. Fiancé takes the opposite path: data on device, no ads, optional sync.",
        ],
      },
      {
        type: "list",
        title: "Quick comparison",
        items: [
          "Budget by category: Excel yes, app yes",
          "Guest RSVPs: Excel manual, app with link",
          "Visual seating chart: Excel hard, app yes",
          "Two-person real-time work: Excel fragile, app yes",
          "Deadline reminders: Excel no, app yes",
          "Offline mobile: Excel varies, Fiancé yes",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Fiancé is free for essentials, with no ads. Start on the [budget calculator](/tools/budget-calculator), then move into the app when your guest list outgrows one Excel sheet.",
        ],
      },
    ],
  },
];
