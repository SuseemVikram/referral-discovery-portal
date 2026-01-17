# 🚀 Deploy Now - Quick Start

**Fastest deployment option: Railway + Vercel**

---

## ⚡ Super Quick (5 minutes)

### Backend (Railway)

1. **Go to [railway.app](https://railway.app)** → New Project → GitHub
2. **Select repo** → Set root to `backend`
3. **Add PostgreSQL** → "+ New" → "Database" → "PostgreSQL"
4. **Add Variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=<run: openssl rand -base64 32>
   FRONTEND_URL=https://your-app.vercel.app (update after frontend deploy)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=<gmail-app-password>
   FROM_EMAIL="Portal <your-email@gmail.com>"
   ```
5. **Copy backend URL** (e.g., `https://xxx.up.railway.app`)

### Frontend (Vercel)

1. **Go to [vercel.com](https://vercel.com)** → Add Project → GitHub
2. **Set root to `frontend`**
3. **Add Variables:**
   ```
   NEXT_PUBLIC_API_URL=<your-railway-backend-url>
   NEXTAUTH_SECRET=<run: openssl rand -base64 32>
   NEXTAUTH_URL=<will-be-auto-set>
   ```
4. **Deploy** → Copy Vercel URL

### Final Step

1. **Update Railway:** Set `FRONTEND_URL` to your Vercel URL
2. **Done!** Visit your Vercel URL

---

## 🔑 Generate Secrets

```bash
# JWT Secret
openssl rand -base64 32

# NextAuth Secret
openssl rand -base64 32
```

---

## 📧 Gmail App Password

1. Google Account → Security → 2FA (enable)
2. App passwords → Generate for "Mail"
3. Use that password for `SMTP_PASS`

---

## ✅ Verify

**Backend:**
```bash
curl https://your-backend.railway.app/health
# Should return: {"status":"ok","database":"connected"}
```

**Frontend:**
- Visit your Vercel URL
- Test: Browse candidates → Sign up → Send EOI

---

## 🚨 If You See SMTP Timeout Errors

**Railway blocks SMTP port 587.** Switch to SendGrid (5 min):

1. See **[RAILWAY_SMTP_FIX.md](./RAILWAY_SMTP_FIX.md)** for step-by-step fix
2. Or use SendGrid instead of Gmail:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_USER=apikey
   SMTP_PASS=<sendgrid-api-key>
   ```

---

**Need detailed guide?** See `QUICK_DEPLOY_GUIDE.md`
