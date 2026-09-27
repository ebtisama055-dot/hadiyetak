import { createClient } from '@supabase/supabase-js';

// Public anon/publishable key -- safe to expose in client code; all access is
// governed by Postgres Row Level Security on the hadiyetak Supabase project.
// Hardcoded as a fallback so the app works even if the NEXT_PUBLIC_* env vars
// haven't been configured in the Vercel project settings yet; env vars (if set)
// still take precedence, so rotating the key later only requires updating Vercel.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://taqdyysfqyfaeonwvdvj.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_nr8og4ELucBqjGH6GvFVhA_qvQ0mCkD';

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});
