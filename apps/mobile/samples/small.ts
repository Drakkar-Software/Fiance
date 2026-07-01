import { buildWeddingBackup } from "./shared";

export const smallSampleBackup = buildWeddingBackup({
  id: "small",
  partner1Name: "Camille",
  partner2Name: "Hugo",
  weddingDate: "2026-09-12",
  venueName: "Château de Vaux, Loire",
  description:
    "Mariage intimiste au cœur de la vallée de la Loire. Cérémonie en plein air, dîner aux chandelles et soirée dansante jusqu'au bout de la nuit.",
  budgetTarget: 10_000,
  guestCount: 28,
  tableCount: 4,
  vendorCount: 6,
  taskCount: 8,
  agendaCount: 4,
  dayOfCount: 6,
  ideaCollectionCount: 2,
  ideasPerCollection: 2,
  accommodationCount: 2,
  giftCount: 5,
  communicationCount: 2,
  includeBothDays: false,
  weddingPartyCount: 2,
  seatingConstraintCount: 1,
  weddingEventCount: 1,
  legalMilestoneCount: 2,
  includeHoneymoonPlan: false,
});
