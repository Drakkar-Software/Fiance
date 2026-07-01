import { buildWeddingBackup } from "./shared";

export const mediumSampleBackup = buildWeddingBackup({
  id: "medium",
  partner1Name: "Léa",
  partner2Name: "Thomas",
  weddingDate: "2026-06-20",
  venueName: "Domaine des Oliviers, Provence",
  description:
    "Week-end de célébration en Provence : cérémonie laïque sous les oliviers, cocktail au coucher du soleil et brunch du lendemain avec les proches.",
  budgetTarget: 22_000,
  guestCount: 72,
  tableCount: 10,
  vendorCount: 12,
  taskCount: 15,
  agendaCount: 8,
  dayOfCount: 10,
  ideaCollectionCount: 4,
  ideasPerCollection: 3,
  accommodationCount: 4,
  giftCount: 12,
  communicationCount: 4,
  includeBothDays: true,
});
