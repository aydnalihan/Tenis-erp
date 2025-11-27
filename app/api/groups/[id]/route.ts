import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase';

type GroupUpdate = Database['public']['Tables']['groups']['Update'];
type MemberUpdate = Database['public']['Tables']['members']['Update'];

// GET /api/groups/[id] - Get single group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        coach:profiles(id, full_name, email),
        members(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/groups/[id] - Update group
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const updateData: GroupUpdate = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.coach_id !== undefined) updateData.coach_id = body.coach_id || null;

    // Type assertion needed because Supabase type inference fails for update() with complex schemas
    type GroupQueryBuilder = {
      update: (values: GroupUpdate) => {
        eq: (column: string, value: string) => {
          select: () => {
            single: () => Promise<{ data: Database['public']['Tables']['groups']['Row'] | null; error: { message: string; code?: string } | null }>;
          };
        };
      };
    };
    const { data, error } = await (supabase.from('groups') as unknown as GroupQueryBuilder)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[id] - Delete group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // First, remove group_id from all members in this group
    const memberUpdate: MemberUpdate = { group_id: null };
    // Type assertion needed because Supabase type inference fails for update() with complex schemas
    type MemberQueryBuilder = {
      update: (values: MemberUpdate) => {
        eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
      };
    };
    await (supabase.from('members') as unknown as MemberQueryBuilder)
      .update(memberUpdate)
      .eq('group_id', id);

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

