
-- Create countries table
CREATE TABLE IF NOT EXISTS "public"."countries" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "countries_name_key" UNIQUE ("name")
);

-- Add country column to counties table
ALTER TABLE "public"."counties" 
ADD COLUMN IF NOT EXISTS "country" text REFERENCES "public"."countries"("name");

-- Add country column to products table
ALTER TABLE "public"."products" 
ADD COLUMN IF NOT EXISTS "country" text REFERENCES "public"."countries"("name");

-- Seed countries data
INSERT INTO "public"."countries" ("name") 
VALUES ('Kenya'), ('Uganda'), ('South Sudan')
ON CONFLICT ("name") DO NOTHING;

-- Seed Kenya counties
INSERT INTO "public"."counties" ("name", "country", "state") 
VALUES 
('Nairobi', 'Kenya', 'Kenya'),
('Mombasa', 'Kenya', 'Kenya'),
('Kisumu', 'Kenya', 'Kenya'),
('Nakuru', 'Kenya', 'Kenya'),
('Eldoret', 'Kenya', 'Kenya'),
('Nyeri', 'Kenya', 'Kenya'),
('Kakamega', 'Kenya', 'Kenya'),
('Machakos', 'Kenya', 'Kenya'),
('Kisii', 'Kenya', 'Kenya'),
('Meru', 'Kenya', 'Kenya')
ON CONFLICT DO NOTHING;

-- Seed Uganda districts
INSERT INTO "public"."counties" ("name", "country", "state") 
VALUES 
('Kampala', 'Uganda', 'Uganda'),
('Gulu', 'Uganda', 'Uganda'),
('Mbarara', 'Uganda', 'Uganda'),
('Jinja', 'Uganda', 'Uganda'),
('Mbale', 'Uganda', 'Uganda'),
('Arua', 'Uganda', 'Uganda'),
('Lira', 'Uganda', 'Uganda'),
('Masaka', 'Uganda', 'Uganda'),
('Fort Portal', 'Uganda', 'Uganda'),
('Entebbe', 'Uganda', 'Uganda')
ON CONFLICT DO NOTHING;

-- Seed South Sudan counties
INSERT INTO "public"."counties" ("name", "country", "state") 
VALUES 
('Juba', 'South Sudan', 'South Sudan'),
('Wau', 'South Sudan', 'South Sudan'),
('Malakal', 'South Sudan', 'South Sudan'),
('Bor', 'South Sudan', 'South Sudan'),
('Yei', 'South Sudan', 'South Sudan'),
('Aweil', 'South Sudan', 'South Sudan'),
('Bentiu', 'South Sudan', 'South Sudan'),
('Rumbek', 'South Sudan', 'South Sudan'),
('Torit', 'South Sudan', 'South Sudan'),
('Yambio', 'South Sudan', 'South Sudan')
ON CONFLICT DO NOTHING;

-- Set default country values for existing data
UPDATE "public"."counties" SET "country" = 'South Sudan' WHERE "country" IS NULL;
UPDATE "public"."products" SET "country" = 'South Sudan' WHERE "country" IS NULL;
