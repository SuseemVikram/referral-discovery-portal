const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

// Optimize Prisma connection pool for production
// Supabase connection string should use pooler: ?pgbouncer=true&connection_limit=1
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool optimization
  // For Supabase, use transaction mode in connection string: ?pgbouncer=true
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;

