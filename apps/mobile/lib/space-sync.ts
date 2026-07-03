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
  collectionNodeId,
  isCollectionNodeId,
  buildCollectionDoc,
  mergeCollectionDoc,
  asCollectionDoc,
  type CollectionDoc,
  type CollectionState,
  type CollectionEntity,
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

// ── Per-collection ("one doc per collection") sync state — Release 1 (Expand) ──
// The live-sync path is transitioning from one objdoc per entity to one objdoc per
// collection (see @fiance/sdk collection-doc). During the Expand release we DUAL-WRITE:
// the per-entity nodes above AND a collection doc per type, so a device still on the old
// build keeps reading per-entity nodes while new-build devices populate collection docs.
// A later Contract release drops the per-entity writes and prunes the legacy nodes.

/** sentinel node id (`col:{type}:{weddingNodeId}`) → stableStringify() of the collection
 *  doc last pushed, so an unchanged collection is skipped on the next debounced push. */
const _lastPushedCollectionJson = new Map<string, string>();

/** entity type → per-entity `rev`/`tombstones` carried between pushes/hydrates. Seeded from
 *  the pulled collection doc on hydrate; advanced on each successful collection push. */
const _collectionState = new Map<string, CollectionState>();

/** entity id → stableStringify() of the entity last folded into a collection doc — the
 *  dirty check that decides whether a given entity's `rev` should be bumped. */
const _collectionEntityJson = new Map<string, string>();

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
  _lastPushedCollectionJson.clear();
  _collectionState.clear();
  _collectionEntityJson.clear();
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
// Build per-collection docs from current store state (Release 1 dual-write)
// ---------------------------------------------------------------------------

/** The 28 collapsing admin collections (everything except the `wedding` singleton root and
 *  the guest-surface publicPage/rsvp invite nodes). `wedding` stays its own per-node doc. */
function collectionSources(): { type: string; items: CollectionEntity[] }[] {
  const { guests, tables, groups } = useGuestsStore.getState();
  const { vendors, quotePricings, vendorPayments } = useVendorsStore.getState();
  const { accommodations } = useAccommodationsStore.getState();
  const { categories, tasks, agendaEvents, dayOfItems } = usePlanningStore.getState();
  const { collections, ideas } = useIdeasStore.getState();
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

  const as = (arr: unknown[]) => arr as CollectionEntity[];
  return [
    { type: FIANCE_TYPES.guestGroup, items: as(groups) },
    { type: FIANCE_TYPES.guest, items: as(guests) },
    { type: FIANCE_TYPES.table, items: as(tables) },
    { type: FIANCE_TYPES.vendor, items: as(vendors) },
    { type: FIANCE_TYPES.quotePricing, items: as(quotePricings) },
    { type: FIANCE_TYPES.vendorPayment, items: as(vendorPayments) },
    { type: FIANCE_TYPES.accommodation, items: as(accommodations) },
    { type: FIANCE_TYPES.gift, items: as(gifts) },
    { type: FIANCE_TYPES.invitationType, items: as(invitationTypes) },
    { type: FIANCE_TYPES.communication, items: as(communications) },
    { type: FIANCE_TYPES.weddingRole, items: as(weddingRoles) },
    { type: FIANCE_TYPES.weddingRoleAssignment, items: as(weddingRoleAssignments) },
    { type: FIANCE_TYPES.seatingConstraint, items: as(seatingConstraints) },
    { type: FIANCE_TYPES.weddingEvent, items: as(weddingEvents) },
    { type: FIANCE_TYPES.guestMealSelection, items: as(mealSelections) },
    { type: FIANCE_TYPES.communicationTemplate, items: as(communicationTemplates) },
    { type: FIANCE_TYPES.document, items: as(documents) },
    { type: FIANCE_TYPES.legalMilestone, items: as(legalMilestones) },
    { type: FIANCE_TYPES.honeymoonPlan, items: as(honeymoonPlans) },
    { type: FIANCE_TYPES.taskCategory, items: as(categories) },
    { type: FIANCE_TYPES.task, items: as(tasks) },
    { type: FIANCE_TYPES.agendaEvent, items: as(agendaEvents) },
    { type: FIANCE_TYPES.dayOfItem, items: as(dayOfItems) },
    { type: FIANCE_TYPES.ideaCollection, items: as(collections) },
    { type: FIANCE_TYPES.idea, items: as(ideas) },
    { type: FIANCE_TYPES.ceremonyItem, items: as(ceremonyItems) },
    { type: FIANCE_TYPES.speech, items: as(speeches) },
    { type: FIANCE_TYPES.playlistTrack, items: as(playlistTracks) },
  ];
}

/** One sentinel ObjectNode per collection — a lightweight index entry addressing the
 *  collection doc at `col:{type}:{weddingNodeId}` (access:'space', enc:true → same keyring). */
function collectionNode(type: string, weddingNodeId: string, order: number, now: number): ObjectNode {
  return {
    id: collectionNodeId(type, weddingNodeId),
    type,
    parentId: weddingNodeId,
    order,
    title: type,
    updatedAt: now,
    contentKind: 'merge',
    access: 'space',
    enc: true,
    meta: { collection: true },
  };
}

interface BuiltCollection {
  node: ObjectNode;
  type: string;
  doc: CollectionDoc;
  /** commit to _collectionState on a successful push of this collection. */
  nextState: CollectionState;
  /** entity id → stableStringify(entity); commit to _collectionEntityJson on success. */
  entityJson: Map<string, string>;
}

/** Build the sentinel nodes + collection docs to (dual-)write, reusing the per-collection
 *  dirty baseline to decide which entities get a fresh `rev`. Pure w.r.t. module state:
 *  callers commit `nextState`/`entityJson` only after the corresponding push succeeds. */
function buildCollectionDocs(weddingNodeId: string, now: number): { nodes: ObjectNode[]; built: BuiltCollection[] } {
  const nodes: ObjectNode[] = [];
  const built: BuiltCollection[] = [];
  let order = 0;
  for (const { type, items } of collectionSources()) {
    const prev = _collectionState.get(type) ?? { rev: {}, tombstones: {} };
    // Skip a collection that is empty AND has no carried state — no point minting a
    // sentinel node or pushing an empty doc for a collection the wedding never used.
    // Once it holds data (or a pending tombstone/rev), it stays material so deletes propagate.
    if (!items.length && !Object.keys(prev.rev).length && !Object.keys(prev.tombstones).length) continue;
    const changedIds = new Set<string>();
    const entityJson = new Map<string, string>();
    for (const e of items) {
      const j = stableStringify(e);
      entityJson.set(e.id, j);
      if (_collectionEntityJson.get(e.id) !== j) changedIds.add(e.id);
    }
    const { doc, state } = buildCollectionDoc(items, prev, changedIds, now);
    const node = collectionNode(type, weddingNodeId, order++, now);
    nodes.push(node);
    built.push({ node, type, doc, nextState: state, entityJson });
  }
  return { nodes, built };
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

/** Push a single collection doc, CAS-merging via mergeCollectionDoc so a peer's concurrent
 *  edit/add/delete to a different entity in the same collection is reconciled, not clobbered. */
async function pushCollectionDoc(
  session: Session,
  spaceId: string,
  node: ObjectNode,
  doc: CollectionDoc,
  now: number,
): Promise<boolean> {
  try {
    const handle = await getNodeAccess(spaceId, node.id, node, session, null);
    await handle.push(
      objDocPull(spaceId, node.id),
      objDocPush(spaceId, node.id),
      (cur) => mergeCollectionDoc(cur, doc, { now }) as unknown as Record<string, unknown>,
    );
    return true;
  } catch (err) {
    console.warn(`[space-sync] pushCollectionDoc ${node.id}:`, err);
    return false;
  }
}

export async function pushSpaceSnapshot(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
): Promise<void> {
  const now = Date.now();
  const { nodes, contentMap } = buildAllNodes(weddingNodeId);
  if (!nodes.length) return;

  // Release 1 dual-write: build the per-collection docs alongside the per-entity nodes.
  // Their sentinel nodes join the index so a new-build device (dual-read) can find them,
  // while old-build devices keep reading the per-entity nodes untouched.
  const { nodes: collectionNodes, built } = buildCollectionDocs(weddingNodeId, now);
  const allNodes = [...nodes, ...collectionNodes];

  // Diff against the dirty-push baseline to find ids this device deleted locally since
  // its last successful push/hydrate. Tombstoned so a delete still propagates below even
  // though it's no longer distinguishable from "never seen" once _lastPushedJson is
  // pruned at the end of this function. (Sentinel ids are never in _lastPushedJson, so
  // including them in localIds is inert — they simply can't be mistaken for a deletion.)
  const localIds = new Set(allNodes.map((n) => n.id));
  for (const id of _lastPushedJson.keys()) {
    if (!localIds.has(id)) _deletedNodeIds.add(id);
  }

  await withIndexLock(spaceId, () =>
    updateObjectIndex(session, spaceId, (prev, idxNow) => {
      // Union-merge instead of replace: `prev` is the authoritative current remote index
      // (CAS-pulled), so a managed node present there but absent locally is either (a) a
      // peer's addition this device hasn't hydrated yet — must KEEP, or (b) a node this
      // device deleted — must DROP. _deletedNodeIds disambiguates the two; without it,
      // replacing wholesale silently discards concurrent peer additions.
      const localById = new Map(allNodes.map((n) => [n.id, n]));
      const merged = allNodes.map((n) => ({ ...n, updatedAt: idxNow }));
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

  // Collection docs whose serialized form changed since last push — a 120-guest import
  // mutates only the guest store, so exactly one collection doc (guest) is dirty here.
  const dirtyCollections = built.filter(
    (b) => stableStringify(b.doc) !== _lastPushedCollectionJson.get(b.node.id),
  );

  await Promise.allSettled([
    ...dirtyNodes.map((n) => {
      const content = contentMap.get(n.id)!;
      return pushNodeContent(session, spaceId, n, content).then((ok) => {
        if (ok) _lastPushedJson.set(n.id, stableStringify(content));
      });
    }),
    ...dirtyCollections.map((b) =>
      pushCollectionDoc(session, spaceId, b.node, b.doc, now).then((ok) => {
        if (!ok) return;
        _lastPushedCollectionJson.set(b.node.id, stableStringify(b.doc));
        _collectionState.set(b.type, b.nextState);
        for (const [id, j] of b.entityJson) _collectionEntityJson.set(id, j);
      }),
    ),
  ]);

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

/** Batch-pull the per-collection docs (one /batch/pull over the sentinel ids) and decrypt each,
 *  keyed by entity type. All sentinels are access:'space', so the single batch fast-path applies. */
async function pullCollectionDocs(
  session: Session,
  spaceId: string,
  sentinels: ObjectNode[],
): Promise<Map<string, CollectionDoc>> {
  const out = new Map<string, CollectionDoc>();
  if (!sentinels.length) return out;
  try {
    const handle = await getNodeAccess(spaceId, sentinels[0].id, sentinels[0], session, null);
    const entries = await handle.client.batchPullMany(
      'objdoc',
      sentinels.map((n) => ({ spaceId, objectId: n.id })),
    );
    await Promise.all(entries.map(async (entry: { error?: unknown; data?: unknown }, i: number) => {
      if (entry.error || !entry.data) {
        if (entry.error) console.warn(`[space-sync] pullCollectionDocs ${sentinels[i].type} failed:`, entry.error);
        return;
      }
      const data = entry.data as Record<string, unknown>;
      const decrypted = handle.encryptor ? await handle.encryptor.decrypt(data) : data;
      out.set(sentinels[i].type, asCollectionDoc(decrypted));
    }));
  } catch (err) {
    console.warn('[space-sync] pullCollectionDocs failed:', err);
  }
  return out;
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

    // Sentinel (per-collection) nodes share a `type` with legacy per-entity nodes, so bucket
    // them out first — the legacy pull path must not treat a collection doc as a lone entity.
    const sentinelNodes: ObjectNode[] = [];
    const byType = new Map<string, ObjectNode[]>();
    for (const n of nodes) {
      if (isCollectionNodeId(n.id)) { sentinelNodes.push(n); continue; }
      const arr = byType.get(n.type) ?? [];
      arr.push(n);
      byType.set(n.type, arr);
    }

    const pullAll = async (type: string): Promise<Record<string, unknown>[]> => {
      const typeNodes = byType.get(type) ?? [];
      const results = await Promise.all(typeNodes.map((n) => pullNodeContent(session, spaceId, n)));
      return results.filter((r): r is Record<string, unknown> => r !== null);
    };

    // Batched variant of pullAll: one /batch/pull round-trip per collection type
    // instead of one HTTP request per node, to avoid rate-limiting on hydrate.
    // Only safe for plain space-member content (objdoc) — nodes with a per-node
    // 'invite' access entry can resolve to a different client/cap, so those fall
    // back to the per-node pullAll path.
    const pullAllBatch = async (type: string): Promise<Record<string, unknown>[]> => {
      const typeNodes = byType.get(type) ?? [];
      if (!typeNodes.length) return [];
      if (typeNodes.some((n) => n.access === 'invite')) return pullAll(type);

      const handle = await getNodeAccess(spaceId, typeNodes[0].id, typeNodes[0], session, null);
      const entries = await handle.client.batchPullMany(
        'objdoc',
        typeNodes.map((n) => ({ spaceId, objectId: n.id })),
      );

      const results = await Promise.all(entries.map(async (entry, i) => {
        if (entry.error || !entry.data) {
          if (entry.error) {
            console.warn(`[space-sync] pullAllBatch ${type}:${typeNodes[i].id} failed:`, entry.error);
          }
          return null;
        }
        const data = entry.data as Record<string, unknown>;
        return handle.encryptor ? await handle.encryptor.decrypt(data) : data;
      }));
      return results.filter((r): r is Record<string, unknown> => r !== null);
    };

    // Release 1 dual-read: pull the per-collection docs (one batch over the sentinel ids) and
    // seed the collection state so the next push carries the correct rev/tombstones. Falls back
    // gracefully to legacy-only when a space has no collection docs yet.
    const collectionDocsByType = await pullCollectionDocs(session, spaceId, sentinelNodes);
    // Reset to fresh remote truth (like _deletedNodeIds below): a type with no pulled doc gets no
    // carried state, so a locally-deleted-but-still-legacy entity re-hydrates rather than sticking.
    _collectionState.clear();
    for (const [type, doc] of collectionDocsByType) {
      _collectionState.set(type, { rev: { ...doc.rev }, tombstones: { ...doc.tombstones } });
    }

    // Union a collection's legacy per-entity docs with its collection doc: collection live items
    // win, tombstoned ids are removed. During the transition an old-build device may write only
    // a per-entity node, so a legacy-only entity (absent from the collection doc) is preserved.
    const pullCollection = async (type: string): Promise<Record<string, unknown>[]> => {
      const legacy = await pullAllBatch(type);
      const cdoc = collectionDocsByType.get(type);
      if (!cdoc) return legacy;
      const byId = new Map<string, Record<string, unknown>>();
      for (const e of legacy) {
        const id = (e as { id?: unknown }).id;
        if (typeof id === 'string') byId.set(id, e);
      }
      for (const [id, entity] of Object.entries(cdoc.items)) {
        if (cdoc.tombstones[id] === undefined) byId.set(id, entity); // collection live wins
      }
      for (const id of Object.keys(cdoc.tombstones)) byId.delete(id); // tombstone removes
      return [...byId.values()];
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
      pullCollection(FIANCE_TYPES.guestGroup),
      pullCollection(FIANCE_TYPES.guest),
      pullCollection(FIANCE_TYPES.table),
      pullCollection(FIANCE_TYPES.vendor),
      pullCollection(FIANCE_TYPES.quotePricing),
      pullCollection(FIANCE_TYPES.vendorPayment),
      pullCollection(FIANCE_TYPES.accommodation),
      pullCollection(FIANCE_TYPES.gift),
      pullCollection(FIANCE_TYPES.invitationType),
      pullCollection(FIANCE_TYPES.communication),
      pullCollection(FIANCE_TYPES.weddingRole),
      pullCollection(FIANCE_TYPES.weddingRoleAssignment),
      pullCollection(FIANCE_TYPES.seatingConstraint),
      pullCollection(FIANCE_TYPES.weddingEvent),
      pullCollection(FIANCE_TYPES.guestMealSelection),
      pullCollection(FIANCE_TYPES.communicationTemplate),
      pullCollection(FIANCE_TYPES.document),
      pullCollection(FIANCE_TYPES.legalMilestone),
      pullCollection(FIANCE_TYPES.honeymoonPlan),
      pullCollection(FIANCE_TYPES.taskCategory),
      pullCollection(FIANCE_TYPES.task),
      pullCollection(FIANCE_TYPES.agendaEvent),
      pullCollection(FIANCE_TYPES.dayOfItem),
      pullCollection(FIANCE_TYPES.ideaCollection),
      pullCollection(FIANCE_TYPES.idea),
      pullCollection(FIANCE_TYPES.ceremonyItem),
      pullCollection(FIANCE_TYPES.speech),
      pullCollection(FIANCE_TYPES.playlistTrack),
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

    // Seed the collection baselines too. _collectionEntityJson is set from the hydrated entities
    // first so the baseline build treats nothing as "changed" (no rev bump); _collectionState was
    // already seeded from the pulled docs above. A collection that gained a legacy-only entity
    // (rev absent) will show as dirty on the next push — that is the intended one-shot migration
    // that folds the straggler into the collection doc.
    _collectionEntityJson.clear();
    _lastPushedCollectionJson.clear();
    for (const { items } of collectionSources()) {
      for (const e of items) _collectionEntityJson.set(e.id, stableStringify(e));
    }
    const { built: builtCollections } = buildCollectionDocs(weddingNodeId, Date.now());
    for (const b of builtCollections) {
      _lastPushedCollectionJson.set(b.node.id, stableStringify(b.doc));
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
