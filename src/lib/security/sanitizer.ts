/**
 * Security and Data Sanitization Utility
 * Strictly enforces input boundaries, XSS neutralization, and memory safety.
 */

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_MESSAGES_COUNT = 15000;
export const MAX_MESSAGE_TEXT_LENGTH = 10000; // 10k chars per message

/**
 * Escapes potentially dangerous HTML entities.
 * Note: React inherently escapes text interpolations, but this is used
 * for defensive input normalization before any processing.
 */
export function sanitizeText(raw: string): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips non-printable ASCII control characters (preserving newlines, tabs, and carriage returns).
 */
export function stripControlCharacters(input: string): string {
  if (typeof input !== 'string') return '';
  // Keep \t (0x09), \n (0x0A), \r (0x0D), and standard characters
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Validates whether an imported file matches allowed text mime/types and size.
 */
export function validateImportFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 10MB local processing safety limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  const validExtensions = ['.txt', '.log', '.json', '.chat'];
  const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  const isTextMime = !file.type || file.type.startsWith('text/') || file.type.includes('json');

  if (!hasValidExt && !isTextMime) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload plain text (.txt, .log) or JSON exports.',
    };
  }

  return { valid: true };
}

/**
 * Deep freezes an object defensively if needed.
 */
export function safeTruncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}
