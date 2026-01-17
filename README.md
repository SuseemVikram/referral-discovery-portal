# Referral Discovery Portal

A referral discovery platform where referrers can browse candidate profiles and send Expressions of Interest (EOI).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Local Development

**1. Backend Setup**
```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
npx prisma migrate dev
npx prisma generate
npm run dev
```

**2. Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env.local  # Configure environment variables
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

- `frontend/` - Next.js 14 application (App Router)
- `backend/` - Express.js API server
- `docs/` - Documentation

## 🔧 Environment Variables

### Backend
See `backend/.env.example` for required variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `FRONTEND_URL` - Frontend URL for CORS
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration

### Frontend
See `frontend/.env.example` for required variables.

**Required:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - Frontend URL

## 📚 Documentation

- **Full Technical Documentation:** See `HANDOVER_DOCUMENTATION.md`
- **SMTP Setup Guide:** See `SMTP_SETUP_GUIDE.md`
- **Deployment Guide:** See `DEPLOYMENT_GUIDE.md`

## 🛠 Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js, Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** JWT + NextAuth
- **Email:** Nodemailer

## 📝 Features

- Browse candidates without login
- Filter by role, skills, location
- Send Expressions of Interest (EOI)
- Email notifications to candidates and admins
- Admin dashboard for candidate management

## 🔒 Security

- Candidate emails are never exposed in public APIs
- Rate limiting on all endpoints
- JWT-based authentication
- CORS protection

## 📄 License

[Your License]

---

For detailed documentation, see `HANDOVER_DOCUMENTATION.md`
