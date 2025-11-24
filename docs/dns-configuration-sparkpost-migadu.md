# DNS Configuration Guide: SparkPost + Migadu for auraclara.store

**Research Date:** 2025-01-16
**Domain:** auraclara.store
**DNS Provider:** Netlify DNS
**Services:** SparkPost (transactional email) + Migadu (mailbox hosting)

---

## Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Complete DNS Records](#complete-dns-records)
3. [Subdomain Strategy](#subdomain-strategy)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Verification Process](#verification-process)
6. [Common Pitfalls](#common-pitfalls)
7. [Troubleshooting](#troubleshooting)

---

## Overview & Architecture

### Service Separation Strategy
- **Main Domain (auraclara.store)**: Migadu mailbox hosting for receiving email
- **Sending Subdomain (send.auraclara.store)**: SparkPost for transactional emails
- **Bounce Subdomain (bounce.auraclara.store)**: SparkPost bounce handling

### Why This Separation?
1. **Reputation Protection**: Isolate transactional sending from main domain
2. **Security**: Separate authentication records prevent conflicts
3. **Deliverability**: ISPs prefer strict subdomain policies
4. **Flexibility**: Independent DMARC policies per subdomain

---

## Complete DNS Records

### 1. Migadu Records (Main Domain: auraclara.store)

#### MX Records (Mail Receiving)
```
Type: MX
Name: @
Priority: 10
Value: aspmx1.migadu.com.
TTL: 600 (or Auto)

Type: MX
Name: @
Priority: 20
Value: aspmx2.migadu.com.
TTL: 600 (or Auto)
```

**Note:** In Netlify DNS, `@` represents the root domain (auraclara.store).

#### SPF Record (Sender Policy Framework)
```
Type: TXT
Name: @
Value: v=spf1 include:spf.migadu.com include:sparkpostmail.com ~all
TTL: 3600 (or Auto)
```

**Important:** This single SPF record authorizes BOTH Migadu and SparkPost to send email. Never create multiple SPF records - they must be combined into one.

#### DKIM Records (Migadu Authentication)
You will receive these from Migadu admin panel. They typically use key1, key2, key3 selectors:

```
Type: CNAME
Name: key1._domainkey
Value: key1.auraclara-store._domainkey.migadu.com.
TTL: 3600 (or Auto)
⚠️ Proxy: DISABLED (DNS Only)

Type: CNAME
Name: key2._domainkey
Value: key2.auraclara-store._domainkey.migadu.com.
TTL: 3600 (or Auto)
⚠️ Proxy: DISABLED (DNS Only)

Type: CNAME
Name: key3._domainkey
Value: key3.auraclara-store._domainkey.migadu.com.
TTL: 3600 (or Auto)
⚠️ Proxy: DISABLED (DNS Only)
```

**Critical:** DKIM CNAME records MUST NOT be proxied. Ensure Netlify DNS has no CDN/proxy enabled for these records.

#### DMARC Record (Main Domain)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@auraclara.store; ruf=mailto:dmarc@auraclara.store; fo=1
TTL: 3600 (or Auto)
```

**Policy Progression:**
- **Week 1-2:** `p=none` (monitoring only)
- **Week 3-4:** `p=quarantine; pct=10` (quarantine 10% of failures)
- **Week 5+:** `p=reject` (strict policy)

---

### 2. SparkPost Records (Sending Subdomain: send.auraclara.store)

#### TXT Verification Record
You'll get this from SparkPost when adding the domain. Format:
```
Type: TXT
Name: send
Value: [SparkPost will provide unique verification string]
TTL: 3600 (or Auto)
```

#### DKIM Record (SparkPost Authentication)
You'll get this from SparkPost. Uses `scph` selector with date/version:
```
Type: TXT
Name: scph0125._domainkey.send
Value: v=DKIM1; k=rsa; h=sha256; p=[SparkPost public key string]
TTL: 3600 (or Auto)
```

**Note:** The selector (scph0125) may change based on when SparkPost generates your keys. Use the exact value provided in your SparkPost dashboard.

#### DMARC Record (Sending Subdomain)
```
Type: TXT
Name: _dmarc.send
Value: v=DMARC1; p=reject; rua=mailto:dmarc@auraclara.store; aspf=r; adkim=r
TTL: 3600 (or Auto)
```

**Why p=reject?** Transactional emails from send.auraclara.store should always pass authentication. A strict policy improves deliverability.

---

### 3. SparkPost Bounce Domain Records (bounce.auraclara.store)

#### CNAME Verification Record
```
Type: CNAME
Name: bounce
Value: [SparkPost will provide - typically sparkpostmail.com subdomain]
TTL: 3600 (or Auto)
⚠️ Proxy: DISABLED (DNS Only)
```

**Example value from SparkPost:** `bounces.sparkpostmail.com` or a unique subdomain.

#### DMARC Record (Bounce Subdomain)
```
Type: TXT
Name: _dmarc.bounce
Value: v=DMARC1; p=reject; rua=mailto:dmarc@auraclara.store
TTL: 3600 (or Auto)
```

---

## Subdomain Strategy

### Recommended Subdomain Structure

| Purpose | Subdomain | Service | Reasoning |
|---------|-----------|---------|-----------|
| Mailbox hosting (receive) | auraclara.store | Migadu | Main domain for brand recognition |
| Transactional sending | send.auraclara.store | SparkPost | "send" is standard, not used by other services |
| Bounce handling | bounce.auraclara.store | SparkPost | Separate reputation for bounces |

### Why NOT "mail.auraclara.store"?

❌ **Avoid using "mail" subdomain because:**
- Often reserved for webmail/IMAP/SMTP server names
- May conflict with existing DNS configurations
- Already used in many DNS setups for inbox access

✅ **Use "send" instead:**
- Industry standard for dedicated sending
- Unlikely to conflict with other services
- Clear semantic meaning
- Recommended by major ESPs (SparkPost, SendGrid, etc.)

---

## Step-by-Step Setup

### Phase 1: Prepare Your Services (Before DNS Changes)

1. **Create SparkPost Account**
   - Sign up at sparkpost.com
   - Verify your account email
   - Do NOT add domains yet

2. **Create Migadu Account**
   - Sign up at migadu.com
   - Verify your account
   - Do NOT add domains yet

### Phase 2: Add Domain to Migadu First

**Why first?** MX records are critical for receiving email. Set these up first to avoid email loss.

1. **Add Domain in Migadu Admin Panel**
   - Navigate to Domains → Add Domain
   - Enter: `auraclara.store`
   - Note the DNS records provided (MX, SPF, DKIM)

2. **Add Migadu DNS Records in Netlify**
   - Add both MX records (priority 10 and 20)
   - Add the combined SPF record (see below)
   - Add all three DKIM CNAME records (key1, key2, key3)
   - **Ensure DKIM CNAMEs are NOT proxied**

3. **Wait for DNS Propagation**
   - Use `dig auraclara.store MX` to check MX records
   - Use `dig key1._domainkey.auraclara.store CNAME` to verify DKIM
   - Wait 15-30 minutes (or up to 48 hours for global propagation)

4. **Verify in Migadu**
   - Return to Migadu admin panel
   - Click "Check DNS" or similar verification button
   - All checks should pass (green)

### Phase 3: Add Sending Domain to SparkPost

1. **Add Sending Domain in SparkPost**
   - Navigate to Configuration → Sending Domains
   - Click "Add Sending Domain"
   - Enter: `send.auraclara.store`
   - Select verification method: DNS (recommended)

2. **SparkPost Provides DNS Records**
   - Copy the TXT verification record
   - Copy the DKIM TXT record (with scph selector)
   - Note: SparkPost may show these as one or two records

3. **Add SparkPost Sending Domain Records in Netlify**
   ```
   Type: TXT
   Name: send
   Value: [verification string from SparkPost]

   Type: TXT
   Name: scph0125._domainkey.send
   Value: [DKIM public key from SparkPost]

   Type: TXT
   Name: _dmarc.send
   Value: v=DMARC1; p=reject; rua=mailto:dmarc@auraclara.store; aspf=r; adkim=r
   ```

4. **Verify in SparkPost**
   - Click "Verify Domain" in SparkPost dashboard
   - Wait for DNS propagation if needed
   - Status should show "Verified" with green checkmark

### Phase 4: Add Bounce Domain to SparkPost

1. **Add Bounce Domain in SparkPost**
   - Navigate to Configuration → Sending Domains
   - Click "Add Sending Domain"
   - Select "Bounce Domain" option
   - Enter: `bounce.auraclara.store`

2. **SparkPost Provides CNAME Record**
   - Copy the CNAME record value
   - It typically points to `bounces.sparkpostmail.com` or similar

3. **Add Bounce Domain Records in Netlify**
   ```
   Type: CNAME
   Name: bounce
   Value: [SparkPost bounce domain from dashboard]
   ⚠️ Ensure NOT proxied

   Type: TXT
   Name: _dmarc.bounce
   Value: v=DMARC1; p=reject; rua=mailto:dmarc@auraclara.store
   ```

4. **Verify in SparkPost**
   - Click "Verify Bounce Domain"
   - Should show "Verified"

5. **Set as Default Bounce Domain**
   - In SparkPost, set bounce.auraclara.store as default
   - All outgoing emails will now use this bounce domain

### Phase 5: Update Combined SPF Record

**Critical:** After both services are added, ensure your SPF record includes both:

```
Type: TXT
Name: @
Value: v=spf1 include:spf.migadu.com include:sparkpostmail.com ~all
```

**Why combined?**
- You can only have ONE SPF record per domain
- Multiple SPF records cause authentication failure
- Both providers must be authorized in the same record

### Phase 6: Add DMARC Records

Add DMARC for all three domains/subdomains:

```
# Main domain
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@auraclara.store; ruf=mailto:dmarc@auraclara.store; fo=1

# Sending subdomain
Type: TXT
Name: _dmarc.send
Value: v=DMARC1; p=reject; rua=mailto:dmarc@auraclara.store; aspf=r; adkim=r

# Bounce subdomain
Type: TXT
Name: _dmarc.bounce
Value: v=DMARC1; p=reject; rua=mailto:dmarc@auraclara.store
```

**Policy Explanation:**
- `p=none`: Monitoring mode (main domain initially)
- `p=reject`: Strict mode (subdomains can be strict from day 1)
- `rua`: Aggregate reports email address
- `ruf`: Forensic reports email address
- `fo=1`: Generate forensic reports for any auth failure
- `aspf=r`: SPF relaxed alignment (allows subdomain sending)
- `adkim=r`: DKIM relaxed alignment

---

## Verification Process

### Tools for DNS Verification

1. **Command Line Tools**
   ```bash
   # Check MX records
   dig auraclara.store MX +short

   # Check SPF record
   dig auraclara.store TXT +short | grep spf

   # Check DKIM records (Migadu)
   dig key1._domainkey.auraclara.store CNAME +short

   # Check DKIM records (SparkPost)
   dig scph0125._domainkey.send.auraclara.store TXT +short

   # Check DMARC records
   dig _dmarc.auraclara.store TXT +short
   dig _dmarc.send.auraclara.store TXT +short
   dig _dmarc.bounce.auraclara.store TXT +short

   # Check bounce domain
   dig bounce.auraclara.store CNAME +short
   ```

2. **Online Verification Tools**
   - **MXToolbox** (mxtoolbox.com): Comprehensive DNS checker
   - **DMARC Analyzer** (dmarcanalyzer.com): DMARC policy tester
   - **Mail Tester** (mail-tester.com): Full email authentication test
   - **DNSChecker** (dnschecker.org): Global DNS propagation
   - **Migadu Admin Panel**: Built-in DNS diagnostics
   - **SparkPost Dashboard**: Built-in domain verification

3. **Sending a Test Email**
   ```bash
   # Test Migadu (mailbox receiving)
   # Send email TO: your-mailbox@auraclara.store
   # Check if it arrives correctly

   # Test SparkPost (transactional sending)
   # Use SparkPost API or SMTP to send FROM: noreply@send.auraclara.store
   # Send TO: check-auth@mail-tester.com
   # Review authentication results
   ```

### Expected Verification Results

#### Migadu Verification Checklist
- ✅ MX records point to aspmx1/aspmx2.migadu.com
- ✅ SPF includes `include:spf.migadu.com`
- ✅ All three DKIM CNAME records resolve correctly
- ✅ DKIM CNAMEs are NOT proxied
- ✅ Migadu admin panel shows "Domain verified"
- ✅ Test email received successfully

#### SparkPost Sending Domain Checklist
- ✅ TXT verification record present
- ✅ DKIM record (scph selector) present and correct
- ✅ SPF includes `include:sparkpostmail.com`
- ✅ DMARC record at _dmarc.send exists
- ✅ SparkPost dashboard shows "Verified" status
- ✅ Test email shows DKIM pass, SPF pass, DMARC pass

#### SparkPost Bounce Domain Checklist
- ✅ CNAME record points to SparkPost bounce server
- ✅ CNAME is NOT proxied
- ✅ DMARC record at _dmarc.bounce exists
- ✅ SparkPost dashboard shows bounce domain verified
- ✅ Bounce domain set as default in SparkPost

### DNS Propagation Timeline

| Time Elapsed | What to Check |
|--------------|---------------|
| 5 minutes | Netlify DNS records saved correctly |
| 15-30 minutes | Records visible via dig/nslookup |
| 1-2 hours | Global DNS propagation (most servers) |
| 24-48 hours | Full worldwide propagation |

**Pro Tip:** Use `dig @8.8.8.8 auraclara.store MX` to check against Google's DNS servers directly, bypassing local cache.

---

## Common Pitfalls

### 1. Multiple SPF Records
❌ **WRONG:**
```
v=spf1 include:spf.migadu.com ~all
v=spf1 include:sparkpostmail.com ~all
```

✅ **CORRECT:**
```
v=spf1 include:spf.migadu.com include:sparkpostmail.com ~all
```

**Why?** Multiple SPF records cause PermError and all authentication fails.

### 2. CNAME Proxying Enabled
❌ **WRONG:** DKIM CNAME records with CDN/proxy enabled

✅ **CORRECT:** All CNAME records for DKIM and bounce domains must be "DNS Only" (no proxy)

**Why?** Proxying breaks DKIM lookups because the DNS response is altered.

### 3. Using "mail" Subdomain for Sending
❌ **WRONG:** `mail.auraclara.store` for SparkPost

✅ **CORRECT:** `send.auraclara.store` for SparkPost

**Why?** "mail" is typically reserved for mail server hostnames (IMAP/SMTP), causing conflicts.

### 4. Missing DMARC on Subdomains
❌ **WRONG:** Only adding DMARC to main domain

✅ **CORRECT:** Add separate DMARC records for:
- `_dmarc.auraclara.store`
- `_dmarc.send.auraclara.store`
- `_dmarc.bounce.auraclara.store`

**Why?** Each subdomain should have its own DMARC policy for best deliverability.

### 5. SPF Lookup Limit Exceeded
❌ **WRONG:** Including too many domains (>10 DNS lookups)

✅ **CORRECT:** Keep includes minimal. Current setup uses 2 includes (safe).

**Why?** SPF has a 10 DNS lookup limit. Exceeding it causes PermError.

### 6. Incorrect DKIM Selector
❌ **WRONG:** Using outdated or incorrect DKIM selector from SparkPost

✅ **CORRECT:** Always copy the exact selector from SparkPost dashboard (e.g., scph0125)

**Why?** SparkPost rotates selectors. Using the wrong one breaks DKIM signing.

### 7. Setting DMARC to p=reject Too Early
❌ **WRONG:** Starting with `p=reject` on main domain immediately

✅ **CORRECT:** Start with `p=none`, monitor reports, gradually increase to `p=quarantine`, then `p=reject`

**Why?** You need to identify legitimate email sources first to avoid blocking your own email.

### 8. Not Setting Bounce Domain as Default
❌ **WRONG:** Verifying bounce domain but not setting it as default in SparkPost

✅ **CORRECT:** After verification, set `bounce.auraclara.store` as default bounce domain

**Why?** SparkPost won't use the custom bounce domain unless explicitly set as default.

### 9. Forgetting DNS TTL
❌ **WRONG:** Leaving very high TTL (86400) during initial setup

✅ **CORRECT:** Use lower TTL (600-3600) during setup, increase after verification

**Why?** Lower TTL allows faster corrections if you make a mistake.

### 10. Not Testing Authentication
❌ **WRONG:** Assuming setup is correct without testing

✅ **CORRECT:** Send test emails and verify SPF/DKIM/DMARC pass using mail-tester.com

**Why?** DNS records can be syntactically correct but still fail authentication checks.

---

## Troubleshooting

### Issue: Migadu Shows "MX Record Not Found"

**Diagnosis:**
```bash
dig auraclara.store MX +short
```

**Expected Output:**
```
10 aspmx1.migadu.com.
20 aspmx2.migadu.com.
```

**Solutions:**
1. Verify MX records are added to Netlify DNS
2. Check for typos in hostnames
3. Wait for DNS propagation (15-30 min)
4. Clear local DNS cache: `sudo dscacheutil -flushcache` (macOS)

---

### Issue: SparkPost DKIM Verification Fails

**Diagnosis:**
```bash
dig scph0125._domainkey.send.auraclara.store TXT +short
```

**Expected Output:**
```
"v=DKIM1; k=rsa; h=sha256; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."
```

**Solutions:**
1. Verify exact selector name from SparkPost (may not be scph0125)
2. Check TXT record syntax - must include quotes if needed
3. Ensure no extra spaces in the record value
4. Verify subdomain is correct: `scphXXXX._domainkey.send` (not just `scphXXXX._domainkey`)
5. Wait for DNS propagation

---

### Issue: SPF Fails for SparkPost Emails

**Diagnosis:**
```bash
dig send.auraclara.store TXT +short | grep spf
```

**Expected Output:**
```
"v=spf1 include:sparkpostmail.com ~all"
```

**Solutions:**
1. Verify SPF record exists on BOTH main domain and sending subdomain
2. Main domain SPF should include: `include:spf.migadu.com include:sparkpostmail.com ~all`
3. Check for multiple SPF records (only one allowed per domain)
4. Verify syntax: `v=spf1` (not `v=spf2` or typos)
5. Ensure `include:sparkpostmail.com` (not `include:sparkpost.com`)

---

### Issue: Bounce Domain CNAME Not Resolving

**Diagnosis:**
```bash
dig bounce.auraclara.store CNAME +short
```

**Expected Output:**
```
bounces.sparkpostmail.com.
```

**Solutions:**
1. Verify CNAME record is added to Netlify DNS
2. Check that proxy/CDN is DISABLED for this CNAME
3. Ensure exact value from SparkPost dashboard is used
4. Root domains cannot be CNAMEs - use subdomain only
5. Wait for DNS propagation

---

### Issue: DMARC Reports Not Received

**Diagnosis:**
```bash
dig _dmarc.auraclara.store TXT +short
```

**Expected Output:**
```
"v=DMARC1; p=none; rua=mailto:dmarc@auraclara.store; ruf=mailto:dmarc@auraclara.store; fo=1"
```

**Solutions:**
1. Verify DMARC record syntax is correct
2. Ensure `rua` and `ruf` email addresses exist and can receive mail
3. Check spam folder for DMARC reports
4. Some providers send weekly reports (not daily)
5. Use DMARC analyzer tool to verify record format
6. Ensure mailbox `dmarc@auraclara.store` exists in Migadu

---

### Issue: Emails Going to Spam

**Diagnosis Steps:**
1. Send test email to mail-tester.com
2. Check authentication results (SPF, DKIM, DMARC)
3. Review spam score and recommendations

**Common Causes:**
1. ❌ SPF fails → Check SPF record includes correct provider
2. ❌ DKIM fails → Check DKIM records not proxied, correct selector
3. ❌ DMARC fails → Check SPF and DKIM pass first (DMARC requires one)
4. ❌ No reverse DNS → Contact SparkPost/Migadu (they manage this)
5. ❌ Content issues → Check email content, links, images
6. ❌ Low sender reputation → New domains need warmup period

**Solutions:**
1. Verify all authentication (SPF, DKIM, DMARC) passes
2. Implement email warmup for new sending domain
3. Start with low volume, gradually increase
4. Avoid spam trigger words in subject/content
5. Ensure proper unsubscribe links
6. Maintain low bounce/complaint rates

---

### Issue: DNS Propagation Taking Too Long

**Diagnosis:**
```bash
# Check global propagation
# Use dnschecker.org with your domain

# Check specific nameservers
dig @8.8.8.8 auraclara.store MX +short
dig @1.1.1.1 auraclara.store MX +short
```

**Solutions:**
1. Lower TTL before making changes (e.g., 600 seconds)
2. Wait at least 30 minutes before retesting
3. Clear local DNS cache:
   - macOS: `sudo dscacheutil -flushcache`
   - Windows: `ipconfig /flushdns`
   - Linux: `sudo systemd-resolve --flush-caches`
4. Test against authoritative nameservers directly
5. Maximum wait time: 48 hours for global propagation

---

## Advanced Configuration

### Email Warmup Plan (New Sending Domain)

When using `send.auraclara.store` for the first time:

**Week 1:**
- Send 20-50 emails/day
- Target engaged recipients
- Monitor bounce rates (<2%)

**Week 2:**
- Send 100-200 emails/day
- Continue monitoring authentication
- Check spam complaint rates (<0.1%)

**Week 3-4:**
- Send 500-1000 emails/day
- Gradually increase volume
- Monitor sender reputation

**Week 5+:**
- Reach full sending volume
- Maintain consistent sending patterns
- Continue monitoring metrics

### DMARC Policy Progression Schedule

**Main Domain (auraclara.store):**

```
Week 1-2: v=DMARC1; p=none; rua=mailto:dmarc@auraclara.store
Week 3-4: v=DMARC1; p=quarantine; pct=10; rua=mailto:dmarc@auraclara.store
Week 5-6: v=DMARC1; p=quarantine; pct=50; rua=mailto:dmarc@auraclara.store
Week 7+:   v=DMARC1; p=reject; rua=mailto:dmarc@auraclara.store
```

**Sending Subdomain (send.auraclara.store):**

Can use `p=reject` immediately since all emails are controlled by SparkPost:
```
Day 1: v=DMARC1; p=reject; rua=mailto:dmarc@auraclara.store; aspf=r; adkim=r
```

### SPF Record Management

**Current Setup (Safe - 2 lookups):**
```
v=spf1 include:spf.migadu.com include:sparkpostmail.com ~all
```

**If Adding More Services:**
- Monitor total DNS lookups (max 10)
- Consider SPF flattening if approaching limit
- Tools: mxtoolbox.com SPF checker

**SPF Mechanisms Explained:**
- `v=spf1`: SPF version 1
- `include:domain.com`: Check this domain's SPF record
- `~all`: Soft fail (allow but mark suspicious)
- `-all`: Hard fail (reject unauthorized)
- `?all`: Neutral (no policy)

### Monitoring and Reporting

**DMARC Report Analysis:**
1. Set up weekly calendar reminder to check reports
2. Use DMARC analyzer tools (dmarcian.com, postmarkapp.com)
3. Look for unexpected sending sources
4. Investigate SPF/DKIM failures

**Key Metrics to Track:**
- SPF pass rate (target: >99%)
- DKIM pass rate (target: >99%)
- DMARC pass rate (target: >99%)
- Bounce rate (target: <2%)
- Complaint rate (target: <0.1%)
- Inbox placement rate (target: >95%)

---

## Summary Checklist

### Pre-Launch Verification

- [ ] All Migadu MX records added and verified
- [ ] Migadu DKIM CNAMEs added (key1, key2, key3) - NOT proxied
- [ ] SparkPost sending domain verified (send.auraclara.store)
- [ ] SparkPost bounce domain verified (bounce.auraclara.store)
- [ ] Combined SPF record includes both providers
- [ ] DMARC records added for all three domains/subdomains
- [ ] All CNAME records have proxy DISABLED
- [ ] Test email sent from SparkPost shows SPF/DKIM/DMARC pass
- [ ] Test email received via Migadu successfully
- [ ] Mail-tester.com score >8/10
- [ ] Bounce domain set as default in SparkPost

### Post-Launch Monitoring

- [ ] Monitor DMARC reports weekly
- [ ] Check SparkPost bounce/complaint rates daily
- [ ] Review Migadu inbox for delivery issues
- [ ] Gradually increase DMARC policy strictness
- [ ] Implement email warmup schedule
- [ ] Document any issues and resolutions

---

## Quick Reference

### Netlify DNS Records Summary

```
# Migadu (Main Domain)
Type: MX,    Name: @,                         Value: aspmx1.migadu.com., Priority: 10
Type: MX,    Name: @,                         Value: aspmx2.migadu.com., Priority: 20
Type: CNAME, Name: key1._domainkey,           Value: key1.auraclara-store._domainkey.migadu.com. [NO PROXY]
Type: CNAME, Name: key2._domainkey,           Value: key2.auraclara-store._domainkey.migadu.com. [NO PROXY]
Type: CNAME, Name: key3._domainkey,           Value: key3.auraclara-store._domainkey.migadu.com. [NO PROXY]
Type: TXT,   Name: _dmarc,                    Value: v=DMARC1; p=none; rua=mailto:dmarc@auraclara.store

# Combined SPF (Both Services)
Type: TXT,   Name: @,                         Value: v=spf1 include:spf.migadu.com include:sparkpostmail.com ~all

# SparkPost Sending Domain
Type: TXT,   Name: send,                      Value: [SparkPost verification string]
Type: TXT,   Name: scph0125._domainkey.send,  Value: [SparkPost DKIM public key]
Type: TXT,   Name: _dmarc.send,               Value: v=DMARC1; p=reject; rua=mailto:dmarc@auraclara.store

# SparkPost Bounce Domain
Type: CNAME, Name: bounce,                    Value: [SparkPost bounce CNAME] [NO PROXY]
Type: TXT,   Name: _dmarc.bounce,             Value: v=DMARC1; p=reject; rua=mailto:dmarc@auraclara.store
```

### Command Reference

```bash
# DNS Verification
dig auraclara.store MX +short
dig auraclara.store TXT +short | grep spf
dig key1._domainkey.auraclara.store CNAME +short
dig scph0125._domainkey.send.auraclara.store TXT +short
dig _dmarc.auraclara.store TXT +short
dig bounce.auraclara.store CNAME +short

# Flush DNS Cache
# macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Windows
ipconfig /flushdns

# Linux
sudo systemd-resolve --flush-caches

# Test Email Authentication
curl -X POST https://api.mail-tester.com/test \
  -d "email=your-email-content"
```

### Important URLs

- **Netlify DNS:** https://app.netlify.com/sites/[your-site]/configuration/domain
- **Migadu Admin:** https://admin.migadu.com/
- **SparkPost Domains:** https://app.sparkpost.com/domains/list
- **MXToolbox:** https://mxtoolbox.com/SuperTool.aspx
- **Mail Tester:** https://www.mail-tester.com/
- **DMARC Analyzer:** https://dmarcian.com/dmarc-inspector/
- **DNS Checker:** https://dnschecker.org/

---

## Conclusion

This guide provides a complete DNS configuration for running SparkPost (transactional email) and Migadu (mailbox hosting) together on `auraclara.store`. By following the step-by-step setup and avoiding common pitfalls, you'll achieve:

- ✅ High deliverability rates
- ✅ Strong email authentication
- ✅ Separated reputation management
- ✅ Professional email infrastructure
- ✅ DMARC compliance

**Remember:**
1. Start with monitoring (DMARC p=none)
2. Never create multiple SPF records
3. Always disable proxy for DKIM/CNAME records
4. Test authentication before full deployment
5. Monitor reports and adjust policies gradually

For questions or issues, refer to:
- SparkPost Support: https://support.sparkpost.com/
- Migadu Support: https://www.migadu.com/support/

---

**Document Version:** 1.0
**Last Updated:** 2025-01-16
**Author:** Research Agent (Claude Code)
