/**
 * File-type validation for the HAR viewer.
 *
 * Accepts `.har` files (HAR 1.2 is plain JSON — see harParse.ts for the actual
 * parse/validate step). Validation returns a stable machine `code` (not a message) so
 * the UI can render the localized string for the current locale.
 */

export type ValidationCode = 'wrongType';

export interface ValidationResult {
  valid: boolean;
  code?: ValidationCode;
}

export const ALLOWED_EXTENSIONS = ['.har'] as const;

// Browsers rarely register a specific MIME type for .har; it is commonly reported as
// empty, generic JSON, or plain text. Extension is authoritative — a non-empty MIME
// only needs to be one of these when the extension itself is missing/wrong.
const ALLOWED_MIME_TYPES = ['application/json', 'text/json', 'text/plain'];

/** Lower-cased extension including the dot, or '' when the name has none. */
export function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : '';
}

export function validateFileExtension(fileName: string): ValidationResult {
  const ext = getExtension(fileName);
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext)
    ? { valid: true }
    : { valid: false, code: 'wrongType' };
}

/**
 * A file is accepted when its extension is `.har`. When the extension is not allowed,
 * it is still accepted if the browser reported a JSON/text MIME type (covers a HAR
 * exported or renamed without its extension).
 */
export function validateFile(file: File): ValidationResult {
  if (validateFileExtension(file.name).valid) {
    return { valid: true };
  }
  if (file.type && ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return { valid: true };
  }
  return { valid: false, code: 'wrongType' };
}
