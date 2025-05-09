
-- Enable pg_cron and pg_net extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Schedule a job to run daily at midnight to check for expired products
SELECT cron.schedule(
  'check-expired-products-daily',
  '0 0 * * *',  -- At midnight every day
  $$
  SELECT
    net.http_post(
      url := 'https://izolcgjxobgendljwoan.functions.supabase.co/check_expired_products',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || (SELECT value FROM secrets.decrypted_secrets WHERE key = 'SUPABASE_ANON_KEY') || '"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);
