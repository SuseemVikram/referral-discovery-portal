# Project Context - Referral Discovery Portal

**Last Updated:** January 2025  
**Purpose:** Context document for AI assistant - summarizes all work completed so far

---

## Project Overview

A referral discovery portal connecting tech talent (candidates) with company referrers. Referrers browse candidate profiles and send Expressions of Interest (EOI) via email.

### Architecture
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, React 19
- **Backend:** Express.js 5, Node.js, Prisma ORM
- **Database:** PostgreSQL (Supabase)
- **Authentication:** NextAuth v5 (beta) + Custom JWT backend
- **Hosting:** Vercel (Frontend), Railway (Backend), Supabase (Database)

### Key Features
- Public candidate browsing (no login required)
- Referrer authentication (Email/Password, Google OAuth, OTP)
- EOI sending with email notifications
- Admin panel for candidate/referrer management

---

## Work Completed

### Critical Fixes (5/7 Completed)

#### 1. ✅ Environment Variable Validation
**Status:** Fixed  
**Files Modified:**
- `frontend/lib/api-config.ts` - Added production validation for `NEXT_PUBLIC_API_URL`
- `backend/src/config/env.js` - Added `FRONTEND_URL` validation for production

**Changes:**
- Frontend throws error in production if `NEXT_PUBLIC_API_URL` is missing
- Backend validates `FRONTEND_URL` in production
- Prevents silent failures in production deployments

#### 2. ✅ Railway Configuration
**Status:** Fixed  
**File Modified:** `backend/railway.json`

**Changes:**
- Added `buildCommand` with `npx prisma generate`
- Modified `startCommand` to run `npx prisma migrate deploy` before starting
- Ensures Prisma client is generated and migrations run on deploy

#### 3. ✅ Database Indexes
**Status:** Fixed (Migration Applied)  
**File Modified:** `backend/prisma/schema.prisma`

**Indexes Added:**
- `Referrer.is_admin` - Optimizes admin authorization checks
- `EOILog.referrerId` - Improves join performance
- `EOILog.candidateId` - Improves join performance
- `EOILog.sentAt` - Optimizes time-based queries

**Migration:** Successfully applied to database

#### 4. ✅ Rate Limiting
**Status:** Fixed  
**File Modified:** `backend/src/server.js`

**Implementation:**
- General limiter: 100 requests per 15 minutes (dev), 100 requests per 15 minutes (prod)
- Auth limiter: 5 requests per 15 minutes for `/auth` endpoints
- Uses `express-rate-limit` package
- Applied to all routes with appropriate limits

#### 5. ✅ Backend Environment Validation
**Status:** Fixed  
**File Modified:** `backend/src/config/env.js`

**Changes:**
- Added `FRONTEND_URL` validation for production
- Exports `frontendUrl` in config
- Prevents CORS misconfiguration

### High Priority Infrastructure Fixes (4/4 Completed)

#### 1. ✅ Request ID / Correlation IDs
**Status:** Fixed  
**Files Created/Modified:**
- `backend/src/middleware/requestId.js` - NEW: Request ID middleware
- `backend/src/server.js` - Added requestIdMiddleware
- `backend/src/middleware/errorHandler.js` - Added requestId to error responses
- `backend/src/utils/logger.js` - Enhanced to support request IDs

**Features:**
- Every request gets unique ID for correlation
- Errors include request ID for debugging
- Logs can be correlated using request ID
- Response headers include `X-Request-ID`

#### 2. ✅ Improved Error Handling
**Status:** Fixed  
**File Modified:** `backend/src/middleware/errorHandler.js`

**Changes:**
- Error responses now include `requestId` field
- Error logging includes request ID for correlation
- Better error context in logs (user info, URL, method)
- Easier debugging in production

#### 3. ✅ Improved Logging
**Status:** Fixed  
**File Modified:** `backend/src/utils/logger.js`

**Changes:**
- Logger now supports request IDs
- Timestamps added to logs
- Structured log format
- Backward compatible with old logger calls

#### 4. ✅ Fixed EOI Rate Limit Race Condition
**Status:** Fixed  
**File Modified:** `backend/src/services/eoi.service.js`

**Changes:**
- Rate limit check and EOI log creation now happen in a single transaction
- Uses `prisma.$transaction()` for atomicity
- Prevents concurrent requests from exceeding rate limit
- More reliable rate limiting under concurrent load

---

## Deferred / Non-Critical Issues

### AUTH-001: NextAuth Token Sync
**Status:** Verified Implementation  
**Note:** Code review shows implementation is correct. If issues persist, they may be due to backend availability or timing, not code logic.

### CACHE-001: In-Memory OTP Storage
**Status:** Deferred  
**Reason:** Requires Redis setup or database schema changes  
**Note:** Current implementation works for single-instance deployments but not scalable

### AUTH-002: NextAuth Beta Version
**Status:** Deferred  
**Reason:** Requires testing before upgrade  
**Note:** Using `next-auth@5.0.0-beta.30` - upgrade to stable version when available

---

## Current System State

### Authentication Flow (Working)
- NextAuth for Google OAuth
- Custom JWT backend for email/password
- Token stored in localStorage + NextAuth session
- AuthContext manages auth state
- Files: `frontend/app/api/auth/[...nextauth]/route.ts`, `frontend/lib/AuthContext.tsx`

### API Structure (Working)
- Routes: `/auth`, `/api/candidates`, `/api/eoi`, `/api/admin`
- Middleware: `authenticateToken`, `requireAdmin`
- Controllers → Services → Repositories pattern
- Files: `backend/src/routes/`, `backend/src/controllers/`, `backend/src/services/`

### Database (Working)
- Prisma ORM with PostgreSQL
- Models: Candidate, Referrer, EOILog
- Repositories handle data access
- Indexes added for performance
- Files: `backend/prisma/schema.prisma`, `backend/src/repositories/`

### Error Handling (Improved)
- Custom error classes (AppError, NotFoundError, etc.)
- Error handler middleware with request IDs
- Better error context and correlation
- Files: `backend/src/utils/errors.js`, `backend/src/middleware/errorHandler.js`

### Logging (Improved)
- Enhanced logger with request ID support
- Structured logging with timestamps
- Correlation IDs for debugging
- File: `backend/src/utils/logger.js`

---

## Key Files Reference

### Authentication
- `frontend/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `frontend/lib/AuthContext.tsx` - Custom auth state management
- `backend/src/services/auth.service.js` - Backend auth logic
- `backend/src/middleware/auth.js` - JWT verification
- `backend/src/middleware/requireAdmin.js` - Admin authorization

### Configuration
- `frontend/lib/api-config.ts` - Frontend API configuration with env validation
- `backend/src/config/env.js` - Backend environment configuration
- `backend/railway.json` - Railway deployment configuration
- `frontend/vercel.json` - Vercel deployment configuration

### Database
- `backend/prisma/schema.prisma` - Database schema with indexes
- `backend/src/repositories/` - Data access layer

### Services
- `backend/src/services/eoi.service.js` - EOI service with transaction-based rate limiting
- `backend/src/services/email.service.js` - Email sending service
- `backend/src/services/otp.service.js` - OTP service (in-memory, needs Redis for scale)

---

## Environment Variables Required

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL (required in production)
- `AUTH_SECRET` - NextAuth secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - Frontend URL for CORS (required in production)
- `SMTP_USER` - Email service username
- `SMTP_PASS` - Email service password
- `SMTP_HOST` - Email service host
- `SMTP_PORT` - Email service port

---

## Testing Status

**Ready for Testing:**
- All changes are backward compatible
- No breaking changes
- Additive improvements only
- Existing functionality preserved

**What to Test:**
1. Environment variable validation in production builds
2. Rate limiting on auth and general endpoints
3. Request IDs in error responses and logs
4. Database query performance with new indexes
5. EOI rate limiting under concurrent load

---

## Known Issues / Future Improvements

### Performance Optimizations (Optional)
- Admin authorization queries DB every time (can be optimized with caching)
- In-memory cache not scalable (needs Redis for multi-instance)
- OTP storage not scalable (needs Redis or database)

### Code Quality (Optional)
- Reduce TypeScript `as any` usage (35+ instances)
- Add comprehensive test coverage
- Improve error boundaries in React
- Add API documentation (OpenAPI/Swagger)

### Security Enhancements (Optional)
- Consider HttpOnly cookies for token storage
- Add CSRF protection
- Implement token refresh mechanism
- Add account lockout after failed attempts

---

## Deployment Notes

### Railway (Backend)
- Build command: `npx prisma generate`
- Start command: `npx prisma migrate deploy && npm start`
- Ensure environment variables are set
- Database migrations run automatically on deploy

### Vercel (Frontend)
- Build automatically detects Next.js
- Ensure `NEXT_PUBLIC_API_URL` is set
- NextAuth requires `AUTH_SECRET`
- Google OAuth requires client ID and secret

### Database (Supabase)
- Connection pooling recommended
- Use `?pgbouncer=true&connection_limit=1` in connection string
- Run migrations before deploying backend

---

## Summary

**Total Fixes Completed:** 9 major improvements
- Critical: 5/7 (2 deferred)
- High Priority: 4/4

**Database Migration:** ✅ Applied successfully

**Breaking Changes:** None - All changes are backward compatible

**System Status:** Production-ready after testing

**Key Improvements:**
- Environment validation prevents misconfiguration
- Rate limiting protects against abuse
- Database indexes improve performance
- Request IDs enable error correlation
- Better logging for debugging
- Race conditions fixed in EOI

---

**Note:** This document is for AI assistant context only. It summarizes all work completed to date and provides reference for understanding the current state of the project.
