-- Check profiles status
SELECT 
    p.id,
    p.username,
    p.is_active,
    COUNT(pr.id) as product_count
FROM profiles p
LEFT JOIN products pr ON p.id = pr.user_id
WHERE p.username IN ('muchai', 'dan')
GROUP BY p.id, p.username, p.is_active;

-- Check products visibility
SELECT 
    p.title,
    p.product_status,
    p.user_id,
    pr.username as owner_username
FROM products p
JOIN profiles pr ON p.user_id = pr.id
WHERE pr.username IN ('muchai', 'dan');