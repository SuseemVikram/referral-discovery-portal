-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('Open', 'Paused');

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "candidate_email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name_initial" TEXT NOT NULL,
    "target_roles" TEXT[],
    "primary_skills" TEXT[],
    "location" TEXT NOT NULL,
    "remote_ok" BOOLEAN NOT NULL DEFAULT false,
    "cohort" TEXT,
    "short_profile" TEXT NOT NULL,
    "projects" JSONB NOT NULL,
    "availability_status" "AvailabilityStatus" NOT NULL DEFAULT 'Open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "linkedin" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eoi_logs" (
    "id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "referrer_email" TEXT NOT NULL,
    "referrer_name" TEXT NOT NULL,
    "referrer_company" TEXT NOT NULL,
    "candidate_email" TEXT NOT NULL,
    "candidate_name" TEXT NOT NULL,
    "candidate_roles" TEXT[],
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eoi_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidates_candidate_email_key" ON "candidates"("candidate_email");

-- CreateIndex
CREATE UNIQUE INDEX "referrers_email_key" ON "referrers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "eoi_logs" ADD CONSTRAINT "eoi_logs_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "referrers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eoi_logs" ADD CONSTRAINT "eoi_logs_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
