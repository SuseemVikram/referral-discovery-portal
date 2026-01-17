# Quick Deployment Guide - Live Now

**Platform:** Railway (Backend) + Vercel (Frontend)  
**Estimated Time:** 15-20 minutes

---

## 🚀 Step-by-Step Deployment

### Part 1: Deploy Backend to Railway

#### 1.1 Create Railway Account & Project

1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your `referral-discovery-portal` repository
5. Select the **`backend`** folder as root directory

#### 1.2 Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a `DATABASE_URL` environment variable

#### 1.3 Configure Environment Variables

Click on your backend service → **"Variables"** tab → Add these:

```bash
# Required
NODE_ENV=production
JWT_SECRET=<generate-strong-secret-32+chars>
FRONTEND_URL=https://your-app-name.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
FROM_EMAIL="Referral Portal <your-email@gmail.com>"

# Optional
PORT=4000
ADMIN_EMAIL=admin@example.com
EOI_DAILY_LIMIT=20
```

**Generate JWT_SECRET:**
```bash
# Run this in terminal
openssl rand -base64 32
```

**Get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Go to "App passwords" → Generate password for "Mail"
4. Use that password for `SMTP_PASS`

#### 1.4 Deploy Backend

1. Railway will automatically detect `railway.json` and deploy
2. Wait for build to complete (~2-3 minutes)
3. Click on service → **"Settings"** → Copy the **generated domain** (e.g., `https://backend-production-xxxx.up.railway.app`)

**Note:** Railway auto-generates a domain. Save this URL - you'll need it for the frontend!

---

### Part 2: Deploy Frontend to Vercel

#### 2.1 Create Vercel Account & Project

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click **"Add New"** → **"Project"**
4. Import your `referral-discovery-portal` repository
5. Set **Root Directory** to `frontend`

#### 2.2 Configure Build Settings

Vercel auto-detects Next.js. Verify these settings:

- **Framework Preset:** Next.js
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

#### 2.3 Configure Environment Variables

Click **"Environment Variables"** → Add these:

```bash
# Required - Use your Railway backend URL here
NEXT_PUBLIC_API_URL=https://backend-production-xxxx.up.railway.app

# Required
NEXTAUTH_SECRET=<generate-another-strong-secret-32+chars>
NEXTAUTH_URL=https://your-app-name.vercel.app

# Optional (if using Google OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Important:** 
- `NEXT_PUBLIC_API_URL` must be your Railway backend URL (from Step 1.4)
- `NEXTAUTH_URL` will be your Vercel domain (auto-generated after first deploy)

#### 2.4 Deploy Frontend

1. Click **"Deploy"**
2. Wait for build to complete (~3-5 minutes)
3. Vercel will generate a domain (e.g., `https://referral-portal.vercel.app`)

#### 2.5 Update Backend CORS (Railway)

Now that you have the frontend URL:

1. Go back to Railway → Your backend service → **"Variables"**
2. Update `FRONTEND_URL` to your Vercel domain:
   ```bash
   FRONTEND_URL=https://your-app-name.vercel.app
   ```
3. Railway will automatically redeploy

#### 2.6 Update Frontend NEXTAUTH_URL (Vercel)

1. Go to Vercel → Your project → **"Settings"** → **"Environment Variables"**
2. Update `NEXTAUTH_URL` to your Vercel domain (if needed)
3. Redeploy: **"Deployments"** → Click "..." → **"Redeploy"**

---

## ✅ Verify Deployment

### 1. Backend Health Check

```bash
curl https://backend-production-xxxx.up.railway.app/health
```

Should return:
```json
{
  "status": "ok",
  "database": "connected",
  "email": "configured"
}
```

### 2. Frontend Access

1. Visit your Vercel URL
2. Try browsing candidates (should work without login)
3. Try signup/login
4. Try sending EOI

### 3. Check Logs

**Railway:**
- Click on backend service → **"Deployments"** → Click deployment → **"View Logs"**

**Vercel:**
- Click on deployment → **"Logs"** tab

---

## 🔧 Troubleshooting

### Backend Issues

**Error: "Missing required environment variables"**
- Solution: Check all required variables are set in Railway

**Error: "DATABASE_URL not found"**
- Solution: Ensure PostgreSQL database is added and connected

**SMTP Connection Timeout**
- Solution: Use Gmail App Password (not regular password)
- Or switch to SendGrid (see `docs/QUICK_SMTP_FIX.md`)

**CORS Errors**
- Solution: Ensure `FRONTEND_URL` in Railway matches your Vercel domain exactly (no trailing slash)

### Frontend Issues

**Error: "NEXT_PUBLIC_API_URL environment variable is required"**
- Solution: Set `NEXT_PUBLIC_API_URL` in Vercel environment variables

**CORS Errors in Browser**
- Solution: Backend `FRONTEND_URL` must match frontend domain exactly

**Build Fails**
- Solution: Check build logs in Vercel for specific errors

---

## 📝 Quick Reference

### Railway Backend URL
```
https://backend-production-xxxx.up.railway.app
```

### Vercel Frontend URL
```
https://your-app-name.vercel.app
```

### Environment Variables Summary

**Railway (Backend):**
- `DATABASE_URL` - Auto-set by Railway
- `JWT_SECRET` - Generate with `openssl rand -base64 32`
- `FRONTEND_URL` - Your Vercel domain
- `SMTP_*` - Gmail or SendGrid config

**Vercel (Frontend):**
- `NEXT_PUBLIC_API_URL` - Your Railway backend URL
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your Vercel domain

---

## 🎯 Next Steps (Later)

When you move to your own server:

1. **Update DNS:** Point your domain to your server
2. **Update Environment Variables:**
   - Update `FRONTEND_URL` in backend
   - Update `NEXTAUTH_URL` in frontend
   - Update `NEXT_PUBLIC_API_URL` to your server's backend URL
3. **Export/Import Database:**
   - Export from Railway PostgreSQL
   - Import to your server's PostgreSQL
4. **Migrate Code:**
   - Git pull on your server
   - Set environment variables
   - Run `npx prisma migrate deploy`
   - Start services with PM2 or systemd

---

## 💰 Cost Estimates (Temporary Hosting)

**Railway:**
- Free tier: $5 credit/month
- Backend + PostgreSQL: ~$5-10/month

**Vercel:**
- Free tier: Unlimited for personal projects
- Frontend: Free

**Total:** ~$5-10/month (can be free on Vercel, minimal on Railway)

---

## ✅ Deployment Checklist

- [ ] Railway account created
- [ ] Backend deployed to Railway
- [ ] PostgreSQL database added
- [ ] All backend environment variables set
- [ ] Backend health check passes
- [ ] Vercel account created
- [ ] Frontend deployed to Vercel
- [ ] All frontend environment variables set
- [ ] `FRONTEND_URL` updated in Railway
- [ ] Frontend can access backend (no CORS errors)
- [ ] Test signup/login works
- [ ] Test EOI sending works
- [ ] Test email delivery works

---

**Status:** Ready for deployment  
**Last Updated:** 2026-01-18
