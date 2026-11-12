import DOMPurify from 'isomorphic-dompurify';

/**
 * Configuration options for DOMPurify sanitization
 */
const SANITIZE_CONFIG = {
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

// Ensure all links open safely in a new tab with noopener noreferrer
if (typeof DOMPurify.addHook === 'function') {
  DOMPurify.addHook('afterSanitizeAttributes', (node: any) => {
    if (node && node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/**
 * Sanitizes HTML content using DOMPurify with strict XSS protections
 */
export function sanitizeHtml(dirtyHtml: string | undefined | null): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';
  const sanitized = DOMPurify.sanitize(dirtyHtml, SANITIZE_CONFIG);
  return typeof sanitized === 'string' ? sanitized : String(sanitized);
}

/**
 * Checks if a string contains HTML tags
 */
export function containsHtmlTags(str: string): boolean {
  return /<(?:p|div|ul|ol|li|h[1-6]|br|strong|b|em|i|u|s|a|span|blockquote|hr)\b[^>]*>/i.test(str);
}

/**
 * Checks whether an HTML string has visible non-whitespace content
 */
export function isHtmlEmpty(html: string | undefined | null): boolean {
  if (!html || typeof html !== 'string') return true;
  const stripped = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return stripped.length === 0;
}

/**
 * Safely strips all HTML tags to produce a clean plain-text string
 * Suitable for SEO meta description, JSON-LD schema, and search indexes
 */
export function stripHtmlToPlainText(html: string | undefined | null): string {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converts legacy plain text or markdown formatting to semantic HTML,
 * or preserves and sanitizes existing HTML descriptions.
 */
export function normalizeDescriptionToHtml(raw: string | undefined | null): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  // 1. If it already contains HTML block/formatting tags, sanitize directly
  if (containsHtmlTags(trimmed)) {
    // If it has markdown bold or italic mixed inside HTML (e.g. <p>**bold**</p>), convert them
    let processed = trimmed
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, '$1<em>$2</em>$3');
    return sanitizeHtml(processed);
  }

  // 2. Otherwise, treat as legacy plain text or markdown
  // Split into paragraphs by double newlines or multiple newlines
  const blocks = trimmed.split(/\n{2,}/);
  const htmlBlocks = blocks.map((block) => parseBlockToHtml(block));

  return sanitizeHtml(htmlBlocks.filter(Boolean).join(''));
}

/**
 * Parses a single block of plain text or markdown into semantic HTML
 */
function parseBlockToHtml(block: string): string {
  const lines = block.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return '';

  const output: string[] = [];
  let currentListType: 'ul' | 'ol' | null = null;
  let currentListItems: string[] = [];
  let currentParagraphLines: string[] = [];

  const flushList = () => {
    if (currentListType && currentListItems.length > 0) {
      output.push(`<${currentListType}>${currentListItems.join('')}</${currentListType}>`);
      currentListItems = [];
      currentListType = null;
    }
  };

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      output.push(`<p>${currentParagraphLines.join('<br>')}</p>`);
      currentParagraphLines = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith('### ')) {
      flushList();
      flushParagraph();
      output.push(`<h3>${formatInlineMarkdown(line.slice(4))}</h3>`);
    } else if (line.startsWith('## ')) {
      flushList();
      flushParagraph();
      output.push(`<h2>${formatInlineMarkdown(line.slice(3))}</h2>`);
    } else if (line.startsWith('# ')) {
      flushList();
      flushParagraph();
      output.push(`<h2>${formatInlineMarkdown(line.slice(2))}</h2>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      flushParagraph();
      if (currentListType !== 'ul') {
        flushList();
        currentListType = 'ul';
      }
      currentListItems.push(`<li>${formatInlineMarkdown(line.replace(/^[-*]\s+/, ''))}</li>`);
    } else if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      if (currentListType !== 'ol') {
        flushList();
        currentListType = 'ol';
      }
      currentListItems.push(`<li>${formatInlineMarkdown(line.replace(/^\d+\.\s+/, ''))}</li>`);
    } else {
      flushList();
      currentParagraphLines.push(formatInlineMarkdown(line));
    }
  }

  flushList();
  flushParagraph();

  return output.join('');
}

/**
 * Formats inline markdown (bold, italic, links)
 */
function formatInlineMarkdown(text: string): string {
  let result = escapeHtml(text);

  // Markdown bold: **text** or __text__
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Markdown italic: *text* or _text_
  result = result.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, '$1<em>$2</em>$3');
  result = result.replace(/(^|[^_])_([^_]+)_([^_]|$)/g, '$1<em>$2</em>$3');

  // Markdown links: [title](url)
  result = result.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return result;
}

/**
 * Escape basic HTML characters in plain text to avoid accidental injection
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
