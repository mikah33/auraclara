# 🧪 Conversion Features Test Checklist

## Quick Testing Guide

### 1. ✅ Exit-Intent Popup Test

**Desktop:**
- [ ] Open site in browser (http://localhost:3000 or your URL)
- [ ] Move mouse to top of browser (as if closing tab)
- [ ] Popup should appear with 15% discount offer
- [ ] Enter email and submit
- [ ] Should see success message with code `WELCOME15`
- [ ] Refresh page - popup should NOT appear again

**Mobile/Tablet:**
- [ ] Open site on phone or resize browser < 768px
- [ ] Scroll down 80% of page
- [ ] Popup should appear after 2 seconds
- [ ] Should be mobile-optimized (stacked layout)

**Reset Test:**
- Open browser console (F12)
- Run: `localStorage.removeItem('exitPopupShown')`
- Refresh page to test again

---

### 2. ✅ Social Proof Notifications Test

**Desktop:**
- [ ] Open site in browser
- [ ] Wait 5 seconds after page load
- [ ] Should see notification in bottom-left: "Sarah from Los Angeles just purchased..."
- [ ] Notification should disappear after 6 seconds
- [ ] New notification should appear 30-60 seconds later
- [ ] Click X button to dismiss - should close

**Mobile:**
- [ ] Open on mobile (< 768px width)
- [ ] Social proof should NOT appear (cleaner UX)

---

### 3. ✅ Guarantee Banner Test

- [ ] Open homepage
- [ ] Green banner should be visible at top above navigation
- [ ] Text: "60-Day Love It Guarantee - Try risk-free. Full refund even if used."
- [ ] Should have shield icon on left
- [ ] Should be responsive on mobile

---

### 4. ✅ Footer Trust Badges Test

- [ ] Scroll to footer
- [ ] Should see 4 trust badges:
  - 🔒 Secure Checkout
  - ✅ 60-Day Guarantee
  - 💰 Free Returns
  - ⚡ Fast Shipping
- [ ] Icons should be visible
- [ ] Layout should be 4 columns on desktop, 2 columns on mobile

---

## 🔍 Browser Console Check

Open browser console (F12) and check for:
- ✅ No JavaScript errors
- ✅ "📢 Social proof notification shown" log messages
- ✅ "✨ Supabase initialized" confirmation

---

## 📊 Expected Behavior Summary

| Feature | Trigger | Expected Result |
|---------|---------|-----------------|
| Exit Popup (Desktop) | Mouse leave top 50px | Popup appears with 15% offer |
| Exit Popup (Mobile) | 80% scroll OR 30 seconds | Popup appears with 15% offer |
| Social Proof (Desktop) | 5 seconds after load | Notification in bottom-left |
| Social Proof (Mobile) | N/A | Hidden (cleaner UX) |
| Guarantee Banner | Page load | Green banner above nav |
| Trust Badges | Scroll to footer | 4 badges visible |

---

## 🐛 Troubleshooting

**Popup not appearing?**
- Check console for errors
- Clear localStorage: `localStorage.clear()`
- Try incognito/private mode
- Verify JS files loaded in Network tab

**Social proof not showing?**
- Wait 5 seconds after page load
- Check if on desktop (> 768px width)
- Look for console logs

**Supabase integration issues?**
- Newsletter signup will still work without Supabase
- Form will show success even if backend fails
- Check Supabase dashboard for actual signups

---

## 📈 What to Monitor After Launch

1. **Email Capture Rate**: Target 10-15% of visitors
2. **Conversion Rate**: Should increase 30-50% over 2-4 weeks
3. **Bounce Rate**: Should decrease with trust signals
4. **Time on Site**: Should increase with social proof

---

## 🚀 Next Steps After Testing

1. **Deploy to Production**
   - Push to GitHub
   - Deploy via Netlify/Vercel
   - Clear CDN cache if applicable

2. **Set Up Shopify Discount Codes**
   - Create `WELCOME15` (15% off)
   - Create `BLACKFRI25` (25% off)
   - Create `GLOW15` (15% off)

3. **Monitor Performance**
   - Google Analytics
   - Microsoft Clarity (free heatmaps)
   - Shopify Analytics

4. **Phase 2 Implementation** (Optional)
   - Countdown timer on deals
   - Stock scarcity alerts
   - Before/after gallery
   - Review system

---

✅ **All features are live and ready to test!**
