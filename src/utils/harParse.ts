/**
 * HAR 1.2 parsing + validation.
 *
 * A .har file is plain JSON (the HTTP Archive format). There is no format-specific
 * library to load: `JSON.parse` does the real work, and this module only validates the
 * shape (`log.entries` must be an array — the one thing every real HAR capture has) and
 * normalizes optional fields/arrays so the rest of the app never has to guard against
 * `undefined`. Everything here runs on bytes already in memory; nothing is sent anywhere.
 */

export interface HarNameValue {
  name: string;
  value: string;
}

export interface HarPostData {
  mimeType: string;
  text?: string;
  params?: HarNameValue[];
}

export interface HarContent {
  size: number;
  mimeType: string;
  text?: string;
  encoding?: string;
}

export interface HarRequest {
  method: string;
  url: string;
  httpVersion?: string;
  headers: HarNameValue[];
  queryString: HarNameValue[];
  cookies: HarNameValue[];
  postData?: HarPostData;
  headersSize?: number;
  bodySize?: number;
}

export interface HarResponse {
  status: number;
  statusText?: string;
  httpVersion?: string;
  headers: HarNameValue[];
  cookies: HarNameValue[];
  content: HarContent;
  redirectURL?: string;
  headersSize?: number;
  bodySize?: number;
}

/** Sub-phase timings (ms). `ssl`, when present, is already included inside `connect`
 *  per the HAR spec — it is a sub-phase, not an additional one, so the waterfall
 *  deliberately does not add it again (see `src/utils/waterfall.ts`). A phase that did
 *  not apply is `-1` or absent; both are treated as "no contribution" everywhere here. */
export interface HarTimings {
  blocked?: number;
  dns?: number;
  connect?: number;
  send: number;
  wait: number;
  receive: number;
  ssl?: number;
}

export interface HarEntry {
  startedDateTime?: string;
  time: number;
  request: HarRequest;
  response: HarResponse;
  timings: HarTimings;
  serverIPAddress?: string;
}

export interface HarLog {
  version?: string;
  entries: HarEntry[];
}

export interface HarFile {
  log: HarLog;
}

export type HarParseErrorCode = 'empty' | 'invalidJson' | 'notHar' | 'unreadable';

export interface HarParseSuccess {
  ok: true;
  har: HarFile;
}

export interface HarParseFailure {
  ok: false;
  code: HarParseErrorCode;
}

export type HarParseResult = HarParseSuccess | HarParseFailure;

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object';
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function num(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function normalizeNameValueArray(input: unknown): HarNameValue[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(isRecord)
    .map((it) => ({ name: str(it.name), value: str(it.value) }));
}

function normalizePostData(input: unknown): HarPostData | undefined {
  if (!isRecord(input)) return undefined;
  return {
    mimeType: str(input.mimeType),
    text: typeof input.text === 'string' ? input.text : undefined,
    params: input.params ? normalizeNameValueArray(input.params) : undefined,
  };
}

function normalizeEntry(raw: unknown, index: number): HarEntry {
  const e = isRecord(raw) ? raw : {};
  const req = isRecord(e.request) ? e.request : {};
  const res = isRecord(e.response) ? e.response : {};
  const content = isRecord(res.content) ? res.content : {};
  const timings = isRecord(e.timings) ? e.timings : {};

  const optNum = (v: unknown): number | undefined => (typeof v === 'number' ? v : undefined);

  return {
    startedDateTime: typeof e.startedDateTime === 'string' ? e.startedDateTime : undefined,
    time: Math.max(0, num(e.time)),
    request: {
      method: str(req.method, 'GET'),
      url: str(req.url, `(entry ${index + 1})`),
      httpVersion: typeof req.httpVersion === 'string' ? req.httpVersion : undefined,
      headers: normalizeNameValueArray(req.headers),
      queryString: normalizeNameValueArray(req.queryString),
      cookies: normalizeNameValueArray(req.cookies),
      postData: normalizePostData(req.postData),
      headersSize: optNum(req.headersSize),
      bodySize: optNum(req.bodySize),
    },
    response: {
      status: num(res.status),
      statusText: typeof res.statusText === 'string' ? res.statusText : undefined,
      httpVersion: typeof res.httpVersion === 'string' ? res.httpVersion : undefined,
      headers: normalizeNameValueArray(res.headers),
      cookies: normalizeNameValueArray(res.cookies),
      content: {
        size: num(content.size),
        mimeType: str(content.mimeType),
        text: typeof content.text === 'string' ? content.text : undefined,
        encoding: typeof content.encoding === 'string' ? content.encoding : undefined,
      },
      redirectURL: typeof res.redirectURL === 'string' ? res.redirectURL : undefined,
      headersSize: optNum(res.headersSize),
      bodySize: optNum(res.bodySize),
    },
    timings: {
      blocked: optNum(timings.blocked),
      dns: optNum(timings.dns),
      connect: optNum(timings.connect),
      send: Math.max(0, num(timings.send)),
      wait: Math.max(0, num(timings.wait)),
      receive: Math.max(0, num(timings.receive)),
      ssl: optNum(timings.ssl),
    },
    serverIPAddress: typeof e.serverIPAddress === 'string' ? e.serverIPAddress : undefined,
  };
}

/** Parse+validate already-decoded HAR text. Pure, so it is unit-testable without a File. */
export function parseHarText(text: string): HarParseResult {
  if (text.trim() === '') return { ok: false, code: 'empty' };

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, code: 'invalidJson' };
  }

  const log = isRecord(json) && isRecord(json.log) ? json.log : undefined;
  const entries = log?.entries;
  if (!Array.isArray(entries)) {
    return { ok: false, code: 'notHar' };
  }

  return {
    ok: true,
    har: {
      log: {
        version: typeof log?.version === 'string' ? log.version : undefined,
        entries: entries.map(normalizeEntry),
      },
    },
  };
}

/** Read + parse a File. Never throws — I/O and parse failures both resolve to a HarParseResult. */
export async function parseHarFile(file: File): Promise<HarParseResult> {
  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, code: 'unreadable' };
  }
  return parseHarText(text);
}

/**
 * Wall-clock span of the whole capture, in ms: from the earliest entry's start to the
 * latest entry's end (start + its own total time). This is the denominator the waterfall
 * bars are drawn against, so a request's bar length reflects how much of the *whole
 * capture* it accounted for, not just its own duration in isolation — comparable at a
 * glance across every row.
 *
 * Falls back to the slowest single entry's time when no entry has a parseable
 * `startedDateTime` (technically required by the HAR spec, but real-world captures do
 * occasionally omit or mangle it).
 */
export function computeCaptureSpanMs(entries: HarEntry[]): number {
  let minStart = Infinity;
  let maxEnd = -Infinity;
  for (const e of entries) {
    const start = e.startedDateTime ? new Date(e.startedDateTime).getTime() : NaN;
    if (Number.isNaN(start)) continue;
    const end = start + Math.max(0, e.time);
    if (start < minStart) minStart = start;
    if (end > maxEnd) maxEnd = end;
  }
  if (Number.isFinite(minStart) && Number.isFinite(maxEnd) && maxEnd > minStart) {
    return maxEnd - minStart;
  }
  const slowest = entries.reduce((max, e) => Math.max(max, e.time), 0);
  return slowest > 0 ? slowest : 1;
}

/** Human-readable byte size; `-1`/unknown sizes (common in real captures) show as "–". */
export function humanBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '–';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** The response mimeType without a trailing `; charset=...` (kept short for the table cell). */
export function shortMimeType(mimeType: string): string {
  if (!mimeType) return '–';
  const semi = mimeType.indexOf(';');
  return (semi === -1 ? mimeType : mimeType.slice(0, semi)).trim() || '–';
}

/** `820 ms` below one second, `1.3 s` at or above it. */
export function formatDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '–';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export type StatusClass = 'info' | 'success' | 'redirect' | 'clientError' | 'serverError' | 'unknown';

/** Bucket an HTTP status code into a display class (informational/success/redirect/error). */
export function statusClass(status: number): StatusClass {
  if (status >= 100 && status < 200) return 'info';
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 400) return 'redirect';
  if (status >= 400 && status < 500) return 'clientError';
  if (status >= 500 && status < 600) return 'serverError';
  return 'unknown';
}

function decodeBase64ToText(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}

export type BodyKind = 'empty' | 'json' | 'text' | 'binary';

export interface PreparedBody {
  kind: BodyKind;
  /** Ready-to-display text. Pretty-printed (2-space indent) when `kind === 'json'`. */
  content: string;
}

/**
 * Prepare a HAR body (request postData.text or response content.text) for display:
 * decode base64 when the entry says so, and pretty-print when the mimeType says JSON.
 * Never throws — a body that claims to be JSON/base64 but isn't just falls back to the
 * next-best display (raw text, or a "binary content" placeholder).
 */
export function prepareBody(
  text: string | undefined,
  mimeType: string,
  encoding?: string
): PreparedBody {
  if (!text) return { kind: 'empty', content: '' };

  let decoded = text;
  if (encoding === 'base64') {
    try {
      decoded = decodeBase64ToText(text);
    } catch {
      return { kind: 'binary', content: '' };
    }
  }

  if (mimeType.toLowerCase().includes('json')) {
    try {
      const parsed = JSON.parse(decoded);
      return { kind: 'json', content: JSON.stringify(parsed, null, 2) };
    } catch {
      return { kind: 'text', content: decoded };
    }
  }

  return { kind: 'text', content: decoded };
}
