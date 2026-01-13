#!/usr/bin/env node

/**
 * Development Script: Testing Helper
 * 
 * This script provides helpful information for testing and development.
 * 
 * Usage:
 *   node scripts/clear-test-data.js
 */

console.log('🧪 Testing Helper Script');
console.log('========================\n');

console.log('This script provides information for testing.\n');

console.log('📝 Rate Limit Information:');
console.log('  - Rate limits reset when the server restarts');
console.log('  - Development mode has higher limits for testing');
console.log('  - Run: npm run reset-limits (for rate limit info)');
console.log('');

console.log('🔄 To reset rate limits:');
console.log('  1. Restart the backend server: npm run dev');
console.log('  2. Or wait 15 minutes for the window to reset');
console.log('');

console.log('🧹 Database Testing:');
console.log('  - Use Prisma Studio to view/test data: npx prisma studio');
console.log('  - Reset database (WARNING: deletes all data):');
console.log('    npx prisma migrate reset');
console.log('');

console.log('📊 Environment Variables:');
console.log('  - Check .env file for required variables');
console.log('  - Backend requires: DATABASE_URL, JWT_SECRET');
console.log('  - Frontend requires: NEXT_PUBLIC_API_URL, AUTH_SECRET');
console.log('');
