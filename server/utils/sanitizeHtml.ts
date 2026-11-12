import DOMPurify from 'isomorphic-dompurify';

const SERVER_SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'span', 'blockquote', 'hr',
    'sub', 'sup', 'code', 'pre'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'title'],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|sms):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ADD_ATTR: ['target', 'rel'],
};

/**
 * Server-side HTML sanitizer for product descriptions
 */
export function sanitizeProductDescriptionServer(raw: string | undefined | null): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const sanitized = DOMPurify.sanitize(trimmed, SERVER_SANITIZE_CONFIG);
  return typeof sanitized === 'string' ? sanitized : String(sanitized);
}

