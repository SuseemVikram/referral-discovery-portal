/**
 * Input sanitization utilities
 * Prevents XSS and ensures safe input handling
 */

/**
 * Sanitize string input - remove HTML tags and escape special characters
 * Note: For MVP, we use a simple approach. For production, consider using DOMPurify or similar.
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Escape HTML entities
  const htmlEscape = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  sanitized = sanitized.replace(/[&<>"'/]/g, (char) => htmlEscape[char] || char);

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize text fields (company, role, linkedin, etc.)
 * Limits length and removes dangerous characters
 */
function sanitizeTextField(input, maxLength = 255) {
  if (!input || typeof input !== 'string') {
    return input || '';
  }

  let sanitized = sanitizeString(input);

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitize URL (for LinkedIn, etc.)
 */
function sanitizeUrl(input) {
  if (!input || typeof input !== 'string') {
    return input || '';
  }

  let sanitized = input.trim();

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Basic URL validation - must start with http:// or https://
  if (sanitized && !sanitized.match(/^https?:\/\//i)) {
    // If it doesn't start with http:// or https://, prepend https://
    sanitized = 'https://' + sanitized;
  }

  // Limit length
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500);
  }

  return sanitized;
}

/**
 * Sanitize query parameters
 */
function sanitizeQueryParam(input) {
  if (!input || typeof input !== 'string') {
    return input || '';
  }

  // Remove HTML tags and escape
  return sanitizeString(input.trim());
}

/**
 * Sanitize array of strings (for roles, skills)
 */
function sanitizeStringArray(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((item) => typeof item === 'string' && item.trim().length > 0)
    .map((item) => sanitizeString(item.trim()))
    .filter((item) => item.length > 0 && item.length <= 100); // Max 100 chars per item
}

module.exports = {
  sanitizeString,
  sanitizeTextField,
  sanitizeUrl,
  sanitizeQueryParam,
  sanitizeStringArray,
};
