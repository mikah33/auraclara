#!/bin/bash

# Aura Clara - Setup Email Secrets for Supabase Edge Functions

echo "Setting up Supabase secrets for email functionality..."

# Migadu SMTP Configuration
supabase secrets set MIGADU_USERNAME=support@auraclara.com
supabase secrets set MIGADU_PASSWORD='$EasyMoney10'
supabase secrets set MIGADU_FROM_EMAIL=support@auraclara.com

# Website URL
supabase secrets set SITE_URL=https://auraclara.store

echo ""
echo "✅ Secrets configured successfully!"
echo ""
echo "Note: You still need to set SERVICE_ROLE_KEY manually."
echo "Get it from: Supabase Dashboard → Settings → API → service_role key"
echo ""
echo "Run this command with your service role key:"
echo "supabase secrets set SERVICE_ROLE_KEY=your_service_role_key_here"
