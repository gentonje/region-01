
-- Stored procedure to increment product view count
CREATE OR REPLACE FUNCTION increment_product_view(product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = product_id;
END;
$$;

-- Add view_count column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE products ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
END $$;
