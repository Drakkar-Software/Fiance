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
  TaskCategory,
  Task,
  AgendaEvent,
  DayOfItem,
  IdeaCollection,
  Idea,
} from '../domain/schema.js';

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
