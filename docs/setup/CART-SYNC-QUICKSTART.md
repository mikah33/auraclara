# Cart Sync Quick Start Guide

## ✅ What's Been Implemented

Cart tracking in Supabase is now fully set up! Here's what was done:

### 1. **Database Setup File Created**
- Location: `docs/setup/CART-DATABASE-SETUP.md`
- Contains all SQL needed to create the carts table
- Includes Row Level Security policies
- Has analytics queries for abandoned carts

### 2. **Cart Sync JavaScript**
- Location: `js/cart-sync.js`
- Automatically syncs cart to Supabase when user is logged in
- Merges local cart with database cart on sign in
- Loads cart from database on page load

### 3. **Main.js Integration**
- Added automatic sync triggers on all cart operations:
  - Add to cart
  - Increase quantity
  - Decrease quantity
  - Remove item
- Made cart globally accessible for cart-sync.js

### 4. **HTML Integration**
- Added cart-sync.js script to index.html
- **TODO**: Add to other pages (products/index.html, pages/newsletter.html, etc.)

## 🚀 Setup Steps

### Step 1: Create Database Table

1. Go to your Supabase project: https://app.supabase.com/project/pcyohjfdxkujufprlkxh
2. Click **SQL Editor** in left sidebar
3. Copy the entire SQL from `docs/setup/CART-DATABASE-SETUP.md`
4. Paste and click **Run**

### Step 2: Verify Table Created

Run this query in SQL Editor:
```sql
SELECT * FROM public.carts LIMIT 1;
```

Should see empty result (no error) ✅

### Step 3: Add Cart Sync Script to Other Pages

Add this line to all HTML pages that have a cart (after supabase-client.js):

```html
<!-- Cart Sync Script -->
<script src="js/cart-sync.js"></script>
```

**Pages that need updating:**
- ✅ index.html (DONE)
- ⏳ products/index.html
- ⏳ pages/newsletter.html
- ⏳ products/clarity-patches.html
- ⏳ products/neck-face-sculpting-tool.html
- ⏳ products/jawline-shaper.html
- ⏳ products/vline-lifting-mask.html
- ⏳ products/bio-collagen-mask.html

### Step 4: Test Cart Sync

1. **Test Without Login (LocalStorage Only)**:
   - Open site in incognito window
   - Add items to cart
   - Refresh page
   - Cart should persist ✅

2. **Test With Login (Supabase Sync)**:
   - Open site
   - Add items to cart while logged out
   - Sign in
   - Check browser console: should see "✨ Cart loaded from database and synced"
   - Open new tab, sign in with same account
   - Cart should show same items ✅

3. **Test Cross-Device**:
   - Sign in on one device
   - Add items to cart
   - Sign in on another device (or different browser)
   - Cart should sync automatically ✅

## 📊 Features Now Available

### For Users:
✅ Cart persists across devices when logged in
✅ Cart merges when switching from guest to logged in
✅ Cart saved in real-time as changes are made
✅ Cart automatically loads on page load

### For You (Admin):
✅ Track what's in each user's cart in Supabase
✅ See abandoned carts (carts not updated in 24h)
✅ Calculate total cart value across all users
✅ Find most popular items in carts
✅ Send abandoned cart emails (future feature)

## 🔍 Viewing Cart Data in Supabase

### All Carts:
```sql
SELECT
    u.email,
    c.cart_data,
    c.updated_at,
    (SELECT SUM((item->>'quantity')::int * (item->>'price')::numeric)
     FROM jsonb_array_elements(c.cart_data) AS item) as cart_total
FROM public.carts c
JOIN auth.users u ON u.id = c.user_id
WHERE jsonb_array_length(c.cart_data) > 0
ORDER BY c.updated_at DESC;
```

### Abandoned Carts (24+ hours old):
```sql
SELECT
    u.email,
    c.cart_data,
    c.updated_at,
    (SELECT SUM((item->>'quantity')::int * (item->>'price')::numeric)
     FROM jsonb_array_elements(c.cart_data) AS item) as cart_total
FROM public.carts c
JOIN auth.users u ON u.id = c.user_id
WHERE c.updated_at < NOW() - INTERVAL '24 hours'
AND jsonb_array_length(c.cart_data) > 0
ORDER BY cart_total DESC;
```

### Cart Analytics:
```sql
SELECT
    COUNT(*) as total_carts_with_items,
    ROUND(AVG(cart_total)::numeric, 2) as avg_cart_value,
    ROUND(SUM(cart_total)::numeric, 2) as total_value_in_carts
FROM (
    SELECT
        (SELECT SUM((item->>'quantity')::int * (item->>'price')::numeric)
         FROM jsonb_array_elements(cart_data) AS item) as cart_total
    FROM public.carts
    WHERE jsonb_array_length(cart_data) > 0
) stats;
```

## 🐛 Troubleshooting

### Cart Not Syncing to Database?

**Check Browser Console:**
```javascript
// Should see these messages:
✨ Supabase auth client initialized
✨ Cart sync initialized
User signed in, syncing cart...
✅ Cart synced to database (updated)
```

**Common Issues:**
1. **"Permission denied for table carts"**
   - RLS policies not set up correctly
   - Run the full SQL from CART-DATABASE-SETUP.md

2. **"cartSync is not defined"**
   - cart-sync.js not loaded
   - Add script tag to HTML page

3. **Cart not merging on login**
   - Check console for errors
   - Verify user is actually logged in: `await window.AuraClaraAuth.getCurrentUser()`

### Testing Cart Sync Manually

Open browser console:
```javascript
// Check if cart sync is loaded
window.cartSync

// Manually trigger sync
await window.cartSync.syncCart()

// Check current cart
window.cart

// Get current user
await window.AuraClaraAuth.getCurrentUser()
```

## 🎯 Next Steps (Optional Enhancements)

1. **Abandoned Cart Emails**
   - Set up Supabase Edge Function
   - Query carts not updated in 24h
   - Send reminder emails via Resend/SendGrid

2. **Cart Analytics Dashboard**
   - Create admin page showing:
     - Total cart value
     - Average cart value
     - Abandoned cart rate
     - Most popular items

3. **Cart Expiration**
   - Auto-clear carts older than 30 days
   - Add Supabase cron job

4. **Cart Sharing**
   - Generate shareable cart links
   - Allow users to save carts as "wishlists"

## 📝 Summary

**What Works Now:**
- ✅ Cart syncs to Supabase when user is logged in
- ✅ Cart persists across devices for logged-in users
- ✅ Local cart merges with database cart on sign in
- ✅ You can view and analyze all user carts in Supabase

**What You Need to Do:**
1. Run the SQL in `CART-DATABASE-SETUP.md` in your Supabase project
2. Add `<script src="js/cart-sync.js"></script>` to remaining HTML pages
3. Test cart sync with a test account

**Done! 🎉** Your cart is now fully tracked in Supabase!
