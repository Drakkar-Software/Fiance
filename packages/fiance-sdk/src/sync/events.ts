/**
 * Live space-change SSE stream — read with a fetch-based reader (not the browser
 * `EventSource`, matching the transport `subscribeChanges` from dk-spaces-sdk uses)
 * so named `event:` frames from the Whistlers NATS→SSE gateway are never dropped.
 *
 * Fiancé has no rooms — one wedding, one object tree — so unlike a chat app this
 * wrapper doesn't route by roomId/objectId. Any event for our spaceId means
 * "something changed, go pull" (see apps/mobile/lib/providers.tsx's SyncInitializer,
 * which calls `refreshFromSpaceIfIdle()` on every change).
 *
 * Ported from OctoChat's `packages/sdk/src/events/events.shared.ts` +
 * `packages/sdk/src/starfish/client.ts`'s `buildAuthHeaders`.
 */
import { subscribeChanges } from '@drakkar.software/dk-spaces-sdk';
import { getSyncBase } from '@drakkar.software/dk-spaces-sdk';
import { signRequest, stableStringify } from '@drakkar.software/starfish-protocol';
import type { SignableMethod } from '@drakkar.software/starfish-protocol';

export interface SpaceChange {
  spaceId?: string;
  hash?: string;
  ts?: number;
  /** Account-level user id of the write's author, when the server forwards it. */
  identity?: string;
}

interface QueueMessageish {
  collection?: string;
  params?: { spaceId?: string };
  hash?: string;
  timestamp?: number;
  identity?: string;
}

/** Parse one SSE `data:` payload into a SpaceChange, or null if it carries no spaceId.
 *  Accepts both a raw QueueMessage and the Whistlers `{ rawPayload }` envelope. */
export function parseSpaceChange(data: string): SpaceChange | null {
  try {
    const d = JSON.parse(data) as QueueMessageish & { rawPayload?: QueueMessageish };
    const msg = d.params ? d : (d.rawPayload ?? d);
    const spaceId = msg.params?.spaceId;
    if (!spaceId) return null;
    return {
      spaceId,
      hash: msg.hash,
      ts: msg.timestamp,
      identity: typeof msg.identity === 'string' ? msg.identity : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Build cap-cert auth headers for a raw `fetch` outside the StarfishClient (e.g. `GET /events`).
 * Signing host is derived from `getSyncBase()` so the server-side verifier agrees — same pin as
 * the client's own REST requests. starfish-spaces' own `buildAuthHeaders` hardcodes `host: ""`,
 * which fails `verifyRequestSignature` on deployed servers that bind host; this signs the real host.
 */
export async function buildAuthHeaders(
  cap: unknown,
  devEdPrivHex: string,
  method: string,
  pathAndQuery: string,
): Promise<Record<string, string>> {
  let host = '';
  try {
    host = new URL(getSyncBase()).host;
  } catch {
    // relative base — empty host, both sides agree
  }

  const { sig, ts, nonce } = await signRequest(
    { method: method as SignableMethod, pathAndQuery, host },
    devEdPrivHex,
  );

  const capJson = stableStringify(cap as Record<string, unknown>);
  const capB64 =
    typeof btoa === 'function'
      ? btoa(capJson)
      : Buffer.from(capJson, 'utf-8').toString('base64');

  return {
    Authorization: `Cap ${capB64}`,
    'X-Starfish-Sig': sig,
    'X-Starfish-Ts': String(ts),
    'X-Starfish-Nonce': nonce,
  };
}

/** Options for {@link subscribeSpaceChanges}. */
export interface SubscribeSpaceChangesOptions {
  /** Candidate space ids to subscribe to (the server validates membership). */
  spaces: string[];
  /** Async function building cap-cert auth headers, called on every connect/reconnect. */
  authHeaders: (method: string, pathAndQuery: string) => Promise<Record<string, string>>;
  /** Reports stream health (true = connected, false = disconnected/reconnecting). */
  onStatus?: (connected: boolean) => void;
}

/**
 * Subscribe to space-change events from `getEventsUrl()` via streaming `fetch`.
 * Delegates to the generic `subscribeChanges` from dk-spaces-sdk (transport: signing,
 * SSE frame parsing, reconnect loop with default backoff). `parseSpaceChange` is
 * injected as the domain-specific `parse` callback. Returns an unsubscribe fn.
 */
export function subscribeSpaceChanges(
  onChange: (e: SpaceChange) => void,
  opts: SubscribeSpaceChangesOptions,
): () => void {
  return subscribeChanges<SpaceChange>({
    spaces: opts.spaces,
    authHeaders: opts.authHeaders,
    parse: parseSpaceChange,
    onChange,
    onStatus: opts.onStatus,
  });
}
