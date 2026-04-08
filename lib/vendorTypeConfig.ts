import type { VendorType } from "@/db/types";
import { CATERER_SERVICES } from "@/db/types";

type FieldVisibility = "visible" | "hidden";

export interface CustomSection {
  key: string;
  label: string;
  type: "checklist" | "counter" | "text" | "date";
  options?: readonly string[];
  placeholder?: string;
}

export interface VendorTypeFormConfig {
  showPricePerPerson: FieldVisibility;
  pricePerPersonLabel?: string;
  basePriceLabel?: string;
  showDateFields: FieldVisibility;
  customSections: CustomSection[];
}

const DEFAULT_CONFIG: VendorTypeFormConfig = {
  showPricePerPerson: "hidden",
  showDateFields: "visible",
  customSections: [],
};

const CONFIGS: Partial<Record<VendorType, Partial<VendorTypeFormConfig>>> = {
  CATERER: {
    showPricePerPerson: "visible",
    pricePerPersonLabel: "Prix par personne (€)",
    customSections: [
      {
        key: "services",
        label: "Services inclus",
        type: "checklist",
        options: CATERER_SERVICES,
      },
      {
        key: "menuNotes",
        label: "Notes sur le menu",
        type: "text",
        placeholder: "Entrée, plat, fromage, dessert...",
      },
    ],
  },
  VENUE: {
    showPricePerPerson: "visible",
    basePriceLabel: "Prix de location (€)",
    customSections: [
      {
        key: "capacity",
        label: "Capacité (personnes)",
        type: "counter",
        placeholder: "200",
      },
      {
        key: "spaceType",
        label: "Type d'espace",
        type: "text",
        placeholder: "Intérieur, extérieur, mixte...",
      },
    ],
  },
  PHOTOGRAPHER: {
    customSections: [
      {
        key: "style",
        label: "Style photographique",
        type: "text",
        placeholder: "Reportage, posé, artistique...",
      },
      {
        key: "hours",
        label: "Heures de couverture",
        type: "counter",
        placeholder: "10",
      },
      {
        key: "deliverables",
        label: "Livrables",
        type: "text",
        placeholder: "Album, clé USB, galerie en ligne...",
      },
    ],
  },
  VIDEOGRAPHER: {
    customSections: [
      {
        key: "style",
        label: "Style vidéo",
        type: "text",
        placeholder: "Cinématique, documentaire...",
      },
      {
        key: "hours",
        label: "Heures de couverture",
        type: "counter",
        placeholder: "10",
      },
      {
        key: "deliverables",
        label: "Livrables",
        type: "text",
        placeholder: "Film long, teaser, highlights...",
      },
    ],
  },
  DJ: {
    basePriceLabel: "Forfait (€)",
    customSections: [
      {
        key: "hours",
        label: "Heures de prestation",
        type: "counter",
        placeholder: "6",
      },
      {
        key: "equipment",
        label: "Matériel",
        type: "text",
        placeholder: "Sono, éclairage, machine fumée...",
      },
    ],
  },
  BAND: {
    basePriceLabel: "Forfait (€)",
    customSections: [
      {
        key: "musicians",
        label: "Nombre de musiciens",
        type: "counter",
        placeholder: "5",
      },
      {
        key: "hours",
        label: "Heures de prestation",
        type: "counter",
        placeholder: "4",
      },
    ],
  },
  FLORIST: {
    customSections: [
      {
        key: "bouquet",
        label: "Détails bouquet",
        type: "text",
        placeholder: "Bouquet mariée, boutonnières...",
      },
      {
        key: "decorDetails",
        label: "Décorations florales",
        type: "text",
        placeholder: "Centres de table, arche, allée...",
      },
    ],
  },
  HOTEL: {
    showPricePerPerson: "visible",
    pricePerPersonLabel: "Prix par nuit (€)",
    customSections: [
      {
        key: "rooms",
        label: "Nombre de chambres",
        type: "counter",
        placeholder: "20",
      },
    ],
  },
  SHUTTLE: {
    showPricePerPerson: "visible",
    pricePerPersonLabel: "Prix par personne (€)",
    customSections: [
      {
        key: "capacity",
        label: "Capacité par véhicule",
        type: "counter",
        placeholder: "50",
      },
      {
        key: "trips",
        label: "Nombre d'allers-retours",
        type: "counter",
        placeholder: "2",
      },
    ],
  },
  CAKE: {
    customSections: [
      {
        key: "servings",
        label: "Nombre de parts",
        type: "counter",
        placeholder: "120",
      },
      {
        key: "tastingDate",
        label: "Date de dégustation",
        type: "date",
      },
    ],
  },
  HAIR_MAKEUP: {
    customSections: [
      {
        key: "trialDate",
        label: "Date de l'essai",
        type: "date",
      },
      {
        key: "details",
        label: "Détails prestation",
        type: "text",
        placeholder: "Maquillage + coiffure mariée, témoins...",
      },
    ],
  },
  CLOTHING: {
    customSections: [
      {
        key: "clothingType",
        label: "Type de tenue",
        type: "text",
        placeholder: "Robe de mariée, costume marié, robes demoiselles...",
      },
      {
        key: "fittingDate",
        label: "Date de l'essayage",
        type: "date",
      },
      {
        key: "alterations",
        label: "Retouches incluses",
        type: "text",
        placeholder: "Ourlet, ajustement taille, voile...",
      },
    ],
  },
};

export function getVendorTypeConfig(type: VendorType): VendorTypeFormConfig {
  const override = CONFIGS[type];
  if (!override) return DEFAULT_CONFIG;
  return { ...DEFAULT_CONFIG, ...override };
}
