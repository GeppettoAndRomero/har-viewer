// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  parseHarText,
  computeCaptureSpanMs,
  humanBytes,
  shortMimeType,
  formatDurationMs,
  statusClass,
  prepareBody,
  type HarEntry,
} from '@/utils/harParse';

// jsdom environment: prepareBody's base64 path uses the browser-native atob/TextDecoder.

function entry(overrides: Partial<HarEntry> = {}): HarEntry {
  return {
    startedDateTime: '2024-01-01T00:00:00.000Z',
    time: 100,
    request: {
      method: 'GET',
      url: 'https://example.com/',
      headers: [],
      queryString: [],
      cookies: [],
    },
    response: {
      status: 200,
      headers: [],
      cookies: [],
      content: { size: 0, mimeType: '' },
    },
    timings: { send: 0, wait: 0, receive: 0 },
    ...overrides,
  };
}

describe('parseHarText', () => {
  it('rejects empty input', () => {
    expect(parseHarText('')).toEqual({ ok: false, code: 'empty' });
    expect(parseHarText('   ')).toEqual({ ok: false, code: 'empty' });
  });

  it('rejects invalid JSON', () => {
    expect(parseHarText('{not json')).toEqual({ ok: false, code: 'invalidJson' });
  });

  it('rejects valid JSON that is not shaped like a HAR file', () => {
    expect(parseHarText('{}')).toEqual({ ok: false, code: 'notHar' });
    expect(parseHarText('{"log": {}}')).toEqual({ ok: false, code: 'notHar' });
    expect(parseHarText('{"log": {"entries": "nope"}}')).toEqual({ ok: false, code: 'notHar' });
    expect(parseHarText('[1,2,3]')).toEqual({ ok: false, code: 'notHar' });
  });

  it('accepts a minimal valid HAR (empty entries array)', () => {
    const result = parseHarText('{"log": {"version": "1.2", "entries": []}}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.har.log.entries).toEqual([]);
      expect(result.har.log.version).toBe('1.2');
    }
  });

  it('normalizes a real-shaped entry, defaulting missing optional arrays', () => {
    const raw = {
      log: {
        entries: [
          {
            startedDateTime: '2024-01-01T00:00:00.000Z',
            time: 42,
            request: { method: 'GET', url: 'https://example.com/api' },
            response: { status: 200, content: { mimeType: 'application/json', size: 12 } },
            timings: { send: 1, wait: 2, receive: 3 },
          },
        ],
      },
    };
    const result = parseHarText(JSON.stringify(raw));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const e = result.har.log.entries[0];
    expect(e.request.method).toBe('GET');
    expect(e.request.headers).toEqual([]);
    expect(e.request.queryString).toEqual([]);
    expect(e.request.cookies).toEqual([]);
    expect(e.response.status).toBe(200);
    expect(e.response.content.mimeType).toBe('application/json');
    expect(e.time).toBe(42);
  });

  it('clamps a negative total time to zero', () => {
    const raw = { log: { entries: [{ time: -1, request: {}, response: {}, timings: {} }] } };
    const result = parseHarText(JSON.stringify(raw));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.har.log.entries[0].time).toBe(0);
  });
});

describe('computeCaptureSpanMs', () => {
  it('returns the wall-clock span across entries with startedDateTime', () => {
    const entries = [
      entry({ startedDateTime: '2024-01-01T00:00:00.000Z', time: 100 }),
      entry({ startedDateTime: '2024-01-01T00:00:01.000Z', time: 200 }),
    ];
    // second entry ends at 1000 + 200 = 1200ms after the first entry's start
    expect(computeCaptureSpanMs(entries)).toBe(1200);
  });

  it('falls back to the slowest entry when no startedDateTime is parseable', () => {
    const entries = [
      entry({ startedDateTime: undefined, time: 50 }),
      entry({ startedDateTime: undefined, time: 300 }),
    ];
    expect(computeCaptureSpanMs(entries)).toBe(300);
  });

  it('returns 1 (never 0) for a single zero-time entry with no startedDateTime', () => {
    expect(computeCaptureSpanMs([entry({ startedDateTime: undefined, time: 0 })])).toBe(1);
  });
});

describe('humanBytes', () => {
  it('formats bytes, KB and MB', () => {
    expect(humanBytes(500)).toBe('500 B');
    expect(humanBytes(2048)).toBe('2.0 KB');
    expect(humanBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('shows an en-dash for unknown (-1) or invalid sizes', () => {
    expect(humanBytes(-1)).toBe('–');
    expect(humanBytes(NaN)).toBe('–');
  });
});

describe('shortMimeType', () => {
  it('strips a trailing charset', () => {
    expect(shortMimeType('application/json; charset=utf-8')).toBe('application/json');
  });

  it('returns an en-dash for an empty mimeType', () => {
    expect(shortMimeType('')).toBe('–');
  });
});

describe('formatDurationMs', () => {
  it('shows milliseconds below one second', () => {
    expect(formatDurationMs(820)).toBe('820 ms');
  });

  it('shows seconds at or above one second', () => {
    expect(formatDurationMs(1300)).toBe('1.3 s');
  });

  it('shows an en-dash for invalid input', () => {
    expect(formatDurationMs(-5)).toBe('–');
  });
});

describe('statusClass', () => {
  it('buckets status codes into classes', () => {
    expect(statusClass(200)).toBe('success');
    expect(statusClass(301)).toBe('redirect');
    expect(statusClass(404)).toBe('clientError');
    expect(statusClass(503)).toBe('serverError');
    expect(statusClass(0)).toBe('unknown');
  });
});

describe('prepareBody', () => {
  it('reports empty when there is no text', () => {
    expect(prepareBody(undefined, 'application/json')).toEqual({ kind: 'empty', content: '' });
  });

  it('pretty-prints a JSON body', () => {
    const result = prepareBody('{"a":1,"b":[2,3]}', 'application/json');
    expect(result.kind).toBe('json');
    expect(result.content).toBe(JSON.stringify({ a: 1, b: [2, 3] }, null, 2));
  });

  it('falls back to raw text when the mimeType says JSON but the text is not', () => {
    const result = prepareBody('not json at all', 'application/json');
    expect(result).toEqual({ kind: 'text', content: 'not json at all' });
  });

  it('returns plain text unchanged for a non-JSON mimeType', () => {
    expect(prepareBody('hello world', 'text/plain')).toEqual({
      kind: 'text',
      content: 'hello world',
    });
  });

  it('base64-decodes an encoded JSON body', () => {
    const original = JSON.stringify({ ok: true });
    const b64 = btoa(original);
    const result = prepareBody(b64, 'application/json', 'base64');
    expect(result.kind).toBe('json');
    expect(result.content).toBe(JSON.stringify({ ok: true }, null, 2));
  });

  it('reports binary when base64 decoding fails', () => {
    const result = prepareBody('!!!not-base64!!!', 'application/octet-stream', 'base64');
    expect(result.kind).toBe('binary');
  });
});
