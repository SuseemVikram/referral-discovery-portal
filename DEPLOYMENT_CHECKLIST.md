# Deployment Checklist

Use this checklist to ensure you don't miss any steps during deployment.

## Pre-Deployment

- [ ] Code is pushed to GitHub repository
- [ ] All local changes are committed
- [ ] Google OAuth credentials are ready (if using Google login)
- [ ] SMTP email credentials are ready

## Railway Setup (Backend + Database)

### Account & Project
- [ ] Railway account created
- [ ] New project created from GitHub repo
- [ ] Backend service detected/configured

### Database
- [ ] PostgreSQL database added to Railway project
- [ ] Database connection string copied

### Environment Variables (Backend)
- [ ] `DATABASE_URL` - Set to Railway PostgreSQL connection string
- [ ] `JWT_SECRET` - Generated strong random secret
- [ ] `FRONTEND_URL` - Set (will update after Vercel deploy)
- [ ] `NODE_ENV=production`
- [ ] `SMTP_HOST` - Set (e.g., smtp.gmail.com)
- [ ] `SMTP_PORT` - Set (e.g., 587)
- [ ] `SMTP_SECURE=false`
- [ ] `SMTP_USER` - Set email username
- [ ] `SMTP_PASS` - Set email password
- [ ] `FROM_EMAIL` - Set (optional, defaults to SMTP_USER)
- [ ] `ADMIN_EMAIL` - Set (optional)
- [ ] `EOI_DAILY_LIMIT` - Set (optional, default: 20)
- [ ] `REDIS_URL` - Set (optional, if using Redis)

### Deployment
- [ ] Backend deployed successfully
- [ ] Backend URL copied (e.g., `https://your-backend.up.railway.app`)
- [ ] Health check endpoint tested: `/health`

## Vercel Setup (Frontend)

### Account & Project
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Root directory set to `frontend`
- [ ] Framework preset: Next.js

### Environment Variables (Frontend)
- [ ] `NEXT_PUBLIC_API_URL` - Set to Railway backend URL
- [ ] `AUTH_SECRET` - Generated strong random secret
- [ ] `GOOGLE_CLIENT_ID` - Set (if using Google login)
- [ ] `GOOGLE_CLIENT_SECRET` - Set (if using Google login)
- [ ] `NEXT_PUBLIC_SITE_URL` - Set to Vercel URL (optional)

### Deployment
- [ ] Frontend deployed successfully
- [ ] Frontend URL copied (e.g., `https://your-app.vercel.app`)

## Post-Deployment Configuration

### Update Backend CORS
- [ ] Updated `FRONTEND_URL` in Railway to match Vercel URL
- [ ] Backend redeployed with new CORS settings

### Google OAuth (If Using)
- [ ] Google Cloud Console project created
- [ ] OAuth 2.0 credentials created
- [ ] Authorized JavaScript origins added:
  - [ ] `http://localhost:3000` (dev)
  - [ ] `https://your-app.vercel.app` (production)
- [ ] Authorized redirect URIs added:
  - [ ] `http://localhost:3000/api/auth/callback/google` (dev)
  - [ ] `https://your-app.vercel.app/api/auth/callback/google` (production)

## Verification Tests

### Backend
- [ ] Health check: `curl https://your-backend.up.railway.app/health`
- [ ] Response: `{"status":"ok"}`
- [ ] Railway logs show no errors
- [ ] Database migrations completed successfully

### Frontend
- [ ] Frontend loads without errors
- [ ] Browser console shows no errors
- [ ] Public candidate browsing works
- [ ] API calls succeed (check Network tab)

### Authentication
- [ ] Email/password login works
- [ ] Signup works
- [ ] Google OAuth login works (if configured)
- [ ] Logout works

### Functionality
- [ ] EOI (Expression of Interest) sending works
- [ ] Email notifications received
- [ ] Admin panel accessible (if admin account exists)
- [ ] CORS errors resolved

## Security Checklist

- [ ] All secrets are strong random strings
- [ ] No secrets committed to Git
- [ ] Environment variables set in platform (not in code)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (already configured in code)

## Monitoring Setup

- [ ] Railway logs accessible
- [ ] Vercel logs accessible
- [ ] Error tracking configured (Sentry already integrated)
- [ ] Health check monitoring set up (optional)

## Documentation

- [ ] Deployment guide reviewed: `DEPLOYMENT_GUIDE.md`
- [ ] Environment variables documented
- [ ] URLs saved for reference:
  - [ ] Backend URL: `___________________________`
  - [ ] Frontend URL: `___________________________`
  - [ ] Database connection string: `___________________________`

## Optional Enhancements

- [ ] Custom domain configured
- [ ] SSL certificates verified (automatic on Vercel/Railway)
- [ ] Database backups configured
- [ ] Staging environment set up
- [ ] CI/CD pipeline configured

---

## Quick Commands

### Generate Secrets
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Backend Health
```bash
curl https://your-backend.up.railway.app/health
```

### Check Railway Logs
- Go to Railway dashboard → Your service → Logs tab

### Check Vercel Logs
- Go to Vercel dashboard → Your project → Deployments → Click deployment → View logs

---

## Troubleshooting Quick Reference

| Issue | Check |
|-------|-------|
| Backend won't start | Railway logs, missing env vars |
| CORS errors | FRONTEND_URL matches Vercel URL exactly |
| Database errors | DATABASE_URL format, Railway PostgreSQL running |
| Build fails | Vercel logs, missing NEXT_PUBLIC_API_URL |
| OAuth not working | Redirect URIs match exactly, credentials set |
| Email not sending | SMTP credentials, Railway logs |

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete
