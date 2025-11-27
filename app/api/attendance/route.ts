import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase';

// Attendance tablosunun Insert tipini çekiyoruz
type AttendanceInsert = Database['public']['Tables']['attendance']['Insert'];

// GET /api/attendance
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const lessonId = searchParams.get('lesson_id');
    const memberId = searchParams.get('member_id');

    let query = supabase
      .from('attendance')
      .select(`
        *,
        member:members(id, name, surname),
        lesson:lessons(id, date, start_time, end_time, group_id)
      `);

    if (lessonId) query = query.eq('lesson_id', lessonId);
    if (memberId) query = query.eq('member_id', memberId);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/attendance
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { lesson_id, attendance } = body;

    if (!lesson_id || !attendance || !Array.isArray(attendance)) {
      return NextResponse.json(
        { error: 'lesson_id ve attendance array gereklidir' },
        { status: 400 }
      );
    }

    const lessonIdStr = String(lesson_id);

    // Insert tipi burada doğru şekilde oluşacak
    const records: AttendanceInsert[] = attendance.map(
      (item: { member_id: string; status: 'present' | 'absent' }) => ({
        lesson_id: lessonIdStr,
        member_id: item.member_id,
        status: item.status,
      })
    );

    // Upsert attendance records
    const { data, error } = await supabase
      .from('attendance')
      .upsert(records, {
        onConflict: 'lesson_id,member_id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Ders durumunu tamamlandı yap
    await supabase
      .from('lessons')
      .update({ status: 'completed' })
      .eq('id', lessonIdStr);

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
