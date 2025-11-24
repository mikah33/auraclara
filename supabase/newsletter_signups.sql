-- ========================================
-- AURA CLARA - Newsletter Signups Table
-- ========================================

-- Create newsletter_signups table
CREATE TABLE IF NOT EXISTS newsletter_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    source TEXT NOT NULL,
    discount_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_signups(email);

-- Create index on source for analytics
CREATE INDEX IF NOT EXISTS idx_newsletter_source ON newsletter_signups(source);

-- Enable Row Level Security
ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anonymous users
CREATE POLICY "Allow anonymous inserts" ON newsletter_signups
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create policy to allow authenticated users to read their own data
CREATE POLICY "Users can read own data" ON newsletter_signups
    FOR SELECT
    TO authenticated
    USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_newsletter_signups_updated_at
    BEFORE UPDATE ON newsletter_signups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT INSERT ON newsletter_signups TO anon;
GRANT SELECT ON newsletter_signups TO authenticated;
