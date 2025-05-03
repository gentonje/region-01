
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://izolcgjxobgendljwoan.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b2xjZ2p4b2JnZW5kbGp3b2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NTkyMjQsImV4cCI6MjA1MTIzNTIyNH0.8H5sf-ipUrrtTC08-9zCntiJTqET4-S4YVcmCXK3olg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  persistSession: true,   // Ensure sessions are saved (both access & refresh tokens)
  autoRefreshToken: true, // Automatically attempt to refresh expired tokens
});
