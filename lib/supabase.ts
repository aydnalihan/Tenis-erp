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

/**
 * Database type definitions generated from Supabase schema
 * 
 * These types are manually maintained to match the actual database schema
 * defined in lib/database/schema.sql
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'admin' | 'coach';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          role?: 'admin' | 'coach';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'admin' | 'coach';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        }>;
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
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          coach_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id?: string;
          name?: string;
          description?: string | null;
          coach_id?: string | null;
          created_at?: string;
          updated_at?: string;
        }>;
      };
      members: {
        Row: {
          id: string;
          name: string;
          surname: string;
          phone: string | null;
          email: string | null;
          birthdate: string | null;
          is_child: boolean;
          parent_name: string | null;
          parent_phone: string | null;
          group_id: string | null;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          surname: string;
          phone?: string | null;
          email?: string | null;
          birthdate?: string | null;
          is_child?: boolean;
          parent_name?: string | null;
          parent_phone?: string | null;
          group_id?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id?: string;
          name?: string;
          surname?: string;
          phone?: string | null;
          email?: string | null;
          birthdate?: string | null;
          is_child?: boolean;
          parent_name?: string | null;
          parent_phone?: string | null;
          group_id?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        }>;
      };
      lessons: {
        Row: {
          id: string;
          group_id: string;
          date: string;
          start_time: string;
          end_time: string;
          notes: string | null;
          status: 'scheduled' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          date: string;
          start_time: string;
          end_time: string;
          notes?: string | null;
          status?: 'scheduled' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id?: string;
          group_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          notes?: string | null;
          status?: 'scheduled' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        }>;
      };
      attendance: {
        Row: {
          id: string;
          lesson_id: string;
          member_id: string;
          status: 'present' | 'absent';
          created_at: string;
        };
        Insert: {
          lesson_id: string;
          member_id: string;
          status: 'present' | 'absent';
          id?: string;
          created_at?: string;
        };
        Update: Partial<{
          lesson_id: string;
          member_id: string;
          status: 'present' | 'absent';
          id?: string;
          created_at?: string;
        }>;
      };
      payments: {
        Row: {
          id: string;
          member_id: string;
          period: string;
          amount: number;
          paid: boolean;
          paid_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          period: string;
          amount: number;
          paid?: boolean;
          paid_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id?: string;
          member_id?: string;
          period?: string;
          amount?: number;
          paid?: boolean;
          paid_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        }>;
      };
      inventory: {
        Row: {
          id: string;
          name: string;
          category: string | null;
          quantity: number;
          min_stock: number;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string | null;
          quantity?: number;
          min_stock?: number;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id?: string;
          name?: string;
          category?: string | null;
          quantity?: number;
          min_stock?: number;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        }>;
      };
    };
    Views: {
      member_details: {
        Row: {
          id: string;
          name: string;
          surname: string;
          phone: string | null;
          email: string | null;
          birthdate: string | null;
          is_child: boolean;
          parent_name: string | null;
          parent_phone: string | null;
          group_id: string | null;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
          group_name: string | null;
          group_description: string | null;
        };
      };
      attendance_stats: {
        Row: {
          member_id: string;
          name: string;
          surname: string;
          total_lessons: number;
          present_count: number;
          absent_count: number;
          attendance_rate: number | null;
        };
      };
      payment_stats: {
        Row: {
          member_id: string;
          name: string;
          surname: string;
          total_periods: number;
          paid_count: number;
          pending_count: number;
          total_amount: number | null;
          paid_amount: number | null;
        };
      };
    };
    Functions: {
      get_absentees: {
        Args: {
          start_date: string;
          end_date: string;
          min_absences: number;
        };
        Returns: Array<{
          member_id: string;
          name: string;
          surname: string;
          absences: number;
        }>;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type ViewTables<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row'];

