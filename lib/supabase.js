import { createClient } from '@supabase/supabase-js';

// These two values come from your Supabase project (Settings > API).
// The fallbacks only exist so the build doesn't crash when they're missing.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-key'
);
