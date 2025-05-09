
-- Create countries table
CREATE TABLE IF NOT EXISTS public.countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(2) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Seed countries
INSERT INTO public.countries (name, code) VALUES
('Kenya', 'KE'),
('Uganda', 'UG'),
('South Sudan', 'SS'), 
('Ethiopia', 'ET'),
('Rwanda', 'RW')
ON CONFLICT (code) DO NOTHING;

-- Add country_id to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES public.countries(id);

-- Add expires_at to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add validity_period to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS validity_period VARCHAR(10);

-- Update existing products to default to Kenya (id: 1)
UPDATE public.products 
SET country_id = 1
WHERE country_id IS NULL;

-- Add account_type to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'basic' NOT NULL;

-- Update existing profiles to have 'basic' account_type
UPDATE public.profiles
SET account_type = 'basic'
WHERE account_type IS NULL;

-- Add custom_product_limit to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS custom_product_limit INTEGER DEFAULT NULL;

-- For future: Modify counties table to reference countries
-- This is left as a comment to avoid breaking existing data
/*
-- First rename existing table to backup
ALTER TABLE IF EXISTS public.counties RENAME TO counties_backup;

-- Create new counties table with country reference
CREATE TABLE IF NOT EXISTS public.counties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country_id INTEGER NOT NULL REFERENCES public.countries(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(name, country_id)
);

-- Copy existing counties (assuming they're from South Sudan for example)
INSERT INTO public.counties (name, country_id)
SELECT name, (SELECT id FROM public.countries WHERE code = 'SS')
FROM counties_backup;

-- Now seed counties for each country - example for Kenya
INSERT INTO public.counties (name, country_id) VALUES
('Nairobi', (SELECT id FROM public.countries WHERE code = 'KE')),
('Mombasa', (SELECT id FROM public.countries WHERE code = 'KE')),
('Kisumu', (SELECT id FROM public.countries WHERE code = 'KE'))
ON CONFLICT DO NOTHING;
*/

