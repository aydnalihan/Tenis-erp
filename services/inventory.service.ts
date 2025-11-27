import { createClient } from '@/lib/supabase/client';
import type { InventoryItem, InventoryFormData, ApiResponse, FilterParams } from '@/types';

// Lazy initialization - client is created when first needed
function getSupabaseClient() {
  return createClient();
}

export const inventoryService = {
  // Get all inventory items
  async getAll(params?: FilterParams): Promise<ApiResponse<InventoryItem[]>> {
    const supabase = getSupabaseClient();
    const { search, sortBy = 'name', sortOrder = 'asc' } = params || {};
    
    let query = supabase
      .from('inventory')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as InventoryItem[], error: null, success: true };
  },

  // Get single item
  async getById(id: string): Promise<ApiResponse<InventoryItem>> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as InventoryItem, error: null, success: true };
  },

  // Create new item
  async create(itemData: InventoryFormData): Promise<ApiResponse<InventoryItem>> {
    const supabase = getSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('inventory') as any)
      .insert(itemData)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as InventoryItem, error: null, success: true };
  },

  // Update item
  async update(id: string, itemData: Partial<InventoryFormData>): Promise<ApiResponse<InventoryItem>> {
    const supabase = getSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('inventory') as any)
      .update(itemData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as InventoryItem, error: null, success: true };
  },

  // Delete item
  async delete(id: string): Promise<ApiResponse<null>> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: null, error: null, success: true };
  },

  // Add stock
  async addStock(id: string, amount: number): Promise<ApiResponse<InventoryItem>> {
    const supabase = getSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: current, error: fetchError } = await (supabase.from('inventory') as any)
      .select('quantity')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return { data: null, error: fetchError?.message || 'Item not found', success: false };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('inventory') as any)
      .update({ quantity: (current as { quantity: number }).quantity + amount })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as InventoryItem, error: null, success: true };
  },

  // Remove stock
  async removeStock(id: string, amount: number): Promise<ApiResponse<InventoryItem>> {
    const supabase = getSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: current, error: fetchError } = await (supabase.from('inventory') as any)
      .select('quantity')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return { data: null, error: fetchError?.message || 'Item not found', success: false };
    }

    const newQuantity = Math.max(0, (current as { quantity: number }).quantity - amount);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('inventory') as any)
      .update({ quantity: newQuantity })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as InventoryItem, error: null, success: true };
  },

  // Get low stock items
  async getLowStock(): Promise<ApiResponse<InventoryItem[]>> {
    const supabase = getSupabaseClient();
    
    // Get all items and filter for low stock
    const { data: allItems, error: allError } = await supabase
      .from('inventory')
      .select('*');

    if (allError) {
      return { data: null, error: allError.message, success: false };
    }

    const lowStockItems = allItems.filter((item: any) => item.quantity < (item.min_stock || 0));

    return { data: lowStockItems as InventoryItem[], error: null, success: true };
  },
};

