import { describe, it, expect } from 'vitest';
import { validateFileExtension, validateFile, getExtension } from '@/utils/fileValidation';

// Minimal File-like stub (only the fields the validators read).
const f = (name: string, type = '', size = 1): File =>
  ({ name, type, size }) as unknown as File;

describe('getExtension', () => {
  it('returns the lower-cased extension including the dot', () => {
    expect(getExtension('capture.HAR')).toBe('.har');
  });

  it('returns empty string when there is no extension', () => {
    expect(getExtension('capture')).toBe('');
  });
});

describe('validateFileExtension', () => {
  it('accepts .har regardless of case', () => {
    expect(validateFileExtension('x.HAR').valid).toBe(true);
  });

  it('rejects an unsupported extension', () => {
    expect(validateFileExtension('x.json').valid).toBe(false);
    expect(validateFileExtension('x.json').code).toBe('wrongType');
  });
});

describe('validateFile', () => {
  it('accepts a .har file regardless of reported MIME type', () => {
    expect(validateFile(f('capture.har', '')).valid).toBe(true);
    expect(validateFile(f('capture.har', 'application/json')).valid).toBe(true);
  });

  it('accepts a JSON-typed file with no/odd extension (renamed export)', () => {
    expect(validateFile(f('capture.json', 'application/json')).valid).toBe(true);
    expect(validateFile(f('capture', 'text/plain')).valid).toBe(true);
  });

  it('rejects an unrelated file type', () => {
    expect(validateFile(f('photo.png', 'image/png')).valid).toBe(false);
  });
});
