# Supabase SMTP Quick Setup - Aura Clara

Your SparkPost API Key: `8ce3c51d8a1588b18b47af8d5211afe140f7ad7c`

## 🚀 Quick Setup Steps

### Step 1: Configure SMTP in Supabase

1. **Go to:** https://supabase.com/dashboard/project/pcyohjfdxkujufprlkxh/settings/auth
2. **Scroll to:** SMTP Settings
3. **Toggle:** Enable Custom SMTP = ON
4. **Enter these exact values:**

```
SMTP Host: smtp.sparkpostmail.com
SMTP Port: 587
SMTP User: SMTP_Injection
SMTP Pass: 8ce3c51d8a1588b18b47af8d5211afe140f7ad7c
Sender Email: noreply@send.auraclara.store
Sender Name: Aura Clara
```

5. **Click:** Save

### Step 2: Configure Site URL

1. **Still in Auth Settings, scroll to:** Site URL
2. **Set to:** `https://auraclara.store`
3. **Scroll to:** Redirect URLs
4. **Add these URLs** (one per line):

```
https://auraclara.store
https://auraclara.store/*
http://localhost:*
http://127.0.0.1:*
```

5. **Click:** Save

### Step 3: Customize Email Templates

1. **Go to:** https://supabase.com/dashboard/project/pcyohjfdxkujufprlkxh/auth/templates
2. **Click on:** Confirm signup
3. **Replace the subject line:**

```
Verify your Aura Clara account ✨
```

4. **Replace the email body with:**

```html
<h2>Welcome to Aura Clara! ✨</h2>

<p>We're so excited to have you in our circle.</p>

<p>Please confirm your email address by clicking the button below:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #E6D5F5; color: #000; text-decoration: none; border-radius: 8px; font-weight: 500;">Verify Email Address</a></p>

<p>Or copy and paste this link into your browser:</p>
<p style="font-size: 12px; color: #666;">{{ .ConfirmationURL }}</p>

<p>This link will expire in 24 hours.</p>

<p>If you didn't create an account with us, you can safely ignore this email.</p>

<p>With love and light,<br>
The Aura Clara Team</p>

<hr style="border: none; border-top: 1px solid #E6D5F5; margin: 20px 0;">

<p style="font-size: 12px; color: #999;">
Aura Clara | Illuminate Your Beauty<br>
<a href="https://auraclara.store" style="color: #E6D5F5;">auraclara.store</a>
</p>
```

5. **Click:** Save
6. **Repeat for other templates:**
   - Magic Link
   - Reset Password
   - Change Email Address

### Step 4: Test the Auth Flow

1. **Open your website** in an incognito window
2. **Click:** Account (in navigation)
3. **Click:** Create Account
4. **Fill in:**
   - Name: Your Name
   - Email: your-email@gmail.com
   - Password: TestPassword123
5. **Click:** Create Account
6. **Check your email** - should arrive in 1-2 minutes
7. **Click the verification link** in the email
8. **You should see:** "Email Verified!" message
9. **Try signing in** with your credentials

### Step 5: Verify SparkPost Sending

1. **Go to:** https://app.sparkpost.com/reports/summary
2. **Check:** You should see 1 sent email
3. **Status should be:** Delivered

## ✅ Configuration Complete!

Your auth system is now fully functional with:
- ✨ Email/password signup with verification
- 🔐 Secure login
- 🔄 Password reset
- 📧 Beautiful branded emails via SparkPost
- 👤 User account management

## 🔧 Troubleshooting

### Email not arriving?
1. Check SparkPost dashboard for delivery status
2. Check spam folder
3. Verify send.auraclara.store is verified in SparkPost

### Can't sign in after verification?
1. Make sure you clicked the verification link
2. Check Supabase Auth → Users to see if status is "Confirmed"
3. Try password reset if needed

### SMTP errors?
1. Verify API key is correct: `8ce3c51d8a1588b18b47af8d5211afe140f7ad7c`
2. Check that SparkPost account is active
3. Verify sending domain is set up correctly

## 🚨 Security Reminder

**NEVER** commit this API key to git or share it publicly. It's already in your codebase securely via Supabase configuration.

---

Need help? Check the full guide at `/docs/setup/supabase-smtp-configuration.md`
