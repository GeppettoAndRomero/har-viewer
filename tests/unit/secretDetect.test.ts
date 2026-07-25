import { describe, it, expect } from 'vitest';
import {
  classifyHeader,
  classifyQueryParam,
  classifyCookie,
  scanEntrySecrets,
} from '@/utils/secretDetect';
import type { HarEntry } from '@/utils/harParse';

describe('classifyHeader', () => {
  it('flags an Authorization: Bearer header', () => {
    expect(classifyHeader('Authorization', 'Bearer abc123')).toContain('bearerToken');
  });

  it('is case-insensitive on the header name', () => {
    expect(classifyHeader('authorization', 'Bearer abc123')).toContain('bearerToken');
  });

  it('does not flag a non-Bearer Authorization header', () => {
    expect(classifyHeader('Authorization', 'Basic dXNlcjpwYXNz')).not.toContain('bearerToken');
  });

  it('flags a JWT carried as a Bearer token', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    const kinds = classifyHeader('Authorization', `Bearer ${jwt}`);
    expect(kinds).toContain('bearerToken');
    expect(kinds).toContain('jwt');
  });

  it('flags a raw JWT with no Bearer prefix (e.g. a custom header)', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    expect(classifyHeader('X-Id-Token', jwt)).toContain('jwt');
  });

  it('does not flag an ordinary 3-segment string that is not base64url-shaped JWT', () => {
    expect(classifyHeader('X-Custom', 'not.a.jwt!')).not.toContain('jwt');
  });

  it('flags an AWS access key', () => {
    expect(classifyHeader('X-Amz-Key', 'AKIAABCDEFGHIJKLMNOP')).toContain('awsKey');
  });

  it('flags a GitHub personal-access token', () => {
    expect(classifyHeader('X-Token', 'ghp_' + 'a'.repeat(36))).toContain('githubToken');
  });

  it('flags an sk- prefixed API key', () => {
    expect(classifyHeader('X-Api-Key', 'sk-' + 'a'.repeat(20))).toContain('apiKeyPrefix');
  });

  it('does not false-positive on ordinary words containing "sk-"', () => {
    expect(classifyHeader('X-Note', 'risk-assessment-report')).not.toContain('apiKeyPrefix');
  });

  it('flags the presence of a Cookie header regardless of its value', () => {
    expect(classifyHeader('Cookie', 'theme=dark')).toContain('cookieHeader');
  });

  it('flags the presence of a Set-Cookie header regardless of its value', () => {
    expect(classifyHeader('Set-Cookie', 'lang=en; Path=/')).toContain('cookieHeader');
  });

  it('returns no kinds for an ordinary header', () => {
    expect(classifyHeader('Accept', 'text/html')).toEqual([]);
  });
});

describe('classifyQueryParam', () => {
  it('flags known sensitive query-parameter names regardless of value', () => {
    expect(classifyQueryParam('api_key', 'anything')).toContain('secretQueryParam');
    expect(classifyQueryParam('access_token', 'anything')).toContain('secretQueryParam');
    expect(classifyQueryParam('token', 'anything')).toContain('secretQueryParam');
  });

  it('is case-insensitive on the parameter name', () => {
    expect(classifyQueryParam('API_KEY', 'anything')).toContain('secretQueryParam');
  });

  it('does not flag an unrelated parameter name with an ordinary value', () => {
    expect(classifyQueryParam('page', '2')).toEqual([]);
  });

  it('also flags a value-shape match on an unrelated parameter name', () => {
    expect(classifyQueryParam('debug', 'AKIAABCDEFGHIJKLMNOP')).toContain('awsKey');
  });
});

describe('classifyCookie', () => {
  it('flags a cookie value that looks like a JWT', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    expect(classifyCookie('session', jwt)).toContain('jwt');
  });

  it('does not flag an ordinary cookie value', () => {
    expect(classifyCookie('theme', 'dark')).toEqual([]);
  });
});

function baseEntry(): HarEntry {
  return {
    time: 10,
    request: { method: 'GET', url: 'https://example.com/', headers: [], queryString: [], cookies: [] },
    response: { status: 200, headers: [], cookies: [], content: { size: 0, mimeType: '' } },
    timings: { send: 0, wait: 0, receive: 0 },
  };
}

describe('scanEntrySecrets', () => {
  it('finds no secrets in a plain request', () => {
    expect(scanEntrySecrets(baseEntry())).toEqual([]);
  });

  it('finds an Authorization: Bearer header on the request', () => {
    const e = baseEntry();
    e.request.headers = [{ name: 'Authorization', value: 'Bearer sometoken' }];
    const matches = scanEntrySecrets(e);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      kind: 'bearerToken',
      location: 'requestHeader',
      name: 'Authorization',
    });
  });

  it('finds a sensitive query parameter', () => {
    const e = baseEntry();
    e.request.queryString = [{ name: 'access_token', value: 'xyz' }];
    const matches = scanEntrySecrets(e);
    expect(matches).toEqual([
      { kind: 'secretQueryParam', location: 'queryParam', name: 'access_token', value: 'xyz' },
    ]);
  });

  it('finds matches in response cookies', () => {
    const e = baseEntry();
    e.response.cookies = [{ name: 'id_token', value: 'AKIAABCDEFGHIJKLMNOP' }];
    const matches = scanEntrySecrets(e);
    expect(matches).toEqual([
      { kind: 'awsKey', location: 'responseCookie', name: 'id_token', value: 'AKIAABCDEFGHIJKLMNOP' },
    ]);
  });

  it('never scans the request or response body', () => {
    // scanEntrySecrets only reads headers/queryString/cookies; postData/content are
    // not part of its input shape, so a body containing an obvious secret can't leak
    // into the result even if present on the entry.
    const e = baseEntry();
    e.request.postData = { mimeType: 'application/json', text: '{"token":"ghp_' + 'a'.repeat(36) + '"}' };
    expect(scanEntrySecrets(e)).toEqual([]);
  });
});
