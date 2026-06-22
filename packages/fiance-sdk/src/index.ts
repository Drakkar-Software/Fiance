// ─── Fiancé domain ────────────────────────────────────────────────────────────
export * from './domain/types.js';
export * from './domain/schema.js';
export * from './domain/guests.js';
export * from './domain/budget.js';
export * from './domain/planning.js';
export * from './domain/vendor-config.js';
export * from './domain/registry.js';

// ─── Fiancé object model ──────────────────────────────────────────────────────
export * from './objects/object-types.js';
export * from './objects/mappers.js';

// ─── Fiancé sync ──────────────────────────────────────────────────────────────
export * from './sync/backup.js';
export * from './sync/public-page.js';
export * from './sync/rsvp.js';
export * from './sync/export-import-core.js';
export * from './sync/import-legacy.js';
export * from './analytics.js';

// ─── Fiancé config ────────────────────────────────────────────────────────────
export { configureFiance } from './core/config.js';
export type { FianceConfig } from './core/config.js';

// ─── Re-export from octospaces-sdk (stable app imports — never import octospaces-sdk directly) ───
export {
  // Config + KV
  configureOctoSpaces, configureKv,
  getSyncBase, getSyncNamespace, getSyncPrefix, getSharedSpacesNamespace, getEventsUrl,
  // Identity / session
  buildSession, buildLinkedSession, deriveSession, sessionFromPersisted, activeAccountOf,
  generateSeedWords, isValidSeed, fingerprintFromUserId, rootIdentityOf,
  // Ids
  randomId, slugify,
  // Client + keyring
  makeClient, capProviderFor, buildEncryptor, openEncryptor,
  ownerEnsureKeyring, ownerEnsureSpaceKeyring,
  isAlreadyPresentRecipient, addSpaceKeyringRecipient, ensureSpaceKeyringRecipient,
  buildAuthHeaders,
  // Profile
  readProfile, readPseudo, readProfiles, writeProfile, writePseudo, ensureProfileKeys, ensurePseudo,
  // Paths / cap scopes
  OBJECT_COLLECTIONS,
  ownerScope, spaceOwnerScope, spaceMemberScope, nodeMemberScope,
  nodeStreamScope, accountScope, linkedDeviceScope,
  keyringName, keyringPull, keyringPush,
  objIndexName, objIndexPull, objIndexPush,
  objDocName, objDocPull, objDocPush,
  objInvName, objInvPull, objInvPush,
  objLogName, objLogPull, objLogPush,
  objPubName, objPubPull, objPubPush,
  objectBlobName, objectBlobPull, objectBlobPush,
  userIdFromEdPub, bytesToHex,
  spaceIdFromNodeId,
  // Space lifecycle
  createSpace, readSpaces, updateSpacesDoc, buildSpace,
  addSpaceMember, removeSpaceMember,
  addJoinedSpace, addJoinedSpaceWithCap, addJoinedSpaceWithLinkAccess,
  reorderSpaces, moveSpace, removeJoinedSpace,
  readSpaceAccess, writeSpaceAccess,
  reconcileSpaceMeta, onSpaceMeta, broadcastSpaceMeta,
  updateSpacesExtraField, writeSpaces,
  // Space members + invites
  makeJoinRequest, inviteToSpace, acceptSpaceInvite,
  createSpaceInviteLink, joinSpaceByLink,
  encodeSpaceInviteLink, decodeSpaceInviteLink,
  addDeviceToSpaceKeyring, revokeSpaceAccess, recoverSpaceAccess,
  saveSpaceInviteEntry, getSpaceInviteEntry,
  // Node lifecycle
  createNode, setNodeAccess,
  inviteToNode, acceptNodeInvite,
  createNodeInviteLink, joinNodeByLink,
  encodeNodeInviteLink, decodeNodeInviteLink,
  revokeNodeAccess,
  saveNodeInviteEntry, getNodeInviteEntry,
  // TODO(B5/gap-2): readNodeWithLinkCap, writeNodeWithLinkCap — requires octospaces-sdk > 0.22.0
  // Object index
  updateObjectIndex, readObjectTree, seedSpaceObjectIndex, pushIndexSeed,
  // Object tree reducers
  buildTree, breadcrumbs, ancestors, subtreeIds, nextOrder,
  addObject, patchObject, reparentObject, reorderObjects, archiveObject,
  // Node access
  getNodeAccess, buildNodeAccess, getSpaceClient, getNodeStreamClient, clearNodeAccessCache,
  // Space access store
  hydrateSpaceAccessStore, getSpaceAccessEntry, saveSpaceAccessEntry, removeSpaceAccessEntry,
  getNodeAccessEntry, saveNodeAccessEntry, removeNodeAccessEntry,
  clearSpaceAccessStore, clearPersistedSpaceAccess,
  // Sealed blobs
  sealToSelf, unsealFromSelf, sealToRecipient, unsealFromRecipient,
  // Object blobs
  uploadObjectBlob, loadObjectBlob, createObjectBlobStore, FileTooLargeError, MAX_OBJECT_BLOB_BYTES,
  // Inbox / anonymous append / resource requests
  inboxShard, inboxShards, pullInbox, appendToInbox, postAnonymousAppend,
  submitResourceRequest, scanResourceRequests,
  acceptResourceRequest, rejectResourceRequest,
  scanResourceGrants, scanResourceRejects, acceptResourceGrant,
  saveReqIdOwner,
  // Object directory
  readObjectDirectory,
  // Pairing
  startDevicePairing, completeDevicePairing, PAIR_PREFIX,
  // Live sync bus
  registerPull, dispatchDocChange, emitSseStatus, onSseStatus, clearLiveSyncBus,
  // SSE events
  subscribeChanges, parseSseFrames, buildSignedEventsRequest,
  // Pull / profile cache
  pullCache, cacheProfile, loadCachedProfile,
  // Fetch
  fetchWithTimeout,
  // Utilities
  previewInvite,
  matchTitle, rankResults, fold,
  plural, clockTime, initialsFor, formatBytes, relativeTime, relativeTimeShort,
  // Base64
  starfishBase64, toBase64Url, fromBase64Url,
  // Link tokens
  encodeLinkFragment, decodeLinkFragment,
  // Identity links
  encodeIdentityLink, decodeIdentityLink, verifyIdentityLinkBinding, myIdentityLink,
  // Prefs
  createMutesStore, isMuteActive, createReadsStore,
} from '@drakkar.software/octospaces-sdk';

export type {
  // Config
  OctoSpacesConfig, KvAdapter,
  // Domain types
  ID, NodeAccess, ObjectNode, ObjectType, ObjectsIndex,
  ObjectContentKind, Space, CapMap, PubAccessMap,
  MuteValue, MutePrefs, ReadValue, ReadPrefs,
  // Session
  Session, LinkedIdentity, DeviceKeys,
  PersistedSession, Vault, VaultLoad, UnlockMethod, SeedLock,
  DerivedIdentity,
  // Profile
  PublicProfile,
  // Space
  SpaceMeta, SpaceMetaUpdate,
  // Nodes
  CreateNodeInput, NodeInviteBundle, NodeInviteKind, NodeInviteLinkToken, StoredNodeInvite,
  SpaceInviteLinkToken, JoinRequest, StoredSpaceInvite,
  // Object tree
  ObjectTreeNode, NewObjectInput,
  // Node access
  NodeAccessHandle,
  // Space access
  SpaceAccessEntry, SpaceAccessMap,
  // Blobs
  ByteSealer, ObjectBlobRef, ObjectBlobStore,
  // Requests
  ResourceRequest, ResourceGrant, ResourceReject, PendingRequest, AcceptResult,
  SubmitResourceRequestOptions,
  // Pairing
  PairResult, StartPairingOptions,
  // Events
  SubscribeChangesOptions,
  // Invite preview
  InvitePreview,
  // Search
  MatchRange, TitleMatch, RankedResult,
  // Sealed
  SealedBlob,
  // Inbox
  InboxElement,
  // Directory
  PublicObjectDirEntry,
  // Prefs
  MutesStore, ReadsStore,
  // Identity link
  IdentityLink,
} from '@drakkar.software/octospaces-sdk';
