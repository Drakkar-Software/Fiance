import { addMonths, addDays } from "date-fns";
import {
  BACKUP_VERSION,
  createBackupDocument,
  DEFAULT_LEGAL_MILESTONES,
  type BackupData,
  type WeddingSnapshot,
} from "@fiance/sdk";
import type { SampleSize } from "./types";

const TS = "2026-07-01T10:00:00.000Z";

export interface SampleProfile {
  id: SampleSize;
  partner1Name: string;
  partner2Name: string;
  weddingDate: string;
  venueName: string;
  description: string;
  budgetTarget: number;
  guestCount: number;
  tableCount: number;
  vendorCount: number;
  taskCount: number;
  agendaCount: number;
  dayOfCount: number;
  ideaCollectionCount: number;
  ideasPerCollection: number;
  accommodationCount: number;
  giftCount: number;
  communicationCount: number;
  includeBothDays: boolean;
  weddingPartyCount: number;
  seatingConstraintCount: number;
  weddingEventCount: number;
  legalMilestoneCount: number;
  includeHoneymoonPlan: boolean;
}

function id(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(3, "0")}`;
}

function json(value: unknown): string {
  return JSON.stringify(value);
}

const FIRST_NAMES = [
  "Alice", "Antoine", "Camille", "Claire", "David", "Élise", "Emma", "Fabien",
  "Hugo", "Inès", "Julie", "Lucas", "Manon", "Marc", "Marie", "Mathieu",
  "Nicolas", "Paul", "Pierre", "Sarah", "Sophie", "Thomas", "Valérie", "Vincent",
  "Amélie", "Benoît", "Caroline", "Cédric", "Chloé", "Damien", "Émilie", "François",
  "Gaëlle", "Guillaume", "Hélène", "Isabelle", "Jean", "Julien", "Laure", "Louis",
  "Margot", "Maxime", "Nathalie", "Olivier", "Patricia", "Philippe", "Romain", "Sandrine",
];

const LAST_NAMES = [
  "Bernard", "Bonnet", "Dupont", "Durand", "Fournier", "Garnier", "Girard", "Laurent",
  "Lefebvre", "Leroy", "Martin", "Mercier", "Moreau", "Petit", "Renard", "Roux",
  "Simon", "Thomas", "Vincent", "Blanc", "Chevalier", "Colin", "Dubois", "Fontaine",
  "Gauthier", "Henry", "Lambert", "Leclerc", "Marchand", "Michel", "Muller", "Perrin",
];

const VENDOR_DEFS: Array<{
  type: string;
  name: string;
  status: string;
  basePrice: number;
  pppSource?: string;
}> = [
  { type: "VENUE", name: "Domaine des Vignes", status: "BOOKED", basePrice: 3500 },
  { type: "CATERER", name: "Les Saveurs du Terroir", status: "BOOKED", basePrice: 0, pppSource: "FULL" },
  { type: "PHOTOGRAPHER", name: "Studio Lumière", status: "BOOKED", basePrice: 2200 },
  { type: "VIDEOGRAPHER", name: "Films & Souvenirs", status: "QUOTE_RECEIVED", basePrice: 1800 },
  { type: "FLORIST", name: "Fleurs de Saison", status: "BOOKED", basePrice: 950 },
  { type: "DJ", name: "DJ Maxence", status: "BOOKED", basePrice: 900 },
  { type: "BAND", name: "The Swing Quartet", status: "NEGOTIATING", basePrice: 1600 },
  { type: "HAIR_MAKEUP", name: "Beauty by Clara", status: "BOOKED", basePrice: 450 },
  { type: "CAKE", name: "Pâtisserie Douceur", status: "BOOKED", basePrice: 520 },
  { type: "WEDDING_PLANNER", name: "Mariages & Co", status: "BOOKED", basePrice: 2800 },
  { type: "TRANSPORT", name: "VTC Prestige", status: "QUOTE_RECEIVED", basePrice: 650 },
  { type: "SHUTTLE", name: "Navettes Provence", status: "BOOKED", basePrice: 480 },
  { type: "STATIONERY", name: "Papeterie Fine", status: "BOOKED", basePrice: 380 },
  { type: "PHOTO_BOOTH", name: "Snap & Smile", status: "PROSPECT", basePrice: 420 },
  { type: "HOTEL", name: "Hôtel du Parc", status: "BOOKED", basePrice: 1200 },
  { type: "OFFICIANT", name: "Cérémonie laïque par Élodie", status: "BOOKED", basePrice: 350 },
  { type: "FURNITURE_RENTAL", name: "Location Élégance", status: "BOOKED", basePrice: 1100 },
  { type: "KIDS_ENTERTAINER", name: "Atelier Petits Invités", status: "PROSPECT", basePrice: 280 },
  // Comparison-group demo vendors (appended so existing indices/counts are untouched):
  { type: "CATERER", name: "Traiteur du Marché", status: "QUOTE_RECEIVED", basePrice: 0, pppSource: "FULL" },
  { type: "CATERER", name: "Table de Provence", status: "NEGOTIATING", basePrice: 0, pppSource: "FULL" },
  { type: "PHOTOGRAPHER", name: "Regard Photographie", status: "QUOTE_RECEIVED", basePrice: 1900 },
  { type: "PHOTOGRAPHER", name: "Instants Précieux", status: "PROSPECT", basePrice: 2100 },
];

const TASK_TITLES = [
  "Définir le budget global",
  "Réserver le lieu de réception",
  "Choisir le traiteur",
  "Envoyer les faire-part",
  "Relancer les RSVP en attente",
  "Finaliser le plan de table",
  "Valider le menu avec le traiteur",
  "Essayage robe / costume",
  "Essai coiffure et maquillage",
  "Préparer les discours",
  "Commander le gâteau",
  "Organiser la navette invités",
  "Réserver les chambres d'hôtel",
  "Préparer la playlist",
  "Acheter les alliances",
  "Signer le contrat photographe",
  "Planifier la répétition générale",
  "Confirmer les horaires prestataires",
  "Préparer les cadeaux invités",
  "Organiser le brunch du lendemain",
  "Vérifier les assurances",
  "Commander les fleurs",
  "Réserver le photobooth",
  "Préparer la valise de noces",
  "Envoyer les remerciements",
];

const AGENDA_TITLES = [
  "Essayage robe",
  "Dégustation traiteur",
  "Rendez-vous fleuriste",
  "Signature contrat DJ",
  "Essai coiffure",
  "Visite domaine",
  "Rendez-vous mairie",
  "Réunion planification",
  "Essai maquillage",
  "Visite photographe",
  "Réunion témoins",
  "Dernière dégustation",
];

const DAY_OF_TITLES = [
  { title: "Arrivée des prestataires", time: "08:00", public: false },
  { title: "Préparatifs mariée", time: "10:00", public: false },
  { title: "Préparatifs marié", time: "10:30", public: false },
  { title: "Cérémonie civile", time: "14:30", public: true, location: "Mairie" },
  { title: "Cérémonie laïque", time: "16:00", public: true, location: "Jardin du domaine" },
  { title: "Vin d'honneur", time: "17:00", public: true },
  { title: "Dîner", time: "19:30", public: true },
  { title: "Ouverture du bal", time: "22:00", public: true },
  { title: "Buffet minuit", time: "00:30", public: false },
  { title: "Brunch du lendemain", time: "11:00", public: true, location: "Terrasse" },
  { title: "Départ des navettes", time: "01:30", public: false },
  { title: "Fin de soirée", time: "02:00", public: false },
  { title: "Accueil invités hôtel", time: "23:00", public: false },
  { title: "Photos de groupe", time: "17:45", public: false },
  { title: "Discours des témoins", time: "21:00", public: true },
];

const IDEA_COLLECTIONS = [
  { name: "Décoration de table", description: "Centre de table et vaisselle" },
  { name: "Ambiance salle", description: "Lumières, guirlandes et drapés" },
  { name: "Cérémonie", description: "Arche, allée et chaises" },
  { name: "Tenues", description: "Robe, costume et accessoires" },
  { name: "Gâteau", description: "Formes, saveurs et décoration" },
  { name: "Inspiration photo", description: "Poses et style éditorial" },
];

const IDEA_ITEMS = [
  { title: "Centre de table champêtre", category: "TABLE_DECOR", tags: ["lin", "fleurs séchées"] },
  { title: "Guirlandes lumineuses", category: "VENUE_DECOR", tags: ["soirée", "chaleureux"] },
  { title: "Arche en bois flotté", category: "CEREMONY_DECOR", tags: ["nature", "bord de mer"] },
  { title: "Bouquet de pivoines", category: "BOUQUET", tags: ["romantique", "pastel"] },
  { title: "Robe bohème", category: "ATTIRE", tags: ["dentelle", "dos nu"] },
  { title: "Naked cake aux fruits", category: "CAKE", tags: ["saison", "rustique"] },
  { title: "Reportage en lumière dorée", category: "PHOTO_STYLE", tags: ["coucher de soleil"] },
  { title: "Menu calligraphié", category: "TABLE_DECOR", tags: ["papier", "élégant"] },
  { title: "Chapiteau en toile", category: "VENUE", tags: ["extérieur", "élégant"] },
  { title: "Bar à cocktails", category: "VENUE_DECOR", tags: ["convivial"] },
  { title: "Plan de table kraft", category: "TABLE_DECOR", tags: ["DIY"] },
  { title: "Photobooth vintage", category: "OTHER", tags: ["fun"] },
  { title: "Alliances gravées", category: "OTHER", tags: ["personnalisé"] },
  { title: "Chaises crossback", category: "VENUE_DECOR", tags: ["bois"] },
  { title: "Cérémonie au coucher du soleil", category: "CEREMONY_DECOR", tags: ["golden hour"] },
  { title: "Costume bleu nuit", category: "ATTIRE", tags: ["classique"] },
  { title: "Macaron tower", category: "CAKE", tags: ["coloré"] },
  { title: "Table d'honneur fleurie", category: "TABLE_DECOR", tags: ["haut de gamme"] },
];

const ACCOMMODATIONS = [
  { name: "Hôtel du Parc", address: "12 avenue des Tilleuls, 84000 Avignon", bedCount: 24, pricePerNight: 95 },
  { name: "Chambres d'hôtes Les Oliviers", address: "Route de Gordes, 84220 Roussillon", bedCount: 8, pricePerNight: 75 },
  { name: "Gîte Le Mas", address: "Chemin des Lavandes, 84160 Lourmarin", bedCount: 12, pricePerNight: 120 },
  { name: "Résidence Les Jardins", address: "5 rue Victor Hugo, 84000 Avignon", bedCount: 30, pricePerNight: 85 },
  { name: "Auberge de la Fontaine", address: "Place de l'Église, 84360 Ménerbes", bedCount: 6, pricePerNight: 68 },
  { name: "Grand Hôtel Paris", address: "8 boulevard Haussmann, 75009 Paris", bedCount: 45, pricePerNight: 165 },
];

const GIFT_ITEMS = [
  { title: "Set de casseroles", category: "maison", price: 180 },
  { title: "Machine à café", category: "maison", price: 320 },
  { title: "Contributions lune de miel", category: "voyage", price: 500 },
  { title: "Week-end en Toscane", category: "voyage", price: 800 },
  { title: "Cours de cuisine", category: "experience", price: 120 },
  { title: "Dîner gastronomique", category: "experience", price: 200 },
  { title: "Parure de lit", category: "maison", price: 150 },
  { title: "Robot de cuisine", category: "maison", price: 450 },
  { title: "Valise de voyage", category: "voyage", price: 220 },
  { title: "Spa en duo", category: "experience", price: 160 },
  { title: "Service à thé", category: "maison", price: 90 },
  { title: "Cadeau libre", category: "autre", price: null },
  { title: "Mixeur", category: "maison", price: 110 },
  { title: "Vol Paris-Rome", category: "voyage", price: 350 },
  { title: "Abonnement vin", category: "experience", price: 240 },
  { title: "Plaid en cachemire", category: "maison", price: 130 },
  { title: "Appareil photo instantané", category: "autre", price: 95 },
  { title: "Cours de danse", category: "experience", price: 140 },
  { title: "Ensemble de verres", category: "maison", price: 75 },
  { title: "Nuit dans un château", category: "voyage", price: 420 },
];

const WEDDING_PARTY_ROLE_NAMES = ["Témoin", "Officiant·e", "Demoiselle d'honneur", "Garçon d'honneur"] as const;

const COMMUNICATION_LABELS = [
  "Save-the-date",
  "Faire-part officiels",
  "Relance RSVP",
  "Infos logement",
  "Programme du week-end",
  "Remerciements post-mariage",
];

function buildInvitationTypes(includeBothDays: boolean) {
  const types = [
    { id: "CEREMONY", label: "Cérémonie uniquement", isDefault: true, needsSleeping: false, createdAt: TS, updatedAt: TS },
    { id: "COCKTAIL", label: "Cocktail uniquement", isDefault: true, needsSleeping: false, createdAt: TS, updatedAt: TS },
    { id: "FULL", label: "Journée complète", isDefault: true, needsSleeping: false, createdAt: TS, updatedAt: TS },
  ];
  if (includeBothDays) {
    types.push({
      id: "BOTH_DAYS",
      label: "Week-end complet",
      isDefault: false,
      needsSleeping: true,
      createdAt: TS,
      updatedAt: TS,
    });
  }
  return types;
}

function buildGuestGroups(prefix: string, count: number) {
  const names = ["Famille mariée", "Famille marié", "Amis proches", "Collègues", "Voisins", "Enfants"];
  return Array.from({ length: count }, (_, i) => ({
    id: id(`${prefix}-gg`, i + 1),
    name: names[i] ?? `Groupe ${i + 1}`,
    createdAt: TS,
    updatedAt: TS,
  }));
}

function buildTables(prefix: string, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: id(`${prefix}-t`, i + 1),
    name: `Table ${i + 1}`,
    capacity: i === 0 ? 10 : 8,
    notes: null,
    positionX: (i % 5) * 120,
    positionY: Math.floor(i / 5) * 120,
    shape: i === 0 ? "head" : "round",
  }));
}

function buildGuests(
  prefix: string,
  count: number,
  groups: ReturnType<typeof buildGuestGroups>,
  tables: ReturnType<typeof buildTables>,
  accommodations: ReturnType<typeof buildAccommodations>,
  includeBothDays: boolean,
  vendors: ReturnType<typeof buildVendors>,
) {
  const invitationTypes = includeBothDays
    ? ["FULL", "COCKTAIL", "CEREMONY", "BOTH_DAYS"]
    : ["FULL", "COCKTAIL", "CEREMONY"];
  const rsvpStatuses = ["ACCEPTED", "ACCEPTED", "ACCEPTED", "PENDING", "DECLINED", "MAYBE"];
  const diets = ["STANDARD", "STANDARD", "VEGETARIAN", "VEGAN", "ALLERGY"];
  const sides = ["partner1", "partner2", "both"];
  const shuttleVendor = vendors.find((v) => v.type === "SHUTTLE") ?? null;
  const transportModes = ["car", "train", "shuttle", "taxi"];

  return Array.from({ length: count }, (_, i) => {
    const group = groups[i % groups.length];
    const table = tables[i % tables.length];
    const accommodation = i % 5 === 0 ? accommodations[i % accommodations.length] : null;
    const invitationType = invitationTypes[i % invitationTypes.length];
    const needsSleeping = invitationType === "BOTH_DAYS" || (i % 7 === 0 && includeBothDays);
    const usesShuttle = shuttleVendor && i % 5 === 0;

    return {
      id: id(`${prefix}-g`, i + 1),
      firstName: FIRST_NAMES[i % FIRST_NAMES.length],
      lastName: LAST_NAMES[(i + 3) % LAST_NAMES.length],
      side: sides[i % sides.length],
      invitationType,
      rsvpStatus: rsvpStatuses[i % rsvpStatuses.length],
      rsvpDate: i % 4 === 0 ? TS : null,
      isSleeping: needsSleeping,
      childrenCount: i % 11 === 0 ? 2 : i % 13 === 0 ? 1 : null,
      diet: diets[i % diets.length],
      dietNotes: i % 17 === 0 ? "Allergie aux fruits à coque" : null,
      groupId: group.id,
      tableId: table.id,
      companionId: i % 9 === 0 && i + 1 < count ? id(`${prefix}-g`, i + 2) : null,
      noTableNeeded: false,
      giftDescription: i % 19 === 0 ? "Service à thé" : null,
      thankYouSent: i % 23 === 0,
      thankYouSentDate: i % 23 === 0 ? TS : null,
      accommodationId: needsSleeping && accommodation ? accommodation.id : null,
      roomNumber: needsSleeping && accommodation ? `${100 + (i % 20)}` : null,
      rsvpToken: id(`${prefix}-rsvp`, i + 1),
      email: i % 3 === 0 ? `invite${i + 1}@example.com` : null,
      phone: i % 4 === 0 ? `06${String(10000000 + i).slice(-8)}` : null,
      address: i % 6 === 0 ? `${i + 1} rue de la Paix, 75002 Paris` : null,
      notes: i % 15 === 0 ? "Arrive en retard à la cérémonie" : null,
      shuttleVendorId: usesShuttle ? shuttleVendor!.id : null,
      shuttlePickupLocation: usesShuttle ? "Gare centrale" : null,
      shuttlePickupTime: usesShuttle ? "17:30" : null,
      parkingNeeded: i % 6 === 1,
      parkingNotes: null,
      arrivalNotes: i % 12 === 0 ? "Train TGV 14h02" : null,
      transportMode: transportModes[i % transportModes.length],
      createdAt: TS,
      updatedAt: TS,
    };
  });
}

function buildVendors(prefix: string, count: number) {
  const sliced = VENDOR_DEFS.slice(0, count);
  const typeCounts = new Map<string, number>();
  for (const v of sliced) typeCounts.set(v.type, (typeCounts.get(v.type) ?? 0) + 1);
  const typeSortIndex = new Map<string, number>();

  return sliced.map((v, i) => {
    const isComparisonGroup = (typeCounts.get(v.type) ?? 0) > 1;
    const sortOrder = isComparisonGroup ? (typeSortIndex.get(v.type) ?? 0) : null;
    if (isComparisonGroup) typeSortIndex.set(v.type, (sortOrder ?? 0) + 1);

    return {
    id: id(`${prefix}-v`, i + 1),
    type: v.type,
    name: v.name,
    contactName: "Contact commercial",
    phone: `04${String(90000000 + i).slice(-8)}`,
    email: `contact@${v.name.toLowerCase().replace(/\s+/g, "")}.fr`,
    website: `https://example.com/${v.type.toLowerCase()}`,
    status: v.status,
    quoteDate: addMonths(new Date("2026-07-01"), -6 - i).toISOString().slice(0, 10),
    eventDate: "2026-09-12",
    basePrice: v.basePrice,
    pricePerPerson: v.pppSource ? 85 + i * 3 : null,
    pppSource: v.pppSource ?? null,
    depositAmount: Math.round(v.basePrice * 0.3),
    depositPaid: v.status === "BOOKED",
    depositDueDate: addMonths(new Date("2026-07-01"), -2).toISOString().slice(0, 10),
    balanceDueDate: addMonths(new Date("2026-07-01"), 1).toISOString().slice(0, 10),
    validityDate: addMonths(new Date("2026-07-01"), 3).toISOString().slice(0, 10),
    customFields: null,
    notes: i % 2 === 0 ? "Contrat signé, acompte versé." : null,
    rating: v.status === "BOOKED" ? 4 + (i % 2) : null,
    eventId: null,
    comparisonGroupId: isComparisonGroup ? `${prefix}-cmp-${v.type.toLowerCase()}` : null,
    isSelected: isComparisonGroup ? v.status === "BOOKED" : null,
    sortOrder,
    createdAt: TS,
    updatedAt: TS,
    };
  });
}

function buildQuotePricings(prefix: string, vendors: ReturnType<typeof buildVendors>) {
  const pricings: Array<{
    id: string;
    vendorId: string;
    pricingKey: string;
    pricePerPerson: number | null;
    guestCountOverride: number | null;
    staffFee: number | null;
    travelFee: number | null;
  }> = [];

  vendors.forEach((vendor, i) => {
    if (vendor.type === "CATERER") {
      pricings.push(
        { id: id(`${prefix}-qp`, pricings.length + 1), vendorId: vendor.id, pricingKey: "dinner", pricePerPerson: 78, guestCountOverride: null, staffFee: 350, travelFee: null },
        { id: id(`${prefix}-qp`, pricings.length + 2), vendorId: vendor.id, pricingKey: "cocktail", pricePerPerson: 22, guestCountOverride: null, staffFee: null, travelFee: null },
        { id: id(`${prefix}-qp`, pricings.length + 3), vendorId: vendor.id, pricingKey: "vegetarian", pricePerPerson: 72, guestCountOverride: null, staffFee: null, travelFee: null },
        { id: id(`${prefix}-qp`, pricings.length + 4), vendorId: vendor.id, pricingKey: "child", pricePerPerson: 35, guestCountOverride: null, staffFee: null, travelFee: null },
      );
    } else if (vendor.pppSource) {
      pricings.push({
        id: id(`${prefix}-qp`, pricings.length + 1),
        vendorId: vendor.id,
        pricingKey: "dinner",
        pricePerPerson: 65 + i * 2,
        guestCountOverride: null,
        staffFee: 200,
        travelFee: 80,
      });
    }
  });

  return pricings;
}

function buildVendorPayments(prefix: string, vendors: ReturnType<typeof buildVendors>) {
  return vendors
    .filter((v) => v.status === "BOOKED" && v.depositAmount)
    .slice(0, Math.min(vendors.length, 8))
    .map((vendor, i) => ({
      id: id(`${prefix}-vp`, i + 1),
      vendorId: vendor.id,
      amount: vendor.depositAmount ?? 0,
      paidDate: addMonths(new Date("2026-07-01"), -3 + (i % 2)).toISOString().slice(0, 10),
      dueDate: null,
      method: i % 2 === 0 ? "transfer" : "card",
      label: "Acompte",
      notes: null,
      createdAt: TS,
      updatedAt: TS,
    }));
}

function buildTaskCategories(prefix: string) {
  const cats = [
    { name: "Administratif", icon: "file-text", color: "#3B82F6" },
    { name: "Lieu", icon: "map-pin", color: "#10B981" },
    { name: "Traiteur", icon: "utensils", color: "#F59E0B" },
    { name: "Tenues", icon: "sparkles", color: "#EC4899" },
    { name: "Photo & vidéo", icon: "camera", color: "#8B5CF6" },
    { name: "Musique", icon: "music", color: "#6366F1" },
    { name: "Fleurs", icon: "flower", color: "#84CC16" },
    { name: "Invités", icon: "users", color: "#38BDF8" },
    { name: "Budget", icon: "credit-card", color: "#F97316" },
    { name: "Divers", icon: "more-horizontal", color: "#9CA3AF" },
  ];
  return cats.map((c, i) => ({
    id: id(`${prefix}-tc`, i + 1),
    name: c.name,
    icon: c.icon,
    color: c.color,
    sortOrder: i + 1,
  }));
}

function buildTasks(
  prefix: string,
  count: number,
  categories: ReturnType<typeof buildTaskCategories>,
  vendors: ReturnType<typeof buildVendors>,
  weddingDate: string,
) {
  return TASK_TITLES.slice(0, count).map((title, i) => {
    const category = categories[i % categories.length];
    const vendor = vendors[i % vendors.length];
    const monthsBefore = Math.max(1, 18 - i);
    return {
      id: id(`${prefix}-task`, i + 1),
      categoryId: category.id,
      title,
      description: i % 3 === 0 ? "Tâche importante à ne pas oublier." : null,
      status: i % 4 === 0 ? "DONE" : "TODO",
      priority: i % 5 === 0 ? "CRITICAL" : i % 3 === 0 ? "HIGH" : "MEDIUM",
      dueDate: addMonths(new Date(weddingDate), -monthsBefore).toISOString(),
      monthsBefore,
      isSystem: false,
      vendorId: i % 2 === 0 ? vendor.id : null,
      assignee: i % 2 === 0 ? "partner1" : "partner2",
      reminderDaysBefore: i % 3 === 0 ? 7 : null,
      completedAt: i % 4 === 0 ? TS : null,
      notes: null,
      createdAt: TS,
      updatedAt: TS,
    };
  });
}

function buildAgendaEvents(
  prefix: string,
  count: number,
  vendors: ReturnType<typeof buildVendors>,
  weddingDate: string,
) {
  return AGENDA_TITLES.slice(0, count).map((title, i) => ({
    id: id(`${prefix}-ae`, i + 1),
    title,
    date: addMonths(new Date(weddingDate), -Math.max(1, 12 - i)).toISOString().slice(0, 10),
    time: `${10 + (i % 6)}:00`,
    endTime: `${11 + (i % 6)}:30`,
    location: i % 2 === 0 ? "Sur place" : "Visioconférence",
    vendorId: vendors[i % vendors.length]?.id ?? null,
    notes: null,
    eventId: null,
    createdAt: TS,
    updatedAt: TS,
  }));
}

function buildDayOfItems(prefix: string, count: number, weddingDate: string) {
  return DAY_OF_TITLES.slice(0, count).map((item, i) => ({
    id: id(`${prefix}-doi`, i + 1),
    title: item.title,
    date: weddingDate,
    time: item.time,
    endTime: null,
    location: item.location ?? null,
    responsible: i % 2 === 0 ? "Wedding planner" : "Témoin",
    notes: null,
    isPublic: item.public ?? false,
    sortOrder: i + 1,
    eventId: null,
    completedAt: null,
    roleId: null,
    createdAt: TS,
    updatedAt: TS,
  }));
}

const WEDDING_EVENT_DEFS: Array<{ type: string; title: string; dayOffset: number; startTime: string; isPrimary: boolean }> = [
  { type: "CIVIL", title: "Cérémonie civile", dayOffset: 0, startTime: "10:00", isPrimary: false },
  { type: "DINNER", title: "Réception", dayOffset: 0, startTime: "19:00", isPrimary: true },
  { type: "BRUNCH", title: "Brunch du lendemain", dayOffset: 1, startTime: "11:00", isPrimary: false },
  { type: "COCKTAIL", title: "Cocktail de bienvenue", dayOffset: -1, startTime: "18:00", isPrimary: false },
];

function buildWeddingEvents(prefix: string, count: number, weddingDate: string, venueName: string) {
  const base = new Date(weddingDate);
  return WEDDING_EVENT_DEFS.slice(0, count).map((def, i) => ({
    id: id(`${prefix}-we`, i + 1),
    type: def.type,
    title: def.title,
    date: addDays(base, def.dayOffset).toISOString().slice(0, 10),
    startTime: def.startTime,
    endTime: null,
    venueName: def.isPrimary ? venueName : null,
    address: null,
    notes: null,
    isPrimary: def.isPrimary,
    isPublic: true,
    sortOrder: i + 1,
    createdAt: TS,
    updatedAt: TS,
  }));
}

function buildMealSelections(
  prefix: string,
  guests: ReturnType<typeof buildGuests>,
  weddingEvents: ReturnType<typeof buildWeddingEvents>,
) {
  const primaryEvent = weddingEvents.find((e) => e.isPrimary) ?? weddingEvents[0] ?? null;
  const choices = ["VEGETARIAN", "VEGAN", "CHILD", "CUSTOM"];
  return guests
    .filter((_, i) => i % 8 === 0)
    .map((g, i) => ({
      id: id(`${prefix}-ms`, i + 1),
      guestId: g.id,
      eventId: primaryEvent?.id ?? null,
      mealChoice: choices[i % choices.length],
      courses: i % 2 === 0 ? json({ starter: "Velouté de saison", main: "Filet de bœuf", dessert: "Tarte au citron" }) : null,
      notes: null,
      createdAt: TS,
      updatedAt: TS,
    }));
}

function buildIdeaCollections(prefix: string, count: number) {
  return IDEA_COLLECTIONS.slice(0, count).map((col, i) => ({
    id: id(`${prefix}-ic`, i + 1),
    name: col.name,
    description: col.description,
    coverIdeaId: null,
    sortOrder: i + 1,
    createdAt: TS,
    updatedAt: TS,
  }));
}

function buildIdeas(
  prefix: string,
  collections: ReturnType<typeof buildIdeaCollections>,
  perCollection: number,
  vendors: ReturnType<typeof buildVendors>,
) {
  const ideas: Array<{
    id: string;
    collectionId: string;
    title: string | null;
    notes: string | null;
    imageUri: string | null;
    imageThumbnailUri: string | null;
    sourceUrl: string | null;
    tags: string | null;
    category: string | null;
    vendorId: string | null;
    isFavorite: boolean | null;
    colorPalette: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  }> = [];

  collections.forEach((collection, ci) => {
    for (let j = 0; j < perCollection; j++) {
      const item = IDEA_ITEMS[(ci * perCollection + j) % IDEA_ITEMS.length];
      ideas.push({
        id: id(`${prefix}-idea`, ideas.length + 1),
        collectionId: collection.id,
        title: item.title,
        notes: "Inspiration Pinterest",
        imageUri: null,
        imageThumbnailUri: null,
        sourceUrl: "https://example.com/inspiration",
        tags: json(item.tags),
        category: item.category,
        vendorId: j % 2 === 0 ? vendors[ci % vendors.length]?.id ?? null : null,
        isFavorite: j === 0,
        colorPalette: json(["#f2ece0", "#b96a4a", "#6e7a4a"]),
        createdAt: TS,
        updatedAt: TS,
      });
    }
  });

  return ideas;
}

function buildAccommodations(prefix: string, count: number, weddingDate: string) {
  return ACCOMMODATIONS.slice(0, count).map((acc, i) => ({
    id: id(`${prefix}-acc`, i + 1),
    name: acc.name,
    address: acc.address,
    phone: `04${String(80000000 + i).slice(-8)}`,
    website: `https://example.com/hotel-${i + 1}`,
    checkInDate: weddingDate,
    checkOutDate: addMonths(new Date(weddingDate), 0).toISOString().slice(0, 10),
    bedCount: acc.bedCount,
    pricePerNight: acc.pricePerNight,
    notes: i === 0 ? "Navette incluse le samedi soir" : null,
    createdAt: TS,
    updatedAt: TS,
  }));
}

function buildGifts(prefix: string, count: number) {
  return GIFT_ITEMS.slice(0, count).map((gift, i) => ({
    id: id(`${prefix}-gift`, i + 1),
    title: gift.title,
    description: "Idée cadeau pour les invités",
    price: gift.price,
    url: "https://example.com/liste-cadeaux",
    imageUrl: null,
    category: gift.category,
    claimed: i % 4 === 0,
    claimedByName: i % 4 === 0 ? FIRST_NAMES[i % FIRST_NAMES.length] : null,
    claimedAt: i % 4 === 0 ? TS : null,
    sortOrder: i + 1,
    createdAt: TS,
    updatedAt: TS,
  }));
}

function buildCommunications(
  prefix: string,
  count: number,
  guests: ReturnType<typeof buildGuests>,
) {
  const channels = ["EMAIL", "POSTAL"];
  return COMMUNICATION_LABELS.slice(0, count).map((label, i) => ({
    id: id(`${prefix}-comm`, i + 1),
    label,
    date: addMonths(new Date("2026-07-01"), -8 + i).toISOString().slice(0, 10),
    notes: i % 2 === 0 ? "Envoyé par email" : "Envoyé par courrier",
    recipients: guests.slice(i * 3, i * 3 + 5).map((g) => ({
      guestId: g.id,
      sentAt: TS,
    })),
    channel: channels[i % channels.length],
    subject: label,
    body: `Bonjour {{guest.firstName}}, ceci est votre message « ${label} ».`,
    templateId: null,
    createdAt: TS,
    updatedAt: TS,
  }));
}

function buildWeddingRoles(prefix: string) {
  return WEDDING_PARTY_ROLE_NAMES.map((name, i) => ({
    id: id(`${prefix}-role`, i + 1),
    name,
    sortOrder: i + 1,
    createdAt: TS,
    updatedAt: TS,
  }));
}

function buildWeddingRoleAssignments(
  prefix: string,
  count: number,
  guests: ReturnType<typeof buildGuests>,
  roles: ReturnType<typeof buildWeddingRoles>,
) {
  return Array.from({ length: count }, (_, i) => {
    const role = roles[i % roles.length];
    const guest = guests[i % guests.length];
    return {
      id: id(`${prefix}-wra`, i + 1),
      roleId: role.id,
      guestId: guest.id,
      notes: null,
      sortOrder: i + 1,
      createdAt: TS,
      updatedAt: TS,
    };
  });
}

const CEREMONY_ITEM_DEFS: Array<{ kind: string; title: string; reference: string | null; content: string | null; performerName: string | null }> = [
  { kind: "ENTRANCE", title: "Entrée des mariés", reference: null, content: null, performerName: null },
  { kind: "READING", title: "Lecture — 1 Corinthiens 13", reference: "1 Corinthiens 13", content: "L'amour est patient, l'amour est serviable, il n'est pas envieux...", performerName: "Sophie (sœur de la mariée)" },
  { kind: "SONG", title: "Ave Maria", reference: "Franz Schubert", content: null, performerName: "Chorale" },
  { kind: "BLESSING", title: "Bénédiction", reference: null, content: null, performerName: "Officiant·e" },
];

function buildCeremonyItems(prefix: string, weddingEvents: ReturnType<typeof buildWeddingEvents>) {
  const civilEvent = weddingEvents.find((e) => e.type === "CIVIL") ?? null;
  return CEREMONY_ITEM_DEFS.map((def, i) => ({
    id: id(`${prefix}-cer`, i + 1),
    eventId: civilEvent?.id ?? null,
    kind: def.kind,
    title: def.title,
    reference: def.reference,
    content: def.content,
    guestId: null,
    performerName: def.performerName,
    roleId: null,
    notes: null,
    sortOrder: i + 1,
    createdAt: TS,
    updatedAt: TS,
  }));
}

const SPEECH_DEFS: Array<{ title: string; speakerName: string; durationMin: number }> = [
  { title: "Discours du témoin", speakerName: "Antoine (témoin)", durationMin: 5 },
  { title: "Discours des parents", speakerName: "Les parents des mariés", durationMin: 4 },
];

function buildSpeeches(
  prefix: string,
  dayOfItems: ReturnType<typeof buildDayOfItems>,
  weddingRoles: ReturnType<typeof buildWeddingRoles>,
) {
  const speechDayOf = dayOfItems.find((d) => d.title === "Discours des témoins") ?? null;
  const witnessRole = weddingRoles.find((r) => r.name === "Témoin") ?? null;
  return SPEECH_DEFS.map((def, i) => ({
    id: id(`${prefix}-sp`, i + 1),
    title: def.title,
    guestId: null,
    speakerName: def.speakerName,
    roleId: i === 0 ? (witnessRole?.id ?? null) : null,
    durationMin: def.durationMin,
    dayOfItemId: speechDayOf?.id ?? null,
    content: null,
    sortOrder: i + 1,
    createdAt: TS,
    updatedAt: TS,
  }));
}

const PLAYLIST_TRACK_DEFS: Array<{ title: string; artist: string; moment: string; mustPlay: boolean; dayOfTitle: string | null }> = [
  { title: "Perfect", artist: "Ed Sheeran", moment: "FIRST_DANCE", mustPlay: true, dayOfTitle: null },
  { title: "September", artist: "Earth, Wind & Fire", moment: "PARTY", mustPlay: true, dayOfTitle: "Ouverture du bal" },
  { title: "L'aventurier", artist: "Indochine", moment: "PARTY", mustPlay: false, dayOfTitle: null },
  { title: "La Vie en rose", artist: "Édith Piaf", moment: "DINNER", mustPlay: false, dayOfTitle: null },
];

function buildPlaylistTracks(prefix: string, dayOfItems: ReturnType<typeof buildDayOfItems>) {
  return PLAYLIST_TRACK_DEFS.map((def, i) => {
    const linked = def.dayOfTitle ? dayOfItems.find((d) => d.title === def.dayOfTitle) ?? null : null;
    return {
      id: id(`${prefix}-pl`, i + 1),
      title: def.title,
      artist: def.artist,
      moment: def.moment,
      dayOfItemId: linked?.id ?? null,
      mustPlay: def.mustPlay,
      notes: null,
      sortOrder: i + 1,
      createdAt: TS,
      updatedAt: TS,
    };
  });
}

function buildSeatingConstraints(
  prefix: string,
  count: number,
  guests: ReturnType<typeof buildGuests>,
) {
  const defs: Array<{ type: string; label: string; isHard: boolean; guestIds: string[] }> = [
    {
      type: "MUST_SIT_TOGETHER",
      label: "Famille Dupont",
      isHard: true,
      guestIds: [guests[0]?.id, guests[1]?.id].filter((v): v is string => !!v),
    },
    {
      type: "MUST_NOT_SIT_TOGETHER",
      label: "Ex-conjoints",
      isHard: true,
      guestIds: [guests[2]?.id, guests[3]?.id].filter((v): v is string => !!v),
    },
    {
      type: "MUST_SIT_TOGETHER",
      label: "Enfants avec parents",
      isHard: false,
      guestIds: [guests[4]?.id, guests[5]?.id].filter((v): v is string => !!v),
    },
    {
      type: "MUST_NOT_SIT_TOGETHER",
      label: "Collègues rivaux",
      isHard: false,
      guestIds: [guests[6]?.id, guests[7]?.id].filter((v): v is string => !!v),
    },
  ];
  return defs
    .slice(0, count)
    .filter((c) => c.guestIds.length >= 2)
    .map((c, i) => ({
      id: id(`${prefix}-sc`, i + 1),
      type: c.type,
      guestIds: c.guestIds,
      label: c.label,
      isHard: c.isHard,
      createdAt: TS,
      updatedAt: TS,
    }));
}

function buildCategoryBudgets(budget: number) {
  return json({
    venue: Math.round(budget * 0.2),
    catering: Math.round(budget * 0.35),
    photo_video: Math.round(budget * 0.12),
    music_entertainment: Math.round(budget * 0.06),
    flowers_decor: Math.round(budget * 0.07),
    beauty: Math.round(budget * 0.04),
    transport: Math.round(budget * 0.03),
    accommodation: Math.round(budget * 0.03),
    stationery: Math.round(budget * 0.02),
    coordination: Math.round(budget * 0.04),
    cake: Math.round(budget * 0.02),
    other: Math.round(budget * 0.02),
  });
}

function buildDocuments(prefix: string, vendors: ReturnType<typeof buildVendors>) {
  const caterer = vendors.find((v) => v.type === "CATERER") ?? vendors[0] ?? null;
  if (!caterer) return [];
  return [
    {
      id: id(`${prefix}-doc`, 1),
      ownerType: "VENDOR",
      ownerId: caterer.id,
      label: "Devis signé",
      fileName: "devis-traiteur.pdf",
      mimeType: "application/pdf",
      localUri: "", // metadata-only sample, no binary
      fileSize: 245_000,
      uploadedAt: TS,
      notes: null,
      createdAt: TS,
      updatedAt: TS,
    },
  ];
}

function buildCommunicationTemplates(prefix: string) {
  const defs = [
    { name: "Save-the-date", channel: "EMAIL", subject: "Réservez la date !", body: "Bonjour {{guest.firstName}}, {{wedding.partner1Name}} & {{wedding.partner2Name}} se marient le {{wedding.weddingDate}} !" },
    { name: "Faire-part officiel", channel: "POSTAL", subject: "Faire-part de mariage", body: "Bonjour {{guest.firstName}}, vous êtes invité·e au mariage le {{wedding.weddingDate}} à {{wedding.venueName}}." },
    { name: "Relance RSVP", channel: "EMAIL", subject: "N'oubliez pas de répondre !", body: "Bonjour {{guest.firstName}}, merci de confirmer votre présence au plus vite." },
  ];
  return defs.map((def, i) => ({
    id: id(`${prefix}-ct`, i + 1),
    name: def.name,
    channel: def.channel,
    subject: def.subject,
    body: def.body,
    isSystem: true,
    createdAt: TS,
    updatedAt: TS,
  }));
}

function buildLegalMilestones(prefix: string, count: number, weddingDate: string) {
  return DEFAULT_LEGAL_MILESTONES.slice(0, count).map((def, i) => {
    const done = i < 2;
    return {
      id: id(`${prefix}-lm`, i + 1),
      type: def.type,
      title: def.title,
      dueDate: addMonths(new Date(weddingDate), done ? -3 : -1).toISOString().slice(0, 10),
      completedDate: done ? addMonths(new Date(weddingDate), -4).toISOString().slice(0, 10) : null,
      status: done ? "DONE" : "TODO",
      location: def.type === "CIVIL_APPOINTMENT" ? "Mairie du 11e" : null,
      notes: null,
      documentIds: null,
      reminderDaysBefore: 14,
      createdAt: TS,
      updatedAt: TS,
    };
  });
}

function buildHoneymoonPlan(prefix: string, include: boolean, weddingDate: string) {
  if (!include) return [];
  const start = addDays(new Date(weddingDate), 3);
  const end = addDays(start, 7);
  return [
    {
      id: id(`${prefix}-hp`, 1),
      destination: "Toscane, Italie",
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      budgetTarget: 3500,
      spentAmount: 1200,
      notes: "Vol + location de voiture réservés. Reste à faire : hôtels à Florence et Sienne.",
      itinerary: json([
        { day: 1, activity: "Arrivée à Florence, check-in hôtel", bookingRef: null },
        { day: 3, activity: "Route vers Sienne", bookingRef: null },
        { day: 5, activity: "Dégustation vin Chianti", bookingRef: "CHI-2026-0472" },
      ]),
      createdAt: TS,
      updatedAt: TS,
    },
  ];
}

function buildFaq() {
  return json([
    { question: "Quel est le dress code ?", answer: "Tenue de soirée élégante. Évitez le blanc et le noir complet." },
    { question: "Y a-t-il un parking ?", answer: "Oui, parking gratuit sur place. Une navette partira aussi du centre-ville." },
    { question: "Les enfants sont-ils les bienvenus ?", answer: "La cérémonie accueille les enfants. Un coin jeux est prévu pendant le dîner." },
    { question: "Peut-on dormir sur place ?", answer: "Des chambres sont réservées dans les hôtels partenaires. Contactez-nous pour réserver." },
  ]);
}

function buildEventPhotos(prefix: string) {
  return json([
    { id: id(`${prefix}-photo`, 1), uri: "https://example.com/wedding/venue.jpg", createdAt: TS },
    { id: id(`${prefix}-photo`, 2), uri: "https://example.com/wedding/couple.jpg", createdAt: TS },
  ]);
}

export function buildWeddingSnapshot(profile: SampleProfile): WeddingSnapshot {
  const prefix = profile.id;
  const groupCount = profile.guestCount <= 30 ? 3 : profile.guestCount <= 80 ? 4 : 6;
  const guestGroups = buildGuestGroups(prefix, groupCount);
  const tables = buildTables(prefix, profile.tableCount);
  const accommodations = buildAccommodations(prefix, profile.accommodationCount, profile.weddingDate);
  const vendors = buildVendors(prefix, profile.vendorCount);
  const guests = buildGuests(
    prefix,
    profile.guestCount,
    guestGroups,
    tables,
    accommodations,
    profile.includeBothDays,
    vendors,
  );
  const taskCategories = buildTaskCategories(prefix);
  const quotePricings = buildQuotePricings(prefix, vendors);
  const vendorPayments = buildVendorPayments(prefix, vendors);
  const tasks = buildTasks(prefix, profile.taskCount, taskCategories, vendors, profile.weddingDate);
  const agendaEvents = buildAgendaEvents(prefix, profile.agendaCount, vendors, profile.weddingDate);
  const dayOfItems = buildDayOfItems(prefix, profile.dayOfCount, profile.weddingDate);
  const ideaCollections = buildIdeaCollections(prefix, profile.ideaCollectionCount);
  const ideas = buildIdeas(prefix, ideaCollections, profile.ideasPerCollection, vendors);
  const gifts = buildGifts(prefix, profile.giftCount);
  const communications = buildCommunications(prefix, profile.communicationCount, guests);
  const invitationTypes = buildInvitationTypes(profile.includeBothDays);
  const weddingRoles = buildWeddingRoles(prefix);
  const weddingRoleAssignments = buildWeddingRoleAssignments(prefix, profile.weddingPartyCount, guests, weddingRoles);
  const seatingConstraints = buildSeatingConstraints(prefix, profile.seatingConstraintCount, guests);
  const weddingEvents = buildWeddingEvents(prefix, profile.weddingEventCount, profile.weddingDate, profile.venueName);
  const guestMealSelections = buildMealSelections(prefix, guests, weddingEvents);
  const communicationTemplates = buildCommunicationTemplates(prefix);
  const documents = buildDocuments(prefix, vendors);
  const legalMilestones = buildLegalMilestones(prefix, profile.legalMilestoneCount, profile.weddingDate);
  const honeymoonPlans = buildHoneymoonPlan(prefix, profile.includeHoneymoonPlan, profile.weddingDate);
  const ceremonyItems = buildCeremonyItems(prefix, weddingEvents);
  const speeches = buildSpeeches(prefix, dayOfItems, weddingRoles);
  const playlistTracks = buildPlaylistTracks(prefix, dayOfItems);

  return {
    wedding: {
      id: 1,
      partner1Name: profile.partner1Name,
      partner2Name: profile.partner2Name,
      weddingDate: profile.weddingDate,
      venueName: profile.venueName,
      description: profile.description,
      faq: buildFaq(),
      eventPhotos: buildEventPhotos(prefix),
      budgetTarget: profile.budgetTarget,
      categoryBudgets: buildCategoryBudgets(profile.budgetTarget),
      currency: "EUR",
      createdAt: TS,
      updatedAt: TS,
    },
    guestGroups,
    guests,
    tables,
    vendors,
    quotePricings,
    vendorPayments,
    taskCategories,
    tasks,
    agendaEvents,
    dayOfItems,
    ideaCollections,
    ideas,
    accommodations,
    gifts,
    contributors: [],
    invitationTypes,
    communications,
    weddingRoles,
    weddingRoleAssignments,
    seatingConstraints,
    weddingEvents,
    guestMealSelections,
    communicationTemplates,
    documents,
    legalMilestones,
    honeymoonPlans,
    ceremonyItems,
    speeches,
    playlistTracks,
    permissionRoles: [],
    permissionAssignments: [],
  };
}

export function buildWeddingBackup(profile: SampleProfile): BackupData {
  return createBackupDocument(buildWeddingSnapshot(profile));
}

export function backupToJson(backup: BackupData): string {
  return JSON.stringify(backup, null, 2);
}

export { BACKUP_VERSION, TS };
