-- Create a trigger to automatically send welcome emails when someone signs up
-- This trigger calls the send-welcome-email Edge Function

-- First, create the trigger function
CREATE OR REPLACE FUNCTION trigger_send_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Only send email if this is a new subscription (not an update)
  IF (TG_OP = 'INSERT' AND NEW.subscribed = true) THEN
    -- Call the Edge Function via pg_net (Supabase's HTTP client)
    SELECT net.http_post(
      url := 'https://pcyohjfdxkujufprlkxh.supabase.co/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'record', jsonb_build_object(
          'email', NEW.email,
          'discount_code', NEW.discount_code,
          'unsubscribe_token', NEW.unsubscribe_token
        )
      )
    ) INTO request_id;

    RAISE LOG 'Welcome email trigger fired for: %', NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_newsletter_signup ON newsletter_signups;

CREATE TRIGGER on_newsletter_signup
  AFTER INSERT ON newsletter_signups
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_welcome_email();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION net.http_post TO postgres, anon, authenticated, service_role;
