-- Check the latest newsletter signup
SELECT
    id,
    email,
    source,
    discount_code,
    unsubscribe_token,
    subscribed,
    created_at
FROM newsletter_signups
ORDER BY created_at DESC
LIMIT 5;
