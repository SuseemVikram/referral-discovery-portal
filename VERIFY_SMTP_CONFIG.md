# ✅ Verify Your SendGrid Configuration in Railway

## Quick Check

**Go to Railway → Your Project → Variables Tab**

Verify these settings:

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=Referral Portal <suseemvikrambhatnagar@gmail.com>
ADMIN_EMAIL=suseemvikrambhatnagar@gmail.com
```

---

## 🔍 Common Issues

### Issue 1: SMTP_HOST still set to Gmail

**If you see:**
```
SMTP_HOST=smtp.gmail.com
```

**Fix:** Change to:
```
SMTP_HOST=smtp.sendgrid.net
```

### Issue 2: Port 587 blocked

**If connection still times out, try port 2525:**

**Change:**
```
SMTP_PORT=2525
```

Railway sometimes blocks 587 even for SendGrid. Port 2525 usually works.

### Issue 3: SMTP_USER not exactly "apikey"

**Must be exactly (lowercase, no quotes):**
```
SMTP_USER=apikey
```

### Issue 4: SMTP_PASS not the full API key

**Must be the full key starting with `SG.`:**
```
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Not your SendGrid password, but the API key you created.

---

## ✅ After Fixing Variables

1. **Save** the variables in Railway
2. **Wait 1-2 minutes** for auto-redeploy
3. **Check logs** - should see:
   ```
   [SMTP] Email service verified and ready
   ```

---

## 🧪 Test Email

After redeploy, try sending an EOI from your live site and check if email arrives.
