import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase';

type MemberInsert = Database['public']['Tables']['members']['Insert'];

// GET /api/members - List all members
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search') || '';
    const groupId = searchParams.get('group_id');
    const isChild = searchParams.get('is_child');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    let query = supabase
      .from('members')
      .select(`
        *,
        group:groups(id, name)
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,surname.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    if (groupId && groupId !== 'all') {
      query = query.eq('group_id', groupId);
    }
    if (isChild && isChild !== 'all') {
      query = query.eq('is_child', isChild === 'true');
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/members - Create new member
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const memberData: MemberInsert = {
      name: body.name,
      surname: body.surname,
      email: body.email || null,
      phone: body.phone || null,
      birthdate: body.birthdate || null,
      is_child: body.is_child || false,
      parent_name: body.parent_name || null,
      parent_phone: body.parent_phone || null,
      group_id: body.group_id || null,
      status: 'active',
    };

    // Type assertion needed because Supabase type inference fails for insert() with complex schemas
    type MemberQueryBuilder = {
      insert: (values: MemberInsert) => {
        select: (columns: string) => {
          single: () => Promise<{ data: Database['public']['Tables']['members']['Row'] | null; error: { message: string } | null }>;
        };
      };
    };
    const { data, error } = await (supabase.from('members') as unknown as MemberQueryBuilder)
      .insert(memberData)
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
    console.error('Error creating member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

