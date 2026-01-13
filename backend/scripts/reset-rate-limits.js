#!/usr/bin/env node

/**
 * Development Script: Reset Rate Limits
 * 
 * This script helps with testing by providing information about rate limits.
 * Since express-rate-limit uses in-memory storage, rate limits reset when
 * the server restarts. This script provides helpful information.
 * 
 * Usage:
 *   node scripts/reset-rate-limits.js
 */

console.log('📊 Rate Limit Reset Helper');
console.log('==========================\n');

console.log('ℹ️  Rate limits are stored in memory and reset automatically when the server restarts.');
console.log('');

console.log('To reset rate limits during testing:');
console.log('');
console.log('Option 1: Restart the backend server');
console.log('  cd backend');
console.log('  npm run dev');
console.log('');

console.log('Option 2: Wait for the rate limit window to reset');
console.log('  Rate limit window: 15 minutes');
console.log('  Development limits:');
console.log('    - Auth endpoints: 100 requests per 15 minutes');
console.log('    - General endpoints: 1000 requests per 15 minutes');
console.log('');

console.log('Option 3: Use the development endpoint (if server is running)');
console.log('  POST http://localhost:4000/dev/reset-rate-limits');
console.log('  (Note: This endpoint only provides info, full reset requires restart)');
console.log('');

console.log('✅ Current Rate Limit Configuration:');
console.log('  Development Mode:');
console.log('    - Auth endpoints: 100 requests / 15 min');
console.log('    - General endpoints: 1000 requests / 15 min');
console.log('  Production Mode:');
console.log('    - Auth endpoints: 5 requests / 15 min');
console.log('    - General endpoints: 100 requests / 15 min');
console.log('');
