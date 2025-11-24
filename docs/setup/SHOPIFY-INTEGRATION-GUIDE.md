# Shopify Integration Guide - Aura Clara

## ✅ What's Been Set Up

### 1. Shopify Store Created
- **Store:** aura clara
- **Domain:** `xq0qhk-h0.myshopify.com`
- **Storefront API:** Connected and ready

### 2. API Credentials
- ✅ Storefront Access Token configured
- ✅ API permissions set (checkout, products, customers)
- ✅ Shopify client JavaScript created

### 3. Files Created
- `js/shopify-client.js` - Shopify API integration
- This guide

## 🚀 Next Steps

### Step 1: Add Shopify Script to Your Website

Add this line to your HTML pages (after supabase-client.js, before main.js):

```html
<!-- Shopify Integration -->
<script src="js/shopify-client.js"></script>
```

**Pages that need it:**
- index.html
- products/index.html
- All product detail pages
- pages/checkout.html (if you have one)

### Step 2: Add Products to Shopify

1. Go to Shopify Admin: https://admin.shopify.com/store/xq0qhk-h0
2. Click **Products** → **Add product**

**For each of your products, add:**

| Product Name | Price | SKU | Images |
|-------------|-------|-----|--------|
| Clarity Patches | $29.99 | CLARITY-01 | Upload from your site |
| Neck & Face Sculpting Tool | $39.99 | SCULPT-01 | Upload from your site |
| Jawline Shaper | $34.99 | JAWLINE-01 | Upload from your site |
| V-Line Lifting Mask | $24.99 | VLINE-01 | Upload from your site |
| Bio Collagen Mask | $19.99 | COLLAGEN-01 | Upload from your site |

**Important:**
- Set **Inventory tracking** to "Shopify"
- Set **Quantity** to 0 initially (we'll sync with DSers later)
- Click **Add product** after each one

### Step 3: Get Shopify Product IDs

After adding products, run this in your browser console on your site:

```javascript
// This will list all your Shopify products
const products = await window.ShopifyClient.getProducts();
console.table(products.map(p => ({
    title: p.title,
    id: p.id,
    variantId: p.variants.edges[0].node.id,
    price: p.priceRange.minVariantPrice.amount
})));
```

**Copy the output!** You'll need to map these IDs to your existing products.

### Step 4: Map Your Products to Shopify

You need to add `shopifyVariantId` to each product in your site.

**Option A: Add to main.js products array**

In `js/main.js`, find your products and add the Shopify variant IDs:

```javascript
const products = {
    'clarity-patches': {
        name: 'Clarity Patches',
        price: 29.99,
        shopifyVariantId: 'gid://shopify/ProductVariant/XXXXXXXXX', // Add this
        // ... rest of product data
    },
    // ... other products
};
```

**Option B: Create a mapping file**

Create `js/shopify-product-map.js`:

```javascript
window.shopifyProductMap = {
    'clarity-patches': 'gid://shopify/ProductVariant/XXXXXXXXX',
    'neck-face-sculpting-tool': 'gid://shopify/ProductVariant/XXXXXXXXX',
    'jawline-shaper': 'gid://shopify/ProductVariant/XXXXXXXXX',
    'vline-lifting-mask': 'gid://shopify/ProductVariant/XXXXXXXXX',
    'bio-collagen-mask': 'gid://shopify/ProductVariant/XXXXXXXXX'
};
```

### Step 5: Update Checkout Button

Find your checkout button code in `js/main.js` and replace it with:

```javascript
// In your checkout button click handler
checkoutBtn.addEventListener('click', async () => {
    try {
        // Get current user email if logged in
        const user = await window.AuraClaraAuth?.getCurrentUser();
        const email = user?.email || null;

        // Show loading state
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Creating checkout...';

        // Create Shopify checkout
        await window.ShopifyClient.checkoutFromCart(cart, email);

        // User will be redirected to Shopify checkout
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Error creating checkout. Please try again.');
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Checkout';
    }
});
```

### Step 6: Test Checkout Flow

1. **Add a product to cart** on your site
2. **Click checkout**
3. Should redirect to Shopify checkout page
4. Complete test order (use Shopify test card: `4242 4242 4242 4242`)

## 🎯 Setting Up DSers (Dropshipping)

### Step 1: Install DSers App

1. Go to Shopify App Store: https://apps.shopify.com/dsers
2. Click **Add app**
3. Click **Install**

### Step 2: Connect to AliExpress

1. Open DSers app in your Shopify admin
2. Click **Connect to AliExpress**
3. Sign in with your AliExpress account
4. Authorize the connection

### Step 3: Import Products from AliExpress

1. In DSers, click **Find Suppliers**
2. Search for your products on AliExpress
3. Click **Import to Import List**
4. Edit product details (title, price, description)
5. Click **Push to Shopify**

**This will:**
- Create/update products in Shopify
- Link them to AliExpress suppliers
- Set up automatic order fulfillment

### Step 4: Set Pricing Rules

1. In DSers, click **Settings** → **Pricing Rules**
2. Set your markup (e.g., Cost × 2 = Your Price)
3. Click **Save**

### Step 5: Configure Auto Order Settings

1. Click **Settings** → **Auto Order Settings**
2. Enable **Auto Order**
3. Set fulfillment preferences
4. Click **Save**

**Now when orders come in:**
1. Customer orders on your site → Shopify checkout
2. Order appears in Shopify admin
3. DSers automatically orders from AliExpress
4. Tracking number syncs to Shopify
5. Customer gets tracking email

## 🐛 Troubleshooting

### Error: "Cannot create checkout"
- **Check:** Are your products published in Shopify?
- **Check:** Do your cart items have `shopifyVariantId`?
- **Check:** Is the Shopify client script loaded?

### Error: "Invalid variant ID"
- **Check:** Did you copy the full variant ID (starts with `gid://shopify/ProductVariant/`)?
- **Check:** Is the product still available in Shopify?

### DSers not showing orders
- **Check:** Is DSers installed and connected?
- **Check:** Did you push products from DSers to Shopify?
- **Check:** Are orders marked as "paid" in Shopify?

### Test Checkout Without Real Payment

Use Shopify's test mode:
1. Shopify Admin → **Settings** → **Payments**
2. Enable **Shopify Payments test mode**
3. Use test card: `4242 4242 4242 4242`, any future date, any CVV

## 📊 What Happens Now

**Customer Journey:**
1. Browses your beautiful Aura Clara site
2. Adds products to cart (synced to Supabase)
3. Clicks checkout
4. Redirected to Shopify checkout page
5. Enters shipping/payment info
6. Order placed

**Behind the Scenes:**
1. Order appears in Shopify admin
2. DSers detects new order
3. DSers automatically orders from AliExpress supplier
4. Supplier ships to customer
5. Tracking number syncs to Shopify
6. Customer gets tracking email
7. You keep the profit!

## 💰 Pricing Strategy

**Example:**
- AliExpress Cost: $5
- Shipping: $2
- **Total Cost:** $7
- **Your Price:** $29.99
- **Profit:** $22.99 per item

DSers can automatically calculate and apply your markup!

## 🎉 You're Ready!

Once you complete the steps above, you'll have:
- ✅ Beautiful custom storefront (your site)
- ✅ Professional checkout (Shopify)
- ✅ Automated fulfillment (DSers)
- ✅ Cross-device cart sync (Supabase)

**No inventory needed, no shipping hassles!**

## 📝 Quick Reference

**Shopify Admin:** https://admin.shopify.com/store/xq0qhk-h0
**DSers App:** Open from Shopify Admin → Apps
**Test Checkout:** Use card `4242 4242 4242 4242`

## 🚀 Next Task

**Add the shopify-client.js script to your HTML pages and add products to Shopify!**
