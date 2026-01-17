# Quick Fix Summary - Railway Deployment Issues

## ✅ Issue 1: FROM_EMAIL Warning (FIXED IN CODE)

**What was wrong:** The email extraction regex wasn't correctly parsing "Name <email>" format.

**What I fixed:** Updated the `extractEmail()` function in `backend/src/config/env.js` to properly extract email from angle brackets.

**Action Required:** 
1. **Commit and push this fix** (code change is ready)
2. **In Railway, set your environment variables:**
   ```
   FROM_EMAIL=Referral Portal <suseemvikrambhatnagar@gmail.com>
   SMTP_USER=suseemvikrambhatnagar@gmail.com
   ```
   The email part must match exactly!

---

## ⚠️ Issue 2: SMTP Connection Timeout (INFRASTRUCTURE ISSUE)

**Problem:** Railway may be blocking port 587, or Gmail is blocking Railway IPs.

**Solution Options (Choose One):**

### Quick Fix: Use Gmail App Password

1. **In Railway Environment Variables, update:**
   - Get Gmail App Password:
     - Enable 2-Step Verification: https://myaccount.google.com/security
     - Create App Password: https://myaccount.google.com/apppasswords
     - Select "Mail" → "Other" → Name it "Railway"
   - Update Railway env vars:
     ```
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_SECURE=false
     SMTP_USER=suseemvikrambhatnagar@gmail.com
     SMTP_PASS=<16-character-app-password-from-google>
     FROM_EMAIL=Referral Portal <suseemvikrambhatnagar@gmail.com>
     ```

2. **Note:** You may still see timeout warnings, but emails should still send. The verification is just a connectivity test.

### Better Fix: Switch to SendGrid (Recommended)

1. **Sign up:** https://sendgrid.com (free: 100 emails/day)
2. **Get API Key:** Settings → API Keys → Create → Copy key
3. **Verify Sender:** Settings → Sender Authentication → Verify email
4. **Update Railway env vars:**
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=<your-sendgrid-api-key>
   FROM_EMAIL=Referral Portal <your-verified-email>
   ```

---

## 📝 Steps to Fix Now:

1. **Commit the code fix:**
   ```bash
   git add backend/src/config/env.js
   git commit -m "Fix FROM_EMAIL extraction regex to properly parse display name format"
   git push
   ```

2. **In Railway Dashboard:**
   - Go to your project → Variables
   - Set `FROM_EMAIL` and `SMTP_USER` as shown above
   - If using Gmail: Set `SMTP_PASS` to your App Password
   - If using SendGrid: Set `SMTP_USER=apikey` and `SMTP_PASS=<api-key>`

3. **Redeploy** (Railway will auto-deploy after push, or trigger manually)

4. **Check logs** - You should see:
   - ✅ No more FROM_EMAIL warning
   - ✅ SMTP verification success (or timeout but emails still work)

---

## 🔍 Testing

After deployment, send an Expression of Interest to verify:
- Candidate receives email
- Admin receives notification
- Check Railway logs for email delivery status

---

**See `SMTP_SETUP_GUIDE.md` for detailed instructions.**
