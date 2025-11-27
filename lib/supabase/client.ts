import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import type { Database } from '../supabase';

let client: ReturnType<typeof createSupabaseBrowserClient<Database>> | null = null;

/**
 * Creates a Supabase client for use in Client Components
 * 
 * Uses singleton pattern to avoid creating multiple instances
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { createClient } from '@/lib/supabase/client';
 * 
 * export function MyComponent() {
 *   const supabase = createClient();
 *   // Use supabase...
 * }
 * ```
 */
export function createClient() {
  if (client) return client;

  client = createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}
