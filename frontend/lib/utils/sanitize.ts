/**
 * Input Sanitization Utilities
 * Uses DOMPurify to prevent XSS attacks
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML string to prevent XSS
 * Use this when rendering user-generated content as HTML
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: Return as-is (Next.js escapes by default)
    return dirty;
  }
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize text content (removes HTML tags)
 * Use this for text fields that should only contain plain text
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  if (typeof window === 'undefined') {
    // Server-side: Remove HTML tags with regex (simple approach)
    return text.replace(/<[^>]*>/g, '');
  }
  
  // Client-side: Use DOMPurify
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize URL to prevent XSS in links
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  // Remove javascript: and data: protocols
  const cleaned = url.replace(/^(javascript|data):/i, '');
  
  // Only allow http, https, mailto, tel protocols
  if (!cleaned.match(/^(https?|mailto|tel):/i)) {
    return '';
  }
  
  return cleaned;
}
