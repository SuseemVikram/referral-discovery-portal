/*
  Warnings:

  - A unique constraint covering the columns `[google_id]` on the table `referrers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone_number]` on the table `referrers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "referrers" ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "phone_number" TEXT,
ALTER COLUMN "full_name" DROP NOT NULL,
ALTER COLUMN "company" DROP NOT NULL,
ALTER COLUMN "role" DROP NOT NULL,
ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "eoi_logs_referrer_id_idx" ON "eoi_logs"("referrer_id");

-- CreateIndex
CREATE INDEX "eoi_logs_candidate_id_idx" ON "eoi_logs"("candidate_id");

-- CreateIndex
CREATE INDEX "eoi_logs_sent_at_idx" ON "eoi_logs"("sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "referrers_google_id_key" ON "referrers"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "referrers_phone_number_key" ON "referrers"("phone_number");

-- CreateIndex
CREATE INDEX "referrers_is_admin_idx" ON "referrers"("is_admin");
