import { createClient } from '@/lib/supabase/client';
import type { Lesson, LessonFormData, LessonWithAttendance, ApiResponse, FilterParams } from '@/types';
import type { Database } from '@/lib/supabase';

type LessonInsert = Database['public']['Tables']['lessons']['Insert'];
type LessonUpdate = Database['public']['Tables']['lessons']['Update'];

// Lazy initialization - client is created when first needed
function getSupabaseClient() {
  return createClient();
}

export const lessonsService = {
  // Get lessons for a date range
  async getByDateRange(startDate: string, endDate: string, groupId?: string): Promise<ApiResponse<Lesson[]>> {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('lessons')
      .select(`
        *,
        group:groups(id, name, description, coach_id, created_at, updated_at)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as Lesson[], error: null, success: true };
  },

  // Get single lesson with attendance
  async getById(id: string): Promise<ApiResponse<LessonWithAttendance>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        group:groups(id, name, description, coach_id, created_at, updated_at),
        attendance(
          *,
          member:members(id, name, surname, email, phone, is_child, status)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as LessonWithAttendance, error: null, success: true };
  },

  // Create new lesson
  async create(lessonData: LessonFormData): Promise<ApiResponse<Lesson>> {
    const supabase = getSupabaseClient();
    const insertData: LessonInsert = {
      group_id: lessonData.group_id,
      date: lessonData.date,
      start_time: lessonData.start_time,
      end_time: lessonData.end_time,
      notes: lessonData.notes || null,
      status: lessonData.status || 'scheduled',
    };
    // Type assertion needed because Supabase type inference fails for insert() with complex schemas
    type LessonQueryBuilder = {
      insert: (values: LessonInsert) => {
        select: () => {
          single: () => Promise<{ data: Database['public']['Tables']['lessons']['Row'] | null; error: { message: string } | null }>;
        };
      };
    };
    const { data, error } = await (supabase.from('lessons') as unknown as LessonQueryBuilder)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as Lesson, error: null, success: true };
  },

  // Update lesson
  async update(id: string, lessonData: Partial<LessonFormData>): Promise<ApiResponse<Lesson>> {
    const supabase = getSupabaseClient();
    const updateData: LessonUpdate = {
      group_id: lessonData.group_id,
      date: lessonData.date,
      start_time: lessonData.start_time,
      end_time: lessonData.end_time,
      notes: lessonData.notes !== undefined ? (lessonData.notes || null) : undefined,
      status: lessonData.status,
    };
    // Type assertion needed because Supabase type inference fails for update() with complex schemas
    type LessonQueryBuilder = {
      update: (values: LessonUpdate) => {
        eq: (column: string, value: string) => {
          select: () => {
            single: () => Promise<{ data: Database['public']['Tables']['lessons']['Row'] | null; error: { message: string } | null }>;
          };
        };
      };
    };
    const { data, error } = await (supabase.from('lessons') as unknown as LessonQueryBuilder)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as Lesson, error: null, success: true };
  },

  // Delete lesson
  async delete(id: string): Promise<ApiResponse<null>> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: null, error: null, success: true };
  },

  // Complete lesson
  async complete(id: string): Promise<ApiResponse<Lesson>> {
    return this.update(id, { status: 'completed' });
  },

  // Cancel lesson
  async cancel(id: string): Promise<ApiResponse<Lesson>> {
    return this.update(id, { status: 'cancelled' });
  },
};

