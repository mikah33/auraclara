# Aura Clara - Email Newsletter Setup Guide

## Overview
This guide will help you set up automated welcome emails with Migadu SMTP and Supabase Edge Functions.

## Step 1: Update Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Located in: supabase/migrations/add_unsubscribe_fields.sql
```

This adds:
- `subscribed` - Boolean field (default true)
- `unsubscribe_token` - Unique UUID for unsubscribe links
- `unsubscribed_at` - Timestamp when user unsubscribed

## Step 2: Deploy Edge Functions

### Install Supabase CLI
```bash
npm install -g supabase
```

### Login to Supabase
```bash
supabase login
```

### Link your project
```bash
cd ~/aura-clara-website
supabase link --project-ref pcyohjfdxkujufprlkxh
```

### Set Environment Variables (Secrets)

```bash
# Migadu SMTP credentials
supabase secrets set MIGADU_USERNAME=hello@auraclara.com
supabase secrets set MIGADU_PASSWORD=your_migadu_password
supabase secrets set MIGADU_FROM_EMAIL=hello@auraclara.com

# Your website URL
supabase secrets set SITE_URL=https://www.auraclara.com

# Supabase credentials (for unsubscribe function)
supabase secrets set SUPABASE_URL=https://pcyohjfdxkujufprlkxh.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Deploy the Edge Functions

```bash
# Deploy welcome email function
supabase functions deploy send-welcome-email

# Deploy unsubscribe function
supabase functions deploy unsubscribe
```

## Step 3: Set Up Database Trigger

Run this SQL in Supabase SQL Editor:

```sql
-- Located in: supabase/migrations/setup_email_trigger.sql
```

This creates a trigger that automatically calls the `send-welcome-email` Edge Function whenever someone signs up.

## Step 4: Enable pg_net Extension

In Supabase Dashboard:
1. Go to **Database** → **Extensions**
2. Search for `pg_net`
3. Enable it

This is required for the trigger to make HTTP calls to Edge Functions.

## Step 5: Test the System

1. Go to your website
2. Trigger the exit intent popup
3. Enter your email
4. You should receive a welcome email with:
   - Discount code (WELCOME15)
   - Unsubscribe link
   - Beautiful HTML template

## How It Works

### Sign-up Flow:
1. User enters email in popup
2. Email saved to `newsletter_signups` table
3. Database trigger fires
4. Trigger calls `send-welcome-email` Edge Function
5. Edge Function sends email via Migadu SMTP
6. User receives welcome email

### Unsubscribe Flow:
1. User clicks unsubscribe link in email
2. Opens `/unsubscribe.html?token=xxx`
3. User confirms unsubscribe
4. Frontend calls `unsubscribe` Edge Function
5. Function updates database (sets `subscribed=false`)
6. User sees confirmation

## Email Template Features

The welcome email includes:
- ✨ Beautiful branded design
- 🎁 Discount code prominently displayed
- 🔗 Shop now button
- ✓ Trust badges (free shipping, guarantee, etc.)
- 🔗 Unsubscribe link (required by law)

## Migadu Configuration

### SMTP Settings Used:
- **Server**: smtp.migadu.com
- **Port**: 465 (SSL/TLS)
- **Security**: TLS
- **Auth**: Username/Password

### Email Limits:
- Migadu has sending limits based on your plan
- Free plan: Check Migadu documentation
- Paid plans: Higher limits

## Troubleshooting

### Email not sending?
1. Check Edge Function logs in Supabase Dashboard
2. Verify Migadu credentials are correct
3. Check `supabase secrets list` to confirm secrets are set
4. Test Migadu SMTP manually

### Trigger not firing?
1. Verify pg_net extension is enabled
2. Check database logs for errors
3. Manually test the Edge Function via Dashboard

### Unsubscribe not working?
1. Check Edge Function logs
2. Verify SUPABASE_SERVICE_ROLE_KEY is set correctly
3. Test the unsubscribe endpoint manually

## Security Notes

- ✅ Service role key is never exposed to frontend
- ✅ Unsubscribe tokens are unique UUIDs
- ✅ RLS policies protect database
- ✅ SMTP credentials stored as Supabase secrets
- ✅ Unsubscribe links include in all emails (CAN-SPAM compliant)

## Future Enhancements

Consider adding:
- [ ] Email verification (double opt-in)
- [ ] Preference center (instead of full unsubscribe)
- [ ] Multiple email templates (welcome, promotions, etc.)
- [ ] Email analytics (open rates, click rates)
- [ ] Scheduled newsletter campaigns
- [ ] Drip campaigns for new subscribers

## Support

For issues:
1. Check Supabase Edge Function logs
2. Check Migadu email logs
3. Review database trigger logs
4. Contact support if needed

---

**Created with ✨ by Claude Code**
