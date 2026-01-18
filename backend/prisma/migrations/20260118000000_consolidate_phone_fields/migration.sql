-- Consolidate contact_number into phone_number
-- First, migrate any contact_number data to phone_number where phone_number is null
UPDATE "referrers"
SET "phone_number" = "contact_number"
WHERE "phone_number" IS NULL AND "contact_number" IS NOT NULL;

-- Normalize phone_number to E.164 format if needed (10-digit Indian numbers)
UPDATE "referrers"
SET "phone_number" = '+91' || "phone_number"
WHERE "phone_number" IS NOT NULL 
  AND "phone_number" !~ '^\+'
  AND LENGTH("phone_number") = 10
  AND "phone_number" ~ '^\d+$';

-- Drop the contact_number column
ALTER TABLE "referrers" DROP COLUMN "contact_number";
