import { createClient } from '@/lib/supabase/client';
import type { Lesson, LessonFormData, LessonWithAttendance, ApiResponse, FilterParams } from '@/types';

const supabase = createClient();

export const lessonsService = {
  // Get lessons for a date range
  async getByDateRange(startDate: string, endDate: string, groupId?: string): Promise<ApiResponse<Lesson[]>> {
    let query = supabase
      .from('lessons')
      .select(`
        *,
        group:groups(*)
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
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        group:groups(*),
        attendance(
          *,
          member:members(*)
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
    const { data, error } = await supabase
      .from('lessons')
      .insert(lessonData)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as Lesson, error: null, success: true };
  },

  // Update lesson
  async update(id: string, lessonData: Partial<LessonFormData>): Promise<ApiResponse<Lesson>> {
    const { data, error } = await supabase
      .from('lessons')
      .update(lessonData)
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
    return this.update(id, { status: 'completed' } as any);
  },

  // Cancel lesson
  async cancel(id: string): Promise<ApiResponse<Lesson>> {
    return this.update(id, { status: 'cancelled' } as any);
  },
};

