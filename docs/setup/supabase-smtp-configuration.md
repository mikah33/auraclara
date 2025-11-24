# Supabase Custom SMTP Configuration Guide

This guide will walk you through setting up custom SMTP for email verification in your Aura Clara Supabase project.

## Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: **pcyohjfdxkujufprlkxh**
3. Navigate to: **Authentication** → **Email Templates**

## Step 2: Configure Custom SMTP

1. Click on **Settings** in the sidebar
2. Go to **Authentication** → **SMTP Settings**
3. Toggle **Enable Custom SMTP** to ON

## Step 3: SparkPost SMTP Configuration

Enter the following SMTP details:

### SMTP Host
```
smtp.sparkpostmail.com
```

### SMTP Port
```
587
```
(Use TLS/STARTTLS)

### SMTP Username
```
SMTP_Injection
```

### SMTP Password
You need to create an API key in SparkPost:

1. Go to https://app.sparkpost.com
2. Navigate to: **Account** → **API Keys**
3. Click **Create API Key**
4. Settings:
   - **Name:** "Aura Clara Supabase Auth"
   - **Permissions:** Check "Send via SMTP"
   - **Grant:** "Send via SMTP" only
5. Click **Create API Key**
6. **Copy the API key** - this is your SMTP password

Paste the API key in the SMTP Password field.

### Sender Email
```
noreply@send.auraclara.store
```

### Sender Name
```
Aura Clara
```

## Step 4: Configure Email Templates

Navigate to **Authentication** → **Email Templates** and customize:

### Confirmation Email (Sign Up)
```
Subject: Verify your Aura Clara account ✨

Hi there,

Welcome to Aura Clara! We're so excited to have you in our circle.

Please confirm your email address by clicking the link below:

{{ .ConfirmationURL }}

This link will expire in 24 hours.

If you didn't create an account with us, you can safely ignore this email.

With love and light,
The Aura Clara Team

---
Aura Clara | Illuminate Your Beauty
https://auraclara.store
```

### Magic Link Email
```
Subject: Your Aura Clara sign-in link ✨

Hi there,

Click the link below to sign in to your Aura Clara account:

{{ .ConfirmationURL }}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.

With love and light,
The Aura Clara Team

---
Aura Clara | Illuminate Your Beauty
https://auraclara.store
```

### Password Reset Email
```
Subject: Reset your Aura Clara password

Hi there,

We received a request to reset your password for your Aura Clara account.

Click the link below to create a new password:

{{ .ConfirmationURL }}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

With love and light,
The Aura Clara Team

---
Aura Clara | Illuminate Your Beauty
https://auraclara.store
```

### Change Email Address
```
Subject: Confirm your new email address

Hi there,

Please confirm your new email address by clicking the link below:

{{ .ConfirmationURL }}

This link will expire in 24 hours.

If you didn't make this change, please contact us immediately.

With love and light,
The Aura Clara Team

---
Aura Clara | Illuminate Your Beauty
https://auraclara.store
```

## Step 5: Configure Redirect URLs

Go to **Authentication** → **URL Configuration**

### Site URL
```
https://auraclara.store
```

### Redirect URLs (Add both)
```
https://auraclara.store
https://auraclara.store/*
http://localhost:*
http://127.0.0.1:*
```

(The localhost URLs are for development/testing)

## Step 6: Test the Email Flow

1. Open your website in an incognito/private browser window
2. Click **Account** in the navigation
3. Click **Create Account**
4. Fill in:
   - Name: Test User
   - Email: your-email@example.com
   - Password: TestPassword123
5. Click **Create Account**
6. Check your email inbox for the verification email

### Expected Results:
- ✅ Email arrives within 1-2 minutes
- ✅ Email is from "Aura Clara <noreply@send.auraclara.store>"
- ✅ Email contains verification link
- ✅ Clicking link redirects to auraclara.store and shows "Email Verified!" message
- ✅ You can now sign in with your credentials

## Step 7: Monitor Email Delivery

### SparkPost Dashboard
1. Go to https://app.sparkpost.com
2. Navigate to **Reports** → **Summary**
3. You should see:
   - Sent emails count increasing
   - Delivery rate near 100%
   - No bounces or spam complaints

### Supabase Auth Logs
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. You should see new user with "Confirmed" status after verification

## Troubleshooting

### Email Not Arriving

**Check SparkPost:**
1. Go to SparkPost → Reports → Message Events
2. Search for recipient email
3. Check status:
   - "Delivered" = Email sent successfully
   - "Bounce" = Email rejected
   - "Spam Complaint" = Marked as spam

**Check Supabase:**
1. Go to Authentication → Logs
2. Look for "Send Email" events
3. Check for errors

### Common Issues

**Error: "Invalid SMTP credentials"**
- Solution: Regenerate SparkPost API key and update in Supabase

**Error: "Sending domain not verified"**
- Solution: Verify send.auraclara.store in SparkPost dashboard

**Emails going to spam**
- Solution: Ensure DKIM, SPF, DMARC records are all set up correctly in Netlify DNS
- Check https://mail-tester.com score (should be >8/10)

**Verification link not working**
- Solution: Check redirect URLs in Supabase settings
- Ensure Site URL matches your domain exactly

## Security Best Practices

1. **Never share your SparkPost API key** - treat it like a password
2. **Use separate API keys** for different services (don't reuse)
3. **Rotate API keys** every 90 days
4. **Monitor email logs** for suspicious activity
5. **Enable DMARC reporting** to catch spoofing attempts

## Production Checklist

Before going live, ensure:

- [ ] SparkPost sending domain verified (send.auraclara.store)
- [ ] SparkPost bounce domain verified (bounce.auraclara.store)
- [ ] All DNS records added to Netlify (MX, DKIM, SPF, DMARC)
- [ ] Custom SMTP configured in Supabase
- [ ] Email templates customized with Aura Clara branding
- [ ] Redirect URLs configured correctly
- [ ] Test signup flow completed successfully
- [ ] Test email verification completed successfully
- [ ] Test password reset completed successfully
- [ ] Email delivery rate >95% in SparkPost
- [ ] Mail-tester.com score >8/10
- [ ] DMARC reports being received

## Support

- **SparkPost Documentation:** https://support.sparkpost.com
- **Supabase Documentation:** https://supabase.com/docs/guides/auth
- **Email Deliverability Guide:** https://support.sparkpost.com/docs/deliverability

---

✨ Your authentication system is now ready for production!
