/**
 * B3 space-sync: push store snapshot to ObjectNode server + hydrate stores from server.
 *
 * Push path: notifySync() → dispatchDocChange('*') → registerPull('*') → scheduleSyncPush()
 *            → debounced pushSpaceSnapshot() → updateObjectIndex + parallel objdoc pushes.
 *
 * Hydrate path: providers.tsx calls hydrateFromSpace() after initSync() at boot.
 *               readObjectTree → parallel objdoc pulls → set stores (no notifySync triggered).
 */

import {
  updateObjectIndex,
  readObjectTree,
  getNodeAccess,
  objDocPush,
  objDocPull,
  objInvPull,
  FIANCE_TYPES,
  weddingToNode, weddingFromDoc,
  guestGroupToNode, guestGroupFromDoc,
  guestToNode, guestFromDoc,
  tableToNode, tableFromDoc,
  vendorToNode, vendorFromDoc,
  quotePricingToNode, quotePricingFromDoc,
  vendorPaymentToNode, vendorPaymentFromDoc,
  accommodationToNode, accommodationFromDoc,
  giftToNode, giftFromDoc,
  invitationTypeToNode, invitationTypeFromDoc,
  communicationToNode, communicationFromDoc,
  taskCategoryToNode, taskCategoryFromDoc,
  taskToNode, taskFromDoc,
  agendaEventToNode, agendaEventFromDoc,
  dayOfItemToNode, dayOfItemFromDoc,
  ideaCollectionToNode, ideaCollectionFromDoc,
  ideaToNode, ideaFromDoc,
  type Session,
  type ObjectNode,
  type NodeDescriptor,
} from '@fiance/sdk';
import { useWeddingStore } from '@/store/useWeddingStore';
import { useGuestsStore } from '@/store/useGuestsStore';
import { useVendorsStore } from '@/store/useVendorsStore';
import { usePlanningStore } from '@/store/usePlanningStore';
import { useIdeasStore } from '@/store/useIdeasStore';
import { useAccommodationsStore } from '@/store/useAccommodationsStore';
import { useGiftsStore } from '@/store/useGiftsStore';
import { useInvitationTypesStore } from '@/store/useInvitationTypesStore';
import { useCommunicationsStore } from '@/store/useCommunicationsStore';
import { getActiveSession, getActiveSpaceId, getActiveWeddingNodeId } from '@/lib/starfish';
import { applyRsvpSubmissionsByGuestId, type RsvpSubmission } from '@/lib/rsvp-sync';
import { withIndexLock } from '@/lib/index-lock';

// ---------------------------------------------------------------------------
// Debounced push scheduler
// ---------------------------------------------------------------------------

let _pushTimer: ReturnType<typeof setTimeout> | null = null;
let _isHydrating = false;

/** Called from registerPull('*') in providers.tsx after initSync(). Debounced 2s. */
export function scheduleSyncPush(): void {
  if (_isHydrating) return;
  if (_pushTimer) clearTimeout(_pushTimer);
  _pushTimer = setTimeout(async () => {
    _pushTimer = null;
    if (_isHydrating) return; // re-check: hydration may have started after this timer was queued
    const session = getActiveSession();
    const spaceId = getActiveSpaceId();
    const weddingNodeId = getActiveWeddingNodeId();
    if (!session || !spaceId || !weddingNodeId) return;
    await pushSpaceSnapshot(session, spaceId, weddingNodeId).catch((err) => {
      console.warn('[space-sync] push failed:', err);
    });
  }, 2000);
}

/**
 * Cancel any pending debounced push and block future scheduling.
 * Call before a legacy import so a stale timer cannot overwrite freshly pushed nodes.
 * Pair with restoreSyncPush() in a finally block.
 */
export function suppressSyncPush(): void {
  if (_pushTimer) { clearTimeout(_pushTimer); _pushTimer = null; }
  _isHydrating = true;
}

/** Re-enable push scheduling after a legacy import. */
export function restoreSyncPush(): void {
  _isHydrating = false;
}

// ---------------------------------------------------------------------------
// Build all ObjectNodes from current store state
// ---------------------------------------------------------------------------

interface BuiltNodes {
  nodes: ObjectNode[];
  contentMap: Map<string, Record<string, unknown>>;
}

function descriptorToNode(desc: NodeDescriptor, order: number, now: number): ObjectNode {
  return {
    id: desc.id,
    type: desc.type,
    parentId: desc.parentId,
    order,
    title: desc.title,
    updatedAt: now,
    contentKind: desc.contentKind,
    access: desc.access,
    enc: desc.enc,
    meta: desc.meta,
  };
}

function buildAllNodes(weddingNodeId: string): BuiltNodes {
  const now = Date.now();
  const nodes: ObjectNode[] = [];
  const contentMap = new Map<string, Record<string, unknown>>();
  let order = 0;

  const push = (desc: NodeDescriptor, entity: unknown): void => {
    nodes.push(descriptorToNode(desc, order++, now));
    contentMap.set(desc.id, entity as Record<string, unknown>);
  };

  const { wedding } = useWeddingStore.getState();
  if (wedding) {
    push(weddingToNode(wedding, weddingNodeId), wedding);
  }

  const { guests, tables, groups } = useGuestsStore.getState();
  const { vendors, quotePricings, vendorPayments } = useVendorsStore.getState();
  const { accommodations } = useAccommodationsStore.getState();
  const { categories, tasks, agendaEvents, dayOfItems } = usePlanningStore.getState();
  const { collections, ideas } = useIdeasStore.getState();

  // Build identity idMap so FK meta fields resolve correctly (entity id === node id in live sync)
  const idMap: Record<string, string> = {};
  for (const g of groups) idMap[`guestGroup:${g.id}`] = g.id;
  for (const t of tables) idMap[`table:${t.id}`] = t.id;
  for (const a of accommodations) idMap[`accommodation:${a.id}`] = a.id;
  for (const v of vendors) idMap[`vendor:${v.id}`] = v.id;
  for (const g of guests) idMap[`guest:${g.id}`] = g.id;
  for (const tc of categories) idMap[`taskCategory:${tc.id}`] = tc.id;
  for (const ic of collections) idMap[`ideaCollection:${ic.id}`] = ic.id;

  for (const g of groups) {
    push(guestGroupToNode(g, g.id, weddingNodeId), g);
  }
  for (const t of tables) {
    push(tableToNode(t, t.id, weddingNodeId), t);
  }
  for (const g of guests) {
    const parentId = (g.groupId && idMap[`guestGroup:${g.groupId}`]) ? g.groupId : weddingNodeId;
    push(guestToNode(g, g.id, parentId, idMap), g);
  }

  for (const v of vendors) {
    push(vendorToNode(v, v.id, weddingNodeId), v);
  }
  for (const qp of quotePricings) {
    const parentId = (qp.vendorId && idMap[`vendor:${qp.vendorId}`]) ? qp.vendorId : weddingNodeId;
    push(quotePricingToNode(qp, qp.id, parentId), qp);
  }
  for (const vp of vendorPayments) {
    const parentId = (vp.vendorId && idMap[`vendor:${vp.vendorId}`]) ? vp.vendorId : weddingNodeId;
    push(vendorPaymentToNode(vp, vp.id, parentId), vp);
  }

  const { gifts } = useGiftsStore.getState();
  const { invitationTypes } = useInvitationTypesStore.getState();
  const { communications } = useCommunicationsStore.getState();

  for (const a of accommodations) {
    push(accommodationToNode(a, a.id, weddingNodeId), a);
  }
  for (const g of gifts) {
    push(giftToNode(g, g.id, weddingNodeId), g);
  }
  for (const it of invitationTypes) {
    push(invitationTypeToNode(it, it.id, weddingNodeId), it);
  }
  for (const c of communications) {
    push(communicationToNode(c, c.id, weddingNodeId), c);
  }

  for (const tc of categories) {
    push(taskCategoryToNode(tc, tc.id, weddingNodeId), tc);
  }
  for (const t of tasks) {
    const parentId = (t.categoryId && idMap[`taskCategory:${t.categoryId}`]) ? t.categoryId : weddingNodeId;
    push(taskToNode(t, t.id, parentId, idMap), t);
  }
  for (const ae of agendaEvents) {
    push(agendaEventToNode(ae, ae.id, weddingNodeId), ae);
  }
  for (const d of dayOfItems) {
    push(dayOfItemToNode(d, d.id, weddingNodeId), d);
  }

  for (const ic of collections) {
    push(ideaCollectionToNode(ic, ic.id, weddingNodeId), ic);
  }
  for (const i of ideas) {
    const parentId = (i.collectionId && idMap[`ideaCollection:${i.collectionId}`]) ? i.collectionId : weddingNodeId;
    push(ideaToNode(i, i.id, parentId, idMap), i);
  }

  return { nodes, contentMap };
}

// ---------------------------------------------------------------------------
// Push snapshot to server
// ---------------------------------------------------------------------------

async function pushNodeContent(
  session: Session,
  spaceId: string,
  node: ObjectNode,
  content: Record<string, unknown>,
): Promise<void> {
  try {
    const handle = await getNodeAccess(spaceId, node.id, node, session, null);
    await handle.push(objDocPull(spaceId, node.id), objDocPush(spaceId, node.id), () => content);
  } catch (err) {
    console.warn(`[space-sync] pushNodeContent ${node.id}:`, err);
  }
}

export async function pushSpaceSnapshot(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
): Promise<void> {
  const { nodes, contentMap } = buildAllNodes(weddingNodeId);
  if (!nodes.length) return;

  await withIndexLock(spaceId, () =>
    updateObjectIndex(session, spaceId, (prev, now) => {
      const domainIds = new Set(nodes.map((n) => n.id));
      const nonDomain = prev.filter((n) => !domainIds.has(n.id));
      return [...nodes.map((n) => ({ ...n, updatedAt: now })), ...nonDomain];
    }),
  );

  await Promise.allSettled(
    nodes.map((n) => {
      const content = contentMap.get(n.id);
      return content ? pushNodeContent(session, spaceId, n, content) : Promise.resolve();
    }),
  );
}

// ---------------------------------------------------------------------------
// Hydrate stores from server
// ---------------------------------------------------------------------------

async function pullNodeContent(
  session: Session,
  spaceId: string,
  node: ObjectNode,
): Promise<Record<string, unknown> | null> {
  try {
    const handle = await getNodeAccess(spaceId, node.id, node, session, null);
    const result = await handle.client.pull(objDocPull(spaceId, node.id)) as { data: Record<string, unknown> | null };
    if (!result?.data) return null;
    return handle.encryptor ? await handle.encryptor.decrypt(result.data) : result.data;
  } catch {
    return null;
  }
}

/** Returns the number of nodes pulled from the server (0 = space was empty). */
export async function hydrateFromSpace(
  session: Session,
  spaceId: string,
  _weddingNodeId: string,
): Promise<number> {
  _isHydrating = true;
  try {
    const nodes = await readObjectTree(session, spaceId);
    if (!nodes.length) return 0;

    const byType = new Map<string, ObjectNode[]>();
    for (const n of nodes) {
      const arr = byType.get(n.type) ?? [];
      arr.push(n);
      byType.set(n.type, arr);
    }

    const pullAll = async (type: string): Promise<Record<string, unknown>[]> => {
      const typeNodes = byType.get(type) ?? [];
      const results = await Promise.all(typeNodes.map((n) => pullNodeContent(session, spaceId, n)));
      return results.filter((r): r is Record<string, unknown> => r !== null);
    };

    const [
      weddingDocs,
      guestGroupDocs,
      guestDocs,
      tableDocs,
      vendorDocs,
      quotePricingDocs,
      vendorPaymentDocs,
      accommodationDocs,
      giftDocs,
      invitationTypeDocs,
      communicationDocs,
      taskCategoryDocs,
      taskDocs,
      agendaEventDocs,
      dayOfItemDocs,
      ideaCollectionDocs,
      ideaDocs,
    ] = await Promise.all([
      pullAll(FIANCE_TYPES.wedding),
      pullAll(FIANCE_TYPES.guestGroup),
      pullAll(FIANCE_TYPES.guest),
      pullAll(FIANCE_TYPES.table),
      pullAll(FIANCE_TYPES.vendor),
      pullAll(FIANCE_TYPES.quotePricing),
      pullAll(FIANCE_TYPES.vendorPayment),
      pullAll(FIANCE_TYPES.accommodation),
      pullAll(FIANCE_TYPES.gift),
      pullAll(FIANCE_TYPES.invitationType),
      pullAll(FIANCE_TYPES.communication),
      pullAll(FIANCE_TYPES.taskCategory),
      pullAll(FIANCE_TYPES.task),
      pullAll(FIANCE_TYPES.agendaEvent),
      pullAll(FIANCE_TYPES.dayOfItem),
      pullAll(FIANCE_TYPES.ideaCollection),
      pullAll(FIANCE_TYPES.idea),
    ]);

    // Feed into stores — setters do NOT call notifySync, so no circular dispatch.
    if (weddingDocs.length) useWeddingStore.getState().setWedding(weddingFromDoc(weddingDocs[0]) as Parameters<ReturnType<typeof useWeddingStore.getState>['setWedding']>[0]);
    if (guestGroupDocs.length) useGuestsStore.getState().setGroups(guestGroupDocs.map(guestGroupFromDoc) as Parameters<ReturnType<typeof useGuestsStore.getState>['setGroups']>[0]);
    if (tableDocs.length) useGuestsStore.getState().setTables(tableDocs.map(tableFromDoc) as Parameters<ReturnType<typeof useGuestsStore.getState>['setTables']>[0]);
    if (guestDocs.length) useGuestsStore.getState().setGuests(guestDocs.map(guestFromDoc) as Parameters<ReturnType<typeof useGuestsStore.getState>['setGuests']>[0]);
    if (vendorDocs.length) useVendorsStore.getState().setVendors(vendorDocs.map(vendorFromDoc) as Parameters<ReturnType<typeof useVendorsStore.getState>['setVendors']>[0]);
    if (quotePricingDocs.length) useVendorsStore.getState().setQuotePricings(quotePricingDocs.map(quotePricingFromDoc) as Parameters<ReturnType<typeof useVendorsStore.getState>['setQuotePricings']>[0]);
    if (vendorPaymentDocs.length) useVendorsStore.getState().setVendorPayments(vendorPaymentDocs.map(vendorPaymentFromDoc) as Parameters<ReturnType<typeof useVendorsStore.getState>['setVendorPayments']>[0]);
    if (accommodationDocs.length) useAccommodationsStore.getState().setAccommodations(accommodationDocs.map(accommodationFromDoc) as Parameters<ReturnType<typeof useAccommodationsStore.getState>['setAccommodations']>[0]);
    if (giftDocs.length) useGiftsStore.getState().setGifts(giftDocs.map(giftFromDoc) as Parameters<ReturnType<typeof useGiftsStore.getState>['setGifts']>[0]);
    if (invitationTypeDocs.length) useInvitationTypesStore.getState().setInvitationTypes(invitationTypeDocs.map(invitationTypeFromDoc) as Parameters<ReturnType<typeof useInvitationTypesStore.getState>['setInvitationTypes']>[0]);
    if (communicationDocs.length) useCommunicationsStore.getState().setCommunications(communicationDocs.map(communicationFromDoc) as Parameters<ReturnType<typeof useCommunicationsStore.getState>['setCommunications']>[0]);
    if (taskCategoryDocs.length) usePlanningStore.getState().setCategories(taskCategoryDocs.map(taskCategoryFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setCategories']>[0]);
    if (taskDocs.length) usePlanningStore.getState().setTasks(taskDocs.map(taskFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setTasks']>[0]);
    if (agendaEventDocs.length) usePlanningStore.getState().setAgendaEvents(agendaEventDocs.map(agendaEventFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setAgendaEvents']>[0]);
    if (dayOfItemDocs.length) usePlanningStore.getState().setDayOfItems(dayOfItemDocs.map(dayOfItemFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setDayOfItems']>[0]);
    if (ideaCollectionDocs.length) useIdeasStore.getState().setCollections(ideaCollectionDocs.map(ideaCollectionFromDoc) as Parameters<ReturnType<typeof useIdeasStore.getState>['setCollections']>[0]);
    if (ideaDocs.length) useIdeasStore.getState().setIdeas(ideaDocs.map(ideaFromDoc) as Parameters<ReturnType<typeof useIdeasStore.getState>['setIdeas']>[0]);

    // Pull RSVP submissions — rsvp nodes live in objinv (plaintext, owner has space:member access).
    await pullAndApplyRsvpNodes(session, spaceId, byType.get(FIANCE_TYPES.rsvp) ?? []);

    return nodes.length;
  } finally {
    _isHydrating = false;
  }
}

// ---------------------------------------------------------------------------
// RSVP inbox — pull and merge guest submissions
// ---------------------------------------------------------------------------

async function pullRsvpNodeContent(
  session: Session,
  spaceId: string,
  node: ObjectNode,
): Promise<RsvpSubmission | null> {
  try {
    const handle = await getNodeAccess(spaceId, node.id, { access: 'invite', enc: false }, session, null);
    const result = await handle.client.pull(objInvPull(spaceId, node.id)) as { data: unknown } | null;
    const data = result?.data as RsvpSubmission | null;
    if (!data?.guestId) return null;
    return data;
  } catch {
    return null;
  }
}

async function pullAndApplyRsvpNodes(
  session: Session,
  spaceId: string,
  rsvpNodes: ObjectNode[],
): Promise<void> {
  if (!rsvpNodes.length) return;
  const results = await Promise.all(rsvpNodes.map((n) => pullRsvpNodeContent(session, spaceId, n)));
  const submissions = results.filter((r): r is RsvpSubmission => r !== null);
  if (submissions.length) applyRsvpSubmissionsByGuestId(submissions);
}

/**
 * Pull only the rsvp nodes and merge guest submissions into the store.
 * Called on foreground to pick up new RSVP responses without a full re-hydrate.
 */
export async function refreshRsvpInbox(session: Session, spaceId: string): Promise<void> {
  try {
    const nodes = await readObjectTree(session, spaceId);
    const rsvpNodes = nodes.filter((n) => n.type === FIANCE_TYPES.rsvp);
    await pullAndApplyRsvpNodes(session, spaceId, rsvpNodes);
  } catch (err) {
    console.warn('[space-sync] refreshRsvpInbox failed:', err);
  }
}
