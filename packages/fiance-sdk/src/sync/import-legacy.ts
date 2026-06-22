/**
 * Legacy backup importer — v6 backup JSON → octospaces ObjectNode tree.
 *
 * Usage (app-side, after the user picks a file):
 *   const snapshot = parseAndRestore(jsonString);  // from export-import-core
 *   const result   = await importLegacyBackup(session, spaceId, snapshot);
 *
 * This is the "clean cut" path: no old-server pull, no identity bridging.
 * Couples export a backup from the old app then import it into their new space.
 *
 * The import is idempotent: if a node with a given legacyId already exists in
 * the index it is skipped (to allow retry on partial failure).
 */

import {
  updateObjectIndex,
  readObjectTree,
  buildTree,
  getNodeAccess,
  objDocPush,
  type Session,
  type ObjectNode,
  randomId,
} from '@drakkar.software/octospaces-sdk';
import type { WeddingSnapshot } from './backup.js';
import {
  weddingToNode,
  guestGroupToNode,
  guestToNode,
  tableToNode,
  vendorToNode,
  quotePricingToNode,
  vendorPaymentToNode,
  accommodationToNode,
  giftToNode,
  invitationTypeToNode,
  taskCategoryToNode,
  taskToNode,
  agendaEventToNode,
  dayOfItemToNode,
  ideaCollectionToNode,
  ideaToNode,
  type NodeDescriptor,
} from '../objects/mappers.js';

export interface ImportResult {
  spaceId: string;
  nodeCount: number;
  /** Legacy oldId → new nodeId for FK inspection by the caller. */
  idMap: Record<string, string>;
  /** Non-fatal warnings (e.g. FK references that couldn't be resolved). */
  warnings: string[];
}

/**
 * Import a v6 WeddingSnapshot into an existing Space as ObjectNodes.
 *
 * All admin nodes (`access:'space', enc:true`) are batch-inserted into the
 * index in a single `updateObjectIndex` call, then their content docs are
 * pushed in parallel. The `publicPage` and `rsvp` guest-surface nodes are
 * NOT created here — those are minted by the owner from the Settings screen
 * after import (they require per-guest invite links to be generated).
 */
export async function importLegacyBackup(
  session: Session,
  spaceId: string,
  snapshot: WeddingSnapshot,
): Promise<ImportResult> {
  const idMap: Record<string, string> = {};
  const warnings: string[] = [];
  const allDescriptors: NodeDescriptor[] = [];

  // ── Read existing index to skip already-imported nodes ──────────────────
  const existingNodes = await readObjectTree(session, spaceId);
  const existingLegacyIds = new Set<string>(
    existingNodes.flatMap((n) =>
      typeof n.meta?.legacyId === 'string' ? [n.meta.legacyId] : [],
    ),
  );

  function alreadyImported(legacyId: string): boolean {
    return existingLegacyIds.has(legacyId);
  }

  // ── Helper: assign a new nodeId and record old→new mapping ───────────────
  function nextId(key: string, legacyId: string): string {
    const id = randomId();
    idMap[key] = id;
    return id;
  }

  // ── 1. Wedding root ──────────────────────────────────────────────────────
  let weddingNodeId: string;
  const existingWedding = existingNodes.find((n) => n.type === 'wedding');
  if (existingWedding) {
    weddingNodeId = existingWedding.id;
    warnings.push('Wedding root node already exists; reusing existing node.');
  } else {
    const id = nextId('wedding', 'wedding');
    weddingNodeId = id;
    allDescriptors.push(
      weddingToNode(snapshot.wedding ?? { id: 0 } as never, id),
    );
  }

  // ── 2. GuestGroups ───────────────────────────────────────────────────────
  for (const g of snapshot.guestGroups) {
    if (alreadyImported(g.id)) {
      // Recover nodeId for FK resolution
      const existing = existingNodes.find((n) => n.meta?.legacyId === g.id);
      if (existing) idMap[`guestGroup:${g.id}`] = existing.id;
      continue;
    }
    const id = nextId(`guestGroup:${g.id}`, g.id);
    allDescriptors.push(guestGroupToNode(g, id, weddingNodeId));
  }

  // ── 3. Tables ────────────────────────────────────────────────────────────
  for (const t of snapshot.tables) {
    if (alreadyImported(t.id)) {
      const existing = existingNodes.find((n) => n.meta?.legacyId === t.id);
      if (existing) idMap[`table:${t.id}`] = existing.id;
      continue;
    }
    const id = nextId(`table:${t.id}`, t.id);
    allDescriptors.push(tableToNode(t, id, weddingNodeId));
  }

  // ── 4. Accommodations ────────────────────────────────────────────────────
  for (const a of snapshot.accommodations) {
    if (alreadyImported(a.id)) {
      const existing = existingNodes.find((n) => n.meta?.legacyId === a.id);
      if (existing) idMap[`accommodation:${a.id}`] = existing.id;
      continue;
    }
    const id = nextId(`accommodation:${a.id}`, a.id);
    allDescriptors.push(accommodationToNode(a, id, weddingNodeId));
  }

  // ── 5. Vendors (then QuotePricings + VendorPayments as children) ─────────
  for (const v of snapshot.vendors) {
    if (alreadyImported(v.id)) {
      const existing = existingNodes.find((n) => n.meta?.legacyId === v.id);
      if (existing) idMap[`vendor:${v.id}`] = existing.id;
      continue;
    }
    const vId = nextId(`vendor:${v.id}`, v.id);
    allDescriptors.push(vendorToNode(v, vId, weddingNodeId));

    for (const qp of snapshot.quotePricings.filter((q) => q.vendorId === v.id)) {
      if (alreadyImported(qp.id)) continue;
      const qId = nextId(`quotePricing:${qp.id}`, qp.id);
      allDescriptors.push(quotePricingToNode(qp, qId, vId));
    }
    for (const vp of snapshot.vendorPayments.filter((p) => p.vendorId === v.id)) {
      if (alreadyImported(vp.id)) continue;
      const pId = nextId(`vendorPayment:${vp.id}`, vp.id);
      allDescriptors.push(vendorPaymentToNode(vp, pId, vId));
    }
  }

  // ── 6. Gifts ─────────────────────────────────────────────────────────────
  for (const g of snapshot.gifts) {
    if (alreadyImported(g.id)) continue;
    const id = nextId(`gift:${g.id}`, g.id);
    allDescriptors.push(giftToNode(g, id, weddingNodeId));
  }

  // ── 7. InvitationTypes ───────────────────────────────────────────────────
  for (const it of snapshot.invitationTypes) {
    if (alreadyImported(it.id)) continue;
    const id = nextId(`invitationType:${it.id}`, it.id);
    allDescriptors.push(invitationTypeToNode(it, id, weddingNodeId));
  }

  // ── 8. TaskCategories + Tasks ────────────────────────────────────────────
  for (const tc of snapshot.taskCategories) {
    if (alreadyImported(tc.id)) {
      const existing = existingNodes.find((n) => n.meta?.legacyId === tc.id);
      if (existing) idMap[`taskCategory:${tc.id}`] = existing.id;
      continue;
    }
    const tcId = nextId(`taskCategory:${tc.id}`, tc.id);
    allDescriptors.push(taskCategoryToNode(tc, tcId, weddingNodeId));

    for (const t of snapshot.tasks.filter((t) => t.categoryId === tc.id)) {
      if (alreadyImported(t.id)) continue;
      const tId = nextId(`task:${t.id}`, t.id);
      allDescriptors.push(taskToNode(t, tId, tcId, idMap));
    }
  }
  // Tasks without a category
  for (const t of snapshot.tasks.filter((t) => !t.categoryId)) {
    if (alreadyImported(t.id)) continue;
    const tId = nextId(`task:${t.id}`, t.id);
    allDescriptors.push(taskToNode(t, tId, weddingNodeId, idMap));
  }

  // ── 9. AgendaEvents ──────────────────────────────────────────────────────
  for (const ae of snapshot.agendaEvents) {
    if (alreadyImported(ae.id)) continue;
    const id = nextId(`agendaEvent:${ae.id}`, ae.id);
    allDescriptors.push(agendaEventToNode(ae, id, weddingNodeId));
  }

  // ── 10. DayOfItems ───────────────────────────────────────────────────────
  for (const d of snapshot.dayOfItems) {
    if (alreadyImported(d.id)) continue;
    const id = nextId(`dayOfItem:${d.id}`, d.id);
    allDescriptors.push(dayOfItemToNode(d, id, weddingNodeId));
  }

  // ── 11. IdeaCollections + Ideas ──────────────────────────────────────────
  for (const ic of snapshot.ideaCollections) {
    if (alreadyImported(ic.id)) {
      const existing = existingNodes.find((n) => n.meta?.legacyId === ic.id);
      if (existing) idMap[`ideaCollection:${ic.id}`] = existing.id;
      continue;
    }
    const icId = nextId(`ideaCollection:${ic.id}`, ic.id);
    allDescriptors.push(ideaCollectionToNode(ic, icId, weddingNodeId));

    for (const idea of snapshot.ideas.filter((i) => i.collectionId === ic.id)) {
      if (alreadyImported(idea.id)) continue;
      const iId = nextId(`idea:${idea.id}`, idea.id);
      allDescriptors.push(ideaToNode(idea, iId, icId, idMap));
    }
  }
  // Ideas without a collection
  for (const idea of snapshot.ideas.filter((i) => !i.collectionId)) {
    if (alreadyImported(idea.id)) continue;
    const iId = nextId(`idea:${idea.id}`, idea.id);
    allDescriptors.push(ideaToNode(idea, iId, weddingNodeId, idMap));
  }

  // ── 12. Guests (after tables + accommodations are resolved in idMap) ──────
  for (const g of snapshot.guests) {
    if (alreadyImported(g.id)) continue;
    const groupNodeId =
      g.groupId && idMap[`guestGroup:${g.groupId}`]
        ? idMap[`guestGroup:${g.groupId}`]
        : weddingNodeId;
    const gId = nextId(`guest:${g.id}`, g.id);
    allDescriptors.push(guestToNode(g, gId, groupNodeId, idMap));
  }

  // ── Batch-write the index ─────────────────────────────────────────────────
  if (allDescriptors.length > 0) {
    await updateObjectIndex(session, spaceId, (existing, now) => {
      const next = [...existing];
      for (const desc of allDescriptors) {
        next.push({
          id: desc.id,
          type: desc.type,
          parentId: desc.parentId,
          order: next.length,
          title: desc.title,
          updatedAt: now,
          access: desc.access,
          enc: desc.enc,
          contentKind: desc.contentKind,
          meta: desc.meta,
        } satisfies ObjectNode);
      }
      return next;
    });
  }

  // ── Push content docs in parallel ────────────────────────────────────────
  const contentPushes: Array<Promise<void>> = [];

  async function pushDoc(nodeId: string, data: unknown): Promise<void> {
    const handle = await getNodeAccess(spaceId, nodeId, { access: 'space', enc: true }, session);
    await handle.client.push(objDocPush(spaceId, nodeId), data as Record<string, unknown>, null);
  }

  // Wedding
  if (snapshot.wedding && idMap['wedding']) {
    contentPushes.push(pushDoc(idMap['wedding'], snapshot.wedding));
  }

  for (const g of snapshot.guestGroups) {
    const nid = idMap[`guestGroup:${g.id}`];
    if (nid) contentPushes.push(pushDoc(nid, g));
  }
  for (const t of snapshot.tables) {
    const nid = idMap[`table:${t.id}`];
    if (nid) contentPushes.push(pushDoc(nid, t));
  }
  for (const a of snapshot.accommodations) {
    const nid = idMap[`accommodation:${a.id}`];
    if (nid) contentPushes.push(pushDoc(nid, a));
  }
  for (const v of snapshot.vendors) {
    const nid = idMap[`vendor:${v.id}`];
    if (nid) contentPushes.push(pushDoc(nid, v));
  }
  for (const qp of snapshot.quotePricings) {
    const nid = idMap[`quotePricing:${qp.id}`];
    if (nid) contentPushes.push(pushDoc(nid, qp));
  }
  for (const vp of snapshot.vendorPayments) {
    const nid = idMap[`vendorPayment:${vp.id}`];
    if (nid) contentPushes.push(pushDoc(nid, vp));
  }
  for (const g of snapshot.gifts) {
    const nid = idMap[`gift:${g.id}`];
    if (nid) contentPushes.push(pushDoc(nid, g));
  }
  for (const it of snapshot.invitationTypes) {
    const nid = idMap[`invitationType:${it.id}`];
    if (nid) contentPushes.push(pushDoc(nid, it));
  }
  for (const tc of snapshot.taskCategories) {
    const nid = idMap[`taskCategory:${tc.id}`];
    if (nid) contentPushes.push(pushDoc(nid, tc));
  }
  for (const t of snapshot.tasks) {
    const nid = idMap[`task:${t.id}`];
    if (nid) contentPushes.push(pushDoc(nid, t));
  }
  for (const ae of snapshot.agendaEvents) {
    const nid = idMap[`agendaEvent:${ae.id}`];
    if (nid) contentPushes.push(pushDoc(nid, ae));
  }
  for (const d of snapshot.dayOfItems) {
    const nid = idMap[`dayOfItem:${d.id}`];
    if (nid) contentPushes.push(pushDoc(nid, d));
  }
  for (const ic of snapshot.ideaCollections) {
    const nid = idMap[`ideaCollection:${ic.id}`];
    if (nid) contentPushes.push(pushDoc(nid, ic));
  }
  for (const idea of snapshot.ideas) {
    const nid = idMap[`idea:${idea.id}`];
    if (nid) contentPushes.push(pushDoc(nid, idea));
  }
  for (const g of snapshot.guests) {
    const nid = idMap[`guest:${g.id}`];
    if (nid) contentPushes.push(pushDoc(nid, g));
  }

  await Promise.all(contentPushes);

  // ── Verify FK integrity ───────────────────────────────────────────────────
  // buildTree silently reparents orphaned nodes to root; verify all expected
  // nodes are present in the final tree by comparing counts.
  const finalNodes = await readObjectTree(session, spaceId);
  const treeNodes = buildTree(finalNodes);
  if (treeNodes.length < finalNodes.length) {
    warnings.push(
      `buildTree returned fewer nodes (${treeNodes.length}) than expected (${finalNodes.length}); some nodes may have been silently dropped.`,
    );
  }

  return {
    spaceId,
    nodeCount: allDescriptors.length,
    idMap,
    warnings,
  };
}
