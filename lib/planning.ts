import { addMonths } from "date-fns";
import * as Crypto from "expo-crypto";
import type { Task, TaskCategory } from "@/db/schema";

// ─── Default categories ─────────────────────────────────────────────────────

export const DEFAULT_CATEGORIES: Omit<TaskCategory, "id">[] = [
  { name: "Administratif & légal", icon: "file-text", color: "#3B82F6", sortOrder: 1 },
  { name: "Lieu & logistique", icon: "map-pin", color: "#10B981", sortOrder: 2 },
  { name: "Restauration", icon: "utensils", color: "#F59E0B", sortOrder: 3 },
  { name: "Tenues", icon: "sparkles", color: "#EC4899", sortOrder: 4 },
  { name: "Photographie & vidéo", icon: "camera", color: "#8B5CF6", sortOrder: 5 },
  { name: "Musique & animation", icon: "music", color: "#6366F1", sortOrder: 6 },
  { name: "Fleurs & décoration", icon: "flower", color: "#84CC16", sortOrder: 7 },
  { name: "Beauté", icon: "heart", color: "#F9A8D4", sortOrder: 8 },
  { name: "Invités", icon: "users", color: "#38BDF8", sortOrder: 9 },
  { name: "Budget & paiements", icon: "credit-card", color: "#F97316", sortOrder: 10 },
  { name: "Voyage de noces", icon: "plane", color: "#06B6D4", sortOrder: 11 },
  { name: "Divers", icon: "more-horizontal", color: "#9CA3AF", sortOrder: 12 },
];

// ─── Template tasks ─────────────────────────────────────────────────────────

interface TemplateTask {
  title: string;
  categoryName: string;
  monthsBefore: number | null;
  priority: string;
}

export const TEMPLATE_TASKS: TemplateTask[] = [
  { title: "Fixer la date du mariage", categoryName: "Administratif & légal", monthsBefore: null, priority: "CRITICAL" },
  { title: "Définir le budget global", categoryName: "Budget & paiements", monthsBefore: null, priority: "CRITICAL" },
  { title: "Dresser la liste des invités", categoryName: "Invités", monthsBefore: null, priority: "HIGH" },
  { title: "Choisir le type de cérémonie (civile, religieuse, laïque)", categoryName: "Administratif & légal", monthsBefore: null, priority: "HIGH" },
  { title: "Visiter et réserver le lieu de réception", categoryName: "Lieu & logistique", monthsBefore: 18, priority: "CRITICAL" },
  { title: "Réserver le photographe", categoryName: "Photographie & vidéo", monthsBefore: 18, priority: "HIGH" },
  { title: "Réserver le vidéaste", categoryName: "Photographie & vidéo", monthsBefore: 18, priority: "MEDIUM" },
  { title: "Choisir et réserver le traiteur", categoryName: "Restauration", monthsBefore: 12, priority: "CRITICAL" },
  { title: "Réserver le DJ / groupe musical", categoryName: "Musique & animation", monthsBefore: 12, priority: "HIGH" },
  { title: "Choisir le fleuriste", categoryName: "Fleurs & décoration", monthsBefore: 12, priority: "MEDIUM" },
  { title: "Publier les bans à la mairie", categoryName: "Administratif & légal", monthsBefore: 12, priority: "CRITICAL" },
  { title: "Démarches à la mairie (dossier mariage civil)", categoryName: "Administratif & légal", monthsBefore: 6, priority: "CRITICAL" },
  { title: "Envoyer les faire-part", categoryName: "Invités", monthsBefore: 6, priority: "HIGH" },
  { title: "Choisir la robe / le costume", categoryName: "Tenues", monthsBefore: 9, priority: "HIGH" },
  { title: "Essayage final de la robe", categoryName: "Tenues", monthsBefore: 2, priority: "HIGH" },
  { title: "Réserver le salon de coiffure / maquillage", categoryName: "Beauté", monthsBefore: 9, priority: "MEDIUM" },
  { title: "Essai coiffure / maquillage", categoryName: "Beauté", monthsBefore: 3, priority: "MEDIUM" },
  { title: "Réserver le transport (voiture, navettes)", categoryName: "Lieu & logistique", monthsBefore: 9, priority: "MEDIUM" },
  { title: "Envoyer les RSVP (deadline aux invités)", categoryName: "Invités", monthsBefore: 4, priority: "HIGH" },
  { title: "Finaliser le plan de tables", categoryName: "Invités", monthsBefore: 2, priority: "HIGH" },
  { title: "Finaliser le menu avec le traiteur", categoryName: "Restauration", monthsBefore: 2, priority: "HIGH" },
  { title: "Payer le solde du lieu", categoryName: "Budget & paiements", monthsBefore: 1, priority: "CRITICAL" },
  { title: "Payer le solde du traiteur", categoryName: "Budget & paiements", monthsBefore: 1, priority: "CRITICAL" },
  { title: "Payer le solde du photographe", categoryName: "Budget & paiements", monthsBefore: 1, priority: "HIGH" },
  { title: "Commander le wedding cake", categoryName: "Restauration", monthsBefore: 6, priority: "MEDIUM" },
  { title: "Réserver les hôtels pour les invités", categoryName: "Lieu & logistique", monthsBefore: 9, priority: "MEDIUM" },
  { title: "Préparer les discours et animations", categoryName: "Divers", monthsBefore: 1, priority: "MEDIUM" },
  { title: "Préparer la liste musicale", categoryName: "Musique & animation", monthsBefore: 1, priority: "MEDIUM" },
  { title: "Préparer les alliances", categoryName: "Administratif & légal", monthsBefore: 3, priority: "HIGH" },
  { title: "Réserver le voyage de noces", categoryName: "Voyage de noces", monthsBefore: 12, priority: "HIGH" },
  { title: "Souscrire une assurance mariage", categoryName: "Administratif & légal", monthsBefore: 6, priority: "MEDIUM" },
  { title: "Organiser le brunch du lendemain", categoryName: "Restauration", monthsBefore: 3, priority: "MEDIUM" },
  { title: "Remercier les invités (cartes, cadeaux)", categoryName: "Invités", monthsBefore: -1, priority: "MEDIUM" },
  { title: "Récupérer les photos / vidéos", categoryName: "Photographie & vidéo", monthsBefore: -2, priority: "MEDIUM" },
];

/** Generate default categories with UUIDs */
export function generateDefaultCategories(): TaskCategory[] {
  const now = new Date().toISOString();
  return DEFAULT_CATEGORIES.map((c) => ({
    id: Crypto.randomUUID(),
    name: c.name,
    icon: c.icon,
    color: c.color,
    sortOrder: c.sortOrder,
  }));
}

/** Generate template tasks linked to categories */
export function generateTemplateTasks(
  categories: TaskCategory[],
  weddingDate?: string
): Task[] {
  const now = new Date().toISOString();
  const categoryMap = new Map(categories.map((c) => [c.name, c.id]));

  return TEMPLATE_TASKS.map((t) => {
    let dueDate: string | null = null;
    if (t.monthsBefore != null && weddingDate) {
      dueDate = addMonths(new Date(weddingDate), -t.monthsBefore).toISOString();
    }

    return {
      id: Crypto.randomUUID(),
      categoryId: categoryMap.get(t.categoryName) || null,
      title: t.title,
      description: null,
      status: "TODO",
      priority: t.priority,
      dueDate,
      monthsBefore: t.monthsBefore,
      isSystem: true,
      vendorId: null,
      reminderDaysBefore: null,
      completedAt: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    } as Task;
  });
}

/** Recalculate all due dates when wedding date changes */
export function recalculateDueDates(
  tasks: Task[],
  weddingDate: string
): Task[] {
  const wedding = new Date(weddingDate);
  return tasks.map((t) => {
    if (t.monthsBefore == null) return t;
    const dueDate = addMonths(wedding, -t.monthsBefore).toISOString();
    return { ...t, dueDate };
  });
}
