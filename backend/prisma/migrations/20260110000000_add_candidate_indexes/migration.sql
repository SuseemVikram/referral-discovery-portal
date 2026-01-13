-- Add indexes to improve query performance for candidates filtering
CREATE INDEX IF NOT EXISTS "candidates_is_active_idx" ON "candidates"("is_active");
CREATE INDEX IF NOT EXISTS "candidates_availability_status_idx" ON "candidates"("availability_status");
CREATE INDEX IF NOT EXISTS "candidates_location_idx" ON "candidates"("location");
CREATE INDEX IF NOT EXISTS "candidates_remote_ok_idx" ON "candidates"("remote_ok");
CREATE INDEX IF NOT EXISTS "candidates_createdAt_idx" ON "candidates"("createdAt");
