import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and anon key
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  persistSession: true,   // Ensure sessions are saved (both access & refresh tokens)
  autoRefreshToken: true, // Automatically attempt to refresh expired tokens
}); 