import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase';

type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

// PUT /api/payments/[id] - Update payment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const updateData: PaymentUpdate = {};
    
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.paid !== undefined) {
      updateData.paid = body.paid;
      updateData.paid_at = body.paid ? new Date().toISOString() : null;
    }

    // Type assertion needed because Supabase type inference fails for update() with complex schemas
    type PaymentQueryBuilder = {
      update: (values: PaymentUpdate) => {
        eq: (column: string, value: string) => {
          select: (columns: string) => {
            single: () => Promise<{ data: Database['public']['Tables']['payments']['Row'] | null; error: { message: string; code?: string } | null }>;
          };
        };
      };
    };
    const { data, error } = await (supabase.from('payments') as unknown as PaymentQueryBuilder)
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        member:members(id, name, surname)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Ödeme bulunamadı' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/payments/[id] - Delete payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

