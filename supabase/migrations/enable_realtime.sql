
-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add to realtime publication
BEGIN;
  -- Check if the publication exists
  SELECT TRUE FROM pg_publication WHERE pubname = 'supabase_realtime';

  -- If it doesn't exist, create it
  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT TRUE FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END $$;

  -- Add notifications table to publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
COMMIT;
