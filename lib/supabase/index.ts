/**
 * Supabase Client Exports
 * 
 * Import from this file for cleaner paths:
 * 
 * @example
 * ```tsx
 * import { createBrowserClient, createServerClient } from '@/lib/supabase';
 * ```
 */

export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';
export { updateSession } from './middleware';

// Re-export Database type for convenience
export type { Database } from '../supabase';

