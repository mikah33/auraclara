# Subscription Payment Setup Guide

## Overview

This guide explains how to set up subscription-based payments for:
- Clarity Patches (36ct)
- V-Line Lifting Mask
- Bio-Collagen Mask (4pk)

## Current Status

✅ **Frontend UI is ready** - Subscribe & Save options already exist in the hero deals section
❌ **Backend not configured** - Need to set up Shopify subscriptions and update product mapping

---

## Step 1: Install Shopify Subscription App

You need to install a subscription app in your Shopify store. Here are the top options:

### Option A: Shopify Subscriptions (FREE - Recommended)
**Best for:** Simple subscriptions, no complex rules

1. Go to your Shopify Admin
2. Click **Apps** → **Shopify App Store**
3. Search for **"Shopify Subscriptions"**
4. Click **Add app** and install it
5. It's 100% free

### Option B: Recharge Subscriptions ($99/month)
**Best for:** Advanced features, dunning management, customer portal

### Option C: Bold Subscriptions ($49.99/month)
**Best for:** Complex subscription rules, prepaid options

**For this guide, we'll use Shopify Subscriptions (free).**

---

## Step 2: Create Subscription Plans in Shopify

Once you've installed Shopify Subscriptions:

### For Clarity Patches:
1. In Shopify Admin → **Products** → Find **"Clarity Patches (36ct)"**
2. Click **Add selling plan** (you'll see this option after installing the app)
3. Configure:
   - **Plan name:** Subscribe & Save
   - **Billing frequency:** Every 30 days (monthly)
   - **Discount:** 20% off ($10.39 instead of $12.99)
   - **Free shipping:** Yes

### For V-Line Lifting Mask:
1. Find **"V-Line Lifting Mask"** product
2. Add selling plan:
   - **Plan name:** Subscribe & Save
   - **Billing frequency:** Every 30 days
   - **Discount:** 20% off ($15.20 instead of $19.00)
   - **Free shipping:** Yes

### For Bio-Collagen Mask (4pk):
1. Find **"Bio-Collagen Mask"** product
2. Add selling plan:
   - **Plan name:** Subscribe & Save
   - **Billing frequency:** Every 30 days
   - **Discount:** 20% off ($19.99 instead of $24.99)
   - **Free shipping:** Yes

---

## Step 3: Get Subscription Variant IDs

After creating selling plans, you need the **selling plan group ID** for each product.

### How to find them:

**Method 1: Shopify Admin**
1. Go to product in Shopify Admin
2. Click **Manage** under Subscription plans
3. Copy the selling plan ID (looks like: `gid://shopify/SellingPlanGroup/123456`)

**Method 2: GraphQL Query**
Use this query in your Shopify GraphQL Admin API:

```graphql
{
  product(id: "gid://shopify/Product/YOUR_PRODUCT_ID") {
    title
    sellingPlanGroups(first: 5) {
      edges {
        node {
          id
          name
          sellingPlans(first: 5) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    }
  }
}
```

---

## Step 4: Update Product Mapping

Update `index.html` with subscription variant mappings:

Find this section in your HTML (around line 738):

```javascript
window.shopifyProductMap = {
    'clarity-patches': 'gid://shopify/ProductVariant/43768004313139',
    'clarity-patches-36ct': 'gid://shopify/ProductVariant/43768004313139',
    'face-sculpting-tool': 'gid://shopify/ProductVariant/43768004378675',
    'jawline-shaper': 'gid://shopify/ProductVariant/43768004411443',
    'jawline-shaper-set': 'gid://shopify/ProductVariant/43768004411443',
    'vline-mask': 'gid://shopify/ProductVariant/43768004444211',
    'v-line-lifting-mask': 'gid://shopify/ProductVariant/43768004444211',
    'bio-collagen-mask': 'gid://shopify/ProductVariant/43768004542515',
    'bio-collagen-mask-4pk': 'gid://shopify/ProductVariant/43768004542515'
};
```

**Add subscription mappings:**

```javascript
window.shopifyProductMap = {
    // One-time purchase variants (existing)
    'clarity-patches': 'gid://shopify/ProductVariant/43768004313139',
    'clarity-patches-36ct': 'gid://shopify/ProductVariant/43768004313139',
    'face-sculpting-tool': 'gid://shopify/ProductVariant/43768004378675',
    'jawline-shaper': 'gid://shopify/ProductVariant/43768004411443',
    'jawline-shaper-set': 'gid://shopify/ProductVariant/43768004411443',
    'vline-mask': 'gid://shopify/ProductVariant/43768004444211',
    'v-line-lifting-mask': 'gid://shopify/ProductVariant/43768004444211',
    'bio-collagen-mask': 'gid://shopify/ProductVariant/43768004542515',
    'bio-collagen-mask-4pk': 'gid://shopify/ProductVariant/43768004542515',

    // Subscription variants (ADD THESE - replace with your actual IDs)
    'clarity-patches-subscription': 'gid://shopify/SellingPlan/YOUR_SELLING_PLAN_ID',
    'vline-mask-subscription': 'gid://shopify/SellingPlan/YOUR_SELLING_PLAN_ID',
    'bio-collagen-mask-subscription': 'gid://shopify/SellingPlan/YOUR_SELLING_PLAN_ID'
};
```

---

## Step 5: Update Cart Logic to Handle Subscriptions

Your cart needs to distinguish between one-time purchases and subscriptions.

Create a new file: `/js/subscription-handler.js`

```javascript
// ========================================
// SUBSCRIPTION HANDLER
// ========================================

window.SubscriptionHandler = {
    // Check if a product option is a subscription
    isSubscription(optionValue) {
        return optionValue === 'subscribe';
    },

    // Get the correct variant ID based on selection
    getVariantId(productId, optionValue) {
        if (this.isSubscription(optionValue)) {
            // Get subscription variant ID
            return window.shopifyProductMap[`${productId}-subscription`];
        } else {
            // Get one-time purchase variant ID
            return window.shopifyProductMap[productId];
        }
    },

    // Add subscription item to cart
    addToCart(productData) {
        const selectedOption = productData.selectedOption; // 'one', 'bundle', or 'subscribe'
        const variantId = this.getVariantId(productData.productId, selectedOption);

        if (!variantId) {
            console.error('No variant ID found for:', productData);
            alert('Product configuration error. Please contact support.');
            return;
        }

        // Add to cart with subscription flag
        const cartItem = {
            id: productData.productId,
            name: productData.name,
            price: productData.price,
            image: productData.image,
            quantity: productData.quantity || 1,
            shopifyVariantId: variantId,
            isSubscription: this.isSubscription(selectedOption),
            subscriptionFrequency: this.isSubscription(selectedOption) ? '30 days' : null
        };

        // Get existing cart
        let cart = JSON.parse(localStorage.getItem('auraclara_cart') || '[]');

        // Check if item already exists
        const existingIndex = cart.findIndex(item =>
            item.id === cartItem.id &&
            item.isSubscription === cartItem.isSubscription
        );

        if (existingIndex > -1) {
            // Update quantity
            cart[existingIndex].quantity += cartItem.quantity;
        } else {
            // Add new item
            cart.push(cartItem);
        }

        // Save cart
        localStorage.setItem('auraclara_cart', JSON.stringify(cart));

        // Update cart UI
        if (window.updateCartDisplay) {
            window.updateCartDisplay();
        }

        // Show success message
        this.showSuccessMessage(cartItem);
    },

    showSuccessMessage(item) {
        const message = item.isSubscription
            ? `✓ ${item.name} added to cart (Subscription - ${item.subscriptionFrequency})`
            : `✓ ${item.name} added to cart`;

        // You can customize this to match your existing notification system
        console.log(message);
        alert(message);
    }
};
```

---

## Step 6: Update Main JavaScript

In your `js/main.js`, update the "Add to Cart" button handlers:

```javascript
// Handle deal card "Add to Cart" buttons
document.querySelectorAll('.btn-deal-cart').forEach(button => {
    button.addEventListener('click', function() {
        const dealCard = this.closest('.hero-deal-card');
        const productName = dealCard.querySelector('.deal-product-name').textContent;
        const selectedOption = dealCard.querySelector('input[type="radio"]:checked');

        if (!selectedOption) {
            alert('Please select an option');
            return;
        }

        const optionValue = selectedOption.value; // 'one', 'bundle', or 'subscribe'
        const price = dealCard.querySelector('.option-price').textContent;
        const productImage = dealCard.querySelector('.deal-product-img').src;

        // Get product ID from image or data attribute
        let productId = 'clarity-patches'; // Default
        if (productImage.includes('face-sculpting-tool')) {
            productId = 'face-sculpting-tool';
        } else if (productImage.includes('vline-mask')) {
            productId = 'vline-mask';
        } else if (productImage.includes('bio-collagen')) {
            productId = 'bio-collagen-mask';
        } else if (productImage.includes('jawline-shaper')) {
            productId = 'jawline-shaper';
        }

        // Use subscription handler
        window.SubscriptionHandler.addToCart({
            productId: productId,
            name: productName,
            price: parseFloat(price.replace('$', '')),
            image: productImage,
            selectedOption: optionValue,
            quantity: 1
        });
    });
});
```

---

## Step 7: Update Shopify Checkout

The Shopify checkout will automatically handle subscriptions when you pass the correct selling plan ID. Your existing `ShopifyClient` class needs a small update:

In `index.html`, find the `createCheckout` method and update it:

```javascript
async createCheckout(lineItems, customerEmail = null) {
    const query = `
        mutation cartCreate($input: CartInput!) {
            cartCreate(input: $input) {
                cart {
                    id
                    checkoutUrl
                    lines(first: 50) {
                        edges {
                            node {
                                id
                                quantity
                                merchandise {
                                    ... on ProductVariant {
                                        id
                                        title
                                    }
                                }
                                sellingPlanAllocation {
                                    sellingPlan {
                                        id
                                        name
                                    }
                                }
                            }
                        }
                    }
                    cost {
                        subtotalAmount {
                            amount
                            currencyCode
                        }
                        totalAmount {
                            amount
                            currencyCode
                        }
                    }
                }
                userErrors {
                    code
                    field
                    message
                }
            }
        }
    `;

    const input = {
        lines: lineItems.map(item => {
            const lineItem = {
                merchandiseId: item.variantId,
                quantity: item.quantity
            };

            // If it's a subscription, add selling plan
            if (item.isSubscription && item.variantId.includes('SellingPlan')) {
                lineItem.sellingPlanId = item.variantId;
            }

            return lineItem;
        })
    };

    if (customerEmail) {
        input.buyerIdentity = { email: customerEmail };
    }

    const data = await this.query(query, { input });
    if (data.cartCreate.userErrors.length > 0) {
        throw new Error(data.cartCreate.userErrors[0].message);
    }

    return {
        id: data.cartCreate.cart.id,
        webUrl: data.cartCreate.cart.checkoutUrl
    };
}
```

---

## Step 8: Display Subscription Info in Cart

Update your cart modal to show subscription details:

In your cart display code, add subscription badges:

```javascript
function renderCartItem(item) {
    const subscriptionBadge = item.isSubscription
        ? `<span class="subscription-badge">📦 Subscription - Delivers every 30 days</span>`
        : '';

    return `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                ${subscriptionBadge}
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">×</button>
            </div>
        </div>
    `;
}
```

Add CSS for the subscription badge:

```css
.subscription-badge {
    display: inline-block;
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    color: white;
    font-size: 0.625rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    margin-top: 0.25rem;
}
```

---

## Step 9: Testing Checklist

Before going live, test:

- [ ] Click "Subscribe & Save" on Clarity Patches → Add to Cart
- [ ] Verify cart shows "Subscription" badge
- [ ] Click Checkout → Verify Shopify checkout shows subscription details
- [ ] Complete test purchase with test card
- [ ] Check Shopify Admin → Orders to see subscription order
- [ ] Verify customer receives subscription confirmation email
- [ ] Test "Cancel anytime" functionality in Shopify customer portal

---

## Customer Benefits Display

Your UI already shows these benefits. Make sure they're clear:

✅ **Free shipping** on all subscriptions
✅ **20% discount** vs one-time purchase
✅ **Cancel anytime** - no commitment
✅ **Skip or pause** deliveries anytime
✅ **Change frequency** (monthly, every 2 months, etc.)

---

## Pricing Breakdown

### Clarity Patches (36ct)
- One-time: $12.99
- Subscribe & Save: $10.39/month (20% off)
- Customer saves: $2.60/month ($31.20/year)

### V-Line Lifting Mask
- One-time: $19.00
- Subscribe & Save: $15.20/month (20% off)
- Customer saves: $3.80/month ($45.60/year)

### Bio-Collagen Mask (4pk)
- One-time: $24.99
- Subscribe & Save: $19.99/month (20% off)
- Customer saves: $5.00/month ($60/year)

---

## Troubleshooting

### Issue: "Subscription variant ID not found"
**Solution:** Double-check your selling plan IDs in Shopify and update the product map

### Issue: Checkout doesn't show subscription
**Solution:** Verify the selling plan is attached to the product variant in Shopify

### Issue: Customer can't manage subscription
**Solution:** Enable customer accounts in Shopify Settings → Checkout → Customer accounts = Optional or Required

---

## Next Steps

1. Install Shopify Subscriptions app
2. Create selling plans for the 3 products
3. Get selling plan IDs
4. Update product mapping in `index.html`
5. Add `subscription-handler.js` file
6. Update cart display logic
7. Test thoroughly
8. Go live!

---

## Support Resources

- [Shopify Subscriptions Documentation](https://help.shopify.com/en/manual/products/subscriptions)
- [Selling Plans API](https://shopify.dev/docs/api/admin-graphql/2024-10/objects/SellingPlan)
- [Subscription Best Practices](https://www.shopify.com/blog/subscription-box-business)

---

**Questions?** Review this guide step-by-step. Each step must be completed in order for subscriptions to work properly.
