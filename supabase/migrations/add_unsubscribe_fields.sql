-- Add unsubscribe fields to newsletter_signups table
ALTER TABLE newsletter_signups
ADD COLUMN IF NOT EXISTS subscribed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

-- Create index on unsubscribe_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe_token ON newsletter_signups(unsubscribe_token);

-- Create index on subscribed status
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON newsletter_signups(subscribed);
