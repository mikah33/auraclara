# Aura Clara Email Templates

Beautiful, branded HTML email templates for Supabase authentication.

## Templates Included

1. **confirmation-email.html** - Welcome email with email verification (Sign Up)
2. **password-reset-email.html** - Password reset link
3. **magic-link-email.html** - Passwordless sign-in link
4. **change-email.html** - Email address change confirmation

## How to Use in Supabase

### Step 1: Access Email Templates

1. Go to: https://supabase.com/dashboard/project/pcyohjfdxkujufprlkxh/auth/templates
2. You'll see 4 template types:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

### Step 2: Copy & Paste Templates

For each template:

1. **Click on the template** (e.g., "Confirm signup")
2. **Copy the entire HTML** from the corresponding file
3. **Paste into Supabase** email body field
4. **Update the subject line** to match:
   - Confirm signup: `Verify your Aura Clara account ✨`
   - Magic Link: `Your Aura Clara sign-in link ✨`
   - Reset Password: `Reset your Aura Clara password`
   - Change Email: `Confirm your new email address`
5. **Click Save**

### Step 3: Test Each Template

Send test emails by:
- Sign Up → Check confirmation email
- Forgot Password → Check reset email
- Magic Link → Check sign-in email
- Change Email → Check confirmation email

## Template Features

✨ **Brand-Aligned Design**
- Lavender gradient header matching Aura Clara brand
- Cormorant Garamond serif headings
- Elegant emoji icons (✨🌙🔑📧)
- Rounded corners and soft shadows

🎨 **Professional Layout**
- Mobile-responsive (600px max width)
- Centered content with proper spacing
- Clear call-to-action buttons
- Alternative text link for accessibility

🔒 **Security Elements**
- Expiration time notices
- Security warnings for unexpected emails
- Clear instructions for suspicious activity

📱 **Social Integration**
- Instagram and TikTok links in footer
- Branded signature
- Website link

## Customization

### Change Colors

Main brand color (lavender):
```css
background: linear-gradient(135deg, #E6D5F5 0%, #D4C5E8 100%);
```

### Change Button Text

Find this line:
```html
<a href="{{ .ConfirmationURL }}" style="...">
    Verify Email Address  <!-- Change this text -->
</a>
```

### Change Footer Text

Update social links and website URL in the footer section.

## Testing Checklist

Before going live, test:

- [ ] Confirmation email arrives within 2 minutes
- [ ] All links work and redirect correctly
- [ ] Button displays correctly on mobile
- [ ] Alternative text link works
- [ ] Social icons display (may need hosting)
- [ ] Email renders in Gmail, Outlook, Apple Mail
- [ ] No broken images or formatting issues

## Troubleshooting

### Social Icons Not Showing

The templates reference:
```
https://auraclara.store/assets/icons/instagram-icon.png
https://auraclara.store/assets/icons/tiktok-icon.png
```

If these don't exist, either:
1. Create simple 24x24px PNG icons
2. Remove the social section
3. Use emoji instead: 📷 (Instagram) 🎵 (TikTok)

### Fonts Not Rendering

Email clients have limited font support. The templates use:
- Primary: Cormorant Garamond (web font, may fallback)
- Fallback: Georgia, serif (system font)

This ensures emails look good even if web fonts don't load.

### Colors Look Different

Some email clients alter colors slightly. Test in:
- Gmail (web and mobile app)
- Apple Mail
- Outlook
- Yahoo Mail

## Best Practices

1. **Keep templates simple** - Complex CSS may break in email clients
2. **Use tables for layout** - Most reliable method for emails
3. **Inline all CSS** - External stylesheets don't work in emails
4. **Test thoroughly** - Check in multiple email clients
5. **Monitor delivery** - Watch SparkPost dashboard for bounces/spam

---

**Need help?** Check `/docs/setup/supabase-smtp-configuration.md` for full SMTP setup guide.
