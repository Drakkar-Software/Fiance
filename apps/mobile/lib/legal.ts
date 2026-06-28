export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalDoc {
  title: string;
  subtitle: string;
  updated: string;
  sections: LegalSection[];
}

const termsFr: LegalDoc = {
  title: "Conditions d'utilisation",
  subtitle: "Ce que vous pouvez faire avec Fiancé, et ce que nous vous demandons.",
  updated: "Juin 2026",
  sections: [
    {
      title: "Acceptation",
      paragraphs: [
        "En installant, accédant ou utilisant Fiancé, vous acceptez d'être lié par ces Conditions d'utilisation. Si vous n'êtes pas d'accord avec une partie de ces Conditions, n'utilisez pas l'application.",
        "Ces Conditions s'appliquent à tous les utilisateurs de Fiancé, qu'ils accèdent à l'application en ligne, via une application mobile, ou via un serveur de synchronisation auto-hébergé.",
      ],
    },
    {
      title: "Description du service",
      paragraphs: [
        "Fiancé est une application de planification de mariage privée et hors ligne. Elle vous permet de gérer votre budget, vos invités, votre plan de table, vos prestataires, votre planning et vos photos.",
        "Toutes vos données sont stockées localement sur votre appareil. La synchronisation avec votre partenaire est une fonctionnalité optionnelle chiffrée de bout en bout. Vous êtes seul responsable de la sécurité de votre clé de synchronisation.",
      ],
    },
    {
      title: "Utilisation acceptable",
      paragraphs: [
        "Vous acceptez de ne pas utiliser Fiancé pour : (a) enfreindre toute loi locale, nationale ou internationale applicable ; (b) transmettre des logiciels malveillants, des spams ou des communications non sollicitées ; (c) tenter de compromettre la sécurité de l'application ou d'un serveur de synchronisation que vous n'opérez pas.",
      ],
    },
    {
      title: "Auto-hébergement",
      paragraphs: [
        "Si vous opérez un serveur de synchronisation Starfish pour vous-même ou pour d'autres, vous êtes pleinement responsable de sa sécurité, de sa disponibilité et de sa conformité légale, notamment des obligations de protection des données dans votre juridiction.",
        "Vous ne devez pas utiliser le logiciel pour héberger, stocker ou distribuer du contenu illégal dans votre juridiction ou dans celle de vos utilisateurs.",
      ],
    },
    {
      title: "Absence de garantie",
      paragraphs: [
        "Fiancé est fourni « tel quel » et « selon disponibilité », sans garantie d'aucune sorte, expresse ou implicite. Nous ne garantissons pas un fonctionnement ininterrompu ou sans erreur, ni la conservation permanente de vos données.",
      ],
    },
    {
      title: "Limitation de responsabilité",
      paragraphs: [
        "Dans toute la mesure permise par le droit applicable, Drakkar Software et ses contributeurs ne peuvent être tenus responsables de tout dommage indirect, accessoire, spécial ou consécutif, y compris la perte de données, résultant de votre utilisation de Fiancé.",
        "Notre responsabilité globale pour toute réclamation découlant de ces Conditions ne saurait excéder cent euros (100 €).",
      ],
    },
    {
      title: "Droit applicable",
      paragraphs: [
        "Ces Conditions sont régies par le droit français, sans égard aux dispositions relatives aux conflits de lois. Tout litige découlant de ces Conditions sera soumis à la compétence exclusive des tribunaux compétents de Paris, France.",
      ],
    },
    {
      title: "Modifications",
      paragraphs: [
        "Nous pouvons réviser ces Conditions périodiquement. La version la plus récente sera toujours disponible dans l'application. Les modifications importantes seront signalées dans les notes de version.",
        "La poursuite de l'utilisation de Fiancé après l'entrée en vigueur d'une révision constitue votre acceptation des Conditions mises à jour.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        "Des questions sur ces Conditions ? Contactez-nous à legal@drakkar.software.",
      ],
    },
  ],
};

const termsEn: LegalDoc = {
  title: "Terms of Service",
  subtitle: "What you can do with Fiancé, and what we ask of you.",
  updated: "June 2026",
  sections: [
    {
      title: "Acceptance",
      paragraphs: [
        "By installing, accessing, or using Fiancé, you agree to be bound by these Terms of Service. If you do not agree with any part of these Terms, do not use the application.",
        "These Terms apply to all users of Fiancé, whether accessing the app online, via a mobile application, or via a self-hosted sync server.",
      ],
    },
    {
      title: "Description of the Service",
      paragraphs: [
        "Fiancé is a private, offline-first wedding planning app. It lets you manage your budget, guest list, seating chart, vendors, timeline, and photo album.",
        "All your data is stored locally on your device. Syncing with your partner is an optional, end-to-end encrypted feature. You are solely responsible for the security of your sync key.",
      ],
    },
    {
      title: "Acceptable Use",
      paragraphs: [
        "You agree not to use Fiancé to: (a) violate any applicable local, national, or international law; (b) transmit malware, spam, or unsolicited communications; (c) attempt to compromise the security of the application or any sync server you do not operate.",
      ],
    },
    {
      title: "Self-Hosting",
      paragraphs: [
        "If you operate a Starfish sync server for yourself or others, you bear full responsibility for its security, availability, and legal compliance, including data protection obligations in your jurisdiction.",
        "You must not use the software to host, store, or distribute content that is illegal in your jurisdiction or in the jurisdiction of your users.",
      ],
    },
    {
      title: "No Warranty",
      paragraphs: [
        "Fiancé is provided \"as is\" and \"as available\", without warranty of any kind, express or implied. We do not warrant uninterrupted or error-free operation, or the permanent preservation of your data.",
      ],
    },
    {
      title: "Limitation of Liability",
      paragraphs: [
        "To the maximum extent permitted by applicable law, Drakkar Software and its contributors shall not be liable for any indirect, incidental, special, or consequential damages, including loss of data, arising from your use of or inability to use Fiancé.",
        "Our aggregate liability for any claim arising from these Terms shall not exceed one hundred euros (€100).",
      ],
    },
    {
      title: "Governing Law",
      paragraphs: [
        "These Terms are governed by the laws of France, without regard to conflict-of-law provisions. Any dispute arising under these Terms shall be submitted to the exclusive jurisdiction of the competent courts of Paris, France.",
      ],
    },
    {
      title: "Changes to These Terms",
      paragraphs: [
        "We may revise these Terms from time to time. The most current version will always be available in the application. Material changes will be flagged in the release notes.",
        "Continued use of Fiancé after a revision becomes effective constitutes your acceptance of the updated Terms.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        "Legal questions? Contact us at legal@drakkar.software.",
      ],
    },
  ],
};

const privacyFr: LegalDoc = {
  title: "Politique de confidentialité",
  subtitle: "Comment Fiancé gère vos données — ou plutôt, comment il ne les gère pas.",
  updated: "Juin 2026",
  sections: [
    {
      title: "Aperçu",
      paragraphs: [
        "Fiancé est une application hors ligne et orientée vie privée. Vos données de mariage — budget, invités, plan de table, prestataires, planning — sont stockées exclusivement sur votre appareil. Ni Drakkar Software, ni aucun serveur, ne peut lire vos données.",
        "Cette politique décrit les informations minimales associées à votre utilisation de Fiancé et la manière dont elles sont traitées.",
      ],
    },
    {
      title: "Données locales",
      paragraphs: [
        "Toutes vos données de planification de mariage sont stockées localement sur votre appareil. Elles ne sont jamais transmises à un serveur tiers sans votre consentement explicite.",
        "Désinstaller l'application supprime vos données locales. Il n'existe pas de sauvegarde automatique côté serveur à moins que vous n'activiez la synchronisation.",
      ],
    },
    {
      title: "Synchronisation optionnelle",
      paragraphs: [
        "La fonctionnalité de synchronisation avec votre partenaire est entièrement optionnelle. Si vous l'activez, vos données sont chiffrées côté client avec AES-256-GCM avant toute transmission. Le serveur stocke un blob opaque chiffré et ne peut en aucun cas lire vos données.",
        "Votre clé de chiffrement est dérivée de votre jeton d'authentification et ne quitte jamais votre appareil sous forme lisible. Drakkar Software n'a pas accès à cette clé.",
      ],
    },
    {
      title: "Page publique de mariage",
      paragraphs: [
        "Si vous activez la page publique de mariage, les informations que vous choisissez de partager (date, lieu, message d'accueil) deviennent accessibles via un lien public. Vous contrôlez intégralement le contenu partagé.",
        "Les données de la page publique sont stockées sur le serveur de synchronisation que vous avez configuré. Drakkar Software ne gère pas de serveur par défaut.",
      ],
    },
    {
      title: "Métadonnées serveur",
      paragraphs: [
        "Lorsque vous utilisez la synchronisation, des métadonnées de connexion minimales — identifiants de documents, horodatages, taille des blobs chiffrés — sont nécessairement visibles par le serveur pour acheminer et stocker vos données. Ces métadonnées ne contiennent aucun contenu lisible.",
      ],
    },
    {
      title: "Analytique",
      paragraphs: [
        "Fiancé peut collecter quelques événements analytiques entièrement anonymes — tels que des rapports d'erreurs techniques — pour améliorer la stabilité de l'application. Aucun SDK publicitaire, aucun pixel de tracking ni aucune bibliothèque tierce ne rapporte vos données d'utilisation à des tiers.",
      ],
    },
    {
      title: "Conservation des données",
      paragraphs: [
        "Vos données sont conservées sur votre appareil aussi longtemps que vous le souhaitez. Vous pouvez supprimer un mariage depuis les paramètres de l'application. Si vous utilisez la synchronisation, les données sur le serveur sont conservées selon la politique d'infrastructure de l'opérateur du serveur.",
      ],
    },
    {
      title: "Mineurs",
      paragraphs: [
        "Fiancé n'est pas destiné aux enfants de moins de 13 ans. Nous ne traitons pas sciemment de données relatives à des mineurs. Si vous pensez qu'un mineur a créé un compte, contactez-nous à l'adresse ci-dessous.",
      ],
    },
    {
      title: "Modifications",
      paragraphs: [
        "Nous pouvons mettre à jour cette politique pour refléter des changements dans l'application ou le droit applicable. Les modifications importantes seront communiquées via les notes de version.",
        "La poursuite de l'utilisation de Fiancé après une mise à jour constitue votre acceptation des conditions révisées.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        "Des questions sur cette Politique de confidentialité ? Contactez-nous à privacy@drakkar.software.",
      ],
    },
  ],
};

const privacyEn: LegalDoc = {
  title: "Privacy Policy",
  subtitle: "How Fiancé handles your data — or rather, how it doesn't.",
  updated: "June 2026",
  sections: [
    {
      title: "Overview",
      paragraphs: [
        "Fiancé is an offline-first, privacy-focused wedding planning app. Your wedding data — budget, guests, seating chart, vendors, timeline — is stored exclusively on your device. Neither Drakkar Software nor any server can read your data.",
        "This policy describes the minimal information associated with your use of Fiancé and how it is handled.",
      ],
    },
    {
      title: "Local Data",
      paragraphs: [
        "All your wedding planning data is stored locally on your device. It is never transmitted to a third-party server without your explicit consent.",
        "Uninstalling the app removes your local data. There is no automatic server-side backup unless you enable sync.",
      ],
    },
    {
      title: "Optional Sync",
      paragraphs: [
        "The sync feature for sharing with your partner is entirely optional. If you enable it, your data is encrypted client-side using AES-256-GCM before any transmission. The server stores an opaque encrypted blob and cannot read your data.",
        "Your encryption key is derived from your authentication token and never leaves your device in a readable form. Drakkar Software has no access to this key.",
      ],
    },
    {
      title: "Public Wedding Page",
      paragraphs: [
        "If you enable the public wedding page, the information you choose to share (date, venue, welcome message) becomes accessible via a public link. You have full control over what is shared.",
        "Public page data is stored on the sync server you configured. Drakkar Software does not operate a default server.",
      ],
    },
    {
      title: "Server Metadata",
      paragraphs: [
        "When you use sync, minimal connection metadata — document identifiers, timestamps, encrypted blob sizes — is necessarily visible to the server in order to route and store your data. This metadata contains no readable content.",
      ],
    },
    {
      title: "Analytics",
      paragraphs: [
        "Fiancé may collect a few completely anonymous analytics events — such as technical error reports — to improve app stability. No advertising SDK, tracking pixel, or third-party library reports your usage data to external parties.",
      ],
    },
    {
      title: "Data Retention",
      paragraphs: [
        "Your data is retained on your device for as long as you choose. You can delete a wedding from the app settings. If you use sync, data on the server is retained according to the server operator's infrastructure policy.",
      ],
    },
    {
      title: "Children's Privacy",
      paragraphs: [
        "Fiancé is not directed at children under the age of 13. We do not knowingly process information relating to minors. If you believe a minor has created an account, please contact us at the address below.",
      ],
    },
    {
      title: "Changes to This Policy",
      paragraphs: [
        "We may update this policy to reflect changes in the software or applicable law. Material changes will be communicated through the application release notes.",
        "Continued use of Fiancé after a policy update constitutes acceptance of the revised terms.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        "Questions about this Privacy Policy? Contact us at privacy@drakkar.software.",
      ],
    },
  ],
};

export function getLegalDocs(lang: string): { terms: LegalDoc; privacy: LegalDoc } {
  if (lang === "en") return { terms: termsEn, privacy: privacyEn };
  return { terms: termsFr, privacy: privacyFr };
}
