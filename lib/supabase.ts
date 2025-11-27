/**
 * Supabase Client Configuration
 * 
 * Bu dosya Supabase bağlantısı için gerekli tüm client'ları export eder.
 * Next.js 14 App Router ile tam uyumludur.
 * 
 * Kullanım:
 * 
 * Client Component'lerde:
 * ```tsx
 * 'use client';
 * import { createBrowserClient } from '@/lib/supabase';
 * const supabase = createBrowserClient();
 * ```
 * 
 * Server Component'lerde:
 * ```tsx
 * import { createServerClient } from '@/lib/supabase';
 * const supabase = await createServerClient();
 * ```
 * 
 * Server Actions'da:
 * ```tsx
 * 'use server';
 * import { createServerClient } from '@/lib/supabase';
 * const supabase = await createServerClient();
 * ```
 * 
 * Route Handlers'da:
 * ```tsx
 * import { createServerClient } from '@/lib/supabase';
 * export async function GET() {
 *   const supabase = await createServerClient();
 * }
 * ```
 */

// Re-export client utilities
export { createClient as createBrowserClient } from './supabase/client';
export { createClient as createServerClient } from './supabase/server';
export { updateSession } from './supabase/middleware';

// Type exports for convenience
export type { User, Session, AuthError } from '@supabase/supabase-js';

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          name: string;
          surname: string;
          email: string | null;
          phone: string | null;
          birthdate: string | null;
          is_child: boolean;
          parent_name: string | null;
          parent_phone: string | null;
          group_id: string | null;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['members']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['members']['Insert']>;
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          coach_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['groups']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['groups']['Insert']>;
      };
      lessons: {
        Row: {
          id: string;
          group_id: string;
          date: string;
          start_time: string;
          end_time: string;
          status: 'scheduled' | 'completed' | 'cancelled';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>;
      };
      attendance: {
        Row: {
          id: string;
          lesson_id: string;
          member_id: string;
          status: 'present' | 'absent';
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          member_id: string;
          amount: number;
          period: string;
          status: 'pending' | 'paid' | 'overdue';
          paid_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      inventory: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          quantity: number;
          min_stock: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inventory']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['inventory']['Insert']>;
      };
      coaches: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string | null;
          specialty: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['coaches']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['coaches']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      member_status: 'active' | 'inactive';
      lesson_status: 'scheduled' | 'completed' | 'cancelled';
      attendance_status: 'present' | 'absent';
      payment_status: 'pending' | 'paid' | 'overdue';
    };
  };
};

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

