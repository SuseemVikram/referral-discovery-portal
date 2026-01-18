# Referral Discovery Portal

A referral discovery platform where referrers can browse candidate profiles and send Expressions of Interest (EOI).

## Tech Stack

**Frontend**
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- NextAuth (email + password + Google OAuth)

**Backend**
- Node.js + Express.js
- Prisma ORM
- PostgreSQL
- JWT authentication
- SendGrid API / SMTP (Nodemailer)

**DevOps**
- Railway (Backend + Database)
- Vercel (Frontend)

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Local Development

**Backend**
```bash
cd backend
npm install
cp ENV_EXAMPLE.txt .env
npx prisma migrate dev
npx prisma generate
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
cp ENV_EXAMPLE.txt .env.local
npm run dev
```

Visit `http://localhost:3000`

## Environment Variables

### Backend (`backend/.env`)

**Required**
```
DATABASE_URL=postgresql://user:password@localhost:5432/referral_portal
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
```

**Email (Choose One)**
```
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
```
OR
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL="Referral Portal <your-email@gmail.com>"
```

**Optional**
```
ADMIN_EMAIL=admin@example.com
EOI_DAILY_LIMIT=20
PORT=4000
NODE_ENV=development
```

### Frontend (`frontend/.env.local`)

**Required**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

**Optional (Google OAuth)**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

See `backend/ENV_EXAMPLE.txt` and `frontend/ENV_EXAMPLE.txt` for complete templates.

## Deployment

### Backend (Railway)

1. Create Railway account → New Project → Deploy from GitHub
2. Set root directory to `backend`
3. Add PostgreSQL database
4. Set environment variables (see Railway variables section)
5. Deploy automatically via Git push

**Railway Environment Variables**
```
DATABASE_URL=<auto-set-by-railway>
NODE_ENV=production
JWT_SECRET=<generate-with-openssl-rand-base64-32>
FRONTEND_URL=https://your-app.vercel.app
SENDGRID_API_KEY=SG.your-sendgrid-api-key
FROM_EMAIL="Referral Portal <your-verified-email@example.com>"
ADMIN_EMAIL=admin@example.com
```

**Important for Railway**
- Use `SENDGRID_API_KEY` (not SMTP) - Railway blocks SMTP ports
- Verify sender email in SendGrid Dashboard first
- Copy backend URL after deploy

### Frontend (Vercel)

1. Create Vercel account → Add Project → Import GitHub repo
2. Set root directory to `frontend`
3. Set environment variables
4. Deploy automatically via Git push

**Vercel Environment Variables**
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-app.vercel.app
```

**After Frontend Deploys**
- Update `FRONTEND_URL` in Railway to match Vercel URL

## Email Configuration

### SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com/free/
2. Create API key: Settings → API Keys → Create API Key
3. Verify sender email: Settings → Sender Authentication → Verify a Single Sender
4. Set `SENDGRID_API_KEY` in Railway/backend `.env`
5. Set `FROM_EMAIL` to verified email address

**Why SendGrid?**
- Works on Railway (uses HTTPS, not SMTP)
- Better deliverability
- Free tier: 100 emails/day

### Gmail SMTP (Local Development)

1. Enable 2-Factor Authentication on Google Account
2. Generate App Password: Google Account → Security → App passwords
3. Set SMTP variables in `backend/.env`

## Project Structure

```
referral-discovery-portal/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── lib/             # Email, Prisma, Redis clients
│   │   ├── middleware/      # Auth, error handling, rate limiting
│   │   ├── repositories/    # Database queries
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Logging, errors, sanitization
│   │   └── validators/      # Zod validation schemas
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Migration history
│   └── ENV_EXAMPLE.txt      # Environment template
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   ├── lib/                 # API clients, auth context, hooks
│   └── ENV_EXAMPLE.txt      # Environment template
└── README.md
```

## Features

**Public Access**
- Browse candidates without login
- Filter by role, skills, location, availability
- View candidate profiles and projects

**Referrer Features**
- Sign up / Login (email + password or Google OAuth)
- Send Expressions of Interest (EOI) to candidates
- One-click EOI from saved selection
- Profile management

**Admin Features**
- View all candidates with PII
- Manage candidate visibility
- View EOI logs
- Manage referrers and admins

**Email Notifications**
- Candidates receive EOI emails with referrer details
- Admins receive notifications for new EOIs
- Email service never blocks server startup

## Security

**Candidate PII Protection**
- `candidate_email` stored server-side only
- Never exposed in public APIs or frontend
- Only admins can access PII via protected endpoints

**Authentication & Authorization**
- JWT-based authentication (7-day expiry)
- Rate limiting: 100 req/15min (general), 5 req/15min (auth), 30 req/min (/auth/me)
- Admin-only endpoints protected by middleware

**Input Sanitization**
- All query parameters sanitized
- XSS prevention in text fields
- URL and email validation

**Headers & CORS**
- Helmet.js security headers
- CORS restricted to `FRONTEND_URL`
- Rate limit headers included

## API Endpoints

**Public**
- `GET /api/candidates` - Browse candidates (paginated, filtered)
- `GET /health` - Health check

**Auth**
- `POST /auth/signup` - Register referrer
- `POST /auth/login` - Login (email/password)
- `POST /auth/google` - Google OAuth
- `POST /auth/otp/request` - Request OTP
- `POST /auth/otp/verify` - Verify OTP
- `GET /auth/me` - Get current user profile
- `PUT /auth/me` - Update profile
- `PUT /auth/me/password` - Change password

**Protected**
- `POST /api/eoi` - Send Expression of Interest

**Admin**
- `GET /api/admin/candidates` - List all candidates (with PII)
- `PUT /api/admin/candidates/:id` - Update candidate
- `DELETE /api/admin/candidates/:id` - Delete candidate
- `GET /api/admin/referrers` - List referrers
- `GET /api/admin/eoi-logs` - View EOI logs
- And more...

## Database Schema

**Candidate** - Profile information (email server-side only)
**Referrer** - Referrer account and profile
**EOILog** - Expression of Interest records
**Admin** - Admin user accounts

See `backend/prisma/schema.prisma` for full schema.

## Development

**Backend Scripts**
```bash
npm run dev        # Start with nodemon
npm start          # Production start
npm run reset-limits  # Reset rate limits (dev only)
```

**Database**
```bash
npx prisma migrate dev    # Create migration
npx prisma generate       # Generate Prisma Client
npx prisma studio         # Database GUI
```

**Frontend Scripts**
```bash
npm run dev        # Development server
npm run build      # Production build
npm start          # Production server
```

## Troubleshooting

**Email Issues**
- 403 Forbidden: Verify sender email in SendGrid
- Connection timeout: Use SendGrid API (not SMTP) on Railway
- Server won't start: Email verification is non-blocking - check other errors

**Rate Limit 429**
- `/auth/me` loop: Fixed in latest code (uses `authInitialized` flag)
- Too many requests: Rate limits reset every 15 minutes

**CORS Errors**
- Ensure `FRONTEND_URL` in backend matches frontend domain exactly
- Check for trailing slashes (normalized automatically)

**Database**
- Connection errors: Verify `DATABASE_URL` format
- Migration issues: Run `npx prisma migrate deploy` (production) or `npx prisma migrate dev` (development)

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SendGrid sender email verified
- [ ] `FRONTEND_URL` matches frontend domain
- [ ] `NEXTAUTH_URL` matches frontend domain
- [ ] JWT secrets generated (`openssl rand -base64 32`)
- [ ] Health check endpoint working (`/health`)
- [ ] Rate limiting configured appropriately
- [ ] CORS configured correctly
- [ ] Email sending tested

## License

[Your License]
