/**
 * Pure entity ↔ ObjectNode mapping helpers.
 *
 * Rules:
 * - `ObjectNode.title`  — displayable label (member-gated index; OK for
 *   space-private data since only the couple/devices see it)
 * - `ObjectNode.meta`   — NON-PII foreign-key references for tree traversal
 *   (groupId, tableId, companionId, …)
 * - objdoc content      — the FULL domain entity (all fields including PII),
 *   E2EE under the space keyring
 *
 * For `access:'invite'` nodes (publicPage, rsvp), `serializeForIndex` strips
 * title/emoji automatically before writing to the index — so title is safe to
 * pass but will not appear in the index for uninvited readers.
 */

import type { ObjectNode } from '@drakkar.software/starfish-spaces';
import { FIANCE_TYPES } from './object-types.js';
import type {
  Wedding,
  Guest,
  GuestGroup,
  Table,
  Vendor,
  QuotePricing,
  VendorPayment,
  Accommodation,
  Gift,
  InvitationTypeEntity,
  Communication,
  TaskCategory,
  Task,
  AgendaEvent,
  DayOfItem,
  IdeaCollection,
  Idea,
  WeddingRole,
  WeddingRoleAssignment,
  SeatingConstraint,
  WeddingEvent,
  GuestMealSelection,
  CommunicationTemplate,
  Document,
  LegalMilestone,
  HoneymoonPlan,
  CeremonyItem,
  Speech,
  PlaylistTrack,
} from '../domain/schema.js';
import type { RoleDefinition, PermissionAssignment } from '../domain/permissions.js';

// ─── Index-level node descriptors (passed to addObject / updateObjectIndex) ───

export interface NodeDescriptor {
  id: string;
  type: string;
  parentId: string | null;
  title: string;
  meta?: Record<string, unknown>;
  access?: 'public' | 'space' | 'invite';
  enc?: boolean;
  contentKind?: 'merge' | 'append' | 'none';
}

// ─── Wedding ─────────────────────────────────────────────────────────────────

export function weddingToNode(w: Wedding, id: string): NodeDescriptor {
  const name = [w.partner1Name, w.partner2Name].filter(Boolean).join(' & ') || 'Mariage';
  return {
    id,
    type: FIANCE_TYPES.wedding,
    parentId: null,
    title: name,
    access: 'space',
    enc: true,
    contentKind: 'merge',
  };
}

export function weddingFromDoc(doc: unknown): Wedding {
  return doc as Wedding;
}

// ─── GuestGroup ──────────────────────────────────────────────────────────────

export function guestGroupToNode(g: GuestGroup, id: string, weddingNodeId: string): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.guestGroup,
    parentId: weddingNodeId,
    title: g.name,
    access: 'space',
    enc: true,
    contentKind: 'none',
  };
}

export function guestGroupFromDoc(doc: unknown): GuestGroup {
  return doc as GuestGroup;
}

// ─── Guest ────────────────────────────────────────────────────────────────────

export function guestToNode(
  g: Guest,
  id: string,
  parentNodeId: string,
  /** oldId → new nodeId map for FK rewrite */
  idMap: Record<string, string>,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.guest,
    parentId: parentNodeId,
    title: `${g.firstName} ${g.lastName}`.trim() || g.firstName,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: {
      legacyId: g.id,
      groupId:         g.groupId         ? idMap[`guestGroup:${g.groupId}`]         ?? null : null,
      tableId:         g.tableId         ? idMap[`table:${g.tableId}`]               ?? null : null,
      companionId:     g.companionId     ? idMap[`guest:${g.companionId}`]           ?? null : null,
      accommodationId: g.accommodationId ? idMap[`accommodation:${g.accommodationId}`] ?? null : null,
    },
  };
}

export function guestFromDoc(doc: unknown): Guest {
  return doc as Guest;
}

// ─── Table ────────────────────────────────────────────────────────────────────

export function tableToNode(t: Table, id: string, weddingNodeId: string): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.table,
    parentId: weddingNodeId,
    title: t.name,
    access: 'space',
    enc: true,
    contentKind: 'merge',
  };
}

export function tableFromDoc(doc: unknown): Table {
  return doc as Table;
}

// ─── Vendor ───────────────────────────────────────────────────────────────────

export function vendorToNode(v: Vendor, id: string, weddingNodeId: string): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.vendor,
    parentId: weddingNodeId,
    title: v.name,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: v.id, vendorType: v.type },
  };
}

export function vendorFromDoc(doc: unknown): Vendor {
  return doc as Vendor;
}

// ─── QuotePricing ─────────────────────────────────────────────────────────────

export function quotePricingToNode(
  qp: QuotePricing,
  id: string,
  vendorNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.quotePricing,
    parentId: vendorNodeId,
    title: qp.pricingKey,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: qp.id },
  };
}

export function quotePricingFromDoc(doc: unknown): QuotePricing {
  return doc as QuotePricing;
}

// ─── VendorPayment (append / objlog) ──────────────────────────────────────────

export function vendorPaymentToNode(
  vp: VendorPayment,
  id: string,
  vendorNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.vendorPayment,
    parentId: vendorNodeId,
    title: `${vp.amount}`,
    access: 'space',
    enc: true,
    contentKind: 'append',
    meta: { legacyId: vp.id },
  };
}

export function vendorPaymentFromDoc(doc: unknown): VendorPayment {
  return doc as VendorPayment;
}

// ─── Accommodation ────────────────────────────────────────────────────────────

export function accommodationToNode(
  a: Accommodation,
  id: string,
  weddingNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.accommodation,
    parentId: weddingNodeId,
    title: a.name,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: a.id },
  };
}

export function accommodationFromDoc(doc: unknown): Accommodation {
  return doc as Accommodation;
}

// ─── Gift ─────────────────────────────────────────────────────────────────────

export function giftToNode(g: Gift, id: string, weddingNodeId: string): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.gift,
    parentId: weddingNodeId,
    title: g.title,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: g.id },
  };
}

export function giftFromDoc(doc: unknown): Gift {
  return doc as Gift;
}

// ─── InvitationType ───────────────────────────────────────────────────────────

export function invitationTypeToNode(
  it: InvitationTypeEntity,
  id: string,
  weddingNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.invitationType,
    parentId: weddingNodeId,
    title: it.label,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: it.id },
  };
}

export function invitationTypeFromDoc(doc: unknown): InvitationTypeEntity {
  return doc as InvitationTypeEntity;
}

// ─── TaskCategory ─────────────────────────────────────────────────────────────

export function taskCategoryToNode(
  tc: TaskCategory,
  id: string,
  weddingNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.taskCategory,
    parentId: weddingNodeId,
    title: tc.name,
    access: 'space',
    enc: true,
    contentKind: 'none',
    meta: { legacyId: tc.id },
  };
}

export function taskCategoryFromDoc(doc: unknown): TaskCategory {
  return doc as TaskCategory;
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export function taskToNode(
  t: Task,
  id: string,
  parentNodeId: string,
  idMap: Record<string, string>,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.task,
    parentId: parentNodeId,
    title: t.title,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: {
      legacyId: t.id,
      categoryId: t.categoryId ? idMap[`taskCategory:${t.categoryId}`] ?? null : null,
      vendorId:   t.vendorId   ? idMap[`vendor:${t.vendorId}`]          ?? null : null,
    },
  };
}

export function taskFromDoc(doc: unknown): Task {
  return doc as Task;
}

// ─── AgendaEvent ──────────────────────────────────────────────────────────────

export function agendaEventToNode(
  ae: AgendaEvent,
  id: string,
  weddingNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.agendaEvent,
    parentId: weddingNodeId,
    title: ae.title,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: ae.id },
  };
}

export function agendaEventFromDoc(doc: unknown): AgendaEvent {
  return doc as AgendaEvent;
}

// ─── DayOfItem ────────────────────────────────────────────────────────────────

export function dayOfItemToNode(
  d: DayOfItem,
  id: string,
  weddingNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.dayOfItem,
    parentId: weddingNodeId,
    title: d.title,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: d.id, isPublic: d.isPublic ?? false },
  };
}

export function dayOfItemFromDoc(doc: unknown): DayOfItem {
  return doc as DayOfItem;
}

// ─── IdeaCollection ───────────────────────────────────────────────────────────

export function ideaCollectionToNode(
  ic: IdeaCollection,
  id: string,
  weddingNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.ideaCollection,
    parentId: weddingNodeId,
    title: ic.name,
    access: 'space',
    enc: true,
    contentKind: 'none',
    meta: { legacyId: ic.id },
  };
}

export function ideaCollectionFromDoc(doc: unknown): IdeaCollection {
  return doc as IdeaCollection;
}

// ─── Idea ─────────────────────────────────────────────────────────────────────

export function ideaToNode(
  i: Idea,
  id: string,
  parentNodeId: string,
  idMap: Record<string, string>,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.idea,
    parentId: parentNodeId,
    title: i.title ?? '',
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: {
      legacyId: i.id,
      collectionId: i.collectionId ? idMap[`ideaCollection:${i.collectionId}`] ?? null : null,
    },
  };
}

export function ideaFromDoc(doc: unknown): Idea {
  return doc as Idea;
}

// ─── Communication ────────────────────────────────────────────────────────────

export function communicationToNode(c: Communication, id: string, weddingNodeId: string): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.communication,
    parentId: weddingNodeId,
    title: c.label,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: c.id },
  };
}

export function communicationFromDoc(doc: unknown): Communication {
  return doc as Communication;
}

// ─── WeddingRole ──────────────────────────────────────────────────────────────

export function weddingRoleToNode(
  r: WeddingRole,
  id: string,
  weddingNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.weddingRole,
    parentId: weddingNodeId,
    title: r.name,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: r.id },
  };
}

export function weddingRoleFromDoc(doc: unknown): WeddingRole {
  return doc as WeddingRole;
}

// ─── WeddingRoleAssignment ────────────────────────────────────────────────────

export function weddingRoleAssignmentToNode(
  a: WeddingRoleAssignment,
  id: string,
  weddingNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.weddingRoleAssignment,
    parentId: weddingNodeId,
    title: a.roleId,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: a.id },
  };
}

export function weddingRoleAssignmentFromDoc(doc: unknown): WeddingRoleAssignment {
  return doc as WeddingRoleAssignment;
}

// ─── Collaborator permissions (owner-authored role catalog + assignments) ──────

export function permissionRoleToNode(
  r: RoleDefinition,
  id: string,
  weddingNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.permissionRole,
    parentId: weddingNodeId,
    title: r.id,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: r.id },
  };
}

export function permissionRoleFromDoc(doc: unknown): RoleDefinition {
  return doc as RoleDefinition;
}

export function permissionAssignmentToNode(
  a: PermissionAssignment,
  id: string,
  weddingNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.permissionAssignment,
    parentId: weddingNodeId,
    title: a.roleId,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: a.id },
  };
}

export function permissionAssignmentFromDoc(doc: unknown): PermissionAssignment {
  return doc as PermissionAssignment;
}

// ─── SeatingConstraint ────────────────────────────────────────────────────────

export function seatingConstraintToNode(
  c: SeatingConstraint,
  id: string,
  weddingNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.seatingConstraint,
    parentId: weddingNodeId,
    title: c.label || c.type,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: c.id },
  };
}

export function seatingConstraintFromDoc(doc: unknown): SeatingConstraint {
  return doc as SeatingConstraint;
}

// ─── WeddingEvent ─────────────────────────────────────────────────────────────

export function weddingEventToNode(e: WeddingEvent, id: string, weddingNodeId: string): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.weddingEvent,
    parentId: weddingNodeId,
    title: e.title,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: e.id },
  };
}

export function weddingEventFromDoc(doc: unknown): WeddingEvent {
  return doc as WeddingEvent;
}

// ─── GuestMealSelection ───────────────────────────────────────────────────────

export function guestMealSelectionToNode(
  s: GuestMealSelection,
  id: string,
  weddingNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.guestMealSelection,
    parentId: weddingNodeId,
    title: s.mealChoice,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: s.id, guestId: s.guestId },
  };
}

export function guestMealSelectionFromDoc(doc: unknown): GuestMealSelection {
  return doc as GuestMealSelection;
}

// ─── CommunicationTemplate ────────────────────────────────────────────────────

export function communicationTemplateToNode(
  t: CommunicationTemplate,
  id: string,
  weddingNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.communicationTemplate,
    parentId: weddingNodeId,
    title: t.name,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: t.id },
  };
}

export function communicationTemplateFromDoc(doc: unknown): CommunicationTemplate {
  return doc as CommunicationTemplate;
}

// ─── Document (metadata synced; binary stays device-local) ───────────────────

export function documentToNode(d: Document, id: string, weddingNodeId: string): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.document,
    parentId: weddingNodeId,
    title: d.label,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: d.id, ownerType: d.ownerType, ownerId: d.ownerId },
  };
}

export function documentFromDoc(doc: unknown): Document {
  return doc as Document;
}

// ─── LegalMilestone ───────────────────────────────────────────────────────────

export function legalMilestoneToNode(
  m: LegalMilestone,
  id: string,
  weddingNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.legalMilestone,
    parentId: weddingNodeId,
    title: m.title,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: m.id },
  };
}

export function legalMilestoneFromDoc(doc: unknown): LegalMilestone {
  return doc as LegalMilestone;
}

// ─── HoneymoonPlan (singleton, 0–1 row) ───────────────────────────────────────

export function honeymoonPlanToNode(
  p: HoneymoonPlan,
  id: string,
  weddingNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.honeymoonPlan,
    parentId: weddingNodeId,
    title: p.destination || 'Lune de miel',
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: { legacyId: p.id },
  };
}

export function honeymoonPlanFromDoc(doc: unknown): HoneymoonPlan {
  return doc as HoneymoonPlan;
}

// ─── CeremonyItem ─────────────────────────────────────────────────────────────

export function ceremonyItemToNode(
  c: CeremonyItem,
  id: string,
  weddingNodeId: string,
  idMap: Record<string, string>,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.ceremonyItem,
    parentId: weddingNodeId,
    title: c.title,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: {
      legacyId: c.id,
      eventId: c.eventId ? idMap[`weddingEvent:${c.eventId}`] ?? null : null,
      guestId: c.guestId ? idMap[`guest:${c.guestId}`] ?? null : null,
      roleId:  c.roleId  ? idMap[`weddingRole:${c.roleId}`]  ?? null : null,
    },
  };
}

export function ceremonyItemFromDoc(doc: unknown): CeremonyItem {
  return doc as CeremonyItem;
}

// ─── Speech ───────────────────────────────────────────────────────────────────

export function speechToNode(
  s: Speech,
  id: string,
  weddingNodeId: string,
  idMap: Record<string, string>,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.speech,
    parentId: weddingNodeId,
    title: s.title ?? '',
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: {
      legacyId: s.id,
      guestId:     s.guestId     ? idMap[`guest:${s.guestId}`]         ?? null : null,
      roleId:      s.roleId      ? idMap[`weddingRole:${s.roleId}`]    ?? null : null,
      dayOfItemId: s.dayOfItemId ? idMap[`dayOfItem:${s.dayOfItemId}`] ?? null : null,
    },
  };
}

export function speechFromDoc(doc: unknown): Speech {
  return doc as Speech;
}

// ─── PlaylistTrack ────────────────────────────────────────────────────────────

export function playlistTrackToNode(
  p: PlaylistTrack,
  id: string,
  weddingNodeId: string,
  idMap: Record<string, string>,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.playlistTrack,
    parentId: weddingNodeId,
    title: p.title,
    access: 'space',
    enc: true,
    contentKind: 'merge',
    meta: {
      legacyId: p.id,
      dayOfItemId: p.dayOfItemId ? idMap[`dayOfItem:${p.dayOfItemId}`] ?? null : null,
    },
  };
}

export function playlistTrackFromDoc(doc: unknown): PlaylistTrack {
  return doc as PlaylistTrack;
}

// ─── PublicPage (invite, plaintext) ──────────────────────────────────────────

export function publicPageToNode(id: string, weddingNodeId: string): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.publicPage,
    parentId: weddingNodeId,
    title: 'Page invités',
    access: 'invite',
    enc: false,
    contentKind: 'merge',
  };
}

// ─── RSVP (invite, plaintext, one per guest) ─────────────────────────────────

export function rsvpToNode(
  id: string,
  pageNodeId: string,
  guestNodeId: string,
): NodeDescriptor {
  return {
    id,
    type: FIANCE_TYPES.rsvp,
    parentId: pageNodeId,
    title: '',
    access: 'invite',
    enc: false,
    contentKind: 'merge',
    meta: { guestNodeId },
  };
}

// ─── Generic lookup helpers ───────────────────────────────────────────────────

/** Find all nodes of a given type in a flat ObjectNode array. */
export function nodesByType(nodes: ObjectNode[], type: string): ObjectNode[] {
  return nodes.filter((n) => n.type === type);
}

/** Get a node's legacyId from meta, if present. */
export function legacyIdOf(node: ObjectNode): string | null {
  return (node.meta?.legacyId as string) ?? null;
}
