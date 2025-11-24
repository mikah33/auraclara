-- Drop the old trigger if it exists
DROP TRIGGER IF EXISTS on_newsletter_signup ON newsletter_signups;
DROP FUNCTION IF EXISTS trigger_send_welcome_email();

-- Create a simpler trigger using Supabase webhooks
-- Note: You'll need to set up a webhook in Supabase Dashboard after running this

-- For now, let's check if pg_net is properly configured
SELECT net.http_post(
    url := 'https://pcyohjfdxkujufprlkxh.supabase.co/functions/v1/send-welcome-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeW9oamZkeGt1anVmcHJsa3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA0MjUzNSwiZXhwIjoyMDc1NjE4NTM1fQ.TAOfKcXEda6AYc04VVKt45I7DUVIAZAcrM4kx2ShyJU"}'::jsonb,
    body := '{"record": {"email": "test@example.com", "discount_code": "WELCOME15", "unsubscribe_token": "test-123"}}'::jsonb
) as request_id;

-- If that works, create the trigger function
CREATE OR REPLACE FUNCTION trigger_send_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  service_role_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeW9oamZkeGt1anVmcHJsa3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA0MjUzNSwiZXhwIjoyMDc1NjE4NTM1fQ.TAOfKcXEda6AYc04VVKt45I7DUVIAZAcrM4kx2ShyJU';
BEGIN
  -- Only send email if this is a new subscription (not an update)
  IF (TG_OP = 'INSERT' AND NEW.subscribed = true) THEN
    SELECT net.http_post(
      url := 'https://pcyohjfdxkujufprlkxh.supabase.co/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'record', jsonb_build_object(
          'email', NEW.email,
          'discount_code', NEW.discount_code,
          'unsubscribe_token', NEW.unsubscribe_token::text
        )
      )
    ) INTO request_id;

    RAISE LOG 'Welcome email HTTP request sent with ID: %', request_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_newsletter_signup
  AFTER INSERT ON newsletter_signups
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_welcome_email();
