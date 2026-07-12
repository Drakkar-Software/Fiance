import { describe, it, expect } from 'vitest';
import { parseSpaceChange, buildAuthHeaders } from './events.js';

describe('parseSpaceChange', () => {
  it('parses a raw QueueMessage with params.spaceId', () => {
    const data = JSON.stringify({
      collection: 'objindex',
      params: { spaceId: 'sp-1' },
      hash: 'h1',
      timestamp: 123,
    });
    expect(parseSpaceChange(data)).toEqual({ spaceId: 'sp-1', hash: 'h1', ts: 123, identity: undefined });
  });

  it('parses a Whistlers { rawPayload } envelope', () => {
    const data = JSON.stringify({
      rawPayload: { params: { spaceId: 'sp-2' }, hash: 'h2', timestamp: 456, identity: 'user-a' },
    });
    expect(parseSpaceChange(data)).toEqual({ spaceId: 'sp-2', hash: 'h2', ts: 456, identity: 'user-a' });
  });

  it('returns null when no spaceId is present', () => {
    const data = JSON.stringify({ collection: 'objdoc', params: {} });
    expect(parseSpaceChange(data)).toBeNull();
  });

  it('returns null on malformed JSON', () => {
    expect(parseSpaceChange('not json')).toBeNull();
  });
});

describe('buildAuthHeaders', () => {
  it('returns Cap + signature headers built from the given cap and key', async () => {
    const cap = { role: 'owner', collections: ['spaces'] };
    // Any 32-byte hex works as an Ed25519 seed (RFC 8032 hashes it to a scalar).
    const edPrivHex = '1'.repeat(64);

    const headers = await buildAuthHeaders(cap, edPrivHex, 'GET', '/v1/dk/events?spaces=sp-1');

    expect(headers.Authorization).toMatch(/^Cap /);
    const capJson = Buffer.from(headers.Authorization.slice('Cap '.length), 'base64').toString('utf-8');
    expect(JSON.parse(capJson)).toEqual(cap);

    expect(typeof headers['X-Starfish-Sig']).toBe('string');
    expect(headers['X-Starfish-Sig'].length).toBeGreaterThan(0);
    expect(Number(headers['X-Starfish-Ts'])).toBeGreaterThan(0);
    expect(typeof headers['X-Starfish-Nonce']).toBe('string');
    expect(headers['X-Starfish-Nonce'].length).toBeGreaterThan(0);
  });
});
