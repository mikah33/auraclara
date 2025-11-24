# Aura Clara Website

Premium skincare brand website featuring elegant lavender monotone design.

## 🎨 Brand Identity

**Color Palette:**
- Primary: Lavender (#E6D5F5)
- Accent: Rose Gold (#F4C2C2) & Gold (#D4AF37)
- Background: Cream (#FAF9F7)
- Text: Gray (#404040) & Black (#1A1A1A)

**Typography:**
- Headings: Cormorant Garamond (Serif)
- Body: Montserrat (Sans-serif)

**Logo:**
- Crescent moon with sunburst rays (favicon)
- Full wordmark with symbol (header/footer)

## 📁 File Structure

```
aura-clara-website/
├── index.html              # Main homepage
├── css/
│   └── style.css          # All styles (monotone lavender theme)
├── js/
│   └── main.js            # Interactive functionality
├── assets/
│   ├── images/
│   │   ├── logo.png       # Full logo with text
│   │   ├── og-image.jpg   # Social media preview
│   │   └── twitter-image.jpg
│   └── icons/
│       ├── favicon-16x16.png
│       ├── favicon-32x32.png
│       ├── apple-touch-icon.png
│       ├── android-chrome-192x192.png
│       ├── android-chrome-512x512.png
│       └── site.webmanifest
├── robots.txt
└── README.md
```

## 🚀 Setup Instructions

1. **Add Logo Files:**
   - Save the full Aura Clara logo as `assets/images/logo.png`
   - Save the crescent moon symbol (favicon) in various sizes:
     - 16x16px → `assets/icons/favicon-16x16.png`
     - 32x32px → `assets/icons/favicon-32x32.png`
     - 180x180px → `assets/icons/apple-touch-icon.png`
     - 192x192px → `assets/icons/android-chrome-192x192.png`
     - 512x512px → `assets/icons/android-chrome-512x512.png`

2. **Open the Website:**
   - Simply open `index.html` in your browser
   - Or use a local server: `python3 -m http.server 8000`

3. **Deploy:**
   - Upload to Shopify, Netlify, Vercel, or any hosting service
   - Update URLs in meta tags (search for "auraclara.com")

## ✨ Features

- **SEO Optimized:**
  - Complete meta tags (title, description, keywords)
  - Open Graph tags for social sharing
  - Twitter Card support
  - Structured data ready
  - Semantic HTML5

- **Accessibility:**
  - ARIA labels on all interactive elements
  - Skip to main content link
  - Keyboard navigation support
  - Alt text on all images
  - Color contrast WCAG AA compliant

- **Responsive Design:**
  - Mobile-first approach
  - Breakpoints: 480px, 768px, 1024px
  - Touch-friendly interactive elements

- **Performance:**
  - Lightweight CSS (no frameworks)
  - Vanilla JavaScript (no jQuery)
  - Optimized animations
  - Fast loading times

## 🎯 Brand Voice

- **Tone:** Elegant, spiritual, premium but accessible
- **Target Audience:** Gen Z & Millennials (18-35)
- **Personality:** Modern mystical, wellness-focused, sophisticated

## 📝 Content Sections

1. **Hero:** Brand introduction with crescent moon symbol
2. **Featured Product:** Clarity Patches (pimple patches)
3. **Philosophy:** Brand values and mission
4. **Newsletter:** Email capture
5. **Footer:** Navigation, social links, legal

## 🔧 Customization

**To change colors:**
Edit CSS variables in `css/style.css`:
```css
:root {
    --lavender-200: #E6D5F5;
    --rose-gold: #F4C2C2;
    --gold: #D4AF37;
    /* etc... */
}
```

**To add products:**
Duplicate the `.product-grid` section in `index.html`

**To update favicon:**
Replace files in `assets/icons/` with your crescent moon symbol

## 📱 Social Media

- Instagram: @AuraClara
- TikTok: @AuraClara
- Hashtags: #AuraClara #ClearAura #IlluminateYourBeauty

## 🛍️ E-commerce Integration

Ready to integrate with:
- Shopify (recommended)
- WooCommerce
- Custom cart system

Update cart functionality in `js/main.js`

---

**Built with love and lavender vibes ✨**
