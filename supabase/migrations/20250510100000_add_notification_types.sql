
-- Expand notification_type enum to include new types
ALTER TYPE notification_type ADD VALUE 'product_expiry';
ALTER TYPE notification_type ADD VALUE 'similar_product';

-- Create a function to find similar products based on wishlist
CREATE OR REPLACE FUNCTION public.find_similar_products() 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_rec RECORD;
    wishlist_product RECORD;
    similar_product RECORD;
    curr_timestamp TIMESTAMP;
BEGIN
    curr_timestamp := NOW();

    -- For each user with wishlist items
    FOR user_rec IN 
        SELECT DISTINCT wi.wishlist_id, w.user_id
        FROM wishlist_items wi
        JOIN wishlists w ON wi.wishlist_id = w.id
    LOOP
        -- Check each product in user's wishlist
        FOR wishlist_product IN
            SELECT p.id, p.title, p.category, p.price, p.country_id
            FROM wishlist_items wi
            JOIN products p ON wi.product_id = p.id
            WHERE wi.wishlist_id = user_rec.wishlist_id
        LOOP
            -- Find recently added similar products (not already in the wishlist)
            FOR similar_product IN
                SELECT p.id, p.title, p.category, p.storage_path
                FROM products p
                WHERE p.category = wishlist_product.category
                AND p.id != wishlist_product.id
                AND p.country_id = wishlist_product.country_id
                AND p.created_at > (curr_timestamp - interval '3 days')
                AND p.product_status = 'published'
                AND NOT EXISTS (
                    SELECT 1
                    FROM wishlist_items wi
                    WHERE wi.wishlist_id = user_rec.wishlist_id
                    AND wi.product_id = p.id
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM notifications n
                    WHERE n.user_id = user_rec.user_id
                    AND n.related_product_id = p.id
                    AND n.type = 'similar_product'
                    AND n.created_at > (curr_timestamp - interval '7 days')
                )
                LIMIT 3
            LOOP
                -- Insert notification for the user about this similar product
                INSERT INTO notifications (
                    user_id, 
                    type, 
                    title, 
                    content, 
                    related_product_id,
                    link,
                    thumbnail_url
                ) VALUES (
                    user_rec.user_id,
                    'similar_product',
                    'New product you might like',
                    'Found a new ' || similar_product.category || ': ' || similar_product.title,
                    similar_product.id,
                    '/products/' || similar_product.id,
                    similar_product.storage_path
                );
            END LOOP;
        END LOOP;
    END LOOP;
END;
$$;

-- Create a function to send notifications for products about to expire
CREATE OR REPLACE FUNCTION public.check_expiring_products() 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    product_rec RECORD;
    days_remaining INTEGER;
    curr_timestamp TIMESTAMP;
BEGIN
    curr_timestamp := NOW();

    -- Find products that are about to expire
    FOR product_rec IN 
        SELECT p.id, p.title, p.expires_at, p.user_id, p.storage_path
        FROM products p
        WHERE p.expires_at IS NOT NULL
        AND p.product_status = 'published'
    LOOP
        -- Calculate days remaining
        days_remaining := EXTRACT(DAY FROM (product_rec.expires_at - curr_timestamp));
        
        -- Send notifications for 1, 3, and 5 days remaining
        IF days_remaining IN (1, 3, 5) THEN
            -- Check if we've already sent a notification for this expiration point
            IF NOT EXISTS (
                SELECT 1
                FROM notifications n
                WHERE n.related_product_id = product_rec.id
                AND n.type = 'product_expiry'
                AND n.content LIKE '%' || days_remaining::text || ' day%'
                AND n.created_at > (curr_timestamp - interval '1 day')
            ) THEN
                -- Insert notification for product expiry
                INSERT INTO notifications (
                    user_id,
                    type,
                    title,
                    content,
                    related_product_id,
                    link,
                    thumbnail_url
                ) VALUES (
                    product_rec.user_id,
                    'product_expiry',
                    'Product expires soon: ' || product_rec.title,
                    'Your product "' || product_rec.title || '" will expire in ' || 
                    days_remaining || ' day' || CASE WHEN days_remaining > 1 THEN 's' ELSE '' END || 
                    '. Consider renewing it to keep it visible.',
                    product_rec.id,
                    '/products/' || product_rec.id,
                    product_rec.storage_path
                );
            END IF;
        END IF;
    END LOOP;
END;
$$;

-- Add a scheduled job for checking expiring products (once per day)
SELECT cron.schedule('check-expiring-products', '0 0 * * *', $$SELECT check_expiring_products()$$);

-- Add a scheduled job for finding similar products (once per day)
SELECT cron.schedule('find-similar-products', '0 12 * * *', $$SELECT find_similar_products()$$);
