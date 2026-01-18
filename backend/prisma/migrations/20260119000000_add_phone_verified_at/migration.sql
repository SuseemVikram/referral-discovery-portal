-- Add phone_verified_at to referrers (set when user completes Re-verify OTP; cleared when phone_number changes)
ALTER TABLE "referrers" ADD COLUMN "phone_verified_at" TIMESTAMP(3);
