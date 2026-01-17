# SMTP Configuration Guide for Railway Deployment

## Issue 1: FROM_EMAIL Warning (Fixed in Code)

**Warning Message:**
```
[SMTP] WARNING: FROM_EMAIL email part (...) does not match SMTP_USER (...). Gmail requires them to match.
```

**Solution:**
In your Railway environment variables, ensure:

1. **Set `FROM_EMAIL`** (can include display name):
   ```
   FROM_EMAIL=Referral Portal <suseemvikrambhatnagar@gmail.com>
   ```

2. **Set `SMTP_USER`** (must be the email part only):
   ```
   SMTP_USER=suseemvikrambhatnagar@gmail.com
   ```

3. **Set `SMTP_PASS`** (Gmail App Password):
   ```
   SMTP_PASS=your-gmail-app-password
   ```

**Important:** The email part extracted from `FROM_EMAIL` must exactly match `SMTP_USER` for Gmail to work.

---

## Issue 2: SMTP Connection Timeout

**Error Message:**
```
[SMTP] Connection timeout - This may indicate:
1. Railway blocking outbound SMTP connections (port 587)
2. Gmail blocking Railway IP addresses
3. Network/firewall issues
4. Incorrect SMTP_HOST or SMTP_PORT
```

### Solution Options (Choose One):

### Option A: Use Gmail App Password (Recommended if sticking with Gmail)

1. **Enable 2-Step Verification** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Railway Referral Portal"
   - Copy the 16-character password

3. **Update Railway Environment Variables:**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=suseemvikrambhatnagar@gmail.com
   SMTP_PASS=<paste-16-character-app-password>
   FROM_EMAIL=Referral Portal <suseemvikrambhatnagar@gmail.com>
   ```

4. **Note:** The timeout might still occur, but emails may still send. The verification is just a connectivity test.

---

### Option B: Switch to SendGrid (Recommended for Production)

SendGrid is more reliable for cloud deployments and bypasses Railway's SMTP restrictions.

1. **Sign up for SendGrid** (free tier: 100 emails/day)
   - Go to: https://sendgrid.com
   - Create account and verify email

2. **Create API Key:**
   - Go to Settings → API Keys
   - Create API Key with "Full Access" or "Mail Send" permissions
   - Copy the API key (you'll only see it once!)

3. **Update Railway Environment Variables:**
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=<your-sendgrid-api-key>
   FROM_EMAIL=Referral Portal <suseemvikrambhatnagar@gmail.com>
   ```

4. **Verify Sender in SendGrid:**
   - Go to Settings → Sender Authentication
   - Verify your sender email address

---

### Option C: Switch to Mailgun (Alternative)

1. **Sign up for Mailgun** (free tier: 5,000 emails/month)
   - Go to: https://mailgun.com

2. **Get SMTP credentials:**
   - Go to Sending → Domains → SMTP credentials

3. **Update Railway Environment Variables:**
   ```
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=<mailgun-smtp-username>
   SMTP_PASS=<mailgun-smtp-password>
   FROM_EMAIL=Referral Portal <your-verified-email@yourdomain.com>
   ```

---

## Quick Setup Checklist

### If Using Gmail:
- [ ] Enabled 2-Step Verification
- [ ] Generated App Password
- [ ] Set `SMTP_USER=suseemvikrambhatnagar@gmail.com`
- [ ] Set `SMTP_PASS=<app-password>`
- [ ] Set `FROM_EMAIL=Referral Portal <suseemvikrambhatnagar@gmail.com>`
- [ ] Verify email extraction matches SMTP_USER (warning should disappear)

### If Using SendGrid:
- [ ] Created SendGrid account
- [ ] Verified sender email
- [ ] Created API key
- [ ] Set `SMTP_HOST=smtp.sendgrid.net`
- [ ] Set `SMTP_USER=apikey`
- [ ] Set `SMTP_PASS=<api-key>`
- [ ] Set `FROM_EMAIL=Referral Portal <verified-email>`

---

## Testing Email After Setup

1. **Deploy changes** to Railway
2. **Check logs** for verification success:
   ```
   [SMTP] Email service verified and ready
   ```
3. **Test EOI sending** - Send an Expression of Interest and verify:
   - Candidate receives email
   - Admin receives notification
   - Check Railway logs for any email errors

---

## Troubleshooting

### "Still seeing timeout after setup"
- **For Gmail:** This is common. Emails may still work despite the timeout. Test by sending an actual EOI.
- **For SendGrid/Mailgun:** Check API key/credentials are correct. Verify sender email is authenticated.

### "Emails not sending"
- Check Railway logs for specific error messages
- Verify all environment variables are set correctly
- Ensure sender email is verified in the email provider
- Check if you've hit rate limits (free tier limits)

### "FROM_EMAIL warning persists"
- Ensure `FROM_EMAIL` email part exactly matches `SMTP_USER`
- Check for extra spaces or typos
- The code now properly extracts email from display name format
