/**
 * Fiancé ObjectNode type constants.
 *
 * octospaces-sdk ships zero domain type strings; all app-specific type
 * identifiers are declared here and stored verbatim in ObjectNode.type.
 * Existing values must never be renamed — they are persisted in the index.
 */

import type { ObjectType } from '@drakkar.software/starfish-spaces';

export const FIANCE_TYPES = {
  // ─── 18 admin domain entities (access:'space', enc:true) ──────────────────
  wedding:        'wedding',
  guestGroup:     'guestGroup',
  guest:          'guest',
  table:          'table',
  vendor:         'vendor',
  quotePricing:   'quotePricing',
  vendorPayment:  'vendorPayment',
  accommodation:  'accommodation',
  gift:           'gift',
  invitationType: 'invitationType',
  taskCategory:   'taskCategory',
  task:           'task',
  agendaEvent:    'agendaEvent',
  dayOfItem:      'dayOfItem',
  ideaCollection: 'ideaCollection',
  idea:           'idea',
  communication:  'communication',
  weddingRole:           'weddingRole',
  weddingRoleAssignment: 'weddingRoleAssignment',
  seatingConstraint:     'seatingConstraint',
  weddingEvent:          'weddingEvent',
  guestMealSelection:    'guestMealSelection',
  communicationTemplate: 'communicationTemplate',
  document:              'document',
  legalMilestone:        'legalMilestone',
  honeymoonPlan:         'honeymoonPlan',
  ceremonyItem:          'ceremonyItem',
  speech:                'speech',
  playlistTrack:         'playlistTrack',
  permissionRole:        'permissionRole',
  permissionAssignment:  'permissionAssignment',
  // ─── 2 guest-surface synthetic nodes (access:'invite', enc:false) ─────────
  /** Invite-only guest page (about/timeline/FAQ/gifts). One per wedding. */
  publicPage:     'publicPage',
  /** Per-guest RSVP slot — one per guest, revocable. */
  rsvp:           'rsvp',
} as const satisfies Record<string, ObjectType>;

export type FianceObjectType = (typeof FIANCE_TYPES)[keyof typeof FIANCE_TYPES];
