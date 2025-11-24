-- Add discount_code column to newsletter_signups table
ALTER TABLE newsletter_signups
ADD COLUMN IF NOT EXISTS discount_code TEXT;

-- Optionally set a default value for existing rows
UPDATE newsletter_signups
SET discount_code = 'WELCOME15'
WHERE discount_code IS NULL;
