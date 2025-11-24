-- Drop the old Edge Function trigger
DROP TRIGGER IF EXISTS on_newsletter_signup ON newsletter_signups;
DROP FUNCTION IF EXISTS trigger_send_welcome_email();
DROP FUNCTION IF EXISTS trigger_send_welcome_email_n8n();

-- Create new trigger that calls n8n webhook
CREATE OR REPLACE FUNCTION trigger_send_welcome_email_n8n()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.subscribed = true) THEN
    SELECT net.http_post(
      url := 'https://contractorai.app.n8n.cloud/webhook/c1e61594-6d8c-4183-8d68-c520f84970eb',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object(
        'email', NEW.email,
        'discount_code', NEW.discount_code,
        'unsubscribe_token', NEW.unsubscribe_token::text
      )
    ) INTO request_id;

    RAISE LOG 'n8n webhook called for email: %, request_id: %', NEW.email, request_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_newsletter_signup
  AFTER INSERT ON newsletter_signups
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_welcome_email_n8n();
