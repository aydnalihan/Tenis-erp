import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/payments - Get payments
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const period = searchParams.get('period');
    const paid = searchParams.get('paid');
    const memberId = searchParams.get('member_id');

    let query = supabase
      .from('payments')
      .select(`
        *,
        member:members(id, name, surname, group_id)
      `)
      .order('period', { ascending: false })
      .order('paid', { ascending: true });

    if (period) {
      query = query.eq('period', period);
    }
    if (paid !== null && paid !== undefined) {
      query = query.eq('paid', paid === 'true');
    }
    if (memberId) {
      query = query.eq('member_id', memberId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/payments - Create payment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('payments')
      .insert({
        member_id: body.member_id,
        period: body.period,
        amount: body.amount,
        paid: body.paid || false,
        paid_at: body.paid ? new Date().toISOString() : null,
        notes: body.notes || null,
      })
      .select(`
        *,
        member:members(id, name, surname)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

