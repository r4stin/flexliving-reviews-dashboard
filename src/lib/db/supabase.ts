// src/lib/db/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: SupabaseClient;

// If env vars are missing, don't crash at import time.
// Instead, create a dummy client that throws if someone actually tries to use it.
if (!url || !serviceRoleKey) {
  console.warn(
    '⚠ Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). ' +
      'Supabase-backed features will not work until these are set.'
  );

  // Very small "fake client" that just throws when used.
  const errorFn = () => {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.'
    );
  };

  // @ts-expect-error: we are intentionally mocking the minimal interface we use
  supabaseAdmin = {
    from: errorFn,
    // if you use other methods (auth, storage, etc.), you can map them to errorFn as well
  };
} else {
  supabaseAdmin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export { supabaseAdmin };
