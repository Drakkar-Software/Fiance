import { buildWeddingBackup } from "./shared";

export const bigSampleBackup = buildWeddingBackup({
  id: "big",
  partner1Name: "Sophie",
  partner2Name: "Alexandre",
  weddingDate: "2026-10-03",
  venueName: "Grand Hôtel & Salons Haussmann, Paris",
  description:
    "Grand mariage parisien sur deux jours : cérémonie civile, réception fastueuse, orchestre live, photobooth et brunch dominical pour toute la famille.",
  budgetTarget: 45_000,
  guestCount: 145,
  tableCount: 18,
  vendorCount: 18,
  taskCount: 25,
  agendaCount: 12,
  dayOfCount: 15,
  ideaCollectionCount: 6,
  ideasPerCollection: 3,
  accommodationCount: 6,
  giftCount: 20,
  communicationCount: 6,
  includeBothDays: true,
});
