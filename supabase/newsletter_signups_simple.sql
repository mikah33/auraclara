-- Drop existing table if needed (comment out if you want to keep existing data)
-- DROP TABLE IF EXISTS newsletter_signups CASCADE;

-- Create newsletter_signups table
CREATE TABLE IF NOT EXISTS newsletter_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    source TEXT NOT NULL,
    discount_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_signups_email_key ON newsletter_signups(email);

-- Enable Row Level Security
ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous inserts" ON newsletter_signups;
DROP POLICY IF EXISTS "Users can read own data" ON newsletter_signups;

-- Create policy to allow inserts from anyone (including anonymous)
CREATE POLICY "Allow anonymous inserts" ON newsletter_signups
    FOR INSERT
    WITH CHECK (true);

-- Create policy to allow everyone to read (for testing - restrict later)
CREATE POLICY "Allow all reads" ON newsletter_signups
    FOR SELECT
    USING (true);
