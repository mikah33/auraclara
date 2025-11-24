# Cart Database Setup for Supabase

## Overview
This guide will help you set up cart tracking in Supabase so user carts are synced to the database and persist across devices.

## Step 1: Create Cart Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create carts table
CREATE TABLE public.carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    cart_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_carts_user_id ON public.carts(user_id);

-- Enable Row Level Security
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own cart
CREATE POLICY "Users can view their own cart"
    ON public.carts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own cart
CREATE POLICY "Users can insert their own cart"
    ON public.carts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own cart
CREATE POLICY "Users can update their own cart"
    ON public.carts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own cart
CREATE POLICY "Users can delete their own cart"
    ON public.carts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on cart updates
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.carts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

## Step 2: Verify Table Creation

After running the SQL, verify the table exists:

```sql
SELECT * FROM public.carts LIMIT 1;
```

## Step 3: Test Policies

Test that RLS is working:

```sql
-- This should only return carts for the authenticated user
SELECT * FROM public.carts WHERE user_id = auth.uid();
```

## Cart Data Structure

The `cart_data` JSONB column stores an array of cart items:

```json
[
    {
        "count": "36",
        "price": "12.99",
        "name": "Clarity Patches (36ct)",
        "image": "assets/images/product-packaging.png",
        "quantity": 2,
        "stripePriceId": "price_xxx36patches"
    },
    {
        "count": "face-sculpting-tool",
        "price": "52.99",
        "name": "Face Sculpting Tool",
        "image": "assets/images/face-sculpting-tool-box.png",
        "quantity": 1,
        "stripePriceId": null
    }
]
```

## Features

✅ **User-Specific Carts**: Each user has their own cart tied to their account
✅ **Automatic Sync**: Cart updates are automatically saved to database
✅ **Cross-Device**: Cart persists across all devices where user is logged in
✅ **Security**: Row Level Security ensures users can only access their own cart
✅ **Timestamps**: Track when cart was created and last updated
✅ **Abandoned Cart Tracking**: Query carts that haven't been updated in X days

## Analytics Queries

### Find abandoned carts (not updated in 24 hours)
```sql
SELECT
    c.user_id,
    u.email,
    c.cart_data,
    c.updated_at,
    (SELECT SUM((item->>'quantity')::int * (item->>'price')::numeric)
     FROM jsonb_array_elements(c.cart_data) AS item) as cart_total
FROM public.carts c
JOIN auth.users u ON u.id = c.user_id
WHERE c.updated_at < NOW() - INTERVAL '24 hours'
AND jsonb_array_length(c.cart_data) > 0
ORDER BY c.updated_at DESC;
```

### Cart value statistics
```sql
SELECT
    COUNT(*) as total_carts,
    AVG(cart_total) as avg_cart_value,
    SUM(cart_total) as total_value_in_carts
FROM (
    SELECT
        (SELECT SUM((item->>'quantity')::int * (item->>'price')::numeric)
         FROM jsonb_array_elements(cart_data) AS item) as cart_total
    FROM public.carts
    WHERE jsonb_array_length(cart_data) > 0
) stats;
```

### Most popular items in carts
```sql
SELECT
    item->>'name' as product_name,
    COUNT(*) as times_in_cart,
    SUM((item->>'quantity')::int) as total_quantity
FROM public.carts,
     jsonb_array_elements(cart_data) as item
GROUP BY item->>'name'
ORDER BY times_in_cart DESC;
```

## Next Steps

After running this setup, the JavaScript integration will automatically:
1. Sync cart to database when user is logged in
2. Load cart from database on page load
3. Merge local cart with database cart when user logs in
4. Clear cart from database on logout (optional)

## Troubleshooting

### Error: "permission denied for table carts"
- Make sure RLS policies are created correctly
- Verify user is authenticated when accessing cart

### Error: "duplicate key value violates unique constraint"
- User already has a cart in database
- Use UPDATE instead of INSERT (handled automatically in code)

### Cart not syncing
- Check browser console for errors
- Verify Supabase client is initialized
- Ensure user is authenticated before syncing
