import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase';

type InventoryUpdate = Database['public']['Tables']['inventory']['Update'];

// PUT /api/inventory/[id] - Update inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const updateData: InventoryUpdate = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) updateData.category = body.category || null;
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.min_stock !== undefined) updateData.min_stock = body.min_stock;
    if (body.description !== undefined) updateData.description = body.description || null;

    // Type assertion needed because Supabase type inference fails for update() with complex schemas
    type InventoryQueryBuilder = {
      update: (values: InventoryUpdate) => {
        eq: (column: string, value: string) => {
          select: () => {
            single: () => Promise<{ data: Database['public']['Tables']['inventory']['Row'] | null; error: { message: string; code?: string } | null }>;
          };
        };
      };
    };
    const { data, error } = await (supabase.from('inventory') as unknown as InventoryQueryBuilder)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/[id] - Delete inventory item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/inventory/[id]/stock - Update stock quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { action, amount } = body;

    // Get current quantity
    // Type assertion needed because Supabase type inference fails for select() with complex schemas
    type InventorySelectBuilder = {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          single: () => Promise<{ data: { quantity: number } | null; error: { message: string } | null }>;
        };
      };
    };
    const { data: current, error: fetchError } = await (supabase.from('inventory') as unknown as InventorySelectBuilder)
      .select('quantity')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: fetchError?.message || 'Item not found' }, { status: 500 });
    }

    let newQuantity = current.quantity;
    if (action === 'add') {
      newQuantity += amount;
    } else if (action === 'remove') {
      newQuantity = Math.max(0, newQuantity - amount);
    }

    const stockUpdate: InventoryUpdate = { quantity: newQuantity };
    // Type assertion needed because Supabase type inference fails for update() with complex schemas
    type InventoryQueryBuilder = {
      update: (values: InventoryUpdate) => {
        eq: (column: string, value: string) => {
          select: () => {
            single: () => Promise<{ data: Database['public']['Tables']['inventory']['Row'] | null; error: { message: string } | null }>;
          };
        };
      };
    };
    const { data, error } = await (supabase.from('inventory') as unknown as InventoryQueryBuilder)
      .update(stockUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

