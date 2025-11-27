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

  // Get environment variables
  // In Next.js, NEXT_PUBLIC_ variables are available in both server and client
  // However, they need to be available at build/runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Debug: Log environment variable status (only in development)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔍 Supabase Client Debug:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseAnonKey?.length || 0,
      allNextPublicVars: Object.keys(process.env)
        .filter(k => k.startsWith('NEXT_PUBLIC_'))
        .map(k => k),
    });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = 
      'Supabase yapılandırması eksik!\n\n' +
      'Lütfen proje kök dizininde .env.local dosyası oluşturun ve şu değişkenleri ekleyin:\n\n' +
      'NEXT_PUBLIC_SUPABASE_URL=https://inkxrtspktrsdxezdivh.supabase.co\n' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n' +
      'Bu değerleri Supabase Dashboard > Settings > API bölümünden alabilirsiniz.\n\n' +
      '⚠️ ÖNEMLİ: Değişikliklerin etkili olması için:\n' +
      '1. Dev server\'ı durdurun (Ctrl+C)\n' +
      '2. .next klasörünü silin: Remove-Item -Recurse -Force .next\n' +
      '3. Dev server\'ı yeniden başlatın: npm run dev';
    
    console.error('❌ Supabase Configuration Error:', errorMessage);
    throw new Error(errorMessage);
  }

  client = createSupabaseBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );

  return client;
}
