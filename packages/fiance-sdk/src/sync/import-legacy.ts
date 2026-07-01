/**
 * Legacy backup importer — v6 backup JSON → octospaces ObjectNode tree.
 *
 * Usage (app-side, after the user picks a file):
 *   const snapshot = parseAndRestore(jsonString);  // from export-import-core
 *   const result   = await importLegacyBackup(session, spaceId, snapshot, weddingNodeId);
 *
 * This is the "clean cut" path: no old-server pull, no identity bridging.
 * Couples export a backup from the old app then import it into their new space.
 *
 * ID scheme: entity.id is used as the node id for all non-wedding entities,
 * matching the buildAllNodes invariant in space-sync.ts. The wedding root uses
 * the passed weddingNodeId (the registry UUID), which must match the id used by
 * buildAllNodes for the live-sync snapshot.
 *
 * Idempotency: a node is skipped when either (a) its meta.legacyId matches the
 * entity id (previously imported via this function) or (b) a node with the same
 * id already exists in the index (live-synced via buildAllNodes). This allows
 * safe retries on partial failure and prevents duplicates.
 *
 * The `publicPage` and `rsvp` guest-surface nodes are NOT created here — those
 * are minted by the owner from the Settings screen after import (they require
 * per-guest invite links to be generated).
 */

import {
  updateObjectIndex,
  readObjectTree,
  buildTree,
  getNodeAccess,
  type Session,
  type ObjectNode,
} from '@drakkar.software/starfish-spaces';
import { objDocPush } from './object-paths.js';
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
  communicationToNode,
  weddingRoleAssignmentToNode,
  seatingConstraintToNode,
  weddingEventToNode,
  guestMealSelectionToNode,
  communicationTemplateToNode,
  documentToNode,
  legalMilestoneToNode,
  honeymoonPlanToNode,
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
 * Import a v7 WeddingSnapshot into an existing Space as ObjectNodes.
 *
 * All admin nodes (`access:'space', enc:true`) are batch-inserted into the
 * index in a single `updateObjectIndex` call, then their content docs are
 * pushed in parallel, **encrypted** via the space keyring.
 *
 * @param weddingNodeId — The registry entry UUID that buildAllNodes uses as
 *   the wedding root node id. Must match `getActiveWeddingNodeId()` at call site.
 */
export async function importLegacyBackup(
  session: Session,
  spaceId: string,
  snapshot: WeddingSnapshot,
  weddingNodeId: string,
): Promise<ImportResult> {
  const idMap: Record<string, string> = {};
  const warnings: string[] = [];
  const allDescriptors: NodeDescriptor[] = [];
  const contentMap = new Map<string, unknown>();

  // ── Read existing index to skip already-present nodes ───────────────────
  const existingNodes = await readObjectTree(session, spaceId);
  // Nodes created by a prior import have meta.legacyId = entity.id.
  const existingLegacyIds = new Set<string>(
    existingNodes.flatMap((n) =>
      typeof n.meta?.legacyId === 'string' ? [n.meta.legacyId] : [],
    ),
  );
  // Nodes created by live-sync have node.id = entity.id (buildAllNodes invariant).
  const existingNodeIds = new Set<string>(existingNodes.map((n) => n.id));

  /** True when a node for this entity already exists (imported or live-synced). */
  function alreadyImported(entityId: string): boolean {
    return existingLegacyIds.has(entityId) || existingNodeIds.has(entityId);
  }

  /**
   * Record entity id as the node id for this key.
   * After this fix: node.id === entity.id, matching buildAllNodes invariant.
   */
  function nextId(key: string, entityId: string): string {
    idMap[key] = entityId;
    return entityId;
  }

  /**
   * Adds meta.legacyId to a descriptor so subsequent imports can identify and
   * skip nodes that were created by a previous run of this function.
   */
  function withLegacyId(desc: NodeDescriptor, legacyId: string): NodeDescriptor {
    return { ...desc, meta: { ...(desc.meta ?? {}), legacyId } };
  }

  // ── 1. Wedding root ──────────────────────────────────────────────────────
  // The wedding root uses the passed registry UUID (weddingNodeId), NOT the
  // entity's numeric id, to stay consistent with buildAllNodes in space-sync.ts.
  const existingWedding = existingNodes.find((n) => n.type === 'wedding');
  const resolvedWeddingId = existingWedding?.id ?? weddingNodeId;
  idMap['wedding'] = resolvedWeddingId;
  if (existingWedding) {
    warnings.push('Wedding root node already exists; reusing existing node.');
  } else {
    const desc = weddingToNode(snapshot.wedding ?? { id: 0 } as never, weddingNodeId);
    allDescriptors.push(desc);
    contentMap.set(weddingNodeId, snapshot.wedding ?? { id: 0 });
  }

  // ── 2. GuestGroups ───────────────────────────────────────────────────────
  for (const g of snapshot.guestGroups) {
    if (alreadyImported(g.id)) {
      idMap[`guestGroup:${g.id}`] = g.id;
      continue;
    }
    const id = nextId(`guestGroup:${g.id}`, g.id);
    allDescriptors.push(withLegacyId(guestGroupToNode(g, id, resolvedWeddingId), g.id));
    contentMap.set(id, g);
  }

  // ── 3. Tables ────────────────────────────────────────────────────────────
  for (const t of snapshot.tables) {
    if (alreadyImported(t.id)) {
      idMap[`table:${t.id}`] = t.id;
      continue;
    }
    const id = nextId(`table:${t.id}`, t.id);
    allDescriptors.push(withLegacyId(tableToNode(t, id, resolvedWeddingId), t.id));
    contentMap.set(id, t);
  }

  // ── 4. Accommodations ────────────────────────────────────────────────────
  for (const a of snapshot.accommodations) {
    if (alreadyImported(a.id)) {
      idMap[`accommodation:${a.id}`] = a.id;
      continue;
    }
    const id = nextId(`accommodation:${a.id}`, a.id);
    allDescriptors.push(withLegacyId(accommodationToNode(a, id, resolvedWeddingId), a.id));
    contentMap.set(id, a);
  }

  // ── 5. Vendors (then QuotePricings + VendorPayments as children) ─────────
  for (const v of snapshot.vendors) {
    if (!alreadyImported(v.id)) {
      const vId = nextId(`vendor:${v.id}`, v.id);
      allDescriptors.push(withLegacyId(vendorToNode(v, vId, resolvedWeddingId), v.id));
      contentMap.set(vId, v);
    } else {
      idMap[`vendor:${v.id}`] = v.id;
    }

    // Always process children — the vendor may be live-synced while its quote/payment
    // nodes are only in the legacy backup (common during a partial migration).
    for (const qp of snapshot.quotePricings.filter((q) => q.vendorId === v.id)) {
      if (alreadyImported(qp.id)) continue;
      const qId = nextId(`quotePricing:${qp.id}`, qp.id);
      allDescriptors.push(withLegacyId(quotePricingToNode(qp, qId, v.id), qp.id));
      contentMap.set(qId, qp);
    }
    for (const vp of snapshot.vendorPayments.filter((p) => p.vendorId === v.id)) {
      if (alreadyImported(vp.id)) continue;
      const pId = nextId(`vendorPayment:${vp.id}`, vp.id);
      allDescriptors.push(withLegacyId(vendorPaymentToNode(vp, pId, v.id), vp.id));
      contentMap.set(pId, vp);
    }
  }

  // ── 6. Gifts ─────────────────────────────────────────────────────────────
  for (const g of snapshot.gifts) {
    if (alreadyImported(g.id)) continue;
    const id = nextId(`gift:${g.id}`, g.id);
    allDescriptors.push(withLegacyId(giftToNode(g, id, resolvedWeddingId), g.id));
    contentMap.set(id, g);
  }

  // ── 7. InvitationTypes ───────────────────────────────────────────────────
  for (const it of snapshot.invitationTypes) {
    if (alreadyImported(it.id)) continue;
    const id = nextId(`invitationType:${it.id}`, it.id);
    allDescriptors.push(withLegacyId(invitationTypeToNode(it, id, resolvedWeddingId), it.id));
    contentMap.set(id, it);
  }

  // ── 8. TaskCategories + Tasks ────────────────────────────────────────────
  for (const tc of snapshot.taskCategories) {
    if (!alreadyImported(tc.id)) {
      const tcId = nextId(`taskCategory:${tc.id}`, tc.id);
      allDescriptors.push(withLegacyId(taskCategoryToNode(tc, tcId, resolvedWeddingId), tc.id));
      contentMap.set(tcId, tc);
    } else {
      idMap[`taskCategory:${tc.id}`] = tc.id;
    }

    // Always process tasks — category may be live-synced while tasks are still in the backup.
    for (const t of snapshot.tasks.filter((t) => t.categoryId === tc.id)) {
      if (alreadyImported(t.id)) continue;
      const tId = nextId(`task:${t.id}`, t.id);
      allDescriptors.push(withLegacyId(taskToNode(t, tId, tc.id, idMap), t.id));
      contentMap.set(tId, t);
    }
  }
  // Tasks without a category
  for (const t of snapshot.tasks.filter((t) => !t.categoryId)) {
    if (alreadyImported(t.id)) continue;
    const tId = nextId(`task:${t.id}`, t.id);
    allDescriptors.push(withLegacyId(taskToNode(t, tId, resolvedWeddingId, idMap), t.id));
    contentMap.set(tId, t);
  }

  // ── 9. AgendaEvents ──────────────────────────────────────────────────────
  for (const ae of snapshot.agendaEvents) {
    if (alreadyImported(ae.id)) continue;
    const id = nextId(`agendaEvent:${ae.id}`, ae.id);
    allDescriptors.push(withLegacyId(agendaEventToNode(ae, id, resolvedWeddingId), ae.id));
    contentMap.set(id, ae);
  }

  // ── 10. DayOfItems ───────────────────────────────────────────────────────
  for (const d of snapshot.dayOfItems) {
    if (alreadyImported(d.id)) continue;
    const id = nextId(`dayOfItem:${d.id}`, d.id);
    allDescriptors.push(withLegacyId(dayOfItemToNode(d, id, resolvedWeddingId), d.id));
    contentMap.set(id, d);
  }

  // ── 11. IdeaCollections + Ideas ──────────────────────────────────────────
  for (const ic of snapshot.ideaCollections) {
    if (!alreadyImported(ic.id)) {
      const icId = nextId(`ideaCollection:${ic.id}`, ic.id);
      allDescriptors.push(withLegacyId(ideaCollectionToNode(ic, icId, resolvedWeddingId), ic.id));
      contentMap.set(icId, ic);
    } else {
      idMap[`ideaCollection:${ic.id}`] = ic.id;
    }

    // Always process ideas — collection may be live-synced while ideas are still in the backup.
    for (const idea of snapshot.ideas.filter((i) => i.collectionId === ic.id)) {
      if (alreadyImported(idea.id)) continue;
      const iId = nextId(`idea:${idea.id}`, idea.id);
      allDescriptors.push(withLegacyId(ideaToNode(idea, iId, ic.id, idMap), idea.id));
      contentMap.set(iId, idea);
    }
  }
  // Ideas without a collection
  for (const idea of snapshot.ideas.filter((i) => !i.collectionId)) {
    if (alreadyImported(idea.id)) continue;
    const iId = nextId(`idea:${idea.id}`, idea.id);
    allDescriptors.push(withLegacyId(ideaToNode(idea, iId, resolvedWeddingId, idMap), idea.id));
    contentMap.set(iId, idea);
  }

  // ── 12. Communications ───────────────────────────────────────────────────
  for (const comm of (snapshot.communications ?? [])) {
    if (alreadyImported(comm.id)) continue;
    const id = nextId(`communication:${comm.id}`, comm.id);
    allDescriptors.push(withLegacyId(communicationToNode(comm, id, resolvedWeddingId), comm.id));
    contentMap.set(id, comm);
  }

  // ── 12b. Wedding role assignments ────────────────────────────────────────
  for (const role of (snapshot.weddingRoleAssignments ?? [])) {
    if (alreadyImported(role.id)) continue;
    const id = nextId(`weddingRoleAssignment:${role.id}`, role.id);
    allDescriptors.push(withLegacyId(weddingRoleAssignmentToNode(role, id, resolvedWeddingId), role.id));
    contentMap.set(id, role);
  }

  // ── 12c. Seating constraints ──────────────────────────────────────────────
  for (const constraint of (snapshot.seatingConstraints ?? [])) {
    if (alreadyImported(constraint.id)) continue;
    const id = nextId(`seatingConstraint:${constraint.id}`, constraint.id);
    allDescriptors.push(withLegacyId(seatingConstraintToNode(constraint, id, resolvedWeddingId), constraint.id));
    contentMap.set(id, constraint);
  }

  // ── 12d. Wedding events ───────────────────────────────────────────────────
  for (const event of (snapshot.weddingEvents ?? [])) {
    if (alreadyImported(event.id)) continue;
    const id = nextId(`weddingEvent:${event.id}`, event.id);
    allDescriptors.push(withLegacyId(weddingEventToNode(event, id, resolvedWeddingId), event.id));
    contentMap.set(id, event);
  }

  // ── 12e. Guest meal selections ────────────────────────────────────────────
  for (const selection of (snapshot.guestMealSelections ?? [])) {
    if (alreadyImported(selection.id)) continue;
    const id = nextId(`guestMealSelection:${selection.id}`, selection.id);
    allDescriptors.push(withLegacyId(guestMealSelectionToNode(selection, id, resolvedWeddingId), selection.id));
    contentMap.set(id, selection);
  }

  // ── 12f. Communication templates ──────────────────────────────────────────
  for (const template of (snapshot.communicationTemplates ?? [])) {
    if (alreadyImported(template.id)) continue;
    const id = nextId(`communicationTemplate:${template.id}`, template.id);
    allDescriptors.push(withLegacyId(communicationTemplateToNode(template, id, resolvedWeddingId), template.id));
    contentMap.set(id, template);
  }

  // ── 12g. Documents (metadata only; localUri arrives stripped from backup) ──
  for (const document of (snapshot.documents ?? [])) {
    if (alreadyImported(document.id)) continue;
    const id = nextId(`document:${document.id}`, document.id);
    allDescriptors.push(withLegacyId(documentToNode(document, id, resolvedWeddingId), document.id));
    contentMap.set(id, document);
  }

  // ── 12h. Legal milestones ─────────────────────────────────────────────────
  for (const milestone of (snapshot.legalMilestones ?? [])) {
    if (alreadyImported(milestone.id)) continue;
    const id = nextId(`legalMilestone:${milestone.id}`, milestone.id);
    allDescriptors.push(withLegacyId(legalMilestoneToNode(milestone, id, resolvedWeddingId), milestone.id));
    contentMap.set(id, milestone);
  }

  // ── 12i. Honeymoon plan (0–1 row) ─────────────────────────────────────────
  for (const plan of (snapshot.honeymoonPlans ?? [])) {
    if (alreadyImported(plan.id)) continue;
    const id = nextId(`honeymoonPlan:${plan.id}`, plan.id);
    allDescriptors.push(withLegacyId(honeymoonPlanToNode(plan, id, resolvedWeddingId), plan.id));
    contentMap.set(id, plan);
  }

  // ── 13. Guests (after tables + accommodations are resolved in idMap) ──────
  for (const g of snapshot.guests) {
    if (alreadyImported(g.id)) continue;
    const groupNodeId =
      g.groupId && idMap[`guestGroup:${g.groupId}`]
        ? idMap[`guestGroup:${g.groupId}`]
        : resolvedWeddingId;
    const gId = nextId(`guest:${g.id}`, g.id);
    allDescriptors.push(withLegacyId(guestToNode(g, gId, groupNodeId, idMap), g.id));
    contentMap.set(gId, g);
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

  // ── Push content docs in parallel (E2EE encrypted via space keyring) ──────
  //
  // Critical: `client.push` sends plaintext — encryption is the caller's
  // responsibility via `handle.encryptor.encrypt`. Pass the full NodeDescriptor
  // (not hardcoded flags) so invite-access nodes get the right key material.
  async function pushDoc(desc: NodeDescriptor, data: unknown): Promise<void> {
    const handle = await getNodeAccess(spaceId, desc.id, desc, session, null);
    const payload = handle.encryptor
      ? await handle.encryptor.encrypt(data as Record<string, unknown>)
      : (data as Record<string, unknown>);
    await handle.client.push(objDocPush(spaceId, desc.id), payload, null);
  }

  const contentResults = await Promise.allSettled(
    allDescriptors.map((desc) => {
      const content = contentMap.get(desc.id);
      return content !== undefined ? pushDoc(desc, content) : Promise.resolve();
    }),
  );

  for (const result of contentResults) {
    if (result.status === 'rejected') {
      warnings.push(`Content push failed: ${String(result.reason)}`);
    }
  }

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
