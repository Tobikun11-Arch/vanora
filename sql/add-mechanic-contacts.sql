-- Add optional mechanic contact fields to profiles
-- Safe for existing users (nullable columns)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mechanic_whatsapp VARCHAR(30),
  ADD COLUMN IF NOT EXISTS mechanic_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS mechanic_instagram VARCHAR(100);
