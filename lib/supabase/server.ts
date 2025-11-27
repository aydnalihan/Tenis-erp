import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '../supabase';

/**
 * Creates a Supabase client for use in Server Components, Server Actions, and Route Handlers
 * 
 * Must be called with await since it needs to access cookies
 * 
 * @example
 * ```tsx
 * // In Server Component
 * import { createClient } from '@/lib/supabase/server';
 * 
 * export default async function Page() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('members').select('*');
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // In Server Action
 * 'use server';
 * import { createClient } from '@/lib/supabase/server';
 * 
 * export async function createMember(formData: FormData) {
 *   const supabase = await createClient();
 *   await supabase.from('members').insert({ ... });
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // In Route Handler
 * import { createClient } from '@/lib/supabase/server';
 * import { NextResponse } from 'next/server';
 * 
 * export async function GET() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('members').select('*');
 *   return NextResponse.json(data);
 * }
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
