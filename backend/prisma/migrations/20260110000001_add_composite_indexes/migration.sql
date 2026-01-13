-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "candidates_is_active_availability_status_idx" ON "candidates"("is_active", "availability_status");
CREATE INDEX IF NOT EXISTS "candidates_is_active_location_idx" ON "candidates"("is_active", "location");
