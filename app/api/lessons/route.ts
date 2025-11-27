import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase';

type LessonInsert = Database['public']['Tables']['lessons']['Insert'];

// GET /api/lessons - List lessons
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const groupId = searchParams.get('group_id');

    let query = supabase
      .from('lessons')
      .select(`
        *,
        group:groups(id, name)
      `)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }
    if (groupId && groupId !== 'all') {
      query = query.eq('group_id', groupId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/lessons - Create new lesson
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const lessonData: LessonInsert = {
      group_id: body.group_id,
      date: body.date,
      start_time: body.start_time,
      end_time: body.end_time,
      notes: body.notes || null,
      status: 'scheduled',
    };

    // Type assertion needed because Supabase type inference fails for insert() with complex schemas
    type LessonQueryBuilder = {
      insert: (values: LessonInsert) => {
        select: (columns: string) => {
          single: () => Promise<{ data: Database['public']['Tables']['lessons']['Row'] | null; error: { message: string } | null }>;
        };
      };
    };
    const { data, error } = await (supabase.from('lessons') as unknown as LessonQueryBuilder)
      .insert(lessonData)
      .select(`
        *,
        group:groups(id, name)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

