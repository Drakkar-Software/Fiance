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
  deepMerge,
  stableStringify,
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
  weddingRoleToNode, weddingRoleFromDoc,
  weddingRoleAssignmentToNode, weddingRoleAssignmentFromDoc,
  seatingConstraintToNode, seatingConstraintFromDoc,
  weddingEventToNode, weddingEventFromDoc,
  guestMealSelectionToNode, guestMealSelectionFromDoc,
  communicationTemplateToNode, communicationTemplateFromDoc,
  documentToNode, documentFromDoc,
  legalMilestoneToNode, legalMilestoneFromDoc,
  honeymoonPlanToNode, honeymoonPlanFromDoc,
  ceremonyItemToNode, ceremonyItemFromDoc,
  speechToNode, speechFromDoc,
  playlistTrackToNode, playlistTrackFromDoc,
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
import { useWeddingPartyStore } from '@/store/useWeddingPartyStore';
import { useSeatingConstraintsStore } from '@/store/useSeatingConstraintsStore';
import { useWeddingEventsStore } from '@/store/useWeddingEventsStore';
import { useMealSelectionsStore } from '@/store/useMealSelectionsStore';
import { useCommunicationTemplatesStore } from '@/store/useCommunicationTemplatesStore';
import { useDocumentsStore } from '@/store/useDocumentsStore';
import { useLegalStore } from '@/store/useLegalStore';
import { useHoneymoonStore } from '@/store/useHoneymoonStore';
import { useCeremonyStore } from '@/store/useCeremonyStore';
import { useSpeechesMusicStore } from '@/store/useSpeechesMusicStore';
import { getActiveSession, getActiveSpaceId, getActiveWeddingNodeId } from '@/lib/starfish';
import { applyRsvpSubmissionsByGuestId, type RsvpSubmission } from '@/lib/rsvp-sync';
import { withIndexLock } from '@/lib/index-lock';

// ---------------------------------------------------------------------------
// Debounced push scheduler
// ---------------------------------------------------------------------------

let _pushTimer: ReturnType<typeof setTimeout> | null = null;
let _isHydrating = false;

/**
 * Dirty-push tracking: node id → stableStringify() of the content last successfully
 * pushed (or hydrated) for that node. pushSpaceSnapshot only re-pushes nodes whose
 * current content differs from this baseline, so an edit to one guest doesn't re-push
 * (and clobber) every other node's content on the next debounced push.
 */
const _lastPushedJson = new Map<string, string>();

/**
 * Ids this device has deleted locally (no longer in buildAllNodes' output) but may not
 * yet be reflected on the server. pushSpaceSnapshot's index merge drops a remote-only
 * managed node when its id is here (this device deleted it), but KEEPS a remote-only
 * managed node whose id is unknown (a peer added it and this device hasn't hydrated it
 * yet) — distinguishing "deleted by me" from "added by a peer" requires this baseline,
 * since both cases look identical (managed node present in `prev`, absent locally).
 */
const _deletedNodeIds = new Set<string>();

/** Domain node types managed wholesale by buildAllNodes/pushSpaceSnapshot — excludes the
 *  guest-surface synthetic nodes (publicPage, rsvp) which are written by other code paths
 *  and must survive a snapshot push untouched. */
const MANAGED_TYPES = new Set<string>(
  Object.values(FIANCE_TYPES).filter((t) => t !== FIANCE_TYPES.publicPage && t !== FIANCE_TYPES.rsvp),
);

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

/** Clears the dirty-push baseline and deletion tombstones. hydrateFromSpace already
 *  reseeds these correctly in production (cold boot / wedding switch); exported so
 *  tests can isolate consecutive pushSpaceSnapshot calls from each other's state. */
export function resetDirtyPushBaseline(): void {
  _lastPushedJson.clear();
  _deletedNodeIds.clear();
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
  const { weddingRoles, weddingRoleAssignments } = useWeddingPartyStore.getState();
  const { seatingConstraints } = useSeatingConstraintsStore.getState();
  const { weddingEvents } = useWeddingEventsStore.getState();
  const { mealSelections } = useMealSelectionsStore.getState();
  const { communicationTemplates } = useCommunicationTemplatesStore.getState();
  const { documents } = useDocumentsStore.getState();
  const { legalMilestones } = useLegalStore.getState();
  const { honeymoonPlans } = useHoneymoonStore.getState();
  const { ceremonyItems } = useCeremonyStore.getState();
  const { speeches, playlistTracks } = useSpeechesMusicStore.getState();

  // ceremony/speech/playlist FKs resolve against these — must be populated before their push loops below.
  for (const e of weddingEvents) idMap[`weddingEvent:${e.id}`] = e.id;
  for (const r of weddingRoles) idMap[`weddingRole:${r.id}`] = r.id;
  for (const d of dayOfItems) idMap[`dayOfItem:${d.id}`] = d.id;

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
  for (const r of weddingRoles) {
    push(weddingRoleToNode(r, r.id, weddingNodeId), r);
  }
  for (const a of weddingRoleAssignments) {
    push(weddingRoleAssignmentToNode(a, a.id, weddingNodeId), a);
  }
  for (const c of seatingConstraints) {
    push(seatingConstraintToNode(c, c.id, weddingNodeId), c);
  }
  for (const e of weddingEvents) {
    push(weddingEventToNode(e, e.id, weddingNodeId), e);
  }
  for (const s of mealSelections) {
    push(guestMealSelectionToNode(s, s.id, weddingNodeId), s);
  }
  for (const tpl of communicationTemplates) {
    push(communicationTemplateToNode(tpl, tpl.id, weddingNodeId), tpl);
  }
  for (const d of documents) {
    // localUri travels as-is through the (already E2EE) multi-device sync channel —
    // only the shareable JSON *backup* export strips it (see lib/sync.ts). A device
    // reading another device's localUri simply finds no local file and offers re-attach.
    push(documentToNode(d, d.id, weddingNodeId), d);
  }
  for (const m of legalMilestones) {
    push(legalMilestoneToNode(m, m.id, weddingNodeId), m);
  }
  for (const p of honeymoonPlans) {
    push(honeymoonPlanToNode(p, p.id, weddingNodeId), p);
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

  for (const c of ceremonyItems) {
    push(ceremonyItemToNode(c, c.id, weddingNodeId, idMap), c);
  }
  for (const s of speeches) {
    push(speechToNode(s, s.id, weddingNodeId, idMap), s);
  }
  for (const t of playlistTracks) {
    push(playlistTrackToNode(t, t.id, weddingNodeId, idMap), t);
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
): Promise<boolean> {
  try {
    const handle = await getNodeAccess(spaceId, node.id, node, session, null);
    // Conflict-retry mutator: `cur` is the remote doc the SDK's CAS retry pulled and
    // decrypted (space-access.ts) when this push lost a race against a peer's push.
    // Deep-merge so a field this device never touched is reconciled from the peer's
    // version instead of being clobbered by a stale whole-tree push.
    await handle.push(objDocPull(spaceId, node.id), objDocPush(spaceId, node.id), (cur) => deepMerge(cur, content));
    return true;
  } catch (err) {
    console.warn(`[space-sync] pushNodeContent ${node.id}:`, err);
    return false;
  }
}

export async function pushSpaceSnapshot(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
): Promise<void> {
  const { nodes, contentMap } = buildAllNodes(weddingNodeId);
  if (!nodes.length) return;

  // Diff against the dirty-push baseline to find ids this device deleted locally since
  // its last successful push/hydrate. Tombstoned so a delete still propagates below even
  // though it's no longer distinguishable from "never seen" once _lastPushedJson is
  // pruned at the end of this function.
  const localIds = new Set(nodes.map((n) => n.id));
  for (const id of _lastPushedJson.keys()) {
    if (!localIds.has(id)) _deletedNodeIds.add(id);
  }

  await withIndexLock(spaceId, () =>
    updateObjectIndex(session, spaceId, (prev, now) => {
      // Union-merge instead of replace: `prev` is the authoritative current remote index
      // (CAS-pulled), so a managed node present there but absent locally is either (a) a
      // peer's addition this device hasn't hydrated yet — must KEEP, or (b) a node this
      // device deleted — must DROP. _deletedNodeIds disambiguates the two; without it,
      // replacing wholesale silently discards concurrent peer additions.
      const localById = new Map(nodes.map((n) => [n.id, n]));
      const merged = nodes.map((n) => ({ ...n, updatedAt: now }));
      for (const r of prev) {
        if (!MANAGED_TYPES.has(r.type)) { merged.push(r); continue; } // publicPage/rsvp untouched
        if (localById.has(r.id)) continue; // local copy already included above
        if (_deletedNodeIds.has(r.id)) continue; // deleted locally → propagate the deletion
        merged.push(r); // unknown id → peer added it, keep
      }
      return merged;
    }),
  );

  // Only push nodes whose content actually changed since the last successful push/hydrate.
  // Without this, every snapshot re-pushes the entire tree, and last-writer-wins at the
  // node level means an unrelated push from this device can clobber a peer's newer edit
  // to a node this device never touched.
  const dirtyNodes = nodes.filter((n) => {
    const content = contentMap.get(n.id);
    return content !== undefined && stableStringify(content) !== _lastPushedJson.get(n.id);
  });

  await Promise.allSettled(
    dirtyNodes.map((n) => {
      const content = contentMap.get(n.id)!;
      return pushNodeContent(session, spaceId, n, content).then((ok) => {
        if (ok) _lastPushedJson.set(n.id, stableStringify(content));
      });
    }),
  );

  // Prune baseline entries for nodes that no longer exist locally (deleted).
  const currentIds = new Set(nodes.map((n) => n.id));
  for (const id of _lastPushedJson.keys()) {
    if (!currentIds.has(id)) _lastPushedJson.delete(id);
  }
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
  } catch (err) {
    // Log once per node so a missing space-access credential is visible in the console
    // rather than presenting as a mysteriously empty wedding (silent return null path).
    console.warn(`[space-sync] pullNodeContent ${node.type}:${node.id} failed:`, err instanceof Error ? err.message : String(err));
    return null;
  }
}

/**
 * Discovers the owner's wedding root ObjectNode id from the shared space index.
 * Called once per member device on first boot (before initSync) so the joiner
 * converges on the same root as the owner and the trees don't diverge.
 *
 * Heuristic for polluted spaces (multiple wedding/parentId:null roots):
 *   1. Exclude this device's own freshly-minted root id.
 *   2. Among the remaining candidates, prefer the oldest by updatedAt (= original owner).
 *
 * Returns null when the space is empty, unreachable, or only contains this device's root.
 * In that case the caller should fall back to wedding.id and not persist a weddingNodeId.
 *
 * Mirrors the proven reconciliation in fiance-sdk/src/sync/import-legacy.ts:123-124.
 */
export async function discoverOwnerWeddingRoot(
  session: Session,
  spaceId: string,
  ownId: string,
): Promise<string | null> {
  try {
    const nodes = await readObjectTree(session, spaceId);
    const roots = nodes.filter(
      (n) => n.type === FIANCE_TYPES.wedding && n.parentId === null,
    );
    if (!roots.length) return null;
    // Exclude this device's own minted root so we don't adopt ourselves.
    const others = roots.filter((r) => r.id !== ownId);
    const pool = others.length ? others : roots;
    // Oldest updatedAt = the original owner's root (joiners were created later).
    return pool.reduce((a, b) => (b.updatedAt < a.updatedAt ? b : a)).id;
  } catch {
    return null;
  }
}

/** Returns the number of nodes pulled from the server (0 = space was empty). */
export async function hydrateFromSpace(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
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

    // Select the active wedding node at index level (node ids are available here but
    // lost after pullNodeContent decryption — this is the correct place to filter).
    // Fall back to first node when no match (owner's own boot, only one root present).
    const weddingNodes = byType.get(FIANCE_TYPES.wedding) ?? [];
    const weddingNode = weddingNodes.find((n) => n.id === weddingNodeId) ?? weddingNodes[0] ?? null;

    const [
      weddingDoc,
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
      weddingRoleDocs,
      weddingRoleAssignmentDocs,
      seatingConstraintDocs,
      weddingEventDocs,
      guestMealSelectionDocs,
      communicationTemplateDocs,
      documentDocs,
      legalMilestoneDocs,
      honeymoonPlanDocs,
      taskCategoryDocs,
      taskDocs,
      agendaEventDocs,
      dayOfItemDocs,
      ideaCollectionDocs,
      ideaDocs,
      ceremonyItemDocs,
      speechDocs,
      playlistTrackDocs,
    ] = await Promise.all([
      weddingNode ? pullNodeContent(session, spaceId, weddingNode) : Promise.resolve(null),
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
      pullAll(FIANCE_TYPES.weddingRole),
      pullAll(FIANCE_TYPES.weddingRoleAssignment),
      pullAll(FIANCE_TYPES.seatingConstraint),
      pullAll(FIANCE_TYPES.weddingEvent),
      pullAll(FIANCE_TYPES.guestMealSelection),
      pullAll(FIANCE_TYPES.communicationTemplate),
      pullAll(FIANCE_TYPES.document),
      pullAll(FIANCE_TYPES.legalMilestone),
      pullAll(FIANCE_TYPES.honeymoonPlan),
      pullAll(FIANCE_TYPES.taskCategory),
      pullAll(FIANCE_TYPES.task),
      pullAll(FIANCE_TYPES.agendaEvent),
      pullAll(FIANCE_TYPES.dayOfItem),
      pullAll(FIANCE_TYPES.ideaCollection),
      pullAll(FIANCE_TYPES.idea),
      pullAll(FIANCE_TYPES.ceremonyItem),
      pullAll(FIANCE_TYPES.speech),
      pullAll(FIANCE_TYPES.playlistTrack),
    ]);

    // Diagnostic: if the space has content nodes but decryption yielded 0 guests,
    // a credential or space-access failure is the most likely cause.
    const totalGuestNodes = byType.get(FIANCE_TYPES.guest)?.length ?? 0;
    if (totalGuestNodes > 0 && guestDocs.length === 0) {
      console.warn(`[space-sync] decrypted 0/${totalGuestNodes} guest nodes — check space-access credential`);
    }

    // Feed into stores — setters do NOT call notifySync, so no circular dispatch.
    if (weddingDoc) useWeddingStore.getState().setWedding(weddingFromDoc(weddingDoc) as Parameters<ReturnType<typeof useWeddingStore.getState>['setWedding']>[0]);
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
    if (weddingRoleDocs.length) useWeddingPartyStore.getState().setWeddingRoles(weddingRoleDocs.map(weddingRoleFromDoc) as Parameters<ReturnType<typeof useWeddingPartyStore.getState>['setWeddingRoles']>[0]);
    if (weddingRoleAssignmentDocs.length) useWeddingPartyStore.getState().setWeddingRoleAssignments(weddingRoleAssignmentDocs.map(weddingRoleAssignmentFromDoc) as Parameters<ReturnType<typeof useWeddingPartyStore.getState>['setWeddingRoleAssignments']>[0]);
    if (seatingConstraintDocs.length) useSeatingConstraintsStore.getState().setSeatingConstraints(seatingConstraintDocs.map(seatingConstraintFromDoc) as Parameters<ReturnType<typeof useSeatingConstraintsStore.getState>['setSeatingConstraints']>[0]);
    if (weddingEventDocs.length) useWeddingEventsStore.getState().setWeddingEvents(weddingEventDocs.map(weddingEventFromDoc) as Parameters<ReturnType<typeof useWeddingEventsStore.getState>['setWeddingEvents']>[0]);
    if (guestMealSelectionDocs.length) useMealSelectionsStore.getState().setMealSelections(guestMealSelectionDocs.map(guestMealSelectionFromDoc) as Parameters<ReturnType<typeof useMealSelectionsStore.getState>['setMealSelections']>[0]);
    if (communicationTemplateDocs.length) useCommunicationTemplatesStore.getState().setCommunicationTemplates(communicationTemplateDocs.map(communicationTemplateFromDoc) as Parameters<ReturnType<typeof useCommunicationTemplatesStore.getState>['setCommunicationTemplates']>[0]);
    if (documentDocs.length) useDocumentsStore.getState().setDocuments(documentDocs.map(documentFromDoc) as Parameters<ReturnType<typeof useDocumentsStore.getState>['setDocuments']>[0]);
    if (legalMilestoneDocs.length) useLegalStore.getState().setLegalMilestones(legalMilestoneDocs.map(legalMilestoneFromDoc) as Parameters<ReturnType<typeof useLegalStore.getState>['setLegalMilestones']>[0]);
    if (honeymoonPlanDocs.length) useHoneymoonStore.getState().setHoneymoonPlans(honeymoonPlanDocs.map(honeymoonPlanFromDoc) as Parameters<ReturnType<typeof useHoneymoonStore.getState>['setHoneymoonPlans']>[0]);
    if (taskCategoryDocs.length) usePlanningStore.getState().setCategories(taskCategoryDocs.map(taskCategoryFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setCategories']>[0]);
    if (taskDocs.length) usePlanningStore.getState().setTasks(taskDocs.map(taskFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setTasks']>[0]);
    if (agendaEventDocs.length) usePlanningStore.getState().setAgendaEvents(agendaEventDocs.map(agendaEventFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setAgendaEvents']>[0]);
    if (dayOfItemDocs.length) usePlanningStore.getState().setDayOfItems(dayOfItemDocs.map(dayOfItemFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setDayOfItems']>[0]);
    if (ideaCollectionDocs.length) useIdeasStore.getState().setCollections(ideaCollectionDocs.map(ideaCollectionFromDoc) as Parameters<ReturnType<typeof useIdeasStore.getState>['setCollections']>[0]);
    if (ideaDocs.length) useIdeasStore.getState().setIdeas(ideaDocs.map(ideaFromDoc) as Parameters<ReturnType<typeof useIdeasStore.getState>['setIdeas']>[0]);
    if (ceremonyItemDocs.length) useCeremonyStore.getState().setCeremonyItems(ceremonyItemDocs.map(ceremonyItemFromDoc) as Parameters<ReturnType<typeof useCeremonyStore.getState>['setCeremonyItems']>[0]);
    if (speechDocs.length) useSpeechesMusicStore.getState().setSpeeches(speechDocs.map(speechFromDoc) as Parameters<ReturnType<typeof useSpeechesMusicStore.getState>['setSpeeches']>[0]);
    if (playlistTrackDocs.length) useSpeechesMusicStore.getState().setPlaylistTracks(playlistTrackDocs.map(playlistTrackFromDoc) as Parameters<ReturnType<typeof useSpeechesMusicStore.getState>['setPlaylistTracks']>[0]);

    // Pull RSVP submissions — rsvp nodes live in objinv (plaintext, owner has space:member access).
    await pullAndApplyRsvpNodes(session, spaceId, byType.get(FIANCE_TYPES.rsvp) ?? []);

    // Seed the dirty-push baseline from what we just hydrated, so the next debounced
    // push only sends nodes genuinely edited locally after this point (see
    // _lastPushedJson / pushSpaceSnapshot above) instead of re-pushing everything.
    // Also clear deletion tombstones: we just pulled fresh remote truth, so there are
    // no pending local-only deletes left to reconcile (a delete-in-flight can't race
    // this, since deleting schedules a push that keeps _pushTimer set, and
    // refreshFromSpaceIfIdle — the only caller that can hydrate mid-session — no-ops
    // while a push is pending).
    const { nodes: builtNodes, contentMap: builtContent } = buildAllNodes(weddingNodeId);
    _lastPushedJson.clear();
    _deletedNodeIds.clear();
    for (const n of builtNodes) {
      const content = builtContent.get(n.id);
      if (content) _lastPushedJson.set(n.id, stableStringify(content));
    }

    return nodes.length;
  } finally {
    _isHydrating = false;
  }
}

/**
 * Re-hydrates from the space if no local push is in flight or pending — called on
 * app/tab foreground so this device picks up peers' changes without a full reload.
 * No-ops while hydrating or while a debounced local push is queued, so it never
 * clobbers an edit this device hasn't flushed yet.
 */
export async function refreshFromSpaceIfIdle(): Promise<void> {
  if (_isHydrating || _pushTimer) return;
  const session = getActiveSession();
  const spaceId = getActiveSpaceId();
  const weddingNodeId = getActiveWeddingNodeId();
  if (!session || !spaceId || !weddingNodeId) return;
  await hydrateFromSpace(session, spaceId, weddingNodeId).catch((err) => {
    console.warn('[space-sync] refreshFromSpaceIfIdle failed:', err);
  });
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
