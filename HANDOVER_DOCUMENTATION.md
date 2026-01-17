# Referral Discovery Portal - Technical Handover Documentation

**Project:** Referral Discovery Portal MVP / V1  
**Status:** Ready for Production Deployment  
**Handover Date:** [Date]  
**Built By:** [Your Name]  
**Tech Stack:** Next.js 14 (App Router), Node.js/Express, PostgreSQL, Prisma

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Environment Variables](#environment-variables)
6. [Setup & Deployment](#setup--deployment)
7. [Database](#database)
8. [API Endpoints](#api-endpoints)
9. [Key Features](#key-features)
10. [Important Notes](#important-notes)
11. [Known Issues & Future Work](#known-issues--future-work)

---

## Project Overview

A referral discovery portal where:
- **Referrers** can browse candidate profiles (no login required)
- **Referrers** must sign up/login to send Expressions of Interest (EOI)
- **Candidates** receive email notifications when someone shows interest
- **Admins** can manage candidates and view EOI logs

**Current Status:** Fully functional MVP deployed on Railway (temporary hosting)

---

## Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Next.js App   │ ───────>│  Express API    │
│   (Frontend)    │         │   (Backend)     │
└─────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   PostgreSQL    │
                            │   (Database)    │
                            └─────────────────┘
```

- **Frontend:** Next.js 14 with App Router, deployed on Vercel
- **Backend:** Express.js API, deployed on Railway
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT tokens + NextAuth (hybrid approach)

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js + Custom JWT
- **State Management:** React Context API
- **HTTP Client:** Fetch API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Email:** Nodemailer
- **Validation:** Zod
- **Rate Limiting:** express-rate-limit

### Database
- **Type:** PostgreSQL
- **ORM:** Prisma
- **Migrations:** Prisma Migrate

---

## Project Structure

```
referral-discovery-portal/
├── frontend/                 # Next.js application
│   ├── app/                 # App Router pages
│   │   ├── candidates/      # Candidate browsing
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page
│   │   ├── admin/           # Admin dashboard
│   │   └── account/         # User account page
│   ├── lib/                 # Utilities and API clients
│   └── components/          # Reusable components
│
├── backend/                 # Express API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── controllers/     # Business logic
│   │   ├── services/        # Service layer (email, etc.)
│   │   ├── repositories/    # Database access layer
│   │   ├── middleware/      # Auth, error handling, etc.
│   │   ├── validators/      # Zod validation schemas
│   │   └── config/          # Configuration
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   └── scripts/             # Utility scripts
│
└── docs/                    # Documentation
```

---

## Environment Variables

### Backend (.env)

**Required:**
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key-min-32-chars
FRONTEND_URL=https://your-frontend-domain.com
```

**Email Configuration (SMTP):**
```env
SMTP_HOST=smtp.sendgrid.net          # or your SMTP host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey                      # or your SMTP username
SMTP_PASS=your-api-key-or-password   # SendGrid API key or password
FROM_EMAIL=Your Name <email@domain.com>
ADMIN_EMAIL=admin@domain.com
```

**Optional:**
```env
NODE_ENV=production
PORT=4000                             # Default: 4000
EOI_DAILY_LIMIT=20                    # Default: 20
REDIS_URL=redis://...                 # Optional: for Redis caching
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-frontend-domain.com
```

**Note:** Use the same `JWT_SECRET` in both frontend (NextAuth) and backend for token validation.

---

## Setup & Deployment

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Local Development Setup

**1. Clone Repository**
```bash
git clone <repository-url>
cd referral-discovery-portal
```

**2. Backend Setup**
```bash
cd backend
npm install
cp .env.example .env  # Create .env and fill in values
npx prisma migrate deploy
npx prisma generate
npm run dev
```

**3. Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env.local  # Create .env.local and fill in values
npm run dev
```

### Production Deployment

#### Option 1: Current Setup (Railway + Vercel)
- **Backend:** Railway (automatically deploys from GitHub)
- **Frontend:** Vercel (automatically deploys from GitHub)

#### Option 2: Your Own Infrastructure

**Backend:**
1. Set up PostgreSQL database
2. Set environment variables on your server
3. Run `npm install && npm run build`
4. Run `npx prisma migrate deploy`
5. Start with `npm start` or use PM2

**Frontend:**
1. Build: `npm run build`
2. Start: `npm start` or deploy static files
3. Configure reverse proxy if needed

---

## Database

### Schema Overview

**Models:**
- `Candidate` - Candidate profiles (email, skills, location, etc.)
- `Referrer` - Referrer accounts (email, password, profile, etc.)
- `EOILog` - Expression of Interest logs (who contacted whom)

### Important Security Notes
- `candidate_email` is **NEVER** exposed in public APIs
- Only admins can see full candidate emails
- Public candidate API only returns: `id`, `first_name`, `last_name_initial`, `target_roles`, `primary_skills`, `location`, `remote_ok`, `short_profile`, `availability_status`

### Running Migrations
```bash
cd backend
npx prisma migrate deploy  # Production
npx prisma migrate dev     # Development (creates new migration)
```

### Accessing Database
```bash
cd backend
npx prisma studio  # GUI for database
```

---

## API Endpoints

### Public Endpoints (No Auth)
- `GET /api/candidates` - List/search candidates (no email exposure)
- `GET /health` - Health check

### Protected Endpoints (Requires JWT)
- `POST /api/eoi` - Send Expression of Interest
- `GET /auth/me` - Get current user info

### Admin Endpoints (Requires Admin + JWT)
- `GET /api/admin/candidates` - List all candidates (with emails)
- `POST /api/admin/candidates` - Create candidate
- `PUT /api/admin/candidates/:id` - Update candidate
- `DELETE /api/admin/candidates/:id` - Delete candidate
- `GET /api/admin/eoi-logs` - View EOI logs
- `GET /api/admin/stats` - Dashboard statistics

### Auth Endpoints
- `POST /auth/register` - Register new referrer
- `POST /auth/login` - Login (email/password)
- `POST /auth/login/google` - Google OAuth login
- `POST /auth/send-otp` - Send OTP for phone login
- `POST /auth/verify-otp` - Verify OTP

**Full API Documentation:** See `docs/API.md` (if exists) or check `backend/src/routes/`

---

## Key Features

### 1. Candidate Browsing (Public)
- Browse candidates without login
- Filter by role, skills, location, availability
- Search functionality
- Pagination with "Load More"

### 2. Authentication
- Email/password login
- Google OAuth login
- Phone/OTP login (implemented, can be enabled)
- JWT-based session management

### 3. Expression of Interest (EOI)
- Select multiple candidates
- Send one-click EOI
- Candidate receives email notification
- Admin receives notification
- Daily limit per referrer (default: 20)

### 4. Admin Dashboard
- View all candidates
- Create/Edit/Delete candidates
- CSV import for bulk candidate creation
- View EOI logs
- Dashboard statistics

### 5. Email Notifications
- Candidates receive email when someone shows interest
- Admins receive notification for each EOI
- HTML email templates with referral details

---

## Important Notes

### Security
1. **Candidate PII Protection:**
   - `candidate_email` is never exposed in public APIs
   - Only admins can see full email addresses
   - Public endpoints strictly whitelist fields

2. **Rate Limiting:**
   - General API: 100 requests per 15 minutes
   - Auth endpoints: 5 requests per 15 minutes
   - EOI: 20 per day per referrer

3. **CORS:**
   - Configured to only allow requests from `FRONTEND_URL`
   - Update `FRONTEND_URL` in backend env when deploying

### Email Service
- Currently using SendGrid (recommended for cloud platforms)
- Can be switched to any SMTP provider
- Update `SMTP_*` environment variables

### Database
- Uses Prisma Migrate for schema management
- **Never** edit migrations manually once deployed
- Always create new migrations for schema changes

### Authentication
- Uses hybrid approach: NextAuth + JWT tokens
- JWT tokens stored in localStorage (frontend) + NextAuth session
- Token expiration: 7 days
- Refresh mechanism: Re-login required

---

## Known Issues & Future Work

### Current Limitations
1. Email sending timeout on Railway (SMTP port 587 blocked)
   - **Solution:** Use SendGrid or another cloud email provider
   - See `SMTP_SETUP_GUIDE.md` for details

2. No candidate acceptance workflow
   - Out of scope for MVP
   - Can be added in future iterations

3. No email queue/retry mechanism
   - Currently fails silently if email fails
   - Can be improved with Bull/Redis queue

### Recommended Improvements
1. Add email queue system (Bull/Redis)
2. Add email templates management
3. Add candidate acceptance workflow
4. Add analytics dashboard
5. Add email notification preferences
6. Add bulk EOI sending
7. Add candidate response tracking

---

## Quick Start Checklist for Tech Team

- [ ] Review this documentation
- [ ] Set up local development environment
- [ ] Review database schema in `backend/prisma/schema.prisma`
- [ ] Set up production database (PostgreSQL)
- [ ] Configure environment variables
- [ ] Set up SMTP/email service (SendGrid recommended)
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Deploy backend to your infrastructure
- [ ] Deploy frontend to your infrastructure
- [ ] Update CORS settings (`FRONTEND_URL` in backend)
- [ ] Test all flows:
  - [ ] Candidate browsing
  - [ ] User registration/login
  - [ ] EOI sending
  - [ ] Email delivery
  - [ ] Admin dashboard
- [ ] Set up monitoring/logging
- [ ] Set up backups for database
- [ ] Configure domain and SSL certificates

---

## Support & Questions

For questions about the codebase:
1. Check this documentation first
2. Review inline code comments
3. Check Prisma schema for data models
4. Review API routes in `backend/src/routes/`

**Code Quality:**
- Follows Next.js App Router conventions
- TypeScript for type safety
- Prisma for type-safe database access
- Zod for runtime validation
- Clean separation of concerns (routes → controllers → services → repositories)

---

## Deployment Configuration Files

- `backend/railway.json` - Railway deployment config (can be removed)
- `frontend/vercel.json` - Vercel deployment config (can be removed)
- `backend/render.yaml` - Render deployment config (optional)

**Note:** These platform-specific configs can be removed or adapted for your infrastructure.

---

**Last Updated:** [Date]  
**Version:** 1.0.0 (MVP)
