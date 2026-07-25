/**
 * Secret/token detection — the tool's core privacy hook (issue #86).
 *
 * A HAR capture can contain live session tokens: this is exactly how the 2023 Okta
 * support-case breach happened — a customer uploaded a HAR file (containing valid
 * session cookies) to a support ticket, and an attacker who gained access to that
 * support system used the cookie inside it to hijack sessions. Nothing here is
 * hypothetical scare-mongering; it is the reason this tool scans on load.
 *
 * Scope, deliberately narrow: this scans ONLY header values, query-string parameter
 * values, and cookie values. Request/response BODIES are explicitly out of scope for
 * this first version (a future version may extend to bodies; see issue #86). Patterns
 * are hand-authored, not a general secret-scanning library — just the common,
 * recognizable shapes a browser DevTools capture actually carries.
 *
 * Matches are surfaced, never redacted: the point is local visibility ("is there
 * something sensitive in this file before I share it"), not censorship. A "sanitize and
 * re-export" sibling tool is explicitly out of scope — see Cloudflare's existing
 * client-side har-sanitizer for that job.
 */

import type { HarEntry } from './harParse';

export type SecretKind =
  | 'bearerToken'
  | 'jwt'
  | 'awsKey'
  | 'githubToken'
  | 'apiKeyPrefix'
  | 'secretQueryParam'
  | 'cookieHeader';

export type SecretLocation =
  | 'requestHeader'
  | 'responseHeader'
  | 'queryParam'
  | 'requestCookie'
  | 'responseCookie';

export interface SecretMatch {
  kind: SecretKind;
  location: SecretLocation;
  name: string;
  value: string;
}

// A JWT is three base64url segments separated by dots. In practice it always starts
// with "eyJ" — the base64url encoding of `{"`, which every JWT header JSON begins with.
const JWT_RE = /^eyJ[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}$/;
// AWS access key IDs: "AKIA" + 16 uppercase-alnum chars (20 chars total).
const AWS_KEY_RE = /\bAKIA[0-9A-Z]{16}\b/;
// GitHub personal-access / OAuth tokens: ghp_/gho_ + a long alphanumeric run.
const GITHUB_TOKEN_RE = /\b(?:ghp|gho)_[A-Za-z0-9]{20,}\b/;
// "sk-" is a common secret/API-key convention (OpenAI, Stripe, etc.). Require a long
// trailing run so ordinary words ("desk-top", "ask-me") never match.
const API_KEY_PREFIX_RE = /\bsk-[A-Za-z0-9]{16,}\b/;

const SECRET_QUERY_PARAM_NAMES = new Set(['api_key', 'access_token', 'token']);

/** Candidate strings to test against the value-shape patterns: the raw value, and — when
 *  it looks like `Bearer <token>` — the token part alone (a Bearer token is very often
 *  itself a JWT or an API key, and the shape patterns are anchored to the whole string). */
function candidateStrings(value: string): string[] {
  const trimmed = value.trim();
  const out = [trimmed];
  const bearer = /^bearer\s+(.+)$/i.exec(trimmed);
  if (bearer) out.push(bearer[1].trim());
  return out;
}

function scanValueShapes(value: string): SecretKind[] {
  const kinds = new Set<SecretKind>();
  for (const candidate of candidateStrings(value)) {
    if (JWT_RE.test(candidate)) kinds.add('jwt');
    if (AWS_KEY_RE.test(candidate)) kinds.add('awsKey');
    if (GITHUB_TOKEN_RE.test(candidate)) kinds.add('githubToken');
    if (API_KEY_PREFIX_RE.test(candidate)) kinds.add('apiKeyPrefix');
  }
  return [...kinds];
}

/** Classify a single header name/value pair (request or response headers alike). */
export function classifyHeader(name: string, value: string): SecretKind[] {
  const kinds = new Set(scanValueShapes(value));
  const lname = name.toLowerCase();
  if (lname === 'authorization' && /^bearer\s+\S+/i.test(value.trim())) {
    kinds.add('bearerToken');
  }
  if (lname === 'cookie' || lname === 'set-cookie') {
    kinds.add('cookieHeader');
  }
  return [...kinds];
}

/** Classify a single query-string parameter name/value pair. */
export function classifyQueryParam(name: string, value: string): SecretKind[] {
  const kinds = new Set(scanValueShapes(value));
  if (SECRET_QUERY_PARAM_NAMES.has(name.toLowerCase())) {
    kinds.add('secretQueryParam');
  }
  return [...kinds];
}

/** Classify a single cookie name/value pair. The header-presence flag (`cookieHeader`)
 *  is raised separately by `classifyHeader` when a Cookie/Set-Cookie header is present;
 *  this only looks at the cookie's own value shape. */
export function classifyCookie(_name: string, value: string): SecretKind[] {
  return scanValueShapes(value);
}

/** Scan one HAR entry's headers/query-params/cookies for every matching secret. Bodies
 *  are never scanned — see the module doc for why. */
export function scanEntrySecrets(entry: HarEntry): SecretMatch[] {
  const out: SecretMatch[] = [];

  for (const h of entry.request.headers) {
    for (const kind of classifyHeader(h.name, h.value)) {
      out.push({ kind, location: 'requestHeader', name: h.name, value: h.value });
    }
  }
  for (const h of entry.response.headers) {
    for (const kind of classifyHeader(h.name, h.value)) {
      out.push({ kind, location: 'responseHeader', name: h.name, value: h.value });
    }
  }
  for (const q of entry.request.queryString) {
    for (const kind of classifyQueryParam(q.name, q.value)) {
      out.push({ kind, location: 'queryParam', name: q.name, value: q.value });
    }
  }
  for (const c of entry.request.cookies) {
    for (const kind of classifyCookie(c.name, c.value)) {
      out.push({ kind, location: 'requestCookie', name: c.name, value: c.value });
    }
  }
  for (const c of entry.response.cookies) {
    for (const kind of classifyCookie(c.name, c.value)) {
      out.push({ kind, location: 'responseCookie', name: c.name, value: c.value });
    }
  }

  return out;
}
