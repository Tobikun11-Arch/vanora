-- Add match photo URL for Find Match swipe card
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS match_photo_url VARCHAR(500);
