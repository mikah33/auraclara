# Aura Clara E-Commerce Components Documentation

This directory contains documentation for reusable e-commerce components built for the Aura Clara skincare website.

## Overview

All components follow the Aura Clara design system:
- **Colors**: Lavender gradient (#7D53B2 to #C197D2)
- **Fonts**: Cormorant Garamond (serif) + Montserrat (sans-serif)
- **Spacing**: CSS variables (--spacing-xs to --spacing-xl)
- **Shadows**: Soft lavender-tinted shadows

## Components

### 1. FAQ Accordion Component

**Location**: `/css/components/faq.css`

**Purpose**: Reusable accordion component for product-specific frequently asked questions.

**Usage**:
```html
<section class="faq-section">
    <h2 class="section-title-sm">Frequently Asked Questions</h2>
    <div class="faq-list">
        <div class="faq-item">
            <button class="faq-question" onclick="toggleFaq(this)">
                <span>Your question here?</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </button>
            <div class="faq-answer">
                <p>Your answer here.</p>
            </div>
        </div>
    </div>
</section>

<script>
function toggleFaq(button) {
    const item = button.parentElement;
    const isOpen = item.classList.contains('open');

    // Close all FAQs
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

    // Open clicked FAQ if it was closed
    if (!isOpen) {
        item.classList.add('open');
    }
}
</script>
```

**Features**:
- Smooth expand/collapse animation
- Only one FAQ open at a time
- Mobile responsive
- Hover states with lavender accent

**Product-Specific FAQ Content**:

For Clarity Patches:
- What type of acne do these work on?
- Can I wear makeup over the patches?
- How many patches are in each pack?
- Are these safe for sensitive skin?

For Face Sculpting Tool:
- How often should I use this?
- When will I see results?
- Is this safe for all skin types?
- Does it hurt?

For Masks:
- How long do I leave the mask on?
- Can I reuse the mask?
- How many times per week?
- Will it irritate sensitive skin?

---

### 2. Product Comparison Tool

**Location**: `/pages/compare.html`, `/js/compare.js`

**Purpose**: Interactive comparison table allowing users to select and compare up to 3 products side-by-side.

**Features**:
- Product selector with dropdowns
- Live preview of selected products
- Dynamic comparison table
- Competitor comparison section with "Why Choose Aura Clara" data
- Mobile responsive grid layout

**Comparison Fields**:
- Price
- Best For (use case)
- Skin Types
- Key Ingredients
- Results Timeline
- Usage Frequency

**JavaScript API**:
```javascript
// Product data structure
const productData = {
    'product-id': {
        name: 'Product Name',
        price: '$XX.XX',
        image: 'path/to/image.jpg',
        bestFor: 'Primary use case',
        skinTypes: 'Suitable skin types',
        ingredients: 'Key ingredients',
        timeline: 'When to expect results',
        frequency: 'How often to use'
    }
};

// Functions
selectProduct(slot, productId) // Select a product for comparison
clearSlot(slot) // Clear a comparison slot
generateComparison() // Generate the comparison table
```

---

### 3. Testimonials Page

**Location**: `/pages/testimonials.html`

**Purpose**: Showcase customer reviews, before/after transformations, and video testimonials.

**Sections**:
1. **Before & After Grid**: 3-column grid of transformation photos with overlaid customer quotes
2. **Written Testimonials**: Filterable grid of customer reviews (filter by product)
3. **Video Testimonials**: Embedded YouTube/Vimeo videos with customer stories
4. **CTA Section**: Call-to-action to shop or add a review

**Features**:
- Product filter buttons (All/Clarity Patches/Face Tool/Masks)
- Star ratings
- Verified buyer badges
- Hover effects and transitions
- Mobile responsive

**Filter Implementation**:
```javascript
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        testimonialCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});
```

---

### 4. Ingredients Page

**Location**: `/pages/ingredients.html`

**Purpose**: Complete transparency about every ingredient used in Aura Clara products.

**Sections**:
1. **Ingredient Glossary**: Expandable cards with ingredient details and benefits
2. **What We DON'T Use**: List of harmful ingredients avoided (parabens, sulfates, etc.)
3. **Certifications**: Clean beauty, vegan, cruelty-free badges
4. **Product-Specific Ingredient Lists**: Tabbed interface showing full ingredient lists per product

**Features**:
- Expandable ingredient cards (click to reveal details)
- Benefit lists with checkmarks
- Product tabs with smooth transitions
- Certification badges

**Expandable Card Implementation**:
```javascript
const ingredientCards = document.querySelectorAll('.ingredient-card');
ingredientCards.forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('expanded');
    });
});
```

---

### 5. Sustainability Page

**Location**: `/pages/sustainability.html`

**Purpose**: Showcase Aura Clara's environmental commitments and woman-owned business values.

**Sections**:
1. **Impact Metrics**: Large stat cards showing environmental impact (50K+ plastic saved, 100% carbon-neutral, etc.)
2. **Our Commitments**: 6-card grid of sustainability promises
3. **Packaging Philosophy**: Details on recyclable, minimal-waste packaging
4. **Certifications**: Third-party verified badges
5. **Woman-Owned Story**: Founder quote and business values

**Features**:
- Green gradient hero (#10B981)
- Large impact numbers with icons
- Founder quote block with border-left accent
- Sustainability badges

**Metric Cards**:
- Use green gradient background
- Large emoji icons
- 3rem font size for numbers
- Hover lift effect

---

## Design Patterns

### Color Usage

Primary lavender gradient:
```css
background: linear-gradient(135deg, var(--lavender-500) 0%, var(--lavender-600) 100%);
```

Green accent (sustainability):
```css
background: linear-gradient(135deg, #10B981 0%, #059669 100%);
```

### Typography Scale

```css
h1: clamp(2.5rem, 5vw, 4rem)
h2: clamp(2rem, 4vw, 3rem)
h3: clamp(1.5rem, 3vw, 2rem)
body: 1rem (16px)
small: 0.875rem (14px)
```

### Spacing

```css
--spacing-xs: 0.5rem
--spacing-sm: 1rem
--spacing-md: 2rem
--spacing-lg: 4rem
--spacing-xl: 6rem
```

### Border Radius

```css
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 16px
```

### Shadows

```css
--shadow-sm: 0 2px 8px rgba(230, 213, 245, 0.15)
--shadow-md: 0 4px 16px rgba(230, 213, 245, 0.25)
--shadow-lg: 0 8px 32px rgba(230, 213, 245, 0.35)
```

---

## Mobile Responsiveness

All components include mobile breakpoints:
- **768px**: Tablet layout adjustments
- **480px**: Mobile layout (single column, smaller text)

### Example Media Queries

```css
@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .section-title {
        font-size: 1.75rem;
    }
}
```

---

## Integration with Existing Site

### Navigation Updates

Add new pages to main navigation:
```html
<div class="nav-links">
    <a href="products/index.html">Shop</a>
    <a href="pages/testimonials.html">Reviews</a>
    <a href="pages/compare.html">Compare</a>
    <a href="pages/sustainability.html">Sustainability</a>
</div>
```

### Footer Updates

Add to "Learn" section:
```html
<div class="footer-section">
    <h4>Learn</h4>
    <a href="index.html#about">About Us</a>
    <a href="pages/ingredients.html">Ingredients</a>
    <a href="pages/testimonials.html">Testimonials</a>
    <a href="pages/compare.html">Compare</a>
    <a href="pages/sustainability.html">Sustainability</a>
</div>
```

### Sustainability Badges

Add to product pages:
```html
<div class="sustainability-badges">
    <span class="badge">🌱 100% Vegan</span>
    <span class="badge">🐰 Cruelty-Free</span>
    <span class="badge">♻️ Recyclable Packaging</span>
    <span class="badge">🚚 Carbon-Neutral Shipping</span>
</div>
```

---

## Testing Checklist

- [ ] All pages load without errors
- [ ] FAQ accordion expands/collapses smoothly
- [ ] Product comparison tool allows selecting 2-3 products
- [ ] Comparison table displays correctly
- [ ] Testimonial filters work properly
- [ ] Ingredient cards expand on click
- [ ] Product ingredient tabs switch correctly
- [ ] All pages are mobile responsive
- [ ] Navigation links work correctly
- [ ] Footer links work correctly
- [ ] Images load or show placeholders
- [ ] All interactive elements have hover states

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Future Enhancements

1. **FAQ Search**: Add search functionality to ingredient glossary
2. **Review Submission**: Form to submit customer reviews
3. **Video Upload**: Allow customers to upload video testimonials
4. **Comparison Export**: Export comparison table as PDF
5. **Sustainability Calculator**: Show environmental impact of user's purchases

---

## Support

For questions or issues with these components, contact the development team or reference the main project documentation.
