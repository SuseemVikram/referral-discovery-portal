# 🚨 IMMEDIATE FIX: Railway SMTP Connection Timeout

## Problem
Railway is **blocking SMTP port 587**, causing all emails to fail with `ETIMEDOUT` errors.

## Solution: Switch to SendGrid (Takes 5 minutes)

SendGrid works reliably on Railway and doesn't get blocked.

---

## Step-by-Step Fix:

### 1. Sign up for SendGrid (Free tier: 100 emails/day)

1. Go to: **https://sendgrid.com/free/**
2. Click "Start for Free"
3. Fill out the form:
   - Email: Your email
   - Password: Create password
   - Company Name: Optional
4. **Verify your email** (check inbox)

### 2. Create API Key in SendGrid

1. After login, go to: **Settings → API Keys**
   - Or direct link: https://app.sendgrid.com/settings/api_keys
2. Click **"Create API Key"**
3. Name it: `Railway Referral Portal`
4. Select permissions: **"Full Access"** (or at minimum "Mail Send")
5. Click **"Create & View"**
6. **⚠️ COPY THE API KEY IMMEDIATELY** - You'll only see it once!
   - It looks like: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. Verify Sender Email in SendGrid

1. Go to: **Settings → Sender Authentication**
   - Or direct link: https://app.sendgrid.com/settings/sender_auth/senders
2. Click **"Verify a Single Sender"**
3. Fill out the form:
   - **From Email Address:** `suseemvikrambhatnagar@gmail.com`
   - **From Name:** `Referral Portal`
   - **Reply To:** `suseemvikrambhatnagar@gmail.com`
   - **Company Address:** Your address
   - **City:** Your city
   - **State:** Your state
   - **Country:** Your country
   - **Zip Code:** Your zip
4. Click **"Create"**
5. **Check your email** (`suseemvikrambhatnagar@gmail.com`)
6. Click the verification link in the email

### 4. Update Railway Environment Variables

In your **Railway Dashboard**:

1. Go to your project
2. Click on **"Variables"** tab
3. Update/Add these variables:

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=<paste-your-sendgrid-api-key-here>
FROM_EMAIL=Referral Portal <suseemvikrambhatnagar@gmail.com>
```

**Important:**
- `SMTP_USER` must be exactly `apikey` (lowercase, no quotes)
- `SMTP_PASS` must be your full SendGrid API key starting with `SG.`
- `FROM_EMAIL` must use the verified email address

### 5. Redeploy

Railway will automatically redeploy when you save the environment variables. Or manually trigger a redeploy.

### 6. Test

1. Check Railway logs - you should see:
   ```
   [SMTP] Email service verified and ready
   ```

2. Try sending an Expression of Interest
3. Check if candidate receives email
4. Check if admin notification is sent

---

## Alternative: If SendGrid doesn't work

### Option B: Try Mailgun (Free: 5,000 emails/month)

1. Sign up: https://mailgun.com
2. Verify your domain or use their sandbox
3. Get SMTP credentials from: Sending → Domains → SMTP credentials
4. Update Railway:
   ```
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=<your-mailgun-smtp-username>
   SMTP_PASS=<your-mailgun-smtp-password>
   FROM_EMAIL=Referral Portal <your-verified-email>
   ```

---

## Quick Checklist

- [ ] Created SendGrid account
- [ ] Verified email in SendGrid
- [ ] Created API key and copied it
- [ ] Verified sender email in SendGrid
- [ ] Updated Railway environment variables:
  - [ ] `SMTP_HOST=smtp.sendgrid.net`
  - [ ] `SMTP_PORT=587`
  - [ ] `SMTP_SECURE=false`
  - [ ] `SMTP_USER=apikey`
  - [ ] `SMTP_PASS=<api-key>`
  - [ ] `FROM_EMAIL=Referral Portal <suseemvikrambhatnagar@gmail.com>`
- [ ] Redeployed
- [ ] Tested email sending

---

## Why This Will Work

- SendGrid is designed for cloud platforms and doesn't get blocked
- SendGrid SMTP port 587 works reliably on Railway
- SendGrid has better deliverability than Gmail for transactional emails
- The API key method is more secure than passwords

---

## After Fix

Once emails are working, you should see in Railway logs:
```
[SMTP] Email service verified and ready
[Email] Successfully sent EOI email to...
```

**If you still see timeouts**, try port 2525 (SendGrid's alternative port):
```
SMTP_PORT=2525
```
