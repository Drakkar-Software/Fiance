import { postPair, pairsToArrays } from "./blog-posts-shared";

const pairs = [
  postPair({
    slug: "gerer-stress-mariage-serenite",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "Gérer le stress des préparatifs : rester serein jusqu'au jour J",
    titleEn: "Managing wedding planning stress: staying calm until the big day",
    excerptFr:
      "Déléguer, fixer une date limite aux nouvelles décisions, protéger le couple des discussions mariage en continu : les tactiques concrètes pour ne pas arriver épuisé au jour J.",
    excerptEn:
      "Delegating, setting a cutoff date for new decisions, protecting the couple from nonstop wedding talk: concrete tactics for not arriving exhausted on the big day.",
    readingMinutes: 7,
    heroAltFr: "Couple serein pendant les préparatifs de mariage",
    heroAltEn: "Calm couple during wedding planning",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Organiser un mariage mobilise plusieurs mois, parfois plus d'un an, de décisions à prendre : lieu, traiteur, liste d'invités, tenue, musique. Une pointe de stress est normale. Le problème commence quand cette charge mentale ne redescend jamais, même les jours sans rendez-vous prestataire.",
          "Ce n'est pas une question de mieux s'organiser sur le papier. C'est une question de limites à poser, dès le début, pour que les préparatifs restent un projet et non une source d'épuisement permanent.",
        ],
      },
      {
        type: "list",
        title: "Déléguer sans culpabiliser",
        items: [
          "Confier une mission entière à un témoin ou un proche organisé (suivi des RSVP, coordination du jour J), pas juste une tâche ponctuelle",
          "Accepter qu'une tâche déléguée ne sera pas gérée exactement comme vous l'auriez fait, et que ce n'est pas grave",
          "Dire non à une aide qui crée plus de travail de supervision qu'elle n'en enlève",
          "Utiliser un outil partagé pour que chacun voie où en est chaque tâche, sans avoir à tout redemander",
        ],
      },
      {
        type: "list",
        title: "Fixer une date butoir aux nouvelles décisions",
        items: [
          "Choisir une date, environ six à huit semaines avant le mariage, après laquelle plus aucun changement de fond n'est envisagé (menu, décoration, playlist)",
          "Communiquer cette date aux prestataires eux-mêmes : la plupart la demandent de toute façon pour figer les derniers détails",
          "Après cette date, seuls les ajustements mineurs restent ouverts (photo de dernière minute, petit imprévu logistique)",
          "Cette limite protège aussi le couple d'un doute de dernière minute alimenté par un avis extérieur",
        ],
      },
      {
        type: "text",
        title: "Protéger le temps de couple",
        paragraphs: [
          "Réserver, dans l'agenda, des moments où le mariage n'est officiellement pas un sujet de conversation. Cela peut être un dîner par semaine, une sortie, ou simplement l'interdiction de parler prestataires après une certaine heure.",
          "Ce n'est pas une contrainte de plus. C'est ce qui évite que la relation de couple ne devienne, pendant des mois, uniquement une équipe de gestion de projet.",
        ],
      },
      {
        type: "text",
        title: "Fatigue normale ou signal d'alerte",
        paragraphs: [
          "Une certaine lassitude face aux devis à comparer ou aux décisions à trancher fait partie du processus. Ce qui doit alerter, c'est une irritabilité qui déborde sur le reste de la vie, un sommeil perturbé sur plusieurs semaines, ou l'envie de tout annuler sans lien avec un désaccord précis sur un choix.",
          "Dans ce cas, la bonne réponse n'est pas de pousser plus fort, mais de réduire volontairement le nombre de décisions en cours : reporter une réservation qui peut attendre, simplifier un poste qui a pris trop de place (décoration, papeterie), ou demander directement de l'aide à un proche plutôt qu'à un prestataire.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Un mariage plus simple que prévu n'est jamais un échec. C'est souvent la version qui reste la plus agréable à organiser, et celle dont on garde le meilleur souvenir.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "La belle-famille est souvent la première source de tension autour des décisions de couple : voir notre guide [gérer la belle-famille pendant les préparatifs](/blog/gerer-belle-famille-preparatifs). Centraliser toutes les tâches et échéances dans une seule [timeline](/tools/timeline) évite aussi de tout garder en tête, ce qui allège une bonne partie de la charge mentale.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Planning a wedding means months, sometimes over a year, of decisions to make: venue, caterer, guest list, outfit, music. A touch of stress is normal. The problem starts when that mental load never lets up, even on days with no vendor appointment.",
          "It's not really about organizing better on paper. It's about setting boundaries, early on, so planning stays a project rather than a source of constant exhaustion.",
        ],
      },
      {
        type: "list",
        title: "Delegate without guilt",
        items: [
          "Hand over a whole task to an organized witness or family member (tracking RSVPs, coordinating the wedding day), not just a one-off errand",
          "Accept that a delegated task won't be handled exactly as you would have done it, and that's fine",
          "Turn down help that creates more supervision work than it saves",
          "Use a shared tool so everyone can see where each task stands, without having to ask around",
        ],
      },
      {
        type: "list",
        title: "Set a cutoff date for new decisions",
        items: [
          "Pick a date, roughly six to eight weeks before the wedding, after which no more major changes are considered (menu, decor, playlist)",
          "Communicate that date to your vendors themselves: most ask for one anyway to lock the final details",
          "After that date, only minor tweaks stay open (a last-minute photo, a small logistics fix)",
          "This cutoff also protects the couple from a last-minute doubt fed by an outside opinion",
        ],
      },
      {
        type: "text",
        title: "Protect couple time",
        paragraphs: [
          "Block out moments in your calendar where the wedding is officially off the table as a topic. That can be a dinner once a week, an outing, or simply a rule against talking vendors past a certain hour.",
          "This isn't one more thing to manage. It's what keeps the relationship from becoming, for months, nothing but a project team.",
        ],
      },
      {
        type: "text",
        title: "Normal fatigue or a warning sign",
        paragraphs: [
          "Some weariness from comparing quotes or making decisions is part of the process. What should raise a flag is irritability spilling into the rest of your life, disrupted sleep over several weeks, or an urge to cancel everything unrelated to a specific disagreement over a choice.",
          "In that case, the right response isn't to push harder, but to deliberately cut down the number of open decisions: postpone a booking that can wait, simplify a line item that's taken up too much space (decor, stationery), or ask a loved one for help directly instead of a vendor.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A simpler wedding than planned is never a failure. It's often the version that stays the most enjoyable to organize, and the one you remember most fondly.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "In-laws are often the first source of tension around a couple's decisions: see our guide on [managing in-laws during wedding planning](/blog/gerer-belle-famille-preparatifs). Centralizing every task and deadline in one [timeline](/tools/timeline) also means less to keep in your head, which lifts a good part of the mental load.",
        ],
      },
    ],
  }),

  postPair({
    slug: "gerer-belle-famille-preparatifs",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Gérer la belle-famille pendant les préparatifs",
    titleEn: "Managing in-laws during wedding planning",
    excerptFr:
      "Opinions non sollicitées, pression sur le choix des invités ou de la robe : comment poser des limites avec la belle-famille sans envenimer la relation.",
    excerptEn:
      "Unsolicited opinions, pressure on guest choices or the dress: how to set boundaries with in-laws without souring the relationship.",
    readingMinutes: 6,
    heroAltFr: "Discussion mariage avec la belle-famille",
    heroAltEn: "Wedding discussion with in-laws",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La belle-famille s'invite souvent dans les préparatifs sans qu'on le lui ait demandé : un avis sur la robe, une remarque sur le choix du traiteur, une liste d'invités « à ne pas oublier ». Ce n'est presque jamais malveillant, mais ça peut vite peser sur des mois de décisions déjà denses.",
          "La bonne approche n'est pas d'ignorer la belle-famille, ni de céder à chaque demande. C'est de définir en couple ce qui est négociable et ce qui ne l'est pas, avant même d'en parler à l'extérieur.",
        ],
      },
      {
        type: "list",
        title: "Décider en couple avant de présenter aux familles",
        items: [
          "Trancher les grandes lignes (budget global, style de réception, liste d'invités) uniquement à deux, avant toute consultation élargie",
          "Présenter une décision déjà prise plutôt qu'une hypothèse ouverte : cela limite les allers-retours et les tentatives de faire pencher la balance",
          "Garder une position commune en public, même en cas de léger désaccord entre vous : les ajustements se discutent en privé, pas devant la famille",
        ],
      },
      {
        type: "list",
        title: "Poser une limite sans conflit",
        items: [
          "Remercier pour l'avis donné, sans forcément le suivre : « Merci, on y réfléchit » suffit souvent à clore le sujet sans confrontation",
          "Rediriger une proposition de contribution financière vers un poste précis plutôt que de laisser un flou qui ouvre la porte à des attentes en retour",
          "Reformuler calmement une pression répétée sur un même sujet : « On a déjà tranché ce point, on préfère ne plus y revenir »",
        ],
      },
      {
        type: "text",
        title: "Le cas classique de la liste d'invités",
        paragraphs: [
          "C'est souvent là que les tensions se concentrent : chaque famille a ses propres attentes sur qui doit être présent. Fixez d'abord un nombre total avec votre budget, puis répartissez les places disponibles par groupe (amis, famille proche, famille élargie) avant de demander à chaque famille sa liste, plutôt que l'inverse.",
          "Cette méthode évite l'effet liste ouverte, où chaque famille ajoute des noms sans limite parce qu'aucun cadre n'a été donné en amont.",
        ],
      },
      {
        type: "text",
        title: "Quand la relation est plus tendue",
        paragraphs: [
          "Si une belle-famille se montre particulièrement insistante ou intrusive, il peut être utile qu'un seul des deux membres du couple porte les échanges avec sa propre famille, plutôt que de laisser son conjoint gérer des tensions qui ne sont pas les siennes à l'origine.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Une décision annoncée calmement et sans se justifier en détail passe presque toujours mieux qu'une décision longuement expliquée point par point, qui invite à la négociation.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "La question du nombre d'invités revient souvent en premier dans ces discussions : voir notre guide [combien d'invités inviter selon votre budget](/blog/combien-invites-mariage-decider). Pour la charge mentale globale des préparatifs, lisez aussi [gérer le stress des préparatifs](/blog/gerer-stress-mariage-serenite).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "In-laws often find their way into the planning without being asked: an opinion on the dress, a comment on the caterer, a guest list of \"must-invites\". It's almost never ill-intentioned, but it can quickly weigh on months of decisions that are already dense.",
          "The right approach isn't to ignore in-laws, nor to give in to every request. It's deciding as a couple what's negotiable and what isn't, before even discussing it outside the relationship.",
        ],
      },
      {
        type: "list",
        title: "Decide as a couple before presenting to families",
        items: [
          "Settle the big lines (overall budget, reception style, guest list) as just the two of you, before any wider consultation",
          "Present a decision already made rather than an open question: this limits back-and-forth and attempts to tip the scale",
          "Keep a united front in public, even with a small disagreement between you: adjustments get discussed in private, not in front of family",
        ],
      },
      {
        type: "list",
        title: "Set a boundary without conflict",
        items: [
          "Thank someone for their opinion without necessarily following it: \"Thanks, we'll think about it\" often closes the topic without confrontation",
          "Redirect an offer of financial help toward a specific line item rather than leaving it vague, which opens the door to expectations in return",
          "Calmly restate a boundary on a topic that keeps coming up: \"We've already decided on this, we'd rather not revisit it\"",
        ],
      },
      {
        type: "text",
        title: "The classic case: the guest list",
        paragraphs: [
          "This is often where tensions concentrate: each family has its own expectations about who should be there. Set a total headcount against your budget first, then split the available spots by group (friends, close family, extended family) before asking each family for their list, rather than the other way around.",
          "This method avoids the open-list effect, where each family keeps adding names because no framework was set beforehand.",
        ],
      },
      {
        type: "text",
        title: "When the relationship is more strained",
        paragraphs: [
          "If one set of in-laws is especially pushy or intrusive, it can help for only one member of the couple to handle exchanges with their own family, rather than leaving their partner to manage tensions that weren't originally theirs.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "A decision announced calmly and without a long justification almost always lands better than one explained point by point, which invites negotiation.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "The guest count question often comes up first in these discussions: see our guide on [how many guests to invite based on your budget](/blog/combien-invites-mariage-decider). For the overall mental load of planning, also read [managing wedding planning stress](/blog/gerer-stress-mariage-serenite).",
        ],
      },
    ],
  }),

  postPair({
    slug: "nuit-avant-mariage-preparation",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "La veille et la nuit avant le mariage : bien se préparer",
    titleEn: "The eve and night before the wedding: how to prepare",
    excerptFr:
      "Que faire vraiment la veille : derniers contrôles, coucher tôt, valise et mallette prêtes. Tradition de ne pas se voir ou couple qui reste ensemble : ce qui compte le plus le soir avant le mariage.",
    excerptEn:
      "What to actually do the night before: final checks, an early night, bag and emergency kit ready. The tradition of not seeing each other versus staying together: what matters most the evening before the wedding.",
    readingMinutes: 6,
    heroAltFr: "Soirée calme la veille du mariage",
    heroAltEn: "Calm evening before the wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La veille du mariage se transforme facilement en dernière ligne droite stressante : un appel de dernière minute à un prestataire, une valise à préparer à minuit, une nuit trop courte. Pourtant, le meilleur service que vous puissiez vous rendre ce soir-là est de ne presque rien faire.",
          "Tout ce qui peut être préparé à l'avance doit l'être avant cette soirée. Elle sert à se reposer, pas à finaliser.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'il reste à faire la veille",
        items: [
          "Un dernier contrôle rapide plutôt qu'une nouvelle liste de tâches : confirmer les horaires avec un ou deux prestataires clés, pas les rappeler tous",
          "Préparer la tenue complète, accessoires compris, sur un cintre ou dans une housse, prête à enfiler sans chercher quoi que ce soit le matin",
          "Boucler la [mallette de secours](/blog/checklist-jour-j-mallette-secours) et la confier à la personne désignée pour la porter le jour J",
          "Éviter toute course de dernière minute qui peut attendre le lendemain matin ou être déléguée",
        ],
      },
      {
        type: "text",
        title: "Se coucher tôt, vraiment",
        paragraphs: [
          "L'excitation ou le stress rendent souvent le coucher tardif, alors que c'est justement la nuit la plus importante pour bien dormir. Fixez une heure de coucher réaliste et tenez-la, même si cela veut dire couper court à une soirée entre proches organisée la veille.",
          "Évitez l'alcool en excès ce soir-là : il nuit à la qualité du sommeil, même s'il donne une impression de détente sur le moment.",
        ],
      },
      {
        type: "text",
        title: "Se voir ou pas la veille : une question de couple, pas de tradition à respecter",
        paragraphs: [
          "La coutume de ne pas se voir la nuit précédant le mariage vient d'une époque où le mariage se négociait entre familles, et où l'on craignait qu'un des deux futurs époux change d'avis en voyant l'autre trop tôt. Elle garde aujourd'hui surtout une valeur symbolique, pas une obligation.",
          "De plus en plus de couples choisissent de passer cette soirée ensemble, parfois avec un petit groupe de proches, parfois seuls pour souffler avant la journée à venir. D'autres préfèrent garder la tradition pour la charge émotionnelle du premier regard au moment de la cérémonie. Les deux options sont valables : le seul critère qui compte est ce qui vous met réellement à l'aise, pas ce qui se fait « habituellement ».",
        ],
      },
      {
        type: "list",
        title: "Petits gestes qui aident à décompresser",
        items: [
          "Un dîner simple et léger plutôt qu'un repas copieux ou une nouvelle adresse jamais testée",
          "Un moment sans téléphone, loin des derniers messages de dernière minute sur l'organisation",
          "Préparer un mot ou une petite attention pour son futur époux ou épouse, à lire ou recevoir le matin même",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Le jour J ne se joue pas sur ce qui a été fait la veille au soir, mais sur l'état de fatigue avec lequel on s'y présente. Une bonne nuit vaut mieux qu'une dernière tâche cochée sur la liste.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Retrouvez le contenu complet de la mallette de secours dans notre [checklist jour J anti-imprévu](/blog/checklist-jour-j-mallette-secours), et calez l'heure de réveil et les premiers rendez-vous du lendemain dans votre [timeline jour J minute par minute](/blog/planning-jour-j-minute-par-minute).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The night before a wedding easily turns into a stressful home stretch: a last-minute call to a vendor, a bag packed at midnight, too short a night's sleep. Yet the best thing you can do for yourself that evening is almost nothing.",
          "Anything that can be prepared ahead of time should be done before that evening. It's meant for resting, not finalizing.",
        ],
      },
      {
        type: "list",
        title: "What's actually left to do the evening before",
        items: [
          "A quick final check rather than a new task list: confirm timing with one or two key vendors, not call every single one",
          "Lay out the full outfit, accessories included, on a hanger or in a garment bag, ready to put on without hunting for anything in the morning",
          "Pack the [emergency kit](/blog/checklist-jour-j-mallette-secours) and hand it to whoever is carrying it on the day",
          "Skip any last-minute errand that can wait until the next morning or be delegated",
        ],
      },
      {
        type: "text",
        title: "Go to bed early, for real",
        paragraphs: [
          "Excitement or stress often push bedtime later, right when this is the most important night to sleep well. Set a realistic bedtime and stick to it, even if that means cutting an evening with loved ones short.",
          "Avoid heavy drinking that night: it hurts sleep quality, even if it feels relaxing in the moment.",
        ],
      },
      {
        type: "text",
        title: "Seeing each other or not the night before: a couple's choice, not a tradition to honor",
        paragraphs: [
          "The custom of not seeing each other the night before a wedding comes from a time when marriages were negotiated between families, and there was a fear one of the two might change their mind after seeing the other too soon. Today it mostly carries symbolic weight, not an obligation.",
          "More and more couples choose to spend that evening together, sometimes with a small group of loved ones, sometimes alone to unwind before the day ahead. Others prefer to keep the tradition for the emotional weight of the first look during the ceremony. Both are valid: the only thing that matters is what actually feels right to you, not what's \"usually\" done.",
        ],
      },
      {
        type: "list",
        title: "Small things that help you unwind",
        items: [
          "A simple, light dinner rather than a heavy meal or an untested new spot",
          "Some phone-free time, away from last-minute organizing messages",
          "Preparing a note or a small gesture for your future spouse, to read or receive the morning of",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "The wedding day doesn't hinge on what got done the night before, but on how rested you are walking into it. A good night's sleep beats one more checked box on the list.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Find the full emergency kit contents in our [no-surprises wedding-day checklist](/blog/checklist-jour-j-mallette-secours), and slot the next day's wake-up time and first appointments into your [minute-by-minute wedding-day timeline](/blog/planning-jour-j-minute-par-minute).",
        ],
      },
    ],
  }),

  postPair({
    slug: "combien-invites-mariage-decider",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Combien d'invités : fixer le bon nombre pour votre budget",
    titleEn: "How many guests: setting the right number for your budget",
    excerptFr:
      "Partir du budget par invité pour retrouver un nombre réaliste, éviter le piège du « tout le monde a un plus-un », et réduire une liste sans culpabiliser.",
    excerptEn:
      "Working back from your budget per guest to a realistic headcount, avoiding the everyone-gets-a-plus-one trap, and trimming a list without guilt.",
    readingMinutes: 7,
    heroAltFr: "Calcul du nombre d'invités selon le budget mariage",
    heroAltEn: "Calculating guest count based on wedding budget",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La plupart des couples commencent par une liste d'invités, puis découvrent que le budget ne suit pas. La méthode inverse fonctionne mieux : partir du budget total disponible, puis en déduire un nombre d'invités réaliste, avant même d'écrire le premier nom.",
        ],
      },
      {
        type: "text",
        title: "Partir du coût par invité",
        paragraphs: [
          "Le repas et la boisson représentent en général le plus gros poste variable du mariage, celui qui grimpe directement avec chaque invité supplémentaire. Une fois ce coût par personne connu (via un devis traiteur ou une estimation de la salle), divisez le budget réception disponible par ce montant pour obtenir un nombre plafond.",
          "Ce calcul donne une limite haute réaliste, à ajuster ensuite avec les autres postes qui varient aussi selon le nombre d'invités : faire-part, cadeaux d'invités, location de mobilier supplémentaire, plan de table plus complexe.",
        ],
      },
      {
        type: "list",
        title: "Le piège du « tout le monde a un plus-un »",
        items: [
          "Accorder un accompagnant systématique à chaque invité célibataire double potentiellement la liste sans que ce soit un choix conscient",
          "Réserver le plus-un aux invités en couple stable (mariés, pacsés, en couple depuis longtemps) plutôt qu'à tous, est une pratique courante et acceptée",
          "Annoncer la règle clairement et de la même façon à tout le monde évite le sentiment d'un traitement à deux vitesses",
        ],
      },
      {
        type: "list",
        title: "Réduire une liste sans culpabiliser",
        items: [
          "Trier par cercle plutôt que nom par nom : famille proche, témoins et amis proches d'abord, puis élargir si le budget le permet",
          "Se poser la question « cette personne serait-elle triste de ne pas voir de photos, ou juste surprise de ne pas être invitée » plutôt que « vais-je la vexer »",
          "Accepter qu'une invitation de politesse (ancien collègue, connaissance lointaine) n'a pas besoin d'être maintenue si le budget est serré",
          "Se rappeler qu'une liste plus courte n'est jamais un mariage au rabais, souvent l'inverse : plus de budget par invité pour l'expérience",
        ],
      },
      {
        type: "text",
        title: "Comparer les deux formats",
        paragraphs: [
          "Le choix entre une réception intime et une grande réception dépend directement de ce calcul de départ, pas seulement d'une préférence de style. Un budget serré rend une réception intime plus confortable pour tout le monde qu'une grande liste où chaque poste est rogné pour tenir le nombre.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Fixez le chiffre total avant de commencer la répartition entre les familles et les amis. Une fois le nombre communiqué et accepté par tous, il devient beaucoup plus difficile à faire bouger ensuite.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour choisir entre les deux formats de réception, voir notre guide [mariage intime ou grande réception](/blog/mariage-intime-vs-grande-reception). Pour le détail du calcul par tête, consultez [le coût par invité](/blog/budget-mariage-cout-par-invite), et suivez votre budget en temps réel avec le [calculateur de budget](/tools/budget-calculator).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Most couples start with a guest list, then discover the budget doesn't keep up. The reverse method works better: start from the total budget available, then work out a realistic headcount from it, before writing down a single name.",
        ],
      },
      {
        type: "text",
        title: "Start from the cost per guest",
        paragraphs: [
          "Food and drink are usually the biggest variable cost of a wedding, the one that climbs directly with every extra guest. Once you know that per-person cost (from a caterer quote or a venue estimate), divide your available reception budget by it to get a ceiling headcount.",
          "This gives a realistic upper limit, to adjust afterward against other line items that also scale with guest count: invitations, favors, extra furniture rental, a more complex seating chart.",
        ],
      },
      {
        type: "list",
        title: "The everyone-gets-a-plus-one trap",
        items: [
          "Giving every single guest an automatic plus-one can quietly double the list without it being a conscious choice",
          "Reserving plus-ones for guests in a stable relationship (married, civil-union, long-term partner) rather than everyone is a common, accepted practice",
          "Stating the rule clearly and the same way for everyone avoids the sense of a two-tier system",
        ],
      },
      {
        type: "list",
        title: "Trimming a list without guilt",
        items: [
          "Sort by circle rather than name by name: close family, wedding party, and close friends first, then widen if the budget allows",
          "Ask \"would this person be sad not to see photos, or just surprised not to be invited\" rather than \"will this offend them\"",
          "Accept that a courtesy invite (a former coworker, a distant acquaintance) doesn't need to stay on the list if the budget is tight",
          "Remember that a shorter list is never a lesser wedding, often the opposite: more budget per guest for the experience",
        ],
      },
      {
        type: "text",
        title: "Comparing the two formats",
        paragraphs: [
          "The choice between an intimate reception and a large one depends directly on this starting calculation, not just a style preference. A tight budget makes an intimate reception more comfortable for everyone than a big list where every line item gets cut to hit the number.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Set the total number before splitting it between families and friends. Once the number is communicated and accepted by everyone, it becomes much harder to move afterward.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "To choose between the two reception formats, see our guide on [intimate wedding vs. large reception](/blog/mariage-intime-vs-grande-reception). For the per-head math in detail, check [cost per guest](/blog/budget-mariage-cout-par-invite), and track your budget in real time with the [budget calculator](/tools/budget-calculator).",
        ],
      },
    ],
  }),

  postPair({
    slug: "faire-part-quand-envoyer-wording",
    categoryKey: "guests",
    categoryFr: "Invités",
    categoryEn: "Guests",
    titleFr: "Faire-part : quand les envoyer et quoi écrire",
    titleEn: "Wedding invitations: when to send them and what to write",
    excerptFr:
      "Save-the-date des mois à l'avance, faire-part deux à trois mois avant : le calendrier d'envoi réaliste, les mentions obligatoires, et le ton à choisir selon votre mariage.",
    excerptEn:
      "Save-the-date months ahead, formal invitations two to three months before: a realistic send timeline, what must appear on the card, and picking a wording tone for your wedding.",
    readingMinutes: 6,
    heroAltFr: "Faire-part de mariage prêts à envoyer",
    heroAltEn: "Wedding invitations ready to send",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Save-the-date et faire-part ne se pensent pas au même moment ni avec les mêmes règles. Beaucoup de couples envoient l'un des deux trop tard, ce qui met une pression inutile sur les réponses et sur l'organisation des invités venant de loin.",
        ],
      },
      {
        type: "list",
        title: "Le calendrier d'envoi réaliste",
        items: [
          "Save-the-date : entre huit et douze mois avant le mariage, dès que la date et le lieu sont confirmés",
          "Faire-part : deux à trois mois avant le mariage, avec une date limite de réponse fixée environ quatre à six semaines avant le jour J",
          "Pour un mariage à l'étranger ou avec de nombreux invités internationaux, ajoutez un mois de marge à chaque étape",
          "Les faire-part numériques peuvent partir un peu plus tard que les versions papier, le délai postal n'entrant pas en jeu",
        ],
      },
      {
        type: "list",
        title: "Ce qui doit obligatoirement figurer",
        items: [
          "Les noms complets des mariés et, le cas échéant, des familles qui invitent",
          "La date, l'heure et le lieu exact de la cérémonie, ainsi que ceux de la réception si différents",
          "La date limite de réponse (RSVP) et le moyen d'y répondre : lien vers une page mariage, adresse mail, ou carton-réponse à retourner",
          "Les informations pratiques essentielles si elles sont déjà connues : code vestimentaire, présence d'enfants acceptée ou non",
        ],
      },
      {
        type: "text",
        title: "Quel ton choisir",
        paragraphs: [
          "Un faire-part formel s'appuie sur des formules classiques (« ont l'honneur de vous convier », vouvoiement systématique) et convient à un mariage traditionnel ou à des invités plus âgés dans la famille.",
          "Un faire-part plus décontracté, au tutoiement, avec une formulation personnelle ou une pointe d'humour, correspond mieux à une réception informelle entre amis. L'essentiel est la cohérence : un ton qui tranche trop avec le style réel du mariage peut créer un décalage d'attentes chez les invités.",
        ],
      },
      {
        type: "text",
        title: "Faut-il vraiment un save-the-date",
        paragraphs: [
          "Ce n'est pas obligatoire, surtout pour un mariage local avec peu de contraintes de déplacement. Il devient en revanche presque indispensable dès qu'une part des invités doit poser des congés, réserver un billet d'avion ou organiser une garde d'enfants pour venir.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Gardez une trace de qui a reçu quoi et quand, save-the-date compris : c'est souvent en recoupant les envois qu'on repère les invités jamais recontactés pour le faire-part final.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pour le calendrier complet et les formats disponibles, voir notre guide [save-the-date et faire-part : le calendrier](/blog/save-the-date-faire-part-calendrier). Fiancé permet de suivre l'envoi et la réponse de chaque invité au même endroit que le reste de l'organisation.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Save-the-dates and formal invitations aren't planned at the same time or under the same rules. Many couples send one or the other too late, which puts needless pressure on replies and on guests traveling from afar.",
        ],
      },
      {
        type: "list",
        title: "A realistic send timeline",
        items: [
          "Save-the-date: eight to twelve months before the wedding, as soon as the date and venue are confirmed",
          "Formal invitation: two to three months before the wedding, with an RSVP deadline set roughly four to six weeks before the day",
          "For a destination wedding or many international guests, add a month of buffer to each step",
          "Digital invitations can go out a bit later than paper ones, since mail delivery time isn't a factor",
        ],
      },
      {
        type: "list",
        title: "What must appear on it",
        items: [
          "The couple's full names and, where relevant, the families extending the invitation",
          "The exact date, time, and location of the ceremony, and of the reception too if different",
          "The RSVP deadline and how to respond: a link to a wedding page, an email address, or a reply card to send back",
          "Essential practical details if already known: dress code, whether children are welcome",
        ],
      },
      {
        type: "text",
        title: "Choosing a tone",
        paragraphs: [
          "A formal invitation leans on classic phrasing (\"have the honor of inviting you\", consistently formal address) and suits a traditional wedding or older family guests.",
          "A more casual invitation, informal address, personal wording, or a touch of humor, fits a relaxed reception among friends better. Consistency is what matters: a tone that clashes with the wedding's actual style can set the wrong expectations for guests.",
        ],
      },
      {
        type: "text",
        title: "Do you really need a save-the-date",
        paragraphs: [
          "It's not mandatory, especially for a local wedding with few travel constraints. It becomes nearly essential, though, once some guests need to book time off work, buy a plane ticket, or arrange childcare to attend.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Keep track of who received what and when, save-the-dates included: cross-checking these sends is often how you catch guests who were never followed up with for the formal invitation.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "For the full timeline and available formats, see our guide on [save-the-dates and invitations: the timeline](/blog/save-the-date-faire-part-calendrier). Fiancé lets you track each guest's invitation and reply in the same place as the rest of your planning.",
        ],
      },
    ],
  }),

  postPair({
    slug: "beaute-mains-ongles-avant-mariage",
    categoryKey: "ideas",
    categoryFr: "Inspiration",
    categoryEn: "Ideas",
    titleFr: "Beauté des mains et ongles : soigner les détails avant le jour J",
    titleEn: "Hand and nail care: perfecting the details before the big day",
    excerptFr:
      "Essai manucure, timing du dernier rendez-vous pour que le vernis tienne toute la journée, et astuces pour que les alliances soient jolies en photo.",
    excerptEn:
      "A manicure trial, timing your final appointment so polish lasts the whole day, and tips for rings that photograph well.",
    readingMinutes: 5,
    heroAltFr: "Manucure et soin des mains avant le mariage",
    heroAltEn: "Manicure and hand care before the wedding",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Les mains sont partout dans les photos de mariage : l'échange des alliances, le bouquet, les mains jointes pendant la cérémonie. Un soin qui commence trop tard ou une couleur mal choisie se voient beaucoup plus qu'on ne l'imagine sur les clichés finaux.",
        ],
      },
      {
        type: "list",
        title: "Le calendrier des mains et des ongles",
        items: [
          "Un mois avant : tester la forme et la couleur souhaitées lors d'un essai manucure, en particulier si vous n'avez pas l'habitude d'un vernis semi-permanent ou d'une pose en gel",
          "Deux semaines avant : dernier soin des cuticules ou traitement pour des ongles abîmés, le temps qu'ils récupèrent avant le jour J",
          "Deux à trois jours avant : rendez-vous manucure définitif, ni trop tôt (le vernis s'écaille ou l'éclat retombe) ni la veille (peu de marge en cas de raté)",
          "Le matin même : uniquement une retouche rapide si besoin, jamais un nouveau geste non testé",
        ],
      },
      {
        type: "list",
        title: "Choisir une couleur qui tient et qui filme bien",
        items: [
          "Privilégier un vernis semi-permanent ou une pose en gel pour la tenue, un vernis classique s'écaillant plus vite sur une journée longue",
          "Les teintes nude ou rosées vieillissent mieux visuellement au fil de la journée qu'une couleur vive qui marque le moindre écaillage",
          "Éviter un vernis fraîchement testé pour la première fois le jour du mariage : certaines formules réagissent différemment selon la peau",
        ],
      },
      {
        type: "text",
        title: "Pour que l'alliance soit belle en photo",
        paragraphs: [
          "Un gommage des mains et une bonne hydratation dans les jours précédents rendent la peau plus lisse pour les gros plans sur l'alliance. Évitez un soin des mains trop agressif juste avant, qui peut laisser une peau irritée ou marquée.",
          "Pensez à retirer tout autre bijou de la main pendant les photos de détail sur l'alliance : bagues superposées ou bracelet trop proche détournent l'attention du plan.",
        ],
      },
      {
        type: "text",
        title: "Et pour ceux qui portent aussi une alliance",
        paragraphs: [
          "Le même soin de base (ongles propres, mains hydratées) s'applique aussi au marié ou à l'autre époux. Un ongle mal taillé se voit tout autant sur une photo de mains jointes.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Prenez rendez-vous pour la manucure définitive en même temps que l'essai coiffure et maquillage si possible : cela évite un aller-retour supplémentaire dans une semaine déjà chargée.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Pensez à caler ce rendez-vous en cohérence avec l'[essai coiffure et maquillage](/blog/coiffure-maquillage-mariage-essai). Ajoutez chaque rendez-vous beauté à votre [timeline](/tools/timeline) pour ne pas les additionner tous sur la même semaine par erreur.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Hands are everywhere in wedding photos: the ring exchange, the bouquet, clasped hands during the ceremony. A routine started too late or a poorly chosen color shows up far more than you'd think in the final pictures.",
        ],
      },
      {
        type: "list",
        title: "A timeline for hands and nails",
        items: [
          "One month before: test the shape and color you want at a manicure trial, especially if gel or semi-permanent polish is new to you",
          "Two weeks before: a final cuticle treatment or care for damaged nails, giving them time to recover before the day",
          "Two to three days before: the final manicure appointment, not too early (polish chips or the shine fades) and not the night before (little room for a mistake)",
          "The morning of: only a quick touch-up if needed, never something new and untested",
        ],
      },
      {
        type: "list",
        title: "Choosing a color that lasts and photographs well",
        items: [
          "Favor semi-permanent or gel polish for staying power, since regular polish chips faster over a long day",
          "Nude or pink tones age better visually through the day than a bold color that shows the slightest chip",
          "Avoid trying a polish for the very first time on the wedding day itself: some formulas react differently depending on the skin",
        ],
      },
      {
        type: "text",
        title: "Making the ring look its best in photos",
        paragraphs: [
          "Exfoliating and moisturizing hands well in the days before makes skin look smoother for close-ups on the ring. Avoid an overly aggressive hand treatment right before, which can leave skin irritated or marked.",
          "Remember to remove any other jewelry from the hand during ring detail shots: stacked rings or a bracelet too close by pull attention away from the shot.",
        ],
      },
      {
        type: "text",
        title: "And for anyone else wearing a ring too",
        paragraphs: [
          "The same basic care (clean nails, moisturized hands) applies to the groom or the other spouse too. A poorly trimmed nail shows up just as much in a photo of clasped hands.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Book the final manicure alongside the hair and makeup trial if you can: it saves an extra trip during an already busy week.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Time this appointment to line up with your [hair and makeup trial](/blog/coiffure-maquillage-mariage-essai). Add every beauty appointment to your [timeline](/tools/timeline) so they don't all stack up on the same week by accident.",
        ],
      },
    ],
  }),

  postPair({
    slug: "coiffeur-maquilleur-domicile-jour-j",
    categoryKey: "vendors",
    categoryFr: "Prestataires",
    categoryEn: "Vendors",
    titleFr: "Coiffeur et maquilleur à domicile le jour J : organiser la matinée",
    titleEn: "Hair and makeup at home on the wedding day: organizing the morning",
    excerptFr:
      "Réserver un coiffeur et un maquilleur à domicile, chiffrer le temps nécessaire pour chaque personne, et écrire un planning précis pour que la matinée ne prenne pas de retard.",
    excerptEn:
      "Booking hair and makeup to come to you, realistically timing every person, and writing a precise schedule so the morning doesn't run late.",
    readingMinutes: 7,
    heroAltFr: "Préparation coiffure et maquillage le matin du mariage",
    heroAltEn: "Hair and makeup prep on the wedding morning",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "Faire venir un coiffeur et un maquilleur sur le lieu de préparation évite un trajet stressant le matin même, mais demande une organisation plus fine qu'un simple rendez-vous en institut. Sans planning écrit, la matinée déborde presque toujours sur l'horaire de la cérémonie.",
        ],
      },
      {
        type: "list",
        title: "Ce qu'il faut clarifier avec les prestataires en amont",
        items: [
          "Le nombre exact de personnes à coiffer et maquiller (mariée, mère, témoins, demoiselles d'honneur), pas une estimation approximative",
          "Si un ou deux prestataires viennent seuls ou avec une équipe : au-delà de trois ou quatre personnes, une seule paire de mains ne suffit généralement pas dans le temps disponible",
          "Le temps moyen par personne selon la prestation (coiffure simple, chignon élaboré, maquillage complet), à demander directement au prestataire plutôt qu'à estimer soi-même",
          "L'heure d'arrivée du prestataire sur place, en tenant compte du temps de trajet et d'installation avant la première personne",
        ],
      },
      {
        type: "text",
        title: "Calculer le temps réel nécessaire",
        paragraphs: [
          "Additionnez le temps par personne pour chaque prestation, ajoutez une marge de sécurité d'environ trente minutes pour les imprévus (retard, coiffure à refaire), puis remontez depuis l'heure de départ prévue vers la cérémonie pour fixer l'heure de début.",
          "La mariée passe presque toujours en dernier pour une coiffure ou un maquillage qui doit rester frais le plus longtemps possible, ce qui décale d'autant l'heure de début de sa propre prestation.",
        ],
      },
      {
        type: "list",
        title: "Un planning écrit, pas seulement dans la tête",
        items: [
          "Une liste avec chaque personne, son horaire de passage et la prestation prévue, partagée avec le témoin ou la personne qui coordonne la matinée",
          "Un créneau tampon avant l'heure de départ vers la cérémonie, pour absorber un léger retard sans stress",
          "Le nom et le numéro du prestataire visibles sur ce planning, en cas de besoin de le joindre rapidement le matin même",
        ],
      },
      {
        type: "text",
        title: "Organiser l'espace de préparation",
        paragraphs: [
          "Prévoyez une pièce suffisamment lumineuse, avec assez de prises électriques pour plusieurs appareils de coiffure en simultané, et un accès facile pour le prestataire qui apporte souvent du matériel volumineux.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Envoyez le planning écrit au prestataire lui-même quelques jours avant, pas seulement en interne. Un coiffeur ou maquilleur qui connaît l'ordre de passage à l'avance tient beaucoup mieux les horaires que si on le lui annonce sur place.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Avant de fixer ce planning, relisez notre guide sur [l'essai coiffure et maquillage](/blog/coiffure-maquillage-mariage-essai) pour éviter les surprises le jour J. Intégrez ensuite ce créneau dans votre [timeline jour J minute par minute](/blog/planning-jour-j-minute-par-minute).",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "Having hair and makeup come to your preparation location avoids a stressful trip the morning of, but it takes tighter organizing than a simple salon appointment. Without a written schedule, the morning almost always runs into ceremony time.",
        ],
      },
      {
        type: "list",
        title: "What to clarify with vendors ahead of time",
        items: [
          "The exact number of people getting hair and makeup done (bride, mother, wedding party, bridesmaids), not a rough estimate",
          "Whether one or two vendors are coming alone or with a team: past three or four people, one pair of hands usually isn't enough in the time available",
          "The average time per person for each service (simple styling, an elaborate updo, full makeup), asked directly to the vendor rather than guessed",
          "The vendor's arrival time on site, accounting for travel and setup before the first person",
        ],
      },
      {
        type: "text",
        title: "Working out the real time needed",
        paragraphs: [
          "Add up the time per person for each service, build in a safety margin of about thirty minutes for hiccups (running late, redoing a style), then work backward from the planned departure time for the ceremony to set a start time.",
          "The bride almost always goes last, so her hair or makeup stays fresh as long as possible, which pushes her own start time back accordingly.",
        ],
      },
      {
        type: "list",
        title: "A written schedule, not just something in your head",
        items: [
          "A list with each person, their time slot, and the planned service, shared with the witness or whoever is coordinating the morning",
          "A buffer slot before departure for the ceremony, to absorb a small delay without stress",
          "The vendor's name and phone number visible on this schedule, in case they need to be reached quickly that morning",
        ],
      },
      {
        type: "text",
        title: "Setting up the prep space",
        paragraphs: [
          "Plan for a room bright enough, with enough outlets for several styling tools running at once, and easy access for the vendor, who often brings bulky equipment.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Send the written schedule to the vendor themselves a few days ahead, not just internally. A hairstylist or makeup artist who knows the running order in advance keeps to time far better than being told on the spot.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Before setting this schedule, revisit our guide on the [hair and makeup trial](/blog/coiffure-maquillage-mariage-essai) to avoid surprises on the day. Then slot this time block into your [minute-by-minute wedding-day timeline](/blog/planning-jour-j-minute-par-minute).",
        ],
      },
    ],
  }),

  postPair({
    slug: "checklist-derniere-semaine-avant-mariage",
    categoryKey: "planning",
    categoryFr: "Préparatifs",
    categoryEn: "Planning",
    titleFr: "La dernière semaine avant le mariage : checklist anti-panique",
    titleEn: "The final week before the wedding: the no-panic checklist",
    excerptFr:
      "Confirmer les derniers chiffres, préparer la mallette, déléguer les rôles du jour J, confirmer les horaires prestataires : la checklist de la dernière semaine pour aborder le mariage sans courir partout.",
    excerptEn:
      "Confirming final headcounts, packing the emergency kit, delegating wedding-day roles, confirming vendor arrival times: the final-week checklist for approaching the wedding without running in every direction.",
    readingMinutes: 8,
    heroAltFr: "Checklist dernière semaine avant le mariage",
    heroAltEn: "Final week before the wedding checklist",
    disclaimer: false,
    sectionsFr: [
      {
        type: "text",
        paragraphs: [
          "La dernière semaine n'est pas le moment de rattraper du retard sur les grandes décisions, celles-là doivent déjà être prises. C'est le moment de vérifier, confirmer et déléguer, pour arriver au jour J avec un plan connu de tous plutôt qu'une liste de choses encore en suspens.",
          "Voici la checklist qui couvre l'essentiel de cette semaine, sans y ajouter de nouvelles décisions de fond.",
        ],
      },
      {
        type: "list",
        title: "Confirmer les chiffres avec les prestataires",
        items: [
          "Nombre final d'invités communiqué au traiteur, avec le détail des régimes alimentaires particuliers",
          "Horaires d'arrivée confirmés avec chaque prestataire (traiteur, DJ, photographe, fleuriste), pas juste supposés depuis le devis initial",
          "Dernier point sur la météo si une partie de la réception est en extérieur, avec le plan B activé si besoin",
          "Confirmation écrite de la livraison finale (fleurs, gâteau, décoration) : qui livre, à quelle heure, à qui remettre",
        ],
      },
      {
        type: "list",
        title: "Déléguer les rôles du jour J",
        items: [
          "Une personne responsable de la [mallette de secours](/blog/checklist-jour-j-mallette-secours), qui sait où elle se trouve à tout moment",
          "Une personne référente pour chaque prestataire, capable de répondre à une question sans vous déranger pendant la journée",
          "Une personne chargée de récupérer les affaires en fin de soirée (cadeaux, décoration, objets personnels), souvent oubliée dans la répartition des rôles",
          "Un contact unique et joignable pour les invités en cas de question de dernière minute (adresse, parking, horaire)",
        ],
      },
      {
        type: "list",
        title: "Préparer les enveloppes et les paiements",
        items: [
          "Solder les derniers paiements dus le jour même auprès des prestataires concernés, en espèces ou par virement selon ce qui a été convenu",
          "Préparer les [enveloppes de pourboires](/blog/pourboires-enveloppes-mariage-jour-j) à l'avance, avec le nom du prestataire inscrit dessus pour éviter toute confusion le jour J",
          "Confier ces enveloppes à la même personne responsable de la mallette de secours ou à un témoin de confiance",
        ],
      },
      {
        type: "text",
        title: "Ce qu'il faut boucler côté personnel",
        paragraphs: [
          "Préparer la tenue, les accessoires et la valise pour la nuit de noces, comme décrit dans notre guide sur [la veille du mariage](/blog/nuit-avant-mariage-preparation). Confirmer une dernière fois l'organisation du transport, autant pour les mariés que pour les proches qui doivent être présents à une heure précise.",
        ],
      },
      {
        type: "text",
        title: "Faire confiance au plan déjà posé",
        paragraphs: [
          "Après des mois de préparatifs, la tentation est grande de tout revérifier plusieurs fois par jour. Un planning déjà fixé, partagé avec les bonnes personnes, n'a pas besoin d'être repassé en revue en continu. Consultez-le une dernière fois posément, puis laissez-le faire son travail.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "Si un imprévu survient malgré tout cette semaine ou le jour même, la plupart des situations ont déjà une solution connue : voir notre guide [gérer les imprévus du jour J](/blog/imprevus-jour-j-mariage). Rien de ce qui peut arriver n'est aussi grave qu'il n'y paraît sur le moment.",
        ],
      },
      {
        type: "text",
        title: "Comment Fiancé peut vous aider",
        paragraphs: [
          "Retrouvez l'ensemble des rôles et horaires dans votre [timeline jour J minute par minute](/blog/planning-jour-j-minute-par-minute), le détail de la mallette dans notre [checklist jour J](/blog/checklist-jour-j-mallette-secours), et le calcul des pourboires dans notre guide [pourboires et enveloppes du jour J](/blog/pourboires-enveloppes-mariage-jour-j). Vous avez fait tout le travail en amont : cette dernière semaine ne consiste plus qu'à laisser le plan se dérouler.",
        ],
      },
    ],
    sectionsEn: [
      {
        type: "text",
        paragraphs: [
          "The final week isn't the time to catch up on big decisions, those should already be made. It's the time to verify, confirm, and delegate, so you arrive at the wedding with a plan everyone knows rather than a list of things still up in the air.",
          "Here's the checklist that covers the essentials of this week, without adding any new major decisions.",
        ],
      },
      {
        type: "list",
        title: "Confirm the numbers with vendors",
        items: [
          "Final guest count sent to the caterer, with the details of any special dietary needs",
          "Arrival times confirmed with every vendor (caterer, DJ, photographer, florist), not just assumed from the original quote",
          "A last weather check if part of the reception is outdoors, with the backup plan activated if needed",
          "Written confirmation of final deliveries (flowers, cake, decor): who's delivering, at what time, and to whom",
        ],
      },
      {
        type: "list",
        title: "Delegate wedding-day roles",
        items: [
          "One person responsible for the [emergency kit](/blog/checklist-jour-j-mallette-secours), who knows where it is at all times",
          "One point of contact per vendor, able to answer a question without pulling you away during the day",
          "One person in charge of collecting belongings at the end of the night (gifts, decor, personal items), often left out when assigning roles",
          "One single, reachable contact for guests with any last-minute question (address, parking, timing)",
        ],
      },
      {
        type: "list",
        title: "Prepare envelopes and payments",
        items: [
          "Settle any remaining payments due on the day itself with the relevant vendors, in cash or by transfer as agreed",
          "Prepare [tip envelopes](/blog/pourboires-enveloppes-mariage-jour-j) ahead of time, with each vendor's name written on it to avoid any mix-up on the day",
          "Hand these envelopes to the same person carrying the emergency kit, or to a trusted witness",
        ],
      },
      {
        type: "text",
        title: "What to wrap up on the personal side",
        paragraphs: [
          "Prepare your outfit, accessories, and bag for the wedding night, as described in our guide on [the night before the wedding](/blog/nuit-avant-mariage-preparation). Confirm transport arrangements one last time, both for the couple and for anyone who needs to be somewhere at a precise time.",
        ],
      },
      {
        type: "text",
        title: "Trust the plan already in place",
        paragraphs: [
          "After months of planning, the temptation to recheck everything several times a day is strong. A schedule that's already set and shared with the right people doesn't need constant re-reviewing. Go over it calmly one last time, then let it do its job.",
        ],
      },
      {
        type: "callout",
        paragraphs: [
          "If something unexpected still comes up this week or on the day, most situations already have a known fix: see our guide on [handling wedding-day surprises](/blog/imprevus-jour-j-mariage). Nothing that can happen is as serious as it feels in the moment.",
        ],
      },
      {
        type: "text",
        title: "How Fiancé can help",
        paragraphs: [
          "Find every role and time slot in your [minute-by-minute wedding-day timeline](/blog/planning-jour-j-minute-par-minute), the full emergency kit contents in our [wedding-day checklist](/blog/checklist-jour-j-mallette-secours), and how to calculate tips in our guide on [tips and envelopes for the wedding day](/blog/pourboires-enveloppes-mariage-jour-j). You've done all the work upfront: this final week is just about letting the plan play out.",
        ],
      },
    ],
  }),
];

export const { fr: POSTS_185_192_FR, en: POSTS_185_192_EN } = pairsToArrays(pairs);
