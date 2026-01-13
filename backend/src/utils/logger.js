/**
 * Simple logger utility with request ID support
 * In production, replace with proper logging library (Winston, Pino, etc.)
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Format log entry with request ID if available
 */
function formatLog(level, requestId, ...args) {
  const timestamp = new Date().toISOString();
  const requestIdPrefix = requestId ? `[${requestId}]` : '';
  return `[${timestamp}] [${level}] ${requestIdPrefix}`;
}

const logger = {
  info: (requestIdOrMessage, ...args) => {
    // Support both: logger.info(req.id, 'message') and logger.info('message')
    let requestId = null;
    let messageArgs = args;
    
    if (typeof requestIdOrMessage === 'string' && requestIdOrMessage.length === 36) {
      // Looks like a UUID, treat as request ID
      requestId = requestIdOrMessage;
    } else {
      // First arg is the message
      messageArgs = [requestIdOrMessage, ...args];
    }
    
    if (isDevelopment || process.env.LOG_LEVEL === 'debug') {
      console.log(formatLog('INFO', requestId), ...messageArgs);
    }
  },

  error: (requestIdOrMessage, ...args) => {
    // Support both: logger.error(req.id, 'message') and logger.error('message')
    let requestId = null;
    let messageArgs = args;
    
    if (typeof requestIdOrMessage === 'string' && requestIdOrMessage.length === 36) {
      requestId = requestIdOrMessage;
    } else {
      messageArgs = [requestIdOrMessage, ...args];
    }
    
    // Errors are always logged
    console.error(formatLog('ERROR', requestId), ...messageArgs);
  },

  warn: (requestIdOrMessage, ...args) => {
    let requestId = null;
    let messageArgs = args;
    
    if (typeof requestIdOrMessage === 'string' && requestIdOrMessage.length === 36) {
      requestId = requestIdOrMessage;
    } else {
      messageArgs = [requestIdOrMessage, ...args];
    }
    
    if (isDevelopment || process.env.LOG_LEVEL === 'debug') {
      console.warn(formatLog('WARN', requestId), ...messageArgs);
    }
  },

  debug: (requestIdOrMessage, ...args) => {
    let requestId = null;
    let messageArgs = args;
    
    if (typeof requestIdOrMessage === 'string' && requestIdOrMessage.length === 36) {
      requestId = requestIdOrMessage;
    } else {
      messageArgs = [requestIdOrMessage, ...args];
    }
    
    if (isDevelopment || process.env.LOG_LEVEL === 'debug') {
      console.debug(formatLog('DEBUG', requestId), ...messageArgs);
    }
  },
};

module.exports = logger;

