# Newsletter Database Setup

## Create the Newsletter Table in Supabase

1. **Go to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/pcyohjfdxkujufprlkxh/sql/new

2. **Paste this SQL and click "Run":**

```sql
-- Create newsletter signups table
CREATE TABLE IF NOT EXISTS newsletter_signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT DEFAULT 'website',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public newsletter signup)
CREATE POLICY "Anyone can subscribe to newsletter"
    ON newsletter_signups
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Only authenticated users can view their own subscription
CREATE POLICY "Users can view own subscription"
    ON newsletter_signups
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR email = auth.email());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_signups(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_user_id ON newsletter_signups(user_id);
```

3. **Verify the table was created:**
   - Go to Table Editor: https://supabase.com/dashboard/project/pcyohjfdxkujufprlkxh/editor
   - You should see "newsletter_signups" table

## How It Works

- Users can subscribe via the newsletter form on your website
- Email addresses are saved to Supabase
- Duplicate emails are automatically prevented (unique constraint)
- You can export the email list anytime from Supabase

## Export Newsletter Subscribers

To get your email list:

1. Go to Table Editor: https://supabase.com/dashboard/project/pcyohjfdxkujufprlkxh/editor
2. Click on "newsletter_signups" table
3. Click "Export" button
4. Choose CSV format
5. Import to your email marketing platform (Mailchimp, SendGrid, etc.)

## Optional: Set Up Email Notifications

To get notified when someone subscribes, you can set up a database trigger:

```sql
-- Create notification function
CREATE OR REPLACE FUNCTION notify_new_subscriber()
RETURNS TRIGGER AS $$
BEGIN
    -- This would send an email notification
    -- You'll need to implement this via Edge Function
    PERFORM pg_notify('new_subscriber', json_build_object(
        'email', NEW.email,
        'subscribed_at', NEW.subscribed_at
    )::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_newsletter_signup
    AFTER INSERT ON newsletter_signups
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_subscriber();
```

---

✨ Your newsletter signup is now ready!
