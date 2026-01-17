# 🚨 Railway SMTP Fix - Do This Now

**Problem:** Railway is blocking SMTP port 587 → Emails failing with `ETIMEDOUT`

**Solution:** Switch to SendGrid (5 minutes, works reliably on Railway)

---

## ⚡ Quick Fix (5 Steps)

### Step 1: Get SendGrid Account

1. Go to: **https://sendgrid.com/free/**
2. Sign up (100 emails/day free)
3. Verify your email

### Step 2: Create API Key

1. Login to SendGrid → **Settings → API Keys**
2. Click **"Create API Key"**
3. Name: `Railway Portal`
4. Permissions: **"Full Access"** (or "Mail Send")
5. **⚠️ COPY THE KEY IMMEDIATELY** (starts with `SG.`)

### Step 3: Verify Sender Email

1. Go to: **Settings → Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Fill form:
   - **From Email:** `suseemvikrambhatnagar@gmail.com` (or your email)
   - **From Name:** `Referral Portal`
   - **Reply To:** Same email
   - Fill address fields
4. **Click verification link in your email**

### Step 4: Update Railway Variables

In **Railway Dashboard** → Your Project → **"Variables"** tab:

**Delete/Update these:**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=<paste-your-sendgrid-api-key-here>
FROM_EMAIL=Referral Portal <suseemvikrambhatnagar@gmail.com>
ADMIN_EMAIL=suseemvikrambhatnagar@gmail.com
```

**⚠️ Important:**
- `SMTP_USER` must be exactly `apikey` (lowercase, no quotes)
- `SMTP_PASS` = your SendGrid API key (the `SG.xxxxx` one)
- `FROM_EMAIL` = use the verified email from Step 3
- `ADMIN_EMAIL` = where admin notifications go (same or different)

### Step 5: Redeploy

Railway auto-redeploys when you save variables. Wait 1-2 minutes.

**Check logs - you should see:**
```
[SMTP] Email service verified and ready
```

---

## ✅ Test

1. Try sending an EOI from your live site
2. Check candidate email inbox
3. Check admin email inbox (if `ADMIN_EMAIL` is set)

---

## 🔧 If SendGrid Port 587 Still Fails

**Railway may block port 587.** Try port **2525** (SendGrid's alternative):

**Update in Railway Variables:**
```
SMTP_PORT=2525
```

Railway will auto-redeploy. Port 2525 often works when 587 is blocked.

---

## 📝 Quick Checklist

- [ ] Created SendGrid account
- [ ] Verified email in SendGrid
- [ ] Created API key and copied it
- [ ] Verified sender email in SendGrid
- [ ] Updated Railway variables (all 6)
- [ ] Redeployed
- [ ] Tested email sending

---

## 🎯 Why This Works

- ✅ SendGrid works on Railway (not blocked)
- ✅ Better deliverability than Gmail
- ✅ API key method is more secure
- ✅ Free tier: 100 emails/day (enough for MVP)

---

**Time:** 5 minutes  
**Result:** Emails working on Railway
