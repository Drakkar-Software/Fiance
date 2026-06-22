/**
 * Minimal in-process live-sync bus for Fiancé.
 *
 * octospaces-sdk used to expose registerPull / dispatchDocChange / emitSseStatus /
 * onSseStatus / clearLiveSyncBus as a built-in event bus.  starfish-spaces is lean
 * and ships no equivalent (real SSE is opt-in via `subscribeChanges`).
 *
 * This file vendors a ~30-line replacement that preserves the exact public API so
 * no call site in apps/mobile needs to change.
 *
 * Semantics:
 *   registerPull(topic, cb)  — subscribe to change events for a topic ('*' = all).
 *                              Returns an unsubscribe function.
 *   dispatchDocChange(topic) — notify all listeners registered for `topic` or '*'.
 *   onSseStatus(cb)          — subscribe to connection-up/down events.
 *   emitSseStatus(up)        — broadcast a connection-up/down event.
 *   clearLiveSyncBus()       — remove all listeners (on account switch / teardown).
 */

type VoidFn = () => void;
type BoolFn = (up: boolean) => void;

const _pullListeners = new Map<string, Set<VoidFn>>();
const _sseListeners = new Set<BoolFn>();

/** Subscribe to doc-change events for `topic` (use '*' to receive all changes). */
export function registerPull(topic: string, cb: VoidFn): VoidFn {
  if (!_pullListeners.has(topic)) _pullListeners.set(topic, new Set());
  _pullListeners.get(topic)!.add(cb);
  return () => {
    _pullListeners.get(topic)?.delete(cb);
  };
}

/**
 * Broadcast a doc-change event.  Notifies listeners registered for `topic`
 * and listeners registered for '*'.
 */
export function dispatchDocChange(topic: string): void {
  const notify = (s: Set<VoidFn>) => s.forEach((fn) => { try { fn(); } catch {} });
  const exact = _pullListeners.get(topic);
  if (exact) notify(exact);
  if (topic !== '*') {
    const star = _pullListeners.get('*');
    if (star) notify(star);
  }
}

/** Subscribe to SSE connection-up/down events.  Returns an unsubscribe function. */
export function onSseStatus(cb: BoolFn): VoidFn {
  _sseListeners.add(cb);
  return () => { _sseListeners.delete(cb); };
}

/** Emit an SSE connection-status event to all subscribers. */
export function emitSseStatus(up: boolean): void {
  _sseListeners.forEach((fn) => { try { fn(up); } catch {} });
}

/** Remove all listeners (call on account switch or sync teardown). */
export function clearLiveSyncBus(): void {
  _pullListeners.clear();
  _sseListeners.clear();
}
