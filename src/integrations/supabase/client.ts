
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://izolcgjxobgendljwoan.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b2xjZ2p4b2JnZW5kbGp3b2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NTkyMjQsImV4cCI6MjA1MTIzNTIyNH0.8H5sf-ipUrrtTC08-9zCntiJTqET4-S4YVcmCXK3olg";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-my-custom-header': 'my-app-name'
      }
    }
  }
);
