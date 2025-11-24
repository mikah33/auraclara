# Aura Clara - n8n Email Workflow Setup

## Overview
Use n8n to send welcome emails via Migadu SMTP when users sign up for the newsletter.

## n8n Workflow Steps

### 1. Create New Workflow in n8n

**Nodes needed:**
1. Webhook (trigger)
2. Send Email (SMTP)
3. Respond to Webhook

### 2. Configure Webhook Node

**Settings:**
- HTTP Method: POST
- Path: `/aura-clara-welcome-email`
- Authentication: None (or add header auth if you want)
- Response Mode: Respond Immediately

The webhook URL will be something like:
`https://your-n8n-instance.com/webhook/aura-clara-welcome-email`

### 3. Configure Send Email Node (SMTP)

**SMTP Settings:**
- **Host**: smtp.migadu.com
- **Port**: 465
- **SSL/TLS**: Yes
- **Username**: support@auraclara.store
- **Password**: $EasyMoney10

**Email Settings:**
- **From Name**: Aura Clara
- **From Email**: support@auraclara.store
- **To Email**: `{{ $json.email }}` (from webhook)
- **Subject**: Welcome to Aura Clara ✨ Here's Your 15% Off

**HTML Body**: (See template below)

### 4. Email HTML Template for n8n

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Cormorant Garamond', Georgia, serif;
      line-height: 1.6;
      color: #2D1B4E;
      margin: 0;
      padding: 0;
      background-color: #F9F7FC;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(125, 83, 178, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #7D53B2 0%, #C197D2 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      color: white;
      font-weight: 600;
      letter-spacing: 2px;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    h1 {
      font-size: 28px;
      color: #2D1B4E;
      margin: 0 0 20px 0;
      font-weight: 600;
    }
    .discount-box {
      background: linear-gradient(135deg, #E6D5F5 0%, #F3E8FF 100%);
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
      border: 2px dashed #7D53B2;
    }
    .discount-code {
      font-size: 36px;
      font-weight: 700;
      color: #7D53B2;
      letter-spacing: 4px;
      margin: 10px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #7D53B2 0%, #9B6FD6 100%);
      color: white;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background: #F9F7FC;
      padding: 30px;
      text-align: center;
      font-size: 13px;
      color: #6B4E8E;
    }
    .unsubscribe {
      margin-top: 20px;
      font-size: 12px;
    }
    .unsubscribe a {
      color: #7D53B2;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 class="logo">AURA CLARA</h2>
    </div>

    <div class="content">
      <h1>Welcome to Aura Clara ✨</h1>
      <p>Thank you for joining 50,000+ customers who wake up to clearer, more radiant skin.</p>

      <div class="discount-box">
        <div style="font-size: 14px; color: #6B4E8E; text-transform: uppercase; letter-spacing: 1px;">Your Exclusive Discount Code</div>
        <div class="discount-code">{{ $json.discount_code || 'WELCOME15' }}</div>
        <p style="margin: 10px 0 0 0; color: #6B4E8E;">Save 15% on your first order</p>
      </div>

      <div style="text-align: center;">
        <a href="https://auraclara.store/products" class="btn">Start Shopping</a>
      </div>

      <p style="margin-top: 30px;">We're excited to be part of your skincare journey. Stay tuned for exclusive offers, new product launches, and skincare tips.</p>
    </div>

    <div class="footer">
      <p><strong>Aura Clara</strong><br>Illuminate Your Beauty</p>
      <div class="unsubscribe">
        <p>You're receiving this because you signed up for Aura Clara updates.<br>
        <a href="https://auraclara.store/unsubscribe?token={{ $json.unsubscribe_token }}">Unsubscribe</a></p>
      </div>
    </div>
  </div>
</body>
</html>
```

### 5. Update Supabase Trigger to Call n8n

Replace the Edge Function trigger with a simple HTTP call to your n8n webhook:

```sql
-- Drop the old trigger
DROP TRIGGER IF EXISTS on_newsletter_signup ON newsletter_signups;
DROP FUNCTION IF EXISTS trigger_send_welcome_email();

-- Create new trigger that calls n8n webhook
CREATE OR REPLACE FUNCTION trigger_send_welcome_email_n8n()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.subscribed = true) THEN
    SELECT net.http_post(
      url := 'YOUR_N8N_WEBHOOK_URL_HERE',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object(
        'email', NEW.email,
        'discount_code', NEW.discount_code,
        'unsubscribe_token', NEW.unsubscribe_token::text
      )
    ) INTO request_id;

    RAISE LOG 'n8n webhook called for: %', NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_newsletter_signup
  AFTER INSERT ON newsletter_signups
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_welcome_email_n8n();
```

## Testing

1. Create the n8n workflow
2. Copy the webhook URL
3. Update the SQL trigger with your webhook URL
4. Run the SQL in Supabase
5. Sign up on your website
6. Check your email!

## n8n Workflow JSON (Import This)

You can import this workflow directly into n8n:
(I can create this for you once you have n8n set up)

