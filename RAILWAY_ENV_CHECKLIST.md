# ✅ Railway Environment Variables Checklist

## KEEP These Variables ✅

```
ADMIN_EMAIL=suseemvikrambhatnagar@gmail.com
DATABASE_URL=<auto-set-by-railway>
FROM_EMAIL=Referral Portal <suseemvikrambhatnagar@gmail.com>
FRONTEND_URL=https://your-app.vercel.app
JWT_SECRET=<your-jwt-secret>
NODE_ENV=production
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## DELETE These Variables ❌

```
SMTP_HOST          ← Remove
SMTP_PORT          ← Remove
SMTP_SECURE        ← Remove
SMTP_USER          ← Remove
SMTP_PASS          ← Remove (if present)
```

---

## Quick Actions in Railway

1. **Add/Update:** `SENDGRID_API_KEY` (your SendGrid API key)
2. **Delete:** All `SMTP_*` variables
3. **Keep:** Everything else

---

## Why?

- `SENDGRID_API_KEY` → Uses SendGrid API (works on Railway via HTTPS)
- `SMTP_*` variables → Not needed anymore (SMTP blocked on Railway)

---

**After updating:** Railway will auto-redeploy and emails will work! 🎉
