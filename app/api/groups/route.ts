import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase';

type GroupInsert = Database['public']['Tables']['groups']['Insert'];

// GET /api/groups - List all groups
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search') || '';

    let query = supabase
      .from('groups')
      .select(`
        *,
        coach:profiles(id, full_name, email),
        members(count)
      `, { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order('name', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      total: count || 0,
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create new group
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const groupData: GroupInsert = {
      name: body.name,
      description: body.description || null,
      coach_id: body.coach_id || null,
    };

    // Type assertion needed because Supabase type inference fails for insert() with complex schemas
    type GroupQueryBuilder = {
      insert: (values: GroupInsert) => {
        select: () => {
          single: () => Promise<{ data: Database['public']['Tables']['groups']['Row'] | null; error: { message: string } | null }>;
        };
      };
    };
    const { data, error } = await (supabase.from('groups') as unknown as GroupQueryBuilder)
      .insert(groupData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

