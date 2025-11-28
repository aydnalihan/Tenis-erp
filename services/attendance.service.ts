import { createClient } from '@/lib/supabase/client';
import type { Attendance, ApiResponse } from '@/types';
import type { Database } from '@/lib/supabase';

type LessonUpdate = Database['public']['Tables']['lessons']['Update'];

type AttendanceInsert = Database['public']['Tables']['attendance']['Insert'];

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
    const records: AttendanceInsert[] = attendanceData.map(item => ({
      lesson_id: lessonId,
      member_id: item.member_id,
      status: item.status,
    }));

    // Type assertion needed because Supabase type inference fails for upsert() with complex schemas
    type AttendanceQueryBuilder = {
      upsert: (
        values: AttendanceInsert[],
        options?: { onConflict?: string; ignoreDuplicates?: boolean }
      ) => {
        select: () => Promise<{ data: AttendanceInsert[] | null; error: { message: string } | null }>;
      };
    };
    const { data, error } = await (supabase.from('attendance') as unknown as AttendanceQueryBuilder)
      .upsert(records, {
        onConflict: 'lesson_id,member_id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    // Update lesson status to 'completed'
    const lessonUpdate: LessonUpdate = {
      status: 'completed',
    };
    type LessonQueryBuilder = {
      update: (values: LessonUpdate) => {
        eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
      };
    };
    await (supabase.from('lessons') as unknown as LessonQueryBuilder)
      .update(lessonUpdate)
      .eq('id', lessonId);

    return { data: data as Attendance[], error: null, success: true };
  },

  // Update single attendance record
  async updateStatus(
    lessonId: string, 
    memberId: string, 
    status: 'present' | 'absent'
  ): Promise<ApiResponse<Attendance>> {
    const supabase = getSupabaseClient();
    const attendanceData: AttendanceInsert = {
      lesson_id: lessonId,
      member_id: memberId,
      status,
    };
    // Type assertion needed because Supabase type inference fails for upsert() with complex schemas
    type AttendanceQueryBuilder = {
      upsert: (
        values: AttendanceInsert,
        options?: { onConflict?: string }
      ) => {
        select: () => {
          single: () => Promise<{ data: AttendanceInsert | null; error: { message: string } | null }>;
        };
      };
    };
    const { data, error } = await (supabase.from('attendance') as unknown as AttendanceQueryBuilder)
      .upsert(attendanceData, {
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

    type AttendanceWithLesson = {
      status: 'present' | 'absent';
      lesson: { date: string } | null;
    };
    const typedData = data as AttendanceWithLesson[];
    const stats = {
      total: typedData.length,
      present: typedData.filter(a => a.status === 'present').length,
      absent: typedData.filter(a => a.status === 'absent').length,
      rate: typedData.length > 0 
        ? Math.round((typedData.filter(a => a.status === 'present').length / typedData.length) * 100)
        : 0,
    };

    return { data: stats, error: null, success: true };
  },

  // Get absentee list for a period
  async getAbsentees(startDate: string, endDate: string, minAbsences: number = 2): Promise<ApiResponse<Database['public']['Functions']['get_absentees']['Returns']>> {
    const supabase = getSupabaseClient();
    // Type assertion needed because Supabase type inference fails for rpc() with complex schemas
    type SupabaseRPC = {
      rpc: (functionName: string, params: { start_date: string; end_date: string; min_absences: number }) => Promise<{ data: Database['public']['Functions']['get_absentees']['Returns'] | null; error: { message: string } | null }>;
    };
    const { data, error } = await (supabase as unknown as SupabaseRPC)
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

