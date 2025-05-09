
-- Add account_type and custom_product_limit to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'basic' NOT NULL;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS custom_product_limit INTEGER DEFAULT NULL;

-- Update existing profiles to have 'basic' account_type
UPDATE public.profiles
SET account_type = 'basic'
WHERE account_type IS NULL;

-- Add expires_at and validity_period to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS validity_period VARCHAR(10);

-- Set default values for products with validity_period if expires_at exists
UPDATE public.products
SET validity_period = 'day'
WHERE validity_period IS NULL AND expires_at IS NOT NULL;

-- Add this to your migrations
COMMENT ON COLUMN public.profiles.account_type IS 'Type of user account (basic, starter, premium, enterprise)';
COMMENT ON COLUMN public.profiles.custom_product_limit IS 'Custom product limit for enterprise accounts';
COMMENT ON COLUMN public.products.expires_at IS 'Date and time when the product listing expires';
COMMENT ON COLUMN public.products.validity_period IS 'Period of validity (day, week, month)';
