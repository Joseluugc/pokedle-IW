import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let warnedAboutMissingServiceRoleKey = false;

export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
  }

  const supabaseKey = serviceRoleKey ?? anonKey;

  if (!supabaseKey) {
    throw new Error(
      'Supabase key is required: define SUPABASE_SERVICE_ROLE_KEY (recommended) o NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  if (!serviceRoleKey && !warnedAboutMissingServiceRoleKey) {
    warnedAboutMissingServiceRoleKey = true;
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY no está definido. Se usará NEXT_PUBLIC_SUPABASE_ANON_KEY como fallback.'
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
}
