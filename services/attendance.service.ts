import { createClient } from '@/lib/supabase/client';
import type { Attendance, ApiResponse } from '@/types';

// Lazy initialization - client is created when first needed
function getSupabaseClient() {
  return createClient();
}

export const attendanceService = {
  // Get attendance for a lesson
  async getByLesson(lessonId: string): Promise<ApiResponse<any[]>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        member:members(*)
      `)
      .eq('lesson_id', lessonId);

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data, error: null, success: true };
  },

  // Save attendance for a lesson (bulk upsert)
  async saveAttendance(
    lessonId: string, 
    attendanceData: { member_id: string; status: 'present' | 'absent' }[]
  ): Promise<ApiResponse<Attendance[]>> {
    const supabase = getSupabaseClient();
    const records = attendanceData.map(item => ({
      lesson_id: lessonId,
      member_id: item.member_id,
      status: item.status,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('attendance') as any)
      .upsert(records, {
        onConflict: 'lesson_id,member_id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as Attendance[], error: null, success: true };
  },

  // Update single attendance record
  async updateStatus(
    lessonId: string, 
    memberId: string, 
    status: 'present' | 'absent'
  ): Promise<ApiResponse<Attendance>> {
    const supabase = getSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('attendance') as any)
      .upsert({
        lesson_id: lessonId,
        member_id: memberId,
        status,
      }, {
        onConflict: 'lesson_id,member_id',
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as Attendance, error: null, success: true };
  },

  // Get attendance statistics for a member
  async getMemberStats(memberId: string, startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('attendance')
      .select(`
        status,
        lesson:lessons(date)
      `)
      .eq('member_id', memberId);

    if (startDate && endDate) {
      query = query
        .gte('lessons.date', startDate)
        .lte('lessons.date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    const stats = {
      total: data.length,
      present: data.filter((a: any) => a.status === 'present').length,
      absent: data.filter((a: any) => a.status === 'absent').length,
      rate: data.length > 0 
        ? Math.round((data.filter((a: any) => a.status === 'present').length / data.length) * 100)
        : 0,
    };

    return { data: stats, error: null, success: true };
  },

  // Get absentee list for a period
  async getAbsentees(startDate: string, endDate: string, minAbsences: number = 2): Promise<ApiResponse<any[]>> {
    const supabase = getSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .rpc('get_absentees', {
        start_date: startDate,
        end_date: endDate,
        min_absences: minAbsences,
      });

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data, error: null, success: true };
  },
};

