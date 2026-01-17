# Production Deployment Guide

**Date:** 2026-01-18  
**Version:** MVP / V1

## 🚀 Pre-Deployment Checklist

### Backend Requirements

- [ ] **Environment Variables Configured**
  - `DATABASE_URL` - PostgreSQL connection string
  - `JWT_SECRET` - Strong random secret (minimum 32 characters)
  - `FRONTEND_URL` - Production frontend URL (e.g., `https://yourdomain.com`)
  - `SMTP_*` - Email configuration verified
  - `NODE_ENV=production` - Must be set

- [ ] **Database Migrations Applied**
  ```bash
  cd backend
  npx prisma migrate deploy
  npx prisma generate
  ```

- [ ] **Dependencies Installed**
  ```bash
  npm ci --production
  ```

- [ ] **Health Check Verified**
  - Endpoint: `GET /health`
  - Should return: `{ status: 'ok', database: 'connected', email: 'configured' }`

### Frontend Requirements

- [ ] **Environment Variables Configured**
  - `NEXT_PUBLIC_API_URL` - Production backend URL (e.g., `https://api.yourdomain.com`)
  - `NEXTAUTH_SECRET` - Strong random secret
  - `NEXTAUTH_URL` - Production frontend URL
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - If using Google OAuth

- [ ] **Build Completed**
  ```bash
  cd frontend
  npm ci
  npm run build
  ```

---

## 🔧 Production Configuration

### Backend Production Settings

**Automatic in Code:**
- ✅ Error stack traces hidden in production
- ✅ Rate limiting stricter (100 req/15min vs 1000 in dev)
- ✅ Auth rate limiting stricter (5 req/15min vs 100 in dev)
- ✅ Prisma query logging disabled (errors only)
- ✅ Development endpoints disabled (`/dev/reset-rate-limits`)

**Required Environment Variables:**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-random-secret>
FRONTEND_URL=https://yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL="Your Name <your-email@gmail.com>"
```

**Optional:**
```bash
PORT=4000
ADMIN_EMAIL=admin@example.com
EOI_DAILY_LIMIT=20
REDIS_URL=redis://...  # For production OTP/rate limiting
```

### Frontend Production Settings

**Automatic in Code:**
- ✅ `NEXT_PUBLIC_API_URL` validation (throws error if missing)
- ✅ Build-time optimization enabled

**Required Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXTAUTH_SECRET=<strong-random-secret>
NEXTAUTH_URL=https://yourdomain.com
```

**Optional:**
```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 📦 Deployment Platforms

### Railway

**Backend:**
1. Connect repository
2. Set root directory: `backend`
3. Set start command: `npm start`
4. Add environment variables (from `.env.example`)
5. Add PostgreSQL service
6. Set `DATABASE_URL` automatically

**Frontend:**
1. Connect repository
2. Set root directory: `frontend`
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables

### Render

**Backend:**
1. Use `backend/render.yaml` as reference
2. Set environment variables
3. PostgreSQL database automatically provisioned

**Frontend:**
1. Use `frontend/vercel.json` as reference (for Vercel) or similar config

### Vercel (Frontend)

1. Connect GitHub repository
2. Set root directory: `frontend`
3. Add environment variables
4. Deploy

---

## 🔐 Security Checklist

- [ ] **JWT_SECRET** - Use strong random string (32+ chars)
- [ ] **NEXTAUTH_SECRET** - Use strong random string (32+ chars)
- [ ] **Database** - Use connection pooling (Prisma handles this)
- [ ] **CORS** - `FRONTEND_URL` correctly set (validates origin)
- [ ] **Rate Limiting** - Enabled (100 req/15min for API, 5 req/15min for auth)
- [ ] **Security Headers** - Helmet.js enabled
- [ ] **Error Messages** - Stack traces hidden in production
- [ ] **SMTP** - Use App Password for Gmail (not regular password)

---

## 🧪 Post-Deployment Verification

### 1. Health Check
```bash
curl https://api.yourdomain.com/health
# Expected: {"status":"ok","database":"connected","email":"configured"}
```

### 2. CORS Test
```bash
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://api.yourdomain.com/api/candidates
# Should not return CORS error
```

### 3. Rate Limiting
```bash
# Make multiple requests quickly
for i in {1..10}; do
  curl https://api.yourdomain.com/api/candidates
done
# After 100 requests in 15 minutes, should get 429
```

### 4. Frontend Build
```bash
cd frontend
npm run build
# Should complete without errors
```

### 5. Authentication Flow
- Sign up new user
- Login with email/password
- Send EOI (should receive email)
- Admin login (if configured)

---

## 🐛 Troubleshooting

### Backend Issues

**Error: "FRONTEND_URL environment variable is required in production"**
- Solution: Set `FRONTEND_URL` environment variable

**Error: "Missing required environment variables"**
- Solution: Check `backend/.env.example` for all required variables

**SMTP Connection Timeout**
- Solution: Use SendGrid or ensure Gmail App Password is correct

**Rate Limiting Not Working**
- Solution: Ensure Redis is configured if using Redis store, or accept in-memory limitations

### Frontend Issues

**Error: "NEXT_PUBLIC_API_URL environment variable is required in production"**
- Solution: Set `NEXT_PUBLIC_API_URL` in production environment

**CORS Errors**
- Solution: Ensure `FRONTEND_URL` in backend matches frontend domain exactly

**Build Fails**
- Solution: Check for missing environment variables or TypeScript errors

---

## 📊 Monitoring & Logging

### Backend Logging
- Uses custom logger service
- Logs include request IDs for correlation
- Error logs include context (user, URL, method)
- Slow queries logged (> 1000ms)

### Health Check Monitoring
- Endpoint: `GET /health`
- Status codes: `200` (ok), `503` (degraded)
- Checks: Database connectivity, Email service status

### Production Logs
- Stack traces hidden
- Error messages sanitized
- No sensitive data in logs (passwords, tokens)

---

## 🔄 Database Migrations

### Apply Migrations
```bash
cd backend
npx prisma migrate deploy
```

### Rollback (Manual)
If needed, manually revert the last migration by:
1. Connect to database
2. Revert last migration SQL
3. Update `_prisma_migrations` table

**Note:** Prisma doesn't support automatic rollbacks. Always test migrations in staging first.

---

## 📝 Environment Variable Security

**Never commit `.env` files to git**

**Use secure secret management:**
- Railway: Built-in secret management
- Render: Environment variables in dashboard
- Vercel: Environment variables in project settings

**Generate strong secrets:**
```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# NextAuth Secret
openssl rand -base64 32
```

---

## ✅ Production Readiness Checklist

- [x] Error handling doesn't leak sensitive info
- [x] Stack traces hidden in production
- [x] Rate limiting configured
- [x] CORS properly configured
- [x] Security headers (Helmet.js)
- [x] Input sanitization
- [x] Request body size limits (10mb)
- [x] Health check endpoint
- [x] Environment variable validation
- [x] Database connection pooling (Prisma)
- [x] Logging with request IDs
- [ ] Redis for OTP (optional - in-memory works for MVP)
- [ ] Redis for rate limiting (optional - in-memory works for MVP)
- [ ] HttpOnly cookies for JWT (optional - localStorage works for MVP)

---

**Last Updated:** 2026-01-18
