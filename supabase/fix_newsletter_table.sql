-- Remove the old trigger that's causing issues
DROP TRIGGER IF EXISTS update_newsletter_signups_updated_at ON newsletter_signups;

-- Add the discount_code column
ALTER TABLE newsletter_signups
ADD COLUMN IF NOT EXISTS discount_code TEXT;

-- Update existing rows with default discount code
UPDATE newsletter_signups
SET discount_code = 'WELCOME15'
WHERE discount_code IS NULL;
