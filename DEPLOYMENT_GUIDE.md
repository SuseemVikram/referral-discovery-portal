# Deployment Guide: Vercel + Railway

This guide will help you deploy your Referral Discovery Portal to:
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway (Express.js)
- **Database**: Railway PostgreSQL

---

## Prerequisites

1. GitHub account with your code pushed to a repository
2. Vercel account (free tier available)
3. Railway account (free trial, then pay-as-you-go)
4. Google OAuth credentials (if using Google login)
5. SMTP credentials (for email sending)

---

## Part 1: Railway Setup (Backend + Database)

### Step 1: Create Railway Account & Project

1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your repository
6. Railway will detect your `backend` folder automatically

### Step 2: Add PostgreSQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will create a PostgreSQL database
4. **Important**: Note the connection string (you'll need it in Step 3)

### Step 3: Configure Backend Service

1. Click on your backend service in Railway
2. Go to **"Settings"** tab
3. Under **"Service Name"**, give it a name (e.g., `referral-backend`)
4. Railway should auto-detect your `railway.json` config

### Step 4: Set Environment Variables (Backend)

Go to **"Variables"** tab and add these environment variables:

#### Required Variables:

```bash
# Database (from Railway PostgreSQL service)
DATABASE_URL=<railway-postgres-connection-string>

# JWT Secret (generate a strong random string)
JWT_SECRET=<generate-a-strong-random-secret>

# Frontend URL (will be your Vercel URL - update after frontend deploy)
FRONTEND_URL=https://your-app.vercel.app

# Node Environment
NODE_ENV=production

# Port (Railway sets this automatically, but you can set it)
PORT=4000
```

#### Email Configuration (SMTP):

```bash
# SMTP Settings (choose one provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Optional: Admin email for notifications
ADMIN_EMAIL=admin@yourdomain.com
```

#### Optional Variables:

```bash
# EOI Daily Limit (default: 20)
EOI_DAILY_LIMIT=20

# Redis URL (if using Redis for caching/OTP)
REDIS_URL=<optional-redis-url>
```

### Step 5: Deploy Backend

1. Railway will automatically deploy when you push to your main branch
2. Or click **"Deploy"** button to trigger manual deployment
3. Wait for build to complete
4. Railway will provide a URL like: `https://your-backend.up.railway.app`

### Step 6: Get Backend URL

1. In Railway dashboard, go to your backend service
2. Click **"Settings"** → **"Networking"**
3. Enable **"Generate Domain"** if not already enabled
4. Copy the public URL (e.g., `https://referral-backend-production.up.railway.app`)
5. **Save this URL** - you'll need it for Vercel configuration

---

## Part 2: Vercel Setup (Frontend)

### Step 1: Create Vercel Account & Project

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click **"Add New"** → **"Project"**
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Step 2: Set Environment Variables (Frontend)

Before deploying, add these environment variables in Vercel:

#### Required Variables:

```bash
# Backend API URL (from Railway Step 6)
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app

# NextAuth Secret (generate a strong random string)
AUTH_SECRET=<generate-a-strong-random-secret>

# Google OAuth (if using Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Optional Variables:

```bash
# Site URL (for sitemap, etc.)
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

### Step 3: Deploy Frontend

1. Click **"Deploy"** button
2. Wait for build to complete
3. Vercel will provide a URL like: `https://your-app.vercel.app`

### Step 4: Update Backend CORS

After getting your Vercel URL, update Railway environment variable:

1. Go back to Railway dashboard
2. Update `FRONTEND_URL` to your Vercel URL:
   ```bash
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Railway will automatically redeploy with new CORS settings

---

## Part 3: Google OAuth Setup (If Using Google Login)

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **"Credentials"** → **"Create Credentials"** → **"OAuth 2.0 Client ID"**
5. Configure:
   - **Application type**: Web application
   - **Name**: Referral Discovery Portal
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (for local dev)
     - `https://your-app.vercel.app` (your Vercel URL)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (for local dev)
     - `https://your-app.vercel.app/api/auth/callback/google` (your Vercel URL)
6. Copy **Client ID** and **Client Secret**

### Step 2: Add to Vercel

Add the Google OAuth credentials to Vercel environment variables (already done in Part 2, Step 2)

---

## Part 4: SMTP Email Setup

### Option 1: Gmail (Free, but limited)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an **App Password**:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use these settings:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

### Option 2: SendGrid (Recommended for production)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Use these settings:
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   ```

### Option 3: Mailgun

1. Sign up at [mailgun.com](https://mailgun.com)
2. Get SMTP credentials from dashboard
3. Use provided SMTP settings

---

## Part 5: Post-Deployment Verification

### 1. Test Backend Health

```bash
curl https://your-backend.up.railway.app/health
```

Should return: `{"status":"ok"}`

### 2. Test Frontend

1. Visit your Vercel URL
2. Check browser console for errors
3. Try browsing candidates (public route)
4. Test login/signup

### 3. Test Database Connection

1. Check Railway logs for any database connection errors
2. Verify migrations ran successfully (check logs for "Prisma migrate deploy")

### 4. Test CORS

1. Open browser DevTools → Network tab
2. Try making API calls from frontend
3. Check for CORS errors in console

### 5. Test Email

1. Try sending an EOI (Expression of Interest)
2. Check email inbox for notification
3. Check Railway logs for email errors

---

## Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- **Check**: Railway logs for error messages
- **Common issues**:
  - Missing `DATABASE_URL`
  - Missing `JWT_SECRET`
  - Prisma migration failures

**Problem**: CORS errors
- **Check**: `FRONTEND_URL` matches your Vercel URL exactly (no trailing slash)
- **Check**: Railway logs for CORS rejection messages

**Problem**: Database connection errors
- **Check**: `DATABASE_URL` is correct
- **Check**: Railway PostgreSQL service is running
- **Check**: Connection string format is correct

### Frontend Issues

**Problem**: Build fails
- **Check**: Vercel build logs
- **Common issues**:
  - Missing `NEXT_PUBLIC_API_URL`
  - Missing `AUTH_SECRET`
  - TypeScript errors

**Problem**: API calls fail
- **Check**: `NEXT_PUBLIC_API_URL` is correct
- **Check**: Backend is running and accessible
- **Check**: CORS is configured correctly

**Problem**: Google OAuth not working
- **Check**: Google OAuth redirect URIs match exactly
- **Check**: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- **Check**: Vercel URL is added to authorized origins

### Database Issues

**Problem**: Migrations not running
- **Check**: Railway logs for migration output
- **Check**: `railway.json` has correct start command
- **Manual fix**: Connect to database and run migrations manually

---

## Environment Variables Summary

### Railway (Backend) - Required
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Random secret for JWT signing
- `FRONTEND_URL` - Your Vercel frontend URL
- `NODE_ENV=production`
- `SMTP_USER` - Email username
- `SMTP_PASS` - Email password
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP port (usually 587)

### Vercel (Frontend) - Required
- `NEXT_PUBLIC_API_URL` - Your Railway backend URL
- `AUTH_SECRET` - Random secret for NextAuth
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

---

## Cost Estimate

### Railway
- **Backend Service**: ~$5-10/month (usage-based)
- **PostgreSQL Database**: ~$5/month (1GB storage)
- **Total**: ~$10-15/month

### Vercel
- **Hobby Plan**: Free (for personal projects)
- **Pro Plan**: $20/month (for commercial use)

### Total Monthly Cost: ~$10-35/month

---

## Next Steps After Deployment

1. ✅ Set up custom domain (optional)
2. ✅ Configure monitoring/analytics
3. ✅ Set up error tracking (Sentry is already integrated)
4. ✅ Configure backups for database
5. ✅ Set up staging environment (optional)

---

## Quick Reference

### Railway Backend URL
```
https://your-backend.up.railway.app
```

### Vercel Frontend URL
```
https://your-app.vercel.app
```

### Health Check
```
https://your-backend.up.railway.app/health
```

---

## Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
